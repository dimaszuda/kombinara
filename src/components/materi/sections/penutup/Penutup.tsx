"use client";

import React, { useState, useCallback } from "react";
import { SectionBadge } from "@/components/ui/Materi";
import { CheckIcon } from "@/components/ui/IconButton";
import {
  TrophyIcon,
  ClipboardCheckIcon,
  LightbulbIcon,
  BookOpenIcon,
  BookMarkedIcon,
} from "./icons";

// ============================================================================
// Shared: Simpan Jawaban Button (same style as Faktorial)
// ============================================================================

function SaveButton({
  onClick,
  disabled = false,
  loading = false,
  hidden = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
            </svg>
            Menyimpan...
          </>
        ) : (
          <>
            <CheckIcon />
            Simpan Jawaban
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// Shared: Section Header with icon
// ============================================================================

function SectionHeader({
  icon: Icon,
  badge,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number }>;
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <SectionBadge>{badge}</SectionBadge>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#DBFFD5]/50">
          <Icon size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#2C2C2A]">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[#6B6B66] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Shared: Numbered question wrapper
// ============================================================================

function QuestionNumber({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#DBFFD5] text-[#346739] text-xs font-bold">
      {n}
    </span>
  );
}

// ============================================================================
// Shared: Text input for jawaban
// ============================================================================

function AnswerInput({
  value,
  onChange,
  placeholder = "Tulis jawabanmu...",
  disabled = false,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "number";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-[#34673933] bg-white px-4 py-2.5 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66]"
    />
  );
}

// ============================================================================
// Shared: Textarea for refleksi / long answers
// ============================================================================

function AnswerTextarea({
  value,
  onChange,
  placeholder = "Tulis jawabanmu di sini...",
  disabled = false,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className="w-full rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66] disabled:resize-none"
    />
  );
}

// ============================================================================
// 1. TANTANGAN — 10 soal pemecahan masalah
// ============================================================================

const SOAL_TANTANGAN = [
  {
    no: 1,
    soal:
      "Ari dan Ira merupakan anggota dari suatu kelompok yang terdiri dari 9 orang. Berapa banyaknya cara membuat barisan dengan syarat Ari dan Ira tidak berdampingan?",
  },
  {
    no: 2,
    soal:
      "Berapa banyak cara menyusun huruf – huruf dari kata ANANDA, dengan dua huruf N tidak boleh berdampingan?",
  },
  {
    no: 3,
    soal:
      "Tentukan banyak cara menyusun huruf – huruf dari kata ISOSCELES sedemikian rupa sehingga huruf terakhirnya bukan huruf hidup (vokal)!",
  },
  {
    no: 4,
    soal:
      "Bejo memiliki 8 bola berbeda. Dia ingin memasukkan bola tersebut ke dalam 3 kotak. Kotak I dapat menampung 2 bola. Kotak II dapat menampung 4 bola. Kotak III dapat menampung 2 bola. Banyak cara Bejo memasukkan bola tersebut ke dalam kotak?",
  },
  {
    no: 5,
    soal:
      "Suatu tim matematika yang terdiri atas lima siswa akan dipilih dari enam siswa perempuan dan lima siswa laki – laki. Berapa banyak cara tim dapat dibentuk sedemikian sehingga ada lebih banyak siswa perempuan daripada siswa laki – laki?",
  },
  {
    no: 6,
    soal:
      "Sebanyak 5 siswa laki – laki dan 3 siswa perempuan akan duduk berdampingan dalam satu baris. Jika disyaratkan kedua ujung ditempati siswa laki – laki dan tidak boleh ada 2 siswa perempuan yang duduk berdampingan, tentukan banyak cara duduk 8 siswa tersebut!",
  },
  {
    no: 7,
    soal:
      "Dalam satu kantong terdapat 6 bola hitam dan 4 bola merah. Dari kantong tersebut akan diambil 5 bola sekaligus. Berapa banyak cara yang mungkin jika paling sedikit terambil 3 bola berwarna hitam?",
  },
  {
    no: 8,
    soal:
      "Dua belas anak akan dibagi menjadi tiga kelompok yang beranggotakan empat anak. Jika dua dari sekelompok anak tersebut adalah bersaudara yang harus berada dalam kelompok yang sama, tentukan banyak cara untuk membagi kedua belas anak tersebut dalam tiga kelompok?",
  },
  {
    no: 9,
    soal:
      "Sebanyak 20 orang pegawai bekerja pada tiga proyek, masing – masing memerlukan 8, 7, dan 5 pekerja. Berapa banyak cara 20 orang tersebut dapat ditugaskan pada ketiga proyek tersebut?",
  },
  {
    no: 10,
    soal:
      "Disediakan angka 2, 3, 4, 5, 6, 7, 8. Berapa banyak bilangan genap 3 angka berbeda yang dapat dibuat, jika bilangan tersebut lebih dari 540?",
  },
];

function TantanganSection() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedSoal, setSavedSoal] = useState<Set<number>>(new Set());

  const setAnswer = useCallback(
    (no: number) => (v: string) => {
      setAnswers((prev) => ({ ...prev, [no]: v }));
    },
    [],
  );

  const handleSave = (no: number) => {
    // TODO: integrate with backend API later
    console.log(`[Tantangan] Soal ${no}:`, answers[no] ?? "");
    setSavedSoal((prev) => new Set(prev).add(no));
  };

  return (
    <section>
      <SectionHeader
        icon={TrophyIcon}
        badge="TANTANGAN"
        title="Soal Tantangan"
        subtitle="Kerjakan soal-soal berikut untuk memperdalam pemahamanmu"
      />

      <div className="rounded-xl bg-white p-5 space-y-6">
        <p className="text-sm leading-relaxed text-[#2C2C2A] italic bg-[#DBFFD5]/40 rounded-lg p-4 border border-[#34673926]">
          <strong>Setelah kamu menyelesaikan semua materi, aktivitas siswa, dan asesmen formatif,</strong> silahkan kerjakan soal–soal tantangan berikut untuk menambah wawasanmu dan menambah kedalaman pemahamanmu!
        </p>

        {SOAL_TANTANGAN.map((item) => {
          const isSaved = savedSoal.has(item.no);
          return (
            <div
              key={item.no}
              className="rounded-xl border border-[#34673926] bg-white p-4"
            >
              <div className="flex gap-3">
                <QuestionNumber n={item.no} />
                <div className="flex-1 min-w-0 space-y-3">
                  <p className="text-sm leading-relaxed text-[#2C2C2A]">
                    {item.soal}
                  </p>
                  <div className="w-full">
                    <AnswerTextarea
                      value={answers[item.no] ?? ""}
                      onChange={setAnswer(item.no)}
                      placeholder="Tulis jawabanmu beserta cara dan langkah-langkahnya..."
                      disabled={isSaved}
                      rows={6}
                    />
                  </div>
                  {isSaved && (
                    <p className="text-xs text-[#346739] font-medium">
                      ✅ Jawaban tersimpan
                    </p>
                  )}
                </div>
              </div>

              <SaveButton
                onClick={() => handleSave(item.no)}
                hidden={isSaved}
                disabled={!answers[item.no]?.trim()}
              />
            </div>
          );
        })}
      </div>

      <div className="border-b-2 border-[#34673966] mt-8" />
    </section>
  );
}

// ============================================================================
// 2. ASESMEN DIRI SISWA — Checklist pemahaman
// ============================================================================

const ASESMEN_DIRI_ITEMS = [
  "Saya dapat menjelaskan perbedaan Kaidah Penjumlahan dan perkalian",
  "Saya dapat menghitung dan menyederhanakan faktorial",
  "Saya memahami kapan menggunakan permutasi (urutan penting)",
  "Saya memahami kapan menggunakan kombinasi (urutan tidak penting)",
  "Saya dapat membedakan permutasi dan kombinasi dari konteks soal",
  "Saya dapat menyelesaikan soal yang melibatkan syarat/pembatasan",
  "Saya dapat menjelaskan mengapa C(n,r) = P(n,r)÷r!",
  "Saya dapat menghubungkan materi ini dengan kehidupan nyata",
];

function AsesmenDiriSection() {
  const [selections, setSelections] = useState<Record<number, "ya" | "belum" | "ragu">>({});
  const [allSaved, setAllSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const setSelection = useCallback(
    (idx: number) => (val: "ya" | "belum" | "ragu") => {
      setSelections((prev) => ({ ...prev, [idx]: val }));
    },
    [],
  );

  const hasAnySelection = Object.keys(selections).length > 0;

  const handleSaveAll = () => {
    // TODO: integrate with backend API later
    console.log("[Asesmen Diri] All:", selections);
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setAllSaved(true);
      setSaving(false);
    }, 500);
  };

  return (
    <section className="mt-10">
      <SectionHeader
        icon={ClipboardCheckIcon}
        badge="ASESMEN DIRI"
        title="Asesmen Diri Siswa"
        subtitle="✅ Checklist Pemahaman — Isi dengan jujur setelah menyelesaikan seluruh modul"
      />

      <div className="rounded-xl bg-white p-5">
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#B8E6BC]">
                <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A] w-12">
                  No.
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A]">
                  Pernyataan
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A] w-20">
                  Ya ✅
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A] w-20">
                  Belum ❌
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A] w-20">
                  Ragu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              {ASESMEN_DIRI_ITEMS.map((item, idx) => {
                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}
                  >
                    <td className="px-4 py-3 text-center font-medium text-[#346739]">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-[#2C2C2A]">{item}</td>
                    {(["ya", "belum", "ragu"] as const).map((val) => (
                      <td key={val} className="px-4 py-3 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name={`asesmen-${idx}`}
                            value={val}
                            checked={selections[idx] === val}
                            onChange={() => setSelection(idx)(val)}
                            disabled={allSaved}
                            className="accent-[#346739] w-4 h-4"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Single save button at the end */}
        {allSaved ? (
          <p className="mt-4 text-center text-sm text-[#346739] font-medium">
            ✅ Semua asesmen diri telah tersimpan
          </p>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!hasAnySelection || saving}
              className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              {saving ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckIcon />
                  Simpan Semua Jawaban
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="border-b-2 border-[#34673966] mt-8" />
    </section>
  );
}

// ============================================================================
// 3. REFLEKSI MENDALAM — 6 pertanyaan reflektif
// ============================================================================

const REFLEKSI_QUESTIONS = [
  {
    no: 1,
    label: "Konsep yang paling saya pahami dengan baik adalah:",
    hint: "Tuliskan dan jelaskan kenapa kamu memahaminya!",
    placeholder: "Tulis konsep yang kamu pahami dan alasannya...",
  },
  {
    no: 2,
    label: "Saya masih bingung tentang:",
    hint: "Tuliskan dengan spesifik karena ini penting untuk belajar selanjutnya",
    placeholder: "Tulis konsep yang masih membingungkanmu...",
  },
  {
    no: 3,
    label: "Konsep yang paling sering membuat saya salah adalah:",
    hint: undefined,
    placeholder: "Tulis konsep yang sering membuatmu salah...",
  },
  {
    no: 4,
    label: "Cara yang saya gunakan untuk membedakan permutasi dan kombinasi:",
    hint: undefined,
    placeholder: "Jelaskan strategimu membedakan permutasi dan kombinasi...",
  },
  {
    no: 5,
    label:
      "Contoh penggunaan kaidah pencacahan dalam kehidupan sehari-hari yang saya temukan sendiri:",
    hint: undefined,
    placeholder: "Tulis contoh nyata yang kamu temukan...",
  },
  {
    no: 6,
    label: "Strategi belajarku selanjutnya untuk memperkuat pemahaman:",
    hint: undefined,
    placeholder: "Tulis rencana belajarmu selanjutnya...",
  },
];

function RefleksiMendalamSection() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set());

  const setAnswer = useCallback(
    (no: number) => (v: string) => {
      setAnswers((prev) => ({ ...prev, [no]: v }));
    },
    [],
  );

  const handleSave = (no: number) => {
    // TODO: integrate with backend API later
    console.log(`[Refleksi] No ${no}:`, answers[no] ?? "");
    setSavedItems((prev) => new Set(prev).add(no));
  };

  return (
    <section className="mt-10">
      <SectionHeader
        icon={LightbulbIcon}
        badge="REFLEKSI"
        title="Refleksi Mendalam"
        subtitle="Jawablah dengan jujur dan lengkap"
      />

      <div className="rounded-xl bg-white p-5 space-y-5">
        {REFLEKSI_QUESTIONS.map((q) => {
          const isSaved = savedItems.has(q.no);
          return (
            <div
              key={q.no}
              className="rounded-xl border border-[#34673926] bg-white p-4"
            >
              <div className="flex gap-3">
                <QuestionNumber n={q.no} />
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2A]">
                      {q.label}
                    </p>
                  </div>
                  <AnswerTextarea
                    value={answers[q.no] ?? ""}
                    onChange={setAnswer(q.no)}
                    placeholder={q.hint || q.placeholder}
                    disabled={isSaved}
                    rows={3}
                  />
                  {isSaved && (
                    <p className="text-xs text-[#346739] font-medium">
                      ✅ Jawaban tersimpan
                    </p>
                  )}
                </div>
              </div>

              <SaveButton
                onClick={() => handleSave(q.no)}
                hidden={isSaved}
                disabled={!answers[q.no]?.trim()}
              />
            </div>
          );
        })}
      </div>

      <div className="border-b-2 border-[#34673966] mt-8" />
    </section>
  );
}

// ============================================================================
// 4. RANGKUMAN KONSEP — Poin-poin penting (static)
// ============================================================================

const RANGKUMAN_POINTS = [
  {
    title: "Kaidah Penjumlahan",
    items: [
      "Gunakan ketika: memilih <strong>satu dari beberapa kelompok</strong> (kata kunci: <strong>ATAU</strong>)",
      "Rumus: Total = n₁ + n₂ + ... + nₖ",
      "Syarat: <strong>kejadian-kejadian saling lepas</strong>",
    ],
  },
  {
    title: "Kaidah Perkalian",
    items: [
      "Gunakan ketika: <strong>beberapa tahap</strong> harus dilalui semua (kata kunci: <strong>DAN</strong>)",
      "Rumus: Total = n₁ × n₂ × ... × nₖ",
      "Visualisasi: Diagram Pohon, Tabel, Pengisian tempat",
    ],
  },
  {
    title: "Faktorial",
    items: [
      "Definisi: n! = n × (n−1) × ... × 1",
      "Sifat: n! = n × (n−1)!",
      "Kasus khusus: 0! = 1",
    ],
  },
  {
    title: "Permutasi",
    items: [
      "Gunakan ketika: <strong>urutan penting</strong> (jabatan, kode, susunan)",
      "Rumus: P(n,r) = n!/(n−r)!",
      "Permutasi semua: P(n,n) = n!",
      "Dengan unsur sama: P = n!/(k₁!·k₂!·...)",
    ],
  },
  {
    title: "Kombinasi",
    items: [
      "Gunakan ketika: <strong>urutan tidak penting</strong> (tim, kelompok, memilih)",
      "Rumus: C(n,r) = n!/(r!·(n−r)!)",
      "Hubungan: C(n,r) = P(n,r)/r!",
      "Sifat simetri: C(n,r) = C(n,n−r)",
    ],
  },
];

function RangkumanKonsepSection() {
  return (
    <section className="mt-10">
      <SectionHeader
        icon={BookOpenIcon}
        badge="RANGKUMAN"
        title="Rangkuman Konsep"
        subtitle="📌 Poin-Poin Penting"
      />

      <div className="rounded-xl bg-white p-5 space-y-4">
        {RANGKUMAN_POINTS.map((point, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#34673926] bg-[#F9FAF6] p-4"
          >
            <h3 className="text-base font-bold text-[#346739] mb-2">
              {idx + 1}. {point.title}
            </h3>
            <ul className="space-y-1.5">
              {point.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[#2C2C2A]"
                >
                  <span className="text-[#346739] mt-1 flex-shrink-0">•</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-b-2 border-[#34673966] mt-8" />
    </section>
  );
}

// ============================================================================
// 5. GLOSARIUM — Daftar istilah (static)
// ============================================================================

const GLOSARIUM_ENTRIES = [
  {
    istilah: "Kaidah Pencacahan",
    definisi:
      "Prinsip-prinsip untuk menghitung banyaknya cara suatu kejadian dapat terjadi",
    contoh: "Menghitung banyak password, susunan tim, dll.",
  },
  {
    istilah: "Kaidah Penjumlahan",
    definisi:
      "Jika kejadian bersifat saling lepas, total cara adalah jumlah cara masing-masing",
    contoh: "Pilih satu dari 3 rute: 3 cara",
  },
  {
    istilah: "Kaidah Perkalian",
    definisi:
      "Jika kejadian dilakukan bertahap, total cara adalah perkalian cara setiap tahap",
    contoh: "3 baju × 4 celana = 12 kombinasi",
  },
  {
    istilah: "Faktorial",
    definisi: "Perkalian berurutan dari n hingga 1; ditulis n!",
    contoh: "5! = 120",
  },
  {
    istilah: "Permutasi",
    definisi: "Susunan objek dengan memperhatikan urutan",
    contoh: "Susunan ketua-wakil-sekretaris",
  },
  {
    istilah: "Kombinasi",
    definisi: "Pemilihan objek tanpa memperhatikan urutan",
    contoh: "Pemilihan anggota tim",
  },
  {
    istilah: "Mutually Exclusive",
    definisi:
      "Dua kejadian yang tidak dapat terjadi bersamaan",
    contoh:
      "Dadu menunjukkan 1 atau 2 secara bersamaan — tidak mungkin",
  },
  {
    istilah: "Unsur yang Sama (Identik)",
    definisi:
      "Objek-objek dalam permutasi yang tidak dapat dibedakan",
    contoh: 'Huruf "A" dalam kata "MATEMATIKA"',
  },
  {
    istilah: "n",
    definisi: "Jumlah objek yang tersedia/total",
    contoh: "Ada 10 kandidat: n = 10",
  },
  {
    istilah: "r",
    definisi: "Jumlah objek yang dipilih/disusun",
    contoh: "Pilih 3 orang: r = 3",
  },
  {
    istilah: "C(n,r) atau Cᵣⁿ",
    definisi: "Notasi kombinasi dari n pilih r",
    contoh: "C(10,3) = 120",
  },
  {
    istilah: "P(n,r)",
    definisi: "Notasi permutasi dari n pilih r",
    contoh: "P(10,3) = 720",
  },
];

function GlosariumSection() {
  return (
    <section className="mt-10">
      <SectionHeader
        icon={BookMarkedIcon}
        badge="GLOSARIUM"
        title="Glosarium"
        subtitle="Daftar istilah penting dalam modul ini"
      />

      <div className="rounded-xl bg-white p-5">
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#B8E6BC]">
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A] w-1/5">
                  Istilah
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A]">
                  Definisi
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A] w-1/4">
                  Contoh
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              {GLOSARIUM_ENTRIES.map((entry, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}
                >
                  <td className="px-4 py-3 font-semibold text-[#346739]">
                    {entry.istilah}
                  </td>
                  <td className="px-4 py-3 text-[#2C2C2A]">{entry.definisi}</td>
                  <td className="px-4 py-3 text-[#6B6B66] italic text-xs">
                    {entry.contoh}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Main Export: Gabungkan semua section
// ============================================================================

export default function PenutupContent() {
  return (
    <div className="space-y-2">
      <TantanganSection />
      <AsesmenDiriSection />
      <RefleksiMendalamSection />
      <RangkumanKonsepSection />
      <GlosariumSection />
    </div>
  );
}
