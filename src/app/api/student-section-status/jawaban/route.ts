/**
 * Student Section Status -- On-Demand Jawaban & Feedback API
 *
 * GET /api/student-section-status/jawaban?concept_id=...&section=...
 *   Returns the saved answers + AI feedback for ONE specific section.
 *   Called ONLY when the student clicks the "Lihat jawabanku" button
 *   on a completed section. This is NOT called during initial page load.
 *
 * Response:
 * {
 *   section: string,
 *   conceptId: string,
 *   entries: Array<{
 *     questionKey: string,
 *     answer: unknown,
 *     feedback: string | null,
 *     isCorrect: boolean | null,
 *     submittedAt: string | null
 *   }>
 * }
 *
 * Section-to-table mapping (application-layer, NOT from CHECK constraint):
 *   kaidah_penjumlahan.apersepsi               -> apersepsi_pemantik_responses (qkey: kendaraan)
 *   kaidah_penjumlahan.pemantik                 -> apersepsi_pemantik_responses (qkeys: outfit, pengurus, ...)
 *   kaidah_penjumlahan.refleksi_sebelum_mulai    -> apersepsi_pemantik_responses (qkeys: refleksi_sebelum_mulai_1, 2)
 *   *.eksplorasi_kontekstual                     -> eksplorasi_kontekstual
 *   *.aktivitas_deep_learning                    -> aktivitas_deep_learning
 *   *.penjelasan_konsep                          -> (read-only, no answers)
 *   *.contoh_soal                                -> contoh_soal_bertahap_attempts
 *   *.refleksi_mini                              -> refleksi_mini
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ── Section-to-table question_key mapping ─────────────────────────
// For sections that span multiple question_keys in apersepsi_pemantik_responses
const APERSEPSI_PEMANTIK_QUESTION_KEYS: Record<string, string[]> = {
  apersepsi: ["kendaraan", "outfit", "pengurus"],
  pemantik: ["password_kapasitas", "tim_sama_beda", "rute_kurir"],
  refleksi_sebelum_mulai: ["refleksi_sebelum_mulai_1", "refleksi_sebelum_mulai_2"],
};

// Sections that live in apersepsi_pemantik_responses (shared table)
const APERSEPSI_PEMANTIK_SECTIONS = new Set(Object.keys(APERSEPSI_PEMANTIK_QUESTION_KEYS));

// ─── GET ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const concept_id = searchParams.get("concept_id");
    const section = searchParams.get("section");

    if (typeof concept_id !== "string" || typeof section !== "string") {
      return NextResponse.json(
        { error: "Query params required: concept_id, section" },
        { status: 400 }
      );
    }

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

    const studentId = student.id;

    // ── Route to the correct query based on section ────────────────
    let entries: Array<{
      questionKey: string;
      answer: unknown;
      feedback: string | null;
      isCorrect: boolean | null;
      submittedAt: string | null;
    }> = [];

    // --- apersepsi, pemantik, refleksi_sebelum_mulai (shared table) ---
    if (APERSEPSI_PEMANTIK_SECTIONS.has(section)) {
      const questionKeys = APERSEPSI_PEMANTIK_QUESTION_KEYS[section];
      if (!questionKeys || questionKeys.length === 0) {
        return NextResponse.json({ section, conceptId: concept_id, entries: [] });
      }

      const rows = await prisma.apersepsiPemantikResponse.findMany({
        where: {
          studentId,
          questionKey: { in: questionKeys },
        },
        orderBy: [{ questionKey: "asc" }, { submittedAt: "desc" }],
        select: {
          questionKey: true,
          responseData: true,
          feedback: true,
          isCorrect: true,
          submittedAt: true,
        },
      });

      // Deduplicate: latest per question_key
      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.questionKey)) continue;
        seen.add(r.questionKey);
        entries.push({
          questionKey: r.questionKey,
          answer: r.responseData,
          feedback: r.feedback,
          isCorrect: r.isCorrect,
          submittedAt: r.submittedAt?.toISOString() ?? null,
        });
      }
    }
    // --- eksplorasi_kontekstual ---
    else if (section === "eksplorasi_kontekstual") {
      const rows = await prisma.$queryRaw<
        Array<{
          question_key: string;
          answer: unknown;
          feedback: string | null;
          is_correct: boolean | null;
          created_at: string;
        }>
      >`
        SELECT question_key, answer, feedback, is_correct, created_at
        FROM eksplorasi_kontekstual
        WHERE student_id = ${studentId}
          AND concept_id = ${concept_id}::concept_type
          AND question_key IS NOT NULL
        ORDER BY question_key ASC, created_at DESC
      `;

      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.question_key)) continue;
        seen.add(r.question_key);
        entries.push({
          questionKey: r.question_key,
          answer: r.answer,
          feedback: r.feedback,
          isCorrect: r.is_correct,
          submittedAt: r.created_at,
        });
      }
    }
    // --- aktivitas_deep_learning ---
    else if (section === "aktivitas_deep_learning") {
      const row = await prisma.aktivitasDeepLearning.findFirst({
        where: { studentId, conceptId: concept_id },
        orderBy: { createdAt: "desc" },
        select: { answer: true, feedback: true, isCorrect: true, createdAt: true },
      });

      if (row) {
        entries.push({
          questionKey: "deep_learning",
          answer: row.answer,
          feedback: row.feedback,
          isCorrect: row.isCorrect,
          submittedAt: row.createdAt?.toISOString() ?? null,
        });
      }
    }
    // --- penjelasan_konsep (read-only, no answers) ---
    else if (section === "penjelasan_konsep") {
      entries = [];
    }
    // --- contoh_soal ---
    else if (section === "contoh_soal") {
      const rows = await prisma.$queryRaw<
        Array<{
          question_key: string;
          answer: unknown;
          is_correct: boolean;
          submitted_at: string;
        }>
      >`
        SELECT question_key, answer, is_correct, submitted_at
        FROM contoh_soal_bertahap_attempts
        WHERE student_id = ${studentId}
          AND concept_id = ${concept_id}
          AND is_correct = true
        ORDER BY question_key ASC, submitted_at DESC
      `;

      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.question_key)) continue;
        seen.add(r.question_key);
        entries.push({
          questionKey: r.question_key,
          answer: r.answer,
          feedback: null, // contoh_soal table doesn't store AI feedback
          isCorrect: r.is_correct,
          submittedAt: r.submitted_at,
        });
      }
    }
    // --- refleksi_mini ---
    else if (section === "refleksi_mini") {
      const rows = await prisma.refleksiMini.findMany({
        where: { studentId, conceptId: concept_id },
        orderBy: [{ questionKey: "asc" }, { createdAt: "desc" }],
        select: {
          questionKey: true,
          answer: true,
          feedback: true,
          isCorrect: true,
          createdAt: true,
        },
      });

      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.questionKey)) continue;
        seen.add(r.questionKey);
        entries.push({
          questionKey: r.questionKey,
          answer: r.answer,
          feedback: r.feedback,
          isCorrect: r.isCorrect,
          submittedAt: r.createdAt?.toISOString() ?? null,
        });
      }
    }
    // --- unknown section ---
    else {
      return NextResponse.json(
        { error: `Unknown section: ${section}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      section,
      conceptId: concept_id,
      entries,
    });
  } catch (error) {
    console.error("[GET /api/student-section-status/jawaban] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
