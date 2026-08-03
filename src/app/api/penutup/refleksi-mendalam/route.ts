/**
 * Refleksi Mendalam — Save to DB (No AI)
 *
 * POST /api/penutup/refleksi-mendalam
 * Body: {
 *   question_number: number (1-6),
 *   question_key: string,
 *   jawaban: string
 * }
 *
 * No AI evaluation. Simply saves the answer to the DB.
 * Returns a generic "jawabanmu sudah tersimpan" feedback.
 *
 * Response: { success: true, feedback: "Jawabanmu sudah tersimpan, ya!" }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";

const GENERIC_FEEDBACK = "Jawabanmu sudah tersimpan, ya!";

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
      typeof body.question_number !== "number" ||
      body.question_number < 1 ||
      body.question_number > 6 ||
      typeof body.question_key !== "string" ||
      !body.question_key.trim() ||
      typeof body.jawaban !== "string" ||
      !body.jawaban.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid request body — required: question_number, question_key, jawaban (non-empty)" },
        { status: 400 }
      );
    }

    const { question_number, question_key, jawaban } = body as {
      question_number: number;
      question_key: string;
      jawaban: string;
    };

    // ── UPSERT to DB ──────────────────────────────────────────────
    await prisma.$executeRaw`
      INSERT INTO refleksi_mendalam_submissions (student_id, question_number, question_key, jawaban, submitted_at)
      VALUES (
        ${student.id},
        ${question_number},
        ${question_key},
        ${jawaban},
        ${toGMT7SQL()}::timestamptz
      )
      ON CONFLICT (student_id, question_number)
      DO UPDATE SET
        question_key = EXCLUDED.question_key,
        jawaban = EXCLUDED.jawaban,
        submitted_at = ${toGMT7SQL()}::timestamptz
    `;

    return NextResponse.json({ success: true, feedback: GENERIC_FEEDBACK });
  } catch (err) {
    console.error("[POST /api/penutup/refleksi-mendalam] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
