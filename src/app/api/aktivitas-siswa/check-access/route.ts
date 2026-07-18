/**
 * Aktivitas Siswa -- Check Access API
 *
 * GET /api/aktivitas-siswa/check-access?concept_id=kaidah_perkalian
 *   -> Checks whether the student has completed the prerequisite section
 *      (contoh_soal) before accessing aktivitas_siswa for a given concept.
 *
 * Gate rule (hardcoded, per current requirements):
 *   concept_id = kaidah_perkalian  ->  requires section contoh_soal = completed
 *
 *   Other concept_ids are NOT supported yet; the endpoint will reject them
 *   with a 400 error rather than silently allowing access.
 *
 * Response (200):
 * {
 *   allowed: boolean,
 *   missingSections: Array<{ conceptId: string, section: string }>,
 *   summary: { totalRequired: number, completed: number, missing: number }
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ─── Gate Configuration (hardcoded -- see BATASAN) ─────────────────────────

interface GateRule {
  conceptId: string;
  requiredSection: string;
}

/** Concept_ids that have an aktivitas_siswa access gate and their prerequisites. */
const GATE_RULES: GateRule[] = [
  { conceptId: "kaidah_perkalian", requiredSection: "contoh_soal" },
];

const SUPPORTED_CONCEPT_IDS = GATE_RULES.map((r) => r.conceptId);

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
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

    // ── Validate concept_id query param ─────────────────────────────
    const { searchParams } = new URL(req.url);
    const conceptId = searchParams.get("concept_id");

    if (!conceptId) {
      return NextResponse.json(
        { error: "Missing required query parameter: concept_id" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_CONCEPT_IDS.includes(conceptId)) {
      return NextResponse.json(
        {
          error: `Unsupported concept_id: "${conceptId}". Supported: ${SUPPORTED_CONCEPT_IDS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Find the gate rule for this concept ─────────────────────────
    const rule = GATE_RULES.find((r) => r.conceptId === conceptId)!;

    // ── Single query: check the required section ────────────────────
    const row = await prisma.studentSectionStatus.findUnique({
      where: {
        studentId_conceptId_section: {
          studentId: student.id,
          conceptId: rule.conceptId,
          section: rule.requiredSection,
        },
      },
      select: { status: true },
    });

    // If row does not exist, treat as not-yet-seeded -> access denied.
    const isCompleted = row?.status === "completed";

    const missingSections: Array<{ conceptId: string; section: string }> = isCompleted
      ? []
      : [{ conceptId: rule.conceptId, section: rule.requiredSection }];

    return NextResponse.json({
      allowed: isCompleted,
      missingSections,
      summary: {
        totalRequired: 1,
        completed: isCompleted ? 1 : 0,
        missing: isCompleted ? 0 : 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/aktivitas-siswa/check-access] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
