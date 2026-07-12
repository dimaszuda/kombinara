"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconClock, IconUserPair } from "@/components/activity/ActivityIcons";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// ── Situations data ──
const SITUASI = [
  {
    kode: "A",
    teks: "Memilih satu warna cat dari 5 warna merek X atau 4 warna merek Y untuk mengecat kamar",
    illust: "Kaleng cat berbagai warna",
  },
  {
    kode: "B",
    teks: "Membuat kode loker: 1 huruf (dari A–E) diikuti 1 angka (dari 1–4)",
    illust: "Loker dengan kode huruf-angka",
  },
  {
    kode: "C",
    teks: "Memilih satu film untuk ditonton: 6 film aksi atau 4 film komedi atau 3 film horor",
    illust: "Poster berbagai genre film",
  },
  {
    kode: "D",
    teks: "Memesan paket makan siang: pilih 1 nasi (dari 3 jenis) dan 1 lauk (dari 5 jenis)",
    illust: "Meja makan dengan pilihan menu",
  },
  {
    kode: "E",
    teks: "Memilih satu hadiah ulang tahun: buku (8 pilihan) atau mainan (5 pilihan)",
    illust: "Rak buku & mainan",
  },
  {
    kode: "F",
    teks: "Membuat username: 2 huruf pertama (dari A–Z) diikuti 2 angka (dari 0–9), boleh berulang",
    illust: "Form pendaftaran username",
  },
  {
    kode: "G",
    teks: "Memilih satu jurusan kuliah: IPA (6 jurusan) atau IPS (7 jurusan) atau Vokasi (4 jurusan)",
    illust: "Brosur jurusan kuliah",
  },
  {
    kode: "H",
    teks: "Membuat PIN ATM baru: 4 digit angka (0–9), setiap digit bebas dipilih",
    illust: "Mesin ATM & keypad angka",
  },
  {
    kode: "I",
    teks: "Memilih satu mata pelajaran untuk diperdalam: Matematika (3 topik) atau Fisika (4 topik)",
    illust: "Buku pelajaran Matematika & Fisika",
  },
  {
    kode: "J",
    teks: "Mendaftar lomba: pilih kategori (3 pilihan) dan pilih hari lomba (2 pilihan)",
    illust: "Formulir pendaftaran lomba",
  },
];

type AturanValue = "" | "penjumlahan" | "perkalian";

function AturanRadio({
  name,
  value,
  onChange,
}: {
  name: string;
  value: AturanValue;
  onChange: (v: AturanValue) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {(["penjumlahan", "perkalian"] as AturanValue[]).map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-green-700"
          />
          <span className="text-sm capitalize font-medium text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── Main Page ──

type AnswerRow = { aturan: AturanValue };

export default function AktivitasKP2() {
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>(
    Object.fromEntries(SITUASI.map((s) => [s.kode, { aturan: "" }]))
  );
  const [diskusi, setDiskusi] = useState({ a: "", b: "", c: "", d: "" });
  const [submitted, setSubmitted] = useState(false);

  function setAturan(kode: string, val: AturanValue) {
    setAnswers((prev) => ({ ...prev, [kode]: { aturan: val } }));
  }

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
              <span className="font-semibold">Aktivitas 2</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.greenLight, color: C.green }}
              >
                <IconUserPair /> PASANGAN
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.green, color: C.white }}
              >
                <IconClock /> 20 menit
              </span>
              {["IK-1.1", "IK-3.1", "IK-4.2"].map((ind) => (
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
                style={{ color: "#C9962B" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C9962B" }} />
                Joyful
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#2A5A8C" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} />
                Mindful
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
              &ldquo;Sortir Kasus&rdquo;
            </h1>
          </div>

          {/* ── PETUNJUK ── */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: C.greenLight }}>
            <p className="text-sm font-bold" style={{ color: C.green }}>
              📋 Petunjuk
            </p>
            <p className="text-sm text-slate-700">
              Bersama pasanganmu, klasifikasikan setiap situasi berikut ke dalam aturan yang
              tepat. Yang terpenting adalah <strong>alasan kalian</strong> — bukan sekadar
              jawabannya.
            </p>
          </div>

          {/* ── DAFTAR SITUASI ── */}
          <div>
            <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>
              Daftar Situasi
            </h2>
            <div className="space-y-3">
              {SITUASI.map((s) => (
                <div
                  key={s.kode}
                  className="rounded-xl p-4"
                  style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
                >
                  <div className="flex gap-3 items-start">
                    {/* Kode badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: C.green }}
                    >
                      {s.kode}
                    </div>
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3 items-start">
                        <p className="text-sm text-slate-700 flex-1">{s.teks}</p>
                        {/* <IllustPlaceholder label={s.illust} /> */}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">Aturan:</span>
                        <AturanRadio
                          name={`situasi-${s.kode}`}
                          value={answers[s.kode]?.aturan ?? ""}
                          onChange={(v) => setAturan(s.kode, v)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DISKUSI PASANGAN ── */}
          <div>
            <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>
              Diskusi Pasangan
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Setelah mengisi tabel, diskusikan bersama pasanganmu:
            </p>
            <div className="space-y-4">
              {[
                {
                  key: "a" as const,
                  label:
                    "(a) Adakah situasi yang sempat membuat kalian ragu? Situasi mana? Mengapa?",
                },
                {
                  key: "b" as const,
                  label:
                    "(b) Dari 10 situasi di atas, temukan pola kata yang sering muncul pada situasi penjumlahan:",
                },
                {
                  key: "c" as const,
                  label:
                    "(c) Temukan pola situasi yang sering muncul pada aturan perkalian:",
                },
                {
                  key: "d" as const,
                  label:
                    "(d) Rumuskan bersama: dengan kalimat kalian sendiri, apa perbedaan mendasar antara aturan penjumlahan dan perkalian?",
                },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label
                    htmlFor={`diskusi-${key}`}
                    className="text-sm font-medium text-slate-700 block mb-2"
                  >
                    {label}
                  </label>
                  <textarea
                    id={`diskusi-${key}`}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] resize-none"
                    style={{ borderColor: C.border }}
                    value={diskusi[key]}
                    onChange={(e) =>
                      setDiskusi((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder="Tuliskan diskusi kalian..."
                  />
                </div>
              ))}
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
