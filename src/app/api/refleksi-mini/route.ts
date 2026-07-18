/**
 * Refleksi Mini — Save to DB
 *
 * POST /api/refleksi-mini
 * Body: {
 *   concept_id: string,
 *   rows: Array<{ question_key: string; answer: string; feedback: string | null; is_correct?: boolean | null }>
 * }
 * Inserts one row per question (1 soal = 1 row).
 * Response: { success: true }
 *
 * Trigger 1: When the LAST refleksi question is answered correctly AND all
 * required refleksi questions for the concept are correct, marks
 * refleksi_mini as completed and unlocks the next section within a
 * single transaction.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import {
  completeSectionAndUnlockNext,
  isLastQuestionInSection,
  getRefleksiAllQuestionKeys,
} from "@/lib/data/student-section-status";

const VALID_CONCEPTS = ["kaidah_penjumlahan", "kaidah_perkalian", "permutasi", "kombinasi"] as const;

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
      !Array.isArray(body.rows) ||
      body.rows.length === 0
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!VALID_CONCEPTS.includes(body.concept_id as (typeof VALID_CONCEPTS)[number])) {
      return NextResponse.json({ error: "Invalid concept_id" }, { status: 400 });
    }

    const { concept_id, rows } = body as {
      concept_id: string;
      rows: { question_key: string; answer: string; feedback: string | null; is_correct?: boolean | null }[];
    };

    for (const row of rows) {
      if (
        typeof row.question_key !== "string" ||
        typeof row.answer !== "string"
      ) {
        return NextResponse.json({ error: "Invalid row structure" }, { status: 400 });
      }
    }

    // Wrap inserts + conditional section completion in a single transaction.
    await prisma.$transaction(async (tx) => {
      // Insert each question as a separate row (allow multiple attempts)
      await Promise.all(
        rows.map((row) =>
          tx.$executeRaw`
            INSERT INTO refleksi_mini (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
            VALUES (
              ${student.id},
              ${concept_id},
              ${row.question_key},
              ${row.answer},
              ${row.feedback ?? null},
              ${row.is_correct ?? null},
              ${toGMT7SQL()}::timestamptz
            )
          `
        )
      );

      // Check if any submitted row triggers section completion.
      // Completion requires: (a) the last question is answered correctly, AND
      // (b) ALL required refleksi questions for this concept have a correct answer.
      const hasLastQuestionCorrect = rows.some(
        (row) =>
          row.is_correct === true &&
          isLastQuestionInSection(concept_id, "refleksi_mini", row.question_key)
      );

      if (hasLastQuestionCorrect) {
        const requiredKeys = getRefleksiAllQuestionKeys(concept_id);

        // Count distinct question_keys with at least one correct answer.
        const correctCountResult = await tx.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT question_key) as count
          FROM refleksi_mini
          WHERE student_id = ${student.id}
            AND concept_id = ${concept_id}
            AND question_key = ANY(${requiredKeys}::text[])
            AND is_correct = true
        `;

        const correctCount = Number(correctCountResult[0].count);

        if (correctCount >= requiredKeys.length) {
          await completeSectionAndUnlockNext(
            student.id,
            concept_id,
            "refleksi_mini",
            tx
          );
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/refleksi-mini] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
