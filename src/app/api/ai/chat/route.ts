/**
 * Chatbot Panel — AI Q&A API
 *
 * POST /api/ai/chat
 * Body: {
 *   question: string,
 *   conversation_id: string (UUID),
 *   selectedText?: string,
 *   contextBefore?: string,
 *   contextAfter?: string,
 *   history?: Array<{ role: "user" | "assistant", content: string }>
 * }
 * Response: { answer: string, cached?: boolean }
 *
 * Features:
 * - Sliding window memory (5 pasang percakapan terakhir)
 * - Semantic cache via Upstash Vector + Redis
 * - Persist semua percakapan ke ai_messages (user + assistant)
 */

import { NextResponse } from "next/server";
import { ChatPrompt } from "@/lib/ai/client";
import {
  semanticCache,
  buildContextFingerprint,
} from "@/lib/ai/semantic-cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.question !== "string" || !body.question.trim()) {
      return NextResponse.json(
        { error: "Invalid request: question is required" },
        { status: 400 }
      );
    }

    const {
      question,
      conversation_id,
      selectedText,
      contextBefore,
      contextAfter,
      history,
    } = body;

    // conversation_id wajib untuk persist ke DB
    if (typeof conversation_id !== "string" || !conversation_id.trim()) {
      return NextResponse.json(
        { error: "Invalid request: conversation_id (UUID) is required" },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const convId = conversation_id.trim();

    // ── 1. Autentikasi ──────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Ambil student_id ────────────────────────────────────
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentId = student.id;

    // ── 3. Simpan pesan USER ke DB (fire-and-forget) ───────────
    persistMessage(studentId, convId, "user", trimmedQuestion);

    // ── 4. Validate history & build sliding window ──────────────
    let parsedHistory: ChatHistoryItem[] | undefined;
    if (Array.isArray(history)) {
      parsedHistory = history
        .filter(
          (item: unknown) =>
            item &&
            typeof item === "object" &&
            (item as ChatHistoryItem).role &&
            (item as ChatHistoryItem).content
        )
        .slice(-10) as ChatHistoryItem[];
    }

    // ── 5. Semantic Cache Check ─────────────────────────────────
    const lab = buildContextFingerprint(parsedHistory);

    const cacheQuestion =
      typeof selectedText === "string" && selectedText.trim()
        ? `[ctx: ${selectedText.slice(0, 100)}] ${trimmedQuestion}`
        : trimmedQuestion;

    const cached = await semanticCache.get(cacheQuestion, lab);
    if (cached) {
      // Simpan jawaban ASSISTANT dari cache ke DB (fire-and-forget)
      persistMessage(studentId, convId, "assistant", cached.answer);

      return NextResponse.json({ answer: cached.answer, cached: true });
    }

    // ── 6. Cache MISS — panggil AI ─────────────────────────────
    const answer = await ChatPrompt(
      trimmedQuestion,
      typeof selectedText === "string" ? selectedText : undefined,
      typeof contextBefore === "string" ? contextBefore : undefined,
      typeof contextAfter === "string" ? contextAfter : undefined,
      parsedHistory
    );

    // ── 7. Simpan ke cache + DB (fire-and-forget) ──────────────
    semanticCache.set(cacheQuestion, lab, answer).catch((err) => {
      console.warn("[chat] Gagal menyimpan ke semantic cache:", err);
    });

    persistMessage(studentId, convId, "assistant", answer);

    return NextResponse.json({ answer, cached: false });
  } catch (error) {
    console.error("[chat] AI error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Simpan satu pesan ke tabel ai_messages.
 * Fire-and-forget — tidak memblokir response ke user.
 */
function persistMessage(
  studentId: number,
  conversationId: string,
  role: "user" | "assistant",
  content: string
): void {
  prisma.aiMessage
    .create({
      data: {
        studentId,
        conversationId,
        role,
        content,
      },
    })
    .catch((err) => {
      console.warn("[chat] Gagal menyimpan pesan ke ai_messages:", err);
    });
}
