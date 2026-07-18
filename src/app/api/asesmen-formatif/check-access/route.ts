/**
 * Asesmen Formatif -- Check Access API
 *
 * GET /api/asesmen-formatif/check-access?module_slug=kaidah-pencacahan
 *   -> Checks whether the student has completed ALL 14 sections
 *      across both concept_ids required for asesmen_formatif access.
 *
 * Required sections:
 *   kaidah_penjumlahan (8): apersepsi, pemantik, refleksi_sebelum_mulai,
 *     eksplorasi_kontekstual, aktivitas_deep_learning, penjelasan_konsep,
 *     contoh_soal, refleksi_mini
 *   kaidah_perkalian (5): eksplorasi_kontekstual, aktivitas_deep_learning,
 *     penjelasan_konsep, contoh_soal, refleksi_mini
 *
 * NOTES:
 *   - aktivitas_siswa is NOT checked here; it is transitively gated
 *     by kaidah_perkalian.refleksi_mini (see assumptions).
 *   - Uses a SINGLE query for all 13 sections, no per-section looping.
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

// ─── Constants ──────────────────────────────────────────────────────────────

/** All 13 sections across both concept_ids that must be completed. */
const REQUIRED_SECTIONS: Array<{ conceptId: string; section: string }> = [
  // kaidah_penjumlahan (8 sections)
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
  { conceptId: "kaidah_penjumlahan", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_penjumlahan", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_penjumlahan", section: "penjelasan_konsep" },
  { conceptId: "kaidah_penjumlahan", section: "contoh_soal" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_mini" },

  // kaidah_perkalian (5 sections)
  { conceptId: "kaidah_perkalian", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_perkalian", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_perkalian", section: "penjelasan_konsep" },
  { conceptId: "kaidah_perkalian", section: "contoh_soal" },
  { conceptId: "kaidah_perkalian", section: "refleksi_mini" },
];

const REQUIRED_CONCEPT_IDS = ["kaidah_penjumlahan", "kaidah_perkalian"];

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildSectionKey(conceptId: string, section: string): string {
  return `${conceptId}::${section}`;
}

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

    // ── Optional module_slug query param ────────────────────────────
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("module_slug");

    // Future: validate module_slug maps to a supported module.
    // For now, only kaidah-pencacahan is supported.
    if (moduleSlug && moduleSlug !== "kaidah-pencacahan") {
      return NextResponse.json(
        { error: `Unsupported module_slug: ${moduleSlug}. Only "kaidah-pencacahan" is supported.` },
        { status: 400 }
      );
    }

    // ── Single query: fetch ALL sections for both concept_ids ───────
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: REQUIRED_CONCEPT_IDS },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
    });

    // Build a lookup map: "conceptId::section" -> status
    const statusMap = new Map<string, string>();
    for (const row of rows) {
      statusMap.set(buildSectionKey(row.conceptId, row.section), row.status);
    }

    // ── Check each required section ─────────────────────────────────
    const missingSections: Array<{ conceptId: string; section: string }> = [];

    for (const req of REQUIRED_SECTIONS) {
      const key = buildSectionKey(req.conceptId, req.section);
      const status = statusMap.get(key);

      if (status !== "completed") {
        missingSections.push({ conceptId: req.conceptId, section: req.section });
      }
    }

    const completedCount = REQUIRED_SECTIONS.length - missingSections.length;
    const allowed = missingSections.length === 0;

    return NextResponse.json({
      allowed,
      missingSections,
      summary: {
        totalRequired: REQUIRED_SECTIONS.length,
        completed: completedCount,
        missing: missingSections.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/asesmen-formatif/check-access] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
