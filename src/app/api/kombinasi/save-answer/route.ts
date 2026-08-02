/**
 * Kombinasi — Save Answer API
 *
 * POST /api/kombinasi/save-answer
 * Body: {
 *   section: string,
 *   questionKey: string,
 *   answer: any,
 *   soal?: string,          // Required for AI-feedback questions
 *   isFinalInSection?: boolean  // If true and correct → trigger section completion
 * }
 *
 * Response: { isCorrect: boolean, feedback: string | null }
 *
 * Handles all question types in the Kombinasi material:
 * - Eksplorasi Kontekstual (rule-based)
 * - Aktivitas Deep Learning (rule-based)
 * - Contoh Soal Bertahap (rule-based + AI for text reasoning)
 * - Mengapa Corner (AI feedback)
 * - Refleksi Mini (AI feedback)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";
import {
  completeSectionAndUnlockNext,
  isLastQuestionInSection,
} from "@/lib/data/student-section-status";
import { AnswerClassificationPrompt } from "@/lib/ai/client";
import { KOMBINASI_AI_GROUND_TRUTH } from "@/lib/ai/ground-truths";

const CONCEPT_ID = "kombinasi";

// ═══════════════════════════════════════════════════════════════
// Answer Keys (Rule-Based Validation)
// ═══════════════════════════════════════════════════════════════

/** Eksplorasi Kontekstual — simple correctness checks */
function checkEksplorasiKontekstual(questionKey: string, answer: unknown): { isCorrect: boolean; feedback: string } {
  if (questionKey === "tim_basket_urutan") {
    const isCorrect = String(answer).trim() === "Tidak";
    return {
      isCorrect,
      feedback: isCorrect
        ? "Tepat! Kedua kelompok itu tim yang sama, hanya urutan penyebutannya berbeda. Jadi, dalam konteks ini, urutan tidak penting."
        : "Belum tepat. Coba pikirkan: apakah tim {Ari, Budi, Cici, Deni, Eka} benar-benar berbeda dengan tim {Eka, Deni, Cici, Budi, Ari}?",
    };
  }
  return { isCorrect: false, feedback: "Jawaban belum dikenali." };
}

/** Aktivitas Deep Learning — answer keys for each step */
function checkAktivitasDeepLearning(questionKey: string, answer: unknown): { isCorrect: boolean; feedback: string } {
  const ans = answer as Record<string, string>;

  if (questionKey === "step_1") {
    // Check permutation table (rows 8-12)
    const expected: Record<string, string> = {
      p8: "CB",
      p9a: "C", p9b: "D", p9c: "CD",
      p10a: "D", p10b: "A", p10c: "DA",
      p11a: "D", p11b: "B", p11c: "DB",
      p12a: "D", p12b: "C", p12c: "DC",
    };
    const allCorrect = Object.entries(expected).every(([k, v]) => (ans[k] ?? "").trim().toUpperCase() === v.toUpperCase());
    return {
      isCorrect: allCorrect,
      feedback: allCorrect
        ? "Langkah 1 benar! Semua susunan sudah terisi dengan tepat."
        : "Ada beberapa susunan yang belum tepat. Periksa kembali pola pengisiannya.",
    };
  }

  if (questionKey === "step_2") {
    // Check group names (any reasonable text accepted)
    const required = ["g1", "g2", "g3", "g4"];
    const allFilled = required.every((k) => (ans[k] ?? "").trim() !== "");
    return {
      isCorrect: allFilled,
      feedback: allFilled
        ? "Langkah 2 sudah diisi. Lanjutkan ke langkah 3!"
        : "Lengkapi semua pengelompokan terlebih dahulu.",
    };
  }

  if (questionKey === "step_3") {
    const totalGroups = (ans["totalGroups"] ?? "").trim();
    const verification = (ans["verification"] ?? "").trim();
    const correct = totalGroups === "6" && verification === "6";
    return {
      isCorrect: correct,
      feedback: correct
        ? "Tepat! Total ada 6 kelompok berbeda. Hubungannya: Kombinasi = Permutasi / Faktorial urutan."
        : "Belum tepat. 12 susunan dibagi 2! = 2 menghasilkan berapa kelompok berbeda?",
    };
  }

  return { isCorrect: false, feedback: "Langkah tidak dikenali." };
}

/** Contoh Soal Bertahap — numeric answer keys */
function checkContohSoal(questionKey: string, answer: unknown): { isCorrect: boolean; feedback: string } {
  const ans = answer as Record<string, string>;

  if (questionKey === "c1") {
    const correct = (ans["c1"] ?? "").trim() === "56";
    return {
      isCorrect: correct,
      feedback: correct
        ? "Tepat! C(8,3) = 56 pilihan."
        : "Coba hitung lagi: 8×7×6 / 3×2×1 = 336/6 = ?",
    };
  }

  if (questionKey === "c2") {
    const a = (ans["c2a"] ?? "").trim();
    const b = (ans["c2b"] ?? "").trim();
    const hasil = (ans["c2hasil"] ?? "").trim();
    const correct = a === "10" && b === "9" && hasil === "45";
    return {
      isCorrect: correct,
      feedback: correct
        ? "Tepat! C(10,2) = 10×9/2 = 45 jabat tangan."
        : "Perhatikan: C(10,2) = 10!/(2!·8!) = 10×9/(2×1) = ?",
    };
  }

  if (questionKey === "c3") {
    // Check numeric answers
    const expected: Record<string, string> = {
      c3a: "60", c3b: "20", c3c: "1",
      c3d: "60", c3e: "20", c3f: "1",
      c3Total: "81",
    };
    const allCorrect = Object.entries(expected).every(([k, v]) => (ans[k] ?? "").trim() === v);
    return {
      isCorrect: allCorrect,
      feedback: allCorrect
        ? "Tepat! Total 81 tim yang memenuhi syarat minimal 2 perempuan."
        : "Ada perhitungan yang belum tepat. C(4,2)×C(5,2)=6×10=60, C(4,3)×C(5,1)=4×5=20, C(4,4)×C(5,0)=1×1=1. Jumlahkan semua.",
    };
  }

  // c3_reason: AI-only — should not reach here via rule-based
  return { isCorrect: false, feedback: "Soal tidak dikenali." };
}

// ═══════════════════════════════════════════════════════════════
// AI Feedback Helpers
// ═══════════════════════════════════════════════════════════════

const AI_FEEDBACK_QUESTIONS = new Set([
  "c3_reason",       // Contoh 3: "Kenapa dikali? Bukan ditambah?"
  "mengapa_dikali_ditambah",  // Mengapa Corner
  "refleksi_1", "refleksi_2", "refleksi_3", "refleksi_4",  // Refleksi Mini
]);

function needsAiFeedback(section: string, questionKey: string): boolean {
  // All refleksi_mini questions use AI
  if (section === "refleksi_mini") return true;
  // mengapa_corner uses AI
  if (section === "mengapa_corner") return true;
  // c3_reason uses AI
  if (questionKey === "c3_reason") return true;
  return false;
}

async function getAiFeedback(
  soal: string,
  jawaban: string,
  questionKey: string
): Promise<{ isCorrect: boolean; feedback: string }> {
  try {
    const groundTruth = KOMBINASI_AI_GROUND_TRUTH[questionKey] ?? soal;
    const result = await AnswerClassificationPrompt(soal, groundTruth, jawaban);
    return {
      isCorrect: result.isCorrect,
      feedback: result.feedback ?? "Jawaban sudah dicatat. Simak feedback dari Kombi ya!",
    };
  } catch (error) {
    console.error("[save-answer] AI feedback error:", error);
    return {
      isCorrect: true, // For open-ended, don't block progress on AI error
      feedback: "Jawabanmu sudah tercatat! Sayangnya Kombi sedang sibuk, jadi feedback-nya menyusul ya.",
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// POST Handler
// ═══════════════════════════════════════════════════════════════

export async function POST(req: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────
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

    // ── Parse body ────────────────────────────────────────────
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.section !== "string" ||
      typeof body.questionKey !== "string" ||
      body.answer === undefined
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      section,
      questionKey,
      answer,
      soal = "",
      isFinalInSection = false,
      action = "save", // "save" | "complete"
    } = body as {
      section: string;
      questionKey: string;
      answer: unknown;
      soal?: string;
      isFinalInSection?: boolean;
      action?: string;
    };

    // ── Handle "complete" action for read-only sections ────────
    if (action === "complete") {
      await completeSectionAndUnlockNext(student.id, CONCEPT_ID, section);
      return NextResponse.json({ isCorrect: true, feedback: null });
    }

    const validSections = [
      "eksplorasi_kontekstual",
      "aktivitas_deep_learning",
      "contoh_soal",
      "mengapa_corner",
      "refleksi_mini",
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // ── Evaluate answer ───────────────────────────────────────
    let isCorrect: boolean;
    let feedback: string;

    if (needsAiFeedback(section, questionKey)) {
      const answerStr = typeof answer === "string" ? answer : JSON.stringify(answer);
      const soalStr = soal || "Pertanyaan Kombinasi";
      const aiResult = await getAiFeedback(soalStr, answerStr, questionKey);
      isCorrect = aiResult.isCorrect;
      feedback = aiResult.feedback;
    } else {
      // Rule-based evaluation
      let result: { isCorrect: boolean; feedback: string };
      switch (section) {
        case "eksplorasi_kontekstual":
          result = checkEksplorasiKontekstual(questionKey, answer);
          break;
        case "aktivitas_deep_learning":
          result = checkAktivitasDeepLearning(questionKey, answer);
          break;
        case "contoh_soal":
          result = checkContohSoal(questionKey, answer);
          break;
        default:
          result = { isCorrect: false, feedback: "Tipe soal tidak dikenali." };
      }
      isCorrect = result.isCorrect;
      feedback = result.feedback;
    }

    // ── Save to DB (in transaction with optional section completion) ──
    await prisma.$transaction(async (tx) => {
      const now = toGMT7SQL();
      // For jsonb columns, always JSON.stringify (even strings → "\"Ya\"")
      const answerJsonb = JSON.stringify(answer);
      // For text columns, just the raw string
      const answerText = typeof answer === "string" ? answer : JSON.stringify(answer);

      // Save to appropriate table based on section
      switch (section) {
        case "eksplorasi_kontekstual":
          await tx.$executeRawUnsafe(
            `INSERT INTO eksplorasi_kontekstual (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
             VALUES ($1, $2::concept_type, $3, $4::jsonb, $5, $6, $7::timestamptz)
             ON CONFLICT DO NOTHING`,
            student.id, CONCEPT_ID, questionKey, answerJsonb, feedback, isCorrect, now
          );
          break;

        case "aktivitas_deep_learning":
          // Embed questionKey in the JSON so the jawaban API can identify each step
          const dlAnswer = { question_key: questionKey, ...(typeof answer === "object" && !Array.isArray(answer) ? answer : { value: answer }) };
          await tx.$executeRawUnsafe(
            `INSERT INTO aktivitas_deep_learning (student_id, concept_id, answer, feedback, is_correct, created_at)
             VALUES ($1, $2::concept_type, $3::jsonb, $4, $5, $6::timestamptz)
             ON CONFLICT DO NOTHING`,
            student.id, CONCEPT_ID, JSON.stringify(dlAnswer), feedback, isCorrect, now
          );
          break;

        case "contoh_soal":
          await tx.$executeRawUnsafe(
            `INSERT INTO contoh_soal_bertahap_attempts (student_id, concept_id, question_key, difficulty_level, order_index, attempt_number, answer, is_correct, submitted_at)
             VALUES ($1, $2::concept_type, $3, 'mudah', 1,
               (SELECT COALESCE(MAX(attempt_number), 0) + 1 FROM contoh_soal_bertahap_attempts WHERE student_id = $1 AND question_key = $3),
               $4::jsonb, $5, $6::timestamptz)
             RETURNING attempt_number`,
            student.id, CONCEPT_ID, questionKey, answerJsonb, isCorrect, now
          );
          break;

        case "mengapa_corner":
          // Use refleksi_mini table for mengapa_corner (same structure — answer is text)
          await tx.$executeRawUnsafe(
            `INSERT INTO refleksi_mini (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
             VALUES ($1, $2::concept_type, $3, $4, $5, $6, $7::timestamptz)
             ON CONFLICT DO NOTHING`,
            student.id, CONCEPT_ID, questionKey, answerText, feedback, isCorrect, now
          );
          break;

        case "refleksi_mini":
          await tx.$executeRawUnsafe(
            `INSERT INTO refleksi_mini (student_id, concept_id, question_key, answer, feedback, is_correct, created_at)
             VALUES ($1, $2::concept_type, $3, $4, $5, $6, $7::timestamptz)
             ON CONFLICT DO NOTHING`,
            student.id, CONCEPT_ID, questionKey, answerText, feedback, isCorrect, now
          );
          break;
      }

      // ── Trigger 1: Section completion if last question is correct ──
      if (isCorrect && isFinalInSection) {
        await completeSectionAndUnlockNext(student.id, CONCEPT_ID, section, tx);
      }
    });

    return NextResponse.json({ isCorrect, feedback });
  } catch (error) {
    console.error("[POST /api/kombinasi/save-answer] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
