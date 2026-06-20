/**
 * Asesmen Diagnostik — Answer Key & Grading Engine
 *
 * Scoring rule: per nomor, SEMUA sub-jawaban harus benar.
 * Jika salah satu sub saja salah → nomor dianggap salah.
 * Passing threshold: 7/10 benar (70%).
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type SubAnswerType = "numeric" | "radio" | "text";

export interface SubAnswerKey {
  type: SubAnswerType;
  /** Untuk numeric: angka yang diharapkan. Untuk radio/text: string accepted (case-insensitive, trimmed). */
  expected: string | number;
  /**
   * Untuk text: daftar jawaban alternatif yang juga diterima.
   * Untuk radio: hanya "ya" / "tidak".
   * Untuk numeric: tidak digunakan.
   */
  alternatives?: string[];
}

export interface QuestionKey {
  number: number;
  subQuestions: SubAnswerKey[];
}

export interface StudentAnswers {
  /** Key: "nomor-subIndex", contoh "1-0", "1-1", "1-2" */
  [key: string]: string;
}

export interface QuestionResult {
  number: number;
  correct: boolean;
  details: { subIndex: number; correct: boolean }[];
}

export interface GradingResult {
  /** Total nomor benar */
  correctCount: number;
  /** Total nomor */
  totalQuestions: number;
  /** Apakah lulus (≥ 7/10) */
  isPass: boolean;
  /** Skor dalam persen */
  score: number;
  /** Detail per-nomor */
  questions: QuestionResult[];
  /** 
   * Feedback tindak lanjut untuk siswa yang belum lulus.
   * null jika lulus atau tidak ada rekomendasi khusus.
   */
  feedback: string | null;
}

// ═══════════════════════════════════════════════════════════════
// Answer Key — 10 Questions
// ═══════════════════════════════════════════════════════════════

export const ANSWER_KEY: QuestionKey[] = [
  // ─── Nomor 1: Perkalian tanpa kalkulator ───
  {
    number: 1,
    subQuestions: [
      { type: "numeric", expected: 120 },                                // 6×5×4
      { type: "numeric", expected: 35 },                                 // (7×6×5)/(3×2×1)
      { type: "numeric", expected: 210 },                                // (10×9×8×7)/(4×3×2×1)
    ],
  },

  // ─── Nomor 2: Menyederhanakan pecahan ───
  {
    number: 2,
    subQuestions: [
      { type: "numeric", expected: 336 },                                // (8×…×1)/(5×…×1) = 8×7×6 = 336
      { type: "numeric", expected: 56 },                                 // (8×7×6×5!)/(5!×3×2×1) = 56
    ],
  },

  // ─── Nomor 3: Mencari nilai n ───
  {
    number: 3,
    subQuestions: [
      { type: "numeric", expected: 5 },                                  // n×(n-1)=20 → n=5
      { type: "numeric", expected: 5 },                                  // n×(n-1)×(n-2)=60 → n=5
    ],
  },

  // ─── Nomor 4: Mencari nilai r ───
  {
    number: 4,
    subQuestions: [
      { type: "numeric", expected: 5 },                                  // n-r=7, n=7 → r=0
    ],
  },

  // ─── Nomor 5: Konsep Himpunan ───
  {
    number: 5,
    subQuestions: [
      { type: "numeric", expected: 5 },                                  // |A| = 5
      {
        type: "text",
        expected: "{}, {a}, {b}, {a,b}",
        alternatives: [
          "{}, {a}, {b}, {a, b}",
          "{ }, {a}, {b}, {a,b}",
          "{ }, {a}, {b}, {a, b}",
          "{},{a},{b},{a,b}",
          "{ },{a},{b},{a,b}",
          "{} {a} {b} {a,b}",
        ],
      },
    ],
  },

  // ─── Nomor 6: Himpunan Sama/Berbeda ───
  {
    number: 6,
    subQuestions: [
      { type: "radio", expected: "sama" },                               // {Ari,Budi} = {Budi,Ari}
      {
        type: "text",
        expected: "himpunan tidak memperhatikan urutan",
        alternatives: [
          "himpunan tidak mementingkan urutan",
          "urutan tidak penting dalam himpunan",
          "urutan tidak berpengaruh pada himpunan",
          "himpunan tidak melihat urutan",
          "pada himpunan urutan tidak diperhatikan",
          "karena himpunan tidak peduli urutan",
          "elemen himpunan tidak berurutan",
          "himpunan bersifat tidak terurut",
        ],
      },
    ],
  },

  // ─── Nomor 7: Tabel Logika "Atau / Dan" ───
  {
    number: 7,
    subQuestions: [
      { type: "numeric", expected: 5 },                                  // 3 jus + 2 susu = 5 pilihan (atau → +)
      { type: "numeric", expected: 12 },                                 // 3 baju × 4 celana = 12 (dan → ×)
      { type: "numeric", expected: 15 },                                 // 5 rute × 3 rute = 15 (dan → ×)
      { type: "text", expected: "+", alternatives: ["plus", "tambah", "penjumlahan", "jumlah"] },    // operasi baris 1: atau → +
      { type: "text", expected: "×", alternatives: ["x", "*", "kali", "perkalian"] },                // operasi baris 2: dan → ×
      { type: "text", expected: "×", alternatives: ["x", "*", "kali", "perkalian"] },                // operasi baris 3: dan → ×
    ],
  },

  // ─── Nomor 8: Pola "Atau" / "Dan" ───
  {
    number: 8,
    subQuestions: [
      {
        type: "text",
        expected: "penjumlahan",
        alternatives: ["tambah", "+", "plus", "dijumlahkan", "dijumlah", "penambahan", "jumlah"],
      },
      {
        type: "text",
        expected: "perkalian",
        alternatives: ["kali", "×", "x", "*", "dikali", "dikalikan", "perkalian", "kalian"],
      },
    ],
  },

  // ─── Nomor 9: Soal Cerita (Permutasi — jabatan) ───
  {
    number: 9,
    subQuestions: [
      { type: "radio", expected: "tidak" },                              // Susunan berbeda karena jabatan berbeda
      {
        type: "text",
        expected: "karena jabatan berbeda sehingga urutan diperhatikan",
        alternatives: [
          "karena jabatan berbeda",
          "jabatan berbeda",
          "karena urutan diperhatikan",
          "karena memperhatikan urutan",
          "urutan penting karena jabatan berbeda",
          "karena ketua dan sekretaris berbeda",
          "posisi berbeda",
          "karena posisi berbeda",
          "karena masing-masing punya jabatan berbeda",
          "karena menggunakan permutasi",
        ],
      },
    ],
  },

  // ─── Nomor 10: Soal Cerita (Kombinasi — perwakilan) ───
  {
    number: 10,
    subQuestions: [
      { type: "radio", expected: "ya" },                                 // Sama karena hanya perwakilan
      {
        type: "text",
        expected: "nomor 9 memperhatikan urutan sedangkan nomor 10 tidak",
        alternatives: [
          "nomor 9 memperhatikan urutan, nomor 10 tidak",
          "nomor 9 permutasi, nomor 10 kombinasi",
          "nomor 9 ada jabatan, nomor 10 tidak",
          "soal 9 tentang jabatan, soal 10 tentang perwakilan",
          "soal 9 urutan penting, soal 10 urutan tidak penting",
          "nomor 9 menggunakan permutasi, nomor 10 menggunakan kombinasi",
          "9 memperhatikan urutan, 10 tidak",
          "perbedaan mendasar adalah ada tidaknya urutan",
          "yang satu memperhatikan urutan, yang satu tidak",
          "soal 9 permutasi karena ada jabatan, soal 10 kombinasi karena hanya perwakilan",
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// Block Definitions
// ═══════════════════════════════════════════════════════════════

/** Mapping blok → nomor soal */
export const BLOCK_MAP: Record<string, number[]> = {
  A: [1, 2],   // Operasi dan Penyederhanaan Bilangan
  B: [3, 4],   // Persamaan Sederhana
  C: [5, 6],   // Konsep Himpunan
  D: [7, 8],   // Logika "Atau / Dan"
  E: [9, 10],  // Membaca Soal Cerita
};

/** Semua blok (kecuali E) untuk pengecekan "mayoritas A-D" */
const BLOCKS_A_TO_D = ["A", "B", "C", "D"] as const;

/**
 * Menghasilkan feedback tindak lanjut berdasarkan hasil grading.
 * Hanya mengembalikan teks "tindak lanjut" — bukan profil hasil atau kondisi.
 *
 * Prioritas aturan:
 * 1. Blok A–D mayoritas salah (≥ 5/8) → pendampingan khusus
 * 2. Blok A atau B BANYAK salah (semua soal di blok tsb salah) → review singkat
 * 3. Blok C atau D BANYAK salah → review mendalam
 * 4. Blok E sempurna → kandidat tutor sebaya
 *
 * "BANYAK salah" dalam satu blok = SEMUA soal di blok tersebut salah.
 */
export function getFeedback(result: GradingResult): string | null {
  const { questions } = result;

  // Helper: apakah suatu soal benar?
  const isCorrect = (qNum: number): boolean => {
    const q = questions.find((q) => q.number === qNum);
    return q?.correct ?? false;
  };

  // Helper: apakah suatu blok SEMUA SALAH?
  const isBlockAllWrong = (block: string): boolean => {
    const nums = BLOCK_MAP[block];
    if (!nums) return false;
    return nums.every((n) => !isCorrect(n));
  };

  // Hitung total benar di Blok A–D
  const totalADCorrect = BLOCKS_A_TO_D.reduce((sum, block) => {
    return sum + BLOCK_MAP[block].filter((n) => isCorrect(n)).length;
  }, 0);
  const totalADQuestions = BLOCKS_A_TO_D.reduce(
    (sum, block) => sum + BLOCK_MAP[block].length,
    0
  ); // = 8

  // Rule 3: Blok A–D mayoritas salah (≥ 5/8 wrong → ≤ 3/8 correct)
  if (totalADCorrect <= totalADQuestions / 2) {
    return "Pertimbangkan pendampingan individual atau kelompok kecil sebelum mengikuti kelas";
  }

  // Rule 1: Blok A atau B semua salah
  if (isBlockAllWrong("A") || isBlockAllWrong("B")) {
    return "Review 10 – 15 menit: cara menyederhanakan pecahan dan pola perkalian berurutan sebelum masuk materi";
  }

  // Rule 2: Blok C atau D semua salah
  if (isBlockAllWrong("C") || isBlockAllWrong("D")) {
    return "Review konsep himpunan dan logika AND/OR dulu karena ini fondasi konseptual kaidah pencacahan";
  }

  // Rule 4: Blok E sempurna (keduanya benar)
  const blockE = BLOCK_MAP["E"];
  if (blockE && blockE.every((n) => isCorrect(n))) {
    return "Tandai sebagai kandidat tutor sebaya atau peserta pengayaan";
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// Grading Logic
// ═══════════════════════════════════════════════════════════════

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseNumeric(s: string): number | null {
  const cleaned = s.trim().replace(/\s+/g, "");
  // Coba parse langsung
  const n = Number(cleaned);
  if (!isNaN(n) && cleaned !== "") return n;
  // Coba evaluasi ekspresi seperti "8*7*6"
  try {
    // Hanya izinkan digit, operator dasar, dan kurung
    if (/^[\d+\-*/().,×x]+$/.test(cleaned)) {
      const normalized = cleaned.replace(/[×x]/g, "*").replace(/,/g, ".");
      const result = Function(`"use strict"; return (${normalized})`)();
      if (typeof result === "number" && !isNaN(result)) return result;
    }
  } catch {
    // tidak valid
  }
  return null;
}

function checkNumeric(studentAnswer: string, expected: number): boolean {
  const parsed = parseNumeric(studentAnswer);
  if (parsed === null) return false;
  return Math.abs(parsed - expected) < 0.001;
}

function checkRadio(studentAnswer: string, expected: string): boolean {
  return normalizeText(studentAnswer) === normalizeText(expected);
}

function checkText(studentAnswer: string, expected: string, alternatives?: string[]): boolean {
  const normalized = normalizeText(studentAnswer);
  const expectedNormalized = normalizeText(expected);
  if (normalized === expectedNormalized) return true;
  if (alternatives) {
    return alternatives.some((alt) => normalizeText(alt) === normalized);
  }
  return false;
}

function checkSubAnswer(studentAnswer: string, key: SubAnswerKey): boolean {
  if (!studentAnswer || studentAnswer.trim() === "") return false;

  switch (key.type) {
    case "numeric":
      return checkNumeric(studentAnswer, key.expected as number);
    case "radio":
      return checkRadio(studentAnswer, key.expected as string);
    case "text":
      return checkText(studentAnswer, key.expected as string, key.alternatives);
    default:
      return false;
  }
}

/**
 * Grade student answers against the answer key.
 * @param answers Flat map: "nomor-subIndex" → answer string
 * @returns GradingResult with isPass, per-question details
 */
export function gradeAnswers(answers: StudentAnswers): GradingResult {
  const questions: QuestionResult[] = [];
  let correctCount = 0;

  for (const qKey of ANSWER_KEY) {
    const details: QuestionResult["details"] = [];
    let allCorrect = true;

    for (let i = 0; i < qKey.subQuestions.length; i++) {
      const answerKey = `${qKey.number}-${i}`;
      const studentAnswer = answers[answerKey] ?? "";
      const correct = checkSubAnswer(studentAnswer, qKey.subQuestions[i]);
      details.push({ subIndex: i, correct });
      if (!correct) allCorrect = false;
    }

    if (allCorrect) correctCount++;
    questions.push({ number: qKey.number, correct: allCorrect, details });
  }

  const totalQuestions = ANSWER_KEY.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const isPass = correctCount >= 7;

  const baseResult: GradingResult = {
    correctCount,
    totalQuestions,
    isPass,
    score,
    questions,
    feedback: null,
  };

  // Hanya hitung feedback jika belum lulus
  if (!isPass) {
    baseResult.feedback = getFeedback(baseResult);
  }

  return baseResult;
}

/**
 * Untuk digunakan di server-side API route.
 * Cukup import dan panggil gradeAnswers().
 */
