"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { IconClock, IconUserSolo } from "@/components/activity/ActivityIcons";
import { RichText } from "@/components/shared/RichText";

// ── Color palette ──
const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// ── Types ──
type ContohNonContoh = "" | "contoh" | "noncontoh";
type YaTidak = "" | "ya" | "tidak";

interface SoalA1 {
  contoh: ContohNonContoh;
  alasan: string;
}

// ═══════════════════════════════════════════════════════════════════
// ── SITUASI DATA ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const SITUASI_A1 = [
  "Menyusun 3 dari 8 nama menjadi Juara 1, Juara 2, Juara 3 pada lomba lari.",
  "Mengatur/menyusun 5 orang untuk duduk berjajar di bangku panjang.",
  "Menyusun panitia 5 orang dari 10 kandidat tanpa pembagian jabatan (semua peran setara).",
  "Mengurutkan 4 digit kode PIN dari angka 0–9 tanpa pengulangan.",
  "Menyusun kartu ucapan untuk 3 sahabat dari 3 desain kartu berbeda, di mana setiap sahabat menerima persis satu desain, tapi kartu tidak dibedakan siapa menerima kartu yang mana.",
];

interface SituasiKJ {
  nomor: number;
  judul: string;
  deskripsi: string;
  fields: {
    key: string;
    label: string;
    type: "yaTidak" | "text";
    hint?: string;
  }[];
}

const SITUASI_KJ: SituasiKJ[] = [
  {
    nomor: 1,
    judul: "Situasi 1",
    deskripsi: "Dari 8 kandidat, akan dipilih dan disusun 3 orang untuk menjadi Ketua, Wakil, dan Sekretaris OSIS.",
    fields: [
      { key: "melingkar", label: "Apakah susunannya melingkar?", type: "yaTidak" },
      { key: "identik", label: "Apakah ada objek identik?", type: "yaTidak" },
      { key: "urutanPenting", label: "Apakah urutan penting?", type: "yaTidak" },
      { key: "jenis", label: "Jenis permutasi:", type: "text" },
      { key: "rumus", label: "Rumus:", type: "text" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
  },
  {
    nomor: 2,
    judul: "Situasi 2",
    deskripsi: "7 anggota komunitas fotografer akan duduk mengelilingi meja bundar untuk rapat bulanan.",
    fields: [
      { key: "melingkar", label: "Apakah susunannya melingkar?", type: "yaTidak" },
      { key: "identik", label: "Apakah ada objek identik?", type: "yaTidak" },
      { key: "urutanPenting", label: "Apakah urutan penting?", type: "yaTidak" },
      { key: "jenis", label: "Jenis permutasi:", type: "text" },
      { key: "rumus", label: "Rumus:", type: "text" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
  },
  {
    nomor: 3,
    judul: "Situasi 3",
    deskripsi: 'Berapa banyak susunan huruf berbeda dari kata "PROGRAM"?',
    fields: [
      { key: "melingkar", label: "Apakah susunannya melingkar?", type: "yaTidak" },
      { key: "hurufSama", label: "Apakah ada huruf yang sama? Sebutkan!", type: "text" },
      { key: "jenis", label: "Jenis permutasi:", type: "text" },
      { key: "rumus", label: "Rumus:", type: "text" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
  },
  {
    nomor: 4,
    judul: "Situasi 4",
    deskripsi: "Panitia pensi akan memilih dan mengurutkan 4 penampil dari 10 kelompok yang mendaftar untuk tampil di urutan ke-1, ke-2, ke-3, dan ke-4.",
    fields: [
      { key: "melingkar", label: "Apakah susunannya melingkar?", type: "yaTidak" },
      { key: "identik", label: "Apakah ada objek identik?", type: "yaTidak" },
      { key: "jenis", label: "Jenis permutasi:", type: "text" },
      { key: "rumus", label: "Rumus:", type: "text" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
  },
  {
    nomor: 5,
    judul: "Situasi 5",
    deskripsi: "Sebuah lampu lalu lintas menampilkan urutan warna: merah (3 kali), kuning (1 kali), hijau (2 kali) dalam satu siklus. Berapa banyak urutan warna yang berbeda?",
    fields: [
      { key: "melingkar", label: "Apakah susunannya melingkar?", type: "yaTidak" },
      { key: "warnaSama", label: "Apakah ada warna yang sama? Sebutkan!", type: "text" },
      { key: "jenis", label: "Jenis permutasi:", type: "text" },
      { key: "rumus", label: "Rumus:", type: "text" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// ── STEP DEFINITIONS ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

/** which section category a step belongs to */
type StepSection = "a1" | "rancang" | "kj";

interface StepConfig {
  index: number;
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
  section: StepSection;
  /** for KJ steps: index into SITUASI_KJ (0-4) */
  kjIdx?: number;
  /** for A1 steps: index into SITUASI_A1 (0-4) */
  a1Idx?: number;
}

function getSoalTextA1(idx: number): string {
  return "Situasi: " + SITUASI_A1[idx] + "\n\nTugas: Tentukan apakah situasi ini merupakan Contoh atau Non-contoh permutasi, dan jelaskan alasannya.";
}

function getSoalTextRancang(): string {
  return "Tugas: Buatlah satu contoh dan satu non-contoh permutasi versimu sendiri. Non-contohmu harus sengaja mengandung kata yang terdengar seperti permutasi, padahal sebenarnya bukan. Jelaskan alasannya.";
}

function getSoalTextKJ(si: number): string {
  const s = SITUASI_KJ[si];
  const labels = s.fields.map((f) => "- " + f.label).join("\n");
  return "Situasi: " + s.deskripsi + "\n\nTugas: Identifikasi jenis permutasi, rumus, dan jawabannya.\n\nPertanyaan:\n" + labels;
}

const STEPS: StepConfig[] = [
  // ── AKTIVITAS 1 — INDIVIDU (5 soal) ─────────────────────────
  { index: 0, questionKey: "a1_situasi_1", entryType: "soal", label: "Situasi 1", soalText: getSoalTextA1(0), section: "a1", a1Idx: 0 },
  { index: 1, questionKey: "a1_situasi_2", entryType: "soal", label: "Situasi 2", soalText: getSoalTextA1(1), section: "a1", a1Idx: 1 },
  { index: 2, questionKey: "a1_situasi_3", entryType: "soal", label: "Situasi 3", soalText: getSoalTextA1(2), section: "a1", a1Idx: 2 },
  { index: 3, questionKey: "a1_situasi_4", entryType: "soal", label: "Situasi 4", soalText: getSoalTextA1(3), section: "a1", a1Idx: 3 },
  { index: 4, questionKey: "a1_situasi_5", entryType: "soal", label: "Situasi 5", soalText: getSoalTextA1(4), section: "a1", a1Idx: 4 },
  // ── RANCANG SENDIRI ─────────────────────────────────────────
  { index: 5, questionKey: "rancang_sendiri", entryType: "soal", label: "Rancang Sendiri", soalText: getSoalTextRancang(), section: "rancang" },
  // ── KENALI JENISNYA (5 situasi) ─────────────────────────────
  { index: 6, questionKey: "kj_situasi_1", entryType: "soal", label: "Kenali Jenis — Situasi 1", soalText: getSoalTextKJ(0), section: "kj", kjIdx: 0 },
  { index: 7, questionKey: "kj_situasi_2", entryType: "soal", label: "Kenali Jenis — Situasi 2", soalText: getSoalTextKJ(1), section: "kj", kjIdx: 1 },
  { index: 8, questionKey: "kj_situasi_3", entryType: "soal", label: "Kenali Jenis — Situasi 3", soalText: getSoalTextKJ(2), section: "kj", kjIdx: 2 },
  { index: 9, questionKey: "kj_situasi_4", entryType: "soal", label: "Kenali Jenis — Situasi 4", soalText: getSoalTextKJ(3), section: "kj", kjIdx: 3 },
  { index: 10, questionKey: "kj_situasi_5", entryType: "soal", label: "Kenali Jenis — Situasi 5", soalText: getSoalTextKJ(4), section: "kj", kjIdx: 4 },
];

const TOTAL_STEPS = STEPS.length;

// ═══════════════════════════════════════════════════════════════════
// ── REUSABLE COMPONENTS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const isWrong = isCorrect === false;
  const bc = isWrong ? "border-[#C44F4F33]" : "border-[#34673933]";
  const bg = isWrong ? "bg-[#C44F4F08]" : "bg-[#34673908]";
  const lc = isWrong ? "text-[#C44F4F]" : "text-[#346739]";
  const ic = isWrong ? "❌" : "💬";
  const label = isWrong ? "Jawaban Kurang Tepat" : "Feedback Kombi";
  return (
    <div className={`mt-3 rounded-lg border ${bc} ${bg} p-3`}>
      <p className={`mb-1 text-xs font-medium ${lc}`}>{ic} {label}</p>
      <RichText className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{text}</RichText>
    </div>
  );
}

function SubmitButton({ isChecking, isCorrect, onClick }: { isChecking: boolean; isCorrect: boolean | null; onClick: () => void }) {
  if (isCorrect === true) return null; // hide button when correctly answered
  return (
    <div className="flex flex-col items-center gap-2 border-t pt-4 mt-4" style={{ borderColor: `${C.green}26` }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isChecking}
        className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {isChecking ? (<><Spinner /> Mengecek...</>) : "Simpan Jawaban"}
      </button>
    </div>
  );
}

function ProgressIndicator({ currentStep, feedbackMap }: { currentStep: number; feedbackMap: Record<number, { text: string; isCorrect: boolean }> }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium mb-3" style={{ color: C.purple }}>Nomor {currentStep + 1} dari {TOTAL_STEPS}</p>
      <div className="flex items-center gap-0.5 flex-wrap">
        {STEPS.map((step) => {
          const fb = feedbackMap[step.index];
          const done = fb?.isCorrect === true;
          const active = step.index === currentStep;
          const locked = step.index > currentStep;
          let dBg = "bg-[#E5E5E0]", dBd = "border-[#C5C5C0]", dTx = "text-[#9E9D99]";
          if (done) { dBg = "bg-[#346739]"; dBd = "border-[#346739]"; dTx = "text-white"; }
          else if (active) { dBg = "bg-white"; dBd = "border-[#346739]"; dTx = "text-[#346739]"; }
          return (
            <React.Fragment key={step.index}>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${dBd} ${dBg} ${dTx} text-[9px] font-bold transition-colors`}
                title={locked ? `Terkunci: ${step.label}` : step.label}
              >
                {done ? "✓" : step.index + 1}
              </div>
              {step.index < TOTAL_STEPS - 1 && (
                <div className={`h-0.5 w-2 rounded transition-colors ${done ? "bg-[#346739]" : "bg-[#E5E5E0]"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function YaTidakRadio({ name, value, onChange, readOnly = false }: { name: string; value: YaTidak; onChange: (v: YaTidak) => void; readOnly?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {["ya", "tidak"].map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt as YaTidak)}
            className="accent-green-700"
            disabled={readOnly}
          />
          <span className="text-sm font-medium capitalize text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ContohSelect({ value, onChange, readOnly = false }: { value: ContohNonContoh; onChange: (v: ContohNonContoh) => void; readOnly?: boolean }) {
  return (
    <select
      className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
      style={{ borderColor: C.border }}
      value={value}
      onChange={(e) => onChange(e.target.value as ContohNonContoh)}
      disabled={readOnly}
    >
      <option value="">— pilih —</option>
      <option value="contoh">Contoh</option>
      <option value="noncontoh">Non-contoh</option>
    </select>
  );
}

function TextInput({ label, value, onChange, placeholder, id, readOnly = false, type = "text" }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string; readOnly?: boolean; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500">{label}</label>}
      <input
        id={id} type={type}
        className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
        style={{ borderColor: C.border }}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, id, readOnly = false, rows = 3 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; id?: string; readOnly?: boolean; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-500">{label}</label>}
      <textarea
        id={id} rows={rows}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
        style={{ borderColor: C.border }}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
      />
    </div>
  );
}

function SoalBadge({ n, label, isCompleted }: { n: number; label: string; isCompleted?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: isCompleted ? C.green : C.purple }}>
        {isCompleted ? "✓" : n}
      </div>
      <span className="text-sm font-bold" style={{ color: C.purple }}>{label}</span>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: C.greenLight }}>
      <p className="text-base font-bold" style={{ color: C.green }}>{icon} {title}</p>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function PertanyaanCard({ children, readOnly }: { children: React.ReactNode; readOnly?: boolean }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
      {children}
    </div>
  );
}

function formatJawaban(raw: string): string {
  return raw.replace(/ \| /g, "\n• ");
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AktivitasPermutasi1() {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});

  // ── AKTIVITAS 1 — INDIVIDU (5 soal) ───────────────────────────
  const [a1Rows, setA1Rows] = useState<SoalA1[]>([
    { contoh: "", alasan: "" },
    { contoh: "", alasan: "" },
    { contoh: "", alasan: "" },
    { contoh: "", alasan: "" },
    { contoh: "", alasan: "" },
  ]);

  // ── RANCANG SENDIRI ───────────────────────────────────────────
  const [contohBuatanku, setContohBuatanku] = useState("");
  const [nonContohBuatanku, setNonContohBuatanku] = useState("");
  const [alasanNonContoh, setAlasanNonContoh] = useState("");

  // ── KENALI JENISNYA (5 situasi) ───────────────────────────────
  const [kjData, setKjData] = useState<Record<string, string>[]>(
    SITUASI_KJ.map((s) => {
      const init: Record<string, string> = {};
      s.fields.forEach((f) => { init[f.key] = ""; });
      return init;
    })
  );

  // ── Existing submissions ──────────────────────────────────────
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/aktivitas-siswa?concept_id=permutasi&activity_key=aktivitas_1&mode=exists");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions) {
          setHasExistingSubmissions(true);
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setIsLoadingExisting(false); }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update helpers ────────────────────────────────────────────
  const updateA1Row = (idx: number, field: keyof SoalA1, val: string) => {
    setA1Rows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const updateKJField = (situasiIdx: number, key: string, val: string) => {
    setKjData((prev) => {
      const next = [...prev];
      next[situasiIdx] = { ...next[situasiIdx], [key]: val };
      return next;
    });
  };

  // ── Build jawaban per step ─────────────────────────────────────
  function buildJawabanA1(idx: number): string {
    const row = a1Rows[idx];
    const label = row.contoh === "contoh" ? "Contoh" : row.contoh === "noncontoh" ? "Non-contoh" : "(belum dipilih)";
    return "Kategori: " + label + "\nAlasan: " + (row.alasan || "(belum diisi)");
  }

  function buildJawabanRancang(): string {
    return "Contoh permutasi: " + (contohBuatanku || "(belum diisi)") + "\nNon-contoh: " + (nonContohBuatanku || "(belum diisi)") + "\nAlasan non-contoh: " + (alasanNonContoh || "(belum diisi)");
  }

  function buildJawabanKJ(si: number): string {
    const data = kjData[si];
    return SITUASI_KJ[si].fields.map((f) => f.label + " " + (data[f.key] || "(belum diisi)")).join("\n");
  }

  function buildJawaban(idx: number): { jawaban: string; alasan: string } {
    const step = STEPS[idx];
    if (step.section === "a1" && step.a1Idx !== undefined) {
      return { jawaban: buildJawabanA1(step.a1Idx), alasan: "" };
    }
    if (step.section === "rancang") {
      return { jawaban: buildJawabanRancang(), alasan: "" };
    }
    if (step.section === "kj" && step.kjIdx !== undefined) {
      return { jawaban: buildJawabanKJ(step.kjIdx), alasan: "" };
    }
    return { jawaban: "", alasan: "" };
  }

  // ── Validate per step ──────────────────────────────────────────
  function validateStep(idx: number): string | null {
    const step = STEPS[idx];
    if (step.section === "a1" && step.a1Idx !== undefined) {
      const row = a1Rows[step.a1Idx];
      if (!row.contoh) return "Pilih dulu Contoh atau Non-contoh ya!";
      if (!row.alasan.trim()) return "Tulis alasanmu dulu ya!";
      return null;
    }
    if (step.section === "rancang") {
      if (!contohBuatanku.trim()) return "Isi contoh permutasi buatanmu dulu ya!";
      if (!nonContohBuatanku.trim()) return "Isi non-contoh buatanmu dulu ya!";
      if (!alasanNonContoh.trim()) return "Tulis alasan non-contohmu dulu ya!";
      return null;
    }
    if (step.section === "kj" && step.kjIdx !== undefined) {
      const data = kjData[step.kjIdx];
      const hasAny = SITUASI_KJ[step.kjIdx].fields.some((f) => data[f.key]?.trim());
      if (!hasAny) return "Isi minimal satu jawaban dulu ya!";
      return null;
    }
    return null;
  }

  // ── Handle Submit ──────────────────────────────────────────────
  const handleStepSubmit = useCallback(async () => {
    const step = STEPS[currentStep];
    const vMsg = validateStep(currentStep);
    if (vMsg) {
      setFeedbackMap((p) => ({ ...p, [currentStep]: { text: vMsg, isCorrect: false } }));
      return;
    }

    setCheckingStep(currentStep);
    try {
      const { jawaban, alasan } = buildJawaban(currentStep);

      const body: Record<string, unknown> = {
        concept_id: "permutasi",
        activity_key: "aktivitas_1",
        entry_type: step.entryType,
        question_key: step.questionKey,
        soal: step.soalText,
        jawaban,
        alasan,
      };

      const res = await fetch("/api/aktivitas-siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const fb = {
        text: data.feedback ?? "Jawaban tersimpan.",
        isCorrect: data.isCorrect ?? false,
      };
      setFeedbackMap((p) => ({ ...p, [currentStep]: fb }));
      if (fb.isCorrect && currentStep < TOTAL_STEPS - 1) {
        setCurrentStep((p) => p + 1);
      }
    } catch {
      setFeedbackMap((p) => ({
        ...p,
        [currentStep]: { text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false },
      }));
    } finally {
      setCheckingStep(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, a1Rows, contohBuatanku, nonContohBuatanku, alasanNonContoh, kjData]);

  // ── Apply stored answer back into form state ──────────────────
  function applyAnswerToState(idx: number, answer: string) {
    const step = STEPS[idx];
    if (step.section === "a1" && step.a1Idx !== undefined) {
      const contohMatch = answer.match(/Kategori:\s*(Contoh|Non-contoh)/);
      const alasanMatch = answer.match(/Alasan:\s*([\s\S]+)/);
      if (contohMatch) {
        const mapped = contohMatch[1] === "Contoh" ? "contoh" as const : contohMatch[1] === "Non-contoh" ? "noncontoh" as const : "" as const;
        updateA1Row(step.a1Idx, "contoh", mapped);
      }
      if (alasanMatch) updateA1Row(step.a1Idx, "alasan", alasanMatch[1].trim());
      return;
    }
    if (step.section === "rancang") {
      const cm = answer.match(/Contoh permutasi:\s*(.+?)(?:\n|$)/);
      const nm = answer.match(/Non-contoh:\s*(.+?)(?:\n|$)/);
      const am = answer.match(/Alasan non-contoh:\s*([\s\S]+)/);
      if (cm && cm[1] !== "(belum diisi)") setContohBuatanku(cm[1].trim());
      if (nm && nm[1] !== "(belum diisi)") setNonContohBuatanku(nm[1].trim());
      if (am && am[1] !== "(belum diisi)") setAlasanNonContoh(am[1].trim());
      return;
    }
    if (step.section === "kj" && step.kjIdx !== undefined) {
      const si = step.kjIdx;
      const fields = SITUASI_KJ[si].fields;
      for (const f of fields) {
        const escaped = f.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escaped + "\\s*(.+?)(?:\\n|$)", "s");
        const m = answer.match(re);
        if (m && m[1] !== "(belum diisi)") updateKJField(si, f.key, m[1].trim());
      }
    }
  }

  // ── Reveal answer for review mode ──────────────────────────────
  const handleRevealAnswer = useCallback(async (idx: number) => {
    if (revealedSteps[idx]) return;
    setLoadingAnswer((p) => ({ ...p, [idx]: true }));
    try {
      const step = STEPS[idx];
      const res = await fetch(
        `/api/aktivitas-siswa?concept_id=permutasi&activity_key=aktivitas_1&question_key=${encodeURIComponent(step.questionKey)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.submission) {
        applyAnswerToState(idx, data.submission.answer);
        setFeedbackMap((p) => ({
          ...p,
          [idx]: {
            text: `📝 Jawaban kamu:\n${formatJawaban(data.submission.answer)}\n\n💬 Feedback:\n${data.submission.feedback ?? "Jawaban sudah tersimpan."}`,
            isCorrect: data.submission.isCorrect,
          },
        }));
        setRevealedSteps((p) => ({ ...p, [idx]: true }));
      }
    } catch { /* silent */ }
    finally { setLoadingAnswer((p) => ({ ...p, [idx]: false })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedSteps]);

  const allComplete = currentStep >= TOTAL_STEPS - 1 && feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // ════════════════════════════════════════════════════════════
  // ── RENDER HELPERS ─────────────────────────────────────────
  // ════════════════════════════════════════════════════════════

  /** Check if a section header was already shown for this batch of steps */
  function isFirstOfSection(idx: number): boolean {
    const sec = STEPS[idx].section;
    for (let i = 0; i < idx; i++) {
      if (STEPS[i].section === sec) return false;
    }
    return true;
  }

  function renderSectionHeader(step: StepConfig) {
    if (!isFirstOfSection(step.index)) return null;
    switch (step.section) {
      case "a1":
        return (
          <div key={`sec-a1`}>
            <SectionHeader
              icon="📝"
              title="AKTIVITAS 1 — INDIVIDU"
              subtitle={`Petunjuk: Kelima situasi berikut SEMUA mengandung kata yang terdengar seperti permutasi ("susun", "urutkan", "atur"). Tugasmu: tentukan mana yang benar-benar permutasi (Contoh) dan mana yang sebenarnya bukan (Non-contoh), lalu jelaskan alasannya.`}
            />
          </div>
        );
      case "rancang":
        return (
          <div className="pt-6 mt-2 border-t-2" style={{ borderColor: C.greenLight }} key="sec-rancang">
            <SectionHeader
              icon="✏️"
              title="Rancang Sendiri"
              subtitle="Buatlah satu contoh dan satu non-contoh permutasi versimu sendiri (bukan dari soal yang sudah ada di modul ini). Non-contohmu harus sengaja mengandung kata yang terdengar seperti permutasi, padahal sebenarnya bukan."
            />
          </div>
        );
      case "kj":
        return (
          <div className="pt-6 mt-2 border-t-2" style={{ borderColor: C.greenLight }} key="sec-kj">
            <SectionHeader
              icon="🔍"
              title="&ldquo;Kenali Jenisnya Dulu!&rdquo;"
              subtitle="Durasi: 15 menit &nbsp;|&nbsp; Pilar: 🔵 Mindful"
            />
            <div className="rounded-xl p-4 mb-5 space-y-3" style={{ backgroundColor: C.greenLight }}>
              <p className="text-sm font-bold" style={{ color: C.green }}>📋 Petunjuk</p>
              <p className="text-sm text-slate-700">
                Sebelum menghitung, <strong>identifikasi dulu</strong> jenis permutasi yang digunakan. Jawab tiga pertanyaan panduan, baru tentukan jenis dan rumusnya.
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">🤔 Pertanyaan Panduan</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-white p-3 border-l-4" style={{ borderLeftColor: C.green }}>
                  <p className="text-sm text-slate-700">
                    1. <em>Apakah susunannya melingkar tanpa titik referensi?</em> → <strong>YA</strong> → Permutasi Siklis
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border-l-4" style={{ borderLeftColor: "#2A5A8C" }}>
                  <p className="text-sm text-slate-700">
                    2. <em>Apakah ada objek yang identik/tidak bisa dibedakan?</em> → <strong>YA</strong> → Permutasi Unsur Sama
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border-l-4" style={{ borderLeftColor: "#C9962B" }}>
                  <p className="text-sm text-slate-700">
                    3. <em>Apakah urutan penting dan semua objek berbeda?</em> → <strong>YA</strong> → Permutasi P(n,r)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  /** Render visible steps (for fresh attempts — sequential unlocking) */
  function renderVisibleSteps() {
    const els: React.ReactNode[] = [];
    for (let i = 0; i <= currentStep; i++) {
      const fb = feedbackMap[i];
      const done = fb?.isCorrect === true;
      const isCur = i === currentStep;
      const secHdr = renderSectionHeader(STEPS[i]);
      if (secHdr) els.push(<React.Fragment key={`sh-${i}`}>{secHdr}</React.Fragment>);
      els.push(<div key={`s-${i}`} className={i > 0 ? "mt-8" : ""}>{renderStep(i, done, isCur)}</div>);
    }
    return els;
  }

  /** Render a single step */
  function renderStep(idx: number, readOnly: boolean, isCur: boolean) {
    const step = STEPS[idx];
    const fb = feedbackMap[idx];
    const showSubmit = isCur && !readOnly;

    if (step.section === "a1" && step.a1Idx !== undefined) {
      const ai = step.a1Idx;
      const row = a1Rows[ai];
      return (
        <div>
          {/* ⚠️ Warning khusus Situasi ke-3 */}
          {idx === 2 && (
            <div className="rounded-lg p-3 mb-4 border-l-4" style={{ borderLeftColor: "#C9962B", backgroundColor: "#FFF8E8" }}>
              <p className="text-sm text-slate-600">
                <strong>⚠️ Perhatikan:</strong> Situasi ke-3 sengaja mengandung kata &ldquo;menyusun&rdquo; tetapi sebenarnya adalah kombinasi, karena tidak ada perbedaan jabatan/urutan antaranggota panitia. Kata kerja dalam soal TIDAK menentukan jenis kaidah pencacahan — yang menentukan adalah apakah pertukaran posisi menghasilkan hasil yang berbeda atau tidak.
              </p>
            </div>
          )}
          <SoalBadge n={ai + 1} label={step.label} isCompleted={readOnly} />
          <div className="rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>Situasi:</p>
            <p className="text-sm text-slate-700">{SITUASI_A1[ai]}</p>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Contoh / Non-contoh?</label>
              <ContohSelect value={row.contoh} onChange={(v) => updateA1Row(ai, "contoh", v)} readOnly={readOnly} />
            </div>
            <TextArea
              label="Alasan:"
              value={row.alasan}
              onChange={(v) => updateA1Row(ai, "alasan", v)}
              placeholder="Tulis alasanmu di sini..."
              readOnly={readOnly}
              rows={2}
            />
          </div>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );
    }

    if (step.section === "rancang") {
      return (
        <div>
          <SoalBadge n={6} label="Rancang Sendiri" isCompleted={readOnly} />
          <PertanyaanCard readOnly={readOnly}>
            <TextInput
              label="Contoh permutasi buatanku:"
              value={contohBuatanku}
              onChange={setContohBuatanku}
              placeholder="Tulis contoh permutasi versimu..."
              readOnly={readOnly}
            />
            <TextInput
              label="Non-contoh permutasi buatanku:"
              value={nonContohBuatanku}
              onChange={setNonContohBuatanku}
              placeholder="Tulis non-contoh yang mengandung kata seperti permutasi..."
              readOnly={readOnly}
            />
            <TextArea
              label="Alasan mengapa ini non-contoh:"
              value={alasanNonContoh}
              onChange={setAlasanNonContoh}
              placeholder="Jelaskan alasannya di sini..."
              readOnly={readOnly}
              rows={3}
            />
          </PertanyaanCard>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );
    }

    if (step.section === "kj" && step.kjIdx !== undefined) {
      const ki = step.kjIdx;
      const situasi = SITUASI_KJ[ki];
      const data = kjData[ki];
      return (
        <div>
          <SoalBadge n={7 + ki} label={situasi.judul} isCompleted={readOnly} />
          <PertanyaanCard readOnly={readOnly}>
            <p className="text-sm font-semibold mb-1" style={{ color: C.green }}>{situasi.judul}:</p>
            <p className="text-sm text-slate-700 mb-3">{situasi.deskripsi}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {situasi.fields.map((field) => (
                    <tr key={field.key} className="border-b" style={{ borderColor: "#f1f5f9" }}>
                      <td className="py-2.5 pr-3 font-medium text-slate-600" style={{ width: "45%" }}>
                        {field.label}
                      </td>
                      <td className="py-2.5">
                        {field.type === "yaTidak" ? (
                          <YaTidakRadio
                            name={`kj-${ki}-${field.key}`}
                            value={(data[field.key] || "") as YaTidak}
                            onChange={(v) => updateKJField(ki, field.key, v)}
                            readOnly={readOnly}
                          />
                        ) : (
                          <input
                            type="text"
                            className={`border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full max-w-xs ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
                            style={{ borderColor: C.border }}
                            value={data[field.key] || ""}
                            onChange={(e) => updateKJField(ki, field.key, e.target.value)}
                            placeholder={field.hint || "Tulis jawabanmu..."}
                            readOnly={readOnly}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PertanyaanCard>
          {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
          {showSubmit && <SubmitButton isChecking={checkingStep === idx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
        </div>
      );
    }

    return null;
  }

  // ════════════════════════════════════════════════════════════
  // ── MAIN RENDER ────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen py-8 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* ═══ OUTER BORDER WRAPPER ═══ */}
        <div className="border-2 rounded-2xl p-6 space-y-8" style={{ borderColor: C.greenLight }}>

          {/* ── HEADER ── */}
          <div>
            <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: C.green }}>
              <Link href="/siswa/activity/permutasi" className="hover:underline font-medium opacity-70">
                Permutasi
              </Link>
              <span className="opacity-40">›</span>
              <span className="font-semibold">Aktivitas 1</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.greenLight, color: C.green }}>
                <IconUserSolo /> INDIVIDU
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: C.green, color: C.white }}>
                <IconClock /> 15 menit
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5A8C" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} /> Mindful
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
              &ldquo;Kenali, Bedakan, Terapkan&rdquo;
            </h1>
          </div>

          {/* ── TUJUAN ── */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: C.greenLight }}>
            <p className="text-sm font-bold" style={{ color: C.green }}>🎯 Tujuan Aktivitas</p>
            <p className="text-sm text-slate-700">
              Setelah menyelesaikan aktivitas ini, siswa mampu mengenali non contoh permutasi, membedakan dan menerapkan ketiga jenis permutasi, memilih strategi penyelesaian yang tepat, serta menjelaskan alasan penggunaan setiap jenis permutasi berdasarkan konteks soal.
            </p>
          </div>

          {/* ── PROGRESS INDICATOR (fresh attempts only) ── */}
          {!hasExistingSubmissions && <ProgressIndicator currentStep={currentStep} feedbackMap={feedbackMap} />}

          {/* ── LOADING ── */}
          {isLoadingExisting && (
            <div className="flex items-center justify-center py-12">
              <Spinner />
              <span className="ml-3 text-sm text-slate-500">Memuat aktivitas...</span>
            </div>
          )}

          {/* ── REVIEW MODE: Already completed ── */}
          {!isLoadingExisting && hasExistingSubmissions && (
            <>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.greenLight }}>
                <p className="font-bold text-base" style={{ color: C.green }}>✅ Kamu sudah menyelesaikan aktivitas ini!</p>
                <p className="text-sm text-slate-600 mt-1">Klik &ldquo;Lihat jawabanku&rdquo; di setiap nomor untuk melihat jawaban dan feedback.</p>
              </div>
              <div className="space-y-4">
                {STEPS.map((step) => {
                  const isRevealed = revealedSteps[step.index] === true;
                  const isLoading = loadingAnswer[step.index] === true;
                  const secHdr = isFirstOfSection(step.index) ? renderSectionHeader(step) : null;
                  return (
                    <React.Fragment key={step.index}>
                      {secHdr}
                      <div className="rounded-xl border p-4" style={{ borderColor: isRevealed ? C.green : C.border, background: isRevealed ? C.white : C.bg }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                              style={{ backgroundColor: isRevealed ? C.green : C.purple }}>
                              {isRevealed ? "✓" : step.index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: C.purple }}>{step.label}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{step.soalText}</p>
                            </div>
                          </div>
                          {!isRevealed && (
                            <button
                              type="button"
                              onClick={() => handleRevealAnswer(step.index)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0"
                              style={{ backgroundColor: C.green }}
                            >
                              {isLoading ? <><Spinner /> Memuat...</> : "Lihat jawabanku"}
                            </button>
                          )}
                        </div>
                        {isRevealed && (
                          <div className="mt-4 pt-4 border-t" style={{ borderColor: C.greenLight }}>
                            {renderStep(step.index, true, false)}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ALL COMPLETE ── */}
          {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>🎉 Kamu sudah menyelesaikan Aktivitas Permutasi!</p>
              <p className="text-sm text-slate-600 mt-1">Semua jawabanmu sudah tersimpan. Sekarang kamu bisa lanjut ke step selanjutnya.</p>
            </div>
          )}

          {/* ── SEQUENTIAL STEPS (fresh attempts) ── */}
          {!isLoadingExisting && !hasExistingSubmissions && renderVisibleSteps()}

        </div>{/* END outer border wrapper */}
      </div>
    </div>
  );
}
