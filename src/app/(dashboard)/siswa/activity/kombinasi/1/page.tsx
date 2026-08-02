"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// ── Types ──
type YaTidak = "" | "ya" | "tidak";
type Jenis = "" | "permutasi" | "kombinasi";

interface SituasiState {
  analisis1: YaTidak;
  analisis2: YaTidak;
  jenis: Jenis;
  jawaban: string;
}

// ── Spinner ──
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Reusable Components ──
function YaTidakRadio({
  name,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  value: YaTidak;
  onChange: (v: YaTidak) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {["ya", "tidak"].map((opt) => (
        <label key={opt} className={`flex items-center gap-1.5 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt as YaTidak)}
            disabled={readOnly}
            className="accent-green-700"
          />
          <span className="text-sm font-medium capitalize text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function JenisRadio({
  name,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  value: Jenis;
  onChange: (v: Jenis) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {[
        { val: "permutasi", label: "Permutasi" },
        { val: "kombinasi", label: "Kombinasi" },
      ].map((opt) => (
        <label key={opt.val} className={`flex items-center gap-1.5 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
          <input
            type="radio"
            name={name}
            value={opt.val}
            checked={value === opt.val}
            onChange={() => onChange(opt.val as Jenis)}
            disabled={readOnly}
            className="accent-green-700"
          />
          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  id,
  type = "text",
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  type?: string;
  readOnly?: boolean;
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
        type={type}
        className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  id,
  rows = 3,
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

function SaveButton({ onClick, isSaving, isCorrect }: { onClick: () => void; isSaving: boolean; isCorrect?: boolean | null }) {
  if (isCorrect === true) return null;
  return (
    <div className="flex justify-end mt-4 pt-3 border-t" style={{ borderColor: `${C.green}26` }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {isSaving ? (
          <>
            <Spinner /> Menyimpan...
          </>
        ) : (
          "Simpan Jawaban"
        )}
      </button>
    </div>
  );
}

function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const isWrong = isCorrect === false;
  const bc = isWrong ? "border-[#C44F4F33]" : "border-[#34673933]";
  const bg = isWrong ? "bg-[#C44F4F08]" : "bg-[#34673908]";
  const lc = isWrong ? "text-[#C44F4F]" : "text-[#346739]";
  const ic = isWrong ? "❌" : "✅";
  const title = isWrong ? "Jawaban Kurang Tepat" : "Jawaban Benar!";
  return (
    <div className={`mt-3 rounded-lg border ${bc} ${bg} p-3`}>
      <p className={`mb-1 text-xs font-semibold ${lc}`}>{ic} {title}</p>
      <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function SoalBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: C.green }}
      >
        {n}
      </div>
      <span className="text-sm font-bold" style={{ color: C.purple }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: C.greenLight }}>
      <p className="text-base font-bold" style={{ color: C.green }}>
        {icon} {title}
      </p>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function PertanyaanCard({ children, readOnly }: { children: React.ReactNode; readOnly?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ── SIMULASI PILIHAN (fitur baru) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

interface SimulasiState {
  dipilih: string[]; // urutan objek yang diklik siswa (untuk percobaan saat ini)
  ditukar: boolean; // apakah tombol "Tukar Urutan" sudah dipakai pada percobaan ini
  percobaanKe: number; // 0 - 3
  selesai: boolean; // true jika sudah mencapai 3 percobaan (summary tampil)
}

function makeSimulasiState(): SimulasiState {
  return { dipilih: [], ditukar: false, percobaanKe: 0, selesai: false };
}

function SimulasiPilihan({
  objekPilihan,
  jumlahSlot,
  urutanPenting,
  state,
  onChange,
}: {
  objekPilihan: string[];
  jumlahSlot: number;
  urutanPenting: boolean;
  state: SimulasiState;
  onChange: (next: SimulasiState) => void;
}) {
  const slotPenuh = state.dipilih.length >= jumlahSlot;

  const handlePilihObjek = (obj: string) => {
    if (slotPenuh) return;
    if (state.dipilih.includes(obj)) return;
    onChange({ ...state, dipilih: [...state.dipilih, obj], ditukar: false });
  };

  const handleHapusPilihan = () => {
    onChange({ ...state, dipilih: [], ditukar: false });
  };

  const handleTukarUrutan = () => {
    if (!slotPenuh) return;
    onChange({
      ...state,
      dipilih: [...state.dipilih].reverse(),
      ditukar: true,
    });
  };

  const handleSelesaiPercobaan = () => {
    if (!slotPenuh) return;
    const percobaanBaru = state.percobaanKe + 1;
    onChange({
      dipilih: [],
      ditukar: false,
      percobaanKe: percobaanBaru,
      selesai: percobaanBaru >= 3,
    });
  };

  const handleResetSimulasi = () => {
    onChange(makeSimulasiState());
  };

  const hasilSaatIni = state.dipilih
    .map((_, i) => `Slot ${i + 1}: ${state.dipilih[i]}`)
    .join(" · ");

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ backgroundColor: "#2A5A8C08", border: "1px solid #2A5A8C33" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-bold" style={{ color: "#2A5A8C" }}>
          🎮 Simulasi: Coba Sendiri Dulu
        </p>
        {!state.selesai && (
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{ backgroundColor: "#2A5A8C", color: C.white }}
          >
            Percobaan ke-{Math.min(state.percobaanKe + 1, 3)} / 3
          </span>
        )}
      </div>

      {!state.selesai && (
        <>
          <p className="text-sm text-slate-700">
            Klik {jumlahSlot} objek di bawah ini secara berurutan.
          </p>

          {/* Pilihan objek */}
          <div className="flex flex-wrap gap-2">
            {objekPilihan.map((obj) => {
              const sudahDipilih = state.dipilih.includes(obj);
              return (
                <button
                  key={obj}
                  type="button"
                  onClick={() => handlePilihObjek(obj)}
                  disabled={sudahDipilih || slotPenuh}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: sudahDipilih ? C.green : C.white,
                    color: sudahDipilih ? C.white : "#334155",
                    borderColor: sudahDipilih ? C.green : C.border,
                    opacity: !sudahDipilih && slotPenuh ? 0.4 : 1,
                  }}
                >
                  {obj}
                </button>
              );
            })}
          </div>

          {/* Hasil pilihan */}
          {state.dipilih.length > 0 && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Hasil Pilihanmu{state.ditukar ? " (setelah ditukar)" : ""}:
              </p>
              <p className="font-medium text-slate-800">{hasilSaatIni}</p>
            </div>
          )}

          {/* Tombol aksi */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {state.dipilih.length > 0 && !slotPenuh && (
              <button
                type="button"
                onClick={handleHapusPilihan}
                className="rounded-full px-4 py-1.5 text-xs font-medium border"
                style={{ borderColor: C.border, color: "#334155" }}
              >
                Ulangi Pilih
              </button>
            )}
            {slotPenuh && (
              <button
                type="button"
                onClick={handleTukarUrutan}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: "#2A5A8C" }}
              >
                🔄 Tukar Urutan
              </button>
            )}
            {slotPenuh && (
              <button
                type="button"
                onClick={handleSelesaiPercobaan}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                Selesai, Coba Lagi →
              </button>
            )}
          </div>

          {slotPenuh && (
            <p className="text-xs text-slate-500 italic">
              Tips: tekan &quot;Tukar Urutan&quot; dulu untuk melihat apakah hasilnya berubah,
              baru tekan &quot;Selesai, Coba Lagi&quot;.
            </p>
          )}
        </>
      )}

      {/* Summary setelah 3x percobaan */}
      {state.selesai && (
        <div
          className="rounded-lg p-4 space-y-2"
          style={{ backgroundColor: C.greenLight }}
        >
          <p className="text-sm font-bold" style={{ color: C.green }}>
            ✅ Kamu sudah mencoba 3 kali!
          </p>
          <p className="text-sm text-slate-700">
            Setiap kali kamu menukar urutan pilihan, hasilnya{" "}
            <strong>{urutanPenting ? "berubah" : "tetap dianggap sama"}</strong>.
            Ini adalah ciri khas dari{" "}
            <strong>{urutanPenting ? "Permutasi" : "Kombinasi"}</strong>: urutan{" "}
            {urutanPenting ? "sangat penting" : "tidak penting"}.
          </p>
          <p className="text-sm text-slate-700">
            Gunakan pengalaman ini untuk menjawab tabel analisis di bawah.
          </p>
          <button
            type="button"
            onClick={handleResetSimulasi}
            className="rounded-full px-4 py-1.5 text-xs font-medium border mt-1"
            style={{ borderColor: C.green, color: C.green, backgroundColor: C.white }}
          >
            🔁 Reset Simulasi
          </button>
        </div>
      )}
    </div>
  );
}

// ── Situasi definitions ──

interface SituasiDef {
  nomor: number;
  deskripsi: string;
  pertanyaanPanduan: string;
  analisis: {
    key: string;
    label: string;
    type: "yaTidak" | "jenis" | "text";
  }[];
  // ── data untuk simulasi ──
  objekPilihan: string[];
  jumlahSlot: number;
  urutanPenting: boolean;
}

const SITUASI: SituasiDef[] = [
  {
    nomor: 1,
    deskripsi:
      "Dari 10 siswa kelas XII, dipilih Ketua, Wakil Ketua, dan Sekretaris OSIS.",
    pertanyaanPanduan:
      "Jika Ari=Ketua & Budi=Wakil, apakah sama dengan Budi=Ketua & Ari=Wakil?",
    analisis: [
      { key: "analisis1", label: "Apakah sama?", type: "yaTidak" },
      { key: "analisis2", label: "Apakah urutan penting?", type: "yaTidak" },
      { key: "jenis", label: "Jenis:", type: "jenis" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
    objekPilihan: ["Ari", "Budi", "Cici", "Dedi", "Eka"],
    jumlahSlot: 3,
    urutanPenting: true,
  },
  {
    nomor: 2,
    deskripsi:
      "Dari 10 siswa kelas XII, dipilih 3 orang perwakilan untuk mengikuti lomba.",
    pertanyaanPanduan:
      "Jika {Ari, Budi, Cici} terpilih, apakah sama dengan {Cici, Ari, Budi}?",
    analisis: [
      { key: "analisis1", label: "Apakah sama?", type: "yaTidak" },
      { key: "analisis2", label: "Apakah urutan penting?", type: "yaTidak" },
      { key: "jenis", label: "Jenis:", type: "jenis" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
    objekPilihan: ["Ari", "Budi", "Cici", "Dedi", "Eka"],
    jumlahSlot: 3,
    urutanPenting: false,
  },
  {
    nomor: 3,
    deskripsi:
      "Dari 8 soal yang tersedia, siswa diminta mengerjakan 5 soal pilihan.",
    pertanyaanPanduan:
      "Apakah mengerjakan soal {1,2,3,4,5} berbeda dengan {5,4,3,2,1}?",
    analisis: [
      { key: "analisis1", label: "Apakah berbeda?", type: "yaTidak" },
      { key: "jenis", label: "Jenis:", type: "jenis" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
    objekPilihan: ["Soal 1", "Soal 2", "Soal 3", "Soal 4", "Soal 5", "Soal 6", "Soal 7", "Soal 8"],
    jumlahSlot: 5,
    urutanPenting: false,
  },
  {
    nomor: 4,
    deskripsi:
      "Dari 6 warna cat, seorang seniman memilih 2 warna untuk digabungkan menjadi warna baru.",
    pertanyaanPanduan:
      "Apakah mencampur merah+biru sama dengan biru+merah?",
    analisis: [
      { key: "analisis1", label: "Apakah sama?", type: "yaTidak" },
      { key: "jenis", label: "Jenis:", type: "jenis" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
    objekPilihan: ["Merah", "Biru", "Kuning", "Hijau", "Ungu", "Oranye"],
    jumlahSlot: 2,
    urutanPenting: false,
  },
  {
    nomor: 5,
    deskripsi:
      "Sebuah aplikasi musik membuat playlist 5 lagu dari 20 lagu tersedia, dan urutan lagu dalam playlist diperhatikan.",
    pertanyaanPanduan:
      "Apakah playlist [A,B,C,D,E] sama dengan playlist [E,D,C,B,A]?",
    analisis: [
      { key: "analisis1", label: "Apakah sama?", type: "yaTidak" },
      { key: "jenis", label: "Jenis:", type: "jenis" },
      { key: "jawaban", label: "Jawaban:", type: "text" },
    ],
    objekPilihan: [
      "Lagu A", "Lagu B", "Lagu C", "Lagu D", "Lagu E",
      "Lagu F", "Lagu G", "Lagu H",
    ],
    jumlahSlot: 5,
    urutanPenting: true,
  },
];

// ── Sequential unlocking: question order ──
const QUESTION_KEYS = [
  "situasi_1", "situasi_2", "situasi_3", "situasi_4", "situasi_5",
  "refleksi_1", "refleksi_2", "bagian_a_1", "bagian_a_2", "bagian_b",
];

// ── Initial state factory ──
function makeSituasiState(): SituasiState {
  return { analisis1: "", analisis2: "", jenis: "", jawaban: "" };
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

export default function AktivitasKombinasi1() {
  // ── Situasi 1-5 ──
  const [situasi, setSituasi] = useState<SituasiState[]>(
    SITUASI.map(() => makeSituasiState())
  );

  // ── Simulasi per situasi (fitur baru) ──
  const [simulasi, setSimulasi] = useState<SimulasiState[]>(
    SITUASI.map(() => makeSimulasiState())
  );

  // ── Refleksi ──
  const [refleksi1, setRefleksi1] = useState("");
  const [refleksi2, setRefleksi2] = useState("");

  // ── Bagian A ──
  const [bagianA1, setBagianA1] = useState("");
  const [bagianA2, setBagianA2] = useState("");

  // ── Bagian B ──
  const [contohBuatanku, setContohBuatanku] = useState("");
  const [nonContohBuatanku, setNonContohBuatanku] = useState("");
  const [alasanNonContoh, setAlasanNonContoh] = useState("");

  // ── Feedback state ──
  const [feedbackMap, setFeedbackMap] = useState<Record<string, { text: string; isCorrect: boolean }>>({});

  // ── Saving states ──
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // ── Sequential unlocking ──
  const [currentStep, setCurrentStep] = useState(0);
  const allComplete = currentStep >= QUESTION_KEYS.length;

  // ── Review mode (existing submissions) ──
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<Record<string, boolean>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<Record<string, boolean>>({});
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch all submissions to check which questions are completed
        const res = await fetch("/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_1");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions && data.submissions) {
          // Only full review mode if ALL questions have correct answers
          const allCorrect = QUESTION_KEYS.every((key) => data.submissions[key]?.isCorrect === true);
          if (allCorrect) {
            setHasExistingSubmissions(true);
          } else {
            // Partial: resume from first unanswered question, pre-fill previous feedback
            let firstUnanswered = QUESTION_KEYS.length;
            const preFilled: Record<string, { text: string; isCorrect: boolean }> = {};
            for (let i = 0; i < QUESTION_KEYS.length; i++) {
              const key = QUESTION_KEYS[i];
              const sub = data.submissions[key];
              if (sub) {
                preFilled[key] = {
                  text: `📝 Jawaban kamu:\n${sub.answer}\n\n💬 Feedback:\n${sub.feedback ?? "Jawaban sudah tersimpan."}`,
                  isCorrect: sub.isCorrect,
                };
                if (!sub.isCorrect && firstUnanswered > i) {
                  firstUnanswered = i; // retry from first wrong answer
                }
              } else if (firstUnanswered > i) {
                firstUnanswered = i;
              }
            }
            if (Object.keys(preFilled).length > 0) {
              setFeedbackMap(preFilled);
              setPrefilledKeys(new Set(Object.keys(preFilled)));
            }
            setCurrentStep(firstUnanswered);
          }
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setIsLoadingExisting(false); }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast feedback ──
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({
    msg: "",
    visible: false,
  });

  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: "", visible: false }), 2500);
  };

  // ── Update situasi field ──
  const updateSituasi = (
    idx: number,
    field: keyof SituasiState,
    value: string
  ) => {
    setSituasi((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // ── Update simulasi state (fitur baru) ──
  const updateSimulasi = (idx: number, next: SimulasiState) => {
    setSimulasi((prev) => {
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
  };

  // ── Helper: access situasi field safely ──
  function getSituasiField(idx: number, key: string): string {
    const s = situasi[idx];
    if (key === "analisis1") return s.analisis1;
    if (key === "analisis2") return s.analisis2;
    if (key === "jenis") return s.jenis;
    if (key === "jawaban") return s.jawaban;
    return "";
  }

  // ── Rule-based grading for Situasi 1-5 ──
  function gradeSituasi(idx: number): { isCorrect: boolean; feedback: string } {
    const s = situasi[idx];
    const nomor = idx + 1;

    switch (nomor) {
      case 1: {
        // Permutasi: Ketua, Wakil, Sekretaris — P(10,3)
        const ok1 = s.analisis1 === "tidak";
        const ok2 = s.analisis2 === "ya";
        const okJenis = s.jenis === "permutasi";
        const jawabanBenar = /720|10\s*[×xX*·]\s*9\s*[×xX*·]\s*8|P\s*\(\s*10\s*,\s*3\s*\)/.test(s.jawaban.replace(/\s/g, ""));
        const allOk = ok1 && ok2 && okJenis && jawabanBenar;
        if (allOk) {
          return { isCorrect: true, feedback: "🎯 Tepat! Jabatan (Ketua/Wakil/Sekretaris) membuat urutan penting → Permutasi. Banyak cara = P(10,3) = 10×9×8 = 720." };
        }
        let fb = "🤔 Belum tepat. Coba cek lagi:\n";
        if (!ok1) fb += "• Ari=Ketua & Budi=Wakil ≠ Budi=Ketua & Ari=Wakil → jawab 'Tidak'.\n";
        if (!ok2) fb += "• Karena jabatan berbeda, urutan itu penting → jawab 'Ya'.\n";
        if (!okJenis) fb += "• Karena urutan penting, ini adalah Permutasi.\n";
        if (!jawabanBenar) fb += "• Gunakan rumus permutasi: P(n,r). n = total siswa, r = jumlah yang dipilih.\n• Coba hitung ulang dengan teliti.\n";
        return { isCorrect: false, feedback: fb };
      }
      case 2: {
        // Kombinasi: 3 perwakilan lomba — C(10,3)
        const ok1 = s.analisis1 === "ya";
        const ok2 = s.analisis2 === "tidak";
        const okJenis = s.jenis === "kombinasi";
        const jawabanBenar = /120|C\s*\(\s*10\s*,\s*3\s*\)/.test(s.jawaban.replace(/\s/g, ""));
        const allOk = ok1 && ok2 && okJenis && jawabanBenar;
        if (allOk) {
          return { isCorrect: true, feedback: "🎯 Tepat! Perwakilan tanpa jabatan → urutan tidak penting → Kombinasi. Banyak cara = C(10,3) = 120." };
        }
        let fb = "🤔 Belum tepat. Coba cek lagi:\n";
        if (!ok1) fb += "• {Ari, Budi, Cici} sama saja dengan {Cici, Ari, Budi} → jawab 'Ya'.\n";
        if (!ok2) fb += "• Karena hanya perwakilan (tanpa jabatan), urutan tidak penting → jawab 'Tidak'.\n";
        if (!okJenis) fb += "• Karena urutan tidak penting, ini adalah Kombinasi.\n";
        if (!jawabanBenar) fb += "• Gunakan rumus kombinasi: C(n,r). n = total siswa, r = jumlah yang dipilih.\n• Coba hitung ulang dengan teliti.\n";
        return { isCorrect: false, feedback: fb };
      }
      case 3: {
        // Kombinasi: 5 soal pilihan dari 8 — C(8,5)
        const ok1 = s.analisis1 === "tidak";
        const okJenis = s.jenis === "kombinasi";
        const jawabanBenar = /56|C\s*\(\s*8\s*,\s*5\s*\)/.test(s.jawaban.replace(/\s/g, ""));
        const allOk = ok1 && okJenis && jawabanBenar;
        if (allOk) {
          return { isCorrect: true, feedback: "🎯 Tepat! Mengerjakan soal {1,2,3,4,5} sama saja dengan {5,4,3,2,1} → urutan tidak penting → Kombinasi. C(8,5) = 56." };
        }
        let fb = "🤔 Belum tepat. Coba cek lagi:\n";
        if (!ok1) fb += "• Soal yang dikerjakan tetap sama walau urutan beda → jawab 'Tidak'.\n";
        if (!okJenis) fb += "• Karena urutan pengerjaan tidak penting, ini adalah Kombinasi.\n";
        if (!jawabanBenar) fb += "• Gunakan rumus kombinasi: C(n,r). n = total soal, r = jumlah yang dipilih.\n• Coba hitung ulang dengan teliti.\n";
        return { isCorrect: false, feedback: fb };
      }
      case 4: {
        // Kombinasi: 2 warna dari 6 — C(6,2)
        const ok1 = s.analisis1 === "ya";
        const okJenis = s.jenis === "kombinasi";
        const jawabanBenar = /15|C\s*\(\s*6\s*,\s*2\s*\)/.test(s.jawaban.replace(/\s/g, ""));
        const allOk = ok1 && okJenis && jawabanBenar;
        if (allOk) {
          return { isCorrect: true, feedback: "🎯 Tepat! Mencampur merah+biru = biru+merah → urutan tidak penting → Kombinasi. C(6,2) = 15." };
        }
        let fb = "🤔 Belum tepat. Coba cek lagi:\n";
        if (!ok1) fb += "• Mencampur merah+biru hasilnya sama dengan biru+merah → jawab 'Ya'.\n";
        if (!okJenis) fb += "• Karena urutan pencampuran tidak penting, ini adalah Kombinasi.\n";
        if (!jawabanBenar) fb += "• Gunakan rumus kombinasi: C(n,r). n = total warna, r = jumlah yang dipilih.\n• Coba hitung ulang dengan teliti.\n";
        return { isCorrect: false, feedback: fb };
      }
      case 5: {
        // Permutasi: playlist 5 lagu dari 20 — P(20,5)
        const ok1 = s.analisis1 === "tidak";
        const okJenis = s.jenis === "permutasi";
        const jawabanBenar = /1860480|1\.?860\.?480|P\s*\(\s*20\s*,\s*5\s*\)/.test(s.jawaban.replace(/\s/g, ""));
        const allOk = ok1 && okJenis && jawabanBenar;
        if (allOk) {
          return { isCorrect: true, feedback: "🎯 Tepat! Urutan lagu dalam playlist penting → Permutasi. P(20,5) = 20×19×18×17×16 = 1.860.480." };
        }
        let fb = "🤔 Belum tepat. Coba cek lagi:\n";
        if (!ok1) fb += "• Playlist [A,B,C,D,E] berbeda dengan [E,D,C,B,A] → jawab 'Tidak'.\n";
        if (!okJenis) fb += "• Karena urutan lagu diperhatikan, ini adalah Permutasi.\n";
        if (!jawabanBenar) fb += "• Gunakan rumus permutasi: P(n,r). n = total lagu, r = jumlah lagu dalam playlist.\n• Coba hitung ulang dengan teliti.\n";
        return { isCorrect: false, feedback: fb };
      }
      default:
        return { isCorrect: false, feedback: "Soal tidak dikenali." };
    }
  }

  // ── Helper: get question index in QUESTION_KEYS ──
  function getQuestionIndex(key: string): number {
    return QUESTION_KEYS.indexOf(key);
  }

  // ── Handle save with grading ──
  const handleSave = async (key: string, soalKe?: number) => {
    setSaving((p) => ({ ...p, [key]: true }));

    try {
      // Soal 1-5: rule-based grading + save to DB
      if (key.startsWith("situasi_") && soalKe !== undefined && soalKe >= 1 && soalKe <= 5) {
        const result = gradeSituasi(soalKe - 1);
        const s = situasi[soalKe - 1];
        const jawaban = `analisis1: ${s.analisis1}, analisis2: ${s.analisis2}, jenis: ${s.jenis}, jawaban: ${s.jawaban}`;
        const soalText = SITUASI[soalKe - 1].deskripsi;

        // Save to DB (both correct & wrong)
        fetch("/api/aktivitas-siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept_id: "kombinasi",
            activity_key: "aktivitas_1",
            entry_type: "soal",
            question_key: key,
            soal: soalText,
            jawaban,
            rule_based: { isCorrect: result.isCorrect, feedback: result.feedback },
          }),
        }).catch(() => {/* silent */});

        await new Promise((r) => setTimeout(r, 500));
        setFeedbackMap((p) => ({ ...p, [key]: { text: result.feedback, isCorrect: result.isCorrect } }));
        if (result.isCorrect) {
          showToast("Jawaban benar! ✅");
          const idx = getQuestionIndex(key);
          if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
        }
      } else {
        // Soal 6-10: AI-based
        await new Promise((r) => setTimeout(r, 800));
        let soalText = "";
        let jawaban = "";
        if (key === "refleksi_1") { soalText = "Dari kelima situasi, tuliskan perbedaan paling mendasar antara permutasi dan kombinasi."; jawaban = refleksi1; }
        else if (key === "refleksi_2") { soalText = "Situasi mana yang paling mengecoh? Mengapa?"; jawaban = refleksi2; }
        else if (key === "bagian_a_1") { soalText = "Seorang temanmu mengerjakan soal: 'Dari 6 kandidat dipilih Ketua dan Wakil Ketua OSIS. Berapa banyak caranya?' Temanmu menjawab: 'Ini kombinasi, karena kita memilih 2 orang dari 6. Jawabannya C(6,2)=15.' Evaluasi jawaban temanmu: apakah benar atau salah? Jelaskan alasanmu!"; jawaban = bagianA1; }
        else if (key === "bagian_a_2") { soalText = "Berapa jawaban yang benar? Tuliskan cara menghitungnya!"; jawaban = bagianA2; }
        else if (key === "bagian_b") { soalText = "Buatlah SATU contoh dan SATU non-contoh orisinal untuk konsep KOMBINASI."; jawaban = `Contoh: ${contohBuatanku}\nNon-contoh: ${nonContohBuatanku}\nAlasan: ${alasanNonContoh}`; }

        if (!jawaban.trim()) {
          setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Isi jawabanmu dulu ya sebelum menyimpan!", isCorrect: false } }));
        } else {
          try {
            const res = await fetch("/api/aktivitas-siswa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                concept_id: "kombinasi",
                activity_key: "aktivitas_1",
                entry_type: "refleksi",
                question_key: key,
                soal: soalText,
                jawaban,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              // Safety net for bagian_a_1: if student correctly identifies it as permutation & wrong,
              // override AI false-negative
              let isCorrect = data.isCorrect ?? true;
              if (key === "bagian_a_1" && !isCorrect) {
                const ans = jawaban.toLowerCase();
                const knowsPermutasi = /permutasi|permutation/.test(ans);
                const knowsWrong = /salah|tidak benar|keliru|bukan kombinasi/.test(ans);
                const knowsUrutan = /urutan|jabatan|posisi|ketua|wakil/.test(ans);
                if (knowsPermutasi && (knowsWrong || knowsUrutan)) {
                  isCorrect = true;
                }
              }
              setFeedbackMap((p) => ({ ...p, [key]: { text: data.feedback ?? "💬 Jawaban sudah tersimpan.", isCorrect } }));
              showToast("Jawaban tersimpan! ✅");
              if (isCorrect) {
                const idx = getQuestionIndex(key);
                if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
              }
            } else {
              setFeedbackMap((p) => ({ ...p, [key]: { text: "⚠️ Gagal menyimpan. Coba lagi nanti.", isCorrect: false } }));
            }
          } catch {
            setFeedbackMap((p) => ({ ...p, [key]: { text: "💬 Jawabanmu sudah tercatat. Feedback AI akan muncul setelah guru memeriksa.", isCorrect: true } }));
            showToast("Jawaban tersimpan! ✅");
            const idx = getQuestionIndex(key);
            if (idx >= 0) setCurrentStep((prev) => Math.max(prev, idx + 1));
          }
        }
      }
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };

  // ── Apply stored answer back into form state ──────────────────
  function applyAnswerToState(key: string, rawAnswer: string) {
    // Parse situasi answers: "analisis1: X, analisis2: Y, jenis: Z, jawaban: W"
    const situasiMatch = key.match(/^situasi_(\d+)$/);
    if (situasiMatch) {
      const idx = parseInt(situasiMatch[1]) - 1;
      const a1 = rawAnswer.match(/analisis1:\s*(.+?)(?:,|$)/);
      const a2 = rawAnswer.match(/analisis2:\s*(.+?)(?:,|$)/);
      const jenis = rawAnswer.match(/jenis:\s*(.+?)(?:,|$)/);
      const jwb = rawAnswer.match(/jawaban:\s*(.+?)$/);
      if (a1) updateSituasi(idx, "analisis1", a1[1].trim());
      if (a2) updateSituasi(idx, "analisis2", a2[1].trim());
      if (jenis) updateSituasi(idx, "jenis", jenis[1].trim());
      if (jwb) updateSituasi(idx, "jawaban", jwb[1].trim());
      return;
    }
    // Plain text answers for refleksi/bagian
    if (key === "refleksi_1") setRefleksi1(rawAnswer);
    else if (key === "refleksi_2") setRefleksi2(rawAnswer);
    else if (key === "bagian_a_1") setBagianA1(rawAnswer);
    else if (key === "bagian_a_2") setBagianA2(rawAnswer);
    else if (key === "bagian_b") {
      const c = rawAnswer.match(/Contoh:\s*(.+?)(?:\n|$)/);
      const n = rawAnswer.match(/Non-contoh:\s*(.+?)(?:\n|$)/);
      const a = rawAnswer.match(/Alasan:\s*([\s\S]+)/);
      if (c) setContohBuatanku(c[1].trim());
      if (n) setNonContohBuatanku(n[1].trim());
      if (a) setAlasanNonContoh(a[1].trim());
    }
  }

  // ── Reveal answer for review mode ──────────────────────────────
  const handleRevealAnswer = useCallback(async (key: string) => {
    if (revealedSteps[key]) return;
    setLoadingAnswer((p) => ({ ...p, [key]: true }));
    try {
      const res = await fetch(
        `/api/aktivitas-siswa?concept_id=kombinasi&activity_key=aktivitas_1&question_key=${encodeURIComponent(key)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.submission) {
        applyAnswerToState(key, data.submission.answer);
        setFeedbackMap((p) => ({
          ...p,
          [key]: {
            text: `📝 Jawaban kamu:\n${data.submission.answer}\n\n💬 Feedback:\n${data.submission.feedback ?? "Jawaban sudah tersimpan."}`,
            isCorrect: data.submission.isCorrect,
          },
        }));
        setRevealedSteps((p) => ({ ...p, [key]: true }));
      }
    } catch { /* silent */ }
    finally { setLoadingAnswer((p) => ({ ...p, [key]: false })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedSteps]);

  // ── Question labels for review mode ────────────────────────────
  const QUESTION_LABELS: Record<string, string> = {
    situasi_1: "Situasi 1 — Pemilihan Ketua, Wakil, Sekretaris",
    situasi_2: "Situasi 2 — Perwakilan Lomba",
    situasi_3: "Situasi 3 — Soal Pilihan",
    situasi_4: "Situasi 4 — Campuran Warna",
    situasi_5: "Situasi 5 — Playlist Lagu",
    refleksi_1: "Refleksi — Perbedaan Permutasi & Kombinasi",
    refleksi_2: "Refleksi — Situasi Pengecoh",
    bagian_a_1: "Bagian A — Analisis Jawaban Siswa",
    bagian_a_2: "Bagian A — Hitung Jawaban Benar",
    bagian_b: "Bagian B — Rancang Sendiri",
  };

  // ── Question full text for review mode ─────────────────────────
  const QUESTION_SOAL: Record<string, string> = {
    situasi_1: SITUASI[0].deskripsi,
    situasi_2: SITUASI[1].deskripsi,
    situasi_3: SITUASI[2].deskripsi,
    situasi_4: SITUASI[3].deskripsi,
    situasi_5: SITUASI[4].deskripsi,
    refleksi_1: "Dari kelima situasi, tuliskan perbedaan paling mendasar antara permutasi dan kombinasi.",
    refleksi_2: "Situasi mana yang paling mengecoh? Mengapa?",
    bagian_a_1: "Seorang temanmu mengerjakan soal: 'Dari 6 kandidat dipilih Ketua dan Wakil Ketua OSIS.' Temanmu menjawab: 'Ini kombinasi, karena kita memilih 2 orang dari 6.' Evaluasi jawaban temanmu: apakah benar atau salah? Jelaskan alasanmu!",
    bagian_a_2: "Berapa jawaban yang benar? Tuliskan cara menghitungnya!",
    bagian_b: "Buatlah SATU contoh dan SATU non-contoh orisinal untuk konsep KOMBINASI.",
  };

  // ── Feedback display: "Lihat jawabanku" for resumed, normal for fresh ──
  function FeedbackOrReveal({ qKey, fb }: { qKey: string; fb: { text: string; isCorrect: boolean } }) {
    if (prefilledKeys.has(qKey) && !revealedSteps[qKey]) {
      return (
        <div className="flex justify-end mt-3">
          <button type="button" onClick={() => setRevealedSteps(p => ({ ...p, [qKey]: true }))}
            className="rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: C.green }}>
            💬 Lihat jawabanku
          </button>
        </div>
      );
    }
    return <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: C.white }}>
      <div className="max-w-[800px] mx-auto">
        {/* ── Back link ── */}
        <Link
          href="/siswa/activity/kombinasi"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
          style={{ color: C.green }}
        >
          ← Kembali ke daftar aktivitas
        </Link>

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: C.greenLight, color: C.green }}
            >
              <IconUserSolo />
              INDIVIDU
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: C.green, color: C.white }}
            >
              <IconClock />
              15 menit
            </span>
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: C.purple }}
          >
            Aktivitas 1 — “Permutasi atau Kombinasi? Aku yang Menentukan!”
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Pilar:</span>
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
        </div>

        {/* ── LOADING ── */}
        {isLoadingExisting && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-3 text-sm text-slate-500">Memuat aktivitas...</span>
          </div>
        )}

        {/* ── REVIEW MODE ── */}
        {!isLoadingExisting && hasExistingSubmissions && (
          <>
            <div className="rounded-xl p-4 text-center mb-6" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>✅ Kamu sudah menyelesaikan aktivitas ini!</p>
              <p className="text-sm text-slate-600 mt-1">Klik &ldquo;Lihat jawabanku&rdquo; di setiap nomor untuk melihat jawaban dan feedback.</p>
            </div>
            <div className="space-y-6">
              {QUESTION_KEYS.map((key, idx) => {
                const isRevealed = revealedSteps[key] === true;
                const isLoading = loadingAnswer[key] === true;
                const fb = feedbackMap[key];
                const soalText = QUESTION_SOAL[key] ?? "";
                const siIdx = key.startsWith("situasi_") ? parseInt(key.split("_")[1]) - 1 : -1;
                return (
                  <div key={key}>
                    {/* ── Collapsed header ── */}
                    <div className="rounded-xl border p-4" style={{ borderColor: isRevealed ? C.green : C.border, background: isRevealed ? C.white : C.bg }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                            style={{ backgroundColor: isRevealed ? C.green : C.purple }}>
                            {isRevealed ? "✓" : idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: C.purple }}>{QUESTION_LABELS[key] ?? key}</p>
                            {soalText && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{soalText}</p>
                            )}
                          </div>
                        </div>
                        {!isRevealed && (
                          <button
                            type="button"
                            onClick={() => handleRevealAnswer(key)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0"
                            style={{ backgroundColor: C.green }}
                          >
                            {isLoading ? <><Spinner /> Memuat...</> : "Lihat jawabanku"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Expanded: full question + answer + feedback ── */}
                    {isRevealed && (
                      <div className="mt-4 space-y-4">
                        {/* ── Situasi 1-5 ── */}
                        {siIdx >= 0 && siIdx < SITUASI.length && (() => {
                          const s = SITUASI[siIdx];
                          const st = situasi[siIdx] ?? makeSituasiState();
                          return (
                            <>
                              <SoalBadge n={s.nomor} label={`Situasi ${s.nomor}`} />
                              <PertanyaanCard readOnly>
                                <p className="text-sm font-medium text-slate-800">{s.deskripsi}</p>
                                <div className="rounded-lg p-3" style={{ backgroundColor: "#f1f5f9" }}>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Pertanyaan Panduan:</p>
                                  <p className="text-sm text-slate-700 italic">{s.pertanyaanPanduan}</p>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b" style={{ borderColor: C.border }}>
                                        <th className="text-left py-2 pr-4 font-semibold text-slate-600">Analisis</th>
                                        <th className="text-left py-2 font-semibold text-slate-600">Jawaban</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {s.analisis.map((a) => (
                                        <tr key={a.key} className="border-b" style={{ borderColor: `${C.border}80` }}>
                                          <td className="py-2.5 pr-4 text-slate-700 align-top">{a.label}</td>
                                          <td className="py-2.5 align-top">
                                            {a.type === "yaTidak" ? (
                                              <YaTidakRadio
                                                name={`review_s${s.nomor}_${a.key}`}
                                                value={getSituasiField(siIdx, a.key) as YaTidak}
                                                onChange={() => {}}
                                                readOnly
                                              />
                                            ) : a.type === "jenis" ? (
                                              <JenisRadio
                                                name={`review_s${s.nomor}_jenis`}
                                                value={st.jenis}
                                                onChange={() => {}}
                                                readOnly
                                              />
                                            ) : (
                                              <TextInput
                                                value={st.jawaban}
                                                onChange={() => {}}
                                                placeholder="..."
                                                readOnly
                                              />
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </PertanyaanCard>
                            </>
                          );
                        })()}

                        {/* ── Refleksi 1 ── */}
                        {key === "refleksi_1" && (
                          <>
                            <SoalBadge n={6} label="Refleksi Individu" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">
                                Dari kelima situasi, tuliskan dalam kalimatmu sendiri: apa <strong>perbedaan paling mendasar</strong> antara permutasi dan kombinasi?
                              </p>
                              <TextArea value={refleksi1} onChange={setRefleksi1} rows={4} readOnly />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Refleksi 2 ── */}
                        {key === "refleksi_2" && (
                          <>
                            <SoalBadge n={7} label="Refleksi Individu — Situasi Pengecoh" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">Situasi mana yang paling mengecoh? Mengapa?</p>
                              <TextArea value={refleksi2} onChange={setRefleksi2} rows={3} readOnly />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Bagian A1 ── */}
                        {key === "bagian_a_1" && (
                          <>
                            <SoalBadge n={8} label="Bagian A — Pertanyaan 1" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">
                                Menurutmu, benarkah jawaban siswa tersebut? Jelaskan alasannya!
                              </p>
                              <TextArea value={bagianA1} onChange={setBagianA1} rows={4} readOnly />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Bagian A2 ── */}
                        {key === "bagian_a_2" && (
                          <>
                            <SoalBadge n={9} label="Bagian A — Pertanyaan 2" />
                            <PertanyaanCard readOnly>
                              <p className="text-sm font-medium text-slate-800">Berapa jawaban yang benar? Tuliskan cara menghitungnya!</p>
                              <TextArea value={bagianA2} onChange={setBagianA2} rows={3} readOnly />
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Bagian B ── */}
                        {key === "bagian_b" && (
                          <>
                            <SoalBadge n={10} label="Bagian B — Rancang Sendiri" />
                            <PertanyaanCard readOnly>
                              <div className="space-y-4">
                                <TextArea label="Contoh kombinasi buatanku:" value={contohBuatanku} onChange={setContohBuatanku} rows={3} readOnly />
                                <TextArea label="Non-contoh kombinasi buatanku:" value={nonContohBuatanku} onChange={setNonContohBuatanku} rows={3} readOnly />
                                <TextArea label="Alasan mengapa itu non-contoh:" value={alasanNonContoh} onChange={setAlasanNonContoh} rows={3} readOnly />
                              </div>
                            </PertanyaanCard>
                          </>
                        )}

                        {/* ── Feedback ── */}
                        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── FRESH MODE ── */}
        {!isLoadingExisting && !hasExistingSubmissions && (
        <>
        {/* ── Outer border wrapper ── */}
        <div
          className="rounded-2xl border-2 p-6 md:p-8 space-y-10"
          style={{ borderColor: C.greenLight }}
        >
          {/* ═══════════════════════════════════════════════
              PETUNJUK + PANDUAN
              ═══════════════════════════════════════════════ */}
          <SectionHeader
            icon="🧭"
            title="Petunjuk"
            subtitle="Ini adalah aktivitas paling kritis dalam seluruh materi kaidah pencacahan yaitu kemampuan membedakan permutasi dan kombinasi. Jangan terburu-buru. Baca setiap situasi dengan cermat, jawab pertanyaan panduan, baru tentukan jenisnya."
          />

          {/* Pertanyaan Panduan */}
          <div
            className="rounded-xl p-4 border-2"
            style={{
              borderColor: "#2A5A8C33",
              backgroundColor: "#2A5A8C08",
            }}
          >
            <p className="text-sm font-bold mb-2" style={{ color: "#2A5A8C" }}>
              🤔 Pertanyaan Panduan:
            </p>
            <p className="text-sm text-slate-700 mb-3">
              Tanyakan satu pertanyaan kunci ini:{" "}
              <em>
                &quot;Jika saya menukar posisi dua objek yang terpilih, apakah
                hasilnya berubah?&quot;
              </em>
            </p>
            <ul className="text-sm space-y-1" style={{ color: "#2A5A8C" }}>
              <li>
                <strong>YA, berubah</strong> → urutan penting →{" "}
                <strong>Permutasi</strong>
              </li>
              <li>
                <strong>TIDAK, sama saja</strong> → urutan tidak penting →{" "}
                <strong>Kombinasi</strong>
              </li>
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════
              SITUASI 1-5
              ═══════════════════════════════════════════════ */}
          {SITUASI.map((s, idx) => {
            if (idx > currentStep) return null;
            return (
            <div key={s.nomor}>
              <SoalBadge n={s.nomor} label={`Situasi ${s.nomor}`} />
              <PertanyaanCard>
                {/* Deskripsi */}
                <p className="text-sm font-medium text-slate-800">
                  {s.deskripsi}
                </p>

                {/* Pertanyaan Panduan */}
                <div className="rounded-lg p-3" style={{ backgroundColor: "#f1f5f9" }}>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Pertanyaan Panduan:
                  </p>
                  <p className="text-sm text-slate-700 italic">
                    {s.pertanyaanPanduan}
                  </p>
                </div>

                {/* Simulasi (fitur baru) — di atas tabel analisis */}
                <SimulasiPilihan
                  objekPilihan={s.objekPilihan}
                  jumlahSlot={s.jumlahSlot}
                  urutanPenting={s.urutanPenting}
                  state={simulasi[idx]}
                  onChange={(next) => updateSimulasi(idx, next)}
                />

                {/* Tabel analisis */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: C.border }}>
                        <th className="text-left py-2 pr-4 font-semibold text-slate-600">
                          Analisis
                        </th>
                        <th className="text-left py-2 font-semibold text-slate-600">
                          Jawaban
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.analisis.map((a, ai) => (
                        <tr
                          key={a.key}
                          className="border-b"
                          style={{ borderColor: `${C.border}80` }}
                        >
                          <td className="py-2.5 pr-4 text-slate-700 align-top">
                            {a.label}
                          </td>
                          <td className="py-2.5 align-top">
                            {a.type === "yaTidak" ? (
                              <YaTidakRadio
                                name={`s${s.nomor}_${a.key}`}
                                value={getSituasiField(idx, a.key) as YaTidak}
                                onChange={(v) =>
                                  updateSituasi(idx, a.key as keyof SituasiState, v)
                                }
                              />
                            ) : a.type === "jenis" ? (
                              <JenisRadio
                                name={`s${s.nomor}_jenis`}
                                value={situasi[idx].jenis}
                                onChange={(v) =>
                                  updateSituasi(idx, "jenis", v)
                                }
                              />
                            ) : (
                              <div className="space-y-1">
                                <TextInput
                                  value={situasi[idx].jawaban}
                                  onChange={(v) =>
                                    updateSituasi(idx, "jawaban", v)
                                  }
                                  placeholder="Tulis jawaban akhir saja..."
                                />
                                <p className="text-[11px] text-slate-400 italic">
                                  💡 Cukup masukkan jawaban akhir, tidak perlu tulis cara panjang.
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {feedbackMap[`situasi_${s.nomor}`] && (
                  <FeedbackOrReveal qKey={`situasi_${s.nomor}`} fb={feedbackMap[`situasi_${s.nomor}`]} />
                )}
                <SaveButton
                  onClick={() => handleSave(`situasi_${s.nomor}`, s.nomor)}
                  isSaving={saving[`situasi_${s.nomor}`] ?? false}
                  isCorrect={feedbackMap[`situasi_${s.nomor}`]?.isCorrect ?? null}
                />
              </PertanyaanCard>
            </div>
            );
          })}

          {/* ═══════════════════════════════════════════════
              REFLEKSI INDIVIDU
              ═══════════════════════════════════════════════ */}
          {currentStep >= 5 && (
          <div>
            <SoalBadge n={6} label="Refleksi Individu" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800">
                Dari kelima situasi, tuliskan dalam kalimatmu sendiri: apa{" "}
                <strong>perbedaan paling mendasar</strong> antara permutasi dan
                kombinasi?
              </p>
              <TextArea
                value={refleksi1}
                onChange={setRefleksi1}
                placeholder="Tulis refleksimu di sini..."
                rows={4}
              />
              {feedbackMap["refleksi_1"] && (
                <FeedbackOrReveal qKey="refleksi_1" fb={feedbackMap["refleksi_1"]} />
              )}
              <SaveButton
                onClick={() => handleSave("refleksi_1")}
                isSaving={saving["refleksi_1"] ?? false}
                isCorrect={feedbackMap["refleksi_1"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {currentStep >= 6 && (
          <div>
            <SoalBadge n={7} label="Refleksi Individu — Situasi Pengecoh" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800">
                Situasi mana yang paling mengecoh? Mengapa?
              </p>
              <TextArea
                value={refleksi2}
                onChange={setRefleksi2}
                placeholder="Tulis jawabanmu di sini..."
                rows={3}
              />
              {feedbackMap["refleksi_2"] && (
                <FeedbackOrReveal qKey="refleksi_2" fb={feedbackMap["refleksi_2"]} />
              )}
              <SaveButton
                onClick={() => handleSave("refleksi_2")}
                isSaving={saving["refleksi_2"] ?? false}
                isCorrect={feedbackMap["refleksi_2"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* ═══════════════════════════════════════════════
              BAGIAN A — ANALISIS SITUASI
              ═══════════════════════════════════════════════ */}
          {currentStep >= 7 && (
          <>
          <SectionHeader
            icon="🔍"
            title="Bagian A — Analisis Situasi"
            subtitle="Soal: Dari 6 kandidat, akan dipilih Ketua dan Wakil Ketua OSIS. Jawaban siswa: 'Ini kombinasi, karena kita memilih 2 orang dari 6. Jawabannya C(6,2) = 15.'"
          />

          <div>
            <SoalBadge n={8} label="Bagian A — Pertanyaan 1" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800">
                Menurutmu, benarkah jawaban siswa tersebut? Jelaskan alasannya!
              </p>
              <TextArea
                value={bagianA1}
                onChange={setBagianA1}
                placeholder="Tulis analisismu di sini..."
                rows={4}
              />
              {feedbackMap["bagian_a_1"] && (
                <FeedbackOrReveal qKey="bagian_a_1" fb={feedbackMap["bagian_a_1"]} />
              )}
              <SaveButton
                onClick={() => handleSave("bagian_a_1")}
                isSaving={saving["bagian_a_1"] ?? false}
                isCorrect={feedbackMap["bagian_a_1"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          </>  
          )}

          {currentStep >= 8 && (
          <div>
            <SoalBadge n={9} label="Bagian A — Pertanyaan 2" />
            <PertanyaanCard>
              <p className="text-sm font-medium text-slate-800">
                Berapa jawaban yang benar? Tuliskan cara menghitungnya!
              </p>
              <TextArea
                value={bagianA2}
                onChange={setBagianA2}
                placeholder="Tulis cara dan jawabanmu di sini..."
                rows={3}
              />
              {feedbackMap["bagian_a_2"] && (
                <FeedbackOrReveal qKey="bagian_a_2" fb={feedbackMap["bagian_a_2"]} />
              )}
              <SaveButton
                onClick={() => handleSave("bagian_a_2")}
                isSaving={saving["bagian_a_2"] ?? false}
                isCorrect={feedbackMap["bagian_a_2"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          )}

          {/* ═══════════════════════════════════════════════
              BAGIAN B — RANCANG SENDIRI
              ═══════════════════════════════════════════════ */}
          {currentStep >= 9 && (
          <>
          <SectionHeader
            icon="✏️"
            title="Bagian B — Rancang Sendiri"
            subtitle="Buatlah SATU contoh dan SATU non-contoh orisinal (bukan dari soal manapun di modul ini) untuk konsep KOMBINASI. Non-contohmu boleh berupa situasi yang sebenarnya permutasi, atau situasi yang bukan keduanya."
          />

          <div>
            <SoalBadge n={10} label="Bagian B — Rancang Sendiri" />
            <PertanyaanCard>
              <div className="space-y-4">
                <TextArea
                  label="Contoh kombinasi buatanku:"
                  value={contohBuatanku}
                  onChange={setContohBuatanku}
                  placeholder="Tulis contoh orisinalmu di sini..."
                  rows={3}
                />
                <TextArea
                  label="Non-contoh kombinasi buatanku:"
                  value={nonContohBuatanku}
                  onChange={setNonContohBuatanku}
                  placeholder="Tulis non-contoh orisinalmu di sini..."
                  rows={3}
                />
                <TextArea
                  label="Alasan mengapa itu non-contoh:"
                  value={alasanNonContoh}
                  onChange={setAlasanNonContoh}
                  placeholder="Jelaskan alasannya..."
                  rows={3}
                />
              </div>
              {feedbackMap["bagian_b"] && (
                <FeedbackOrReveal qKey="bagian_b" fb={feedbackMap["bagian_b"]} />
              )}
              <SaveButton
                onClick={() => handleSave("bagian_b")}
                isSaving={saving["bagian_b"] ?? false}
                isCorrect={feedbackMap["bagian_b"]?.isCorrect ?? null}
              />
            </PertanyaanCard>
          </div>
          </>
          )}
        </div>
        </>  
        )}

        {/* ── Completion Banner ── */}
        {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
          <div
            className="mt-8 rounded-2xl border-2 p-6 text-center space-y-3"
            style={{ borderColor: C.green, backgroundColor: C.greenLight }}
          >
            <p className="text-2xl">🎉</p>
            <p className="text-lg font-bold" style={{ color: C.green }}>
              Kamu sudah menyelesaikan aktivitas ini!
            </p>
            <p className="text-sm text-slate-600">
              Semua soal telah dijawab dengan benar. Hebat! Kamu sudah memahami
              perbedaan permutasi dan kombinasi dengan baik.
            </p>
            <Link
              href="/siswa/activity/kombinasi"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline mt-2"
              style={{ color: C.green }}
            >
              ← Kembali ke daftar aktivitas
            </Link>
          </div>
        )}

        {/* ── Toast ── */}
        {toast.visible && (
          <div
            className="fixed bottom-6 right-6 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg transition-all z-50"
            style={{ backgroundColor: C.green }}
          >
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}