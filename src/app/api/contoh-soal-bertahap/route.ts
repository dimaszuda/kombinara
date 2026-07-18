/**
 * Contoh Soal Bertahap — Save attempt to DB
 *
 * POST /api/contoh-soal-bertahap
 * Body: {
 *   concept_id: string,
 *   question_key: string,
 *   difficulty_level: 'mudah' | 'sedang' | 'hots',
 *   order_index: number,
 *   answer: object,
 *   is_correct: boolean,
 * }
 * Response: { success: true, attempt_number: number }
 *
 * Trigger 1: When the LAST question in contoh_soal is answered correctly,
 * marks the section as completed and unlocks the next section within a
 * single transaction.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import { completeSectionAndUnlockNext, isLastQuestionInSection } from "@/lib/data/student-section-status";

const VALID_CONCEPTS = ["kaidah_penjumlahan", "kaidah_perkalian", "permutasi", "kombinasi"] as const;
const VALID_DIFFICULTIES = ["mudah", "sedang", "hots"] as const;

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
      typeof body.difficulty_level !== "string" ||
      typeof body.order_index !== "number" ||
      typeof body.answer !== "object" ||
      body.answer === null ||
      typeof body.is_correct !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!VALID_CONCEPTS.includes(body.concept_id as (typeof VALID_CONCEPTS)[number])) {
      return NextResponse.json({ error: "Invalid concept_id" }, { status: 400 });
    }

    if (!VALID_DIFFICULTIES.includes(body.difficulty_level as (typeof VALID_DIFFICULTIES)[number])) {
      return NextResponse.json({ error: "Invalid difficulty_level" }, { status: 400 });
    }

    const { concept_id, question_key, difficulty_level, order_index, answer, is_correct } = body;

    // Wrap insert + conditional section completion in a single transaction.
    const attemptNumber = await prisma.$transaction(async (tx) => {
      // Calculate next attempt number for this student + question_key atomically
      const result = await tx.$queryRaw<[{ attempt_number: number }]>`
        INSERT INTO contoh_soal_bertahap_attempts
          (student_id, concept_id, question_key, difficulty_level, order_index, attempt_number, answer, is_correct, submitted_at)
        VALUES (
          ${student.id},
          ${concept_id},
          ${question_key},
          ${difficulty_level},
          ${order_index},
          (
            SELECT COALESCE(MAX(attempt_number), 0) + 1
            FROM contoh_soal_bertahap_attempts
            WHERE student_id = ${student.id}
              AND question_key = ${question_key}
          ),
          ${JSON.stringify(answer)}::jsonb,
          ${is_correct},
          ${toGMT7SQL()}::timestamptz
        )
        RETURNING attempt_number
      `;

      // Trigger section completion only for the last question, only when correct.
      if (
        is_correct === true &&
        isLastQuestionInSection(concept_id, "contoh_soal", question_key)
      ) {
        await completeSectionAndUnlockNext(
          student.id,
          concept_id,
          "contoh_soal",
          tx
        );
      }

      return Number(result[0].attempt_number);
    });

    return NextResponse.json({ success: true, attempt_number: attemptNumber });
  } catch (err) {
    console.error("[POST /api/contoh-soal-bertahap] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
