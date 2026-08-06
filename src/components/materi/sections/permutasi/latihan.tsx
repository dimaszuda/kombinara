// ============================================================================
// Latihan Pemahaman — Permutasi (SOAL_DATA + LEVEL_META)
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
// Soal Data — 10 soal uraian Permutasi
// ============================================================================

export const SOAL_DATA: Array<{
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk AI evaluation). */
  cara: string;
}> = [
  // ── Level Mudah: Permutasi dasar, permutasi r dari n, permutasi unsur sama ─
  {
    question_number: 1,
    level: "mudah",
    question:
      "Dalam suatu final perlombaan Literasi-Numerasi yang diikuti oleh 8 orang, akan diambil 3 orang sebagai juara yaitu juara I, juara II, dan juara III. Berapa banyak kemungkinan susunan juara yang terjadi?",
    answer: "336",
    cara:
      "Permutasi 3 dari 8 (urutan penting: juara I ≠ juara II ≠ juara III).\n" +
      "P(8,3) = 8! / (8-3)! = 8! / 5!\n" +
      "= 8 × 7 × 6 × 5! / 5!\n" +
      "= 8 × 7 × 6\n" +
      "= 336 susunan juara.",
  },
  {
    question_number: 2,
    level: "mudah",
    question:
      "Berapa banyak kemungkinan susunan huruf-huruf yang terdiri dari 4 huruf dari kata \"PERMUTASI\"?",
    answer: "3024",
    cara:
      "Kata \"PERMUTASI\" memiliki 9 huruf berbeda (P,E,R,M,U,T,A,S,I).\n" +
      "Menyusun 4 huruf dari 9 huruf berbeda (urutan penting):\n" +
      "P(9,4) = 9! / (9-4)! = 9! / 5!\n" +
      "= 9 × 8 × 7 × 6 × 5! / 5!\n" +
      "= 9 × 8 × 7 × 6\n" +
      "= 3.024 susunan.",
  },
  {
    question_number: 3,
    level: "mudah",
    question:
      "Tentukan banyak susunan huruf berbeda yang dapat dibentuk dari kata \"PENCACAHAN\"?",
    answer: "151200",
    cara:
      "Kata \"PENCACAHAN\": 10 huruf dengan pengulangan:\n" +
      "P = 1, E = 1, N = 2, C = 2, A = 3, H = 1\n" +
      "Permutasi dengan unsur sama:\n" +
      "= 10! / (2! × 2! × 3!)\n" +
      "= 3.628.800 / (2 × 2 × 6)\n" +
      "= 3.628.800 / 24\n" +
      "= 151.200 susunan.",
  },

  // ── Level Menengah: Permutasi siklis, posisi khusus, unsur sama + syarat ──
  {
    question_number: 4,
    level: "menengah",
    question:
      "Ada 7 orang yang akan duduk mengelilingi meja untuk belajar bersama. Tentukan banyak cara mereka duduk mengelilingi meja tersebut!",
    answer: "720",
    cara:
      "Permutasi siklis untuk n orang:\n" +
      "P_siklis = (n-1)!\n" +
      "= (7-1)!\n" +
      "= 6!\n" +
      "= 6 × 5 × 4 × 3 × 2 × 1\n" +
      "= 720 cara.",
  },
  {
    question_number: 5,
    level: "menengah",
    question:
      "Ada 6 pemuda dan 3 pemudi akan duduk berjajar pada sebuah bangku. Berapa macam posisi duduk yang mungkin jika yang menempati bagian pinggir hanya pemuda saja?",
    answer: "151200",
    cara:
      "Total 9 orang (6 pemuda, 3 pemudi) duduk berjajar.\n" +
      "Posisi pinggir (posisi 1 dan 9) hanya boleh ditempati pemuda:\n" +
      "- Pilih 2 pemuda untuk posisi pinggir: P(6,2) = 6 × 5 = 30\n" +
      "- Sisa 7 orang (4 pemuda + 3 pemudi) bebas di 7 posisi tengah: 7! = 5040\n" +
      "Total = 30 × 5040 = 151.200 posisi duduk.",
  },
  {
    question_number: 6,
    level: "menengah",
    question:
      "Diketahui kata \"MIAMMI\". Jika huruf-huruf pada kata tersebut dipertukarkan dan huruf yang terletak di pinggir adalah huruf \"M\", tentukan banyaknya kata yang dapat dibuat!",
    answer: "12",
    cara:
      "Kata \"MIAMMI\": 6 huruf, M = 3, I = 2, A = 1.\n" +
      "Syarat: huruf pinggir (posisi 1 dan 6) harus M.\n" +
      "- Karena M identik, cara menempatkan 2 M di 2 posisi pinggir = 1 cara.\n" +
      "- Sisa 4 posisi tengah diisi oleh 4 huruf {1 M, 2 I, 1 A}:\n" +
      "  Permutasi dengan unsur sama = 4! / 2! = 24 / 2 = 12.\n" +
      "Total = 1 × 12 = 12 kata.",
  },
  {
    question_number: 7,
    level: "menengah",
    question:
      "Terdapat 9 orang yang terdiri atas 2 orang dari partai Singa, 3 orang dari partai Harimau, dan 4 orang dari partai Macan akan melakukan perundingan duduk melingkar. Berapa macam posisi duduk mereka jika setiap anggota dari satu partai harus saling berdekatan?",
    answer: "576",
    cara:
      "Setiap partai dianggap 1 blok: 3 blok duduk melingkar.\n" +
      "- Susunan 3 blok melingkar: (3-1)! = 2! = 2 cara\n" +
      "- Dalam blok Singa (2 orang): 2! = 2 cara\n" +
      "- Dalam blok Harimau (3 orang): 3! = 6 cara\n" +
      "- Dalam blok Macan (4 orang): 4! = 24 cara\n" +
      "Total = 2 × 2 × 6 × 24 = 576 posisi duduk.",
  },

  // ── Level HOTS: Aplikasi multi-konsep permutasi ──────────────────────────
  {
    question_number: 8,
    level: "hots",
    question:
      "Suatu babak final kompetisi matematika diikuti oleh 8 orang peserta yang berasal dari beberapa provinsi. Jika 6 orang dari provinsi A dan 2 orang dari Provinsi B, berapa banyak susunan peserta berdasarkan provinsi yang dapat terjadi?",
    answer: "28",
    cara:
      "Total 8 peserta: 6 dari A, 2 dari B.\n" +
      "Susunan berdasarkan provinsi = permutasi dengan unsur sama:\n" +
      "= 8! / (6! × 2!)\n" +
      "= (8 × 7 × 6!) / (6! × 2 × 1)\n" +
      "= (8 × 7) / 2\n" +
      "= 56 / 2\n" +
      "= 28 susunan.\n\n" +
      "Alternatif: pilih 2 posisi dari 8 untuk provinsi B → C(8,2) = 28.",
  },
  {
    question_number: 9,
    level: "hots",
    question:
      "Sebuah keluarga lengkap yang memiliki 2 anak laki-laki dan 3 anak perempuan akan makan bersama pada sebuah meja bundar. Tentukan banyak cara mereka duduk pada meja tersebut dimana anak laki-laki duduk bersama anak laki-laki dan anak perempuan bersama anak perempuan serta ayah dan ibu duduk berdekatan!",
    answer: "48",
    cara:
      "Anggota keluarga: Ayah, Ibu, 2 anak laki-laki, 3 anak perempuan = 7 orang.\n" +
      "Blok-blok:\n" +
      "- Blok L: 2 anak laki-laki\n" +
      "- Blok P: 3 anak perempuan\n" +
      "- Blok O: Ayah & Ibu (berdekatan)\n\n" +
      "3 blok duduk melingkar: (3-1)! = 2! = 2 cara\n" +
      "- Dalam blok L: 2! = 2 cara\n" +
      "- Dalam blok P: 3! = 6 cara\n" +
      "- Dalam blok O: 2! = 2 cara (ayah-ibu bisa bertukar)\n\n" +
      "Total = 2 × 2 × 6 × 2 = 48 cara.",
  },
  {
    question_number: 10,
    level: "hots",
    question:
      "Dalam sebuah seleksi tim sepak bola terdapat 15 pemain yang akan memperebutkan 11 posisi yang berbeda. Jika 3 pemain memperebutkan 1 posisi kiper, 6 pemain memperebutkan 4 posisi pemain belakang, 4 pemain memperebutkan 4 posisi pemain tengah, dan 2 pemain memperebutkan 2 posisi pemain depan, berapa banyak susunan yang dapat terjadi?",
    answer: "51840",
    cara:
      "Setiap kelompok pemain hanya bisa mengisi posisi sesuai kelompoknya:\n\n" +
      "- Kiper: 3 pemain → 1 posisi = P(3,1) = 3\n" +
      "- Belakang: 6 pemain → 4 posisi = P(6,4) = 6 × 5 × 4 × 3 = 360\n" +
      "- Tengah: 4 pemain → 4 posisi = P(4,4) = 4! = 24\n" +
      "- Depan: 2 pemain → 2 posisi = P(2,2) = 2! = 2\n\n" +
      "Total = 3 × 360 × 24 × 2 = 51.840 susunan.",
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
