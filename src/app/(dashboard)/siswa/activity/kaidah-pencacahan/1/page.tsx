"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconClock, IconUserSolo } from "@/components/activity/ActivityIcons";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

const ATURAN_OPTIONS = [
  { value: "penjumlahan", label: "Penjumlahan" },
  { value: "perkalian", label: "Perkalian" },
];

// ── Shared helpers ──

function IllustPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex-shrink-0 w-36 h-28 rounded-xl flex flex-col items-center justify-center gap-2 p-2"
      style={{ background: C.greenLight, border: `1.5px dashed ${C.green}` }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="text-xs text-center leading-tight" style={{ color: C.green }}>
        {label}
      </span>
    </div>
  );
}

function AturanSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label htmlFor={id} className="text-sm font-medium text-slate-600">
        Aturan yang digunakan:
      </label>
      <select
        id={id}
        className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— pilih aturan —</option>
        {ATURAN_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full"
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function YaTidak({
  question,
  name,
  value,
  onChange,
}: {
  question: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-slate-600 italic">{question}</span>
      {["ya", "tidak"].map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-green-700"
          />
          <span className="capitalize font-medium text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function SituasiLabel({ nomor }: { nomor: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: C.green }}
      >
        {nomor}
      </div>
      <span className="font-bold text-sm" style={{ color: C.green }}>
        Situasi {nomor}
      </span>
    </div>
  );
}

function SubBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
    >
      <p className="text-sm font-semibold" style={{ color: C.green }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Main Page ──

export default function AktivitasKP1() {
  const [s1, setS1] = useState({ bersamaan: "", aturan: "", hitungan: "" });
  const [s2, setS2] = useState({ bersamaan: "", aturan: "", hitungan: "" });
  const [s3, setS3] = useState({ aturan: "", hitungan: "" });
  const [s4, setS4] = useState({
    aturanA: "", hitunganA: "",
    aturanB: "", hitunganB: "",
    aturanGabungan: "", hitunganGabungan: "",
    total: "",
  });
  const [s5, setS5] = useState({ hitunganA: "", hitunganB: "", total: "" });
  const [refleksi1, setRefleksi1] = useState("");
  const [refleksi2, setRefleksi2] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen py-8 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div
          className="border-2 rounded-2xl p-6 space-y-8"
          style={{ borderColor: C.greenLight }}
        >
          {/* ── HEADER ── */}
          <div>
            <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: C.green }}>
              <Link
                href="/siswa/activity/kaidah-pencacahan"
                className="hover:underline font-medium opacity-70"
              >
                Kaidah Pencacahan
              </Link>
              <span className="opacity-40">›</span>
              <span className="font-semibold">Aktivitas 1</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.greenLight, color: C.green }}
              >
                <IconUserSolo /> INDIVIDU
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.green, color: C.white }}
              >
                <IconClock /> 15 menit
              </span>
              {["IK-1.1", "IK-3.1"].map((ind) => (
                <span
                  key={ind}
                  className="rounded-md px-2.5 py-1 text-xs font-semibold border"
                  style={{ borderColor: C.green, color: C.green }}
                >
                  {ind}
                </span>
              ))}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#2A5A8C" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#2A5A8C" }}
                />
                Mindful
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
              &ldquo;Aku Setektif Pilihan&rdquo;
            </h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: C.green }}>
              (Mindful)
            </p>
          </div>

          {/* ── PETUNJUK ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: C.greenLight }}
          >
            <p className="text-sm font-bold" style={{ color: C.green }}>
              📋 Petunjuk
            </p>
            <p className="text-sm text-slate-700">
              Sebelum menghitung, analisis dulu setiap situasi. Jawab pertanyaan panduan,
              tentukan aturan yang digunakan, lalu hitung.
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pertanyaan Panduan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className="rounded-lg bg-white p-3 border-l-4"
                style={{ borderLeftColor: C.green }}
              >
                <p className="text-sm text-slate-700">
                  🤔 &ldquo;Apakah semua tahap harus dilakukan <strong>sekaligus</strong>?&rdquo;
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: C.green }}>
                  → Jika YA → Perkalian
                </p>
              </div>
              <div
                className="rounded-lg bg-white p-3 border-l-4"
                style={{ borderLeftColor: "#2A5A8C" }}
              >
                <p className="text-sm text-slate-700">
                  🤔 &ldquo;Apakah hanya <strong>satu pilihan</strong> dari beberapa kelompok (saling lepas)?&rdquo;
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#2A5A8C" }}>
                  → Jika YA → Penjumlahan
                </p>
              </div>
            </div>
          </div>

          {/* ── SITUASI 1 ── */}
          <div>
            <SituasiLabel nomor={1} />
            <div className="flex gap-4">
              {/* <IllustPlaceholder label="Koperasi: pensil & pulpen" /> */}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-700">
                  Di koperasi sekolah tersedia <strong>4 jenis pensil</strong> dan{" "}
                  <strong>3 jenis pulpen</strong>. Seorang siswa ingin membeli{" "}
                  <em>satu alat tulis saja</em>. Berapa banyak kemungkinan pilihan siswa?
                </p>
                <YaTidak
                  question="Apakah siswa membeli pensil dan pulpen sekaligus?"
                  name="s1-bersamaan"
                  value={s1.bersamaan}
                  onChange={(v) => setS1((p) => ({ ...p, bersamaan: v }))}
                />
                <AturanSelect
                  id="s1-aturan"
                  value={s1.aturan}
                  onChange={(v) => setS1((p) => ({ ...p, aturan: v }))}
                />
                <TextInput
                  id="s1-hitungan"
                  label="Hitungan:"
                  value={s1.hitungan}
                  onChange={(v) => setS1((p) => ({ ...p, hitungan: v }))}
                  placeholder="Contoh: 4 + 3 = 7"
                />
              </div>
            </div>
          </div>

          {/* ── SITUASI 2 ── */}
          <div>
            <SituasiLabel nomor={2} />
            <div className="flex gap-4">
              {/* <IllustPlaceholder label="Seragam: kemeja & celana" /> */}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-700">
                  Koperasi yang sama menjual <strong>seragam lengkap</strong>. Siswa harus membeli
                  1 kemeja (dari <strong>3 pilihan warna</strong>) dan 1 celana (dari{" "}
                  <strong>2 pilihan warna</strong>). Berapa banyak pasangan baju dan celana yang
                  bisa dikenakan siswa?
                </p>
                <YaTidak
                  question="Apakah siswa harus memilih kemeja dan celana sekaligus?"
                  name="s2-bersamaan"
                  value={s2.bersamaan}
                  onChange={(v) => setS2((p) => ({ ...p, bersamaan: v }))}
                />
                <AturanSelect
                  id="s2-aturan"
                  value={s2.aturan}
                  onChange={(v) => setS2((p) => ({ ...p, aturan: v }))}
                />
                <TextInput
                  id="s2-hitungan"
                  label="Hitungan:"
                  value={s2.hitungan}
                  onChange={(v) => setS2((p) => ({ ...p, hitungan: v }))}
                  placeholder="Contoh: 3 × 2 = 6"
                />
              </div>
            </div>
          </div>

          {/* ── SITUASI 3 ── */}
          <div>
            <SituasiLabel nomor={3} />
            <div className="flex gap-4">
              {/* <IllustPlaceholder label="Ekskul olahraga & seni" /> */}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-700">
                  Ekskul sekolah membuka pendaftaran: ada <strong>5 ekskul olahraga</strong> dan{" "}
                  <strong>4 ekskul seni</strong>. Seorang siswa{" "}
                  <em>hanya boleh memilih satu ekskul</em>. Berapa banyak kemungkinan ekskul
                  yang dipilih oleh siswa?
                </p>
                <AturanSelect
                  id="s3-aturan"
                  value={s3.aturan}
                  onChange={(v) => setS3((p) => ({ ...p, aturan: v }))}
                />
                <TextInput
                  id="s3-hitungan"
                  label="Hitungan:"
                  value={s3.hitungan}
                  onChange={(v) => setS3((p) => ({ ...p, hitungan: v }))}
                  placeholder="Contoh: 5 + 4 = 9"
                />
              </div>
            </div>
          </div>

          {/* ── SITUASI 4 ── */}
          <div>
            <SituasiLabel nomor={4} />
            <div className="flex gap-4 mb-4">
              {/* <IllustPlaceholder label="Bioskop: film & pilihan jadwal" /> */}
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  <strong>Rina</strong> ingin memesan tiket bioskop. Tersedia dua bioskop di
                  kotanya:
                </p>
                <ul className="text-sm text-slate-700 mt-2 space-y-1 list-disc pl-5">
                  <li>
                    <strong>Bioskop A</strong>: 3 film sedang tayang, masing-masing tersedia dalam
                    2 jadwal
                  </li>
                  <li>
                    <strong>Bioskop B</strong>: 2 film sedang tayang, masing-masing tersedia dalam
                    3 jadwal
                  </li>
                </ul>
                <p className="text-sm text-slate-700 mt-2">
                  Rina <em>hanya akan pergi ke satu bioskop</em>. Berapa banyak pilihan tontonan
                  (film + jadwal)?
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <SubBox title="Bioskop A">
                <AturanSelect
                  id="s4-aturanA"
                  value={s4.aturanA}
                  onChange={(v) => setS4((p) => ({ ...p, aturanA: v }))}
                />
                <TextInput
                  id="s4-hitunganA"
                  label="Hitungan:"
                  value={s4.hitunganA}
                  onChange={(v) => setS4((p) => ({ ...p, hitunganA: v }))}
                  placeholder="3 × 2 = ..."
                />
              </SubBox>
              <SubBox title="Bioskop B">
                <AturanSelect
                  id="s4-aturanB"
                  value={s4.aturanB}
                  onChange={(v) => setS4((p) => ({ ...p, aturanB: v }))}
                />
                <TextInput
                  id="s4-hitunganB"
                  label="Hitungan:"
                  value={s4.hitunganB}
                  onChange={(v) => setS4((p) => ({ ...p, hitunganB: v }))}
                  placeholder="2 × 3 = ..."
                />
              </SubBox>
            </div>
            <div
              className="mt-3 rounded-xl p-4 space-y-3"
              style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
            >
              <p className="text-sm font-semibold text-slate-600">
                Rina menonton di{" "}
                <em>
                  Bioskop A <strong>atau</strong> Bioskop B
                </em>
              </p>
              <AturanSelect
                id="s4-aturanGabungan"
                value={s4.aturanGabungan}
                onChange={(v) => setS4((p) => ({ ...p, aturanGabungan: v }))}
              />
              <TextInput
                id="s4-hitunganGabungan"
                label="Hitungan:"
                value={s4.hitunganGabungan}
                onChange={(v) => setS4((p) => ({ ...p, hitunganGabungan: v }))}
              />
              <TextInput
                id="s4-total"
                label="Jadi, banyak pilihan tontonan Rina ada … pilihan:"
                value={s4.total}
                onChange={(v) => setS4((p) => ({ ...p, total: v }))}
                placeholder="..."
              />
            </div>
          </div>

          {/* ── SITUASI 5 ── */}
          <div>
            <SituasiLabel nomor={5} />
            <div className="flex gap-4 mb-4">
              {/* <IllustPlaceholder label="Soal ujian: dua bagian" /> */}
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  Sebuah soal ujian terdiri dari 2 bagian:
                </p>
                <ul className="text-sm text-slate-700 mt-2 space-y-1 list-disc pl-5">
                  <li>
                    <strong>Bagian A</strong> (pilihan ganda): 6 soal tersedia, siswa mengerjakan{" "}
                    <em>5 soal</em>
                  </li>
                  <li>
                    <strong>Bagian B</strong> (isian): 3 soal tersedia, siswa mengerjakan{" "}
                    <em>2 soal</em>
                  </li>
                </ul>
                <p className="text-sm text-slate-700 mt-2">
                  Berapa banyak kombinasi soal yang bisa dipilih siswa?
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <SubBox title="Bagian A — Pilih 5 dari 6 soal">
                <TextInput
                  id="s5-hitunganA"
                  label="Hitungan:"
                  value={s5.hitunganA}
                  onChange={(v) => setS5((p) => ({ ...p, hitunganA: v }))}
                  placeholder="Tuliskan caranya..."
                />
              </SubBox>
              <SubBox title="Bagian B — Pilih 2 dari 3 soal">
                <TextInput
                  id="s5-hitunganB"
                  label="Hitungan:"
                  value={s5.hitunganB}
                  onChange={(v) => setS5((p) => ({ ...p, hitunganB: v }))}
                  placeholder="Tuliskan caranya..."
                />
              </SubBox>
            </div>
            <div
              className="mt-3 rounded-xl p-4"
              style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
            >
              <TextInput
                id="s5-total"
                label="Banyak kemungkinan kombinasi soal adalah:"
                value={s5.total}
                onChange={(v) => setS5((p) => ({ ...p, total: v }))}
                placeholder="..."
              />
            </div>
          </div>

          {/* ── REFLEKSI INDIVIDU ── */}
          <div>
            <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>
              Refleksi Individu
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="refleksi1"
                  className="text-sm font-medium text-slate-700 block mb-2"
                >
                  Dari kelima situasi di atas, apa pola yang kamu temukan untuk membedakan kapan
                  menggunakan penjumlahan dan kapan menggunakan perkalian?
                </label>
                <textarea
                  id="refleksi1"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] resize-none"
                  style={{ borderColor: C.border }}
                  value={refleksi1}
                  onChange={(e) => setRefleksi1(e.target.value)}
                  placeholder="Tuliskan refleksimu..."
                />
              </div>
              <div>
                <label
                  htmlFor="refleksi2"
                  className="text-sm font-medium text-slate-700 block mb-2"
                >
                  Situasi mana yang paling sulit dianalisis? Mengapa?
                </label>
                <textarea
                  id="refleksi2"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] resize-none"
                  style={{ borderColor: C.border }}
                  value={refleksi2}
                  onChange={(e) => setRefleksi2(e.target.value)}
                  placeholder="Tuliskan refleksimu..."
                />
              </div>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          {submitted ? (
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: C.greenLight }}
            >
              <p className="font-bold text-base" style={{ color: C.green }}>
                ✓ Jawaban berhasil dikumpulkan!
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Gurumu akan memeriksa jawabanmu segera.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full rounded-xl py-3 font-bold text-sm transition-opacity hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: C.green, color: C.white }}
            >
              Kumpulkan Jawaban
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
