/**
 * Student Section Status — Progress Summary
 *
 * GET /api/student-section-status/progress
 *   Returns overall progress across all Kaidah Pencacahan sections,
 *   plus the concept the student is currently working on.
 *
 * Response:
 * {
 *   total, completed, unlocked, locked, percentage,
 *   concepts: { [conceptId]: { total, completed, unlocked, locked, percentage } },
 *   currentConcept: {
 *     conceptId: string,
 *     label: string,          // Human-readable name
 *     sectionIndex: number,   // 1-based; 0 if not started yet
 *     totalSections: number,
 *   } | null                  // null only when no rows exist at all (empty)
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import {
  ALL_SECTIONS,
  ALL_CONCEPT_IDS,
  CONCEPT_ORDER,
  CONCEPT_LABELS,
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

    // Query all student_section_status rows for this student across ALL concepts
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: [...ALL_CONCEPT_IDS] },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
      orderBy: [
        { conceptId: "asc" },
        { section: "asc" },
      ],
    });

    // ── Group rows by conceptId ────────────────────────────────
    const rowsByConcept: Record<string, { section: string; status: string }[]> = {};
    for (const row of rows) {
      if (!rowsByConcept[row.conceptId]) rowsByConcept[row.conceptId] = [];
      rowsByConcept[row.conceptId].push({ section: row.section, status: row.status });
    }

    // ── Per-concept breakdown & overall totals (from actual DB rows) ──
    let totalCompleted = 0;
    let totalUnlocked = 0;
    let totalLocked = 0;

    // Build lookup for section ordering: `${conceptId}:${section}` → index in ALL_SECTIONS
    const sectionOrderMap: Record<string, number> = {};
    for (let i = 0; i < ALL_SECTIONS.length; i++) {
      const s = ALL_SECTIONS[i];
      sectionOrderMap[`${s.conceptId}:${s.section}`] = i;
    }

    const concepts: Record<string, { total: number; completed: number; unlocked: number; locked: number; percentage: number }> = {};

    for (const conceptId of CONCEPT_ORDER) {
      const conceptRows = rowsByConcept[conceptId] ?? [];
      const conceptTotal = conceptRows.length;
      let completed = 0;
      let unlocked = 0;
      let locked = 0;

      for (const r of conceptRows) {
        if (r.status === "completed") completed++;
        else if (r.status === "unlocked") unlocked++;
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

    const total = rows.length;
    const percentage = total > 0 ? Math.round((totalCompleted / total) * 1000) / 10 : 0;

    // ── Determine current concept ──────────────────────────────
    // Walk CONCEPT_ORDER sequentially; the LAST concept the student has
    // ever interacted with (has any unlocked or completed section) is the
    // one they're currently on — whether still working or already finished.
    let currentConcept: {
      conceptId: string;
      label: string;
      sectionIndex: number;   // 1-based; 0 = belum mulai
      totalSections: number;
    } | null = null;

    if (rows.length > 0) {
      // Find the last concept with any activity (unlocked or completed)
      for (const conceptId of CONCEPT_ORDER) {
        const c = concepts[conceptId];
        if (!c || c.total === 0) continue;
        if (c.unlocked > 0 || c.completed > 0) {
          const conceptRows = rowsByConcept[conceptId] ?? [];
          const sorted = [...conceptRows].sort(
            (a, b) =>
              (sectionOrderMap[`${conceptId}:${a.section}`] ?? 999) -
              (sectionOrderMap[`${conceptId}:${b.section}`] ?? 999)
          );

          let sectionIndex: number;
          if (c.unlocked > 0) {
            // Still working — find the first unlocked section
            let idx = 0;
            for (let i = 0; i < sorted.length; i++) {
              if (sorted[i].status === "unlocked") {
                idx = i + 1; // 1-based
                break;
              }
            }
            sectionIndex = idx;
          } else {
            // All completed in this concept
            sectionIndex = c.total;
          }

          currentConcept = {
            conceptId,
            label: CONCEPT_LABELS[conceptId] ?? conceptId,
            sectionIndex,
            totalSections: c.total,
          };
          // Don't break — keep going to find the LAST one
        }
      }

      // Fallback: no concept has any activity (all locked everywhere)
      if (!currentConcept) {
        for (const conceptId of CONCEPT_ORDER) {
          const c = concepts[conceptId];
          if (c && c.total > 0) {
            currentConcept = {
              conceptId,
              label: CONCEPT_LABELS[conceptId] ?? conceptId,
              sectionIndex: 0,
              totalSections: c.total,
            };
            break;
          }
        }
      }
    }

    return NextResponse.json({
      total,
      completed: totalCompleted,
      unlocked: totalUnlocked,
      locked: totalLocked,
      percentage,
      concepts,
      currentConcept,
    });
  } catch (error) {
    console.error("[GET /api/student-section-status/progress] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
