// ============================================================================
// Latihan Pemahaman — Faktorial (SOAL_DATA + LEVEL_META)
// ============================================================================

import React, { useState } from "react";

// ============================================================================
// Level metadata
// ============================================================================

export const LEVEL_META: Record<string, { label: string; bg: string; text: string }> = {
  mudah:    { label: "Mudah",    bg: "#DBFFD5", text: "#346739" },
  menengah: { label: "Menengah", bg: "#FFF3CD", text: "#92600A" },
  hots:     { label: "HOTS",     bg: "#F3E8FF", text: "#663362" },
};

// ============================================================================
// Soal Data — 7 soal uraian Faktorial (sesuai Ground Truth)
// ============================================================================

export const SOAL_DATA: Array<{
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk AI evaluation). */
  cara: string;
}> = [
  // ── Level Dasar: Memahami definisi, menghitung nilai faktorial ──────────
  {
    question_number: 1,
    level: "mudah",
    question:
      "Hitunglah nilai faktorial berikut!\n" +
      "a. 5! = ...\n" +
      "b. 3! + 4! = ...\n" +
      "c. 3! × 2! = ...\n" +
      "d. 0! + 1! + 2! = ...",
    answer:
      "a) 5! = 120\n" +
      "b) 3!+4! = 6+24 = 30\n" +
      "c) 3!×2! = 6×2 = 12\n" +
      "d) 0!+1!+2! = 1+1+2 = 4",
    cara:
      "a) 5! = 5 × 4 × 3 × 2 × 1 = 120\n" +
      "b) 3! = 6, 4! = 24 → 6 + 24 = 30\n" +
      "c) 3! = 6, 2! = 2 → 6 × 2 = 12\n" +
      "d) 0! = 1, 1! = 1, 2! = 2 → 1 + 1 + 2 = 4",
  },
  {
    question_number: 2,
    level: "mudah",
    question:
      "Sederhanakan ekspresi berikut tanpa menghitung nilai faktorial secara penuh!\n" +
      "a. 7! / 5! = ...\n" +
      "b. 9! / 7! = ...\n" +
      "c. 6! / (4! · 2!) = ...",
    answer:
      "a) 7!/5! = 42\n" +
      "b) 9!/7! = 72\n" +
      "c) 6!/(4!·2!) = 15",
    cara:
      "a) 7!/5! = (7 × 6 × 5!) / 5! = 7 × 6 = 42\n" +
      "b) 9!/7! = (9 × 8 × 7!) / 7! = 9 × 8 = 72\n" +
      "c) 6!/(4!·2!) = (6 × 5 × 4!) / (4! × 2 × 1) = (6 × 5) / 2 = 15",
  },
  {
    question_number: 3,
    level: "mudah",
    question:
      "Tentukan nilai n yang memenuhi persamaan berikut!\n" +
      "a. n! = 24 → n = ...\n" +
      "b. n! = 720 → n = ...\n" +
      "c. (n+1)! = 120 → n = ...",
    answer:
      "a) n! = 24 → n = 4\n" +
      "b) n! = 720 → n = 6\n" +
      "c) (n+1)! = 120 → n+1=5 → n = 4",
    cara:
      "a) 4! = 4 × 3 × 2 × 1 = 24, jadi n = 4\n" +
      "b) 6! = 6 × 5 × 4 × 3 × 2 × 1 = 720, jadi n = 6\n" +
      "c) (n+1)! = 120 → 5! = 120 → n+1 = 5 → n = 4",
  },

  // ── Level Menengah: True/False, penyederhanaan, mencari n ────────────────
  {
    question_number: 4,
    level: "menengah",
    question:
      "Manakah pernyataan berikut yang benar? Beri tanda ✅ atau ❌, lalu jelaskan alasanmu!\n" +
      "a. 0! = 0\n" +
      "b. 5! / 3! = 2!\n" +
      "c. 5! = 5 × 4!\n" +
      "d. n! / (n-1)! = n",
    answer:
      "a) Salah — 0! = 1, bukan 0\n" +
      "b) Salah — 5!/3! = 20, bukan 2! (=2)\n" +
      "c) Benar — sesuai sifat rekursif n!=n×(n-1)!\n" +
      "d) Benar — n!/(n-1)! = n",
    cara:
      "a) Salah. Berdasarkan definisi, 0! = 1.\n" +
      "b) Salah. 5!/3! = (5×4×3!)/3! = 20, bukan 2! (= 2).\n" +
      "c) Benar. 5! = 5×4×3×2×1 = 5×(4×3×2×1) = 5×4!.\n" +
      "d) Benar. n!/(n-1)! = n×(n-1)!/(n-1)! = n, untuk n ≥ 1.",
  },
  {
    question_number: 5,
    level: "menengah",
    question:
      "Sederhanakan ekspresi berikut:\n" +
      "a. (n+2)! / n! = ...\n" +
      "b. (n+1)! / (n-1)! = ...\n" +
      "c. n! / ((n-3)! · 3!) = ...",
    answer:
      "a) (n+2)(n+1)\n" +
      "b) (n+1)n\n" +
      "c) C(n,3), bentuk umum",
    cara:
      "a) (n+2)!/n! = (n+2)(n+1)n!/n! = (n+2)(n+1)\n" +
      "b) (n+1)!/(n-1)! = (n+1)n(n-1)!/(n-1)! = (n+1)n\n" +
      "c) n!/((n-3)!·3!) = n(n-1)(n-2)(n-3)!/((n-3)!·6) = n(n-1)(n-2)/6 = C(n,3)",
  },
  {
    question_number: 6,
    level: "menengah",
    question:
      "Tentukan nilai n yang memenuhi:\n" +
      "a. n! / (n-2)! = 30\n" +
      "b. (n+1)! / (n-1)! = 56",
    answer:
      "a) n!/(n-2)! = 30 → n(n-1)=30 → n = 6\n" +
      "b) (n+1)!/(n-1)! = 56 → (n+1)n=56 → n = 7",
    cara:
      "a) n!/(n-2)! = n(n-1)(n-2)!/(n-2)! = n(n-1)\n" +
      "n(n-1) = 30 → n² - n - 30 = 0 → (n-6)(n+5) = 0\n" +
      "n = 6 atau n = -5\n" +
      "Karena n ≥ 2, maka n = 6.\n\n" +
      "b) (n+1)!/(n-1)! = (n+1)n(n-1)!/(n-1)! = (n+1)n\n" +
      "(n+1)n = 56 → n² + n - 56 = 0 → (n-7)(n+8) = 0\n" +
      "n = 7 atau n = -8\n" +
      "Karena n ≥ 1, maka n = 7.",
  },

  // ── Level Menengah: Aplikasi faktorial dalam konteks pencacahan ──────────
  {
    question_number: 7,
    level: "menengah",
    question:
      "Lima siswa (Aldi, Bella, Citra, Dani, Eka) akan berfoto berjajar untuk kenang-kenangan.\n\n" +
      "a. Berapa banyak cara mereka bisa berjajar? Tuliskan dalam bentuk faktorial dan hitung nilainya.\n\n" +
      "b. Jika Aldi sudah pasti berada di posisi paling kiri, berapa banyak cara tersisa untuk menyusun keempat orang lainnya?\n\n" +
      "c. Berapakah perbandingan antara jawaban a. dan b.? Apa artinya?",
    answer:
      "a) 5! = 120 cara\n" +
      "b) 4! = 24 cara (Aldi tetap di kiri)\n" +
      "c) Perbandingan a:b = 120:24 = 5:1. Artinya hanya 1/5 dari seluruh kemungkinan yang memenuhi syarat Aldi di posisi kiri — masuk akal karena Aldi hanya menempati 1 dari 5 posisi yang mungkin.",
    cara:
      "a) Menyusun 5 orang berjajar = permutasi 5 objek = 5!\n" +
      "5! = 5 × 4 × 3 × 2 × 1 = 120\n" +
      "Jadi, ada 120 cara mereka bisa berjajar.\n\n" +
      "b) Aldi tetap di posisi paling kiri, maka 4 orang tersisa disusun bebas.\n" +
      "Banyak cara = 4! = 4 × 3 × 2 × 1 = 24\n" +
      "Jadi, ada 24 cara menyusun keempat orang lainnya.\n\n" +
      "c) Perbandingan = 120 : 24 = 5 : 1\n" +
      "Artinya: Dari 120 kemungkinan susunan, hanya 24 di antaranya Aldi berada di posisi paling kiri.\n" +
      "Atau: Peluang Aldi di posisi paling kiri = 24/120 = 1/5.\n" +
      "Secara intuitif, karena ada 5 posisi yang equally likely untuk Aldi, peluangnya memang 1/5.",
  },
];

// ============================================================================
// Sub-part config — soal yang punya jawaban per huruf (a, b, c, d)
// ============================================================================

export const SUB_PART_CONFIG: Record<number, string[]> = {
  1: ["a", "b", "c", "d"],
  2: ["a", "b", "c"],
  3: ["a", "b", "c"],
  4: ["a", "b", "c", "d"],
  5: ["a", "b", "c"],
  6: ["a", "b"],
  7: ["a", "b", "c"],
};

// ============================================================================
// SoalKepahaman — interactive question card (re-export for SubmittedScreen)
// ============================================================================

export function SoalKepahaman({
  question_number,
  level,
  question,
  answer,
  value: externalValue,
  onChange: externalOnChange,
  hideCheckButton = false,
  checked: externalChecked,
}: {
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  value?: string;
  onChange?: (v: string) => void;
  hideCheckButton?: boolean;
  checked?: boolean;
}) {
  const [internalValue, setInternalValue] = useState("");
  const [internalChecked, setInternalChecked] = useState(false);

  const value = externalValue !== undefined ? externalValue : internalValue;
  const checked = externalChecked !== undefined ? externalChecked : internalChecked;

  const isCorrect = value.trim().toLowerCase() === answer.toLowerCase();
  const meta = LEVEL_META[level];

  function handleCheck() {
    setInternalChecked(true);
  }

  function handleChange(v: string) {
    if (externalOnChange) {
      externalOnChange(v);
    } else {
      setInternalValue(v);
      setInternalChecked(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        border: `2px solid ${checked ? (isCorrect ? "#346739" : "#b91c1c") : "#e2ede2"}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 4,
          backgroundColor: checked
            ? isCorrect
              ? "#346739"
              : "#b91c1c"
            : "#e2ede2",
        }}
      />
      <div style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              backgroundColor: "#346739",
              flexShrink: 0,
            }}
          >
            {question_number}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: meta.bg,
              color: meta.text,
              padding: "3px 10px",
              borderRadius: 99,
            }}
          >
            {meta.label}
          </span>
          {checked && (
            <span
              style={{
                fontSize: 11,
                color: isCorrect ? "#346739" : "#b91c1c",
                fontWeight: 700,
                marginLeft: "auto",
              }}
            >
              {isCorrect ? "✓ Benar" : "✕ Cek Lagi"}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 15,
            color: "#2C2C2A",
            lineHeight: 1.75,
            margin: "0 0 18px",
            fontWeight: 500,
            whiteSpace: "pre-wrap",
          }}
        >
          {question}
        </p>
        {!hideCheckButton && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Tulis jawaban akhirmu..."
              disabled={checked && isCorrect}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1.5px solid ${checked ? (isCorrect ? "#c3e6c3" : "#fecaca") : "#e8d4e8"}`,
                backgroundColor: checked
                  ? isCorrect
                    ? "#f0faf0"
                    : "#fff5f5"
                  : "#fdf8fd",
                fontSize: 14,
                color: "#2C2C2A",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            {!checked && (
              <button
                onClick={handleCheck}
                disabled={value.trim().length === 0}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor:
                    value.trim().length === 0 ? "#9aada0" : "#346739",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    value.trim().length === 0 ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Cek
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
