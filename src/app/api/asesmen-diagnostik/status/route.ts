/**
 * Asesmen Diagnostik — Status API
 *
 * GET /api/asesmen-diagnostik/status
 *   → Mengembalikan status diagnostik siswa saat ini:
 *     - Apakah sudah pernah lulus?
 *     - Hasil terakhir (skor, detail per nomor)
 *     - Status cooldown untuk retry (10 menit setelah gagal)
 *
 * Response:
 * {
 *   status: "none" | "in_progress" | "passed" | "failed",
 *   lastScore: number | null,
 *   lastCorrectCount: number | null,
 *   lastTotalQuestions: number | null,
 *   lastQuestions: QuestionResult[] | null,
 *   lastSubmittedAt: string | null,
 *   cooldownEndsAt: string | null,
 *   cooldownRemainingSeconds: number | null
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const COOLDOWN_MINUTES = 10;

// ─── Types ──────────────────────────────────────────────────────────────────

interface DiagnosticAttempt {
  attempt_id: number;
  student_id: number;
  attempt_number: number;
  status: string;
  total_score: number | null;
  correct_count: number | null;
  passed: boolean | null;
  submitted_at: string | null;
  draft_answers: Record<string, string> | null;
}

interface DiagnosticAnswer {
  attempt_id: number;
  question_id: number;
  graded_result: {
    correct: boolean;
    details: { subIndex: number; correct: boolean }[];
  } | null;
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Auth
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

  // ── Cek apakah pernah lulus ──────────────────────────────────────────
  const { data: passedAttempt } = await supabase
    .from("diagnostic_attempts")
    .select("attempt_id, total_score, correct_count, submitted_at")
    .eq("student_id", student.id)
    .eq("status", "passed")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (passedAttempt) {
    const pa = passedAttempt as {
      attempt_id: number;
      total_score: number;
      correct_count: number;
      submitted_at: string;
    };

    // Ambil detail per-nomor dari diagnostic_answers
    const questions = await getQuestionDetails(supabase, pa.attempt_id);

    return NextResponse.json({
      status: "passed",
      lastScore: pa.total_score,
      lastCorrectCount: pa.correct_count,
      lastTotalQuestions: 10,
      lastQuestions: questions,
      lastSubmittedAt: pa.submitted_at,
      cooldownEndsAt: null,
      cooldownRemainingSeconds: null,
    });
  }

  // ── Cek attempt terakhir (failed / in_progress) ──────────────────────
  const { data: lastAttempt } = await supabase
    .from("diagnostic_attempts")
    .select("*")
    .eq("student_id", student.id)
    .order("attempt_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastAttempt) {
    return NextResponse.json({
      status: "none",
      lastScore: null,
      lastCorrectCount: null,
      lastTotalQuestions: null,
      lastQuestions: null,
      lastSubmittedAt: null,
      cooldownEndsAt: null,
      cooldownRemainingSeconds: null,
    });
  }

  const attempt = lastAttempt as DiagnosticAttempt;

  // ── In progress ──────────────────────────────────────────────────────
  if (attempt.status === "in_progress") {
    return NextResponse.json({
      status: "in_progress",
      lastScore: null,
      lastCorrectCount: null,
      lastTotalQuestions: null,
      lastQuestions: null,
      lastSubmittedAt: null,
      cooldownEndsAt: null,
      cooldownRemainingSeconds: null,
    });
  }

  // ── Failed — hitung cooldown ─────────────────────────────────────────
  if (attempt.status === "failed") {
    const lastFailedAt = attempt.submitted_at;
    const cooldownEndsAt = lastFailedAt
      ? new Date(
          new Date(lastFailedAt).getTime() + COOLDOWN_MINUTES * 60 * 1000
        ).toISOString()
      : null;

    const now = new Date();
    const cooldownEnd = cooldownEndsAt ? new Date(cooldownEndsAt) : null;
    const remainingSeconds =
      cooldownEnd && cooldownEnd > now
        ? Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000)
        : null;

    // Ambil detail per-nomor
    const questions = await getQuestionDetails(supabase, attempt.attempt_id);

    return NextResponse.json({
      status: "failed",
      lastScore: attempt.total_score,
      lastCorrectCount: attempt.correct_count,
      lastTotalQuestions: 10,
      lastQuestions: questions,
      lastSubmittedAt: lastFailedAt,
      cooldownEndsAt,
      cooldownRemainingSeconds: remainingSeconds,
    });
  }

  // Fallback
  return NextResponse.json({
    status: "none",
    lastScore: null,
    lastCorrectCount: null,
    lastTotalQuestions: null,
    lastQuestions: null,
    lastSubmittedAt: null,
    cooldownEndsAt: null,
    cooldownRemainingSeconds: null,
  });
}

// ─── Helper: ambil detail per-nomor dari diagnostic_answers ─────────────────

async function getQuestionDetails(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  attemptId: number
): Promise<{ number: number; correct: boolean }[] | null> {
  try {
    const { data: answers } = await supabase
      .from("diagnostic_answers")
      .select("question_id, graded_result")
      .eq("attempt_id", attemptId);

    if (!answers || answers.length === 0) return null;

    // Ambil question_number dari diagnostic_questions
    const questionIds = (answers as DiagnosticAnswer[]).map((a) => a.question_id);
    const { data: questions } = await supabase
      .from("diagnostic_questions")
      .select("question_id, question_number")
      .in("question_id", questionIds);

    if (!questions) return null;

    const questionMap = new Map<number, number>(
      (questions as { question_id: number; question_number: number }[]).map(
        (q) => [q.question_id, q.question_number]
      )
    );

    return (answers as DiagnosticAnswer[])
      .map((a) => {
        const number = questionMap.get(a.question_id);
        if (number === undefined) return null;
        return {
          number,
          correct: a.graded_result?.correct ?? false,
        };
      })
      .filter((q): q is { number: number; correct: boolean } => q !== null)
      .sort((a, b) => a.number - b.number);
  } catch {
    return null;
  }
}
