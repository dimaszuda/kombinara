"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/ui/Materi";
import { RichText } from "@/components/shared/RichText";
import { CheckIcon } from "@/components/ui/IconButton";
import PasswordWifiSimulation from "./PasswordWifiSimulation";
import CircularPermutationSimulation from "./CircularPermutationSimulation";

// ============================================================================
// "Lihat Jawabanku" — Types & Helpers
// ============================================================================

interface JawabanEntry {
  questionKey: string;
  answer: unknown;
  feedback: string | null;
  isCorrect: boolean | null;
  submittedAt: string | null;
}

interface JawabanResponse {
  section: string;
  conceptId: string;
  entries: JawabanEntry[];
}

/** Map section index → { conceptId, sectionName } for the jawaban API */
const SECTION_CONCEPT_MAP: Record<number, { conceptId: string; sectionName: string }> = {
  0: { conceptId: "permutasi_r_unsur_dari_n_unsur", sectionName: "eksplorasi_kontekstual" },
  1: { conceptId: "permutasi_r_unsur_dari_n_unsur", sectionName: "aktivitas_deep_learning" },
  3: { conceptId: "permutasi_dengan_unsur_sama", sectionName: "eksplorasi_kontekstual" },
  4: { conceptId: "permutasi_dengan_unsur_sama", sectionName: "aktivitas_deep_learning" },
  6: { conceptId: "permutasi_siklis", sectionName: "eksplorasi_kontekstual" },
  7: { conceptId: "permutasi_siklis", sectionName: "aktivitas_deep_learning" },
  9: { conceptId: "permutasi_siklis", sectionName: "contoh_soal" },
  10: { conceptId: "permutasi_siklis", sectionName: "refleksi_mini" },
};

/**
 * Transform raw API entries into a section-specific savedData shape.
 * Each section component expects its own savedData format.
 */
function entriesToSavedData(
  sectionName: string,
  entries: JawabanEntry[],
): Record<string, unknown> | undefined {
  if (!entries || entries.length === 0) return undefined;

  const data: Record<string, unknown> = {};

  switch (sectionName) {
    // ── eksplorasi_kontekstual ──────────────────────────────────
    case "eksplorasi_kontekstual": {
      for (const e of entries) {
        const ans = e.answer as Record<string, unknown> | null;
        data[e.questionKey] = {
          answer: ans,
          feedback: e.feedback,
          isCorrect: e.isCorrect,
        };
      }
      return { eksplorasi: data };
    }
    // ── aktivitas_deep_learning ─────────────────────────────────
    case "aktivitas_deep_learning": {
      for (const e of entries) {
        const ans = e.answer as Record<string, unknown> | null;
        if (!ans) continue;
        if (ans.question_key && typeof ans.question_key === "string") {
          // Per-question entry (e.g. A3, A4)
          data[ans.question_key] = {
            answer: ans,
            feedback: e.feedback,
            isCorrect: e.isCorrect,
          };
        } else if (ans.activity && typeof ans.activity === "string") {
          // Named activity (e.g. a1_table, a2_table, etc.)
          data[ans.activity] = {
            answer: ans,
            feedback: e.feedback,
            isCorrect: e.isCorrect,
          };
        } else {
          // Fallback: use questionKey
          data[e.questionKey] = {
            answer: ans,
            feedback: e.feedback,
            isCorrect: e.isCorrect,
          };
        }
      }
      return { deepLearning: data };
    }
    // ── contoh_soal ─────────────────────────────────────────────
    case "contoh_soal": {
      for (const e of entries) {
        const ans = e.answer as Record<string, unknown> | null;
        data[e.questionKey] = {
          answer: ans,
          isCorrect: e.isCorrect,
        };
      }
      return { contohSoal: data };
    }
    // ── refleksi_mini ───────────────────────────────────────────
    case "refleksi_mini": {
      for (const e of entries) {
        data[e.questionKey] = {
          answer: typeof e.answer === "string" ? e.answer : (e.answer ? JSON.stringify(e.answer) : ""),
          feedback: e.feedback,
          isCorrect: e.isCorrect,
        };
      }
      return { refleksi: data };
    }
    default:
      return undefined;
  }
}

// ── Spinner SVG ────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ============================================================================
// Shared: Normalize & Check helpers
// ============================================================================

function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/\*/g, "x")
    .replace(/÷/g, "/")
    .replace(/[：∶\:]/g, "/")
    .replace(/(\d)[.,](\d)/g, "$1$2")
    .replace(/\s+/g, "");
}

/** Ambil bagian akhir setelah "=" (jika ada), lalu normalisasi.
 *  Contoh: "24/4 = 6" → "6",  "24/4" → "24/4",  "6" → "6" */
function normalizeFinal(raw: string): string {
  const eqIdx = raw.lastIndexOf("=");
  const final = eqIdx >= 0 ? raw.slice(eqIdx + 1) : raw;
  return normalizeAnswer(final);
}

function checkAnswer(got: string, expected: string): "correct" | "incorrect" {
  return normalizeAnswer(got) === normalizeAnswer(expected) ? "correct" : "incorrect";
}

/** Seperti checkAnswer, tapi menerima beberapa bentuk jawaban benar */
function checkAnswerMulti(got: string, accepted: string[]): "correct" | "incorrect" {
  const n = normalizeAnswer(got);
  return accepted.some(a => n === normalizeAnswer(a)) ? "correct" : "incorrect";
}

// ============================================================================
// Shared: Inline Check Button (for quick self-check on short answers)
// ============================================================================

function CheckButton({ onClick, isCorrect }: { onClick: () => void; isCorrect: boolean }) {
  // Only hide the button when answer is already correct; keep it visible on wrong answer so user can retry
  if (isCorrect) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 inline-flex items-center gap-1 rounded-full border border-[#34673933] bg-[#DBFFD5]/40 px-3 py-1 text-xs font-medium text-[#346739] transition-colors hover:bg-[#DBFFD5] hover:border-[#346739] active:scale-95"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Cek
    </button>
  );
}

// ============================================================================
// Shared: Simpan Jawaban Button
// ============================================================================

function SaveButton({
  onClick,
  disabled = false,
  loading = false,
  saved = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  saved?: boolean;
}) {
  if (saved) return null;

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

// ── Lanjutkan Button (for read-only sections like penjelasan_konsep) ──
function NextButton({ onClick, loading = false }: { onClick: () => void; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4 mt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
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
            Lanjutkan
          </>
        )}
      </button>
    </div>
  );
}

// ── Progress Indicator ────────────────────────────────────────────
const PERMUTASI_SECTION_LABELS = [
  "Eksplorasi",
  "Aktivitas Deep Learning",
  "Penjelasan Konsep",
  "Eksplorasi",
  "Aktivitas Deep Learning",
  "Penjelasan Konsep",
  "Eksplorasi",
  "Aktivitas Deep Learning",
  "Penjelasan Konsep",
  "Contoh Soal",
  "Refleksi Mini",
] as const;

const TOTAL_PERMUTASI_SECTIONS = PERMUTASI_SECTION_LABELS.length;

function SectionProgress({
  currentSection,
  completedSections,
}: {
  currentSection: number;
  completedSections: Record<number, boolean>;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-[#663362] mb-3">
        Bagian {currentSection + 1} dari {TOTAL_PERMUTASI_SECTIONS}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: TOTAL_PERMUTASI_SECTIONS }, (_, i) => {
          const isCompleted = completedSections[i] === true;
          const isActive = i === currentSection;

          let dotBg = "bg-[#E5E5E0]";
          let dotBorder = "border-[#C5C5C0]";
          if (isCompleted) {
            dotBg = "bg-[#346739]";
            dotBorder = "border-[#346739]";
          } else if (isActive) {
            dotBg = "bg-white";
            dotBorder = "border-[#346739]";
          }

          return (
            <React.Fragment key={i}>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} text-[10px] font-bold transition-colors ${
                  isCompleted ? "text-white" : isActive ? "text-[#346739]" : "text-[#9E9D99]"
                }`}
                title={PERMUTASI_SECTION_LABELS[i]}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              {i < TOTAL_PERMUTASI_SECTIONS - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded transition-colors ${
                    completedSections[i] ? "bg-[#346739]" : "bg-[#E5E5E0]"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Shared: Inline Input Blank
// ============================================================================

function InputBlank({
  value,
  onChange,
  placeholder = "...",
  className = "",
  grade,
  disabled = false,
  maxWidth = "80px",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  grade?: "correct" | "incorrect" | null;
  disabled?: boolean;
  maxWidth?: string;
}) {
  let borderColor = "border-[#34673933]";
  let bgColor = "bg-white";
  if (grade === "correct") {
    borderColor = "border-[#346739]";
    bgColor = "bg-[#DBFFD5]/40";
  } else if (grade === "incorrect") {
    borderColor = "border-[#C44F4F]";
    bgColor = "bg-[#C44F4F]/5";
  }
  if (disabled) {
    bgColor = "bg-[#F5F5F0]";
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`inline-block rounded-md border-2 ${borderColor} ${bgColor} px-2 py-0.5 text-center text-sm font-medium text-[#663362] placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:text-[#6B6B66] ${className}`}
      style={{ minWidth: "44px", maxWidth }}
    />
  );
}

// ============================================================================
// Shared: TextArea for longer answers
// ============================================================================

function AnswerTextArea({
  value,
  onChange,
  placeholder = "Tulis jawabanmu...",
  rows = 3,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66] disabled:resize-none"
    />
  );
}

// ============================================================================
// Shared: Yes/No Toggle
// ============================================================================

function YesNoToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {[
        { key: "yes" as const, label: "Ya" },
        { key: "no" as const, label: "Tidak" },
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => !disabled && onChange(opt.key)}
          disabled={disabled}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === opt.key
              ? "bg-[#346739] text-white"
              : "bg-[#34673915] text-[#346739] hover:bg-[#34673926]"
          } disabled:opacity-50 disabled:cursor-default`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Shared: Sub-section wrapper for soal cards
// ============================================================================

function SoalCard({
  number,
  title,
  children,
  onSave,
  saved = false,
  loading = false,
}: {
  number?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  saved?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
      {(number || title) && (
        <p className="text-sm font-medium text-[#346739] mb-3">
          {number && `${number}. `}{title}
        </p>
      )}
      {children}
      {onSave && <SaveButton onClick={onSave} saved={saved} loading={loading} />}
    </div>
  );
}

// ============================================================================
// PART 1: PERMUTASI r UNSUR DARI n UNSUR
// ============================================================================

// ── 1A. Eksplorasi Kontekstual (AI Feedback) ────────────────────────

const SOAL_EKSPLORASI_PERMUTASI_1 =
  `Dalam sebuah lomba lari, terdapat 8 peserta. Apakah "Juara 1: Ari, Juara 2: Budi, Juara 3: Cici" sama dengan "Juara 1: Budi, Juara 2: Ari, Juara 3: Cici"?`;

const SOAL_EKSPLORASI_PERMUTASI_2 =
  `Dalam sebuah lomba lari, terdapat 8 peserta. Tiga posisi teratas (Juara 1, 2, dan 3) akan mendapat medali yang berbeda. Berapa banyak kemungkinan perolehan medali yang bisa terjadi?`;

const EKSPLORASI_PERMUTASI_SUBSTEP_KEYS = ["soal_1_abc_bac", "soal_2_hitung_medali"] as const;
const TOTAL_EKSPLORASI_PERMUTASI = EKSPLORASI_PERMUTASI_SUBSTEP_KEYS.length;

function EksplorasiKontekstual1({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  const [toggle, setToggle] = useState<"yes" | "no" | null>(null);
  const [alasan, setAlasan] = useState("");
  const [langkah, setLangkah] = useState("");
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [checkingSubStep, setCheckingSubStep] = useState<number | null>(null);
  const [subStepFeedback, setSubStepFeedback] = useState<Record<number, { text: string; isCorrect: boolean }>>({});
  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const eksplorasiData = savedData.eksplorasi as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!eksplorasiData) return;

    // Soal 1: soal_1_abc_bac
    const entry0 = eksplorasiData["soal_1_abc_bac"];
    if (entry0?.answer) {
      const ans = entry0.answer as Record<string, unknown>;
      const jawaban = String(ans.jawaban ?? "");
      if (jawaban === "Sama") setToggle("yes");
      else if (jawaban === "Tidak sama") setToggle("no");
      setAlasan(String(ans.alasan ?? ""));
      setSubStepFeedback((prev) => ({
        ...prev,
        0: { text: entry0.feedback ?? "Jawaban tersimpan.", isCorrect: entry0.isCorrect ?? false },
      }));
    }

    // Soal 2: soal_2_hitung_medali
    const entry1 = eksplorasiData["soal_2_hitung_medali"];
    if (entry1?.answer) {
      const ans = entry1.answer as Record<string, unknown>;
      setLangkah(String(ans.jawaban ?? ""));
      setSubStepFeedback((prev) => ({
        ...prev,
        1: { text: entry1.feedback ?? "Jawaban tersimpan.", isCorrect: entry1.isCorrect ?? false },
      }));
    }

    // Determine current sub-step based on what's completed
    const fb0 = entry0?.isCorrect === true;
    const fb1 = entry1?.isCorrect === true;
    if (fb0 && fb1) {
      setCurrentSubStep(1);
      // All complete — mark as completed
      onCompleteCalled.current = true;
    } else if (fb0) {
      setCurrentSubStep(1);
    }

    didSyncSavedData.current = true;
  }, [savedData]);

  const allSubStepsComplete =
    currentSubStep >= TOTAL_EKSPLORASI_PERMUTASI - 1 &&
    subStepFeedback[TOTAL_EKSPLORASI_PERMUTASI - 1]?.isCorrect === true;

  // Notify parent when all sub-steps are complete
  useEffect(() => {
    if (allSubStepsComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allSubStepsComplete, onComplete]);

  async function handleSubStepSubmit(subStepIndex: number) {
    setCheckingSubStep(subStepIndex);

    let soal: string;
    let jawaban: string;
    let alasanText: string;

    if (subStepIndex === 0) {
      jawaban = toggle === "yes" ? "Sama" : toggle === "no" ? "Tidak sama" : "";
      alasanText = alasan;
      soal = SOAL_EKSPLORASI_PERMUTASI_1;
    } else {
      jawaban = langkah;
      alasanText = "Langkah perhitungan";
      soal = SOAL_EKSPLORASI_PERMUTASI_2;
    }

    // Client-side validation
    if (!jawaban || (subStepIndex === 0 && !alasanText.trim()) || (subStepIndex === 1 && !jawaban.trim())) {
      setSubStepFeedback((prev) => ({
        ...prev,
        [subStepIndex]: {
          text: subStepIndex === 0
            ? "Jawab pertanyaan dan ceritakan alasanmu dulu ya!"
            : "Tulis langkah perhitunganmu dulu ya!",
          isCorrect: false,
        },
      }));
      setCheckingSubStep(null);
      return;
    }

    try {
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal, jawaban, alasan: alasanText }),
      });

      let feedbackText: string;
      let isCorrect: boolean;

      if (res.ok) {
        const data = await res.json();
        feedbackText = data.feedback ?? "Jawaban tersimpan.";
        isCorrect = data.isCorrect ?? false;
      } else {
        feedbackText = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
        isCorrect = false;
      }

      setSubStepFeedback((prev) => ({
        ...prev,
        [subStepIndex]: { text: feedbackText, isCorrect },
      }));

      if (isCorrect && subStepIndex < TOTAL_EKSPLORASI_PERMUTASI - 1) {
        setCurrentSubStep((prev) => prev + 1);
      }

      // Save to DB
      const questionKey = EKSPLORASI_PERMUTASI_SUBSTEP_KEYS[subStepIndex];
      const answerPayload: Record<string, unknown> = {
        soal,
        jawaban,
        alasan: alasanText,
      };

      fetch("/api/eksplorasi-kontekstual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_r_unsur_dari_n_unsur",
          question_key: questionKey,
          answer: answerPayload,
          feedback: feedbackText,
          is_correct: isCorrect,
        }),
      }).catch((err) => console.error("[eksplorasi-kontekstual] DB save error:", err));
    } catch {
      setSubStepFeedback((prev) => ({
        ...prev,
        [subStepIndex]: {
          text: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!",
          isCorrect: false,
        },
      }));
    } finally {
      setCheckingSubStep(null);
    }
  }

  const fb0 = subStepFeedback[0];
  const fb1 = subStepFeedback[1];

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      {/* Sub-step progress */}
      <div className="mb-4">
        <p className="text-xs font-medium text-[#663362] mb-2">
          Langkah {currentSubStep + 1} dari {TOTAL_EKSPLORASI_PERMUTASI}
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 1].map((i) => {
            const fb = subStepFeedback[i];
            const isCompleted = fb?.isCorrect === true;
            const isActive = i === currentSubStep;
            let dotBg = "bg-[#E5E5E0]";
            let dotBorder = "border-[#C5C5C0]";
            if (isCompleted) { dotBg = "bg-[#346739]"; dotBorder = "border-[#346739]"; }
            else if (isActive) { dotBg = "bg-white"; dotBorder = "border-[#346739]"; }
            return (
              <React.Fragment key={i}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} text-[10px] font-bold transition-colors ${isCompleted ? "text-white" : isActive ? "text-[#346739]" : "text-[#9E9D99]"}`}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                {i < 1 && <div className={`h-0.5 flex-1 rounded transition-colors ${subStepFeedback[i]?.isCorrect ? "bg-[#346739]" : "bg-[#E5E5E0]"}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Dalam sebuah lomba lari, terdapat <b>8 peserta</b>. Tiga posisi teratas (Juara 1, 2, dan 3)
          akan mendapat medali yang berbeda (emas, perak, perunggu). Berapa banyak kemungkinan
          perolehan medali yang bisa terjadi?
        </p>

        {/* Placeholder image for podium */}
        <div className="mb-5 rounded-xl border border-[#34673926] overflow-hidden">
          <Image
            src="/images/pemenang lomba lari.svg"
            alt="Ilustrasi podium lomba lari"
            width={800}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Soal 1: ABC vs BAC */}
        {currentSubStep >= 0 && (
          <SoalCard
            number="1"
            title={`Apakah "Juara 1: Ari, Juara 2: Budi, Juara 3: Cici" sama dengan "Juara 1: Budi, Juara 2: Ari, Juara 3: Cici"?`}
          >
            <p className="text-sm text-[#2C2C2A] mb-3">
              ABC apakah sama dengan BAC?
            </p>
            <YesNoToggle value={toggle} onChange={setToggle} disabled={fb0?.isCorrect === true} />
            <div className="mt-3">
              <p className="text-sm text-[#2C2C2A] mb-1">Berikan alasanmu:</p>
              <AnswerTextArea
                value={alasan}
                onChange={setAlasan}
                rows={2}
                disabled={fb0?.isCorrect === true}
                placeholder="Tulis alasanmu..."
              />
            </div>

            {fb0 && (
              <div className={`mt-3 rounded-lg border p-3 ${fb0.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${fb0.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {fb0.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{fb0.text}</RichText>
              </div>
            )}

            {currentSubStep === 0 && fb0?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleSubStepSubmit(0)}
                  disabled={checkingSubStep === 0}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingSubStep === 0 ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>
        )}

        {/* Soal 2: Hitung perolehan medali */}
        {currentSubStep >= 1 && (
          <div className="mt-4">
            <SoalCard
              number="2"
              title="Coba kamu hitung berapa banyak perolehan medali yang bisa terjadi!"
            >
              <p className="text-sm text-[#2C2C2A] mb-2">Langkah perhitungan:</p>
              <AnswerTextArea
                value={langkah}
                onChange={setLangkah}
                rows={4}
                disabled={fb1?.isCorrect === true}
                placeholder="Tulis langkah perhitunganmu..."
              />

              {fb1 && (
                <div className={`mt-3 rounded-lg border p-3 ${fb1.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                  <p className={`mb-1 text-xs font-medium ${fb1.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                    {fb1.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                  </p>
                  <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{fb1.text}</RichText>
                </div>
              )}

              {currentSubStep === 1 && fb1?.isCorrect !== true && (
                <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                  <button
                    type="button"
                    onClick={() => handleSubStepSubmit(1)}
                    disabled={checkingSubStep === 1}
                    className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                  >
                    {checkingSubStep === 1 ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                  </button>
                </div>
              )}
            </SoalCard>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
          <p className="text-sm font-medium text-[#346739]">
            💡 Inilah inti dari permutasi: <b>urutan sangat penting.</b>
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 1B. Aktivitas Deep Learning (Rule Based + AI Feedback) ──────────

// ── Rule-based correct answers ───────────────────────────────────
const ADI_TABLE_EXPECTED = {
  adiR4H2: "i", adiR4Sus: "di",
  adiR5H1: "i", adiR5H2: "a", adiR5Sus: "ia",
  adiR6H1: "i", adiR6H2: "d", adiR6Sus: "id",
};

const POLA_TABLE_EXPECTED = {
  pola5_3: "5x4x3", pola5_3_fak: "5!/2!", pola5_3_val: "60",
  pola6_2: "6x5", pola6_2_denom: "6!/4!", pola6_2_val: "30",
  pola6_3: "6x5x4", pola6_3_fak: "6!/3!", pola6_3_val: "120",
  pola_n_r: "nx(n-1)x...x(n-r+1)", pola_n_r_fak: "n!/(n-r)!",
};

function AktivitasDeepLearning1({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  // ── Aktivitas 1: Tabel ADI (Rule Based) ────────────────────────
  const [adiR4H2, setAdiR4H2] = useState("");
  const [adiR4Sus, setAdiR4Sus] = useState("");
  const [adiR5H1, setAdiR5H1] = useState("");
  const [adiR5H2, setAdiR5H2] = useState("");
  const [adiR5Sus, setAdiR5Sus] = useState("");
  const [adiR6H1, setAdiR6H1] = useState("");
  const [adiR6H2, setAdiR6H2] = useState("");
  const [adiR6Sus, setAdiR6Sus] = useState("");
  const [a1TableAllCorrect, setA1TableAllCorrect] = useState(false);
  const [a1TableFeedback, setA1TableFeedback] = useState("");

  // ── Inline checks (Rule Based — already use checkAnswer) ────────
  const [totalSusunan, setTotalSusunan] = useState("");
  const [totalSusunanGrade, setTotalSusunanGrade] = useState<"correct" | "incorrect" | null>(null);
  const [kaidahPerkalian, setKaidahPerkalian] = useState("");
  const [kaidahPerkalianGrade, setKaidahPerkalianGrade] = useState<"correct" | "incorrect" | null>(null);
  const [kedudukan, setKedudukan] = useState("");
  const [kedudukanGrade, setKedudukanGrade] = useState<"correct" | "incorrect" | null>(null);
  const [namaKedudukan, setNamaKedudukan] = useState("");
  const [namaKedudukanGrade, setNamaKedudukanGrade] = useState<"correct" | "incorrect" | null>(null);
  const [jumlahKotak, setJumlahKotak] = useState("");
  const [jumlahKotakGrade, setJumlahKotakGrade] = useState<"correct" | "incorrect" | null>(null);
  const [kemungkinan1, setKemungkinan1] = useState("");
  const [kemungkinan1Grade, setKemungkinan1Grade] = useState<"correct" | "incorrect" | null>(null);
  const [kemungkinan2, setKemungkinan2] = useState("");
  const [kemungkinan2Grade, setKemungkinan2Grade] = useState<"correct" | "incorrect" | null>(null);
  const [totalCara, setTotalCara] = useState("");
  const [totalCaraGrade, setTotalCaraGrade] = useState<"correct" | "incorrect" | null>(null);
  const [hubunganFaktorial, setHubunganFaktorial] = useState("");
  const [hubunganFaktorialFB, setHubunganFaktorialFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checkingHubunganFaktorial, setCheckingHubunganFaktorial] = useState(false);

  // ── AI Feedback: Alasan & Kesimpulan ────────────────────────────
  const [alasanHuruf2, setAlasanHuruf2] = useState("");
  const [savedAlasan, setSavedAlasan] = useState(false);
  const [alasanFB, setAlasanFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checkingAlasan, setCheckingAlasan] = useState(false);

  const [kesimpulan1, setKesimpulan1] = useState("");
  const [savedKesimpulan, setSavedKesimpulan] = useState(false);
  const [kesimpulanFB, setKesimpulanFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checkingKesimpulan, setCheckingKesimpulan] = useState(false);

  // ── Aktivitas 2: Tabel Pola (Rule Based) ────────────────────────
  const [pola5_3, setPola5_3] = useState("");
  const [pola5_3_fak, setPola5_3_fak] = useState("");
  const [pola5_3_val, setPola5_3_val] = useState("");
  const [pola6_2, setPola6_2] = useState("");
  const [pola6_2_denom, setPola6_2_denom] = useState("");
  const [pola6_2_val, setPola6_2_val] = useState("");
  const [pola6_3, setPola6_3] = useState("");
  const [pola6_3_fak, setPola6_3_fak] = useState("");
  const [pola6_3_val, setPola6_3_val] = useState("");
  const [pola_n_r, setPola_n_r] = useState("");
  const [pola_n_r_fak, setPola_n_r_fak] = useState("");
  const [pola_n_r_val, setPola_n_r_val] = useState("");
  const [rumusUmum, setRumusUmum] = useState("");
  const [a2TableAllCorrect, setA2TableAllCorrect] = useState(false);
  const [a2TableFeedback, setA2TableFeedback] = useState("");

  // ── Aktivitas 3: Diskusi (AI Feedback) ──────────────────────────
  const [diskusiA, setDiskusiA] = useState("");
  const [diskusiB, setDiskusiB] = useState("");
  const [podiumCalc, setPodiumCalc] = useState("");
  const [a3aFB, setA3aFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [a3bFB, setA3bFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [a3cFB, setA3cFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checkingA3a, setCheckingA3a] = useState(false);
  const [checkingA3b, setCheckingA3b] = useState(false);
  const [checkingA3c, setCheckingA3c] = useState(false);

  // ── Aktivitas B4: Simpulan (AI Feedback) ────────────────────────
  const [simpulan1, setSimpulan1] = useState("");
  const [simpulan2, setSimpulan2] = useState("");
  const [a4aFB, setA4aFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [a4bFB, setA4bFB] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checkingA4a, setCheckingA4a] = useState(false);
  const [checkingA4b, setCheckingA4b] = useState(false);

  // ── Sequential step tracking ────────────────────────────────────
  const [deepStep, setDeepStep] = useState(0);
  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const dl = savedData.deepLearning as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!dl) return;

    // ── Restore A1 Table ──────────────────────────────────────────
    const a1 = dl["a1_table"];
    if (a1?.answer) {
      const a = a1.answer as Record<string, unknown>;
      if (typeof a.adiR4H2 === "string") setAdiR4H2(a.adiR4H2);
      if (typeof a.adiR4Sus === "string") setAdiR4Sus(a.adiR4Sus);
      if (typeof a.adiR5H1 === "string") setAdiR5H1(a.adiR5H1);
      if (typeof a.adiR5H2 === "string") setAdiR5H2(a.adiR5H2);
      if (typeof a.adiR5Sus === "string") setAdiR5Sus(a.adiR5Sus);
      if (typeof a.adiR6H1 === "string") setAdiR6H1(a.adiR6H1);
      if (typeof a.adiR6H2 === "string") setAdiR6H2(a.adiR6H2);
      if (typeof a.adiR6Sus === "string") setAdiR6Sus(a.adiR6Sus);
      if (a1.isCorrect === true) setA1TableAllCorrect(true);
    }

    // ── Restore A2 Table ──────────────────────────────────────────
    const a2 = dl["a2_table"];
    if (a2?.answer) {
      const a = a2.answer as Record<string, unknown>;
      if (typeof a.pola5_3 === "string") setPola5_3(a.pola5_3);
      if (typeof a.pola5_3_fak === "string") setPola5_3_fak(a.pola5_3_fak);
      if (typeof a.pola5_3_val === "string") setPola5_3_val(a.pola5_3_val);
      if (typeof a.pola6_2 === "string") setPola6_2(a.pola6_2);
      if (typeof a.pola6_2_denom === "string") setPola6_2_denom(a.pola6_2_denom);
      if (typeof a.pola6_2_val === "string") setPola6_2_val(a.pola6_2_val);
      if (typeof a.pola6_3 === "string") setPola6_3(a.pola6_3);
      if (typeof a.pola6_3_fak === "string") setPola6_3_fak(a.pola6_3_fak);
      if (typeof a.pola6_3_val === "string") setPola6_3_val(a.pola6_3_val);
      if (typeof a.pola_n_r === "string") setPola_n_r(a.pola_n_r);
      if (typeof a.pola_n_r_fak === "string") setPola_n_r_fak(a.pola_n_r_fak);
      if (typeof a.pola_n_r_val === "string") setPola_n_r_val(a.pola_n_r_val);
      if (typeof a.rumusUmum === "string") setRumusUmum(a.rumusUmum);
      if (a2.isCorrect === true) setA2TableAllCorrect(true);
    }

    // ── Set deepStep based on what was completed ───────────────────
    if (a1?.isCorrect === true && a2?.isCorrect === true) {
      // Both tables done — set deepStep to show all content
      setDeepStep(3);
      setDiskusiStep(2);
      setSimpulanStep(1);
      setAktivitas4Visible(true);

      // ── Restore AI-graded answers (now saved with question_key) ──
      const restoreAI = (qKey: string, setText: (v: string) => void, setFB: (fb: { text: string; isCorrect: boolean } | null) => void, setSaved?: (v: boolean) => void) => {
        const entry = dl[qKey];
        if (entry?.answer) {
          const a = entry.answer as Record<string, unknown>;
          if (typeof a.jawaban === "string") setText(a.jawaban);
          setFB({ text: entry.feedback ?? "Jawaban tersimpan.", isCorrect: entry.isCorrect ?? false });
          if (setSaved && entry.isCorrect === true) setSaved(true);
        }
      };

      restoreAI("adl1_alasan", setAlasanHuruf2, setAlasanFB, setSavedAlasan);
      restoreAI("adl1_hubungan_faktorial", setHubunganFaktorial, setHubunganFaktorialFB);
      restoreAI("adl1_kesimpulan", setKesimpulan1, setKesimpulanFB, setSavedKesimpulan);
      restoreAI("adl1_a3a", setDiskusiA, setA3aFB);
      restoreAI("adl1_a3b", setDiskusiB, setA3bFB);
      restoreAI("adl1_a3c", setPodiumCalc, setA3cFB);
      restoreAI("adl1_a4a", setSimpulan1, setA4aFB);
      restoreAI("adl1_a4b", setSimpulan2, setA4bFB);

      onCompleteCalled.current = true;
    } else if (a1?.isCorrect === true) {
      setDeepStep(1);
    }

    didSyncSavedData.current = true;
  }, [savedData]);

  // Step 0 → 1: Tabel A1 selesai
  useEffect(() => {
    if (a1TableAllCorrect && deepStep === 0) setDeepStep(1);
  }, [a1TableAllCorrect, deepStep]);

  // Step 1 → 2: Kesimpulan dijawab benar (menandakan inline checks + AI selesai)
  useEffect(() => {
    if (savedKesimpulan && deepStep === 1) setDeepStep(2);
  }, [savedKesimpulan, deepStep]);

  // Step 2 → 3: Tabel A2 selesai
  useEffect(() => {
    if (a2TableAllCorrect && deepStep === 2) setDeepStep(3);
  }, [a2TableAllCorrect, deepStep]);

  // Step 3 → complete: A3 (3a,3b,3c) + A4 (4a,4b) semua benar
  useEffect(() => {
    const a3done = a3aFB?.isCorrect === true && a3bFB?.isCorrect === true && a3cFB?.isCorrect === true;
    const a4done = a4aFB?.isCorrect === true && a4bFB?.isCorrect === true;
    if (deepStep === 3 && a3done && a4done && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [deepStep, a3aFB, a3bFB, a3cFB, a4aFB, a4bFB, onComplete]);

  // ── Internal sequential step for Aktivitas 3 (Diskusi) & 4 (Simpulan) ──
  const [diskusiStep, setDiskusiStep] = useState(0);
  const [simpulanStep, setSimpulanStep] = useState(0);

  useEffect(() => { if (a3aFB?.isCorrect === true && diskusiStep === 0) setDiskusiStep(1); }, [a3aFB, diskusiStep]);
  useEffect(() => { if (a3bFB?.isCorrect === true && diskusiStep === 1) setDiskusiStep(2); }, [a3bFB, diskusiStep]);

  // Aktivitas 4 only appears after ALL of Aktivitas 3 is done
  const [aktivitas4Visible, setAktivitas4Visible] = useState(false);
  useEffect(() => {
    if (a3aFB?.isCorrect === true && a3bFB?.isCorrect === true && a3cFB?.isCorrect === true && !aktivitas4Visible) {
      setAktivitas4Visible(true);
    }
  }, [a3aFB, a3bFB, a3cFB, aktivitas4Visible]);

  useEffect(() => { if (a4aFB?.isCorrect === true && simpulanStep === 0) setSimpulanStep(1); }, [a4aFB, simpulanStep]);

  // ── Rule Based: Check A1 Table ──────────────────────────────────
  function checkA1Table() {
    const errors: string[] = [];
    const checks: [string, string, string][] = [
      [normalizeAnswer(adiR4H2), ADI_TABLE_EXPECTED.adiR4H2, "Baris 4 Huruf 2"],
      [normalizeAnswer(adiR4Sus), ADI_TABLE_EXPECTED.adiR4Sus, "Baris 4 Susunan"],
      [normalizeAnswer(adiR5H1), ADI_TABLE_EXPECTED.adiR5H1, "Baris 5 Huruf 1"],
      [normalizeAnswer(adiR5H2), ADI_TABLE_EXPECTED.adiR5H2, "Baris 5 Huruf 2"],
      [normalizeAnswer(adiR5Sus), ADI_TABLE_EXPECTED.adiR5Sus, "Baris 5 Susunan"],
      [normalizeAnswer(adiR6H1), ADI_TABLE_EXPECTED.adiR6H1, "Baris 6 Huruf 1"],
      [normalizeAnswer(adiR6H2), ADI_TABLE_EXPECTED.adiR6H2, "Baris 6 Huruf 2"],
      [normalizeAnswer(adiR6Sus), ADI_TABLE_EXPECTED.adiR6Sus, "Baris 6 Susunan"],
    ];
    for (const [got, exp, label] of checks) {
      if (!got) { errors.push(`${label} belum diisi`); }
      else if (got !== exp) { errors.push(`${label} kurang tepat`); }
    }
    return errors;
  }

  async function handleSaveA1Table() {
    const errors = checkA1Table();
    const isCorrect = errors.length === 0;
    if (!isCorrect) {
      setA1TableFeedback(errors.join(". ") + ". Perbaiki ya!");
      setA1TableAllCorrect(false);
    } else {
      setA1TableFeedback("");
      setA1TableAllCorrect(true);
    }
    // Save EVERY attempt to DB
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_r_unsur_dari_n_unsur",
          answer: {
            activity: "a1_table",
            adiR4H2, adiR4Sus, adiR5H1, adiR5H2, adiR5Sus, adiR6H1, adiR6H2, adiR6Sus,
          },
          feedback: isCorrect ? "Tabel ADI benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-1-a1] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-1-a1] DB save error:", err);
    }
  }

  // ── Rule Based: Check A2 Pola Table ─────────────────────────────
  function checkA2Table() {
    const errors: string[] = [];
    const checks: [string, string, string][] = [
      [normalizeAnswer(pola5_3), POLA_TABLE_EXPECTED.pola5_3, "Baris 5,3 Cara"],
      [normalizeAnswer(pola5_3_fak), POLA_TABLE_EXPECTED.pola5_3_fak, "Baris 5,3 Faktorial"],
      [normalizeAnswer(pola5_3_val), POLA_TABLE_EXPECTED.pola5_3_val, "Baris 5,3 Nilai"],
      [normalizeAnswer(pola6_2), POLA_TABLE_EXPECTED.pola6_2, "Baris 6,2 Cara"],
      [normalizeAnswer(pola6_2_denom), POLA_TABLE_EXPECTED.pola6_2_denom, "Baris 6,2 Faktorial"],
      [normalizeAnswer(pola6_2_val), POLA_TABLE_EXPECTED.pola6_2_val, "Baris 6,2 Nilai"],
      [normalizeAnswer(pola6_3), POLA_TABLE_EXPECTED.pola6_3, "Baris 6,3 Cara"],
      [normalizeAnswer(pola6_3_fak), POLA_TABLE_EXPECTED.pola6_3_fak, "Baris 6,3 Faktorial"],
      [normalizeAnswer(pola6_3_val), POLA_TABLE_EXPECTED.pola6_3_val, "Baris 6,3 Nilai"],
    ];
    for (const [got, exp, label] of checks) {
      if (!got) { errors.push(`${label} belum diisi`); }
      else if (got !== exp) { errors.push(`${label} kurang tepat`); }
    }
    // Baris terakhir (n,r) → multi-accept karena banyak variasi penulisan
    {
      const got = normalizeFinal(pola_n_r);
      if (!got) errors.push("Baris n,r Cara belum diisi");
      else if (!["nx(n-1)x...x(n-r+1)", "n(n-1)...(n-r+1)"].includes(got))
        errors.push("Baris n,r Cara kurang tepat");

      const gotFak = normalizeFinal(pola_n_r_fak);
      if (!gotFak) errors.push("Baris n,r Faktorial belum diisi");
      else if (gotFak !== "n!/(n-r)!")
        errors.push("Baris n,r Faktorial kurang tepat");
    }
    if (!rumusUmum.trim()) { errors.push("Rumus umum belum diisi"); }
    return errors;
  }

  async function handleSaveA2Table() {
    const errors = checkA2Table();
    const isCorrect = errors.length === 0;
    if (!isCorrect) {
      setA2TableFeedback(errors.join(". ") + ". Perbaiki ya!");
      setA2TableAllCorrect(false);
    } else {
      setA2TableFeedback("");
      setA2TableAllCorrect(true);
    }
    // Save EVERY attempt to DB
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_r_unsur_dari_n_unsur",
          answer: {
            activity: "a2_table",
            pola5_3, pola5_3_fak, pola5_3_val,
            pola6_2, pola6_2_denom, pola6_2_val,
            pola6_3, pola6_3_fak, pola6_3_val,
            pola_n_r, pola_n_r_fak, pola_n_r_val,
            rumusUmum,
          },
          feedback: isCorrect ? "Tabel Pola benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-1-a2] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-1-a2] DB save error:", err);
    }
  }

  // ── AI Feedback handlers ────────────────────────────────────────
  async function handleSaveAlasan() {
    if (!alasanHuruf2.trim()) {
      setAlasanFB({ text: "Tulis alasanmu dulu ya!", isCorrect: false });
      return;
    }
    setCheckingAlasan(true);
    try {
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: "Dari 3 huruf {A, D, I}, huruf 1 ada 3 kemungkinan. Setelah huruf 1 dipilih, berapa kemungkinan untuk huruf 2? Mengapa?",
          jawaban: kemungkinan2,
          alasan: alasanHuruf2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: data.isCorrect ?? false };
        setAlasanFB(fb);
        if (fb.isCorrect) { setSavedAlasan(true); }
        // Save to DB
        try {
          const saveRes = await fetch("/api/aktivitas-deep-learning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              concept_id: "permutasi_r_unsur_dari_n_unsur",
              answer: { question_key: "adl1_alasan", jawaban: kemungkinan2, alasan: alasanHuruf2 },
              feedback: fb.text,
              is_correct: fb.isCorrect,
            }),
          });
          if (!saveRes.ok) console.error("[deep-learning-1-alasan] DB save failed:", saveRes.status);
        } catch (err) {
          console.error("[deep-learning-1-alasan] DB save error:", err);
        }
      } else {
        setAlasanFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
      }
    } catch {
      setAlasanFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
    } finally {
      setCheckingAlasan(false);
    }
  }

  async function handleSaveHubunganFaktorial() {
    if (!hubunganFaktorial.trim()) {
      setHubunganFaktorialFB({ text: "Tulis jawabanmu dulu ya!", isCorrect: false });
      return;
    }
    setCheckingHubunganFaktorial(true);
    try {
      const soal = "Dari 3 huruf {A, D, I} disusun 2 huruf. Hubungkan hasilnya dengan faktorial: $\\frac{3!}{(3-2)!} = \\dots$. Jelaskan bagaimana kamu menghitungnya dan apa hasil akhirnya!";
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal, jawaban: hubunganFaktorial, alasan: "Menghitung nilai faktorial dan menghubungkannya dengan hasil penyusunan" }),
      });
      if (res.ok) {
        const data = await res.json();
        const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: data.isCorrect ?? false };
        setHubunganFaktorialFB(fb);
        // Save to DB
        try {
          const saveRes = await fetch("/api/aktivitas-deep-learning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              concept_id: "permutasi_r_unsur_dari_n_unsur",
              answer: { question_key: "adl1_hubungan_faktorial", jawaban: hubunganFaktorial },
              feedback: fb.text,
              is_correct: fb.isCorrect,
            }),
          });
          if (!saveRes.ok) console.error("[deep-learning-1-hubungan] DB save failed:", saveRes.status);
        } catch (err) {
          console.error("[deep-learning-1-hubungan] DB save error:", err);
        }
      } else {
        setHubunganFaktorialFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
      }
    } catch {
      setHubunganFaktorialFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
    } finally {
      setCheckingHubunganFaktorial(false);
    }
  }

  async function handleSaveKesimpulan() {
    if (!kesimpulan1.trim()) {
      setKesimpulanFB({ text: "Tulis jawabanmu dulu ya!", isCorrect: false });
      return;
    }
    setCheckingKesimpulan(true);
    try {
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: "Dari 3 huruf {A, D, I} disusun 2 huruf. Apakah hasil tabel, kaidah perkalian, dan faktorial menghasilkan jawaban yang sama? Mengapa?",
          jawaban: kesimpulan1,
          alasan: "Ketiga cara menghasilkan 6 susunan karena semuanya menghitung hal yang sama: banyaknya susunan 2 dari 3 objek berbeda dengan urutan diperhatikan.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: data.isCorrect ?? false };
        setKesimpulanFB(fb);
        if (fb.isCorrect) { setSavedKesimpulan(true); }
        // Save to DB
        try {
          const saveRes = await fetch("/api/aktivitas-deep-learning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              concept_id: "permutasi_r_unsur_dari_n_unsur",
              answer: { question_key: "adl1_kesimpulan", jawaban: kesimpulan1 },
              feedback: fb.text,
              is_correct: fb.isCorrect,
            }),
          });
          if (!saveRes.ok) console.error("[deep-learning-1-kesimpulan] DB save failed:", saveRes.status);
        } catch (err) {
          console.error("[deep-learning-1-kesimpulan] DB save error:", err);
        }
      } else {
        setKesimpulanFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
      }
    } catch {
      setKesimpulanFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
    } finally {
      setCheckingKesimpulan(false);
    }
  }

  // Generic AI handler for A3/A4
  async function handleAISave(
    soal: string, jawaban: string, alasan: string,
    setFB: (fb: { text: string; isCorrect: boolean } | null) => void,
    setSaved: (v: boolean) => void,
    setChecking: (v: boolean) => void,
    questionKey: string,
  ) {
    if (!jawaban.trim()) {
      setFB({ text: "Tulis jawabanmu dulu ya!", isCorrect: false });
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal, jawaban, alasan }),
      });
      if (res.ok) {
        const data = await res.json();
        const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: data.isCorrect ?? false };
        setFB(fb);
        if (fb.isCorrect) { setSaved(true); }
        // Save to DB
        try {
          const saveRes = await fetch("/api/aktivitas-deep-learning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              concept_id: "permutasi_r_unsur_dari_n_unsur",
              answer: { question_key: questionKey, jawaban, alasan },
              feedback: fb.text,
              is_correct: fb.isCorrect,
            }),
          });
          if (!saveRes.ok) console.error(`[deep-learning-1-${questionKey}] DB save failed:`, saveRes.status);
        } catch (err) {
          console.error(`[deep-learning-1-${questionKey}] DB save error:`, err);
        }
      } else {
        setFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
      }
    } catch {
      setFB({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
    } finally {
      setChecking(false);
    }
  }

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Urutan Itu Penting!
        </h3>

        {/* Aktivitas 1: Tabel ADI */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Dari 3 huruf {"{A, D, I}"}, buat semua susunan 2 huruf yang mungkin (tanpa pengulangan):
          </h4>

          {/* Tabel */}
          <SoalCard
            title="Lengkapi tabel berikut:"
            onSave={handleSaveA1Table}
            saved={a1TableAllCorrect}
          >
            {a1TableFeedback && !a1TableAllCorrect && (
              <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1TableFeedback}</p>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-[#34673926]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#B8E6BC]">
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan Ke-</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Huruf 1</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Huruf 2</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34673915]">
                  {[
                    { no: 1, h1: "A", h2: "D", susunan: "AD", ro: true },
                    { no: 2, h1: "A", h2: "I", susunan: "AI", ro: true },
                    { no: 3, h1: "D", h2: "A", susunan: "DA", ro: true },
                    { no: 4, h1: "D", h2: "I", susunan: "DI", ro: false, h2v: adiR4H2, h2s: setAdiR4H2, susv: adiR4Sus, suss: setAdiR4Sus },
                    { no: 5, h1: "I", h2: "A", susunan: "IA", ro: false, h1v: adiR5H1, h1s: setAdiR5H1, h2v: adiR5H2, h2s: setAdiR5H2, susv: adiR5Sus, suss: setAdiR5Sus },
                    { no: 6, h1: "I", h2: "D", susunan: "ID", ro: false, h1v: adiR6H1, h1s: setAdiR6H1, h2v: adiR6H2, h2s: setAdiR6H2, susv: adiR6Sus, suss: setAdiR6Sus },
                  ].map((row: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                        <td className="px-4 py-3 text-center font-medium text-[#346739]">{row.no}</td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.h1s ? (
                            <InputBlank value={row.h1v} onChange={row.h1s} disabled={a1TableAllCorrect} />
                          ) : (
                            row.h1
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.h2s ? (
                            <InputBlank value={row.h2v} onChange={row.h2s} disabled={a1TableAllCorrect} />
                          ) : (
                            row.h2
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.suss ? (
                            <InputBlank value={row.susv} onChange={row.suss} disabled={a1TableAllCorrect} />
                          ) : (
                            row.susunan
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </SoalCard>

          {deepStep >= 1 && (<>
          {/* Pertanyaan lanjutan — per soal */}

          <SoalCard title="Berapa total susunan?">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={totalSusunan} onChange={setTotalSusunan} grade={totalSusunanGrade} disabled={totalSusunanGrade === "correct"} />
              <CheckButton isCorrect={totalSusunanGrade === "correct"} onClick={() => setTotalSusunanGrade(checkAnswer(totalSusunan, "6"))} />
              {totalSusunanGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {totalSusunanGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <SoalCard title="Verifikasi dengan Kaidah Perkalian: 3 × ... = 6. Berapa angka yang tepat untuk mengisi titik-titik?">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={kaidahPerkalian} onChange={setKaidahPerkalian} grade={kaidahPerkalianGrade} disabled={kaidahPerkalianGrade === "correct"} className="w-14" />
              <CheckButton isCorrect={kaidahPerkalianGrade === "correct"} onClick={() => setKaidahPerkalianGrade(checkAnswer(kaidahPerkalian, "2"))} />
              {kaidahPerkalianGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {kaidahPerkalianGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <p className="text-sm text-[#2C2C2A] font-medium">Coba menggunakan representasi yang lain (kotak pengisian):</p>

          {/* Ilustrasi Kotak Pengisian */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap py-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#346739] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold bg-[#DBFFD5]/40">
                <span className="text-[#346739]">{kemungkinan1 === "" ? "?" : kemungkinan1}</span>
              </div>
              <span className="text-xs font-medium text-[#346739]">Huruf 1</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[#663362] pb-5">×</span>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#346739] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold bg-[#DBFFD5]/40">
                <span className="text-[#346739]">{kemungkinan2 === "" ? "?" : kemungkinan2}</span>
              </div>
              <span className="text-xs font-medium text-[#346739]">Huruf 2</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[#663362] pb-5">=</span>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold bg-[#346739]">
                <span className="text-white">
                  {kemungkinan1 !== "" && kemungkinan2 !== "" && !isNaN(Number(kemungkinan1)) && !isNaN(Number(kemungkinan2))
                    ? Number(kemungkinan1) * Number(kemungkinan2)
                    : "?"}
                </span>
              </div>
              <span className="text-xs font-medium text-[#346739]">Total Susunan</span>
            </div>
          </div>

          <SoalCard title="Ada berapa tempat atau kedudukan? Kedudukan apa saja? Sebutkan!">
            <div className="space-y-3">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-[#2C2C2A]">Jumlah:</span>
                <InputBlank value={kedudukan} onChange={setKedudukan} grade={kedudukanGrade} disabled={kedudukanGrade === "correct"} />
                <CheckButton isCorrect={kedudukanGrade === "correct"} onClick={() => setKedudukanGrade(checkAnswer(kedudukan, "2"))} />
                {kedudukanGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
                {kedudukanGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-[#2C2C2A]">Sebutkan:</span>
                <InputBlank
                  value={namaKedudukan}
                  onChange={setNamaKedudukan}
                  grade={namaKedudukanGrade}
                  disabled={namaKedudukanGrade === "correct"}
                  maxWidth="320px"
                  className="min-w-[180px]"
                />
                <CheckButton
                  isCorrect={namaKedudukanGrade === "correct"}
                  onClick={() =>
                    setNamaKedudukanGrade(
                      checkAnswerMulti(namaKedudukan, [
                        "huruf 1 dan huruf 2",
                        "huruf 1, huruf 2",
                        "1 dan 2",
                      ]),
                    )
                  }
                />
                {namaKedudukanGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
                {namaKedudukanGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
              </div>
            </div>
          </SoalCard>

          <SoalCard title="Berarti kamu butuh berapa kotak pengisian?">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={jumlahKotak} onChange={setJumlahKotak} grade={jumlahKotakGrade} disabled={jumlahKotakGrade === "correct"} />
              <CheckButton isCorrect={jumlahKotakGrade === "correct"} onClick={() => setJumlahKotakGrade(checkAnswer(jumlahKotak, "2"))} />
              {jumlahKotakGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {jumlahKotakGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <SoalCard title="Huruf 1 berapa kemungkinan yang bisa menduduki?">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={kemungkinan1} onChange={setKemungkinan1} grade={kemungkinan1Grade} disabled={kemungkinan1Grade === "correct"} />
              <CheckButton isCorrect={kemungkinan1Grade === "correct"} onClick={() => setKemungkinan1Grade(checkAnswer(kemungkinan1, "3"))} />
              {kemungkinan1Grade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {kemungkinan1Grade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <SoalCard title="Huruf 2 berapa kemungkinan yang bisa menduduki?">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={kemungkinan2} onChange={setKemungkinan2} grade={kemungkinan2Grade} disabled={kemungkinan2Grade === "correct"} />
              <CheckButton isCorrect={kemungkinan2Grade === "correct"} onClick={() => setKemungkinan2Grade(checkAnswer(kemungkinan2, "2"))} />
              {kemungkinan2Grade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {kemungkinan2Grade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <SoalCard
            title="Berikan alasannya!"
          >
            <AnswerTextArea value={alasanHuruf2} onChange={setAlasanHuruf2} rows={2} disabled={alasanFB?.isCorrect === true} />

            {alasanFB && (
              <div className={`mt-3 rounded-lg border p-3 ${alasanFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${alasanFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {alasanFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{alasanFB.text}</RichText>
              </div>
            )}

            {alasanFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={handleSaveAlasan}
                  disabled={checkingAlasan}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingAlasan ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>

          <SoalCard title="Jadi total susunan huruf yang bisa dibuat adalah sebanyak ... cara.">
            <div className="flex items-center flex-wrap gap-2">
              <InputBlank value={totalCara} onChange={setTotalCara} grade={totalCaraGrade} disabled={totalCaraGrade === "correct"} />
              <CheckButton isCorrect={totalCaraGrade === "correct"} onClick={() => setTotalCaraGrade(checkAnswer(totalCara, "6"))} />
              {totalCaraGrade === "correct" && <span className="text-xs text-[#346739] font-medium">✅ Benar!</span>}
              {totalCaraGrade === "incorrect" && <span className="text-xs text-[#C44F4F] font-medium">❌ Coba lagi</span>}
            </div>
          </SoalCard>

          <SoalCard title={<>Hubungkan dengan faktorial: <RichText>{"$\\frac{3!}{(3-2)!} = $ "}</RichText></>}>
            <AnswerTextArea value={hubunganFaktorial} onChange={setHubunganFaktorial} rows={2} disabled={hubunganFaktorialFB?.isCorrect === true} />

            {hubunganFaktorialFB && (
              <div className={`mt-3 rounded-lg border p-3 ${hubunganFaktorialFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${hubunganFaktorialFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {hubunganFaktorialFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{hubunganFaktorialFB.text}</RichText>
              </div>
            )}

            {hubunganFaktorialFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={handleSaveHubunganFaktorial}
                  disabled={checkingHubunganFaktorial}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingHubunganFaktorial ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>

          <SoalCard
            title="Apakah ketiga cara di atas menghasilkan jawaban yang sama? Mengapa?"
          >
            <AnswerTextArea value={kesimpulan1} onChange={setKesimpulan1} rows={2} disabled={kesimpulanFB?.isCorrect === true} />

            {kesimpulanFB && (
              <div className={`mt-3 rounded-lg border p-3 ${kesimpulanFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${kesimpulanFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {kesimpulanFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{kesimpulanFB.text}</RichText>
              </div>
            )}

            {kesimpulanFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={handleSaveKesimpulan}
                  disabled={checkingKesimpulan}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingKesimpulan ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>
        </>)}  {/* end deepStep >= 1 */}
        </div>

        {/* Aktivitas 2: Nalar - Temukan Pola */}
        {deepStep >= 2 && (<>
        <SoalCard
          number="Aktivitas 2 — Nalar"
          title="Temukan Polanya: Lengkapi tabel berikut menggunakan cara yang sama:"
          onSave={handleSaveA2Table}
          saved={a2TableAllCorrect}
        >
          {a2TableFeedback && !a2TableAllCorrect && (
            <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
              <p className="text-xs font-medium text-[#C44F4F]">❌ {a2TableFeedback}</p>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">r</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Cara (Kaidah Perkalian)</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Dalam bentuk faktorial</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { n: 4, r: 2, cara: "4×3", fak: "4!/2!", val: "12", ro: true },
                  { n: 5, r: 2, cara: "5×4", fak: "5!/3!", val: "20", ro: true },
                  { n: 5, r: 3, cara: "5×4×3", fak: null, val: null, ro: false },
                  { n: 6, r: 2, cara: null, fak: null, val: null, ro: false },
                  { n: 6, r: 3, cara: null, fak: null, val: null, ro: false },
                  { n: "n", r: "r", cara: null, fak: null, val: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-center font-semibold text-[#346739]">{row.n}</td>
                    <td className="px-4 py-3 text-center text-[#2C2C2A]">{row.r}</td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.cara}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3 : i === 3 ? pola6_2 : i === 4 ? pola6_3 : pola_n_r}
                          onChange={(e) => {
                            if (i === 2) setPola5_3(e.target.value);
                            else if (i === 3) setPola6_2(e.target.value);
                            else if (i === 4) setPola6_3(e.target.value);
                            else setPola_n_r(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2TableAllCorrect}
                          className="w-28 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.fak}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3_fak : i === 3 ? pola6_2_denom : i === 4 ? pola6_3_fak : pola_n_r_fak}
                          onChange={(e) => {
                            if (i === 2) setPola5_3_fak(e.target.value);
                            else if (i === 3) setPola6_2_denom(e.target.value);
                            else if (i === 4) setPola6_3_fak(e.target.value);
                            else setPola_n_r_fak(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2TableAllCorrect}
                          className="w-28 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.val}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3_val : i === 3 ? pola6_2_val : i === 4 ? pola6_3_val : pola_n_r_val}
                          onChange={(e) => {
                            if (i === 2) setPola5_3_val(e.target.value);
                            else if (i === 3) setPola6_2_val(e.target.value);
                            else if (i === 4) setPola6_3_val(e.target.value);
                            else setPola_n_r_val(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2TableAllCorrect}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari baris terakhir, tuliskan rumus umum yang kamu temukan:
          </p>
          <p className="text-sm text-[#2C2C2A] mt-1">
            P(n,r) ={" "}
            <input
              type="text"
              value={rumusUmum}
              onChange={(e) => setRumusUmum(e.target.value)}
              placeholder="..."
              disabled={a2TableAllCorrect}
              className="inline-block rounded-md border-2 border-[#34673933] bg-white px-3 py-1 text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
              style={{ minWidth: "160px" }}
            />
          </p>
        </SoalCard>
        </>)}  {/* end deepStep >= 2 */}

        {/* Aktivitas 3: Diskusikan */}
        {deepStep >= 3 && (<>
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">Aktivitas 3 — Diskusikan: Uji Pemahamanmu (diskusi dengan teman sebangku)</h4>

          <SoalCard
            title="(a) Mengapa penyebut rumusmu adalah (n-r)! dan bukan r!?"
          >
            <AnswerTextArea value={diskusiA} onChange={setDiskusiA} rows={3} disabled={a3aFB?.isCorrect === true} />
            {a3aFB && (
              <div className={`mt-3 rounded-lg border p-3 ${a3aFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${a3aFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {a3aFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{a3aFB.text}</RichText>
              </div>
            )}
            {a3aFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleAISave(
                    "Mengapa penyebut rumus permutasi P(n,r)=n!/(n-r)! adalah (n-r)! dan bukan r!? Jelaskan alasanmu.",
                    diskusiA,
                    "Karena (n-r)! menghilangkan urutan objek yang tidak terpilih, bukan objek yang terpilih.",
                    setA3aFB, () => {}, setCheckingA3a, "adl1_a3a"
                  )}
                  disabled={checkingA3a}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingA3a ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>

          {diskusiStep >= 1 && (
          <SoalCard
            title="(b) Apa yang terjadi jika r=n? Berapa nilai P(n,n)? Mengapa hasilnya n!?"
          >
            <AnswerTextArea value={diskusiB} onChange={setDiskusiB} rows={3} disabled={a3bFB?.isCorrect === true} />
            {a3bFB && (
              <div className={`mt-3 rounded-lg border p-3 ${a3bFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${a3bFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {a3bFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{a3bFB.text}</RichText>
              </div>
            )}
            {a3bFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleAISave(
                    "Apa yang terjadi jika r=n pada permutasi P(n,r)? Berapa nilai P(n,n)? Mengapa hasilnya n!?",
                    diskusiB,
                    "Jika r=n, penyebut (n-n)!=0!=1, sehingga P(n,n)=n!/1=n!",
                    setA3bFB, () => {}, setCheckingA3b, "adl1_a3b"
                  )}
                  disabled={checkingA3b}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingA3b ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>
          )}

          {diskusiStep >= 2 && (
          <SoalCard
            title="(c) Kembali ke soal podium awal — 8 pelari, 3 posisi. Hitung dengan rumus yang kamu temukan!"
          >
            <AnswerTextArea value={podiumCalc} onChange={setPodiumCalc} rows={3} disabled={a3cFB?.isCorrect === true} />
            {a3cFB && (
              <div className={`mt-3 rounded-lg border p-3 ${a3cFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${a3cFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {a3cFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{a3cFB.text}</RichText>
              </div>
            )}
            {a3cFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleAISave(
                    "Kembali ke soal podium awal — 8 pelari, 3 posisi. Hitung dengan rumus permutasi P(8,3).",
                    podiumCalc,
                    "P(8,3)=8!/(8-3)!=8!/5!=8×7×6=336",
                    setA3cFB, () => {}, setCheckingA3c, "adl1_a3c"
                  )}
                  disabled={checkingA3c}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingA3c ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>
          )}
        </div>

        {/* Aktivitas 4: Simpulkan */}
        {aktivitas4Visible && (<>
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">Aktivitas 4 — Simpulkan: Tuliskan dengan kalimatmu sendiri</h4>

          <SoalCard
            title='"Permutasi P(n,r) digunakan ketika..."'
          >
            <AnswerTextArea value={simpulan1} onChange={setSimpulan1} rows={3} disabled={a4aFB?.isCorrect === true} />
            {a4aFB && (
              <div className={`mt-3 rounded-lg border p-3 ${a4aFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${a4aFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {a4aFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{a4aFB.text}</RichText>
              </div>
            )}
            {a4aFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleAISave(
                    "Tuliskan dengan kalimatmu sendiri: Permutasi P(n,r) digunakan ketika...",
                    simpulan1,
                    "Permutasi digunakan ketika kita menyusun r objek dari n objek dengan urutan yang diperhatikan.",
                    setA4aFB, () => {}, setCheckingA4a, "adl1_a4a"
                  )}
                  disabled={checkingA4a}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingA4a ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>

          {simpulanStep >= 1 && (
          <SoalCard
            title='"Rumus P(n,r)=n!/(n-r)! terbentuk karena..."'
          >
            <AnswerTextArea value={simpulan2} onChange={setSimpulan2} rows={3} disabled={a4bFB?.isCorrect === true} />
            {a4bFB && (
              <div className={`mt-3 rounded-lg border p-3 ${a4bFB.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                <p className={`mb-1 text-xs font-medium ${a4bFB.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                  {a4bFB.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                </p>
                <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{a4bFB.text}</RichText>
              </div>
            )}
            {a4bFB?.isCorrect !== true && (
              <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                <button
                  type="button"
                  onClick={() => handleAISave(
                    "Tuliskan dengan kalimatmu sendiri: Rumus P(n,r)=n!/(n-r)! terbentuk karena...",
                    simpulan2,
                    "Rumus ini terbentuk dari kaidah perkalian: ada n pilihan untuk posisi 1, (n-1) untuk posisi 2, ..., hingga (n-r+1) untuk posisi ke-r.",
                    setA4bFB, () => {}, setCheckingA4b, "adl1_a4b"
                  )}
                  disabled={checkingA4b}
                  className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                >
                  {checkingA4b ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                </button>
              </div>
            )}
          </SoalCard>
          )}
        </div>
        </>)}  {/* end aktivitas4Visible */}
        </>)}  {/* end deepStep >= 3 */}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 1C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep1({ onNext }: { onNext?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student-section-status/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_r_unsur_dari_n_unsur",
          section: "penjelasan_konsep",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[penjelasan-konsep-1] Complete failed:", res.status, data?.error);
      }
    } catch (err) {
      console.error("[penjelasan-konsep-1] Complete error:", err);
    } finally {
      setLoading(false);
      if (onNext) onNext();
    }
  };

  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          <b>Definisi</b>: Permutasi adalah susunan objek-objek yang diambil dari sekelompok objek
          dengan <b>memperhatikan urutan</b>.
        </p>

        <div className="mb-4 rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>
            {"$P(n,r) = \\frac{n!}{(n-r)!} = n \\times (n-1) \\times (n-2) \\times \\dots \\times (n-r+1)$"}
          </RichText>
        </div>

        <div className="space-y-2 text-sm leading-relaxed text-[#2C2C2A]">
          <p><b>Di mana</b>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>n</b> = banyak objek yang tersedia</li>
            <li><b>r</b> = banyak objek yang diambil/disusun</li>
            <li>r ≤ n</li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-3">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">🤔 Apa yang terjadi jika r &gt; n?</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Coba jelaskan pendapatmu! Tidak mungkin mengambil lebih banyak objek daripada yang tersedia.
          </p>
        </div>

        <div className="mt-5">
          <h4 className="mb-2 text-base font-semibold text-[#346739]">💡 Intuisi Rumus</h4>
          <div className="space-y-1 text-sm leading-relaxed text-[#2C2C2A]">
            <p>Posisi ke-1: ada <b>n</b> pilihan</p>
            <p>Posisi ke-2: ada <b>(n – 1)</b> pilihan</p>
            <p>⋮</p>
            <p>Posisi ke-r: ada <b>n – r + 1</b> pilihan</p>
          </div>
          <div className="mt-3 rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
            <RichText>
              {"$\\text{Total} = n(n-1)(n-2)\\dots(n-r+1) = \\frac{n!}{(n-r)!}$"}
            </RichText>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[#66336226] bg-[#66336208] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">⭐ Kasus Khusus</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            <b>Permutasi Semua Objek:</b> P(n,n) = n!
          </p>
          <p className="mt-1 text-sm text-[#6B6B66]">
            Karena semua objek diambil dan disusun, sehingga (n-n)! = 0! = 1 pada penyebut.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />

      {onNext && <NextButton onClick={handleNext} loading={loading} />}
    </article>
  );
}

// ============================================================================
// PART 2: PERMUTASI DENGAN UNSUR YANG SAMA
// ============================================================================

// ── 2A. Eksplorasi Kontekstual (AI Feedback) ───────────────────────

function EksplorasiKontekstual2({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  const [siapaBenar, setSiapaBenar] = useState("");
  const [alasan, setAlasan] = useState("");
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const eksplorasiData = savedData.eksplorasi as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!eksplorasiData) return;

    const entry = eksplorasiData["siapa_benar_ada"];
    if (entry?.answer) {
      const ans = entry.answer as Record<string, unknown>;
      setSiapaBenar(String(ans.jawaban ?? ""));
      setAlasan(String(ans.alasan ?? ""));
      setFeedback({ text: entry.feedback ?? "Jawaban tersimpan.", isCorrect: entry.isCorrect ?? false });
      setSaved(true);
      if (entry.isCorrect === true) {
        onCompleteCalled.current = true;
      }
    }
    didSyncSavedData.current = true;
  }, [savedData]);

  // Notify parent when saved with correct answer
  useEffect(() => {
    if (saved && feedback?.isCorrect === true && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [saved, feedback, onComplete]);

  async function handleSave() {
    if (!siapaBenar.trim() || !alasan.trim()) {
      setFeedback({ text: "Jawab siapa yang benar dan jelaskan alasanmu dulu ya!", isCorrect: false });
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: "Dari kata ADA, Abdi berkata ada 3! = 6 susunan. Gian berkata ada dua huruf A yang sama sehingga susunan A₁A₂D dan A₂A₁D tidak berbeda. Menurutmu siapa yang benar? Mengapa?",
          jawaban: siapaBenar,
          alasan,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const fb = { text: data.feedback ?? "Jawaban tersimpan.", isCorrect: data.isCorrect ?? false };
        setFeedback(fb);
        if (fb.isCorrect) { setSaved(true); }
        // Save to DB
        fetch("/api/eksplorasi-kontekstual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept_id: "permutasi_dengan_unsur_sama",
            question_key: "siapa_benar_ada",
            answer: { soal: "Abdi vs Gian — kata ADA", jawaban: siapaBenar, alasan },
            feedback: fb.text,
            is_correct: fb.isCorrect,
          }),
        }).catch((err) => console.error("[eksplorasi-kontekstual] DB save error:", err));
      } else {
        setFeedback({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
      }
    } catch {
      setFeedback({ text: "Maaf, ada kendala. Coba lagi ya!", isCorrect: false });
    } finally {
      setChecking(false);
    }
  }

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata: Password Wifi</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Abdi dan Gian ingin menggunakan wifi sekolah untuk mengerjakan tugas. Admin sekolah hanya
          memberitahu kalau password wifi sekolah berasal dari kata <b>"ADA"</b> yang hurufnya
          di bolak-balik dan belakangnya ditambahi pagar (#). Mereka berdua ingin tahu berapa
          banyak percobaan memasukkan password sehingga mereka dapat menggunakan wifi tersebut.
        </p>

        {/* Interactive password simulation */}
        <div className="mb-5">
          <PasswordWifiSimulation />
        </div>

        <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-4">
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Abdi berkata: <i>"Gampang itu, hurufnya kan ada 3 berarti <b>3! = 6 kali percobaan</b>."</i>
          </p>
          <p className="text-sm leading-relaxed text-[#2C2C2A] mt-1">
            Gian menyela: <i>"Tunggu dulu, ada dua huruf A yang sama lho. <b>Apakah susunan A₁A₂D dan A₂A₁D benar-benar berbeda?</b>"</i>
          </p>
        </div>

        <SoalCard
          title="Menurutmu siapa yang benar? Mengapa?"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Siapa yang benar?</p>
              <input
                type="text"
                value={siapaBenar}
                onChange={(e) => setSiapaBenar(e.target.value)}
                placeholder="Abdi / Gian / ..."
                disabled={feedback?.isCorrect === true}
                className="w-full rounded-xl border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66]"
              />
            </div>
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Jelaskan alasanmu!</p>
              <AnswerTextArea value={alasan} onChange={setAlasan} rows={3} disabled={feedback?.isCorrect === true} />
            </div>
          </div>

          {feedback && (
            <div className={`mt-3 rounded-lg border p-3 ${feedback.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
              <p className={`mb-1 text-xs font-medium ${feedback.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                {feedback.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
              </p>
              <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{feedback.text}</RichText>
            </div>
          )}

          {feedback?.isCorrect !== true && (
            <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={checking}
                className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
              >
                {checking ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
              </button>
            </div>
          )}
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 2B. Aktivitas Deep Learning ────────────────────────────────────

function AktivitasDeepLearning2({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  // Aktivitas 1: Visualisasi ADA
  const [adaR4Tanpa, setAdaR4Tanpa] = useState("");
  const [adaR6Tanpa, setAdaR6Tanpa] = useState("");
  const [a1TableAllCorrect, setA1TableAllCorrect] = useState(false);
  const [a1TableFB, setA1TableFB] = useState("");
  const [totalBerbeda, setTotalBerbeda] = useState("");
  const [munculKali, setMunculKali] = useState("");
  const [faktorialSama, setFaktorialSama] = useState("");
  const [a1L2AllCorrect, setA1L2AllCorrect] = useState(false);
  const [a1L2FB, setA1L2FB] = useState("");
  const [susunanBerbedaHitung, setSusunanBerbedaHitung] = useState("");
  const [cocokManual, setCocokManual] = useState<boolean | null>(null);
  const [a1L3AllCorrect, setA1L3AllCorrect] = useState(false);
  const [a1L3FB, setA1L3FB] = useState("");

  // Aktivitas 2: Nalar tabel
  const [nalar1, setNalar1] = useState("");
  const [nalar2_rumus, setNalar2_rumus] = useState("");
  const [nalar2_val, setNalar2_val] = useState("");
  const [nalar3_rumus, setNalar3_rumus] = useState("");
  const [nalar3_val, setNalar3_val] = useState("");
  const [pilihanHuruf, setPilihanHuruf] = useState("");
  const [pilihanN, setPilihanN] = useState("");
  const [pilihanUlang, setPilihanUlang] = useState("");
  const [pilihanRumus, setPilihanRumus] = useState("");
  const [pilihanVal, setPilihanVal] = useState("");
  const [rumusSama, setRumusSama] = useState("");
  const [a2AllCorrect, setA2AllCorrect] = useState(false);
  const [a2FB, setA2FB] = useState("");

  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const dl = savedData.deepLearning as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!dl) return;

    const setStr = (a: Record<string, unknown> | undefined, key: string, setter: (v: string) => void) => {
      if (a && typeof a[key] === "string") setter(a[key] as string);
    };

    // A1 Table
    const a1 = dl["a1_table"];
    if (a1?.answer) {
      const a = a1.answer as Record<string, unknown>;
      setStr(a, "adaR4Tanpa", setAdaR4Tanpa);
      setStr(a, "adaR6Tanpa", setAdaR6Tanpa);
      if (a1.isCorrect === true) setA1TableAllCorrect(true);
    }
    // A1 Langkah 2
    const a1l2 = dl["a1_langkah2"];
    if (a1l2?.answer) {
      const a = a1l2.answer as Record<string, unknown>;
      setStr(a, "totalBerbeda", setTotalBerbeda);
      setStr(a, "munculKali", setMunculKali);
      setStr(a, "faktorialSama", setFaktorialSama);
      if (a1l2.isCorrect === true) setA1L2AllCorrect(true);
    }
    // A1 Langkah 3
    const a1l3 = dl["a1_langkah3"];
    if (a1l3?.answer) {
      const a = a1l3.answer as Record<string, unknown>;
      setStr(a, "susunanBerbedaHitung", setSusunanBerbedaHitung);
      if (typeof a.cocokManual === "boolean") setCocokManual(a.cocokManual);
      if (a1l3.isCorrect === true) setA1L3AllCorrect(true);
    }
    // A2 Nalar
    const a2 = dl["a2_nalar"];
    if (a2?.answer) {
      const a = a2.answer as Record<string, unknown>;
      setStr(a, "nalar1", setNalar1);
      setStr(a, "nalar2_rumus", setNalar2_rumus);
      setStr(a, "nalar2_val", setNalar2_val);
      setStr(a, "nalar3_rumus", setNalar3_rumus);
      setStr(a, "nalar3_val", setNalar3_val);
      setStr(a, "pilihanHuruf", setPilihanHuruf);
      setStr(a, "pilihanN", setPilihanN);
      setStr(a, "pilihanUlang", setPilihanUlang);
      setStr(a, "pilihanRumus", setPilihanRumus);
      setStr(a, "pilihanVal", setPilihanVal);
      setStr(a, "rumusSama", setRumusSama);
      if (a2.isCorrect === true) setA2AllCorrect(true);
    }

    didSyncSavedData.current = true;
  }, [savedData]);

  // ── Sequential step tracking ────────────────────────────────────
  const [deepStep, setDeepStep] = useState(0);

  // Step 0 → 1: A1 Table selesai
  useEffect(() => { if (a1TableAllCorrect && deepStep === 0) setDeepStep(1); }, [a1TableAllCorrect, deepStep]);
  // Step 1 → 2: A1 Langkah 2 selesai
  useEffect(() => { if (a1L2AllCorrect && deepStep === 1) setDeepStep(2); }, [a1L2AllCorrect, deepStep]);
  // Step 2 → 3: A1 Langkah 3 selesai
  useEffect(() => { if (a1L3AllCorrect && deepStep === 2) setDeepStep(3); }, [a1L3AllCorrect, deepStep]);

  // Notify parent when all sub-activities are complete
  useEffect(() => {
    const allDone = a1TableAllCorrect && a1L2AllCorrect && a1L3AllCorrect && a2AllCorrect;
    if (allDone && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [a1TableAllCorrect, a1L2AllCorrect, a1L3AllCorrect, a2AllCorrect, onComplete]);

  // ── Rule Based: Check A1 ADA Table ──────────────────────────────
  function checkA1Table() {
    const n4 = normalizeAnswer(adaR4Tanpa);
    const n6 = normalizeAnswer(adaR6Tanpa);
    const errors: string[] = [];
    if (!n4) errors.push("Baris 4 belum diisi");
    else if (n4 !== "ada") errors.push("Baris 4 kurang tepat (harus ADA)");
    if (!n6) errors.push("Baris 6 belum diisi");
    else if (n6 !== "daa") errors.push("Baris 6 kurang tepat (harus DAA)");
    return errors;
  }

  async function handleSaveA1Table() {
    const errors = checkA1Table();
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setA1TableFB(errors.join(". ") + ". Perbaiki ya!"); setA1TableAllCorrect(false); }
    else { setA1TableFB(""); setA1TableAllCorrect(true); }
    // Save EVERY attempt
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_dengan_unsur_sama",
          answer: { activity: "a1_table", adaR4Tanpa, adaR6Tanpa },
          feedback: isCorrect ? "Tabel ADA benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-2-a1] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-2-a1] DB save error:", err);
    }
  }

  // ── Rule Based: Check A1 Langkah 2 ─────────────────────────────
  function checkA1Langkah2() {
    const errors: string[] = [];
    if (normalizeAnswer(totalBerbeda) !== "3") errors.push("Total susunan berbeda harus 3");
    if (normalizeAnswer(munculKali) !== "2") errors.push("Setiap susunan unik muncul 2 kali");
    if (normalizeAnswer(faktorialSama) !== "2") errors.push("Angka itu sama dengan 2! (faktorial dari 2 huruf A)");
    return errors;
  }

  async function handleSaveA1Langkah2() {
    const errors = checkA1Langkah2();
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setA1L2FB(errors.join(". ") + ". Perbaiki ya!"); setA1L2AllCorrect(false); }
    else { setA1L2FB(""); setA1L2AllCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_dengan_unsur_sama",
          answer: { activity: "a1_langkah2", totalBerbeda, munculKali, faktorialSama },
          feedback: isCorrect ? "Langkah 2 benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-2-a1l2] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-2-a1l2] DB save error:", err);
    }
  }

  // ── Rule Based: Check A1 Langkah 3 ─────────────────────────────
  function checkA1Langkah3() {
    const errors: string[] = [];
    if (normalizeAnswer(susunanBerbedaHitung) !== "3") errors.push("Susunan berbeda = 3");
    if (cocokManual !== true) errors.push("Pilih apakah cocok atau tidak");
    return errors;
  }

  async function handleSaveA1Langkah3() {
    const errors = checkA1Langkah3();
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setA1L3FB(errors.join(". ") + ". Perbaiki ya!"); setA1L3AllCorrect(false); }
    else { setA1L3FB(""); setA1L3AllCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_dengan_unsur_sama",
          answer: { activity: "a1_langkah3", susunanBerbedaHitung, cocokManual },
          feedback: isCorrect ? "Langkah 3 benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-2-a1l3] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-2-a1l3] DB save error:", err);
    }
  }

  // ── Rule Based: Check A2 Nalar Table ───────────────────────────
  function checkA2Table() {
    const errors: string[] = [];
    const checks: [string, string, string][] = [
      [normalizeAnswer(nalar1), "4", "A,A,A,B hasil"],
      [normalizeAnswer(nalar2_rumus), "4!/2!", "M,A,T,A rumus"],
      [normalizeAnswer(nalar2_val), "12", "M,A,T,A hasil"],
      [normalizeAnswer(nalar3_rumus), "5!/2!", "B,E,B,A,S rumus"],
      [normalizeAnswer(nalar3_val), "60", "B,E,B,A,S hasil"],
    ];
    for (const [got, exp, label] of checks) {
      if (!got) errors.push(`${label} belum diisi`);
      else if (got !== exp) errors.push(`${label} kurang tepat`);
    }
    if (!rumusSama.trim()) errors.push("Rumus umum belum diisi");
    return errors;
  }

  async function handleSaveA2() {
    const errors = checkA2Table();
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setA2FB(errors.join(". ") + ". Perbaiki ya!"); setA2AllCorrect(false); }
    else { setA2FB(""); setA2AllCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_dengan_unsur_sama",
          answer: {
            activity: "a2_nalar",
            nalar1, nalar2_rumus, nalar2_val, nalar3_rumus, nalar3_val,
            pilihanHuruf, pilihanN, pilihanUlang, pilihanRumus, pilihanVal,
            rumusSama,
          },
          feedback: isCorrect ? "Tabel Nalar benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-2-a2] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-2-a2] DB save error:", err);
    }
  }

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Permutasi dengan Unsur yang Sama
        </h3>

        {/* Aktivitas 1: Amati */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Amati: Dari kata "ADA", berapa susunan kata yang bisa dibentuk? (dua huruf A identik)
          </h4>

          {/* Tabel ADA */}
          <SoalCard
            title="Langkah 1: Beri label dulu — anggap dua A berbeda: A₁ dan A₂."
            onSave={handleSaveA1Table}
            saved={a1TableAllCorrect}
          >
            {a1TableFB && !a1TableAllCorrect && (
              <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1TableFB}</p>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-[#34673926]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#B8E6BC]">
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan (dengan label)</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan (tanpa label)</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34673915]">
                  {[
                    { label: "A₁A₂D", tanpa: "ADA", ket: "—", ro: true },
                    { label: "A₂A₁D", tanpa: "ADA", ket: "Sama dengan baris 1", ro: true },
                    { label: "A₁DA₂", tanpa: "ADA", ket: "—", ro: true },
                    { label: "A₂DA₁", tanpa: null, ket: "Sama dengan baris 3", ro: false, val: adaR4Tanpa, set: setAdaR4Tanpa },
                    { label: "DA₁A₂", tanpa: "DAA", ket: "—", ro: true },
                    { label: "DA₂A₁", tanpa: null, ket: "Sama dengan baris 5", ro: false, val: adaR6Tanpa, set: setAdaR6Tanpa },
                  ].map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                      <td className="px-4 py-3 text-center font-mono text-[#663362]">{row.label}</td>
                      <td className="px-4 py-3 text-center">
                        {row.ro ? (
                          <span className="font-semibold text-[#2C2C2A]">{row.tanpa}</span>
                        ) : (
                          <InputBlank value={row.val} onChange={row.set} disabled={a1TableAllCorrect} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#6B6B66]">{row.ket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SoalCard>

          {/* Langkah 2: Analisis */}
          <div style={{ display: deepStep >= 1 ? undefined : "none" }}>
          <SoalCard
            title="Langkah 2: Analisis"
            onSave={handleSaveA1Langkah2}
            saved={a1L2AllCorrect}
          >
            {a1L2FB && !a1L2AllCorrect && (
              <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1L2FB}</p>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-sm text-[#2C2C2A]">
                Tanpa label, berapa susunan yang <b>benar-benar berbeda</b>?{" "}
                <InputBlank value={totalBerbeda} onChange={setTotalBerbeda} disabled={a1L2AllCorrect} />
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Dari 3! = 6 susunan, setiap susunan unik muncul sebanyak{" "}
                <InputBlank value={munculKali} onChange={setMunculKali} disabled={a1L2AllCorrect} />
                {" "}kali.
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Angka itu sama dengan{" "}
                <InputBlank value={faktorialSama} onChange={setFaktorialSama} disabled={a1L2AllCorrect} />
                {" "}! (faktorial dari banyaknya huruf yang sama)
              </p>
            </div>
          </SoalCard>
          </div>

          {/* Langkah 3: Hitung */}
          <div style={{ display: deepStep >= 2 ? undefined : "none" }}>
          <SoalCard
            title="Langkah 3: Hitung"
            onSave={handleSaveA1Langkah3}
            saved={a1L3AllCorrect}
          >
            {a1L3FB && !a1L3AllCorrect && (
              <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1L3FB}</p>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-sm text-[#2C2C2A]">
                Susunan berbeda = 3!/2! = 6/2 ={" "}
                <InputBlank value={susunanBerbedaHitung} onChange={setSusunanBerbedaHitung} disabled={a1L3AllCorrect} />
              </p>
              <div>
                <p className="text-sm text-[#2C2C2A] mb-2">Cocok dengan daftar manual?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={a1L3AllCorrect}
                    onClick={() => setCocokManual(true)}
                    className={`rounded-full border-2 px-5 py-2 text-sm font-medium transition-colors ${
                      cocokManual === true
                        ? "border-[#346739] bg-[#DBFFD5] text-[#346739]"
                        : "border-[#34673933] bg-white text-[#2C2C2A] hover:border-[#346739]"
                    } disabled:opacity-50 disabled:cursor-default`}
                  >
                    ✅ Ya, cocok
                  </button>
                  <button
                    type="button"
                    disabled={a1L3AllCorrect}
                    onClick={() => setCocokManual(false)}
                    className={`rounded-full border-2 px-5 py-2 text-sm font-medium transition-colors ${
                      cocokManual === false
                        ? "border-[#C44F4F] bg-[#C44F4F]/10 text-[#C44F4F]"
                        : "border-[#34673933] bg-white text-[#2C2C2A] hover:border-[#C44F4F]"
                    } disabled:opacity-50 disabled:cursor-default`}
                  >
                    ❌ Tidak cocok
                  </button>
                </div>
              </div>
            </div>
          </SoalCard>
          </div>
        </div>

        {/* Aktivitas 2: Nalar */}
        <div style={{ display: deepStep >= 3 ? undefined : "none" }}>
        <SoalCard
          number="Aktivitas 2 — Nalar"
          title="Temukan Pola: Perluasan pola — lengkapi tabel:"
          onSave={handleSaveA2}
          saved={a2AllCorrect}
        >
          {a2FB && !a2AllCorrect && (
            <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
              <p className="text-xs font-medium text-[#C44F4F]">❌ {a2FB}</p>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-left font-semibold text-white">Huruf</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Huruf berulang</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Rumus</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { huruf: "A, A, B", n: 3, ulang: "A=2", rumus: "3!/2!", hasil: "3", ro: true },
                  { huruf: "A, A, B, B", n: 4, ulang: "A=2, B=2", rumus: "4!/(2!·2!)", hasil: "6", ro: true },
                  { huruf: "A, A, A, B", n: 4, ulang: "A=3", rumus: "4!/3!", hasil: null, ro: false },
                  { huruf: "M, A, T, A", n: 4, ulang: "A=2", rumus: null, hasil: null, ro: false },
                  { huruf: "B, E, B, A, S", n: 5, ulang: "B=2", rumus: null, hasil: null, ro: false },
                  { huruf: null, n: null, ulang: null, rumus: null, hasil: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-[#2C2C2A]">
                      {row.huruf ?? (
                        <input
                          type="text"
                          value={pilihanHuruf}
                          onChange={(e) => setPilihanHuruf(e.target.value)}
                          placeholder="Huruf pilihanmu..."
                          disabled={a2AllCorrect}
                          className="w-32 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-[#2C2C2A]">
                      {row.n ?? (
                        <InputBlank value={pilihanN} onChange={setPilihanN} disabled={a2AllCorrect} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#2C2C2A]">
                      {row.ulang ?? (i === 5 ? (
                        <input
                          type="text"
                          value={pilihanUlang}
                          onChange={(e) => setPilihanUlang(e.target.value)}
                          placeholder="cth: A=2, B=1"
                          disabled={a2AllCorrect}
                          className="w-36 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      ) : null)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.rumus != null ? (
                        <span className="font-mono text-[#2C2C2A]">{row.rumus}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 3 ? nalar2_rumus : i === 4 ? nalar3_rumus : i === 5 ? pilihanRumus : ""}
                          onChange={(e) => {
                            if (i === 3) setNalar2_rumus(e.target.value);
                            else if (i === 4) setNalar3_rumus(e.target.value);
                            else if (i === 5) setPilihanRumus(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2AllCorrect}
                          className="w-32 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.hasil}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? nalar1 : i === 3 ? nalar2_val : i === 4 ? nalar3_val : i === 5 ? pilihanVal : ""}
                          onChange={(e) => {
                            if (i === 2) setNalar1(e.target.value);
                            else if (i === 3) setNalar2_val(e.target.value);
                            else if (i === 4) setNalar3_val(e.target.value);
                            else if (i === 5) setPilihanVal(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2AllCorrect}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari tabel, tuliskan rumus umum:
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-[#2C2C2A]">P(sama) =</span>
            <input
              type="text"
              value={rumusSama}
              onChange={(e) => setRumusSama(e.target.value)}
              placeholder="..."
              disabled={a2AllCorrect}
              className="inline-block rounded-md border-2 border-[#34673933] bg-white px-3 py-1 text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
              style={{ minWidth: "200px" }}
            />
          </div>
        </SoalCard>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 2C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep2({ onNext }: { onNext?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student-section-status/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_dengan_unsur_sama",
          section: "penjelasan_konsep",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[penjelasan-konsep-2] Complete failed:", res.status, data?.error);
      }
    } catch (err) {
      console.error("[penjelasan-konsep-2] Complete error:", err);
    } finally {
      setLoading(false);
      if (onNext) onNext();
    }
  };

  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi dengan Unsur yang Sama</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika dari <b>n</b> objek terdapat objek-objek yang sama (misal: k₁ objek sama jenis 1,
          k₂ objek sama jenis 2, dst.), maka:
        </p>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center mb-4">
          <RichText>
            {"$P = \\frac{n!}{k_1! \\cdot k_2! \\cdot k_3! \\cdot \\dots}$"}
          </RichText>
        </div>

        <div className="rounded-lg border border-[#66336226] bg-[#66336208] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">🤔 Mengapa dibagi faktorial?</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Karena susunan objek-objek yang sama satu sama lain <b>tidak menghasilkan susunan yang berbeda</b>.
            Pembagian dengan k₁! menghilangkan pengulangan yang disebabkan oleh objek-objek identik.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />

      {onNext && <NextButton onClick={handleNext} loading={loading} />}
    </article>
  );
}

// ============================================================================
// PART 3: PERMUTASI SIKLIS
// ============================================================================

// ── 3A. Eksplorasi Kontekstual (Rule Based) ────────────────────────

function EksplorasiKontekstual3({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  const [toggle, setToggle] = useState<"yes" | "no" | null>(null);
  const [berapaSusunan, setBerapaSusunan] = useState("");
  const [allCorrect, setAllCorrect] = useState(false);
  const [checkFB, setCheckFB] = useState("");
  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const eksplorasiData = savedData.eksplorasi as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!eksplorasiData) return;

    const entry = eksplorasiData["permutasi_siklis_eksplorasi"];
    if (entry?.answer) {
      const ans = entry.answer as Record<string, unknown>;
      const t = String(ans.toggle ?? "");
      if (t === "yes") setToggle("yes");
      else if (t === "no") setToggle("no");
      setBerapaSusunan(String(ans.berapaSusunan ?? ""));
      if (entry.isCorrect === true) {
        setAllCorrect(true);
        onCompleteCalled.current = true;
      }
    }
    didSyncSavedData.current = true;
  }, [savedData]);

  // Notify parent when all correct
  useEffect(() => {
    if (allCorrect && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allCorrect, onComplete]);

  function handleSave() {
    const errors: string[] = [];
    if (toggle !== "yes") errors.push("Penjelasan ketua OSIS benar (Ya). Dalam susunan melingkar, rotasi dianggap sama.");
    const sn = normalizeAnswer(berapaSusunan);
    if (!sn || (sn !== "6" && sn !== "(4-1)!")) errors.push("Susunan berbeda = 6 atau (4-1)!. Gunakan P(siklis 4) = (4-1)! = 3! = 6.");
    
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setCheckFB(errors.join(" ")); setAllCorrect(false); }
    else { setCheckFB(""); setAllCorrect(true); }

    // Fire-and-forget: save EVERY attempt (correct or wrong) to DB
    fetch("/api/eksplorasi-kontekstual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "permutasi_siklis",
        question_key: "permutasi_siklis_eksplorasi",
        answer: { toggle: toggle, berapaSusunan },
        feedback: isCorrect ? "Jawaban benar — permutasi siklis dipahami." : errors.join(" "),
        is_correct: isCorrect,
      }),
    }).catch((err) => console.error("[eksplorasi-kontekstual-3] DB save error:", err));
  }

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Pengurus OSIS terdiri dari <b>4 orang</b> (Ari, Budi, Cici, Dani) akan mengadakan rapat
          duduk <b>melingkari meja bundar</b>. Sekretaris mencatat semua kemungkinan tempat duduk.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
          Ia mulai dengan cara biasa: <i>"4 orang berjajar = 4! = 24 cara."</i>
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
          Tapi ketua OSIS mengoreksi: <i>"Kita duduk melingkar, bukan berjajar. Coba perhatikan ini..."</i>
        </p>

        {/* Interactive circular permutation simulation */}
        <div className="mb-5">
          <CircularPermutationSimulation />
        </div>

        <SoalCard
          title="Menurutmu, apakah penjelasan ketua OSIS benar? Jika ya, berapa susunan yang benar-benar berbeda?"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Penjelasan ketua OSIS benar?</p>
              <YesNoToggle value={toggle} onChange={setToggle} disabled={allCorrect} />
            </div>
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">
                Jika ya, berapa susunan yang benar-benar berbeda menurutmu?
              </p>
              <InputBlank
                value={berapaSusunan}
                onChange={setBerapaSusunan}
                disabled={allCorrect}
              />
            </div>
          </div>

          {checkFB && !allCorrect && (
            <div className="mt-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
              <p className="text-xs font-medium text-[#C44F4F]">❌ {checkFB}</p>
            </div>
          )}

          {!allCorrect && (
            <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
              >
                <CheckIcon /> Simpan Jawaban
              </button>
            </div>
          )}
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 3B. Aktivitas Deep Learning ────────────────────────────────────

function AktivitasDeepLearning3({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  // Aktivitas 1: 3 orang melingkar
  const [susunanUnik3, setSusunanUnik3] = useState("");
  const [munculKali, setMunculKali] = useState("");
  const [angkaSama, setAngkaSama] = useState("");
  const [psiklis3, setPsiklis3] = useState("");
  const [a1aCorrect, setA1aCorrect] = useState(false);
  const [a1aFB, setA1aFB] = useState("");
  const [a1bCorrect, setA1bCorrect] = useState(false);
  const [a1bFB, setA1bFB] = useState("");
  const [a1cCorrect, setA1cCorrect] = useState(false);
  const [a1cFB, setA1cFB] = useState("");
  const [a1dCorrect, setA1dCorrect] = useState(false);
  const [a1dFB, setA1dFB] = useState("");

  // Aktivitas B2: Tabel n
  const [n4Muncul, setN4Muncul] = useState("");
  const [n4Unik, setN4Unik] = useState("");
  const [n5Linear, setN5Linear] = useState("");
  const [n5Muncul, setN5Muncul] = useState("");
  const [n5Unik, setN5Unik] = useState("");
  const [n6Linear, setN6Linear] = useState("");
  const [n6Muncul, setN6Muncul] = useState("");
  const [n6Unik, setN6Unik] = useState("");
  const [nMuncul, setNMuncul] = useState("");
  const [nUnik, setNUnik] = useState("");
  const [rumusSiklis, setRumusSiklis] = useState("");
  const [a2Correct, setA2Correct] = useState(false);
  const [a2FB, setA2FB] = useState("");

  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const dl = savedData.deepLearning as Record<string, { answer?: Record<string, unknown>; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!dl) return;

    const setStr = (a: Record<string, unknown> | undefined, key: string, setter: (v: string) => void) => {
      if (a && typeof a[key] === "string") setter(a[key] as string);
    };

    // A1a
    const a1a = dl["a1a"];
    if (a1a?.answer) { setStr(a1a.answer as Record<string, unknown>, "susunanUnik3", setSusunanUnik3); if (a1a.isCorrect === true) setA1aCorrect(true); }
    // A1b
    const a1b = dl["a1b"];
    if (a1b?.answer) { setStr(a1b.answer as Record<string, unknown>, "munculKali", setMunculKali); if (a1b.isCorrect === true) setA1bCorrect(true); }
    // A1c
    const a1c = dl["a1c"];
    if (a1c?.answer) { setStr(a1c.answer as Record<string, unknown>, "angkaSama", setAngkaSama); if (a1c.isCorrect === true) setA1cCorrect(true); }
    // A1d
    const a1d = dl["a1d"];
    if (a1d?.answer) { setStr(a1d.answer as Record<string, unknown>, "psiklis3", setPsiklis3); if (a1d.isCorrect === true) setA1dCorrect(true); }
    // A2 Siklis
    const a2 = dl["a2_siklis"];
    if (a2?.answer) {
      const a = a2.answer as Record<string, unknown>;
      setStr(a, "n4Muncul", setN4Muncul);
      setStr(a, "n4Unik", setN4Unik);
      setStr(a, "n5Linear", setN5Linear);
      setStr(a, "n5Muncul", setN5Muncul);
      setStr(a, "n5Unik", setN5Unik);
      setStr(a, "n6Linear", setN6Linear);
      setStr(a, "n6Muncul", setN6Muncul);
      setStr(a, "n6Unik", setN6Unik);
      setStr(a, "nMuncul", setNMuncul);
      setStr(a, "nUnik", setNUnik);
      setStr(a, "rumusSiklis", setRumusSiklis);
      if (a2.isCorrect === true) setA2Correct(true);
    }

    didSyncSavedData.current = true;
  }, [savedData]);

  // ── Sequential step tracking ────────────────────────────────────
  const [deepStep, setDeepStep] = useState(0);

  useEffect(() => { if (a1aCorrect && deepStep === 0) setDeepStep(1); }, [a1aCorrect, deepStep]);
  useEffect(() => { if (a1bCorrect && deepStep === 1) setDeepStep(2); }, [a1bCorrect, deepStep]);
  useEffect(() => { if (a1cCorrect && deepStep === 2) setDeepStep(3); }, [a1cCorrect, deepStep]);
  useEffect(() => { if (a1dCorrect && deepStep === 3) setDeepStep(4); }, [a1dCorrect, deepStep]);

  // Notify parent when all A1 sub-checks and A2 table are complete
  useEffect(() => {
    const allDone = a1aCorrect && a1bCorrect && a1cCorrect && a1dCorrect && a2Correct;
    if (allDone && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [a1aCorrect, a1bCorrect, a1cCorrect, a1dCorrect, a2Correct, onComplete]);

  // ── Rule Based: Check A1a ──────────────────────────────────────
  async function handleSaveA1a() {
    const isCorrect = normalizeAnswer(susunanUnik3) === "2";
    if (!isCorrect) { setA1aFB("Susunan melingkar unik = 2"); setA1aCorrect(false); }
    else { setA1aFB(""); setA1aCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          answer: { activity: "a1a", susunanUnik3 },
          feedback: isCorrect ? "Benar." : "Susunan melingkar unik = 2",
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-3-a1a] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-3-a1a] DB save error:", err);
    }
  }
  async function handleSaveA1b() {
    const isCorrect = normalizeAnswer(munculKali) === "3";
    if (!isCorrect) { setA1bFB("Setiap susunan melingkar muncul 3 kali"); setA1bCorrect(false); }
    else { setA1bFB(""); setA1bCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          answer: { activity: "a1b", munculKali },
          feedback: isCorrect ? "Benar." : "Setiap susunan melingkar muncul 3 kali",
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-3-a1b] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-3-a1b] DB save error:", err);
    }
  }
  async function handleSaveA1c() {
    const isCorrect = normalizeAnswer(angkaSama) === "3";
    if (!isCorrect) { setA1cFB("Angka itu = 3 (banyaknya orang)"); setA1cCorrect(false); }
    else { setA1cFB(""); setA1cCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          answer: { activity: "a1c", angkaSama },
          feedback: isCorrect ? "Benar." : "Angka itu = 3 (banyaknya orang)",
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-3-a1c] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-3-a1c] DB save error:", err);
    }
  }
  async function handleSaveA1d() {
    const isCorrect = normalizeAnswer(psiklis3) === "2";
    if (!isCorrect) { setA1dFB("P(siklis 3) = 2"); setA1dCorrect(false); }
    else { setA1dFB(""); setA1dCorrect(true); }
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          answer: { activity: "a1d", psiklis3 },
          feedback: isCorrect ? "Benar." : "P(siklis 3) = 2",
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-3-a1d] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-3-a1d] DB save error:", err);
    }
  }

  // ── Rule Based: Check A2 Siklis Table ──────────────────────────
  async function handleSaveA2() {
    const errors: string[] = [];
    const checks: { got: string; accepted: string[]; label: string }[] = [
      { got: normalizeFinal(n4Muncul), accepted: ["4kali", "4", "4x"], label: "n=4 muncul" },
      { got: normalizeFinal(n4Unik),   accepted: ["6", "24/4", "4!/4"], label: "n=4 unik" },
      { got: normalizeFinal(n5Linear), accepted: ["5!=120", "5!", "120"], label: "n=5 linear" },
      { got: normalizeFinal(n5Muncul), accepted: ["5kali", "5", "5x"], label: "n=5 muncul" },
      { got: normalizeFinal(n5Unik),   accepted: ["24", "120/5", "5!/5"], label: "n=5 unik" },
      { got: normalizeFinal(n6Linear), accepted: ["6!=720", "6!", "720"], label: "n=6 linear" },
      { got: normalizeFinal(n6Muncul), accepted: ["6kali", "6", "6x"], label: "n=6 muncul" },
      { got: normalizeFinal(n6Unik),   accepted: ["120", "720/6", "6!/6"], label: "n=6 unik" },
      { got: normalizeFinal(nMuncul),  accepted: ["nkali", "n", "nx"], label: "n muncul" },
      { got: normalizeFinal(nUnik),    accepted: ["(n-1)!", "n!/n"], label: "n unik" },
    ];
    for (const { got, accepted, label } of checks) {
      if (!got) { errors.push(`${label} belum diisi`); continue; }
      if (!accepted.includes(got)) errors.push(`${label} kurang tepat`);
    }
    const rs = normalizeFinal(rumusSiklis);
    if (!rs) errors.push("Rumus siklis belum diisi");
    else if (!["(n-1)!", "n!/n"].includes(rs)) errors.push("Rumus siklis kurang tepat");
    
    const isCorrect = errors.length === 0;
    if (!isCorrect) { setA2FB(errors.join(". ") + ". Perbaiki ya!"); setA2Correct(false); }
    else { setA2FB(""); setA2Correct(true); }
    
    try {
      const res = await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          answer: {
            activity: "a2_siklis",
            n4Muncul, n4Unik, n5Linear, n5Muncul, n5Unik,
            n6Linear, n6Muncul, n6Unik, nMuncul, nUnik, rumusSiklis,
          },
          feedback: isCorrect ? "Tabel Siklis benar." : errors.join(". "),
          is_correct: isCorrect,
        }),
      });
      if (!res.ok) console.error("[deep-learning-3-a2] DB save failed:", res.status);
    } catch (err) {
      console.error("[deep-learning-3-a2] DB save error:", err);
    }
  }

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Permutasi Siklis
        </h3>

        {/* Aktivitas 1: Amati 3 orang */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Amati (Selidiki Rotasi): Dari 3 orang (A, B, C) duduk melingkar
          </h4>

          <p className="text-sm font-medium text-[#346739]">Langkah 1: Daftar semua permutasi linear (duduk berjajar)</p>
          <p className="text-sm text-[#2C2C2A] mb-2">
            3! = 6 susunan: ABC, ACB, BAC, BCA, CAB, CBA
          </p>

          <p className="text-sm font-medium text-[#346739] mb-2">Langkah 2: Kelompokkan yang merupakan rotasi satu sama lain:</p>
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#B8E6BC]">
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Kelompok</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan yang Sama (Rotasi)</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan Melingkar Unik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                <tr className="bg-white">
                  <td className="px-4 py-3 text-center font-medium text-[#346739]">1</td>
                  <td className="px-4 py-3 text-center font-mono text-[#2C2C2A]">ABC → BCA → CAB</td>
                  <td className="px-4 py-3 text-center text-[#2C2C2A]">{"{A, B, C}"} searah jarum jam</td>
                </tr>
                <tr className="bg-[#DBFFD5]/30">
                  <td className="px-4 py-3 text-center font-medium text-[#346739]">2</td>
                  <td className="px-4 py-3 text-center font-mono text-[#2C2C2A]">ACB → CBA → BAC</td>
                  <td className="px-4 py-3 text-center text-[#2C2C2A]">{"{A, C, B}"} searah jarum jam</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SoalCard
            title="Dari 3! = 6 susunan linear, hanya ada berapa susunan melingkar yang unik?"
            onSave={handleSaveA1a}
            saved={a1aCorrect}
          >
            {a1aFB && !a1aCorrect && (
              <div className="mb-2 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1aFB}</p>
              </div>
            )}
            <InputBlank value={susunanUnik3} onChange={setSusunanUnik3} disabled={a1aCorrect} />
          </SoalCard>

          {deepStep >= 1 && (
          <SoalCard
            title="Setiap susunan melingkar muncul berapa kali dalam daftar permutasi linear?"
            onSave={handleSaveA1b}
            saved={a1bCorrect}
          >
            {a1bFB && !a1bCorrect && (
              <div className="mb-2 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1bFB}</p>
              </div>
            )}
            <InputBlank value={munculKali} onChange={setMunculKali} disabled={a1bCorrect} />
          </SoalCard>
          )}

          {deepStep >= 2 && (
          <SoalCard
            title="Angka itu sama dengan berapa? (banyaknya orang yang duduk melingkar)"
            onSave={handleSaveA1c}
            saved={a1cCorrect}
          >
            {a1cFB && !a1cCorrect && (
              <div className="mb-2 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1cFB}</p>
              </div>
            )}
            <InputBlank value={angkaSama} onChange={setAngkaSama} disabled={a1cCorrect} />
          </SoalCard>
          )}

          {deepStep >= 3 && (
          <SoalCard
            title="Langkah 3: Hitung — P(siklis 3) = 3!/3 = 6/3 = ..."
            onSave={handleSaveA1d}
            saved={a1dCorrect}
          >
            {a1dFB && !a1dCorrect && (
              <div className="mb-2 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2">
                <p className="text-xs font-medium text-[#C44F4F]">❌ {a1dFB}</p>
              </div>
            )}
            <InputBlank value={psiklis3} onChange={setPsiklis3} disabled={a1dCorrect} />
          </SoalCard>
          )}
        </div>

        {/* Aktivitas B2: Nalar tabel n */}
        {deepStep >= 4 && (
        <SoalCard
          number="Aktivitas B2 — Nalar"
          title="Temukan Pola: Lakukan hal yang sama untuk berbagai nilai n:"
          onSave={handleSaveA2}
          saved={a2Correct}
        >
          {a2FB && !a2Correct && (
            <div className="mb-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
              <p className="text-xs font-medium text-[#C44F4F]">❌ {a2FB}</p>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Susunan Linear (n!)</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Setiap susunan melingkar unik muncul berapa kali?</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Susunan Melingkar Unik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { n: 3, linear: "3! = 6", muncul: "3 kali", unik: "6/3 = 2", ro: true },
                  { n: 4, linear: "4! = 24", muncul: null, unik: null, ro: false },
                  { n: 5, linear: null, muncul: null, unik: null, ro: false },
                  { n: 6, linear: null, muncul: null, unik: null, ro: false },
                  { n: "n", linear: "n!", muncul: null, unik: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-center font-semibold text-[#346739]">{row.n}</td>
                    <td className="px-4 py-3 text-center">
                      {row.linear != null ? (
                        <span className="font-mono text-[#2C2C2A]">{row.linear}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? n5Linear : i === 3 ? n6Linear : ""}
                          onChange={(e) => {
                            if (i === 2) setN5Linear(e.target.value);
                            else if (i === 3) setN6Linear(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2Correct}
                          className="w-24 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="text-[#2C2C2A]">{row.muncul}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 1 ? n4Muncul : i === 2 ? n5Muncul : i === 3 ? n6Muncul : i === 4 ? nMuncul : ""}
                          onChange={(e) => {
                            if (i === 1) setN4Muncul(e.target.value);
                            else if (i === 2) setN5Muncul(e.target.value);
                            else if (i === 3) setN6Muncul(e.target.value);
                            else if (i === 4) setNMuncul(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2Correct}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.unik}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 1 ? n4Unik : i === 2 ? n5Unik : i === 3 ? n6Unik : i === 4 ? nUnik : ""}
                          onChange={(e) => {
                            if (i === 1) setN4Unik(e.target.value);
                            else if (i === 2) setN5Unik(e.target.value);
                            else if (i === 3) setN6Unik(e.target.value);
                            else if (i === 4) setNUnik(e.target.value);
                          }}
                          placeholder="…"
                          disabled={a2Correct}
                          className="w-24 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari baris terakhir:
          </p>
          <p className="text-sm text-[#2C2C2A] mt-1">
            P(siklis n) = n!/n ={" "}
            <InputBlank value={rumusSiklis} onChange={setRumusSiklis} disabled={a2Correct} className="w-24" />
          </p>
        </SoalCard>
        )}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 3C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep3({ onNext }: { onNext?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student-section-status/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          section: "penjelasan_konsep",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[penjelasan-konsep-3] Complete failed:", res.status, data?.error);
      }
    } catch (err) {
      console.error("[penjelasan-konsep-3] Complete error:", err);
    } finally {
      setLoading(false);
      if (onNext) onNext();
    }
  };

  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi Siklis</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Permutasi Siklis adalah susunan objek-objek yang membentuk lingkaran tertutup, di mana
          rotasi dari susunan yang sama dianggap identik.
        </p>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center mb-4">
          <RichText>
            {"$P_{\\text{siklis}}(n) = (n-1)!$"}
          </RichText>
        </div>

        <div className="rounded-lg border border-[#66336226] bg-[#66336208] p-4 mb-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">🤔 Mengapa (n−1)!?</h4>
          <ul className="space-y-1 text-sm leading-relaxed text-[#2C2C2A] list-disc pl-5">
            <li>Dalam susunan linear, ada n! cara.</li>
            <li>Dalam susunan melingkar, setiap kelompok susunan yang sama dihitung n kali (sebanyak rotasi yang mungkin).</li>
            <li>Maka: n!/n = (n−1)!</li>
          </ul>
        </div>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
          <h4 className="mb-2 text-base font-semibold text-[#346739]">💡 Cara mudah memahaminya:</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            "Kunci" satu orang di satu posisi sebagai titik referensi. Susun sisa (n−1) orang di
            posisi yang lain → (n−1)! cara.
          </p>
        </div>

        <div className="mt-5 rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#C44F4F]">⚠ Permutasi Siklis Khusus: Objek dengan dua sisi</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A] mb-2">
            Untuk benda seperti <b>kalung, gelang, atau cincin</b> — membaliknya menghasilkan
            susunan yang dianggap sama (karena kalung bisa dipakai di kedua sisi).
          </p>
          <div className="rounded-lg bg-white px-4 py-3 text-center">
            <RichText>
              {"$P_{\\text{kalung}}(n) = \\frac{(n-1)!}{2}$"}
            </RichText>
          </div>
          <p className="mt-2 text-sm text-[#2C2C2A]">
            💡 <b>Dibagi 2 karena setiap susunan dan bayangannya (hasil membalik) dianggap identik.</b>
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />

      {onNext && <NextButton onClick={handleNext} loading={loading} />}
    </article>
  );
}

// ============================================================================
// PART 4: CONTOH SOAL BERTAHAP
// ============================================================================

type SoalCardBertahapProps = {
  number: string;
  title: string;
  onSave?: () => void;
  saved?: boolean;
  children: React.ReactNode;
};
 
function SoalCardBertahap({ number, title, children }: SoalCardBertahapProps) {
  return (
    <div className="rounded-2xl border border-[#34673933] bg-white shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-[#34673922]">
        <p className="text-xs font-semibold tracking-wide text-[#346739] mb-1">{number}</p>
        <p className="text-sm text-[#2C2C2A] leading-relaxed">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
 
// Catatan: AnswerTextArea (multi-baris) dari kode asli sengaja TIDAK
// dipakai lagi di file ini. Semua jawaban di 7 soal ini berupa satu
// angka tunggal (hasil P(n,r), subtotal kasus, dst) — bukan narasi
// panjang — sehingga textarea multi-baris berlebihan. Lihat tabel
// analisis input vs textarea yang menyertai pengiriman file ini.
 
// ════════════════════════════════════════════════════════════════
// GradedAnswerInput — rule-based grading untuk Contoh Soal Bertahap.
// Tidak menggunakan AI feedback karena soal bertahap bersifat
// numerik / faktorial dengan satu jawaban pasti.
// ════════════════════════════════════════════════════════════════

type GradedAnswerInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  expectedAnswer: string;
  /** Optional DB save metadata — fires save to /api/contoh-soal-bertahap on every check */
  saveMeta?: {
    questionKey: string;
    difficultyLevel: "mudah" | "sedang" | "hots";
    orderIndex: number;
  };
  /** Called when the answer is graded "correct" — used for sequential soal unlocking */
  onCorrect?: () => void;
  /** When true, input is read-only (for "Lihat jawabanku" mode) */
  readOnly?: boolean;
  /** Saved answer from DB — auto-restores grade on mount */
  savedAnswer?: { value?: string; isCorrect?: boolean };
};

function GradedAnswerInput({ value, onChange, placeholder, label, expectedAnswer, saveMeta, onCorrect, readOnly = false, savedAnswer }: GradedAnswerInputProps) {
  const [grade, setGrade] = useState<"idle" | "correct" | "incorrect">("idle");
  const onCorrectCalled = useRef(false);
  const didRestore = useRef(false);

  // Auto-restore from savedAnswer (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedAnswer || didRestore.current) return;
    if (savedAnswer.value !== undefined && String(savedAnswer.value).trim()) {
      onChange(String(savedAnswer.value));
      const result = savedAnswer.isCorrect === true ? "correct" : "incorrect";
      setGrade(result);
      if (result === "correct") onCorrectCalled.current = true;
    }
    didRestore.current = true;
  }, [savedAnswer, onChange]);

  function handleChange(v: string) {
    onChange(v);
    if (grade !== "idle") setGrade("idle");
    onCorrectCalled.current = false;
  }

  function handleCheck() {
    if (!value.trim()) return;
    const result = checkAnswer(value, expectedAnswer);
    setGrade(result);

    // Save EVERY attempt to DB (fire-and-forget)
    if (saveMeta) {
      fetch("/api/contoh-soal-bertahap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          question_key: saveMeta.questionKey,
          difficulty_level: saveMeta.difficultyLevel,
          order_index: saveMeta.orderIndex,
          answer: { value, expectedAnswer, graded: result },
          is_correct: result === "correct",
        }),
      }).catch((err) => console.error("[contoh-soal] DB save error:", err));
    }
  }

  // Notify parent once when answer becomes correct
  useEffect(() => {
    if (grade === "correct" && onCorrect && !onCorrectCalled.current) {
      onCorrectCalled.current = true;
      onCorrect();
    }
  }, [grade, onCorrect]);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <p className="text-sm font-medium text-[#346739]">{label}</p> : null}
      <p className="text-[11px] text-[#6b6b68] -mt-0.5 italic">
        💡 Tulis jawaban akhir berupa <b>angka</b> saja, tidak perlu cara.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={readOnly || grade === "correct"}
          className={
            "flex-1 rounded-lg border bg-white px-3 py-2 text-sm text-[#2C2C2A] outline-none focus:ring-2 transition-colors " +
            (readOnly || grade === "correct"
              ? "border-[#346739] bg-[#DBFFD5]/30 cursor-default"
              : grade === "incorrect"
                ? "border-[#C44F4F] focus:ring-[#C44F4F22]"
                : "border-[#34673944] focus:border-[#346739] focus:ring-[#34673922]")
          }
        />
        {!readOnly && grade !== "correct" && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!value.trim()}
            className="shrink-0 rounded-lg bg-[#346739] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2a5230] disabled:bg-[#34673944] disabled:cursor-not-allowed active:scale-95"
          >
            Cek
          </button>
        )}
        {grade === "correct" && (
          <span className="shrink-0 text-xs font-semibold text-[#346739] bg-[#DBFFD5] border border-[#346739] rounded-lg px-3 py-2">
            ✅ Benar!
          </span>
        )}
      </div>
      {grade === "incorrect" && (
        <p className="text-xs text-[#C44F4F] font-medium flex items-center gap-1">
          <span>❌</span> Jawaban belum tepat. Coba periksa kembali perhitunganmu!
        </p>
      )}
    </div>
  );
}
 
// ════════════════════════════════════════════════════════════════
// Small shared UI bits
// ════════════════════════════════════════════════════════════════
 
function ThinkingStep({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#2C2C2A] leading-relaxed">{children}</p>;
}
 
function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-[#DBFFD5]/40 px-3 py-2 border border-[#34673922]">
      <p className="text-xs text-[#346739] leading-relaxed">{children}</p>
    </div>
  );
}
 
function SimBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#346739] text-white text-[10px] font-semibold px-2 py-0.5 tracking-wide uppercase">
      {children}
    </span>
  );
}
 
function SimShell({ title, children, onReset }: { title: string; children: React.ReactNode; onReset?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#34673955] bg-[#F7FBF6] px-4 py-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SimBadge>Simulasi</SimBadge>
          <p className="text-xs font-medium text-[#2C2C2A]">{title}</p>
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-[#346739] underline decoration-dotted hover:opacity-70"
          >
            Reset
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 1 — Drag kandidat ke slot jabatan (permutasi linier)
// ════════════════════════════════════════════════════════════════
 
const KANDIDAT = ["Ayu", "Bima", "Citra", "Dewi", "Eko", "Fani"];
const JABATAN = ["Ketua", "Sekretaris", "Bendahara"];
 
function Contoh1({ onSoalDone, readOnly = false, savedAnswer }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswer?: { value: string; isCorrect: boolean } }) {
  const [jawaban, setJawaban] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (done && onSoalDone) onSoalDone(); }, [done, onSoalDone]);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [dragging, setDragging] = useState<string | null>(null);
 
  const used = slots.filter(Boolean) as string[];
  const available = KANDIDAT.filter((k) => !used.includes(k));
 
  function dropTo(index: number) {
    if (!dragging) return;
    setSlots((prev) => {
      const next = [...prev];
      next[index] = dragging;
      return next;
    });
    setDragging(null);
  }
 
  function clearSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }
 
  function reset() {
    setSlots([null, null, null]);
    setDragging(null);
  }
 
  return (
    <SoalCardBertahap
      number="Contoh 1 — Mudah"
      title="Dari 6 calon pengurus OSIS, akan dipilih Ketua, Sekretaris, dan Bendahara. Berapa banyak susunan pengurus yang mungkin?"
    >
      <SimShell title="Drag kandidat ke jabatan yang sesuai" onReset={reset}>
        <div className="flex flex-wrap gap-2 mb-4">
          {available.length === 0 ? (
            <p className="text-xs text-[#6b6b68] italic">Semua kandidat sudah ditempatkan.</p>
          ) : (
            available.map((k) => (
              <div
                key={k}
                draggable
                onDragStart={() => setDragging(k)}
                onDragEnd={() => setDragging(null)}
                className="cursor-grab active:cursor-grabbing rounded-full bg-white border border-[#346739] text-[#346739] text-xs font-medium px-3 py-1.5 shadow-sm select-none"
              >
                {k}
              </div>
            ))
          )}
        </div>
 
        <div className="grid grid-cols-3 gap-3">
          {JABATAN.map((jab, i) => (
            <div
              key={jab}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropTo(i)}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#34673955] bg-white px-2 py-3 min-h-[84px] justify-center"
            >
              <p className="text-[10px] uppercase tracking-wide text-[#346739] font-semibold">{jab}</p>
              {slots[i] ? (
                <button
                  type="button"
                  onClick={() => clearSlot(i)}
                  className="rounded-full bg-[#DBFFD5] text-[#346739] text-xs font-semibold px-3 py-1"
                  title="Klik untuk kosongkan"
                >
                  {slots[i]} ✕
                </button>
              ) : (
                <p className="text-[11px] text-[#6b6b68] italic">taruh di sini</p>
              )}
            </div>
          ))}
        </div>
 
        <p className="text-[11px] text-[#6b6b68] mt-3">
          Coba susun beberapa kombinasi berbeda — perhatikan bahwa menukar siapa jadi Ketua vs Sekretaris
          menghasilkan susunan yang berbeda, meski orangnya sama.
        </p>
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Ini permutasi karena jabatan berbeda → urutan penting. n = 6, r = 3, sehingga
        dipakai rumus P(n, r) = n!/(n−r)!.
      </ThinkingStep>
 
      <div className="mt-3">
        <GradedAnswerInput value={jawaban} onChange={setJawaban} placeholder="Jumlah total susunan = ..." label="Jawaban akhir" expectedAnswer="120" saveMeta={{ questionKey: "contoh_1", difficultyLevel: "mudah", orderIndex: 0 }} onCorrect={() => setDone(true)} readOnly={readOnly} savedAnswer={savedAnswer} />
      </div>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 2 — Drag orang ke kursi bundar (permutasi siklis)
// ════════════════════════════════════════════════════════════════
 
const NAMA_6 = ["Ayu", "Bima", "Citra", "Dewi", "Eko", "Fani"];
 
function useCircleLayout(n: number, radius = 70, cx = 100, cy = 100): { x: number; y: number }[] {
  return useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
  }, [n, radius, cx, cy]);
}
 
function Contoh2({ onSoalDone, readOnly = false, savedAnswer }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswer?: { value: string; isCorrect: boolean } }) {
  const [jawaban, setJawaban] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (done && onSoalDone) onSoalDone(); }, [done, onSoalDone]);
  const [seats, setSeats] = useState<(string | null)[]>(Array(6).fill(null));
  const [dragging, setDragging] = useState<string | null>(null);
  const [rotated, setRotated] = useState(0);
  const positions = useCircleLayout(6);
 
  const used = seats.filter(Boolean) as string[];
  const available = NAMA_6.filter((n) => !used.includes(n));
 
  function dropTo(index: number) {
    if (!dragging) return;
    setSeats((prev) => {
      const next = [...prev];
      next[index] = dragging;
      return next;
    });
    setDragging(null);
  }
 
  function clearSeat(index: number) {
    setSeats((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }
 
  function rotateDemo() {
    setRotated((r) => r + 1);
    setSeats((prev) => {
      const next = [...prev];
      next.unshift(next.pop() ?? null);
      return next;
    });
  }
 
  function reset() {
    setSeats(Array(6).fill(null));
    setRotated(0);
  }
 
  return (
    <SoalCardBertahap
      number="Contoh 2 — Mudah"
      title="Enam orang pengurus OSIS akan duduk mengelilingi meja bundar untuk rapat. Berapa banyak susunan tempat duduk yang berbeda?"
    >
      <SimShell title="Drag orang ke kursi, lalu coba putar mejanya" onReset={reset}>
        <div className="flex flex-wrap gap-2 mb-4">
          {available.length === 0 ? (
            <p className="text-xs text-[#6b6b68] italic">Semua sudah duduk.</p>
          ) : (
            available.map((n) => (
              <div
                key={n}
                draggable
                onDragStart={() => setDragging(n)}
                onDragEnd={() => setDragging(null)}
                className="cursor-grab active:cursor-grabbing rounded-full bg-white border border-[#346739] text-[#346739] text-xs font-medium px-3 py-1.5 shadow-sm select-none"
              >
                {n}
              </div>
            ))
          )}
        </div>
 
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
            <circle cx="100" cy="100" r="45" fill="#DBFFD5" stroke="#34673955" strokeWidth="1" />
            <text x="100" y="104" textAnchor="middle" className="fill-[#346739]" fontSize="9">
              Meja
            </text>
            {positions.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  fill={seats[i] ? "#346739" : "white"}
                  stroke="#346739"
                  strokeWidth="1.5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropTo(i)}
                  style={{ cursor: "pointer" }}
                  onClick={() => clearSeat(i)}
                />
                <text
                  x={p.x}
                  y={p.y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  className={seats[i] ? "fill-white" : "fill-[#34673988]"}
                  style={{ pointerEvents: "none" }}
                >
                  {seats[i] ? seats[i]!.slice(0, 3) : i + 1}
                </text>
              </g>
            ))}
          </svg>
 
          <div className="flex-1">
            <button
              type="button"
              onClick={rotateDemo}
              disabled={used.length < 6}
              className="rounded-lg bg-[#346739] text-white text-xs font-semibold px-3 py-2 disabled:bg-[#34673944] disabled:cursor-not-allowed"
            >
              Putar meja satu posisi ↻
            </button>
            <p className="text-[11px] text-[#6b6b68] mt-2 leading-relaxed">
              Diputar {rotated}× — perhatikan: urutan relatif orang tetap sama persis, cuma
              posisinya bergeser. Di meja bundar, ini dianggap <b>susunan yang sama</b> karena tidak ada
              kursi nomor 1 sebagai patokan.
            </p>
          </div>
        </div>
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Susunan melingkar tidak memiliki titik referensi tetap (tidak ada
        &ldquo;kursi nomor 1&rdquo;), sehingga digunakan <b>permutasi siklis</b>: P(siklis n) = (n − 1)!.
      </ThinkingStep>
 
      <div className="mt-3">
        <GradedAnswerInput value={jawaban} onChange={setJawaban} placeholder="Jumlah susunan berbeda = ..." label="Jawaban akhir" expectedAnswer="120" saveMeta={{ questionKey: "contoh_2", difficultyLevel: "mudah", orderIndex: 1 }} onCorrect={() => setDone(true)} readOnly={readOnly} savedAnswer={savedAnswer} />
      </div>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 3 — Toggle kasus Rafi (pilih kasus, lihat cabang berubah)
// ════════════════════════════════════════════════════════════════
 
function Contoh3({ onSoalDone, readOnly = false, savedAnswers }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswers?: { kasus1?: { value: string; isCorrect: boolean }; kasus2?: { value: string; isCorrect: boolean }; total?: { value: string; isCorrect: boolean } } }) {
  const [kasus1, setKasus1] = useState("");
  const [kasus2, setKasus2] = useState("");
  const [total, setTotal] = useState("");
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const allDone = correctSet.size >= 3;
  function markCorrect(key: string) { setCorrectSet(prev => { const s = new Set(prev); s.add(key); return s; }); }
  const [activeCase, setActiveCase] = useState<1 | 2 | null>(null);

  useEffect(() => { if (allDone && onSoalDone) onSoalDone(); }, [allDone, onSoalDone]);
 
  return (
    <SoalCardBertahap
      number="Contoh 3 — Sedang"
      title="Pengurus OSIS terdiri dari 10 siswa. Akan dipilih Ketua, Wakil Ketua, Sekretaris, dan Bendahara. Jika Rafi hanya bersedia menjadi Ketua atau tidak ikut sama sekali, berapa banyak susunan pengurus yang mungkin?"
    >
      <SimShell title="Klik salah satu kondisi Rafi untuk lihat cabang kasusnya">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            onClick={() => setActiveCase(1)}
            className={
              "rounded-xl border-2 px-3 py-3 text-left transition-colors " +
              (activeCase === 1 ? "border-[#346739] bg-[#DBFFD5]/60" : "border-[#34673933] bg-white")
            }
          >
            <p className="text-xs font-semibold text-[#346739] mb-1">Kasus 1: Rafi jadi Ketua</p>
            <p className="text-[11px] text-[#2C2C2A]">Rafi mengunci posisi Ketua. 9 siswa sisa berebut 3 posisi lain.</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveCase(2)}
            className={
              "rounded-xl border-2 px-3 py-3 text-left transition-colors " +
              (activeCase === 2 ? "border-[#346739] bg-[#DBFFD5]/60" : "border-[#34673933] bg-white")
            }
          >
            <p className="text-xs font-semibold text-[#346739] mb-1">Kasus 2: Rafi tidak ikut</p>
            <p className="text-[11px] text-[#2C2C2A]">Rafi keluar dari kolam kandidat. 9 siswa sisa berebut 4 posisi.</p>
          </button>
        </div>
 
        {activeCase === 1 && (
          <div className="rounded-lg bg-white border border-[#34673933] px-3 py-2">
            <p className="text-[11px] text-[#2C2C2A]">
              Posisi <b>Ketua</b> → terkunci untuk Rafi (1 cara). Posisi Wakil, Sekretaris, Bendahara → diisi
              dari 9 siswa tersisa, urutan penting.
            </p>
          </div>
        )}
        {activeCase === 2 && (
          <div className="rounded-lg bg-white border border-[#34673933] px-3 py-2">
            <p className="text-[11px] text-[#2C2C2A]">
              Semua 4 posisi (Ketua, Wakil, Sekretaris, Bendahara) diisi dari 9 siswa tersisa, urutan penting.
            </p>
          </div>
        )}
        {activeCase === null && (
          <p className="text-[11px] text-[#6b6b68] italic">Pilih salah satu kartu di atas untuk melihat penjelasannya.</p>
        )}
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Ada syarat khusus untuk Rafi, sehingga soal harus <b>dipilah menjadi dua
        kasus</b> yang saling lepas, lalu hasilnya digabung dengan kaidah penjumlahan.
      </ThinkingStep>
 
      <div className="mt-3 space-y-2.5">
        <GradedAnswerInput value={kasus1} onChange={setKasus1} placeholder="Subtotal Kasus 1 = ..." label="Kasus 1: Rafi menjadi Ketua" expectedAnswer="504" saveMeta={{ questionKey: "contoh_3_kasus1", difficultyLevel: "sedang", orderIndex: 2 }} onCorrect={() => markCorrect("k1")} readOnly={readOnly} savedAnswer={savedAnswers?.kasus1} />
        <GradedAnswerInput value={kasus2} onChange={setKasus2} placeholder="Subtotal Kasus 2 = ..." label="Kasus 2: Rafi tidak ikut" expectedAnswer="3024" saveMeta={{ questionKey: "contoh_3_kasus2", difficultyLevel: "sedang", orderIndex: 2 }} onCorrect={() => markCorrect("k2")} readOnly={readOnly} savedAnswer={savedAnswers?.kasus2} />
        <GradedAnswerInput value={total} onChange={setTotal} placeholder="Total = Kasus 1 + Kasus 2 = ..." label="Gabungkan (Kaidah Penjumlahan)" expectedAnswer="3528" saveMeta={{ questionKey: "contoh_3_total", difficultyLevel: "sedang", orderIndex: 2 }} onCorrect={() => markCorrect("t")} readOnly={readOnly} savedAnswer={savedAnswers?.total} />
      </div>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 4 — Susun ulang huruf MATEMATIKA, highlight huruf kembar
// ════════════════════════════════════════════════════════════════
 
const KATA = "MATEMATIKA".split("");
const LETTER_COLORS: Record<string, string> = {
  M: "#346739",
  A: "#5B8C5A",
  T: "#8FBF8D",
  E: "#B7D9B4",
  I: "#6b6b68",
  K: "#6b6b68",
};
 
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
 
function Contoh4({ onSoalDone, readOnly = false, savedAnswer }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswer?: { value: string; isCorrect: boolean } }) {
  const [jawaban, setJawaban] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (done && onSoalDone) onSoalDone(); }, [done, onSoalDone]);
  const [order, setOrder] = useState(KATA);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
 
  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
  }
 
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const ch of KATA) c[ch] = (c[ch] ?? 0) + 1;
    return c;
  }, []);
 
  return (
    <SoalCardBertahap number="Contoh 4 — Sedang" title='Berapa banyak cara menyusun huruf-huruf dari kata "MATEMATIKA"?'>
      <SimShell title="Drag huruf untuk menyusun ulang — huruf yang sama warnanya identik" onReset={() => setOrder(KATA)}>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {order.map((ch, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white text-sm font-bold cursor-grab active:cursor-grabbing select-none shadow-sm"
              style={{ backgroundColor: LETTER_COLORS[ch] ?? "#346739" }}
            >
              {ch}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOrder(shuffle(order))}
            className="text-[11px] text-[#346739] underline decoration-dotted ml-2 self-center"
          >
            Acak
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(counts).map(([ch, n]: [string, number]) => (
            <span
              key={ch}
              className="text-[10px] rounded-full px-2 py-0.5 text-white font-medium"
              style={{ backgroundColor: LETTER_COLORS[ch] ?? "#346739" }}
            >
              {ch} × {n}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#6b6b68] mt-2">
          Coba tukar posisi dua huruf <b>M</b> — susunan totalnya terlihat sama saja, kan? Itulah kenapa
          huruf kembar bikin jumlah susunan sebenarnya lebih sedikit dari 10!.
        </p>
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Kata &ldquo;MATEMATIKA&rdquo; punya 10 huruf dengan pengulangan: M(2), A(3),
        T(2), E(1), I(1), K(1). Karena ada huruf yang sama, digunakan <b>permutasi dengan pengulangan</b>:
        P = n!/(k₁!·k₂!·...).
      </ThinkingStep>
 
      <div className="mt-3">
        <GradedAnswerInput value={jawaban} onChange={setJawaban} placeholder="Jumlah total susunan = ..." label="Jawaban akhir" expectedAnswer="151200" saveMeta={{ questionKey: "contoh_4", difficultyLevel: "sedang", orderIndex: 3 }} onCorrect={() => setDone(true)} readOnly={readOnly} savedAnswer={savedAnswer} />
      </div>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 5 — Pasangan suami-istri, drag ke blok bundar
// ════════════════════════════════════════════════════════════════
 
const PASANGAN = [
  { id: "p1", nama: "Pak Ari & Bu Sari" },
  { id: "p2", nama: "Pak Budi & Bu Wati" },
  { id: "p3", nama: "Pak Dedi & Bu Nia" },
  { id: "p4", nama: "Pak Eko & Bu Fina" },
  { id: "p5", nama: "Pak Gilang & Bu Hana" },
];
 
function Contoh5({ onSoalDone, readOnly = false, savedAnswers }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswers?: { siklis5?: { value: string; isCorrect: boolean }; dalamBlok?: { value: string; isCorrect: boolean }; total?: { value: string; isCorrect: boolean } } }) {
  const [siklis5, setSiklis5] = useState("");
  const [dalamBlok, setDalamBlok] = useState("");
  const [total, setTotal] = useState("");
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const allDone = correctSet.size >= 3;
  function markCorrect(key: string) { setCorrectSet(prev => { const s = new Set(prev); s.add(key); return s; }); }
  const [blockSeats, setBlockSeats] = useState<(string | null)[]>(Array(5).fill(null));
  const [dragging, setDragging] = useState<string | null>(null);
  const [swapped, setSwapped] = useState<Record<string, boolean>>({});
  const positions = useCircleLayout(5, 65, 100, 95);

  useEffect(() => { if (allDone && onSoalDone) onSoalDone(); }, [allDone, onSoalDone]);
 
  const used = blockSeats.filter(Boolean) as string[];
  const available = PASANGAN.filter((p) => !used.includes(p.id));
 
  function dropTo(index: number) {
    if (!dragging) return;
    setBlockSeats((prev) => {
      const next = [...prev];
      next[index] = dragging;
      return next;
    });
    setDragging(null);
  }
 
  function toggleSwap(id: string) {
    setSwapped((prev) => ({ ...prev, [id]: !prev[id] }));
  }
 
  function reset() {
    setBlockSeats(Array(5).fill(null));
    setSwapped({});
  }
 
  return (
    <SoalCardBertahap
      number="Contoh 5 — Sedang"
      title="Lima pasang suami-istri akan duduk mengelilingi meja bundar. Berapa banyak susunan yang mungkin jika setiap suami harus duduk di sebelah istrinya?"
    >
      <SimShell title="Susun blok pasangan di meja, lalu klik blok untuk tukar posisi dalam pasangan" onReset={reset}>
        <div className="flex flex-wrap gap-2 mb-4">
          {available.length === 0 ? (
            <p className="text-xs text-[#6b6b68] italic">Semua pasangan sudah ditempatkan.</p>
          ) : (
            available.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={() => setDragging(p.id)}
                onDragEnd={() => setDragging(null)}
                className="cursor-grab active:cursor-grabbing rounded-full bg-white border border-[#346739] text-[#346739] text-[11px] font-medium px-3 py-1.5 shadow-sm select-none"
              >
                {p.nama}
              </div>
            ))
          )}
        </div>
 
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 200 190" className="w-48 h-44 shrink-0">
            <circle cx="100" cy="95" r="42" fill="#DBFFD5" stroke="#34673955" strokeWidth="1" />
            {positions.map((pos, i) => {
              const pid = blockSeats[i];
              const pasangan = PASANGAN.find((p) => p.id === pid);
              const isSwapped = pid ? swapped[pid] : false;
              return (
                <g key={i}>
                  <rect
                    x={pos.x - 22}
                    y={pos.y - 14}
                    width="44"
                    height="28"
                    rx="8"
                    fill={pid ? "#346739" : "white"}
                    stroke="#346739"
                    strokeWidth="1.5"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dropTo(i)}
                    onClick={() => pid && toggleSwap(pid)}
                    style={{ cursor: pid ? "pointer" : "default" }}
                  >
                    {pasangan ? <title>{pasangan.nama}</title> : null}
                  </rect>
                  {pid && (
                    <>
                      <text x={pos.x - (isSwapped ? 11 : -11)} y={pos.y + 3} textAnchor="middle" fontSize="7" fill="white">
                        ♂
                      </text>
                      <text x={pos.x + (isSwapped ? 11 : -11)} y={pos.y + 3} textAnchor="middle" fontSize="7" fill="white">
                        ♀
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
          <p className="text-[11px] text-[#6b6b68] leading-relaxed flex-1">
            Tiap blok mewakili satu pasangan yang harus duduk berdampingan. Klik blok untuk menukar posisi
            suami-istri di dalamnya (♂ ↔ ♀) — ini menunjukkan 2 kemungkinan susunan per pasangan, terlepas
            dari urutan blok-bloknya di meja.
          </p>
        </div>
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Gabungkan tiap pasangan menjadi satu blok, sehingga tersisa 5 blok yang
        disusun melingkar. Setelah itu, hitung juga kemungkinan susunan suami-istri di dalam tiap blok.
      </ThinkingStep>
 
      <div className="mt-3 space-y-2.5">
        <GradedAnswerInput value={siklis5} onChange={setSiklis5} placeholder="P(siklis 5 blok) = ..." label="Susunan melingkar 5 blok" expectedAnswer="24" saveMeta={{ questionKey: "contoh_5_siklis5", difficultyLevel: "sedang", orderIndex: 4 }} onCorrect={() => markCorrect("s")} readOnly={readOnly} savedAnswer={savedAnswers?.siklis5} />
        <GradedAnswerInput value={dalamBlok} onChange={setDalamBlok} placeholder="2^5 = ..." label="Susunan di dalam tiap blok" expectedAnswer="32" saveMeta={{ questionKey: "contoh_5_dalamBlok", difficultyLevel: "sedang", orderIndex: 4 }} onCorrect={() => markCorrect("d")} readOnly={readOnly} savedAnswer={savedAnswers?.dalamBlok} />
        <GradedAnswerInput value={total} onChange={setTotal} placeholder="Total = P(siklis 5) × 2^5 = ..." label="Total" expectedAnswer="768" saveMeta={{ questionKey: "contoh_5_total", difficultyLevel: "sedang", orderIndex: 4 }} onCorrect={() => markCorrect("t")} readOnly={readOnly} savedAnswer={savedAnswers?.total} />
      </div>
 
      <InsightBox>Strategi blok: ketika ada syarat &ldquo;harus berdampingan&rdquo;, gabungkan objek tersebut menjadi satu unit terlebih dahulu.</InsightBox>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 6 — Susun digit dari {1,1,2,2,3}, filter live > 20.000
// ════════════════════════════════════════════════════════════════
 
const DIGIT_SET = ["1", "1", "2", "2", "3"];
 
function Contoh6({ onSoalDone, readOnly = false, savedAnswers }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswers?: { kasus1?: { value: string; isCorrect: boolean }; kasus2?: { value: string; isCorrect: boolean }; total?: { value: string; isCorrect: boolean } } }) {
  const [kasus1, setKasus1] = useState("");
  const [kasus2, setKasus2] = useState("");
  const [total, setTotal] = useState("");
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const allDone = correctSet.size >= 3;
  function markCorrect(key: string) { setCorrectSet(prev => { const s = new Set(prev); s.add(key); return s; }); }
  const [order, setOrder] = useState(DIGIT_SET);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => { if (allDone && onSoalDone) onSoalDone(); }, [allDone, onSoalDone]);

  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
  }
 
  const number = Number(order.join(""));
  const valid = number > 20000;
 
  return (
    <SoalCardBertahap
      number="Contoh 6 — HOTS"
      title="Berapa banyak bilangan yang terdiri dari angka-angka {1, 1, 2, 2, 3} yang dapat dibentuk jika nilainya lebih dari 20.000?"
    >
      <SimShell title="Susun digit dan lihat langsung apakah bilangannya memenuhi syarat" onReset={() => setOrder(DIGIT_SET)}>
        <div className="flex gap-1.5 mb-3">
          {order.map((d, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#346739] text-white text-base font-bold cursor-grab active:cursor-grabbing select-none shadow-sm"
            >
              {d}
            </div>
          ))}
        </div>
 
        <div
          className={
            "rounded-lg px-3 py-2 text-sm font-semibold border-2 " +
            (valid ? "bg-[#DBFFD5]/60 border-[#346739] text-[#346739]" : "bg-red-50 border-red-300 text-red-500")
          }
        >
          {Number(order.join("")).toLocaleString("id-ID")} {valid ? "✓ lebih dari 20.000" : "✕ tidak memenuhi syarat"}
        </div>
        <p className="text-[11px] text-[#6b6b68] mt-2">
          Coba geser digit pertama ke 1 — bilangan langsung gagal syarat. Ini nunjukin kenapa
          <b> digit pertama</b> jadi kunci pemilahan kasus di soal ini.
        </p>
      </SimShell>
 
      <ThinkingStep>
        <b>Langkah Berpikir:</b> Ada 5 digit dengan angka berulang: 1(2×), 2(2×). Syarat bilangan &gt; 20.000
        berarti digit pertama harus ≥ 2, sehingga soal dipilah menjadi kasus berdasarkan digit pertama.
      </ThinkingStep>
 
      <div className="mt-3 space-y-2.5">
        <GradedAnswerInput value={kasus1} onChange={setKasus1} placeholder="Subtotal Kasus 1 = ..." label="Kasus 1: Digit pertama = 2" expectedAnswer="12" saveMeta={{ questionKey: "contoh_6_kasus1", difficultyLevel: "hots", orderIndex: 5 }} onCorrect={() => markCorrect("k1")} readOnly={readOnly} savedAnswer={savedAnswers?.kasus1} />
        <GradedAnswerInput value={kasus2} onChange={setKasus2} placeholder="Subtotal Kasus 2 = ..." label="Kasus 2: Digit pertama = 3" expectedAnswer="6" saveMeta={{ questionKey: "contoh_6_kasus2", difficultyLevel: "hots", orderIndex: 5 }} onCorrect={() => markCorrect("k2")} readOnly={readOnly} savedAnswer={savedAnswers?.kasus2} />
        <GradedAnswerInput value={total} onChange={setTotal} placeholder="Total = Kasus 1 + Kasus 2 = ..." label="Total" expectedAnswer="18" saveMeta={{ questionKey: "contoh_6_total", difficultyLevel: "hots", orderIndex: 5 }} onCorrect={() => markCorrect("t")} readOnly={readOnly} savedAnswer={savedAnswers?.total} />
      </div>
 
      <InsightBox>Perhatikan: di setiap kasus, sisa angka yang tersusun berbeda komposisinya — sehingga rumus penyebutnya pun berbeda.</InsightBox>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// CONTOH 7 — Meja bundar 8 orang, toggle Ari-Budi berdekatan/tidak
// ════════════════════════════════════════════════════════════════
 
const NAMA_8 = ["Ari", "Budi", "Citra", "Dewi", "Eko", "Fani", "Gita", "Hadi"];
 
function Contoh7({ onSoalDone, readOnly = false, savedAnswers }: { onSoalDone?: () => void; readOnly?: boolean; savedAnswers?: { totalSemua?: { value: string; isCorrect: boolean }; berdekatan?: { value: string; isCorrect: boolean }; totalAkhir?: { value: string; isCorrect: boolean } } }) {
  const [totalSemua, setTotalSemua] = useState("");
  const [berdekatan, setBerdekatan] = useState("");
  const [totalAkhir, setTotalAkhir] = useState("");
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const allDone = correctSet.size >= 3;
  function markCorrect(key: string) { setCorrectSet(prev => { const s = new Set(prev); s.add(key); return s; }); }
  const [seats, setSeats] = useState<string[]>(NAMA_8);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const positions = useCircleLayout(8, 78, 100, 100);

  useEffect(() => { if (allDone && onSoalDone) onSoalDone(); }, [allDone, onSoalDone]);

  function handleSeatClick(index: number) {
    if (selectedIdx === null) {
      // Belum ada yang dipilih → pilih kursi ini
      setSelectedIdx(index);
    } else if (selectedIdx === index) {
      // Klik lagi kursi yang sama → batal pilih
      setSelectedIdx(null);
    } else {
      // Sudah ada yang dipilih → tukar posisi
      setSeats((prev) => {
        const next = [...prev];
        [next[selectedIdx], next[index]] = [next[index], next[selectedIdx]];
        return next;
      });
      setSelectedIdx(null);
    }
  }

  const ariIdx = seats.indexOf("Ari");
  const budiIdx = seats.indexOf("Budi");
  const n = seats.length;
  const isAdjacent = Math.abs(ariIdx - budiIdx) === 1 || Math.abs(ariIdx - budiIdx) === n - 1;

  return (
    <SoalCardBertahap
      number="Contoh 7 — HOTS"
      title="Delapan siswa akan duduk mengelilingi meja bundar. Di antara mereka, Ari dan Budi berseteru dan tidak mau duduk berdekatan. Berapa banyak susunan tempat duduk yang mungkin?"
    >
      <SimShell title="Klik dua kursi untuk menukar posisi — cek apakah Ari &amp; Budi berdekatan">
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
          <circle cx="100" cy="100" r="50" fill="#DBFFD5" stroke="#34673955" strokeWidth="1" />
          {isAdjacent && (
            <line
              x1={positions[ariIdx].x}
              y1={positions[ariIdx].y}
              x2={positions[budiIdx].x}
              y2={positions[budiIdx].y}
              stroke="#e04b4b"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />
          )}
          {positions.map((p, i) => {
            const name = seats[i];
            const isConflict = (name === "Ari" || name === "Budi") && isAdjacent;
            const isSelected = selectedIdx === i;
            return (
              <g
                key={i}
                onClick={() => handleSeatClick(i)}
                style={{ cursor: "pointer" }}
              >
                {/* Ring seleksi */}
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="21"
                    fill="none"
                    stroke="#663362"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="17"
                  fill={isConflict ? "#e04b4b" : isSelected ? "#663362" : "#346739"}
                  stroke={isConflict ? "#b83030" : isSelected ? "#663362" : "#346739"}
                  strokeWidth="1.5"
                />
                <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="7.5" fill="white" style={{ pointerEvents: "none" }}>
                  {name.slice(0, 4)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hint interaksi */}
        <p className="text-[11px] text-[#6b6b68] mt-2 text-center">
          {selectedIdx === null
            ? "👆 Klik satu kursi untuk memilih, lalu klik kursi lain untuk menukar posisi."
            : `👆 Kursi terpilih: **${seats[selectedIdx]}**. Klik kursi lain untuk menukar, atau klik lagi untuk batal.`}
        </p>

        <div
          className={
            "mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-center border-2 " +
            (isAdjacent ? "bg-red-50 border-red-300 text-red-500" : "bg-[#DBFFD5]/60 border-[#346739] text-[#346739]")
          }
        >
          {isAdjacent ? "✕ Ari & Budi sedang berdekatan" : "✓ Ari & Budi tidak berdekatan"}
        </div>
      </SimShell>

      <ThinkingStep>
        <b>Langkah Berpikir:</b> Gunakan <b>strategi komplemen</b>: susunan Ari-Budi tidak berdekatan = total
        semua susunan dikurangi susunan Ari-Budi berdekatan.
      </ThinkingStep>

      <div className="mt-3 space-y-2.5">
        <GradedAnswerInput value={totalSemua} onChange={setTotalSemua} placeholder="P(siklis 8) = ..." label="Total semua susunan" expectedAnswer="5040" saveMeta={{ questionKey: "contoh_7_totalSemua", difficultyLevel: "hots", orderIndex: 6 }} onCorrect={() => markCorrect("ts")} readOnly={readOnly} savedAnswer={savedAnswers?.totalSemua} />
        <GradedAnswerInput value={berdekatan} onChange={setBerdekatan} placeholder="P(siklis 7) × 2! = ..." label="Ari dan Budi berdekatan" expectedAnswer="1440" saveMeta={{ questionKey: "contoh_7_berdekatan", difficultyLevel: "hots", orderIndex: 6 }} onCorrect={() => markCorrect("bd")} readOnly={readOnly} savedAnswer={savedAnswers?.berdekatan} />
        <GradedAnswerInput value={totalAkhir} onChange={setTotalAkhir} placeholder="Total = Total semua − Berdekatan = ..." label="Komplemen" expectedAnswer="3600" saveMeta={{ questionKey: "contoh_7_totalAkhir", difficultyLevel: "hots", orderIndex: 6 }} onCorrect={() => markCorrect("ta")} readOnly={readOnly} savedAnswer={savedAnswers?.totalAkhir} />
      </div>
 
      <InsightBox>Strategi komplemen sangat efisien ketika syarat &ldquo;tidak boleh&rdquo; lebih mudah dihitung daripada syarat &ldquo;harus&rdquo;.</InsightBox>
    </SoalCardBertahap>
  );
}
 
// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════

function ContohSoalBertahap({ contohStep = 0, onSoalDone, readOnly = false, savedData }: { contohStep?: number; onSoalDone?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  // Build savedAnswers lookup from savedData
  const savedAnswers = useMemo(() => {
    const map: Record<string, { value: string; isCorrect: boolean }> = {};
    if (!savedData) return map;
    const cs = savedData.contohSoal as Record<string, { answer?: Record<string, unknown>; isCorrect?: boolean }> | undefined;
    if (!cs) return map;
    for (const [key, entry] of Object.entries(cs)) {
      const ans = entry.answer as Record<string, unknown> | undefined;
      if (ans && typeof ans.value === "string") {
        map[key] = { value: ans.value, isCorrect: entry.isCorrect === true };
      }
    }
    return map;
  }, [savedData]);

  return (
    <article>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>
 
      <div className="flex flex-col gap-5">
        {contohStep >= 0 && <Contoh1 onSoalDone={contohStep === 0 ? onSoalDone : undefined} readOnly={readOnly} savedAnswer={savedAnswers["contoh_1"]} />}
        {contohStep >= 1 && <Contoh2 onSoalDone={contohStep === 1 ? onSoalDone : undefined} readOnly={readOnly} savedAnswer={savedAnswers["contoh_2"]} />}
        {contohStep >= 2 && <Contoh3 onSoalDone={contohStep === 2 ? onSoalDone : undefined} readOnly={readOnly} savedAnswers={{ kasus1: savedAnswers["contoh_3_kasus1"], kasus2: savedAnswers["contoh_3_kasus2"], total: savedAnswers["contoh_3_total"] }} />}
        {contohStep >= 3 && <Contoh4 onSoalDone={contohStep === 3 ? onSoalDone : undefined} readOnly={readOnly} savedAnswer={savedAnswers["contoh_4"]} />}
        {contohStep >= 4 && <Contoh5 onSoalDone={contohStep === 4 ? onSoalDone : undefined} readOnly={readOnly} savedAnswers={{ siklis5: savedAnswers["contoh_5_siklis5"], dalamBlok: savedAnswers["contoh_5_dalamBlok"], total: savedAnswers["contoh_5_total"] }} />}
        {contohStep >= 5 && <Contoh6 onSoalDone={contohStep === 5 ? onSoalDone : undefined} readOnly={readOnly} savedAnswers={{ kasus1: savedAnswers["contoh_6_kasus1"], kasus2: savedAnswers["contoh_6_kasus2"], total: savedAnswers["contoh_6_total"] }} />}
        {contohStep >= 6 && <Contoh7 onSoalDone={contohStep === 6 ? onSoalDone : undefined} readOnly={readOnly} savedAnswers={{ totalSemua: savedAnswers["contoh_7_totalSemua"], berdekatan: savedAnswers["contoh_7_berdekatan"], totalAkhir: savedAnswers["contoh_7_totalAkhir"] }} />}
      </div>
 
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// PART 5: MENGAPA? CORNER
// ============================================================================

function MengapaCorner({ onNext, refleksiCompleted = false }: { onNext?: () => void; refleksiCompleted?: boolean }) {
  const [clicked, setClicked] = useState(false);

  function handleNext() {
    setClicked(true);
    if (onNext) onNext();
  }

  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">💡 Mengapa urutan penting dalam permutasi?</h3>
        <p className="mb-4 leading-relaxed text-[#2C2C2A]">
          Pikirkan password "1234" vs "4321" — meski menggunakan angka yang sama, kedua password
          ini berbeda dan tidak saling membuka kunci. Dalam permutasi, <b>konteks menentukan apakah
          urutan bermakna</b>. Jabatan Ketua dan Sekretaris berbeda meski orangnya sama — itulah
          permutasi dalam kehidupan nyata.
        </p>

        <div className="rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-4">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">⚡ Tes cepat:</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Tanya dirimu sendiri, <i>"Apakah urutan A-B dan B-A menghasilkan hasil yang berbeda?"</i>
            Jika YA → Permutasi. Jika TIDAK → bukan Permutasi.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />

      {onNext && !clicked && !refleksiCompleted && (
        <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4 mt-4">
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95"
          >
            <CheckIcon />
            Lanjutkan
          </button>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// PART 6: REFLEKSI MINI (AI Feedback — Sequential Unlocking)
// ============================================================================

const REFLEKSI_PERMUTASI_QUESTIONS = [
  {
    key: "refleksi_permutasi_1",
    soal: "Apa yang membedakan permutasi dari sekadar menggunakan Kaidah Perkalian?",
  },
  {
    key: "refleksi_permutasi_2",
    soal: "Kapan kita menggunakan rumus permutasi dengan unsur yang sama?",
  },
  {
    key: "refleksi_permutasi_3",
    soal: "Kapan kita menggunakan rumus permutasi siklis?",
  },
  {
    key: "refleksi_permutasi_4",
    soal: "Mengapa P(n,n) = n! ? Jelaskan secara intuitif.",
  },
];

const TOTAL_REFLEKSI_PERMUTASI = REFLEKSI_PERMUTASI_QUESTIONS.length;

function RefleksiMini({ onComplete, readOnly = false, savedData }: { onComplete?: () => void; readOnly?: boolean; savedData?: Record<string, unknown> }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => REFLEKSI_PERMUTASI_QUESTIONS.map(() => ""));
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});
  const onCompleteCalled = useRef(false);
  const didSyncSavedData = useRef(false);

  // Sync savedData into state when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const refleksiData = savedData.refleksi as Record<string, { answer?: string; feedback?: string; isCorrect?: boolean }> | undefined;
    if (!refleksiData) return;

    const newAnswers = REFLEKSI_PERMUTASI_QUESTIONS.map(() => "");
    const newFeedback: Record<number, { text: string; isCorrect: boolean }> = {};
    let maxCompletedStep = -1;

    REFLEKSI_PERMUTASI_QUESTIONS.forEach((q, i) => {
      const entry = refleksiData[q.key];
      if (entry) {
        newAnswers[i] = entry.answer ?? "";
        newFeedback[i] = { text: entry.feedback ?? "Jawaban tersimpan.", isCorrect: entry.isCorrect ?? false };
        if (entry.isCorrect === true) {
          maxCompletedStep = i;
        }
      }
    });

    setAnswers(newAnswers);
    setFeedbackMap(newFeedback);

    // Set current step to after the last completed one
    if (maxCompletedStep >= 0 && maxCompletedStep < TOTAL_REFLEKSI_PERMUTASI - 1) {
      setCurrentStep(maxCompletedStep + 1);
    } else if (maxCompletedStep >= TOTAL_REFLEKSI_PERMUTASI - 1) {
      setCurrentStep(TOTAL_REFLEKSI_PERMUTASI - 1);
      onCompleteCalled.current = true;
    }

    didSyncSavedData.current = true;
  }, [savedData]);

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  async function handleSubmit(stepIndex: number) {
    const q = REFLEKSI_PERMUTASI_QUESTIONS[stepIndex];
    const answer = answers[stepIndex];

    if (!answer.trim()) {
      setFeedbackMap((prev) => ({
        ...prev,
        [stepIndex]: { text: "Tulis jawabanmu dulu ya! 📝", isCorrect: false },
      }));
      return;
    }

    setCheckingStep(stepIndex);

    try {
      const res = await fetch("/api/refleksi-mini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "permutasi_siklis",
          rows: [{ question_key: q.key, soal: q.soal, answer }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? `Server error (${res.status})`);
      }
      const data = await res.json();
      const result = data.feedback?.[q.key];

      const fb = {
        text: result?.feedback ?? "Jawaban tersimpan.",
        isCorrect: result?.isCorrect ?? false,
      };

      setFeedbackMap((prev) => ({ ...prev, [stepIndex]: fb }));

      if (fb.isCorrect && stepIndex < TOTAL_REFLEKSI_PERMUTASI - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Maaf, ada kendala. Coba lagi ya!";
      setFeedbackMap((prev) => ({
        ...prev,
        [stepIndex]: { text: message, isCorrect: false },
      }));
    } finally {
      setCheckingStep(null);
    }
  }

  const allComplete =
    currentStep >= TOTAL_REFLEKSI_PERMUTASI - 1 &&
    feedbackMap[TOTAL_REFLEKSI_PERMUTASI - 1]?.isCorrect === true;

  // Notify parent when all refleksi questions are complete
  useEffect(() => {
    if (allComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  if (allComplete) {
    return (
      <article>
        <SectionBadge>Refleksi Mini ✅</SectionBadge>

        <div className="flex flex-col gap-4">
          {REFLEKSI_PERMUTASI_QUESTIONS.map((q, i) => {
            const fb = feedbackMap[i];
            return (
              <div key={i} className="rounded-xl bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-[#663362]">
                  {i + 1}. {q.soal}
                </label>
                <div className="w-full rounded-lg border border-[#34673933] bg-[#F5F5F0] px-4 py-2.5 text-sm text-[#6B6B66]">
                  {answers[i]}
                </div>
                {fb && (
                  <div className={`mt-2 rounded-lg border p-2.5 ${fb.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                    <p className={`mb-0.5 text-xs font-medium ${fb.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                      {fb.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                    </p>
                    <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{fb.text}</RichText>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#346739] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">🎉 Refleksi selesai!</p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan semua pertanyaan refleksi. Pemahamanmu tentang permutasi semakin baik!
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article>
      <SectionBadge>Refleksi Mini</SectionBadge>

      {/* Progress */}
      <div className="mb-5">
        <p className="text-xs font-medium text-[#663362]">
          Pertanyaan {currentStep + 1} dari {TOTAL_REFLEKSI_PERMUTASI}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {REFLEKSI_PERMUTASI_QUESTIONS.map((_, i) => {
            const fb = feedbackMap[i];
            const isCompleted = fb?.isCorrect === true;
            const isActive = i === currentStep;
            let dotBg = "bg-[#E5E5E0]";
            let dotBorder = "border-[#C5C5C0]";
            if (isCompleted) { dotBg = "bg-[#346739]"; dotBorder = "border-[#346739]"; }
            else if (isActive) { dotBg = "bg-white"; dotBorder = "border-[#346739]"; }
            return (
              <React.Fragment key={i}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} text-[10px] font-bold transition-colors ${isCompleted ? "text-white" : isActive ? "text-[#346739]" : "text-[#9E9D99]"}`}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                {i < TOTAL_REFLEKSI_PERMUTASI - 1 && (
                  <div className={`h-0.5 flex-1 rounded transition-colors ${feedbackMap[i]?.isCorrect ? "bg-[#346739]" : "bg-[#E5E5E0]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Show completed + current questions */}
      <div className="flex flex-col gap-4">
        {REFLEKSI_PERMUTASI_QUESTIONS.map((q, i) => {
          if (i > currentStep) return null;
          const fb = feedbackMap[i];
          const isCurrent = i === currentStep;
          const isCompleted = fb?.isCorrect === true;
          const disabled = isCompleted;

          return (
            <div key={i} className="rounded-xl bg-white p-4">
              <label className="mb-2 block text-sm font-medium text-[#663362]">
                {i + 1}. {q.soal}
              </label>
              <textarea
                placeholder="Tulis jawabanmu..."
                value={answers[i]}
                disabled={disabled}
                onChange={(e) => updateAnswer(i, e.target.value)}
                rows={3}
                className={`w-full resize-y rounded-lg border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966] ${disabled ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : ""}`}
              />
              {fb && (
                <div className={`mt-2 rounded-lg border p-2.5 ${fb.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
                  <p className={`mb-0.5 text-xs font-medium ${fb.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
                    {fb.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
                  </p>
                  <RichText className="text-sm leading-relaxed text-[#2C2C2A]">{fb.text}</RichText>
                </div>
              )}

              {isCurrent && !isCompleted && (
                <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                  <button
                    type="button"
                    onClick={() => handleSubmit(i)}
                    disabled={checkingStep === i}
                    className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                  >
                    {checkingStep === i ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ============================================================================
// "Lihat Jawabanku" — Collapsible wrapper for pre-completed sections
// ============================================================================

/**
 * Wraps a DB-tracked section. When the section was already completed before
 * the current session (wasPreCompleted=true), shows a collapsed "Bagian ini
 * sudah selesai" view with a "Lihat jawabanku" button.
 *
 * Uses render-prop pattern: children receives derived savedData.
 */
function CollapsibleJawabanSection({
  sectionIndex,
  isCompleted,
  wasPreCompleted,
  jawabanData,
  loadingJawaban,
  onFetchJawaban,
  children,
}: {
  sectionIndex: number;
  isCompleted: boolean;
  wasPreCompleted: boolean;
  jawabanData: Record<string, JawabanEntry[]>;
  loadingJawaban: Record<string, boolean>;
  onFetchJawaban: (sectionIndex: number) => void;
  children: (savedData: Record<string, unknown> | undefined) => React.ReactNode;
}) {
  const key = String(sectionIndex);
  const entries = jawabanData[key];
  const isLoading = loadingJawaban[key] ?? false;
  const hasJawaban = entries !== undefined && entries.length > 0;
  const mapping = SECTION_CONCEPT_MAP[sectionIndex];

  if (!isCompleted) {
    return <>{children(undefined)}</>;
  }

  // Just completed in this session — show expanded immediately
  if (!wasPreCompleted) {
    return <>{children(undefined)}</>;
  }

  // Pre-completed + jawaban already loaded — pass savedData to children
  if (hasJawaban && mapping) {
    const savedData = entriesToSavedData(mapping.sectionName, entries);
    return <>{children(savedData)}</>;
  }

  // Pre-completed but jawaban not yet loaded — show collapsed view
  return (
    <div className="rounded-xl border border-dashed border-[#34673940] bg-[#F9FAF6] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#346739] text-[10px] font-bold text-white">
            ✓
          </div>
          <span className="text-sm font-medium text-[#2C2C2A]">Bagian ini sudah selesai</span>
        </div>
        <button
          type="button"
          onClick={() => onFetchJawaban(sectionIndex)}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-full border border-[#346739] px-5 py-2 text-sm font-medium text-[#346739] transition-colors hover:bg-[#34673908] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Memuat...
            </>
          ) : (
            "Lihat jawabanku"
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Export — Sequential Section Unlocking
// ============================================================================

export default function PermutasiContent({
  onComplete,
  initialCompletedSections = {},
}: {
  onComplete?: () => void;
  initialCompletedSections?: Record<number, boolean>;
}) {
  const onCompleteCalled = useRef(false);

  // ── Derive initial sub-states from backend data ──────────────────
  const contohDone = initialCompletedSections[9] === true;
  const refleksiDone = initialCompletedSections[10] === true;

  // ── Internal state for Contoh Soal + Mengapa Corner + Refleksi ──
  const [contohStep, setContohStep] = useState(contohDone ? 7 : 0);
  const [mengapaVisible, setMengapaVisible] = useState(contohDone);
  const [refleksiVisible, setRefleksiVisible] = useState(refleksiDone);

  // ── State untuk on-demand "Lihat jawabanku" ──────────────────
  const [jawabanData, setJawabanData] = useState<Record<string, JawabanEntry[]>>({});
  const [loadingJawaban, setLoadingJawaban] = useState<Record<string, boolean>>({});

  /** Fetch jawaban+feedback untuk satu section dari on-demand endpoint */
  async function fetchJawaban(sectionIndex: number) {
    const key = String(sectionIndex);
    if (loadingJawaban[key] || jawabanData[key]) return;

    const mapping = SECTION_CONCEPT_MAP[sectionIndex];
    if (!mapping) {
      console.error("[fetchJawaban] No mapping for section:", sectionIndex);
      return;
    }

    setLoadingJawaban((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(
        `/api/student-section-status/jawaban?concept_id=${mapping.conceptId}&section=${mapping.sectionName}`
      );
      if (!res.ok) {
        console.error("[fetchJawaban] Failed:", res.status);
        return;
      }
      const data: JawabanResponse = await res.json();
      setJawabanData((prev) => ({ ...prev, [key]: data.entries }));
    } catch (err) {
      console.error("[fetchJawaban] Error:", err);
    } finally {
      setLoadingJawaban((prev) => ({ ...prev, [key]: false }));
    }
  }

  // ── Build initial state dari data backend ───────────────────────
  function buildInitialState(): {
    currentSection: number;
    completedSections: Record<number, boolean>;
  } {
    const cs: Record<number, boolean> = { ...initialCompletedSections };

    // Penjelasan Konsep sections are read-only; infer from LATER sections only (backward)
    if (cs[3]) cs[2] = true;  // PK1 → inferred if next concept's eksplorasi (3) done
    if (cs[6]) cs[5] = true;  // PK2 → inferred if next concept's eksplorasi (6) done
    if (cs[9]) cs[8] = true;  // PK3 → inferred if contoh-soal (9) done

    // Cari section pertama yang belum complete
    let firstUncompleted = TOTAL_PERMUTASI_SECTIONS - 1;
    for (let i = 0; i < TOTAL_PERMUTASI_SECTIONS; i++) {
      if (!cs[i]) {
        firstUncompleted = i;
        break;
      }
    }

    return { currentSection: firstUncompleted, completedSections: cs };
  }

  const initState = buildInitialState();

  const [currentSection, setCurrentSection] = useState(initState.currentSection);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(
    initState.completedSections
  );

  // ── Sync initialCompletedSections from backend when it arrives ──
  const didSyncInitial = useRef(false);
  useEffect(() => {
    if (didSyncInitial.current) return;
    if (Object.keys(initialCompletedSections).length === 0) return;

    const rebuilt = buildInitialState();
    setCurrentSection(rebuilt.currentSection);
    setCompletedSections(rebuilt.completedSections);

    // Sync sub-states when restored from backend
    if (rebuilt.completedSections[9]) {
      setContohStep(7);
      setMengapaVisible(true);
      if (rebuilt.completedSections[10]) {
        setRefleksiVisible(true);
      }
    }

    didSyncInitial.current = true;
  }, [initialCompletedSections]);

  function markComplete(sectionIndex: number) {
    setCompletedSections((prev) => {
      const next = { ...prev, [sectionIndex]: true };
      // Auto-infer read-only penjelasan_konsep sections (backward only)
      if (sectionIndex === 3) next[2] = true;  // eksplorasi2 done → PK1 must be done
      if (sectionIndex === 6) next[5] = true;  // eksplorasi3 done → PK2 must be done
      if (sectionIndex === 9) next[8] = true;  // contoh-soal done → PK3 must be done
      return next;
    });
    if (sectionIndex < TOTAL_PERMUTASI_SECTIONS - 1) {
      setCurrentSection((prev) => Math.max(prev, sectionIndex + 1));
    }
  }

  function handleNext(sectionIndex: number) {
    markComplete(sectionIndex);
  }

  const isVisible = (i: number) => i <= currentSection;
  const isCompleted = (i: number) => completedSections[i] === true;
  const isActive = (i: number) => i === currentSection && !isCompleted(i);

  const allComplete = isCompleted(10);

  // Notify parent when all sections done
  useEffect(() => {
    if (allComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#346739] opacity-70">
          Materi 4
        </p>
        <h1 className="text-2xl font-bold text-[#1a3d1c]">Permutasi</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#5a7d5c]">
          Pelajari cara menghitung banyaknya susunan objek ketika urutan diperhatikan — dari
          permutasi dasar, permutasi dengan unsur sama, hingga permutasi siklis.
        </p>
      </div>

      <SectionProgress currentSection={currentSection} completedSections={completedSections} />

      {/* ── PART 1: Permutasi r Unsur dari n Unsur ────────────────── */}
      {(isVisible(0) || isVisible(1) || isVisible(2)) && (
        <div className="mt-2 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[#663362]">
            Bagian 1 — Permutasi r Unsur dari n Unsur
          </p>
        </div>
      )}

      {/* Section 0: Eksplorasi Kontekstual (c1) */}
      {isVisible(0) && (
        <CollapsibleJawabanSection
          sectionIndex={0}
          isCompleted={isCompleted(0)}
          wasPreCompleted={initialCompletedSections[0] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <EksplorasiKontekstual1
              readOnly={isCompleted(0)}
              savedData={savedData}
              onComplete={isActive(0) ? () => markComplete(0) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 1: Aktivitas Deep Learning (c1) */}
      {isVisible(1) && (
        <CollapsibleJawabanSection
          sectionIndex={1}
          isCompleted={isCompleted(1)}
          wasPreCompleted={initialCompletedSections[1] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <AktivitasDeepLearning1
              readOnly={isCompleted(1)}
              savedData={savedData}
              onComplete={isActive(1) ? () => markComplete(1) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 2: Penjelasan Konsep (c1) — read-only with Lanjutkan */}
      {isVisible(2) && (
        <PenjelasanKonsep1
          onNext={isActive(2) ? () => handleNext(2) : undefined}
        />
      )}

      {/* ── PART 2: Permutasi dengan Unsur yang Sama ─────────────── */}
      {(isVisible(3) || isVisible(4) || isVisible(5)) && (
        <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[#663362]">
            Bagian 2 — Permutasi dengan Unsur yang Sama
          </p>
        </div>
      )}

      {/* Section 3: Eksplorasi Kontekstual (c2) */}
      {isVisible(3) && (
        <CollapsibleJawabanSection
          sectionIndex={3}
          isCompleted={isCompleted(3)}
          wasPreCompleted={initialCompletedSections[3] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <EksplorasiKontekstual2
              readOnly={isCompleted(3)}
              savedData={savedData}
              onComplete={isActive(3) ? () => markComplete(3) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 4: Aktivitas Deep Learning (c2) */}
      {isVisible(4) && (
        <CollapsibleJawabanSection
          sectionIndex={4}
          isCompleted={isCompleted(4)}
          wasPreCompleted={initialCompletedSections[4] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <AktivitasDeepLearning2
              readOnly={isCompleted(4)}
              savedData={savedData}
              onComplete={isActive(4) ? () => markComplete(4) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 5: Penjelasan Konsep (c2) — read-only with Lanjutkan */}
      {isVisible(5) && (
        <PenjelasanKonsep2
          onNext={isActive(5) ? () => handleNext(5) : undefined}
        />
      )}

      {/* ── PART 3: Permutasi Siklis ─────────────────────────────── */}
      {(isVisible(6) || isVisible(7) || isVisible(8) || isVisible(9) || isVisible(10)) && (
        <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[#663362]">
            Bagian 3 — Permutasi Siklis
          </p>
        </div>
      )}

      {/* Section 6: Eksplorasi Kontekstual (c3) */}
      {isVisible(6) && (
        <CollapsibleJawabanSection
          sectionIndex={6}
          isCompleted={isCompleted(6)}
          wasPreCompleted={initialCompletedSections[6] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <EksplorasiKontekstual3
              readOnly={isCompleted(6)}
              savedData={savedData}
              onComplete={isActive(6) ? () => markComplete(6) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 7: Aktivitas Deep Learning (c3) */}
      {isVisible(7) && (
        <CollapsibleJawabanSection
          sectionIndex={7}
          isCompleted={isCompleted(7)}
          wasPreCompleted={initialCompletedSections[7] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <AktivitasDeepLearning3
              readOnly={isCompleted(7)}
              savedData={savedData}
              onComplete={isActive(7) ? () => markComplete(7) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 8: Penjelasan Konsep (c3) — read-only with Lanjutkan */}
      {isVisible(8) && (
        <PenjelasanKonsep3
          onNext={isActive(8) ? () => handleNext(8) : undefined}
        />
      )}

      {/* ── PART 4: Contoh Soal, Mengapa Corner, Refleksi ────────── */}
      {(isVisible(9) || isVisible(10)) && (
        <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[#663362]">
            Bagian 4 — Latihan & Refleksi
          </p>
        </div>
      )}

      {/* Section 9: Contoh Soal Bertahap (c3) */}
      {isVisible(9) && (
        <CollapsibleJawabanSection
          sectionIndex={9}
          isCompleted={isCompleted(9)}
          wasPreCompleted={initialCompletedSections[9] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <ContohSoalBertahap
              contohStep={contohStep}
              readOnly={isCompleted(9)}
              savedData={savedData}
              onSoalDone={() => {
                if (contohStep >= 6) {
                  setMengapaVisible(true);
                  markComplete(9);
                } else {
                  setContohStep((prev) => prev + 1);
                }
              }}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Mengapa Corner — appears after all 7 contoh soal done */}
      {isVisible(9) && mengapaVisible && (
        <MengapaCorner onNext={() => setRefleksiVisible(true)} refleksiCompleted={refleksiDone} />
      )}

      {/* Section 10: Refleksi Mini (c3) — gated by MengapaCorner Lanjutkan */}
      {isVisible(9) && refleksiVisible && (
        <CollapsibleJawabanSection
          sectionIndex={10}
          isCompleted={isCompleted(10)}
          wasPreCompleted={initialCompletedSections[10] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <RefleksiMini
              readOnly={isCompleted(10)}
              savedData={savedData}
              onComplete={() => markComplete(10)}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* All complete banner */}
      {allComplete && (
        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#346739] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">
              🎉 Semua bagian Permutasi selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan Eksplorasi, Deep Learning, Penjelasan Konsep, Contoh Soal,
              Mengapa Corner, dan Refleksi. Lanjutkan mengerjakan Asesmen Formatif Materi Permutasi!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Named exports for potential reuse
export {
  EksplorasiKontekstual1,
  AktivitasDeepLearning1,
  PenjelasanKonsep1,
  EksplorasiKontekstual2,
  AktivitasDeepLearning2,
  PenjelasanKonsep2,
  EksplorasiKontekstual3,
  AktivitasDeepLearning3,
  PenjelasanKonsep3,
  ContohSoalBertahap,
  MengapaCorner,
  RefleksiMini,
};
