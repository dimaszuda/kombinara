/**
 * Kaidah Penjumlahan -- Status API (REFACTORED)
 *
 * GET /api/kaidah-penjumlahan/status
 *   Returns section-by-section status from student_section_status ONLY.
 *   No longer queries answer tables -- those are moved to the on-demand
 *   "Lihat jawabanku" endpoint.
 *
 * Response:
 * {
 *   sections: Record<string, "locked" | "unlocked" | "completed">
 * }
 *
 * Section keys returned:
 *   apersepsi, pemantik, refleksi_sebelum_mulai, eksplorasi_kontekstual,
 *   aktivitas_deep_learning, penjelasan_konsep, contoh_soal, refleksi_mini
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const CONCEPT_ID = "kaidah_penjumlahan";

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

    // Query student_section_status for ALL sections of this concept
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: CONCEPT_ID,
      },
      select: {
        section: true,
        status: true,
      },
    });

    // Build map: section -> status
    const sections: Record<string, string> = {};
    for (const row of rows) {
      sections[row.section] = row.status;
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("[GET /api/kaidah-penjumlahan/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
