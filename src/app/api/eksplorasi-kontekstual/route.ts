/**
 * Eksplorasi Kontekstual — Save to DB (per-question row)
 *
 * POST /api/eksplorasi-kontekstual
 * Body: { concept_id, question_key, answer, feedback?, is_correct? }
 * Response: { success: true }
 *
 * Each question/sub-step is saved as its own row, identified by question_key.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";

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

    await prisma.$executeRaw`
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/eksplorasi-kontekstual] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
