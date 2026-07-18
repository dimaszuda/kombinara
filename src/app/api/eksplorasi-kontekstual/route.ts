/**
 * Eksplorasi Kontekstual — Save to DB (per-question row)
 *
 * POST /api/eksplorasi-kontekstual
 * Body: { concept_id, question_key, answer, feedback?, is_correct? }
 * Response: { success: true }
 *
 * Each question/sub-step is saved as its own row, identified by question_key.
 *
 * Trigger 1: When the LAST question in eksplorasi_kontekstual is answered
 * correctly, marks the section as completed and unlocks the next section
 * (aktivitas_deep_learning) within a single transaction.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import { completeSectionAndUnlockNext, isLastQuestionInSection } from "@/lib/data/student-section-status";

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
      typeof body.concept_id !== "string" ||
      typeof body.question_key !== "string" ||
      typeof body.answer !== "object"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { concept_id, question_key, answer, feedback, is_correct } = body;

    // Wrap insert + conditional section completion in a single transaction.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO eksplorasi_kontekstual (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
        VALUES (
          ${student.id},
          ${concept_id}::concept_type,
          ${question_key},
          ${JSON.stringify(answer)}::jsonb,
          ${feedback ?? null},
          ${is_correct ?? null},
          ${toGMT7SQL()}::timestamptz
        )
      `;

      // Trigger section completion only for the last question, only when correct.
      if (
        is_correct === true &&
        isLastQuestionInSection(concept_id, "eksplorasi_kontekstual", question_key)
      ) {
        await completeSectionAndUnlockNext(
          student.id,
          concept_id,
          "eksplorasi_kontekstual",
          tx
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/eksplorasi-kontekstual] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
