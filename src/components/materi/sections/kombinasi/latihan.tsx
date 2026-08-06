// ============================================================================
// Latihan Pemahaman — Kombinasi (SOAL_DATA + LEVEL_META)
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
// Soal Data — 10 soal uraian Kombinasi
// ============================================================================

export const SOAL_DATA: Array<{
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk AI evaluation). */
  cara: string;
}> = [
  // ── Level Mudah: Kombinasi dasar, segitiga dari segi-n, tim campuran ──────
  {
    question_number: 1,
    level: "mudah",
    question:
      "Dari 8 pelajar akan dipilih 5 pelajar untuk mengikuti Jambore Pramuka. Tentukan banyak cara memilih kelima pelajar tersebut!",
    answer: "56",
    cara:
      "Memilih 5 dari 8 tanpa memperhatikan urutan → kombinasi.\n" +
      "C(8,5) = 8! / (5! × 3!)\n" +
      "= (8 × 7 × 6 × 5!) / (5! × 3 × 2 × 1)\n" +
      "= (8 × 7 × 6) / 6\n" +
      "= 8 × 7\n" +
      "= 56 cara.",
  },
  {
    question_number: 2,
    level: "mudah",
    question:
      "Tentukan banyaknya segitiga yang berbeda yang dapat dibentuk dari segi sepuluh!",
    answer: "120",
    cara:
      "Segitiga dibentuk dari 3 titik sudut segi-10.\n" +
      "Memilih 3 titik dari 10 titik sudut:\n" +
      "C(10,3) = 10! / (3! × 7!)\n" +
      "= (10 × 9 × 8 × 7!) / (6 × 7!)\n" +
      "= (10 × 9 × 8) / 6\n" +
      "= 720 / 6\n" +
      "= 120 segitiga.",
  },
  {
    question_number: 3,
    level: "mudah",
    question:
      "Ada 7 siswa putra dan 4 siswa putri, akan dibentuk tim yang terdiri dari 5 orang. Tentukan banyaknya cara membentuk tim jika harus 3 putra dan 2 putri!",
    answer: "210",
    cara:
      "Memilih 3 putra dari 7 dan 2 putri dari 4 (kombinasi independen):\n" +
      "C(7,3) × C(4,2)\n" +
      "= [7!/(3!×4!)] × [4!/(2!×2!)]\n" +
      "= [(7×6×5)/6] × [(4×3)/2]\n" +
      "= 35 × 6\n" +
      "= 210 cara.",
  },

  // ── Level Menengah: Soal wajib, syarat maks/min, kombinasi dengan syarat ──
  {
    question_number: 4,
    level: "menengah",
    question:
      "Dalam suatu ulangan seorang siswa harus menjawab 8 soal dari 10 soal yang diberikan dengan 5 soal diantaranya wajib dikerjakan. Tentukan banyaknya cara memilih soal-soal tersebut!",
    answer: "10",
    cara:
      "5 soal wajib → sudah pasti dipilih.\n" +
      "Sisa: harus memilih 3 soal dari 5 soal yang tidak wajib.\n" +
      "C(5,3) = 5! / (3! × 2!)\n" +
      "= (5 × 4) / 2\n" +
      "= 10 cara.",
  },
  {
    question_number: 5,
    level: "menengah",
    question:
      "Dari 12 orang yang terdiri dari 8 putra dan 4 putri akan dibentuk tim yang beranggotakan 5 orang. Jika disyaratkan anggota tim tersebut paling banyak 2 orang putri, berapa banyak cara membentuk tim tersebut?",
    answer: "672",
    cara:
      "Paling banyak 2 putri → 3 kasus:\n\n" +
      "Kasus 1: 0 putri, 5 putra\n" +
      "= C(4,0) × C(8,5) = 1 × 56 = 56\n\n" +
      "Kasus 2: 1 putri, 4 putra\n" +
      "= C(4,1) × C(8,4) = 4 × 70 = 280\n\n" +
      "Kasus 3: 2 putri, 3 putra\n" +
      "= C(4,2) × C(8,3) = 6 × 56 = 336\n\n" +
      "Total = 56 + 280 + 336 = 672 cara.",
  },
  {
    question_number: 6,
    level: "menengah",
    question:
      "Dalam sebuah kotak terdapat 12 bola yang terdiri dari 5 bola putih, 2 bola merah, 4 bola hijau, dan 1 bola biru akan diambil 4 bola secara acak. Berapa banyak cara pengambilan paling sedikit 1 bola merah?",
    answer: "285",
    cara:
      "Paling sedikit 1 bola merah = total pengambilan − tanpa bola merah.\n\n" +
      "Total pengambilan 4 dari 12:\n" +
      "C(12,4) = 12!/(4!×8!) = (12×11×10×9)/(4×3×2×1) = 495\n\n" +
      "Tanpa bola merah (10 bola non-merah):\n" +
      "C(10,4) = 10!/(4!×6!) = (10×9×8×7)/(4×3×2×1) = 210\n\n" +
      "Paling sedikit 1 merah = 495 − 210 = 285 cara.",
  },
  {
    question_number: 7,
    level: "menengah",
    question:
      "Empat buah huruf diambil dari huruf-huruf P, E, L, U, A, N, G. Jika urutan huruf tidak diperhatikan, berapa banyak cara memilih keempat huruf tersebut?",
    answer: "35",
    cara:
      "7 huruf berbeda (P,E,L,U,A,N,G), dipilih 4 tanpa memperhatikan urutan.\n" +
      "C(7,4) = 7! / (4! × 3!)\n" +
      "= (7 × 6 × 5 × 4!) / (4! × 6)\n" +
      "= (7 × 6 × 5) / 6\n" +
      "= 7 × 5\n" +
      "= 35 cara.",
  },

  // ── Level HOTS: Mencari n dari C(n,k), syarat inklusi/eksklusi, delegasi ──
  {
    question_number: 8,
    level: "hots",
    question:
      "Seorang siswa diminta untuk mengerjakan 5 butir soal dari n butir soal yang tersedia. Soal nomor 1 dan 2 wajib dikerjakan. Jika banyak pilihan soal yang dapat ia lakukan ada 20, tentukan nilai n!",
    answer: "n = 8",
    cara:
      "Soal 1 dan 2 wajib → sudah pasti dipilih (2 soal).\n" +
      "Sisa: memilih 3 soal dari (n-2) soal lainnya.\n" +
      "C(n-2, 3) = 20\n\n" +
      "(n-2)(n-3)(n-4) / 6 = 20\n" +
      "(n-2)(n-3)(n-4) = 120\n\n" +
      "Coba: n-2 = 6 → n = 8\n" +
      "6 × 5 × 4 = 120 ✓\n\n" +
      "Jadi, n = 8.",
  },
  {
    question_number: 9,
    level: "hots",
    question:
      "Dari 10 finalis pemilihan Putri Indonesia akan dipilih 3 orang. Berapa banyak cara memilih ketiga finalis jika 1 finalis selalu dipilih dan 2 finalis selalu dikeluarkan?",
    answer: "21",
    cara:
      "1 finalis selalu dipilih (pasti masuk) → 1 slot terisi.\n" +
      "2 finalis selalu dikeluarkan (pasti tidak dipilih).\n\n" +
      "Tersisa: 10 - 1 - 2 = 7 kandidat.\n" +
      "Perlu memilih 2 lagi dari 7:\n" +
      "C(7,2) = 7! / (2! × 5!)\n" +
      "= (7 × 6) / 2\n" +
      "= 21 cara.",
  },
  {
    question_number: 10,
    level: "hots",
    question:
      "Delegasi Olimpiade Sains suatu SMA yang beranggotakan 9 orang, akan dibagi menjadi 2 kelompok I dan II, masing-masing terdiri dari 5 orang dan 4 orang. Dari tiap kelompok akan dipilih dua orang untuk menjadi ketua dan wakil. Jika Firdaus adalah anggota delegasi itu dan dia tidak bersedia menjadi ketua kelompok, ada berapa cara membentuk kelompok beserta pengurusnya?",
    answer: "23520",
    cara:
      "Total 9 orang, dibagi: kelompok I (5) & II (4).\n" +
      "Firdaus tidak boleh jadi ketua kelompok manapun.\n\n" +
      "Kasus 1: Firdaus di kelompok I\n" +
      "- Pilih 4 teman Firdaus dari 8: C(8,4) = 70\n" +
      "- Ketua I: pilih dari 4 (bukan Firdaus) = 4\n" +
      "- Wakil I: pilih dari 4 sisa = 4 → 4×4 = 16\n" +
      "- Ketua & wakil II: P(4,2) = 4×3 = 12\n" +
      "- Subtotal = 70 × 16 × 12 = 13.440\n\n" +
      "Kasus 2: Firdaus di kelompok II\n" +
      "- Pilih 5 untuk kelompok I dari 8: C(8,5) = 56\n" +
      "- Ketua & wakil I: P(5,2) = 5×4 = 20\n" +
      "- Kelompok II: 4 orang termasuk Firdaus.\n" +
      "  Ketua II: pilih dari 3 (bukan Firdaus) = 3\n" +
      "  Wakil II: pilih dari 3 sisa = 3 → 3×3 = 9\n" +
      "- Subtotal = 56 × 20 × 9 = 10.080\n\n" +
      "Total = 13.440 + 10.080 = 23.520 cara.",
  },
];

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
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
                backgroundColor: checked ? (isCorrect ? "#f0faf0" : "#fff5f5") : "#fdf8fd",
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
                  backgroundColor: value.trim().length === 0 ? "#9aada0" : "#346739",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: value.trim().length === 0 ? "not-allowed" : "pointer",
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
