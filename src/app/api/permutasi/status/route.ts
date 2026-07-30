/**
 * Permutasi — Status API
 *
 * GET /api/permutasi/status
 *   Returns section-by-section status from student_section_status
 *   for all permutasi concepts.
 *
 * Response:
 * {
 *   sections: Record<string, "locked" | "unlocked" | "completed">
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { PERMUTASI_CONCEPT_IDS } from "@/lib/data/student-section-status";

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
        conceptId: { in: [...PERMUTASI_CONCEPT_IDS] },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
    });

    // Build a flat map: "conceptId:section" → status
    const sections: Record<string, string> = {};
    for (const row of sectionRows) {
      sections[`${row.conceptId}:${row.section}`] = row.status;
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("[GET /api/permutasi/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
