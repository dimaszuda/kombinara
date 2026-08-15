/**
 * Asesmen Formatif — Evaluate API
 *
 * POST /api/asesmen-formatif/evaluate
 *   → Triggers AI evaluation for a submission. Evaluates all answers
 *     per-question using the AsesmenFormatif rubrik prompt.
 *   → Body: { submission_id: number, module_slug: string }
 *   → Response: { success: true, total_score: number, per_question: [...], ai_feedback: string }
 *
 * GET /api/asesmen-formatif/evaluate?submission_id=...
 *   → Returns evaluation results for a specific submission.
 *   → Response: { evaluated: boolean, total_score?: number, per_question?: [...], ai_feedback?: string }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { evaluateAnswers } from "@/lib/evaluation/run-submission-evaluation";
import type { SubmittedAnswer } from "@/lib/evaluation/run-submission-evaluation";

async function getStudentId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!student) return { error: NextResponse.json({ error: "Student not found" }, { status: 404 }) };

  return { studentId: student.id };
}

// ─── POST — trigger evaluation ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.submission_id !== "number" || typeof body.module_slug !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Required: submission_id (number), module_slug (string)" },
        { status: 400 }
      );
    }

    const { submission_id, module_slug } = body;

    // Verify submission belongs to this student
    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: submission_id },
      select: { id: true, studentId: true, answers: true, evaluatedAt: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already evaluated, return existing results
    if (submission.evaluatedAt) {
      const existing = await prisma.asesmenFormatifSubmission.findUnique({
        where: { id: submission_id },
        select: { totalScore: true, perQuestionResults: true, aiFeedback: true, evaluatedAt: true },
      });
      return NextResponse.json({
        success: true,
        already_evaluated: true,
        total_score: existing?.totalScore,
        per_question: existing?.perQuestionResults,
        ai_feedback: existing?.aiFeedback,
      });
    }

    // Parse answers & run evaluation (shared logic — also used by re-grade script)
    const answers = submission.answers as unknown as SubmittedAnswer[];

    const { totalScore, perQuestionResults, aiFeedback } = await evaluateAnswers(
      answers,
      module_slug
    );

    // Save to database
    await prisma.asesmenFormatifSubmission.update({
      where: { id: submission_id },
      data: {
        totalScore,
        perQuestionResults: perQuestionResults as unknown as object,
        aiFeedback,
        evaluatedAt: new Date(),
        aiModel: "gpt-4o",
      },
    });

    return NextResponse.json({
      success: true,
      total_score: totalScore,
      per_question: perQuestionResults,
      ai_feedback: aiFeedback,
    });
  } catch (err) {
    console.error("[POST /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengevaluasi jawaban. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// ─── GET — retrieve evaluation results ─────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submission_id");

    if (!submissionId) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: parseInt(submissionId) },
      select: {
        id: true,
        studentId: true,
        totalScore: true,
        perQuestionResults: true,
        aiFeedback: true,
        evaluatedAt: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      evaluated: submission.evaluatedAt !== null,
      total_score: submission.totalScore,
      per_question: submission.perQuestionResults,
      ai_feedback: submission.aiFeedback,
      evaluated_at: submission.evaluatedAt,
    });
  } catch (err) {
    console.error("[GET /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil hasil evaluasi." },
      { status: 500 }
    );
  }
}
