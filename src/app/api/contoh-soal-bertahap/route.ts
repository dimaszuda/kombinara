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
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

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

    // Calculate next attempt number for this student + question_key atomically
    const result = await prisma.$queryRaw<[{ attempt_number: number }]>`
      INSERT INTO contoh_soal_bertahap_attempts
        (student_id, concept_id, question_key, difficulty_level, order_index, attempt_number, answer, is_correct)
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
        ${is_correct}
      )
      RETURNING attempt_number
    `;

    return NextResponse.json({ success: true, attempt_number: Number(result[0].attempt_number) });
  } catch (err) {
    console.error("[POST /api/contoh-soal-bertahap] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
