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
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk guru / AI evaluation). */
  cara: string;
}> = [
  {
    question_number: 1,
    level: "mudah",
    question:
      "Dari kota A ke kota B tersedia transportasi 5 bus, 10 mobil travel, 4 kereta, dan 2 pesawat terbang. Berapa banyak cara Anda dapat bepergian dari kota A ke kota B?",
    answer: 21,
    cara: "5 + 10 + 4 + 2 = 21 cara",
  },
  {
    question_number: 2,
    level: "mudah",
    question:
      "Di kelas XI terdapat 40 siswa, 15 siswa diantaranya perempuan. Berapa banyak cara untuk memilih seorang perempuan dan seorang laki–laki sebagai wakil dari kelas XI?",
    answer: 375,
    cara: "15 (perempuan) × 25 (laki-laki) = 375 cara",
  },
  {
    question_number: 3,
    level: "mudah",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil?",
    answer: 20,
    cara: "4 × 5 = 20 rute",
  },
  {
    question_number: 4,
    level: "menengah",
    question:
      "Suatu kelas ada 10 siswa yang dijadikan kandidat pengurus kelas sebagai ketua, sekretaris, dan bendahara kelas. Jika tidak boleh ada jabatan yang dirangkap, berapa banyak cara yang bisa dilakukan dalam pemilihan tersebut?",
    answer: 720,
    cara: "10 × 9 × 8 = 720 cara",
  },
  {
    question_number: 5,
    level: "menengah",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B lalu kembali lagi ke kota A juga melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil jika tidak boleh melalui jalur yang sama?",
    answer: 240,
    cara: "Pergi: 4×5=20, Pulang (tak boleh jalur sama): 3×4=12 → Total = 20×12 = 240 rute",
  },
  {
    question_number: 6,
    level: "menengah",
    question:
      "Disediakan angka 0, 3, 5, 6, 8, 9. Berapa banyak bilangan ganjil terdiri dari 3 angka yang dapat dibuat dengan syarat tidak ada angka yang berulang? (0 tidak boleh sebagai ratusan)",
    answer: 48,
    cara: "Bilangan ganjil 3 angka dari {0,3,5,6,8,9}, tanpa pengulangan, 0 tidak di ratusan: satuan ganjil {3,5,9} = 3 pilihan, ratusan (bukan 0, bukan satuan) = 4 pilihan, puluhan (sisa) = 4 pilihan → 3×4×4 = 48 bilangan",
  },
  {
    question_number: 7,
    level: "menengah",
    question:
      "Terdapat angka 3, 4, 5, 6, dan 7. Berapa banyak bilangan 3 angka berbeda yang dapat dibuat, jika bilangan tersebut lebih dari 540?",
    answer: 33,
    cara: "Dari {3,4,5,6,7}, bilangan 3 angka berbeda > 540: ratusan=5, puluhan ∈ {4,6,7}, satuan sisa 3 pilihan → 3×3=6, atau ratusan ∈ {6,7} (bebas, puluhan 4×satuan 3=12 per ratusan → 2×12=24) → Total = 9 + 24 = 33 bilangan",
  },
  {
    question_number: 8,
    level: "hots",
    question:
      "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur, dari kota A ke kota C ada 3 jalur. Bowo melakukan perjalanan dari kota A ke kota C dan kembali lagi ke kota A. Jika berangkatnya harus melalui kota B, berapa banyak rute perjalanan yang bisa Bowo ambil jika tidak boleh melalui jalur yang sama?",
    answer: 300,
    cara: "Pergi (harus lewat B): 4×5=20. Pulang C→B→A tanpa mengulang jalur: dari 3 jalur A–C sisa (bukan yang dipakai pergi, tak relevan karena beda rute) — dengan syarat tak lewat jalur sama: berangkat A-B-C pakai 1 dari 4 jalur A-B dan 1 dari 5 jalur B-C; pulang C-A langsung ada 3 jalur, Berarti ada 20 × 3 = 60 rute. Lalu bisa juga pulangnya lewat B lagi tidak lewat jalur yang sama berarti 4 x 5 x 4 x 3 = 240. Jadi totalnya ada 60 + 240 = 300 rute yang bisa Ani ambil.",
  },
  {
    question_number: 9,
    level: "hots",
    question:
      "Disediakan angka 1, 2, 3, 4, dan 5. Berapa banyak bilangan genap terdiri dari 3 angka yang dapat dibuat, jika bilangan tersebut lebih dari 300 dan tidak ada angka yang berulang?",
    answer: 15,
    cara: "Bilangan genap 3 angka dari {1,2,3,4,5}, tanpa pengulangan, >300: satuan genap {2,4}. Ratusan>3 yaitu {3,4,5}: jika ratusan=4, satuan hanya {2} tersisa (1 pilihan), puluhan 3 pilihan → 1×3=3; jika ratusan={3,5}, satuan {2,4} (2 pilihan), puluhan 3 pilihan → 2×2×3=12. Total = 3+12 = 15 bilangan",
  },
  {
    question_number: 10,
    level: "hots",
    question:
      "Seorang fotografer sedang mengatur foto keluarga. Keluarga tersebut terdiri dari ayah, ibu, 3 anak laki–laki dan 2 anak perempuan. Mereka akan duduk berjajar di depan rumah dengan syarat ayah dan ibu selalu duduk berdampingan. Berapa banyak susunan foto yang mungkin terjadi?",
    answer: 1440,
    cara: "7 orang (ayah, ibu, 3 anak lk, 2 anak pr) berjajar, ayah-ibu berdampingan: blok(ayah-ibu) + 5 lainnya = 6 entitas, 6! × 2! (tukar ayah-ibu) = 720×2 = 1.440 susunan",
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
  // Batch-mode props (optional — when provided, parent controls checking)
  value: externalValue,
  onChange: externalOnChange,
  hideCheckButton = false,
  checked: externalChecked,
}: {
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: number;
  value?: string;
  onChange?: (v: string) => void;
  hideCheckButton?: boolean;
  checked?: boolean;
}) {
  const [internalValue, setInternalValue] = useState("");
  const [internalChecked, setInternalChecked] = useState(false);

  const value = externalValue !== undefined ? externalValue : internalValue;
  const checked = externalChecked !== undefined ? externalChecked : internalChecked;

  const isCorrect = value.trim() === String(answer);
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
      className="rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: checked && isCorrect ? C.green : checked && !isCorrect ? C.wrong : "#E5E7EB" }}
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
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="..."
          style={{
            borderColor: checked ? (isCorrect ? C.green : C.wrong) : "#94a3b8",
            color: C.green,
          }}
          className="w-28 border-2 rounded-lg px-3 py-1.5 text-center font-semibold text-sm focus:outline-none"
        />
        {!hideCheckButton && (
          <button
            onClick={handleCheck}
            style={{ backgroundColor: C.green }}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Cek
          </button>
        )}

        {/* Feedback */}
        {checked && isCorrect && (
          <span className="text-sm font-semibold" style={{ color: C.green }}>
            ✓ Benar!
          </span>
        )}
        {checked && !isCorrect && (
          <span className="text-sm font-semibold" style={{ color: C.wrong }}>
            ✗ Salah
          </span>
        )}
      </div>


    </div>
  );
}
