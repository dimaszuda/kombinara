/**
 * Aktivitas Siswa — Sequential Unlocked Entry API
 *
 * POST /api/aktivitas-siswa
 * Body: {
 *   concept_id: string,
 *   activity_key: string,
 *   entry_type: "soal" | "refleksi",
 *   question_key: string,
 *   soal: string,
 *   jawaban: string,
 *   alasan?: string
 * }
 * Response: {
 *   success: true,
 *   feedback: string,
 *   is_correct: boolean
 * }
 *
 * Flow:
 * 1. Auth via Supabase session
 * 2. Get student_id from students table
 * 3. Call LLM (EskplorasiPrompt) for evaluation
 * 4. Insert result to aktivitas_siswa_entries
 * 5. Return feedback to client
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { EskplorasiPrompt } from "@/lib/ai/client";
import { gmt7Now } from "@/lib/date";

const VALID_ENTRY_TYPES = new Set(["soal", "refleksi"]);
const VALID_CONCEPT_IDS = new Set([
  "kaidah_penjumlahan",
  "kaidah_perkalian",
  "faktorial",
  "permutasi",
  "kombinasi",
]);

// ── GET: Check existing submissions for a student ──────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const concept_id = searchParams.get("concept_id");
    const activity_key = searchParams.get("activity_key");

    if (
      typeof concept_id !== "string" ||
      !VALID_CONCEPT_IDS.has(concept_id) ||
      typeof activity_key !== "string" ||
      !activity_key.trim()
    ) {
      return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
    }

    // Auth
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student_id
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Query existing entries
    const entries = await prisma.aktivitasSiswaEntry.findMany({
      where: {
        studentId: student.id,
        conceptId: concept_id,
        activityKey: activity_key,
      },
      orderBy: { submittedAt: "asc" },
      select: {
        questionKey: true,
        answer: true,
        isCorrect: true,
        feedback: true,
        submittedAt: true,
      },
    });

    // Build a map keyed by questionKey (take the latest per questionKey)
    const submissionsMap: Record<string, {
      answer: string;
      isCorrect: boolean;
      feedback: string | null;
    }> = {};

    for (const e of entries) {
      submissionsMap[e.questionKey] = {
        answer: e.answer,
        isCorrect: e.isCorrect,
        feedback: e.feedback,
      };
    }

    const hasSubmissions = entries.length > 0;

    return NextResponse.json({ hasSubmissions, submissions: submissionsMap });
  } catch (error) {
    console.error("[GET /api/aktivitas-siswa] Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // ── 1. Parse & validate body ───────────────────────────────
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      concept_id,
      activity_key,
      entry_type,
      question_key,
      soal,
      jawaban,
      alasan = "",
    } = body;

    if (
      typeof concept_id !== "string" ||
      !VALID_CONCEPT_IDS.has(concept_id) ||
      typeof activity_key !== "string" ||
      !activity_key.trim() ||
      typeof entry_type !== "string" ||
      !VALID_ENTRY_TYPES.has(entry_type) ||
      typeof question_key !== "string" ||
      !question_key.trim() ||
      typeof soal !== "string" ||
      !soal.trim() ||
      typeof jawaban !== "string" ||
      !jawaban.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields" },
        { status: 400 }
      );
    }

    // ── 2. Auth ────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Get student_id ──────────────────────────────────────
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ── 4. Call LLM for evaluation ─────────────────────────────
    let llmResult: { isCorrect: boolean; feedback: string };

    try {
      llmResult = await EskplorasiPrompt(soal, jawaban, alasan);
    } catch (llmError) {
      console.error("[aktivitas-siswa] LLM error:", llmError);
      llmResult = {
        isCorrect: false,
        feedback: "Maaf, ada kendala saat memeriksa jawabanmu. Coba lagi ya!",
      };
    }

    // ── 5. Save to database ────────────────────────────────────
    await prisma.aktivitasSiswaEntry.create({
      data: {
        studentId: student.id,
        conceptId: concept_id,
        activityKey: activity_key,
        entryType: entry_type,
        questionKey: question_key,
        answer: jawaban,
        isCorrect: llmResult.isCorrect,
        feedback: llmResult.feedback,
        submittedAt: gmt7Now(),
      },
    });

    // ── 6. Return feedback ─────────────────────────────────────
    return NextResponse.json({
      success: true,
      isCorrect: llmResult.isCorrect,
      feedback: llmResult.feedback,
    });
  } catch (error) {
    console.error("[POST /api/aktivitas-siswa] Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban" },
      { status: 500 }
    );
  }
}
