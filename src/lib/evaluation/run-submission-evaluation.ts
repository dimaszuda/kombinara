/**
 * Core evaluasi Asesmen Formatif — dipakai oleh API route (live) dan
 * script re-grading (`scripts/re-grade-faktorial.ts`).
 *
 * LOGIKA DI SINI HARUS IDENTIK dengan alur evaluasi sebelumnya di
 * `src/app/api/asesmen-formatif/evaluate/route.ts`.
 */

import {
  AsesmenFormatifEvaluateBatchPrompt,
  type AsesmenFormatifEvalItemInput,
} from "../ai/client";
import {
  getSoalData,
  LEVEL_MAP,
  SCORE_WEIGHTS,
  perPartLastNumberMatch,
  perPartMarkMatch,
  perPartSymbolicMatch,
  faktorialNumericMatch,
  faktorialSoal5Match,
  FAKTORIAL_SOAL4_KEY,
  generateOverallFeedback,
} from "./soal-data";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SubmittedAnswer {
  question_number: number;
  cara_mengerjakan: string;
  jawaban_akhir: string;
}

export interface EvaluationOutcome {
  totalScore: number;
  perQuestionResults: Record<string, unknown>[];
  aiFeedback: string;
}

// ─── Soal 4 (faktorial) — healing format "| | |" yang terkorupsi ────────────────

/**
 * Bersihkan jawaban tabel benar/salah faktorial soal 4 dari bug karakter "|"
 * yang bocor & berlipat (format lama: "a) ❌ | | | | alasan").
 *
 * Aturan per baris:
 * - "a) ✅ | | | alasan" → "a) ✅ | alasan"  (collapse semua run "|")
 * - "a) Benar | alasan"  → "a) ✅ | alasan"  (legacy text → emoji)
 * - "a) alasan"          → "a) alasan"       (tanpa B/S, tidak diubah)
 *
 * Idempotent: data yang sudah bersih tidak berubah.
 */
export function healSoal4TableText(jawabanAkhir: string): string {
  return jawabanAkhir
    .split("\n")
    .map((line) => {
      const m = line.match(/^([a-d])\)\s*(.*)$/);
      if (!m) return line;
      const key = m[1];
      const val = m[2].trim();

      // Format emoji: ✅/❌ di awal baris.
      if (val.startsWith("✅") || val.startsWith("❌")) {
        const emoji = val.slice(0, 1);
        const rest = val
          .slice(1)
          .trim()
          .replace(/^(?:\s*\|)+/, "")
          .trim();
        return rest ? `${key}) ${emoji} | ${rest}` : `${key}) ${emoji}`;
      }

      // Format legacy "Benar"/"Salah" — hanya jika di AWAL nilai.
      const legacy = val.match(/^(Benar|Salah)\b\s*(?:\|\s*)?(.*)$/i);
      if (legacy) {
        const emoji = /^benar$/i.test(legacy[1]) ? "✅" : "❌";
        const rest = (legacy[2] ?? "")
          .trim()
          .replace(/^(?:\s*\|)+/, "")
          .trim();
        return `${key}) ${emoji} | ${rest}`;
      }

      // Tanpa B/S: collapse run "|" di awal alasan (korupsi lama).
      return `${key}) ${val.replace(/^(?:\s*\|)+/, "").trim()}`;
    })
    .join("\n");
}

// ─── Soal 4 faktorial — FULL RULE-BASED (tanpa AI) ────────────────────────────

const SOAL4_KEYS = ["a", "b", "c", "d"];

/** Ekstrak pilihan ✅/❌ per baris dari jawaban tabel soal 4 (format baru/lama). */
function parseSoal4Marks(jawabanAkhir: string): Array<"✅" | "❌" | ""> {
  return SOAL4_KEYS.map((key) => {
    const match = jawabanAkhir.match(new RegExp(`^${key}\\)\\s*(.+)$`, "m"));
    if (!match) return "";
    const val = match[1].trim();
    const emoji = val.match(/[✅❌]/);
    if (emoji) return emoji[0] as "✅" | "❌";
    const legacy = val.match(/^(Benar|Salah)\b/i);
    if (legacy) return /^benar$/i.test(legacy[1]) ? "✅" : "❌";
    return "";
  });
}

/**
 * Nilai soal 4 faktorial secara deterministik:
 * benar per baris → skor proporsional (n/4 × 10). Tanpa panggilan AI.
 */
function gradeFaktorialSoal4(jawabanAkhir: string): Record<string, unknown> {
  const marks = parseSoal4Marks(jawabanAkhir);
  const answeredAny = marks.some((m) => m !== "");
  let correct = 0;
  for (let i = 0; i < marks.length; i++) {
    if (marks[i] === FAKTORIAL_SOAL4_KEY[i]) correct++;
  }
  const allCorrect = correct === marks.length;

  // Soal 4 level menengah: proses 70% - jawaban akhir 30%.
  const weights = SCORE_WEIGHTS.menengah;
  const fraction = correct / marks.length;
  const processScaled = Math.round(fraction * weights.process * 100) / 100;
  const finalAnswer = Math.round(fraction * weights.final * 100) / 100;
  const totalScore = Math.round(fraction * 10 * 100) / 100;
  const componentScore = Math.round(fraction * 3);

  if (!answeredAny) {
    return {
      question_number: 4,
      step_by_step: {
        identifikasi_kondisi: { score: 0 },
        pemilihan_rumus: { score: 0 },
        eksekusi_perhitungan: { score: 0 },
        justifikasi: { score: 0 },
      },
      process_raw_score: 0,
      process_scaled_score: 0,
      final_answer_score: 0,
      total_score: 0,
      guardrail_applied: null,
      mistake_category: "tidak_diisi",
      mistake_detail: "Siswa tidak mengisi jawaban untuk soal ini.",
      feedback: "Kamu tidak mengisi jawaban untuk soal ini. Coba lagi di attempt berikutnya ya!",
    };
  }

  return {
    question_number: 4,
    step_by_step: {
      identifikasi_kondisi: { score: componentScore },
      pemilihan_rumus: { score: componentScore },
      eksekusi_perhitungan: { score: componentScore },
      justifikasi: { score: componentScore },
    },
    process_raw_score: correct * 3,
    process_scaled_score: processScaled,
    final_answer_score: finalAnswer,
    total_score: totalScore,
    guardrail_applied: null,
    mistake_category: allCorrect ? null : "konsep",
    mistake_detail: allCorrect
      ? "Tidak ada kesalahan ditemukan"
      : `${marks.length - correct} dari ${marks.length} penilaian benar/salah masih keliru.`,
    feedback: allCorrect
      ? "Keren! Kamu menilai semua pernyataan benar/salah dengan tepat. Kamu paham sifat-sifat faktorial, termasuk definisi 0! dan hubungan n! = n × (n-1)! 👏"
      : `Kamu menjawab ${correct} dari ${marks.length} pernyataan dengan tepat. Pelajari lagi sifat-sifat faktorial: definisi 0!, sifat rekursif n! = n × (n-1)!, dan cara menyederhanakan pembagian faktorial.`,
  };
}

// ─── Core evaluation ────────────────────────────────────────────────────────────

/** Soal yang menunggu evaluasi AI (dikirim dalam satu panggilan batch). */
interface PendingAIEval {
  index: number;
  questionNumber: number;
  levelLabel: string;
  isJawabanAkhirTrue: boolean;
  input: AsesmenFormatifEvalItemInput;
}

export async function evaluateAnswers(
  answers: SubmittedAnswer[],
  moduleSlug: string
): Promise<EvaluationOutcome> {
  const soalData = getSoalData(moduleSlug);

  // Evaluate each question.
  // Soal rule-based langsung dinilai di sini; soal yang butuh AI dikumpulkan
  // dulu, lalu dikirim dalam SATU panggilan batch (hemat system prompt).
  const perQuestionResults: (Record<string, unknown> | null)[] = [];
  const pendingAI: PendingAIEval[] = [];
  let totalScoreSum = 0;

  for (const answer of answers) {
    const soalRef = soalData.find((s) => s.question_number === answer.question_number);
    if (!soalRef) continue;

    const caraHitungRaw = answer.cara_mengerjakan?.trim() ?? "";
    let jawabanAkhirRaw = answer.jawaban_akhir?.trim() ?? "";

    // Soal 4 faktorial (tabel benar/salah) TIDAK punya kolom "Cara Hitung"
    // dan sejak refactor UI dinilai FULL RULE-BASED di bawah — heal dulu
    // format lama yang mungkin terkorupsi karakter "|" sebelum dinilai.
    const isSoal4Faktorial = moduleSlug === "faktorial" && answer.question_number === 4;
    if (isSoal4Faktorial && jawabanAkhirRaw.length > 0) {
      // Heal format "| | |" yang terkorupsi sebelum dinilai.
      jawabanAkhirRaw = healSoal4TableText(jawabanAkhirRaw).trim();
    }
    const caraEffective =
      isSoal4Faktorial && caraHitungRaw.length === 0 ? jawabanAkhirRaw : caraHitungRaw;

    // Kompatibilitas submission LAMA soal 7 faktorial (dulu hanya ada kotak
    // cara hitung) — teks cara sekaligus menjadi bahan penilaian AI.
    const isSoal7Faktorial = moduleSlug === "faktorial" && answer.question_number === 7;

    // ── Unanswered question: skip AI, langsung skor 0 ────────────────
    const isUnanswered = caraHitungRaw.length === 0 && jawabanAkhirRaw.length === 0;

    if (isUnanswered) {
      perQuestionResults.push({
        question_number: answer.question_number,
        step_by_step: {
          identifikasi_kondisi: { score: 0 },
          pemilihan_rumus: { score: 0 },
          eksekusi_perhitungan: { score: 0 },
          justifikasi: { score: 0 },
        },
        process_raw_score: 0,
        process_scaled_score: 0,
        final_answer_score: 0,
        total_score: 0,
        guardrail_applied: null,
        mistake_category: "tidak_diisi",
        mistake_detail: "Siswa tidak mengisi jawaban untuk soal ini.",
        feedback: "Kamu tidak mengisi jawaban untuk soal ini. Coba lagi di attempt berikutnya ya!",
      });
      // totalScoreSum stays 0 for this question
      continue;
    }

    // ── Soal 4 faktorial: FULL RULE-BASED (tanpa AI) ───────────────
    if (isSoal4Faktorial) {
      const result = gradeFaktorialSoal4(jawabanAkhirRaw);
      perQuestionResults.push(result);
      totalScoreSum += result.total_score as number;
      continue;
    }

    // ── Compute isJawabanAkhirTrue early (before cara_hitung check) ─
    let jawabanAkhirClean = jawabanAkhirRaw || "(tidak diisi)";
    if (isSoal7Faktorial && jawabanAkhirRaw.length === 0 && caraHitungRaw.length > 0) {
      // Soal 7 tidak mengumpulkan jawaban akhir terpisah — teks cara
      // dikirim ke AI sebagai jawaban akhir untuk dinilai.
      jawabanAkhirClean = caraHitungRaw;
    }
    const normalizedJawaban = jawabanAkhirClean.replace(/[.,\s]/g, "");
    const normalizedGT = String(soalRef.answer).replace(/[.,\s]/g, "");

    // Exact match after normalization (handles dots, commas, spaces)
    let isJawabanAkhirTrue =
      normalizedJawaban === normalizedGT ||
      jawabanAkhirClean === String(soalRef.answer);

    // Fallback 1: per-part comparison for multi-line answers (e.g. faktorial).
    // Siswa menulis "a) 120\nb) 30\nc) 12\nd) 4" sedangkan kunci memuat
    // langkah hitung "a) 5! = 120\nb) 3!+4! = 6+24 = 30\n...".
    // Bandingkan angka TERAKHIR di tiap baris kunci dengan jawaban siswa.
    if (!isJawabanAkhirTrue) {
      if (perPartLastNumberMatch(jawabanAkhirClean, String(soalRef.answer))) {
        isJawabanAkhirTrue = true;
      }
    }

    // Fallback 1b: per-part mark comparison untuk soal benar/salah
    // (contoh: faktorial soal 4 — bandingkan ✅/❌ per baris dengan kunci).
    if (!isJawabanAkhirTrue) {
      if (perPartMarkMatch(jawabanAkhirClean, String(soalRef.answer))) {
        isJawabanAkhirTrue = true;
      }
    }

    // Fallback 1c: per-part symbolic comparison untuk jawaban aljabar
    // (contoh: faktorial soal 5 — "(n+2)x(n+1)" ≡ "(n+2)(n+1)",
    // "nx(n-1)x(n-2)/3!" ≡ C(n,3)).
    if (!isJawabanAkhirTrue) {
      if (perPartSymbolicMatch(jawabanAkhirClean, String(soalRef.answer))) {
        isJawabanAkhirTrue = true;
      }
    }

    // Fallback 1c2: faktorial soal 5 — jawaban BERTAHAP multi-baris
    // ("a. (n+2)!/n! = ... = (n+2)(n+1)" dst). Yang dibandingkan adalah
    // hasil akhir tiap bagian, jadi langkah pengerjaan tidak menggagalkan
    // verifikasi dan jawaban benar tidak perlu bergantung pada AI.
    if (!isJawabanAkhirTrue && moduleSlug === "faktorial" && answer.question_number === 5) {
      if (faktorialSoal5Match(jawabanAkhirClean)) {
        isJawabanAkhirTrue = true;
      }
    }

    // Fallback 1d: faktorial — verifikasi NILAI numerik per sub-bagian
    // dengan parser ekspresi aman. Menerima bentuk setara seperti "42",
    // "7×6", atau "7×6×5!/5!" — semuanya benar secara matematis.
    if (!isJawabanAkhirTrue) {
      if (faktorialNumericMatch(jawabanAkhirClean, answer.question_number)) {
        isJawabanAkhirTrue = true;
      }
    }

    // Fallback 2: pure numeric comparison (strips ALL non-digit chars)
    // Catches cases like "325 cara" vs "325" — siswa menambahkan teks
    // setelah angka yang sebenarnya sudah benar.
    if (!isJawabanAkhirTrue) {
      const extractDigits = (s: string) => s.replace(/\D/g, "");
      const jawabanDigits = extractDigits(jawabanAkhirClean);
      const gtDigits = extractDigits(String(soalRef.answer));
      if (jawabanDigits.length > 0 && jawabanDigits === gtDigits) {
        isJawabanAkhirTrue = true;
      }
    }

    // ── Cara hitung terlalu singkat (< 7 karakter) ────────────────
    // Hanya cek cara_hitung (proses), BUKAN jawaban_akhir.
    // Jawaban akhir pendek seperti "120" atau "56" itu normal.
    // Faktorial: UI baru TIDAK mengumpulkan cara hitung → skip cek ini.
    const caraLength = caraEffective.length;

    if (moduleSlug !== "faktorial" && caraLength < 7) {
      if (isJawabanAkhirTrue) {
        // Jawaban akhir benar tapi proses terlalu singkat → 7/10
        perQuestionResults.push({
          question_number: answer.question_number,
          step_by_step: {
            identifikasi_kondisi: { score: 0 },
            pemilihan_rumus: { score: 0 },
            eksekusi_perhitungan: { score: 0 },
            justifikasi: { score: 0 },
          },
          process_raw_score: 0,
          process_scaled_score: 0,
          final_answer_score: 7,
          total_score: 7,
          guardrail_applied: null,
          mistake_category: null,
          mistake_detail: "Jawaban akhir benar, tetapi cara hitung terlalu singkat untuk dinilai prosesnya.",
          feedback: "Jawaban akhirmu benar, tapi cara hitungnya terlalu singkat. Lain kali tuliskan langkah-langkah pengerjaan yang lengkap ya biar Kombi bisa nilai proses berpikirmu juga! 😊",
        });
        totalScoreSum += 7;
      } else {
        // Jawaban salah & proses singkat → 0
        perQuestionResults.push({
          question_number: answer.question_number,
          step_by_step: {
            identifikasi_kondisi: { score: 0 },
            pemilihan_rumus: { score: 0 },
            eksekusi_perhitungan: { score: 0 },
            justifikasi: { score: 0 },
          },
          process_raw_score: 0,
          process_scaled_score: 0,
          final_answer_score: 0,
          total_score: 0,
          guardrail_applied: null,
          mistake_category: "tidak_memadai",
          mistake_detail: "Cara hitung terlalu singkat untuk dievaluasi.",
          feedback: "Cara hitungmu terlalu singkat untuk bisa dinilai. Coba tuliskan langkah-langkah pengerjaan yang lebih lengkap ya!",
        });
      }
      continue;
    }

    let caraHitung = caraEffective || "(tidak diisi)";
    const jawabanAkhir = jawabanAkhirClean;
    if (moduleSlug === "faktorial") {
      // UI baru faktorial TIDAK mengumpulkan cara hitung terpisah — teks
      // jawaban akhir menjadi satu-satunya bukti yang dinilai AI.
      caraHitung = jawabanAkhirClean || "(tidak diisi)";
    }

    // ── Kumpulkan untuk evaluasi AI BATCH (satu panggilan per submission) ──
    // AI akan menilai proses secara detail. Prompt sudah dijamin:
    // jika is_jawaban_akhir_true = TRUE → final_answer_score HARUS skor penuh,
    // dan jika proses juga sesuai ground truth → total_score WAJIB 10/10.
    const levelLabel = LEVEL_MAP[soalRef.level] ?? soalRef.level;

    // Placeholder menjaga urutan hasil sama dengan urutan jawaban siswa.
    const index = perQuestionResults.length;
    perQuestionResults.push(null);

    pendingAI.push({
      index,
      questionNumber: answer.question_number,
      levelLabel,
      isJawabanAkhirTrue,
      input: {
        soal: soalRef.question,
        levelSoal: levelLabel,
        caraHitung,
        jawabanAkhir,
        isJawabanAkhirTrue,
        caraGroundTruth: soalRef.cara,
      },
    });
  }

  // ── SATU panggilan AI untuk semua soal yang butuh evaluasi ────────
  if (pendingAI.length > 0) {
    const batchResults = await AsesmenFormatifEvaluateBatchPrompt(
      pendingAI.map((p) => p.input)
    );

    for (let i = 0; i < pendingAI.length; i++) {
      const p = pendingAI[i];
      const result = batchResults[i];
      if (!result) continue; // tidak mungkin terjadi (client menjamin panjang), jaga-jaga

      // ── FAKTORIAL: grading deterministik ─────────────────────────────
      // AI sering salah aritmatika skor: contoh nyata di DB — process_raw
      // sempurna 12/12 tapi final_answer=0 sehingga siswa benar hanya dapat
      // 6/10, atau process_scaled=8.4 padahal maks 7.
      // Untuk faktorial, skor dihitung ulang di backend secara deterministik:
      //   - proses = raw/12 × bobot proses
      //   - jawaban akhir terverifikasi mesin → skor penuh sesuai bobot
      //     (guardrail anti-menebak tetap berlaku)
      //   - jawaban akhir tidak terverifikasi mesin (teks/aljabar) → pakai
      //     penilaian AI, dibatasi maksimum bobot
      //   - total = proses + jawaban akhir
      let finalResult = result;
      if (moduleSlug === "faktorial") {
        const weights = SCORE_WEIGHTS[p.levelLabel] ?? { process: 6, final: 4 };
        let processScaled: number;
        let finalAnswer: number;
        let guardrail = result.guardrail_applied;
        if (p.isJawabanAkhirTrue) {
          // Jawaban akhir terverifikasi mesin → skor penuh. UI baru tidak
          // mengumpulkan cara hitung terpisah, jadi tidak ada komponen proses
          // yang bisa dinilai — dan guardrail anti-menebak tidak relevan.
          processScaled = weights.process;
          finalAnswer = weights.final;
          guardrail = null;
        } else {
          // Jawaban teks/aljabar yang tidak bisa diverifikasi mesin —
          // percaya penilaian AI tapi jangan sampai melebihi bobot.
          processScaled = Math.min(Math.max(0, result.process_scaled_score), weights.process);
          finalAnswer = Math.min(Math.max(0, result.final_answer_score), weights.final);
        }
        const total = Math.min(10, Math.round((processScaled + finalAnswer) * 100) / 100);

        finalResult = {
          ...result,
          process_scaled_score: processScaled,
          final_answer_score: finalAnswer,
          total_score: total,
          guardrail_applied: guardrail,
        };
      }

      perQuestionResults[p.index] = {
        question_number: p.questionNumber,
        ...finalResult,
      };

      // Clamp per-question total_score to 0-10 (safety net)
      totalScoreSum += Math.min(10, Math.max(0, finalResult.total_score));
    }
  }

  // Semua placeholder harusnya sudah terisi; filter defensif untuk null.
  const finalResults = perQuestionResults.filter(
    (r): r is Record<string, unknown> => r !== null
  );

  // Compute overall score (average, scaled to 100), clamped to 0-100
  const overallScore = finalResults.length > 0
    ? Math.min(100, Math.max(0, Math.round((totalScoreSum / (finalResults.length * 10)) * 100)))
    : 0;

  // Generate overall AI feedback
  const aiFeedback = generateOverallFeedback(finalResults, overallScore, moduleSlug);

  return {
    totalScore: overallScore,
    perQuestionResults: finalResults,
    aiFeedback,
  };
}
