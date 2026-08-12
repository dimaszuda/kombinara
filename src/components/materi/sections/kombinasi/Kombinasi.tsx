"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { SectionBadge } from "@/components/ui/Materi";
import { RichText } from "@/components/shared/RichText";
import { CheckIcon } from "@/components/ui/IconButton";

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
  0: { conceptId: "kombinasi", sectionName: "eksplorasi_kontekstual" },
  1: { conceptId: "kombinasi", sectionName: "aktivitas_deep_learning" },
  3: { conceptId: "kombinasi", sectionName: "contoh_soal" },
  4: { conceptId: "kombinasi", sectionName: "mengapa_corner" },
  6: { conceptId: "kombinasi", sectionName: "refleksi_mini" },
};

/** Saved data shapes per section for kombinasi */
interface KombinasiSavedData {
  eksplorasi?: { selectedAnswer: string; feedback: string | null; isCorrect: boolean };
  deepLearning?: {
    step1?: { answer: Record<string, string>; feedback: string | null; isCorrect: boolean };
    step2?: { answer: Record<string, string>; feedback: string | null; isCorrect: boolean };
    step3?: { answer: Record<string, string>; feedback: string | null; isCorrect: boolean };
  };
  contohSoal?: Record<string, { answer: Record<string, string>; isCorrect: boolean }>;
  mengapa?: { jawaban: string; feedback: string | null; isCorrect: boolean | null };
  refleksi?: Record<string, { answer: string; feedback: string | null; isCorrect: boolean | null }>;
}

/** Safely parse answer from DB */
function safeParseAnswer(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

/**
 * Transform raw API entries into a section-specific savedData shape.
 */
function entriesToSavedData(
  sectionName: string,
  entries: JawabanEntry[],
): Partial<KombinasiSavedData> {
  if (!entries || entries.length === 0) return {};

  switch (sectionName) {
    // ── eksplorasi_kontekstual ──────────────────────────────────
    case "eksplorasi_kontekstual": {
      for (const e of entries) {
        if (e.questionKey === "tim_basket_urutan") {
          const ans = typeof e.answer === "string" ? e.answer : "";
          return {
            eksplorasi: {
              selectedAnswer: ans,
              feedback: e.feedback,
              isCorrect: e.isCorrect === true,
            },
          };
        }
      }
      return {};
    }
    // ── aktivitas_deep_learning ─────────────────────────────────
    case "aktivitas_deep_learning": {
      const dl: KombinasiSavedData["deepLearning"] = {};
      for (const e of entries) {
        const raw = safeParseAnswer(e.answer);
        if (!raw) continue;
        // Strip question_key marker from answer data
        const { question_key, ...answerData } = raw;
        const cleanAnswer = answerData as Record<string, string>;

        if (e.questionKey === "step_1") {
          dl.step1 = {
            answer: cleanAnswer,
            feedback: e.feedback,
            isCorrect: e.isCorrect === true,
          };
        } else if (e.questionKey === "step_2") {
          dl.step2 = {
            answer: cleanAnswer,
            feedback: e.feedback,
            isCorrect: e.isCorrect === true,
          };
        } else if (e.questionKey === "step_3") {
          dl.step3 = {
            answer: cleanAnswer,
            feedback: e.feedback,
            isCorrect: e.isCorrect === true,
          };
        }
      }
      return { deepLearning: dl };
    }
    // ── contoh_soal ─────────────────────────────────────────────
    case "contoh_soal": {
      const data: KombinasiSavedData["contohSoal"] = {};
      for (const e of entries) {
        // Handle both object answers (c1, c2, c3 calc) and string answers (c3_reason)
        let answer: Record<string, string>;
        if (typeof e.answer === "string") {
          // String answer (e.g. c3_reason) — wrap in a key
          answer = { _text: e.answer };
        } else {
          const ans = safeParseAnswer(e.answer);
          answer = (ans as Record<string, string>) ?? {};
        }
        data[e.questionKey] = {
          answer,
          isCorrect: e.isCorrect === true,
        };
      }
      return { contohSoal: data };
    }
    // ── mengapa_corner ──────────────────────────────────────────
    case "mengapa_corner": {
      const entry = entries[0];
      if (!entry) return {};
      return {
        mengapa: {
          jawaban: typeof entry.answer === "string" ? entry.answer : JSON.stringify(entry.answer ?? ""),
          feedback: entry.feedback,
          isCorrect: entry.isCorrect,
        },
      };
    }
    // ── refleksi_mini ───────────────────────────────────────────
    case "refleksi_mini": {
      const data: KombinasiSavedData["refleksi"] = {};
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
      return {};
  }
}

// ============================================================================
// API Helper
// ============================================================================

type SaveResult = { isCorrect: boolean; feedback: string | null };

async function saveAnswer(params: {
  section: string;
  questionKey: string;
  answer: unknown;
  soal?: string;
  isFinalInSection?: boolean;
  action?: string;
}): Promise<SaveResult> {
  try {
    const res = await fetch("/api/kombinasi/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Gagal menyimpan");
    }
    const data = await res.json();
    return { isCorrect: data.isCorrect, feedback: data.feedback };
  } catch (e) {
    console.error("[saveAnswer]", e);
    return { isCorrect: false, feedback: "Gagal terhubung ke server. Coba lagi ya!" };
  }
}

// ============================================================================
// Shared: Simpan Jawaban Button
// ============================================================================

function SaveButton({
  onClick,
  disabled = false,
  loading = false,
  saved = false,
  hidden = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  saved?: boolean;
  hidden?: boolean;
}) {
  if (saved || hidden) return null;

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
// Shared: Lanjutkan Button (for read-only sections)
// ============================================================================

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

// ============================================================================
// Shared: Inline Input Blank
// ============================================================================

function InputBlank({
  value,
  onChange,
  placeholder = "...",
  className = "",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`inline-block rounded-md border-2 border-[#34673933] bg-white px-2 py-0.5 text-center text-sm font-medium text-[#663362] placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66] ${className}`}
      style={{ minWidth: "44px", maxWidth: "80px" }}
    />
  );
}

// ============================================================================
// Shared: Saved confirmation (general — never reveals the correct answer)
// ============================================================================

function SavedBadge({ text = "Jawaban tersimpan!" }: { text?: string }) {
  return (
    <div className="mt-3 rounded-lg border border-[#34673933] bg-[#DBFFD5]/20 p-3">
      <p className="text-sm font-medium text-[#346739]">✅ {text}</p>
    </div>
  );
}

// ============================================================================
// Shared: Image Placeholder
// Dipakai untuk semua "Instruksi AI - Buat gambar ilustrasi..." di dokumen sumber.
// Box abu-abu + icon + label, siap ditukar dengan aset gambar asli nanti.
// ============================================================================

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#9E9D99] bg-[#F5F5F0] px-4 py-8 text-center">
      <svg
        className="h-10 w-10 text-[#9E9D99]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p className="text-xs font-medium text-[#6B6B66]">{label}</p>
    </div>
  );
}

// ============================================================================
// Shared: Contoh Soal Card
// ============================================================================

function ContohSoalCard({
  level,
  number,
  title,
  children,
}: {
  level: "mudah" | "sedang" | "hots";
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  const levelColors: Record<string, { bg: string; text: string; border: string }> = {
    mudah: { bg: "bg-[#DBFFD5]/60", text: "text-[#346739]", border: "border-[#34673926]" },
    sedang: { bg: "bg-[#FFF3E6]/60", text: "text-[#B86E2D]", border: "border-[#B86E2D26]" },
    hots: { bg: "bg-[#FFE6E6]/60", text: "text-[#C44F4F]", border: "border-[#C44F4F26]" },
  };

  const c = levelColors[level] ?? levelColors.mudah;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
          {level.toUpperCase()}
        </span>
        <h3 className="text-base font-bold text-[#2C2C2A]">
          📝 Contoh {number}: {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Progress Indicator (simplified — no sequential unlocking tracking for now)
// ============================================================================

const TOTAL_SECTIONS = 7;

const SECTION_LABELS = [
  "Eksplorasi Kontekstual",
  "Aktivitas Deep Learning",
  "Penjelasan Konsep",
  "Contoh Soal Bertahap",
  "Mengapa? Corner",
  "Permutasi vs Kombinasi",
  "Refleksi Mini",
] as const;

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
        Bagian {currentSection + 1} dari {TOTAL_SECTIONS}
      </p>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
          const isActive = i === currentSection;
          const isCompleted = completedSections[i] === true;

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
                title={SECTION_LABELS[i]}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              {i < TOTAL_SECTIONS - 1 && (
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
// 1. Eksplorasi Kontekstual
// ============================================================================

function EksplorasiKontekstual({
  onComplete,
  readOnly = false,
  savedData,
}: {
  onComplete?: () => void;
  readOnly?: boolean;
  savedData?: KombinasiSavedData["eksplorasi"];
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(savedData?.selectedAnswer ?? null);
  const [savedCorrect, setSavedCorrect] = useState(savedData?.isCorrect === true);
  const [showFeedback, setShowFeedback] = useState(!!savedData?.feedback);
  const [feedbackText, setFeedbackText] = useState<string | null>(savedData?.feedback ?? null);
  const [saving, setSaving] = useState(false);

  // Sync savedData when it arrives (e.g. from "Lihat jawabanku")
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    setSelectedAnswer(savedData.selectedAnswer ?? null);
    setSavedCorrect(savedData.isCorrect === true);
    setFeedbackText(savedData.feedback ?? null);
    setShowFeedback(!!savedData.feedback);
    didSyncSavedData.current = true;
  }, [savedData]);

  const handleSave = async () => {
    if (!selectedAnswer) return;
    setSaving(true);
    const result = await saveAnswer({
      section: "eksplorasi_kontekstual",
      questionKey: "tim_basket_urutan",
      answer: selectedAnswer,
      isFinalInSection: true,
    });
    setSaving(false);
    setShowFeedback(true);
    setFeedbackText(result.feedback);
    if (result.isCorrect) {
      setSavedCorrect(true);
      if (onComplete) onComplete();
    }
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setFeedbackText(null);
    setSelectedAnswer(null);
  };

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>

        <img
          src="/images/basketball members.jpg"
          alt="Ilustrasi: Tim Basket — Memilih 5 Pemain dari 10 Kandidat"
          className="mb-4 max-w-md w-full mx-auto rounded-xl object-cover max-h-60"
        />

        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Tim basket membutuhkan 5 pemain dari 10 kandidat yang ada. Tidak ada perbedaan posisi — semua pemain memiliki peran setara. Berapa banyak tim berbeda yang bisa dibentuk?
        </p>

        <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
          <p className="text-sm font-medium text-[#346739] mb-3">
            1. Apakah tim {"{Ari, Budi, Cici, Deni, Eka}"} berbeda dengan tim {"{Eka, Deni, Cici, Budi, Ari}"}?
          </p>
          <div className="flex gap-3">
            {["Ya", "Tidak"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => !savedCorrect && !readOnly && setSelectedAnswer(opt)}
                disabled={savedCorrect || readOnly}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  selectedAnswer === opt
                    ? savedCorrect
                      ? "bg-[#346739] text-white"
                      : "bg-[#346739] text-white"
                    : savedCorrect || readOnly
                      ? "bg-[#34673915] text-[#346739]/50"
                      : "bg-[#34673915] text-[#346739] hover:bg-[#34673926]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback setelah simpan — hanya muncul setelah klik Simpan */}
        {showFeedback && feedbackText && (
          <div className="mt-4 space-y-3">
            <div className={`rounded-lg border p-4 ${savedCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
              <p className={`text-sm font-semibold mb-1 ${savedCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                {savedCorrect ? "✅ Benar!" : "❌ Belum tepat"}
              </p>
              <p className="text-sm leading-relaxed text-[#2C2C2A]">{feedbackText}</p>
            </div>
          </div>
        )}

        {/* Tombol: Simpan atau Coba Lagi */}
        {!savedCorrect && !readOnly && (
          <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
            {showFeedback && !savedCorrect && (
              <p className="text-sm text-[#C44F4F] font-medium">
                Jawabanmu belum tepat. Silakan ubah pilihan dan coba lagi.
              </p>
            )}
            <button
              type="button"
              onClick={showFeedback && !savedCorrect ? handleRetry : handleSave}
              disabled={!selectedAnswer || saving}
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
                  {showFeedback && !savedCorrect ? "Coba Lagi" : "Simpan Jawaban"}
                </>
              )}
            </button>
          </div>
        )}

        {savedCorrect && <SavedBadge />}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 2. Aktivitas Deep Learning
// Simulasi interaktif click-to-select untuk menggantikan "geser lalu tempelkan"
// ============================================================================

type Susunan = { id: string; a1: string; a2: string; label: string };

const ALL_SUSUNAN: Susunan[] = [
  { id: "AB", a1: "A", a2: "B", label: "AB" },
  { id: "AC", a1: "A", a2: "C", label: "AC" },
  { id: "AD", a1: "A", a2: "D", label: "AD" },
  { id: "BA", a1: "B", a2: "A", label: "BA" },
  { id: "BC", a1: "B", a2: "C", label: "BC" },
  { id: "BD", a1: "B", a2: "D", label: "BD" },
  { id: "CA", a1: "C", a2: "A", label: "CA" },
  { id: "CB", a1: "C", a2: "B", label: "CB" },
  { id: "CD", a1: "C", a2: "D", label: "CD" },
  { id: "DA", a1: "D", a2: "A", label: "DA" },
  { id: "DB", a1: "D", a2: "B", label: "DB" },
  { id: "DC", a1: "D", a2: "C", label: "DC" },
];

// Pasangan anggota (tanpa urutan) yang membentuk satu tim yang sama
function pairKey(s: Susunan) {
  return [s.a1, s.a2].sort().join("");
}

// Simulasi "geser lalu tempelkan" — pelengkap interaktif untuk Langkah 1
// (sesuai instruksi AI di dokumen sumber), TIDAK menggantikan tabel maupun Langkah 2.
function GeserTempelSimulator() {
  const [selected, setSelected] = useState<string[]>([]);
  const [groupedPairs, setGroupedPairs] = useState<string[][]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const groupedIds = useMemo(() => new Set(groupedPairs.flat()), [groupedPairs]);
  const isComplete = groupedPairs.length === 6;

  const toggleCard = (id: string) => {
    if (groupedIds.has(id)) return;
    setFeedback(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const checkPair = () => {
    if (selected.length !== 2) return;
    const [idA, idB] = selected;
    const susA = ALL_SUSUNAN.find((s) => s.id === idA)!;
    const susB = ALL_SUSUNAN.find((s) => s.id === idB)!;

    if (idA !== idB && pairKey(susA) === pairKey(susB)) {
      setGroupedPairs((prev) => [...prev, [idA, idB]]);
      setSelected([]);
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  return (
    <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/10 p-4">
      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        🎮 <b>Simulasi:</b> klik dua kartu susunan yang menurutmu memiliki anggota yang sama, lalu
        tekan &ldquo;Tempelkan&rdquo;.
      </p>

      <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {ALL_SUSUNAN.map((s) => {
          const isGrouped = groupedIds.has(s.id);
          const isSelected = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleCard(s.id)}
              disabled={isGrouped}
              className={`flex h-12 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors ${
                isGrouped
                  ? "border-[#346739] bg-[#346739] text-white opacity-60"
                  : isSelected
                    ? "border-[#663362] bg-[#663362] text-white"
                    : "border-[#34673933] bg-white text-[#2C2C2A] hover:border-[#346739]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={checkPair}
          disabled={selected.length !== 2}
          className="rounded-full bg-[#663362] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f2650] disabled:pointer-events-none disabled:opacity-40"
        >
          Tempelkan
        </button>
        <p className="text-sm text-[#6B6B66]">
          {groupedPairs.length} dari 6 pasangan ditemukan
        </p>
      </div>

      {feedback === "incorrect" && (
        <p className="mt-2 text-sm font-medium text-[#C44F4F]">
          Belum tepat, coba periksa lagi anggotanya lalu pilih ulang.
        </p>
      )}
      {feedback === "correct" && !isComplete && (
        <p className="mt-2 text-sm font-medium text-[#346739]">
          Tepat! Lanjutkan ke pasangan berikutnya.
        </p>
      )}
      {isComplete && (
        <p className="mt-2 text-sm font-medium text-[#346739]">
          Semua susunan sudah kamu kelompokkan. Lanjutkan ke Langkah 2 di bawah untuk mencatat
          hasilnya.
        </p>
      )}
    </div>
  );
}

function AktivitasDeepLearning({
  onComplete,
  readOnly = false,
  savedData,
}: {
  onComplete?: () => void;
  readOnly?: boolean;
  savedData?: KombinasiSavedData["deepLearning"];
}) {
  // Step 1: Permutation table (all 12 susunan — rows 8-12 have 3 inputs each: a1, a2, susunan)
  const [permTable, setPermTable] = useState<Record<string, string>>(
    savedData?.step1?.answer ? { ...savedData.step1.answer } : {
      p8: "",
      p9a: "", p9b: "", p9c: "",
      p10a: "", p10b: "", p10c: "",
      p11a: "", p11b: "", p11c: "",
      p12a: "", p12b: "", p12c: "",
    }
  );

  // Step 2: Group pairs
  const [groups, setGroups] = useState<Record<string, string>>(
    savedData?.step2?.answer ? { ...savedData.step2.answer } : {
      g1: "", g2: "", g3: "", g4: "",
    }
  );

  // Step 3: Count
  const [totalGroups, setTotalGroups] = useState(savedData?.step3?.answer?.totalGroups ?? "");
  const [verification, setVerification] = useState(savedData?.step3?.answer?.verification ?? "");

  // Individual save states
  const [savedStep1, setSavedStep1] = useState(savedData?.step1?.isCorrect === true);
  const [savedStep2, setSavedStep2] = useState(savedData?.step2?.isCorrect === true);
  const [savedStep3, setSavedStep3] = useState(savedData?.step3?.isCorrect === true);
  const [saving, setSaving] = useState(false);
  const [feedbackStep1, setFeedbackStep1] = useState<string | null>(savedData?.step1?.feedback ?? null);
  const [feedbackStep2, setFeedbackStep2] = useState<string | null>(savedData?.step2?.feedback ?? null);
  const [feedbackStep3, setFeedbackStep3] = useState<string | null>(savedData?.step3?.feedback ?? null);
  const [step1Correct, setStep1Correct] = useState(savedData?.step1?.isCorrect === true);
  const [step2Correct, setStep2Correct] = useState(savedData?.step2?.isCorrect === true);
  const [step3Correct, setStep3Correct] = useState(savedData?.step3?.isCorrect === true);

  // Sync savedData when it arrives (e.g. from "Lihat jawabanku")
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    if (savedData.step1) {
      setPermTable({ ...savedData.step1.answer });
      setSavedStep1(savedData.step1.isCorrect === true);
      setFeedbackStep1(savedData.step1.feedback);
      setStep1Correct(savedData.step1.isCorrect);
    }
    if (savedData.step2) {
      setGroups({ ...savedData.step2.answer });
      setSavedStep2(savedData.step2.isCorrect === true);
      setFeedbackStep2(savedData.step2.feedback);
      setStep2Correct(savedData.step2.isCorrect);
    }
    if (savedData.step3) {
      setTotalGroups(savedData.step3.answer?.totalGroups ?? "");
      setVerification(savedData.step3.answer?.verification ?? "");
      setSavedStep3(savedData.step3.isCorrect === true);
      setFeedbackStep3(savedData.step3.feedback);
      setStep3Correct(savedData.step3.isCorrect);
    }
    didSyncSavedData.current = true;
  }, [savedData]);

  const setPerm = useCallback(
    (key: string) => (v: string) => setPermTable((p) => ({ ...p, [key]: v })),
    [],
  );
  const setGroup = useCallback(
    (key: string) => (v: string) => setGroups((p) => ({ ...p, [key]: v })),
    [],
  );

  const allStep1Filled = Object.values(permTable).every((v) => v.trim() !== "");
  const allStep2Filled = Object.values(groups).every((v) => v.trim() !== "");

  const handleSaveStep1 = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "aktivitas_deep_learning",
      questionKey: "step_1",
      answer: permTable,
      isFinalInSection: false,
    });
    setSaving(false);
    setFeedbackStep1(result.feedback);
    setStep1Correct(result.isCorrect);
    if (result.isCorrect) {
      setSavedStep1(true);
    }
  };

  const handleSaveStep2 = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "aktivitas_deep_learning",
      questionKey: "step_2",
      answer: groups,
      isFinalInSection: false,
    });
    setSaving(false);
    setFeedbackStep2(result.feedback);
    setStep2Correct(result.isCorrect);
    if (result.isCorrect) {
      setSavedStep2(true);
    }
  };

  const handleSaveStep3 = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "aktivitas_deep_learning",
      questionKey: "step_3",
      answer: { totalGroups, verification },
      isFinalInSection: true,
    });
    setSaving(false);
    setFeedbackStep3(result.feedback);
    setStep3Correct(result.isCorrect);
    if (result.isCorrect) {
      setSavedStep3(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <p className="mb-4 text-xl font-semibold text-[#346739]">
          🔍 Eksplorasi: Hilangkan Urutan yang Berlebihan!
        </p>
        <p className="mb-4 leading-relaxed text-[#2C2C2A]">
          Dari 4 orang {"{A, B, C, D}"}, buat semua kelompok 2 orang:
        </p>

        {/* ── Step 1: Daftar permutasi ─────────────────────────── */}
        <div className="mb-6">
          <h4 className="mb-3 text-base font-semibold text-[#2C2C2A]">
            Langkah 1: Daftar semua permutasi 2 dari 4 orang
          </h4>
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-3">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#B8E6BC]">
                  <th className="px-3 py-3 text-center font-semibold text-[#2C2C2A] w-20">Susunan Ke-</th>
                  <th className="px-3 py-3 text-center font-semibold text-[#2C2C2A]">Anggota 1</th>
                  <th className="px-3 py-3 text-center font-semibold text-[#2C2C2A]">Anggota 2</th>
                  <th className="px-3 py-3 text-center font-semibold text-[#2C2C2A] w-24">Susunan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {/* Rows 1-7: pre-filled */}
                {[
                  { n: 1, a1: "A", a2: "B", s: "AB" },
                  { n: 2, a1: "A", a2: "C", s: "AC" },
                  { n: 3, a1: "A", a2: "D", s: "AD" },
                  { n: 4, a1: "B", a2: "A", s: "BA" },
                  { n: 5, a1: "B", a2: "C", s: "BC" },
                  { n: 6, a1: "B", a2: "D", s: "BD" },
                  { n: 7, a1: "C", a2: "A", s: "CA" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-3 py-3 text-center font-medium text-[#346739]">{row.n}</td>
                    <td className="px-3 py-3 text-center font-medium text-[#2C2C2A]">{row.a1}</td>
                    <td className="px-3 py-3 text-center font-medium text-[#2C2C2A]">{row.a2}</td>
                    <td className="px-3 py-3 text-center font-bold text-[#663362]">{row.s}</td>
                  </tr>
                ))}
                {/* Row 8 */}
                <tr className="bg-white">
                  <td className="px-3 py-3 text-center font-medium text-[#346739]">8</td>
                  <td className="px-3 py-3 text-center font-medium text-[#2C2C2A]">C</td>
                  <td className="px-3 py-3 text-center font-medium text-[#2C2C2A]">B</td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p8"] ?? ""} onChange={setPerm("p8")} disabled={savedStep1 || readOnly} />
                  </td>
                </tr>
                {/* Row 9 */}
                <tr className="bg-[#DBFFD5]/30">
                  <td className="px-3 py-3 text-center font-medium text-[#346739]">9</td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p9a"] ?? ""} onChange={setPerm("p9a")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p9b"] ?? ""} onChange={setPerm("p9b")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p9c"] ?? ""} onChange={setPerm("p9c")} disabled={savedStep1 || readOnly} className="w-14" />
                  </td>
                </tr>
                {/* Row 10 */}
                <tr className="bg-white">
                  <td className="px-3 py-3 text-center font-medium text-[#346739]">10</td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p10a"] ?? ""} onChange={setPerm("p10a")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p10b"] ?? ""} onChange={setPerm("p10b")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p10c"] ?? ""} onChange={setPerm("p10c")} disabled={savedStep1 || readOnly} className="w-14" />
                  </td>
                </tr>
                {/* Row 11 */}
                <tr className="bg-[#DBFFD5]/30">
                  <td className="px-3 py-3 text-center font-medium text-[#346739]">11</td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p11a"] ?? ""} onChange={setPerm("p11a")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p11b"] ?? ""} onChange={setPerm("p11b")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p11c"] ?? ""} onChange={setPerm("p11c")} disabled={savedStep1 || readOnly} className="w-14" />
                  </td>
                </tr>
                {/* Row 12 */}
                <tr className="bg-white">
                  <td className="px-3 py-3 text-center font-medium text-[#346739]">12</td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p12a"] ?? ""} onChange={setPerm("p12a")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p12b"] ?? ""} onChange={setPerm("p12b")} disabled={savedStep1 || readOnly} className="w-12" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <InputBlank value={permTable["p12c"] ?? ""} onChange={setPerm("p12c")} disabled={savedStep1 || readOnly} className="w-14" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[#2C2C2A] mb-2">
            AB, AC, AD, BA, BC, BD, CA, CB, CD, DA, DB, DC → <b>12 susunan</b>
          </p>

          {/* Simulasi interaktif "geser lalu tempelkan" sesuai instruksi AI */}
          <div className="mb-3">
            <GeserTempelSimulator />
          </div>

          <SaveButton onClick={handleSaveStep1} disabled={!allStep1Filled || saving} saved={savedStep1} hidden={readOnly} />
          {feedbackStep1 && (
            <div className={`mt-2 rounded-lg border p-3 ${step1Correct ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
              <p className={`text-sm font-semibold mb-1 ${step1Correct ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                {step1Correct ? "✅ Benar!" : "❌ Belum tepat"}
              </p>
              <p className="text-sm text-[#2C2C2A]">{feedbackStep1}</p>
            </div>
          )}
          {savedStep1 && <SavedBadge />}
        </div>

        {/* ── Step 2: Pengelompokan ──────────────────────────────── */}
        {savedStep1 && (
          <div className="mb-6">
            <h4 className="mb-3 text-base font-semibold text-[#2C2C2A]">
              Langkah 2: Kelompokkan susunan yang membentuk tim yang sama
            </h4>
            <div className="space-y-2 rounded-lg bg-[#DBFFD5]/20 p-4">
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{AB, BA}"}</span>
                <span>→</span>
                <span>Tim AB = Tim BA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{AC, CA}"}</span>
                <span>→</span>
                <span>Tim AC = Tim CA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{AD, DA}"}</span>
                <span>→</span>
                <InputBlank value={groups["g1"] ?? ""} onChange={setGroup("g1")} disabled={savedStep2 || readOnly} className="w-32" />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{BC, CB}"}</span>
                <span>→</span>
                <InputBlank value={groups["g2"] ?? ""} onChange={setGroup("g2")} disabled={savedStep2 || readOnly} className="w-32" />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{BD, DB}"}</span>
                <span>→</span>
                <InputBlank value={groups["g3"] ?? ""} onChange={setGroup("g3")} disabled={savedStep2 || readOnly} className="w-32" />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>{"{CD, DC}"}</span>
                <span>→</span>
                <InputBlank value={groups["g4"] ?? ""} onChange={setGroup("g4")} disabled={savedStep2 || readOnly} className="w-32" />
              </div>
            </div>

            <SaveButton onClick={handleSaveStep2} disabled={!allStep2Filled || saving} saved={savedStep2} hidden={readOnly} />
            {feedbackStep2 && (
              <div className={`mt-2 rounded-lg border p-3 ${step2Correct ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
                <p className={`text-sm font-semibold mb-1 ${step2Correct ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                  {step2Correct ? "✅ Benar!" : "❌ Belum tepat"}
                </p>
                <p className="text-sm text-[#2C2C2A]">{feedbackStep2}</p>
              </div>
            )}
            {savedStep2 && <SavedBadge />}
          </div>
        )}

        {/* ── Step 3: Hitung & Verifikasi ────────────────────────── */}
        {savedStep2 && (
          <div className="mb-4">
            <h4 className="mb-3 text-base font-semibold text-[#2C2C2A]">
              Langkah 3: Hitung total kelompok yang benar-benar berbeda
            </h4>
            <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A]">
                <span>Total kelompok berbeda =</span>
                <InputBlank value={totalGroups} onChange={setTotalGroups} disabled={savedStep3 || readOnly} className="w-16" />
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2C2C2A] flex-wrap">
                <span>Verifikasi: 12 susunan / 2! =</span>
                <InputBlank value={verification} onChange={setVerification} disabled={savedStep3 || readOnly} className="w-16" />
                <span>(karena setiap kelompok 2 orang dihitung 2! = 2 kali)</span>
              </div>
            </div>

            {savedStep3 && (
              <div className="mt-3 rounded-lg border border-[#34673933] bg-[#DBFFD5]/20 p-3">
                <p className="text-sm font-medium text-[#346739]">
                  🔗 Perhatikan hubungannya: <b>Kombinasi = Permutasi / Faktorial urutan</b>
                </p>
              </div>
            )}

            <SaveButton
              onClick={handleSaveStep3}
              disabled={!totalGroups.trim() || !verification.trim() || saving}
              saved={savedStep3}
              hidden={readOnly}
            />
            {feedbackStep3 && (
              <div className={`mt-2 rounded-lg border p-3 ${step3Correct ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
                <p className={`text-sm font-semibold mb-1 ${step3Correct ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                  {step3Correct ? "✅ Benar!" : "❌ Belum tepat"}
                </p>
                <p className="text-sm text-[#2C2C2A]">{feedbackStep3}</p>
              </div>
            )}
            {savedStep3 && <SavedBadge />}
          </div>
        )}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 3. Penjelasan Konsep (READ-ONLY)
// ============================================================================

function PenjelasanKonsep({ onNext }: { onNext?: () => void }) {
  const [completing, setCompleting] = useState(false);

  const handleNext = async () => {
    setCompleting(true);
    try {
      await saveAnswer({
        section: "penjelasan_konsep",
        questionKey: "_complete",
        answer: {},
        isFinalInSection: true,
        action: "complete",
      });
    } catch { /* ignore */ }
    setCompleting(false);
    if (onNext) onNext();
  };

  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      {/* Definisi */}
      <div className="rounded-xl bg-white p-5 mb-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Definisi Kombinasi</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          <b>Kombinasi</b> adalah pemilihan objek-objek dari sekelompok objek <b>tanpa memperhatikan urutan</b>.
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <p className="font-bold text-[#663362]">
            Rumus Kombinasi <RichText>{"$r$"}</RichText> dari <RichText>{"$n$"}</RichText> objek:
          </p>
          <RichText>
            {"$$C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!} = \\frac{P(n,r)}{r!}$$"}
          </RichText>
        </div>
      </div>

      {/* Intuisi Rumus */}
      <div className="rounded-xl bg-white p-5 mb-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">🧠 Intuisi Rumus</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#663362] text-xs font-bold text-white shrink-0 mt-0.5">1</span>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">
              Mulai dari semua permutasi <RichText>{"$P(n,r) = \\frac{n!}{(n-r)!}$"}</RichText>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#663362] text-xs font-bold text-white shrink-0 mt-0.5">2</span>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">
              Karena urutan tidak penting, <b>bagi dengan banyaknya cara menyusun r objek yang dipilih</b>: <RichText>{"$r!$"}</RichText>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#663362] text-xs font-bold text-white shrink-0 mt-0.5">3</span>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">
              Hasilnya: <RichText>{"$C(n,r) = \\frac{n!}{r!(n-r)!}$"}</RichText>
            </p>
          </div>
        </div>
      </div>

      {/* Sifat-sifat */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📋 Sifat – Sifat Kombinasi</h3>
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#663362]">
                <th className="px-4 py-3 text-left font-semibold text-white">Sifat</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Rumus</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Makna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              <tr className="bg-white">
                <td className="px-4 py-3 font-medium text-[#346739]">Simetri</td>
                <td className="px-4 py-3 font-mono text-[#663362]">
                  <RichText>{"$C(n,r) = C(n, n-r)$"}</RichText>
                </td>
                <td className="px-4 py-3 text-[#2C2C2A]">Memilih r sama dengan memilih n−r</td>
              </tr>
              <tr className="bg-[#DBFFD5]/30">
                <td className="px-4 py-3 font-medium text-[#346739]">Ujung</td>
                <td className="px-4 py-3 font-mono text-[#663362]">
                  <RichText>{"$C(n,0) = C(n,n) = 1$"}</RichText>
                </td>
                <td className="px-4 py-3 text-[#2C2C2A]">Ada 1 cara memilih semua atau tidak ada</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 font-medium text-[#346739]">Pascal</td>
                <td className="px-4 py-3 font-mono text-[#663362]">
                  <RichText>{"$C(n,r) = C(n-1, r-1) + C(n-1, r)$"}</RichText>
                </td>
                <td className="px-4 py-3 text-[#2C2C2A]">Segitiga Pascal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
      {onNext && <NextButton onClick={handleNext} loading={completing} />}
    </article>
  );
}

// ============================================================================
// 4. Contoh Soal Bertahap
// ============================================================================

function ContohSoalBertahap({
  onComplete,
  readOnly = false,
  savedData,
}: {
  onComplete?: () => void;
  readOnly?: boolean;
  savedData?: KombinasiSavedData["contohSoal"];
}) {
  const [soal1Saved, setSoal1Saved] = useState(() => savedData?.["c1"]?.isCorrect === true);
  const [soal2Saved, setSoal2Saved] = useState(() => savedData?.["c2"]?.isCorrect === true);
  const [soal3Saved, setSoal3Saved] = useState(() => savedData?.["c3"]?.isCorrect === true);
  const [reasonDone, setReasonDone] = useState(false);

  // Sync savedData when it arrives (e.g. from "Lihat jawabanku")
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    if (savedData["c1"]?.isCorrect === true) setSoal1Saved(true);
    if (savedData["c2"]?.isCorrect === true) setSoal2Saved(true);
    if (savedData["c3"]?.isCorrect === true) setSoal3Saved(true);
    didSyncSavedData.current = true;
  }, [savedData]);

  // Complete section only when both calc AND reason are done
  const handleSoal3Save = () => {
    setSoal3Saved(true);
    // Don't complete yet — wait for reason question
  };

  const handleReasonDone = () => {
    setReasonDone(true);
    // Now the section is truly complete
    if (onComplete) onComplete();
  };

  return (
    <article>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>
      <div className="flex flex-col gap-5">
        <Contoh1 saved={soal1Saved} onSave={() => setSoal1Saved(true)} readOnly={readOnly} savedData={savedData?.["c1"]} />
        {(soal1Saved || readOnly) && (
          <Contoh2 saved={soal2Saved} onSave={() => setSoal2Saved(true)} readOnly={readOnly} savedData={savedData?.["c2"]} />
        )}
        {(soal2Saved || readOnly) && (
          <Contoh3
            saved={soal3Saved}
            onSave={handleSoal3Save}
            readOnly={readOnly || reasonDone}
            onReasonDone={handleReasonDone}
            savedData={savedData?.["c3"]}
            reasonSavedData={savedData?.["c3_reason"]}
          />
        )}
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── Contoh 1 (Mudah) ──────────────────────────────────────────────
function Contoh1({ saved, onSave, readOnly = false, savedData }: { saved: boolean; onSave: () => void; readOnly?: boolean; savedData?: { answer: Record<string, string>; isCorrect: boolean } }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData?.answer ?? {});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sync savedData when it arrives
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    setAnswers({ ...savedData.answer });
    setIsCorrect(savedData.isCorrect === true);
    didSyncSavedData.current = true;
  }, [savedData]);

  const set = useCallback(
    (key: string) => (v: string) => setAnswers((p) => ({ ...p, [key]: v })),
    [],
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "contoh_soal",
      questionKey: "c1",
      answer: answers,
      isFinalInSection: false,
    });
    setSaving(false);
    setFeedback(result.feedback);
    setIsCorrect(result.isCorrect);
    if (result.isCorrect) {
      onSave();
    }
  };

  return (
    <ContohSoalCard level="mudah" number={1} title="Memilih Perwakilan Kelas">
      <img
        src="/images/pengurus kelas.svg"
        alt="Ilustrasi: Memilih 3 Perwakilan dari 8 Siswa"
        className="mb-4 max-w-lg w-full mx-auto rounded-xl object-contain max-h-80"
      />

      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Dari 8 siswa, akan dipilih 3 orang sebagai perwakilan kelas. Berapa banyak pilihan yang mungkin?
      </p>

      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A]">
          <RichText>{"$C(8,3) = \\dfrac{8!}{3!(8-3)!}$"}</RichText>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A] mt-1">
          <span>=</span>
          <span className="font-mono">
            <RichText>{"$\\dfrac{8 \\times 7 \\times 6}{3 \\times 2 \\times 1}$"}</RichText>
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A] mt-1">
          <span>=</span>
          <span className="font-mono">
            <RichText>{"$\\dfrac{336}{6}$"}</RichText>
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A] mt-2">
          <span>=</span>
          <InputBlank value={answers["c1"] ?? ""} onChange={set("c1")} disabled={saved || readOnly} className="w-20" />
        </div>
      </div>

      {feedback && (
        <div className={`mt-2 rounded-lg border p-3 ${isCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
          <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
            {isCorrect ? "✅ Benar!" : "❌ Belum tepat"}
          </p>
          <p className="text-sm text-[#2C2C2A]">{feedback}</p>
        </div>
      )}
      {saved && <SavedBadge />}
      <SaveButton onClick={handleSave} disabled={!answers["c1"]?.trim() || saving} saved={saved} hidden={readOnly} />
    </ContohSoalCard>
  );
}

// ── Contoh 2 (Sedang) ─────────────────────────────────────────────
function Contoh2({ saved, onSave, readOnly = false, savedData }: { saved: boolean; onSave: () => void; readOnly?: boolean; savedData?: { answer: Record<string, string>; isCorrect: boolean } }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData?.answer ?? {});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sync savedData when it arrives
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    setAnswers({ ...savedData.answer });
    setIsCorrect(savedData.isCorrect === true);
    didSyncSavedData.current = true;
  }, [savedData]);

  const set = useCallback(
    (key: string) => (v: string) => setAnswers((p) => ({ ...p, [key]: v })),
    [],
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "contoh_soal",
      questionKey: "c2",
      answer: answers,
      isFinalInSection: false,
    });
    setSaving(false);
    setFeedback(result.feedback);
    setIsCorrect(result.isCorrect);
    if (result.isCorrect) {
      onSave();
    }
  };

  return (
    <ContohSoalCard level="sedang" number={2} title="Jabat Tangan dalam Rapat">
      <img
        src="/images/shake hand.jpg"
        alt="Ilustrasi: Jabat Tangan Antar 10 Orang dalam Rapat"
        className="mb-4 max-w-md w-full mx-auto rounded-xl object-cover max-h-60"
      />

      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Dalam sebuah rapat dihadiri 10 orang. Jika setiap orang bersalaman dengan semua orang lainnya tepat sekali, berapa total jabat tangan yang terjadi?
      </p>

      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A]">
          <RichText>{"$C(10,2) = \\dfrac{10!}{2!\\,8!}$"}</RichText>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A] mt-1">
          <span>=</span>
          <InputBlank value={answers["c2a"] ?? ""} onChange={set("c2a")} disabled={saved || readOnly} className="w-14" />
          <span>×</span>
          <InputBlank value={answers["c2b"] ?? ""} onChange={set("c2b")} disabled={saved || readOnly} className="w-14" />
          <span>/</span>
          <span>2×1</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A] mt-1">
          <span>=</span>
          <InputBlank value={answers["c2hasil"] ?? ""} onChange={set("c2hasil")} disabled={saved || readOnly} className="w-20" />
        </div>
      </div>

      {feedback && (
        <div className={`mt-2 rounded-lg border p-3 ${isCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
          <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
            {isCorrect ? "✅ Benar!" : "❌ Belum tepat"}
          </p>
          <p className="text-sm text-[#2C2C2A]">{feedback}</p>
        </div>
      )}
      {saved && <SavedBadge />}
      <SaveButton
        onClick={handleSave}
        disabled={!answers["c2a"]?.trim() || !answers["c2b"]?.trim() || !answers["c2hasil"]?.trim() || saving}
        saved={saved}
        hidden={readOnly}
      />
    </ContohSoalCard>
  );
}

// ── Contoh 3 (HOTS) — Simulasi Tim opsional: pilih 4 orang, min 2 perempuan ──
type Anggota = { id: string; nama: string; gender: "L" | "P" };

const KANDIDAT: Anggota[] = [
  { id: "l1", nama: "L1", gender: "L" },
  { id: "l2", nama: "L2", gender: "L" },
  { id: "l3", nama: "L3", gender: "L" },
  { id: "l4", nama: "L4", gender: "L" },
  { id: "l5", nama: "L5", gender: "L" },
  { id: "p1", nama: "P1", gender: "P" },
  { id: "p2", nama: "P2", gender: "P" },
  { id: "p3", nama: "P3", gender: "P" },
  { id: "p4", nama: "P4", gender: "P" },
];

type Percobaan = { pilihan: string[]; jumlahP: number; valid: boolean };

function TimSimulator() {
  const [pilihan, setPilihan] = useState<string[]>([]);
  const [percobaan, setPercobaan] = useState<Percobaan[]>([]);
  const [selesai, setSelesai] = useState(false);

  const toggle = (id: string) => {
    if (percobaan.length >= 3) return;
    setPilihan((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length === 4) return prev;
      return [...prev, id];
    });
  };

  const cobaTim = () => {
    if (pilihan.length !== 4) return;
    const jumlahP = pilihan.filter((id) => KANDIDAT.find((k) => k.id === id)?.gender === "P").length;
    const valid = jumlahP >= 2;
    const next = [...percobaan, { pilihan, jumlahP, valid }];
    setPercobaan(next);
    setPilihan([]);
    if (next.length >= 3) setSelesai(true);
  };

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Pilih 4 orang dari 9 kandidat (5 laki-laki, 4 perempuan) untuk membentuk sebuah tim, lalu
        cek apakah timmu memenuhi syarat <b>minimal 2 perempuan</b>. Coba sebanyak 3 kali dengan
        kombinasi berbeda.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {KANDIDAT.map((k) => {
          const isSelected = pilihan.includes(k.id);
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => toggle(k.id)}
              disabled={selesai}
              className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-xs font-bold transition-colors ${
                isSelected
                  ? "border-[#663362] bg-[#663362] text-white"
                  : "border-[#34673933] bg-white text-[#2C2C2A] hover:border-[#346739]"
              } disabled:pointer-events-none disabled:opacity-50`}
            >
              <span>{k.gender === "L" ? "👦" : "👧"}</span>
              <span>{k.nama}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={cobaTim}
          disabled={pilihan.length !== 4 || selesai}
          className="rounded-full bg-[#663362] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4f2650] disabled:pointer-events-none disabled:opacity-40"
        >
          Coba Tim Ini
        </button>
        <p className="text-sm text-[#6B6B66]">{pilihan.length}/4 dipilih · percobaan {percobaan.length}/3</p>
      </div>

      {percobaan.length > 0 && (
        <div className="mt-4 space-y-2">
          {percobaan.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                p.valid ? "border-[#34673933] bg-[#DBFFD5]/30" : "border-[#C44F4F33] bg-[#C44F4F08]"
              }`}
            >
              <span className="text-[#2C2C2A]">
                Percobaan {i + 1}: {p.jumlahP} perempuan, {4 - p.jumlahP} laki-laki
              </span>
              <span className={`font-semibold ${p.valid ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                {p.valid ? "✅ Memenuhi syarat" : "❌ Belum memenuhi syarat"}
              </span>
            </div>
          ))}
        </div>
      )}

      {selesai && (
        <div className="mt-4 rounded-lg border border-[#34673933] bg-[#DBFFD5]/20 p-4">
          <p className="text-sm font-medium text-[#346739]">
            Dari 3 percobaanmu, terlihat bahwa tim yang valid selalu punya susunan perempuan dan
            laki-laki yang berbeda-beda — ada beberapa <b>kasus</b> yang sama-sama memenuhi
            &ldquo;minimal 2 perempuan&rdquo;. Untuk menghitung total semua tim yang mungkin, setiap
            kasus itu perlu dihitung terpisah lalu dijumlahkan.
          </p>
        </div>
      )}
    </div>
  );
}

function Contoh3({ saved, onSave, readOnly = false, onReasonDone, savedData, reasonSavedData }: { saved: boolean; onSave: () => void; readOnly?: boolean; onReasonDone?: () => void; savedData?: { answer: Record<string, string>; isCorrect: boolean }; reasonSavedData?: { answer: Record<string, string>; isCorrect: boolean } }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData?.answer ?? {});
  const [reasonText, setReasonText] = useState(() => {
    if (reasonSavedData?.answer) {
      const a = reasonSavedData.answer;
      if (a._text) return a._text;
    }
    return "";
  });
  const [reasonSaved, setReasonSaved] = useState(() => reasonSavedData?.isCorrect === true);
  const [saving, setSaving] = useState(false);
  const [savingReason, setSavingReason] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reasonFeedback, setReasonFeedback] = useState<string | null>(null);
  const [reasonIsCorrect, setReasonIsCorrect] = useState(() => reasonSavedData?.isCorrect === true);

  // Sync savedData when it arrives
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    setAnswers({ ...savedData.answer });
    setIsCorrect(savedData.isCorrect === true);
    didSyncSavedData.current = true;
  }, [savedData]);

  const set = useCallback(
    (key: string) => (v: string) => setAnswers((p) => ({ ...p, [key]: v })),
    [],
  );

  const allCalcFilled = ["c3a", "c3b", "c3c", "c3d", "c3e", "c3f"].every(
    (k) => (answers[k] ?? "").trim() !== "",
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "contoh_soal",
      questionKey: "c3",
      answer: answers,
      isFinalInSection: false, // bukan final — tunggu reason question
    });
    setSaving(false);
    setFeedback(result.feedback);
    setIsCorrect(result.isCorrect);
    if (result.isCorrect) {
      onSave();
    }
  };

  const handleSaveReason = async () => {
    setSavingReason(true);
    const result = await saveAnswer({
      section: "contoh_soal",
      questionKey: "c3_reason",
      answer: reasonText,
      soal: "Dalam soal kombinasi dengan syarat (minimal 2 perempuan dari 4 perempuan dan 5 laki-laki, pilih 4 orang), kenapa perhitungan tiap kasus dikali dan bukan ditambah?",
      isFinalInSection: true, // ini soal terakhir di section contoh_soal
    });
    setSavingReason(false);
    setReasonFeedback(result.feedback);
    setReasonIsCorrect(result.isCorrect);
    // Hanya mark as saved & lanjut jika jawaban benar; jika salah, biarkan siswa coba lagi
    if (result.isCorrect) {
      setReasonSaved(true);
      if (onReasonDone) onReasonDone();
    }
  };

  return (
    <ContohSoalCard level="hots" number={3} title="Tim dengan Syarat Minimal Perempuan">
      <img
        src="/images/team 4 members.jpg"
        alt="5 Laki-laki & 4 Perempuan — Bentuk Tim Minimal 2 Perempuan"
        className="mb-4 max-w-md w-full mx-auto rounded-xl object-cover max-h-60"
      />

      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Dari 5 siswa laki-laki dan 4 siswa perempuan, akan dibentuk tim beranggotakan 4 orang yang terdiri atas <b>minimal 2 perempuan</b>. Berapa banyak tim yang mungkin?
      </p>

      {/* Simulasi: coba susun tim sendiri dulu */}
      <div className="mb-4 rounded-lg bg-[#DBFFD5]/20 px-4 py-3">
        <TimSimulator />
      </div>

      {/* Perhitungan formal */}
      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <p className="text-sm font-semibold text-[#346739] mb-2">
          💡 Langkah Berpikir — Kasus yang memenuhi &ldquo;minimal 2 perempuan&rdquo;:
        </p>
        <div className="overflow-x-auto rounded-lg border border-[#34673926]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#663362]">
                <th className="px-2 py-2 text-left font-semibold text-white">Kasus</th>
                <th className="px-2 py-2 text-center font-semibold text-white">Perempuan</th>
                <th className="px-2 py-2 text-center font-semibold text-white">Laki-Laki</th>
                <th className="px-2 py-2 text-left font-semibold text-white">Perhitungan</th>
                <th className="px-2 py-2 text-center font-semibold text-white">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              <tr className="bg-white">
                <td className="px-2 py-2 font-medium text-[#346739]">Tepat 2 perempuan</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">2 dari 4</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">2 dari 5</td>
                <td className="px-2 py-2 font-mono text-[#2C2C2A]">
                  <RichText>{"$C(4,2) \\times C(5,2)$"}</RichText>
                </td>
                <td className="px-2 py-2 text-center">
                  <InputBlank value={answers["c3a"] ?? ""} onChange={set("c3a")} disabled={saved || readOnly} className="w-16 text-sm" />
                </td>
              </tr>
              <tr className="bg-[#DBFFD5]/30">
                <td className="px-2 py-2 font-medium text-[#346739]">Tepat 3 perempuan</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">3 dari 4</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">1 dari 5</td>
                <td className="px-2 py-2 font-mono text-[#2C2C2A]">
                  <RichText>{"$C(4,3) \\times C(5,1)$"}</RichText>
                </td>
                <td className="px-2 py-2 text-center">
                  <InputBlank value={answers["c3b"] ?? ""} onChange={set("c3b")} disabled={saved || readOnly} className="w-16 text-sm" />
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-2 py-2 font-medium text-[#346739]">Tepat 4 perempuan</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">4 dari 4</td>
                <td className="px-2 py-2 text-center text-[#2C2C2A]">0 dari 5</td>
                <td className="px-2 py-2 font-mono text-[#2C2C2A]">
                  <RichText>{"$C(4,4) \\times C(5,0)$"}</RichText>
                </td>
                <td className="px-2 py-2 text-center">
                  <InputBlank value={answers["c3c"] ?? ""} onChange={set("c3c")} disabled={saved || readOnly} className="w-16 text-sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-sm italic text-[#34673999]">
          💡 Cukup tulis hasil akhirnya saja (satu angka) di kolom Hasil dan Total.
        </p>
      </div>

      <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 mb-3">
        <p className="text-sm text-[#2C2C2A]">
          Total tim ={" "}
          <InputBlank value={answers["c3d"] ?? ""} onChange={set("c3d")} disabled={saved || readOnly} className="w-14" />
          {" + "}
          <InputBlank value={answers["c3e"] ?? ""} onChange={set("c3e")} disabled={saved || readOnly} className="w-14" />
          {" + "}
          <InputBlank value={answers["c3f"] ?? ""} onChange={set("c3f")} disabled={saved || readOnly} className="w-14" />
          {" = "}
          <InputBlank value={answers["c3Total"] ?? ""} onChange={set("c3Total")} disabled={saved || readOnly} className="w-16" />
          {" tim"}
        </p>
      </div>

      <SaveButton
        onClick={handleSave}
        disabled={!allCalcFilled || !answers["c3Total"]?.trim() || saving}
        saved={saved}
        hidden={readOnly}
      />

      {feedback && (
        <div className={`mt-2 rounded-lg border p-3 ${isCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
          <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
            {isCorrect ? "✅ Benar!" : "❌ Belum tepat"}
          </p>
          <p className="text-sm text-[#2C2C2A]">{feedback}</p>
        </div>
      )}

      {/* Extra: Kenapa dikali? */}
      {saved && (
        <div className="mt-4 rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
          <p className="text-sm font-medium text-[#346739] mb-2">
            🤔 Kenapa dikali? Bukan ditambah? Tuliskan pendapatmu di kotak berikut!
          </p>
          <textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Tulis pendapatmu..."
            rows={3}
            disabled={reasonSaved || readOnly}
            className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
              reasonSaved
                ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
                : "border-[#34673933]"
            }`}
          />
          {reasonFeedback && (
            <div className={`mt-2 rounded-lg border p-3 ${reasonIsCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
              <p className={`text-sm font-semibold mb-1 ${reasonIsCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                {reasonIsCorrect ? "✅ Feedback Kombi:" : "❌ Feedback Kombi:"}
              </p>
              <p className="text-sm leading-relaxed text-[#2C2C2A]">{reasonFeedback}</p>
            </div>
          )}
          <SaveButton onClick={handleSaveReason} disabled={!reasonText.trim() || savingReason} saved={reasonSaved} hidden={readOnly} />
          {reasonSaved && <SavedBadge />}
        </div>
      )}
    </ContohSoalCard>
  );
}

// ============================================================================
// 5. Mengapa? Corner
// ============================================================================

function MengapaCorner({
  onComplete,
  readOnly = false,
  savedData,
}: {
  onComplete?: () => void;
  readOnly?: boolean;
  savedData?: KombinasiSavedData["mengapa"];
}) {
  const [answer, setAnswer] = useState(savedData?.jawaban ?? "");
  const [saved, setSaved] = useState(!!savedData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(savedData?.feedback ?? null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Sync savedData when it arrives
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    setAnswer(savedData.jawaban ?? "");
    setFeedback(savedData.feedback ?? null);
    setIsCorrect(savedData.isCorrect === true);
    setSaved(true);
    didSyncSavedData.current = true;
  }, [savedData]);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveAnswer({
      section: "mengapa_corner",
      questionKey: "mengapa_dikali_ditambah",
      answer: answer,
      soal: "Berdasarkan Contoh 3 (tim dengan syarat minimal 2 perempuan): Kenapa perhitungan tiap kasus dikali dan hasil tiap kasus ditambah?",
      isFinalInSection: true,
    });
    setSaving(false);
    setFeedback(result.feedback);
    setIsCorrect(result.isCorrect);
    // Hanya mark as saved & lanjut jika jawaban benar; jika salah, biarkan siswa coba lagi
    if (result.isCorrect) {
      setSaved(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-lg font-bold text-[#346739]">
          💡 Mengapa kombinasi membagi dengan <RichText>{"$r!$"}</RichText>?
        </h3>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 mb-4">
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Bayangkan kamu sudah menghitung semua permutasi dari <RichText>{"$r$"}</RichText> objek terpilih. Tapi karena urutan tidak penting, setiap &ldquo;tim&rdquo; yang sama terhitung{" "}
            <RichText>{"$r!$"}</RichText> kali (sebanyak cara menyusun <RichText>{"$r$"}</RichText> anggota). Untuk mendapat jumlah tim yang <b>benar-benar berbeda</b>, kita bagi dengan{" "}
            <RichText>{"$r!$"}</RichText>.
          </p>
        </div>

        <div className="rounded-lg border-2 border-[#34673926] bg-[#DBFFD5]/20 px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-[#346739] mb-1">📸 Analogi:</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Jika kamu punya 6 foto yang semuanya adalah foto yang sama tapi dari sudut berbeda, jumlah foto <b>unik</b>-nya adalah 6 : 6 = 1. Kombinasi bekerja persis seperti ini!
          </p>
        </div>

        <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
          <p className="text-sm font-medium text-[#346739] mb-2">
            🤔 Berdasarkan Contoh 3 di atas: Kenapa perhitungan tiap kasus dikali dan hasil tiap kasus ditambah? Tuliskan pendapatmu!
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tulis pendapatmu..."
            rows={4}
            disabled={saved || readOnly}
            className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
              saved || readOnly
                ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
                : "border-[#34673933]"
            }`}
          />
        </div>

        {feedback && (
          <div className={`mt-2 rounded-lg border p-3 ${isCorrect ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
            <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-[#346739]" : "text-[#C44F4F]"}`}>
              {isCorrect ? "✅ Feedback Kombi:" : "❌ Feedback Kombi:"}
            </p>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">{feedback}</p>
          </div>
        )}
        <SaveButton onClick={handleSave} disabled={!answer.trim() || saving} saved={saved} hidden={readOnly} />
        {saved && <SavedBadge />}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 6. Permutasi vs Kombinasi: Panduan Definitif (READ-ONLY)
// ============================================================================

function PermutasiVsKombinasi({ onNext }: { onNext?: () => void }) {
  return (
    <article>
      <SectionBadge>Permutasi vs Kombinasi</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📊 Panduan Definitif</h3>

        <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#663362]">
                <th className="px-4 py-3 text-left font-semibold text-white">Pertanyaan</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Permutasi</th>
                <th className="px-4 py-3 text-center font-semibold text-white">Kombinasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              {[
                { q: "Apakah urutan berpengaruh?", p: "Ya", k: "Tidak" },
                { q: "Contoh Nyata", p: "Juara 1, 2, 3", k: "Anggota Tim" },
                { q: "Rumus", p: "n!/(n−r)!", k: "n!/(r!(n−r)!)" },
                { q: "Kata Kunci Soal", p: "Susunan, urutan, kode, jabatan", k: "Kelompok, tim, memilih, komite" },
                { q: "Apakah AB ≠ BA?", p: "Berbeda", k: "Sama" },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                  <td className="px-4 py-3 font-medium text-[#2C2C2A]">{row.q}</td>
                  <td className="px-4 py-3 text-center text-[#663362] font-semibold">{row.p}</td>
                  <td className="px-4 py-3 text-center text-[#346739] font-semibold">{row.k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-3">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">⚠ Miskonsepsi Terbesar</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Banyak siswa menggunakan kombinasi untuk semua soal &ldquo;memilih&rdquo;. Ingat: kalau ada jabatan/posisi/urutan, itu <b>permutasi</b>!
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
      {onNext && <NextButton onClick={onNext} />}
    </article>
  );
}

// ============================================================================
// 7. Refleksi Mini
// ============================================================================

function RefleksiMini({
  onComplete,
  readOnly = false,
  savedData,
}: {
  onComplete?: () => void;
  readOnly?: boolean;
  savedData?: KombinasiSavedData["refleksi"];
}) {
  const questions = [
    {
      key: "refleksi_1",
      q: "Jelaskan hubungan matematis antara C(n,r) dan P(n,r). Mengapa C(n,r) = C(n, n−r)?",
    },
    {
      key: "refleksi_2",
      q: "Berikan satu contoh nyata yang membutuhkan kombinasi dan satu yang membutuhkan permutasi. Jelaskan alasannya!",
    },
    {
      key: "refleksi_3",
      q: "Dalam soal apa kamu perlu menggabungkan beberapa kombinasi? (Petunjuk: lihat Contoh 3 di atas)",
    },
    {
      key: "refleksi_4",
      q: "Sekarang kamu sudah mempelajari kelima konsep: Kaidah Perkalian → Faktorial → Permutasi → Kombinasi. Gambarkan atau jelaskan dengan kalimatmu sendiri alur keterhubungan kelima konsep tersebut. Mengapa urutan belajarnya seperti ini, bukan urutan yang lain (misalnya kombinasi diajarkan duluan)?",
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (savedData) {
      for (const q of questions) {
        init[q.key] = savedData[q.key]?.answer ?? "";
      }
    }
    return init;
  });
  const [saved, setSaved] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (savedData) {
      for (const q of questions) {
        if (savedData[q.key]?.isCorrect === true) init[q.key] = true;
      }
    }
    return init;
  });
  const [unlockedCount, setUnlockedCount] = useState(() => {
    let count = 1;
    if (savedData) {
      for (let i = 0; i < questions.length - 1; i++) {
        if (savedData[questions[i].key]?.isCorrect === true) {
          count = i + 2;
        } else {
          break;
        }
      }
    }
    return Math.min(count, questions.length);
  });
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (savedData) {
      for (const q of questions) {
        if (savedData[q.key]?.feedback) init[q.key] = savedData[q.key].feedback!;
      }
    }
    return init;
  });
  const [isCorrectMap, setIsCorrectMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (savedData) {
      for (const q of questions) {
        if (savedData[q.key]?.isCorrect === true) init[q.key] = true;
      }
    }
    return init;
  });

  // Sync savedData when it arrives
  const didSyncSavedData = useRef(false);
  useEffect(() => {
    if (!savedData || didSyncSavedData.current) return;
    const newAnswers: Record<string, string> = {};
    const newSaved: Record<string, boolean> = {};
    const newFeedbacks: Record<string, string> = {};
    const newCorrect: Record<string, boolean> = {};
    let maxUnlocked = 1;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const entry = savedData[q.key];
      if (entry) {
        newAnswers[q.key] = entry.answer ?? "";
        if (entry.feedback) newFeedbacks[q.key] = entry.feedback;
        if (entry.isCorrect === true) {
          newSaved[q.key] = true;
          newCorrect[q.key] = true;
          maxUnlocked = Math.max(maxUnlocked, i + 2);
        }
      }
    }
    setAnswers((prev) => ({ ...newAnswers, ...prev }));
    setSaved((prev) => ({ ...newSaved, ...prev }));
    setFeedbacks((prev) => ({ ...newFeedbacks, ...prev }));
    setIsCorrectMap((prev) => ({ ...newCorrect, ...prev }));
    setUnlockedCount(Math.min(maxUnlocked, questions.length));
    didSyncSavedData.current = true;
  }, [savedData]);

  const set = useCallback(
    (key: string) => (v: string) => setAnswers((p) => ({ ...p, [key]: v })),
    [],
  );

  const handleSave = async (key: string, index: number) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    const isLast = index === questions.length - 1;
    const result = await saveAnswer({
      section: "refleksi_mini",
      questionKey: key,
      answer: answers[key] ?? "",
      soal: questions[index].q,
      isFinalInSection: isLast,
    });
    setSaving((prev) => ({ ...prev, [key]: false }));
    setFeedbacks((prev) => ({ ...prev, [key]: result.feedback ?? "" }));
    setIsCorrectMap((prev) => ({ ...prev, [key]: result.isCorrect }));

    // Hanya mark as saved & unlock next jika jawaban benar
    if (result.isCorrect) {
      setSaved((prev) => {
        const next = { ...prev, [key]: true };
        // Unlock next question
        if (index + 1 < questions.length) {
          setUnlockedCount((prevCount) => Math.max(prevCount, index + 2));
        }
        // Check if all done
        if (questions.every((q) => next[q.key])) {
          if (onComplete) onComplete();
        }
        return next;
      });
    }
  };

  return (
    <article>
      <SectionBadge>Refleksi Mini</SectionBadge>

      <p className="mb-4 text-base font-semibold text-[#2C2C2A]">
        ✅ Pikirkan dan jawab:
      </p>

      <div className="flex flex-col gap-4">
        {questions.map((item, i) => {
          const isUnlocked = i < unlockedCount;
          const isSaved = saved[item.key];

          if (!isUnlocked) return null;

          return (
            <div key={item.key} className="rounded-xl bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#663362] text-xs font-bold text-white shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed text-[#2C2C2A] mb-3">
                    {item.q}
                  </p>
                  <textarea
                    value={answers[item.key] ?? ""}
                    onChange={(e) => set(item.key)(e.target.value)}
                    placeholder="Tulis jawabanmu..."
                    rows={4}
                    disabled={isSaved || readOnly}
                    className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
                      isSaved || readOnly
                        ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
                        : "border-[#34673933]"
                    }`}
                  />
                  {feedbacks[item.key] && (
                    <div className={`mt-2 rounded-lg border p-3 ${isCorrectMap[item.key] ? "border-[#34673933] bg-[#DBFFD5]/20" : "border-[#C44F4F33] bg-[#C44F4F08]"}`}>
                      <p className={`text-sm font-semibold mb-1 ${isCorrectMap[item.key] ? "text-[#346739]" : "text-[#C44F4F]"}`}>
                        {isCorrectMap[item.key] ? "✅ Feedback Kombi:" : "❌ Feedback Kombi:"}
                      </p>
                      <p className="text-sm leading-relaxed text-[#2C2C2A]">{feedbacks[item.key]}</p>
                    </div>
                  )}
                  <SaveButton
                    onClick={() => handleSave(item.key, i)}
                    disabled={!(answers[item.key] ?? "").trim() || saving[item.key]}
                    saved={isSaved}
                    hidden={readOnly}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
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
  children: (savedData: Partial<KombinasiSavedData> | undefined) => React.ReactNode;
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
// Main Export — KombinasiContent
// ============================================================================

export default function KombinasiContent({
  onComplete,
  initialCompletedSections = {},
}: {
  onComplete?: () => void;
  /** Section indices yang sudah complete dari backend (DB-tracked: 0,1,2,3,4,6) */
  initialCompletedSections?: Record<number, boolean>;
}) {
  const onCompleteCalled = useRef(false);

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

    // Section 2 (Penjelasan Konsep, read-only) — infer dari section 3 atau 4 atau 6
    if (cs[3] || cs[4] || cs[6]) cs[2] = true;
    // Section 5 (Permutasi vs Kombinasi, read-only) — infer dari section 6
    if (cs[6]) cs[5] = true;

    // Cari section pertama yang belum complete
    let firstUncompleted = TOTAL_SECTIONS - 1;
    for (let i = 0; i < TOTAL_SECTIONS; i++) {
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
    didSyncInitial.current = true;
  }, [initialCompletedSections]);

  function markComplete(sectionIndex: number) {
    setCompletedSections((prev) => {
      const next = { ...prev, [sectionIndex]: true };
      // Auto-infer read-only sections
      if (sectionIndex === 3 || sectionIndex === 4 || sectionIndex === 6) {
        next[2] = true; // penjelasan_konsep inferred
      }
      if (sectionIndex === 6) {
        next[5] = true; // permutasi_vs_kombinasi inferred
      }
      return next;
    });
    if (sectionIndex < TOTAL_SECTIONS - 1) {
      setCurrentSection((prev) => Math.max(prev, sectionIndex + 1));
    }
  }

  function handleNext(sectionIndex: number) {
    markComplete(sectionIndex);
  }

  const isVisible = (i: number) => i <= currentSection;
  const isCompleted = (i: number) => completedSections[i] === true;
  const isActive = (i: number) => i === currentSection && !isCompleted(i);

  const allComplete = isCompleted(6);

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
          Materi 5
        </p>
        <h1 className="text-2xl font-bold text-[#1a3d1c]">Kombinasi</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#5a7d5c]">
          Pemilihan objek tanpa memperhatikan urutan — pelajari cara menghitung banyaknya
          kelompok, tim, dan komite dengan rumus kombinasi.
        </p>
      </div>

      <SectionProgress currentSection={currentSection} completedSections={completedSections} />

      {/* Section 0: Eksplorasi Kontekstual */}
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
            <EksplorasiKontekstual
              readOnly={isCompleted(0)}
              savedData={savedData?.eksplorasi}
              onComplete={isActive(0) ? () => markComplete(0) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 1: Aktivitas Deep Learning */}
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
            <AktivitasDeepLearning
              readOnly={isCompleted(1)}
              savedData={savedData?.deepLearning}
              onComplete={isActive(1) ? () => markComplete(1) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 2: Penjelasan Konsep (read-only) */}
      {isVisible(2) && (
        <PenjelasanKonsep
          onNext={isActive(2) ? () => handleNext(2) : undefined}
        />
      )}

      {/* Section 3: Contoh Soal Bertahap */}
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
            <ContohSoalBertahap
              readOnly={isCompleted(3)}
              savedData={savedData?.contohSoal}
              onComplete={isActive(3) ? () => markComplete(3) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 4: Mengapa? Corner */}
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
            <MengapaCorner
              readOnly={isCompleted(4)}
              savedData={savedData?.mengapa}
              onComplete={isActive(4) ? () => markComplete(4) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 5: Permutasi vs Kombinasi (read-only) */}
      {isVisible(5) && (
        <PermutasiVsKombinasi
          onNext={isActive(5) ? () => handleNext(5) : undefined}
        />
      )}

      {/* Section 6: Refleksi Mini */}
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
            <RefleksiMini
              readOnly={isCompleted(6)}
              savedData={savedData?.refleksi}
              onComplete={isActive(6) ? () => markComplete(6) : undefined}
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
              🎉 Semua bagian Kombinasi selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan Eksplorasi, Deep Learning, Penjelasan Konsep, Contoh Soal, Mengapa Corner, Permutasi vs Kombinasi, dan Refleksi. Lanjutkan mengerjakan Asesmen Formatif Materi Kombinasi!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}