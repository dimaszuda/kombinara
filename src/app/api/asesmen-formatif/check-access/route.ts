/**
 * Asesmen Formatif — Check Access API
 *
 * GET /api/asesmen-formatif/check-access?module_slug=...
 *   → Checks whether the student has completed all required sections
 *     AND returns mastery/retry info for incremental retry.
 *
 * Supported module_slugs:
 *   kaidah-pencacahan — 13 sections (kaidah_penjumlahan + kaidah_perkalian)
 *   faktorial         — 6  sections + mastery tracking
 *   permutasi         — 11 sections + mastery tracking
 *   kombinasi         — 6  sections + mastery tracking
 *
 * Response (200):
 * {
 *   allowed: boolean,
 *   missingSections: Array<{ conceptId: string, section: string }>,
 *   summary: { totalRequired: number, completed: number, missing: number },
 *
 *   // Mastery tracking (only for faktorial/permutasi/kombinasi):
 *   masteredQuestions: number[],
 *   remainingQuestions: number[],
 *   isFullyMastered: boolean,
 *   initialScore: number | null
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import {
  MATERI_SECTIONS,
  PERMUTASI_SECTIONS,
  KOMBINASI_SECTIONS,
  PERMUTASI_CONCEPT_IDS,
  KOMBINASI_CONCEPT_IDS,
} from "@/lib/data/student-section-status";

// ─── Section maps per module_slug ──────────────────────────────────────────────

const SECTION_MAP: Record<string, ReadonlyArray<{ conceptId: string; section: string }>> = {
  // Kaidah Pencacahan = kaidah_penjumlahan + kaidah_perkalian ONLY (13 sections).
  // Faktorial has its own ulangan and is NOT included here.
  "kaidah-pencacahan": MATERI_SECTIONS.filter(s => s.conceptId !== "faktorial"),
  faktorial: MATERI_SECTIONS.filter(s => s.conceptId === "faktorial" && s.section !== "mengapa_corner"), // 5 sections (mengapa_corner not tracked)
  permutasi: PERMUTASI_SECTIONS,                  // 11 sections
  kombinasi: KOMBINASI_SECTIONS,                  // 6 sections
};

const CONCEPT_ID_MAP: Record<string, ReadonlyArray<string>> = {
  "kaidah-pencacahan": ["kaidah_penjumlahan", "kaidah_perkalian"],
  faktorial: ["faktorial"],
  permutasi: PERMUTASI_CONCEPT_IDS,
  kombinasi: KOMBINASI_CONCEPT_IDS,
};

const SUPPORTED_MODULES = new Set(Object.keys(SECTION_MAP));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildSectionKey(conceptId: string, section: string): string {
  return `${conceptId}::${section}`;
}

// ─── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // ── Parse module_slug ───────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("module_slug");

    if (!moduleSlug || !SUPPORTED_MODULES.has(moduleSlug)) {
      return NextResponse.json(
        { error: `Invalid or missing module_slug. Supported: ${[...SUPPORTED_MODULES].join(", ")}` },
        { status: 400 }
      );
    }

    const requiredSections = SECTION_MAP[moduleSlug];
    const conceptIds = CONCEPT_ID_MAP[moduleSlug];

    // ── Section completion check ────────────────────────────────────
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: [...conceptIds] },
      },
      select: { conceptId: true, section: true, status: true },
    });

    const statusMap = new Map<string, string>();
    for (const row of rows) {
      statusMap.set(buildSectionKey(row.conceptId, row.section), row.status);
    }

    const missingSections: Array<{ conceptId: string; section: string }> = [];
    for (const req of requiredSections) {
      const key = buildSectionKey(req.conceptId, req.section);
      if (statusMap.get(key) !== "completed") {
        missingSections.push({ conceptId: req.conceptId, section: req.section });
      }
    }

    const completedCount = requiredSections.length - missingSections.length;
    const allowed = missingSections.length === 0;

    const baseResponse = {
      allowed,
      missingSections,
      summary: {
        totalRequired: requiredSections.length,
        completed: completedCount,
        missing: missingSections.length,
      },
    };

    // ── Mastery tracking (all modules) ───
    // Resolve moduleId
    const mod = await prisma.module.findUnique({
      where: { slug: moduleSlug },
      select: { id: true },
    });

    if (!mod) {
      return NextResponse.json({ ...baseResponse, masteredQuestions: [], remainingQuestions: [], isFullyMastered: false, initialScore: null });
    }

    // Determine total question count based on module
    const totalQuestions =
      moduleSlug === "kaidah-pencacahan" ? 10 :
      moduleSlug === "faktorial" ? 7 :
      moduleSlug === "permutasi" ? 10 :
      moduleSlug === "kombinasi" ? 10 : 10;

    // Query all submissions for this student+module
    const submissions = await prisma.asesmenFormatifSubmission.findMany({
      where: { studentId: student.id, moduleId: mod.id },
      orderBy: { submittedAt: "asc" },
      select: { totalScore: true, perQuestionResults: true },
    });

    if (submissions.length === 0) {
      // First attempt — all questions are remaining
      const allQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
      return NextResponse.json({
        ...baseResponse,
        masteredQuestions: [],
        remainingQuestions: allQuestions,
        isFullyMastered: false,
        initialScore: null,
      });
    }

    // Initial score = first submission's totalScore
    const initialScore = submissions[0].totalScore ?? null;

    // Build mastery map: question_number → AI found NO mistake in ANY submission?
    // A question is considered "mastered" if the AI evaluation returned
    // mistake_category === null (no error) in at least one submission.
    // If mistake_category is NOT null (konsep | formula | perhitungan | lainnya |
    // tidak_diisi | tidak_memadai), the question still needs retry.
    const masteredSet = new Set<number>();
    for (const sub of submissions) {
      const results = sub.perQuestionResults as unknown as Array<{
        question_number: number;
        mistake_category: string | null;
      }> | null;
      if (!results || !Array.isArray(results)) continue;
      for (const r of results) {
        if (r.mistake_category === null) {
          masteredSet.add(r.question_number);
        }
      }
    }

    const allQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
    const masteredQuestions = allQuestions.filter(q => masteredSet.has(q));
    const remainingQuestions = allQuestions.filter(q => !masteredSet.has(q));
    const isFullyMastered = masteredQuestions.length >= totalQuestions;

    return NextResponse.json({
      ...baseResponse,
      masteredQuestions,
      remainingQuestions,
      isFullyMastered,
      initialScore,
    });
  } catch (error) {
    console.error("[GET /api/asesmen-formatif/check-access] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
