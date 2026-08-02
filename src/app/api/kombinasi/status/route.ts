/**
 * Kombinasi — Status API
 *
 * GET /api/kombinasi/status
 *   Returns section-by-section status from student_section_status.
 *
 * Response:
 * {
 *   sections: Record<string, "locked" | "unlocked" | "completed">
 * }
 *
 * Section keys returned:
 *   eksplorasi_kontekstual, aktivitas_deep_learning, penjelasan_konsep,
 *   contoh_soal, mengapa_corner, refleksi_mini
 *
 * NOTE: permutasi_vs_kombinasi (Panduan Definitif) is NOT tracked in
 * student_section_status — it's a read-only section.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const CONCEPT_ID = "kombinasi";

export async function GET() {
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

    const sectionRows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: CONCEPT_ID,
      },
      select: {
        section: true,
        status: true,
      },
    });

    const sections: Record<string, string> = {};
    for (const row of sectionRows) {
      sections[row.section] = row.status;
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("[GET /api/kombinasi/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
