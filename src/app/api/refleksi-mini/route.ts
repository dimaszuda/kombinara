/**
 * Refleksi Mini — AI classification + Save to DB
 *
 * POST /api/refleksi-mini
 * Body: {
 *   concept_id: string,
 *   rows: Array<{ question_key: string; soal: string; answer: string }>
 * }
 *
 * For each row:
 *   1. Classify the answer via AI (AnswerClassificationPrompt)
 *   2. INSERT into refleksi_mini with the AI feedback
 *   3. Return per-question feedback to the client
 *
 * Response: {
 *   feedback: Record<question_key, { isCorrect: boolean; feedback: string }>
 * }
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
import { AnswerClassificationPrompt } from "@/lib/ai/client";
import { APERSEPSI_PEMANTIK_GROUND_TRUTH } from "@/lib/ai/ground-truths";
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
      rows: { question_key: string; soal: string; answer: string }[];
    };

    // Validate each row has required fields
    for (const row of rows) {
      if (
        typeof row.question_key !== "string" ||
        typeof row.soal !== "string" ||
        !row.soal.trim() ||
        typeof row.answer !== "string"
      ) {
        return NextResponse.json({ error: "Invalid row structure — required: question_key, soal, answer" }, { status: 400 });
      }
    }

    // ── AI classification for each row ──────────────────────────
    const classifiedRows: {
      question_key: string;
      answer: string;
      feedback: string;
      isCorrect: boolean;
    }[] = [];

    const feedbackMap: Record<string, { isCorrect: boolean; feedback: string }> = {};

    for (const row of rows) {
      const groundTruth = APERSEPSI_PEMANTIK_GROUND_TRUTH[row.question_key] ?? "";
      try {
        const llmResult = await AnswerClassificationPrompt(row.soal, groundTruth, row.answer);
        classifiedRows.push({
          question_key: row.question_key,
          answer: row.answer,
          feedback: llmResult.feedback,
          isCorrect: llmResult.isCorrect,
        });
        feedbackMap[row.question_key] = {
          isCorrect: llmResult.isCorrect,
          feedback: llmResult.feedback,
        };
      } catch (aiErr) {
        console.error(`[refleksi-mini] AI error for ${row.question_key}:`, aiErr);
        // Fallback: mark as not correct with a generic feedback
        const fallbackFeedback = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
        classifiedRows.push({
          question_key: row.question_key,
          answer: row.answer,
          feedback: fallbackFeedback,
          isCorrect: false,
        });
        feedbackMap[row.question_key] = {
          isCorrect: false,
          feedback: fallbackFeedback,
        };
      }
    }

    // ── DB insert + section completion in a single transaction ───
    await prisma.$transaction(async (tx) => {
      // Insert each question as a separate row (allow multiple attempts)
      await Promise.all(
        classifiedRows.map((row) =>
          tx.$executeRaw`
            INSERT INTO refleksi_mini (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
            VALUES (
              ${student.id},
              ${concept_id},
              ${row.question_key},
              ${row.answer},
              ${row.feedback},
              ${row.isCorrect},
              ${toGMT7SQL()}::timestamptz
            )
          `
        )
      );

      // Check if any submitted row triggers section completion.
      const hasLastQuestionCorrect = classifiedRows.some(
        (row) =>
          row.isCorrect === true &&
          isLastQuestionInSection(concept_id, "refleksi_mini", row.question_key)
      );

      if (hasLastQuestionCorrect) {
        const requiredKeys = getRefleksiAllQuestionKeys(concept_id);

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

    return NextResponse.json({ feedback: feedbackMap });
  } catch (err) {
    console.error("[POST /api/refleksi-mini] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
