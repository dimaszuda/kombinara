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
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";

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

    // Insert each question as a separate row (allow multiple attempts)
    await Promise.all(
      rows.map((row) =>
        prisma.$executeRaw`
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/refleksi-mini] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
