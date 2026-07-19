/**
 * Student Section Status — Progress Summary
 *
 * GET /api/student-section-status/progress
 *   Returns overall progress across all Kaidah Pencacahan sections.
 *
 * Response:
 * {
 *   total: number,        // Total sections (13)
 *   completed: number,    // Sections marked "completed"
 *   unlocked: number,     // Sections marked "unlocked" (not yet completed)
 *   locked: number,       // Sections still locked
 *   percentage: number,   // 0-100, rounded to 1 decimal
 *   concepts: {           // Per-concept breakdown
 *     [conceptId]: { total, completed, unlocked, locked, percentage }
 *   }
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import {
  KAIDAH_PENCACAHAN_SECTIONS,
  KAIDAH_PENCACAHAN_CONCEPT_IDS,
} from "@/lib/data/student-section-status";

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

    // Query all student_section_status rows for this student across both concepts
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: [...KAIDAH_PENCACAHAN_CONCEPT_IDS] },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
    });

    // Build lookup: `${conceptId}:${section}` -> status
    const statusMap: Record<string, string> = {};
    for (const row of rows) {
      statusMap[`${row.conceptId}:${row.section}`] = row.status;
    }

    // Compute totals and per-concept breakdowns
    let totalCompleted = 0;
    let totalUnlocked = 0;
    let totalLocked = 0;

    const concepts: Record<string, { total: number; completed: number; unlocked: number; locked: number; percentage: number }> = {};

    for (const conceptId of KAIDAH_PENCACAHAN_CONCEPT_IDS) {
      const conceptSections = KAIDAH_PENCACAHAN_SECTIONS.filter((s) => s.conceptId === conceptId);
      const conceptTotal = conceptSections.length;
      let completed = 0;
      let unlocked = 0;
      let locked = 0;

      for (const section of conceptSections) {
        const status = statusMap[`${section.conceptId}:${section.section}`] ?? "locked";
        if (status === "completed") completed++;
        else if (status === "unlocked") unlocked++;
        else locked++;
      }

      totalCompleted += completed;
      totalUnlocked += unlocked;
      totalLocked += locked;

      concepts[conceptId] = {
        total: conceptTotal,
        completed,
        unlocked,
        locked,
        percentage: conceptTotal > 0 ? Math.round((completed / conceptTotal) * 1000) / 10 : 0,
      };
    }

    const total = KAIDAH_PENCACAHAN_SECTIONS.length;
    const percentage = total > 0 ? Math.round((totalCompleted / total) * 1000) / 10 : 0;

    return NextResponse.json({
      total,
      completed: totalCompleted,
      unlocked: totalUnlocked,
      locked: totalLocked,
      percentage,
      concepts,
    });
  } catch (error) {
    console.error("[GET /api/student-section-status/progress] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
