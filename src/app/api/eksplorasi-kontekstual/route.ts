/**
 * Eksplorasi Kontekstual — Save to DB
 *
 * POST /api/eksplorasi-kontekstual
 * Body: { concept_id, answer, feedback? }
 * Response: { success: true }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

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

    if (!body || typeof body.concept_id !== "string" || typeof body.answer !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { concept_id, answer, feedback } = body;

    await prisma.$executeRaw`
      INSERT INTO eksplorasi_kontekstual (student_id, concept_id, answer, feedback)
      VALUES (
        ${student.id},
        ${concept_id}::concept_type,
        ${JSON.stringify(answer)}::jsonb,
        ${feedback ?? null}
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
