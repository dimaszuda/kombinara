/**
 * Tantangan — AI Feedback + Save to DB
 *
 * POST /api/penutup/tantangan
 * Body: {
 *   question_number: number (1-10),
 *   question_text: string,
 *   jawaban: string
 * }
 *
 * For each submission:
 *   1. Send the answer to AI for evaluation & feedback
 *   2. UPSERT into tantangan_submissions with the AI feedback
 *   3. Return feedback + isCorrect to the client
 *
 * Response: {
 *   isCorrect: boolean | null,
 *   feedback: string
 * }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import { TantanganPrompt } from "@/lib/ai/client";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.question_number !== "number" ||
      body.question_number < 1 ||
      body.question_number > 10 ||
      typeof body.question_text !== "string" ||
      !body.question_text.trim() ||
      typeof body.jawaban !== "string" ||
      !body.jawaban.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid request body — required: question_number, question_text, jawaban (non-empty)" },
        { status: 400 }
      );
    }

    const { question_number, question_text, jawaban } = body as {
      question_number: number;
      question_text: string;
      jawaban: string;
    };

    // ── AI evaluation ─────────────────────────────────────────────
    let isCorrect: boolean | null = null;
    let feedback: string;

    try {
      const llmResult = await TantanganPrompt(question_text, jawaban);
      isCorrect = llmResult.isCorrect;
      feedback = llmResult.feedback;
    } catch (aiErr) {
      console.error(`[tantangan] AI error for question ${question_number}:`, aiErr);
      feedback = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
    }

    // ── INSERT to DB (always new row, no upsert) ─────────────────
    await prisma.$executeRaw`
      INSERT INTO tantangan_submissions (student_id, question_number, question_text, jawaban, is_correct, feedback, submitted_at)
      VALUES (
        ${student.id},
        ${question_number},
        ${question_text},
        ${jawaban},
        ${isCorrect},
        ${feedback},
        ${toGMT7SQL()}::timestamptz
      )
    `;

    return NextResponse.json({ isCorrect, feedback });
  } catch (err) {
    console.error("[POST /api/penutup/tantangan] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
