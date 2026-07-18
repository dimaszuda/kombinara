/**
 * Kaidah Perkalian -- Status API (REFACTORED)
 *
 * GET /api/kaidah-perkalian/status
 *   Returns section-by-section status from student_section_status
 *   PLUS aktivitas_siswa aggregate. No longer queries answer tables.
 *
 * Response:
 * {
 *   sections: Record<string, "locked" | "unlocked" | "completed">,
 *   aktivitasSiswa: {
 *     completedCount: number,
 *     totalCount: number,
 *     allCompleted: boolean
 *   }
 * }
 *
 * Section keys returned:
 *   eksplorasi_kontekstual, aktivitas_deep_learning, penjelasan_konsep,
 *   contoh_soal, refleksi_mini
 *
 * NOTE: aktivitas_siswa is NOT a row in student_section_status --
 *       it is returned as a separate aggregate from aktivitas_siswa_entries.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getAktivitasSiswaStatus } from "@/lib/data/student-section-status";

const CONCEPT_ID = "kaidah_perkalian";

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

    // Run both queries in parallel (via Promise.all)
    const [sectionRows, aktivitasStatus] = await Promise.all([
      // Query 1: student_section_status for this concept
      prisma.studentSectionStatus.findMany({
        where: {
          studentId: student.id,
          conceptId: CONCEPT_ID,
        },
        select: {
          section: true,
          status: true,
        },
      }),

      // Query 2: aktivitas_siswa_entries aggregate
      getAktivitasSiswaStatus(prisma, student.id, CONCEPT_ID),
    ]);

    // Build map: section -> status
    const sections: Record<string, string> = {};
    for (const row of sectionRows) {
      sections[row.section] = row.status;
    }

    return NextResponse.json({
      sections,
      aktivitasSiswa: {
        completedCount: aktivitasStatus.completedCount,
        totalCount: aktivitasStatus.totalCount,
        allCompleted: aktivitasStatus.allCompleted,
      },
    });
  } catch (error) {
    console.error("[GET /api/kaidah-perkalian/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
