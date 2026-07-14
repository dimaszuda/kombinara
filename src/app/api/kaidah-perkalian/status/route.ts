/**
 * Kaidah Perkalian — Status API
 *
 * GET /api/kaidah-perkalian/status
 *   → Mengecek per-section mana yang sudah diselesaikan siswa
 *     + mengembalikan data jawaban & feedback yang sudah disimpan.
 *
 * Response:
 * {
 *   completedSections: Record<number, boolean>,
 *   savedData: {
 *     eksplorasi?: { answer, feedback, isCorrect } | null,
 *     deepLearning?: { answer, feedback, isCorrect } | null,
 *     contohSoal?: Record<questionKey, { answer, isCorrect }>,
 *     refleksi?: Record<questionKey, { answer, feedback, isCorrect }>,
 *   }
 * }
 *
 * Section mapping:
 *   0 = Eksplorasi Kontekstual (eksplorasi_kontekstual)
 *   1 = Aktivitas Deep Learning (aktivitas_deep_learning)
 *   3 = Contoh Soal Bertahap (contoh_soal_bertahap_attempts)
 *   7 = Refleksi Mini (refleksi_mini)
 *
 * Section 2,4,5,6 adalah read-only — tidak disimpan di DB.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const CONCEPT_ID = "kaidah_perkalian";

const REFLEKSI_QUESTION_KEYS = [
  "refleksi_perkalian_1",
  "refleksi_perkalian_2",
  "refleksi_perkalian_3",
];

const EKSPLORASI_QUESTION_KEYS = [
  "situasi_1",
];

const CONTOH_SOAL_QUESTION_KEYS = [
  "perkalian_plat",
  "perkalian_pin",
  "perkalian_foto",
  "perkalian_menu",
  "perkalian_bilangan",
];

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

    const completedSections: Record<number, boolean> = {};

    // ── Section 0: Eksplorasi Kontekstual ─────────────────────────
    // Fetch full rows (answer + feedback + is_correct) — latest per question_key
    const allEksplorasi = await prisma.$queryRaw<
      Array<{ question_key: string; answer: unknown; feedback: string | null; is_correct: boolean | null }>
    >`
      SELECT question_key, answer, feedback, is_correct
      FROM eksplorasi_kontekstual
      WHERE student_id = ${student.id}
        AND concept_id = ${CONCEPT_ID}::concept_type
        AND question_key IS NOT NULL
      ORDER BY question_key ASC, created_at DESC
    `;

    // Deduplicate: ambil row terbaru per question_key
    const eksplorasiLatestByKey = new Map<string, { answer: unknown; feedback: string | null; isCorrect: boolean | null }>();
    for (const e of allEksplorasi) {
      if (!eksplorasiLatestByKey.has(e.question_key)) {
        eksplorasiLatestByKey.set(e.question_key, {
          answer: e.answer,
          feedback: e.feedback,
          isCorrect: e.is_correct,
        });
      }
    }

    const eksplorasiComplete = EKSPLORASI_QUESTION_KEYS.every(
      (key) => eksplorasiLatestByKey.get(key)?.isCorrect === true
    );
    if (eksplorasiComplete) {
      completedSections[0] = true;
    }

    // Saved data untuk eksplorasi: return latest row untuk question_key pertama saja
    const eksplorasiSavedData = eksplorasiLatestByKey.get(EKSPLORASI_QUESTION_KEYS[0]) ?? null;

    // ── Section 1: Aktivitas Deep Learning ───────────────────────
    const deepLearning = await prisma.aktivitasDeepLearning.findFirst({
      where: { studentId: student.id, conceptId: CONCEPT_ID },
      orderBy: { createdAt: "desc" },
      select: { answer: true, feedback: true, isCorrect: true },
    });
    if (deepLearning?.isCorrect === true) {
      completedSections[1] = true;
    }

    // ── Section 3: Contoh Soal Bertahap ──────────────────────────
    const allContohSoal = await prisma.$queryRaw<
      Array<{ question_key: string; answer: unknown; is_correct: boolean }>
    >`
      SELECT question_key, answer, is_correct
      FROM contoh_soal_bertahap_attempts
      WHERE student_id = ${student.id}
        AND concept_id = ${CONCEPT_ID}
        AND is_correct = true
      ORDER BY question_key ASC, submitted_at DESC
    `;

    // Deduplicate: ambil yang terbaru per question_key (yang sudah correct)
    const contohSoalSavedData: Record<string, { answer: unknown; isCorrect: boolean }> = {};
    for (const c of allContohSoal) {
      if (!contohSoalSavedData[c.question_key]) {
        contohSoalSavedData[c.question_key] = {
          answer: c.answer,
          isCorrect: c.is_correct,
        };
      }
    }

    const contohSoalComplete = CONTOH_SOAL_QUESTION_KEYS.every(
      (key) => contohSoalSavedData[key]?.isCorrect === true
    );
    if (contohSoalComplete) {
      completedSections[3] = true;
    }

    // ── Section 7: Refleksi Mini ─────────────────────────────────
    const allRefleksi = await prisma.refleksiMini.findMany({
      where: { studentId: student.id, conceptId: CONCEPT_ID },
      orderBy: [{ questionKey: "asc" }, { createdAt: "desc" }],
      select: { questionKey: true, answer: true, feedback: true, isCorrect: true },
    });

    // Ambil yang terbaru per question_key
    const refleksiLatestByKey = new Map<string, { answer: string; feedback: string | null; isCorrect: boolean | null }>();
    for (const r of allRefleksi) {
      if (!refleksiLatestByKey.has(r.questionKey)) {
        refleksiLatestByKey.set(r.questionKey, {
          answer: r.answer,
          feedback: r.feedback,
          isCorrect: r.isCorrect,
        });
      }
    }

    const refleksiComplete = REFLEKSI_QUESTION_KEYS.every(
      (key) => refleksiLatestByKey.get(key)?.isCorrect === true
    );
    if (refleksiComplete) {
      completedSections[7] = true;
    }

    // Build refleksi saved data
    const refleksiSavedData: Record<string, { answer: string; feedback: string | null; isCorrect: boolean | null }> = {};
    for (const [key, val] of refleksiLatestByKey) {
      refleksiSavedData[key] = val;
    }

    return NextResponse.json({
      completedSections,
      savedData: {
        eksplorasi: eksplorasiSavedData,
        deepLearning: deepLearning
          ? { answer: deepLearning.answer, feedback: deepLearning.feedback, isCorrect: deepLearning.isCorrect }
          : null,
        contohSoal: contohSoalSavedData,
        refleksi: refleksiSavedData,
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
