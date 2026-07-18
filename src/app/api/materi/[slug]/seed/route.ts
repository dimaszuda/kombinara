/**
 * Materi Seeding API
 *
 * GET /api/materi/[slug]/seed
 *   Triggers idempotent seeding of student_section_status rows for the
 *   given materi slug. Currently only handles "kaidah-pencacahan".
 *
 * Response:
 *   { seeded: boolean, existingCount: number }
 *
 * This endpoint is called once on first access to a materi page, before
 * any status-fetching calls. It ensures the prerequisite rows exist for
 * the completion/update logic (which uses UPDATE, not UPSERT).
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { seedStudentSectionStatus } from "@/lib/data/student-section-status";

/** Slugs that trigger Kaidah Pencacahan seeding. */
const SEEDABLE_SLUGS = new Set(["kaidah-pencacahan"]);

// ─── GET ────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Only handle known seedable slugs; silently skip others (not an error).
  if (!SEEDABLE_SLUGS.has(slug)) {
    return NextResponse.json({ seeded: false, reason: "not_applicable" });
  }

  // ── Auth ─────────────────────────────────────────────────────────
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

  // ── Seed ─────────────────────────────────────────────────────────
  const result = await seedStudentSectionStatus(student.id, supabase);

  return NextResponse.json(result);
}
