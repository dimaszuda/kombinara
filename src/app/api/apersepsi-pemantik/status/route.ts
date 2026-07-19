/**
 * Apersepsi & Pemantik — Status API (REFACTORED)
 *
 * GET /api/apersepsi-pemantik/status
 *   Returns section-by-section status from student_section_status ONLY.
 *   No longer queries apersepsi_pemantik_responses — jawaban & feedback
 *   are moved to the on-demand "Lihat jawabanku" endpoint.
 *
 * Response:
 * {
 *   sections: Record<string, "locked" | "unlocked" | "completed">
 * }
 *
 * Section keys:
 *   apersepsi              → steps 0-2 (kendaraan, outfit, pengurus)
 *   pemantik                → steps 3-5 (password_kapasitas, tim_sama_beda, rute_kurir)
 *   refleksi_sebelum_mulai  → steps 6-7 (refleksi_sebelum_mulai_1, refleksi_sebelum_mulai_2)
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const CONCEPT_ID = "kaidah_penjumlahan";

const SECTION_KEYS = ["apersepsi", "pemantik", "refleksi_sebelum_mulai"] as const;

// ─── GET ────────────────────────────────────────────────────────────

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

    // Query student_section_status ONLY — no answer tables
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: CONCEPT_ID,
        section: { in: [...SECTION_KEYS] },
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
    console.error("[GET /api/apersepsi-pemantik/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
