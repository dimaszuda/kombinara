/**
 * Download Modul — Status API
 *
 * GET /api/download/status
 *   -> Returns eligibility status for all downloadable moduls
 *      based on the student's section completion progress.
 *
 * Downloadable moduls:
 *   1. Pendahuluan Modul.pdf — apersepsi, pemantik, refleksi_sebelum_mulai
 *   2. Kaidah Pencacahan.pdf — ALL 13 sections + asesmen formatif
 *   3. Faktorial.pdf       — semua section di materi faktorial
 *   4. Permutasi.pdf       — semua section di materi permutasi
 *   5. Kombinasi.pdf       — semua section di materi kombinasi
 *   6. Bagian Akhir Modul.pdf — semua section di semua materi + asesmen formatif
 *
 * Response (200):
 * {
 *   moduls: [
 *     {
 *       key: string,
 *       name: string,
 *       description: string,
 *       requirementSummary: string,   // ringkasan syarat (untuk UI)
 *       eligible: boolean,
 *       totalSections: number,
 *       completedSections: number,
 *     }
 *   ]
 * }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ─── Constants ──────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  apersepsi: "Apersepsi",
  pemantik: "Pemantik",
  refleksi_sebelum_mulai: "Refleksi Sebelum Mulai",
  eksplorasi_kontekstual: "Eksplorasi Kontekstual",
  aktivitas_deep_learning: "Aktivitas Deep Learning",
  penjelasan_konsep: "Penjelasan Konsep",
  contoh_soal: "Contoh Soal",
  refleksi_mini: "Refleksi Mini",
};

const CONCEPT_LABELS: Record<string, string> = {
  kaidah_penjumlahan: "Kaidah Penjumlahan",
  kaidah_perkalian: "Kaidah Perkalian",
};

/** Explicit section requirements for Pendahuluan Modul.pdf */
const PENDAHULUAN_REQUIREMENTS = [
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
] as const;

/** ALL 13 sections across kaidah_penjumlahan + kaidah_perkalian. */
const KAIDAH_PENCACAHAN_REQUIREMENTS = [
  { conceptId: "kaidah_penjumlahan", section: "apersepsi" },
  { conceptId: "kaidah_penjumlahan", section: "pemantik" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_sebelum_mulai" },
  { conceptId: "kaidah_penjumlahan", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_penjumlahan", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_penjumlahan", section: "penjelasan_konsep" },
  { conceptId: "kaidah_penjumlahan", section: "contoh_soal" },
  { conceptId: "kaidah_penjumlahan", section: "refleksi_mini" },
  { conceptId: "kaidah_perkalian", section: "eksplorasi_kontekstual" },
  { conceptId: "kaidah_perkalian", section: "aktivitas_deep_learning" },
  { conceptId: "kaidah_perkalian", section: "penjelasan_konsep" },
  { conceptId: "kaidah_perkalian", section: "contoh_soal" },
  { conceptId: "kaidah_perkalian", section: "refleksi_mini" },
] as const;

/** Concept-level moduls: cukup cek semua section di concept_id tsb completed. */
const CONCEPT_MODULS = [
  { key: "faktorial" as const, conceptId: "faktorial", name: "Faktorial", description: "Modul lengkap materi Faktorial." },
  { key: "permutasi" as const, conceptId: "permutasi", name: "Permutasi", description: "Modul lengkap materi Permutasi." },
  { key: "kombinasi" as const, conceptId: "kombinasi", name: "Kombinasi", description: "Modul lengkap materi Kombinasi." },
] as const;

/** Semua concept_id yang relevan untuk query student_section_status. */
const ALL_CONCEPT_IDS = [
  "kaidah_penjumlahan",
  "kaidah_perkalian",
  ...CONCEPT_MODULS.map((m) => m.conceptId),
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildKey(conceptId: string, section: string): string {
  return `${conceptId}::${section}`;
}

function formatRequirement(r: { conceptId: string; section: string }) {
  return {
    conceptId: r.conceptId,
    section: r.section,
    label: `${CONCEPT_LABELS[r.conceptId] ?? r.conceptId} — ${SECTION_LABELS[r.section] ?? r.section}`,
  };
}

interface ModulResult {
  key: string;
  name: string;
  description: string;
  requirementSummary: string;
  eligible: boolean;
  totalSections: number;
  completedSections: number;
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
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

    // ── Fetch semua student_section_status rows ─────────────────────
    const rows = await prisma.studentSectionStatus.findMany({
      where: {
        studentId: student.id,
        conceptId: { in: ALL_CONCEPT_IDS },
      },
      select: {
        conceptId: true,
        section: true,
        status: true,
      },
    });

    const statusMap = new Map<string, string>();
    for (const row of rows) {
      statusMap.set(buildKey(row.conceptId, row.section), row.status);
    }

    // ── Helper: cek completion untuk list section eksplisit ─────────
    function checkExplicit(
      requirements: ReadonlyArray<{ conceptId: string; section: string }>
    ): { completed: number; total: number; allDone: boolean } {
      let completed = 0;
      for (const r of requirements) {
        if (statusMap.get(buildKey(r.conceptId, r.section)) === "completed") {
          completed++;
        }
      }
      return { completed, total: requirements.length, allDone: completed === requirements.length };
    }

    // ── Helper: cek completion untuk semua section di suatu concept ─
    function checkConcept(conceptId: string): {
      completed: number;
      total: number;
      allDone: boolean;
    } {
      const conceptSections = rows.filter((r) => r.conceptId === conceptId);
      const total = conceptSections.length;
      // Jika belum ada section sama sekali (materi belum dimulai), anggap 0/0 = not eligible
      if (total === 0) return { completed: 0, total: 0, allDone: false };
      const completed = conceptSections.filter((r) => r.status === "completed").length;
      return { completed, total, allDone: completed === total };
    }

    // ── Cek asesmen_formatif submission ─────────────────────────────
    const submission = await prisma.asesmenFormatifSubmission.findFirst({
      where: { studentId: student.id },
      select: { id: true },
    });
    const hasAsesmenFormatif = !!submission;

    // ── Evaluasi tiap modul ─────────────────────────────────────────
    const pendahuluan = checkExplicit(PENDAHULUAN_REQUIREMENTS);
    const kp = checkExplicit(KAIDAH_PENCACAHAN_REQUIREMENTS);

    const moduls: ModulResult[] = [
      {
        key: "pendahuluan",
        name: "Pendahuluan Modul",
        description: "Berisi kata pengantar, daftar isi, petunjuk penggunaan, dan tujuan pembelajaran.",
        requirementSummary: `Selesaikan ${PENDAHULUAN_REQUIREMENTS.length} section awal: Apersepsi, Pemantik, dan Refleksi Sebelum Mulai.`,
        eligible: pendahuluan.allDone,
        totalSections: pendahuluan.total,
        completedSections: pendahuluan.completed,
      },
      {
        key: "kaidah-pencacahan",
        name: "Kaidah Pencacahan",
        description: "Modul lengkap materi Kaidah Penjumlahan dan Kaidah Perkalian.",
        requirementSummary: `Selesaikan semua ${KAIDAH_PENCACAHAN_REQUIREMENTS.length} section di Kaidah Penjumlahan & Kaidah Perkalian, termasuk Asesmen Formatif.`,
        eligible: kp.allDone && hasAsesmenFormatif,
        totalSections: KAIDAH_PENCACAHAN_REQUIREMENTS.length + 1, // +1 untuk asesmen formatif
        completedSections: kp.completed + (hasAsesmenFormatif ? 1 : 0),
      },
    ];

    // ── Concept-level moduls (faktorial, permutasi, kombinasi) ──────
    for (const m of CONCEPT_MODULS) {
      const result = checkConcept(m.conceptId);
      moduls.push({
        key: m.key,
        name: m.name,
        description: m.description,
        requirementSummary:
          result.total === 0
            ? "Materi belum tersedia. Section akan muncul setelah materi dirilis."
            : `Selesaikan semua ${result.total} section pada materi ${m.name}.`,
        eligible: result.allDone,
        totalSections: result.total,
        completedSections: result.completed,
      });
    }

    // ── Bagian Akhir Modul: semua concept + asesmen formatif ───────
    const allConceptResults = [
      checkExplicit(KAIDAH_PENCACAHAN_REQUIREMENTS),
      ...CONCEPT_MODULS.map((m) => checkConcept(m.conceptId)),
    ];
    const totalAllSections = allConceptResults.reduce((sum, r) => sum + r.total, 0);
    const completedAllSections = allConceptResults.reduce((sum, r) => sum + r.completed, 0);
    const allConceptsDone = allConceptResults.every((r) => r.allDone && r.total > 0);

    moduls.push({
      key: "bagian-akhir",
      name: "Bagian Akhir Modul",
      description: "Berisi rangkuman konsep, glosarium, dan kunci jawaban.",
      requirementSummary: `Selesaikan semua section di seluruh materi (Kaidah Pencacahan, Faktorial, Permutasi, Kombinasi) dan Asesmen Formatif.`,
      eligible: allConceptsDone && hasAsesmenFormatif,
      totalSections: totalAllSections + 1, // +1 asesmen formatif
      completedSections: completedAllSections + (hasAsesmenFormatif ? 1 : 0),
    });

    return NextResponse.json({ moduls });
  } catch (error) {
    console.error("[GET /api/download/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
