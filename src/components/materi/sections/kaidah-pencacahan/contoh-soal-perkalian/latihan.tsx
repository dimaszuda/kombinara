// ============================================================================
// Latihan Kepahaman — Kaidah Perkalian (SoalKepahaman + data)
// ============================================================================

import React, { useState } from "react";
import { C } from "./internals";

// ============================================================================
// Level metadata
// ============================================================================

export const LEVEL_META: Record<string, { label: string; bg: string; text: string }> = {
  mudah:    { label: "Mudah",    bg: "#DBFFD5", text: "#346739" },
  menengah: { label: "Menengah", bg: "#FFF3CD", text: "#92600A" },
  hots:     { label: "HOTS",     bg: "#F3E8FF", text: "#663362" },
};

// ============================================================================
// Soal Data
// ============================================================================

export const SOAL_DATA: Array<{
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: number;
}> = [
  {
    question_number: 1,
    level: "mudah",
    question:
      "Dari kota A ke kota B tersedia transportasi 5 bus, 10 mobil travel, 4 kereta, dan 2 pesawat terbang. Berapa banyak cara Anda dapat bepergian dari kota A ke kota B?",
    answer: 21,
  },
  {
    question_number: 2,
    level: "mudah",
    question:
      "Di kelas XI terdapat 40 siswa, 15 siswa diantaranya perempuan. Berapa banyak cara untuk memilih seorang perempuan dan seorang laki–laki sebagai wakil dari kelas XI?",
    answer: 375,
  },
  {
    question_number: 3,
    level: "mudah",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil?",
    answer: 20,
  },
  {
    question_number: 4,
    level: "menengah",
    question:
      "Suatu kelas ada 10 siswa yang dijadikan kandidat pengurus kelas sebagai ketua, sekretaris, dan bendahara kelas. Jika tidak boleh ada jabatan yang dirangkap, berapa banyak cara yang bisa dilakukan dalam pemilihan tersebut?",
    answer: 720,
  },
  {
    question_number: 5,
    level: "menengah",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B lalu kembali lagi ke kota A juga melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil jika tidak boleh melalui jalur yang sama?",
    answer: 240,
  },
  {
    question_number: 6,
    level: "menengah",
    question:
      "Disediakan angka 0, 3, 5, 6, 8, 9. Berapa banyak bilangan ganjil terdiri dari 3 angka yang dapat dibuat dengan syarat tidak ada angka yang berulang? (0 tidak boleh sebagai ratusan)",
    answer: 48,
  },
  {
    question_number: 7,
    level: "menengah",
    question:
      "Terdapat angka 3, 4, 5, 6, dan 7. Berapa banyak bilangan 3 angka berbeda yang dapat dibuat, jika bilangan tersebut lebih dari 540?",
    answer: 33,
  },
  {
    question_number: 8,
    level: "hots",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur, dari kota A ke kota C ada 3 jalur. Bowo melakukan perjalanan dari kota A ke kota C dan kembali lagi ke kota A. Jika berangkatnya harus melalui kota B, berapa banyak rute perjalanan yang bisa Bowo ambil jika tidak boleh melalui jalur yang sama?",
    answer: 300,
  },
  {
    question_number: 9,
    level: "hots",
    question:
      "Disediakan angka 1, 2, 3, 4, dan 5. Berapa banyak bilangan genap terdiri dari 3 angka yang dapat dibuat, jika bilangan tersebut lebih dari 300 dan tidak ada angka yang berulang?",
    answer: 15,
  },
  {
    question_number: 10,
    level: "hots",
    question:
      "Seorang fotografer sedang mengatur foto keluarga. Keluarga tersebut terdiri dari ayah, ibu, 3 anak laki–laki dan 2 anak perempuan. Mereka akan duduk berjajar di depan rumah dengan syarat ayah dan ibu selalu duduk berdampingan. Berapa banyak susunan foto yang mungkin terjadi?",
    answer: 1440,
  },
];

// ============================================================================
// SoalKepahaman — interactive question card
// ============================================================================

export function SoalKepahaman({
  question_number,
  level,
  question,
  answer,
}: {
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: number;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const isCorrect = value.trim() === String(answer);
  const meta = LEVEL_META[level];

  function handleCheck() {
    setChecked(true);
    if (isCorrect) setShowAnswer(false);
  }

  function handleChange(v: string) {
    setValue(v);
    setChecked(false);
    setShowAnswer(false);
  }

  return (
    <div
      className="rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: checked && isCorrect ? C.green : "#E5E7EB" }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: C.green }}
        >
          {question_number}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: meta.bg, color: meta.text }}
        >
          {meta.label}
        </span>
      </div>

      {/* Question text */}
      <p className="leading-relaxed text-[#2C2C2A]">{question}</p>

      {/* Answer row */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-[#346739]">Jawaban:</label>
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="..."
          style={{
            borderColor: checked ? (isCorrect ? C.green : C.wrong) : "#94a3b8",
            color: C.green,
          }}
          className="w-28 border-2 rounded-lg px-3 py-1.5 text-center font-semibold text-sm focus:outline-none"
        />
        <button
          onClick={handleCheck}
          style={{ backgroundColor: C.green }}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Cek
        </button>

        {/* Feedback */}
        {checked && isCorrect && (
          <span className="text-sm font-semibold" style={{ color: C.green }}>
            ✓ Benar!
          </span>
        )}
        {checked && !isCorrect && (
          <span className="text-sm font-semibold" style={{ color: C.wrong }}>
            ✗ Coba lagi
          </span>
        )}
      </div>

      {/* Show answer toggle (only after wrong attempt) */}
      {checked && !isCorrect && (
        <div>
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="text-xs underline"
            style={{ color: C.purple }}
          >
            {showAnswer ? "Sembunyikan jawaban" : "Lihat jawaban"}
          </button>
          {showAnswer && (
            <span className="ml-2 text-xs font-semibold" style={{ color: C.purple }}>
              Jawaban: {answer}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
