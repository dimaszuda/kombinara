"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconClock, IconUserGroup } from "@/components/activity/ActivityIcons";

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
        Aturan:
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

function StepBadge({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: C.purple }}
      >
        {step}
      </div>
      <h2 className="text-base font-bold" style={{ color: C.purple }}>
        {title}
      </h2>
    </div>
  );
}

// ── Main Page ──

export default function AktivitasKP3() {
  // Step 1
  const [sistemA, setSistemA] = useState({ total: "", aturan: "", alasan: "" });
  const [sistemB, setSistemB] = useState({ total: "", aturan: "", alasan: "" });
  // Step 2
  const [rancangan, setRancangan] = useState({
    deskripsi: "",
    totalKode: "",
    cukup: "",
    alasanCukup: "",
  });
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
              <span className="font-semibold">Aktivitas 3</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.greenLight, color: C.green }}
              >
                <IconUserGroup /> KELOMPOK KECIL (4 Orang)
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.green, color: C.white }}
              >
                <IconClock /> 30 menit
              </span>
              {["IK-1.1", "IK-3.1", "IK-4.1", "IK-4.2", "IK-5.4"].map((ind) => (
                <span
                  key={ind}
                  className="rounded-md px-2.5 py-1 text-xs font-semibold border"
                  style={{ borderColor: C.green, color: C.green }}
                >
                  {ind}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#C9962B" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C9962B" }} /> Joyful
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#4CAF50" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4CAF50" }} /> Meaningful
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5A8C" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} /> Mindful
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
              &ldquo;Rancang Sistemmu Sendiri&rdquo;
            </h1>
          </div>

          {/* ── KONTEKS ── */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: C.greenLight }}>
            <p className="text-sm font-bold" style={{ color: C.green }}>
              🏫 Konteks
            </p>
            <p className="text-sm text-slate-700">
              Sekolahmu akan membuat <strong>sistem kode unik</strong> untuk kartu identitas siswa
              baru. Kelompokmu bertugas merancang sistemnya dan menghitung berapa banyak kode yang
              bisa dihasilkan.
            </p>
          </div>

          {/* ── LANGKAH 1 ── */}
          <div>
            <StepBadge step={1} title="Pahami Perbedaan Dua Sistem (5 menit)" />

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Sistem A */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* <IllustPlaceholder label="Sistem A: kode tunggal (warna / romawi / huruf)" className="w-full h-24" /> */}
                </div>
                <p className="text-sm font-bold" style={{ color: C.green }}>
                  Sistem A — Kode Tunggal
                </p>
                <p className="text-xs text-slate-600">
                  Siswa mendapat kode berdasarkan <em>salah satu</em> kategori:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Kode warna: merah, biru, hijau, kuning (4 pilihan)</li>
                  <li>Kode angka romawi: I, II, III, V (4 pilihan)</li>
                  <li>Kode huruf: A, B, C (3 pilihan)</li>
                </ul>
                <AturanSelect
                  id="sistemA-aturan"
                  value={sistemA.aturan}
                  onChange={(v) => setSistemA((p) => ({ ...p, aturan: v }))}
                />
                <TextInput
                  id="sistemA-total"
                  label="Total kode berbeda:"
                  value={sistemA.total}
                  onChange={(v) => setSistemA((p) => ({ ...p, total: v }))}
                  placeholder="Contoh: 4 + 4 + 3 = 11"
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor="sistemA-alasan" className="text-xs font-semibold text-slate-500">
                    Mengapa menggunakan aturan tersebut?
                  </label>
                  <textarea
                    id="sistemA-alasan"
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[56px] resize-none"
                    style={{ borderColor: C.border }}
                    value={sistemA.alasan}
                    onChange={(e) => setSistemA((p) => ({ ...p, alasan: e.target.value }))}
                    placeholder="Tuliskan alasanmu..."
                  />
                </div>
              </div>

              {/* Sistem B */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
              >
                {/* <IllustPlaceholder label="Sistem B: kode kombinasi warna + romawi + huruf" className="w-full h-24" /> */}
                <p className="text-sm font-bold" style={{ color: C.green }}>
                  Sistem B — Kode Kombinasi
                </p>
                <p className="text-xs text-slate-600">
                  Setiap kode terdiri dari <em>3 bagian sekaligus</em>:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Bagian 1: warna (4 pilihan)</li>
                  <li>Bagian 2: angka romawi (4 pilihan)</li>
                  <li>Bagian 3: huruf (3 pilihan)</li>
                </ul>
                <AturanSelect
                  id="sistemB-aturan"
                  value={sistemB.aturan}
                  onChange={(v) => setSistemB((p) => ({ ...p, aturan: v }))}
                />
                <TextInput
                  id="sistemB-total"
                  label="Total kode berbeda:"
                  value={sistemB.total}
                  onChange={(v) => setSistemB((p) => ({ ...p, total: v }))}
                  placeholder="Contoh: 4 × 4 × 3 = 48"
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor="sistemB-alasan" className="text-xs font-semibold text-slate-500">
                    Mengapa menggunakan aturan tersebut?
                  </label>
                  <textarea
                    id="sistemB-alasan"
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[56px] resize-none"
                    style={{ borderColor: C.border }}
                    value={sistemB.alasan}
                    onChange={(e) => setSistemB((p) => ({ ...p, alasan: e.target.value }))}
                    placeholder="Tuliskan alasanmu..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── LANGKAH 2 ── */}
          <div>
            <StepBadge step={2} title="Rancang Sistem Kalian Sendiri (10 menit)" />
            <div
              className="rounded-xl p-4 space-y-2 mb-4"
              style={{ backgroundColor: C.greenLight }}
            >
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Ketentuan
              </p>
              <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                <li>Harus ada minimal satu bagian yang menggunakan aturan penjumlahan</li>
                <li>Harus ada minimal satu bagian yang menggunakan aturan perkalian</li>
                <li>Total kode harus mampu menampung minimal <strong>500 siswa</strong></li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* <IllustPlaceholder label="Sketsa rancangan sistem kode kelompok kalian" className="w-40 h-32 flex-shrink-0" /> */}
                <div className="flex-1 flex flex-col gap-1">
                  <label htmlFor="rancangan-deskripsi" className="text-xs font-semibold text-slate-500">
                    Rancangan Sistem Kode Kelompok Kami:
                  </label>
                  <textarea
                    id="rancangan-deskripsi"
                    className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[96px] resize-none"
                    style={{ borderColor: C.border }}
                    value={rancangan.deskripsi}
                    onChange={(e) =>
                      setRancangan((p) => ({ ...p, deskripsi: e.target.value }))
                    }
                    placeholder="Deskripsikan bagian-bagian kode yang kalian rancang, beserta jumlah pilihan dan aturan yang digunakan..."
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput
                  id="rancangan-totalKode"
                  label="Total kode yang bisa dihasilkan:"
                  value={rancangan.totalKode}
                  onChange={(v) => setRancangan((p) => ({ ...p, totalKode: v }))}
                  placeholder="= ..."
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Apakah mencukupi untuk 500 siswa?
                  </span>
                  <div className="flex items-center gap-4">
                    {["ya", "tidak"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="rancangan-cukup"
                          value={opt}
                          checked={rancangan.cukup === opt}
                          onChange={() => setRancangan((p) => ({ ...p, cukup: opt }))}
                          className="accent-green-700"
                        />
                        <span className="text-sm capitalize font-medium text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="rancangan-alasan" className="text-xs font-semibold text-slate-500">
                  Mengapa?
                </label>
                <textarea
                  id="rancangan-alasan"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] resize-none"
                  style={{ borderColor: C.border }}
                  value={rancangan.alasanCukup}
                  onChange={(e) => setRancangan((p) => ({ ...p, alasanCukup: e.target.value }))}
                  placeholder="Jelaskan mengapa cukup atau tidak..."
                />
              </div>
            </div>
          </div>

          {/* ── LANGKAH 3 ── */}
          <div>
            <StepBadge step={3} title="Presentasi & Adu Argumen (5 menit)" />
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
            >
              <p className="text-sm text-slate-700">
                Setiap kelompok mempresentasikan rancangan sistemnya. Kelompok lain boleh
                menantang dengan pertanyaan:
              </p>
              <ul className="text-sm text-slate-600 space-y-2 list-none">
                {[
                  "\"Mengapa bagian ini menggunakan penjumlahan bukan perkalian?\"",
                  "\"Apakah kode yang dihasilkan benar-benar unik semua?\"",
                  "\"Apakah ada cara yang lebih efisien untuk mencapai 500 kode?\"",
                ].map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-base leading-snug" style={{ color: C.green }}>
                      →
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-1">
                Catatan: pastikan jawaban kalian siap sebelum presentasi dimulai.
              </p>
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
