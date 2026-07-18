/**
 * Deep Learning Activity -- Save to DB
 *
 * POST /api/aktivitas-deep-learning
 * Body: { concept_id: string, answer: object, feedback?: string, is_correct?: boolean }
 * Response: { success: true }
 *
 * Trigger 1: When is_correct=true, marks aktivitas_deep_learning as completed
 * and unlocks the next section (penjelasan_konsep) within a single transaction.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import { completeSectionAndUnlockNext } from "@/lib/data/student-section-status";

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
      typeof body.answer !== "object" ||
      body.answer === null
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { concept_id, answer, feedback, is_correct } = body;

    // Wrap insert + section completion in a single transaction.
    // If is_correct is true, aktivitas_deep_learning is always the "last"
    // (and only) entry for this section -- trigger completion.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO aktivitas_deep_learning (student_id, concept_id, answer, feedback, is_correct, created_at)
        VALUES (
          ${student.id},
          ${concept_id},
          ${JSON.stringify(answer)}::jsonb,
          ${feedback ?? null},
          ${is_correct ?? null},
          ${toGMT7SQL()}::timestamptz
        )
      `;

      if (is_correct === true) {
        await completeSectionAndUnlockNext(
          student.id,
          concept_id,
          "aktivitas_deep_learning",
          tx
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/aktivitas-deep-learning] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
