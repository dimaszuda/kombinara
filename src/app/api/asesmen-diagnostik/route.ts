/**
 * Asesmen Diagnostik — Grading API
 *
 * POST /api/asesmen-diagnostik
 * Body: { answers: Record<string, string> }
 * Response: GradingResult { isPass, correctCount, score, questions }
 *
 * Flow:
 * 1. Autentikasi user via Supabase session
 * 2. Ambil student_id dari tabel students
 * 3. Grade jawaban
 * 4. Simpan ke diagnostic_attempts + diagnostic_answers
 */
import { NextResponse } from "next/server";
import { gradeAnswers, type StudentAnswers } from "@/lib/data/asesmen-diagnostik";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────
    const body = await req.json().catch(() => null);

    if (!body || !body.answers || typeof body.answers !== "object") {
      return NextResponse.json(
        { error: "Invalid request: answers object required" },
        { status: 400 }
      );
    }

    // ── 2. Autentikasi ─────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Ambil student_id ────────────────────────────────────
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ── 4. Normalisasi jawaban ─────────────────────────────────
    const answers: StudentAnswers = {};
    for (const [key, value] of Object.entries(body.answers)) {
      if (typeof value === "string") {
        answers[key] = value;
      } else if (value !== null && value !== undefined) {
        answers[key] = String(value);
      }
    }

    // ── 5. Grade ───────────────────────────────────────────────
    const result = await gradeAnswers(answers);

    // ── 6. Persist ke database ─────────────────────────────────
    // Jalankan secara fire-and-forget — jangan blokir respons ke siswa
    const attemptId: number | null =
      typeof body.attempt_id === "number" ? body.attempt_id : null;

    persistAttempt(supabase, student.id, attemptId, answers, result).catch((err) => {
      console.error("[asesmen-diagnostik] failed to persist attempt:", err);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[asesmen-diagnostik] grading error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ══════════════════════════════════════════════════════════════
// Persist helper — dipisahkan agar tidak memblokir grading
// ══════════════════════════════════════════════════════════════

import type { GradingResult } from "@/lib/data/asesmen-diagnostik";

async function persistAttempt(
  _supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  studentId: number,
  attemptId: number | null,
  answers: StudentAnswers,
  result: GradingResult
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = _supabase as any;
  let finalAttemptId = attemptId;

  const finalFields = {
    status: result.isPass ? "passed" : "failed",
    total_score: result.score,
    correct_count: result.correctCount,
    passed: result.isPass,
    feedback: "",
    draft_answers: answers,
    submitted_at: new Date().toISOString(),
  };

  if (finalAttemptId) {
    // 6a. Update attempt in_progress yang sudah ada
    const { error } = await supabase
      .from("diagnostic_attempts")
      .update(finalFields)
      .eq("attempt_id", finalAttemptId)
      .eq("student_id", studentId)
      .eq("status", "in_progress");

    if (error) throw new Error(`Update attempt failed: ${error.message}`);
  } else {
    // 6a-fallback. Tidak ada attempt_id — insert baru
    const { data: lastAttempt } = await supabase
      .from("diagnostic_attempts")
      .select("attempt_number")
      .eq("student_id", studentId)
      .order("attempt_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const attemptNumber =
      ((lastAttempt as { attempt_number: number } | null)?.attempt_number ?? 0) + 1;

    const { data: newAttempt, error } = await supabase
      .from("diagnostic_attempts")
      .insert({ student_id: studentId, attempt_number: attemptNumber, ...finalFields })
      .select("attempt_id")
      .single();

    if (error || !newAttempt) {
      throw new Error(`Insert attempt failed: ${error?.message}`);
    }

    finalAttemptId = (newAttempt as { attempt_id: number }).attempt_id;
  }

  // 6c. Ambil question_id dari diagnostic_questions
  const { data: questions, error: qError } = await supabase
    .from("diagnostic_questions")
    .select("question_id, question_number");

  if (qError || !questions) {
    throw new Error(`Failed to fetch diagnostic_questions: ${qError?.message}`);
  }

  const questionIdMap = new Map<number, number>(
    (questions as { question_id: number; question_number: number }[]).map(
      (q) => [q.question_number, q.question_id]
    )
  );

  // 6d. Insert jawaban per soal
  const answersToInsert = result.questions
    .map((q) => {
      const questionId = questionIdMap.get(q.number);
      if (!questionId) return null;

      // Kumpulkan semua sub-jawaban untuk nomor ini
      const rawAnswer: Record<string, string> = {};
      for (let i = 0; i <= 5; i++) {
        const key = `${q.number}-${i}`;
        if (answers[key] !== undefined) rawAnswer[key] = answers[key];
      }

      return {
        attempt_id: finalAttemptId,
        question_id: questionId,
        raw_answer: rawAnswer,
        graded_result: { correct: q.correct, details: q.details },
        score: q.correct ? 10 : 0,
      };
    })
    .filter(Boolean);

  if (answersToInsert.length > 0) {
    const { error: answerError } = await supabase
      .from("diagnostic_answers")
      .insert(answersToInsert);

    if (answerError) {
      throw new Error(`Insert answers failed: ${answerError.message}`);
    }
  }
}
