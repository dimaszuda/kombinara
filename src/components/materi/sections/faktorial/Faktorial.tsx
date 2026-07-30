"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { SectionBadge } from "@/components/ui/Materi";
import { RichText } from "@/components/shared/RichText";
import { CheckIcon } from "@/components/ui/IconButton";

// ============================================================================
// Shared: Simple grading helper (rule-based, client-side)
// ============================================================================

type GradeResult = Record<string, "correct" | "incorrect">;

/**
 * Normalize student answer for lenient comparison:
 * - lowercase
 * - "×" → "x"
 * - remove dots between digits (Indonesian thousand separators: 5.040 → 5040)
 * - collapse whitespace
 */
function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/(\d)[.,](\d)/g, "$1$2") // Remove thousand separators (5.040→5040, 5,040→5040)
    .replace(/\s+/g, "");
}

function gradeAnswers(
  expected: Record<string, string>,
  values: Record<string, string>,
): { results: GradeResult; allCorrect: boolean } {
  const results: GradeResult = {};
  let allCorrect = true;
  for (const key of Object.keys(expected)) {
    const got = normalizeAnswer(values[key] ?? "");
    const want = normalizeAnswer(expected[key]);
    const ok = got === want;
    results[key] = ok ? "correct" : "incorrect";
    if (!ok) allCorrect = false;
  }
  return { results, allCorrect };
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
  // Sembunyikan tombol jika jawaban sudah benar tersimpan ATAU section readOnly
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
// Shared: Inline Input Blank with grading feedback
// ============================================================================

function InputBlank({
  value,
  onChange,
  placeholder = "...",
  className = "",
  grade,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  grade?: "correct" | "incorrect" | null;
  disabled?: boolean;
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
      style={{ minWidth: "44px", maxWidth: "80px" }}
    />
  );
}

// ============================================================================
// Shared: Feedback message box
// ============================================================================

function FeedbackBox({
  allCorrect,
  correctCount,
  totalCount,
}: {
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) return null;
  return (
    <div
      className={`mt-3 rounded-lg border p-3 ${
        allCorrect
          ? "border-[#34673933] bg-[#DBFFD5]/20"
          : "border-[#C44F4F33] bg-[#C44F4F08]"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          allCorrect ? "text-[#346739]" : "text-[#C44F4F]"
        }`}
      >
        {allCorrect
          ? "✅ Semua jawaban benar!"
          : `❌ ${correctCount} dari ${totalCount} benar. Coba periksa kembali jawaban yang masih salah.`}
      </p>
    </div>
  );
}

// ============================================================================
// Shared: AI Feedback Box (for AI-graded sections)
// ============================================================================

function AiFeedbackBox({
  feedback,
  isCorrect,
}: {
  feedback: string | null;
  isCorrect: boolean | null;
}) {
  if (!feedback) return null;
  return (
    <div
      className={`mt-3 rounded-lg border p-3 ${
        isCorrect === false
          ? "border-[#C44F4F33] bg-[#C44F4F08]"
          : "border-[#66336233] bg-[#66336208]"
      }`}
    >
      <p
        className={`mb-1 text-xs font-medium ${
          isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"
        }`}
      >
        {isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
      </p>
      <RichText className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">
        {feedback}
      </RichText>
    </div>
  );
}

// ============================================================================
// Section sequential unlocking types & helpers
// ============================================================================

interface SectionProps {
  readOnly?: boolean;
  onComplete?: () => void;
}

interface ReadOnlySectionProps {
  readOnly?: boolean;
  onNext?: () => void;
}

const TOTAL_SECTIONS = 6;

const SECTION_LABELS = [
  "Eksplorasi Kontekstual",
  "Aktivitas Deep Learning",
  "Penjelasan Konsep",
  "Contoh Soal Bertahap",
  "Mengapa? Corner",
  "Refleksi Mini",
] as const;

// ── Lanjutkan Button (for read-only sections) ──────────────────────
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

const EKSPLORASI_EXPECTED: Record<string, string> = {
  kursi1: "4",
  kursi2: "3",
  kursi3: "2",
  kursi4: "1",
  kali1: "4",
  kali2: "3",
  kali3: "2",
  kali4: "1",
  hasil: "24",
  faktorialNilai: "4",
  faktorialNotasi: "4!",
};

function EksplorasiKontekstual({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData ?? {});
  const [grades, setGrades] = useState<GradeResult>({});
  const [saved, setSaved] = useState(false);

  // Sync savedData into state whenever it becomes available (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (savedData && Object.keys(savedData).length > 0) {
      setAnswers(savedData);
      setSaved(true);
      // Pre-grade all answers as correct since they were saved from DB
      const g: GradeResult = {};
      for (const key of Object.keys(savedData)) {
        g[key] = "correct";
      }
      setGrades(g);
    }
  }, [savedData]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
      // Clear grade on edit
      setGrades((p) => {
        if (!(key in p)) return p;
        const next = { ...p };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = () => {
    const { results } = gradeAnswers(EKSPLORASI_EXPECTED, answers);
    setGrades(results);
    setSaved(true);

    // Fire-and-forget: save to DB
    const allCorrect = Object.keys(EKSPLORASI_EXPECTED).every(
      (k) => results[k] === "correct"
    );
    fetch("/api/eksplorasi-kontekstual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "faktorial",
        question_key: "faktorialNotasi",
        answer: answers,
        feedback: allCorrect ? "Semua jawaban benar!" : "Beberapa jawaban masih salah.",
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[eksplorasi] DB save error:", err));

    // Notify parent if all correct
    if (allCorrect && onComplete) {
      onComplete();
    }
  };

  const gradedKeys = Object.keys(grades);
  const correctCount = gradedKeys.filter((k) => grades[k] === "correct").length;
  const totalCount = Object.keys(EKSPLORASI_EXPECTED).length;
  const allCorrect = correctCount === totalCount;

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Ada 4 teman (Daffa, Abdi, Udin, Bima) yang akan duduk berjajar di 4 kursi kosong.
          Berapa banyak cara berbeda mereka bisa duduk?
        </p>
        <p className="mb-3 text-sm italic text-[#34673999]">
          Sebelum menghitung dengan rumus, mari kita pikirkan tahap demi tahap:
        </p>

        {/* Tabel tahap demi tahap */}
        <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#B8E6BC]">
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A]">Tahap</th>
                <th className="px-4 py-3 text-left font-semibold text-[#2C2C2A]">Pertanyaan</th>
                <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A] w-36">Banyak Pilihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34673915]">
              {[
                { tahap: "Kursi 1", pertanyaan: "Siapa yang bisa duduk di sini?", key: "kursi1" },
                { tahap: "Kursi 2", pertanyaan: "Siapa yang tersisa?", key: "kursi2" },
                { tahap: "Kursi 3", pertanyaan: "Siapa yang tersisa?", key: "kursi3" },
                { tahap: "Kursi 4", pertanyaan: "Siapa yang tersisa?", key: "kursi4" },
              ].map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                  <td className="px-4 py-3 font-medium text-[#346739]">{row.tahap}</td>
                  <td className="px-4 py-3 text-[#2C2C2A]">{row.pertanyaan}</td>
                  <td className="px-4 py-3 text-center">
                    <InputBlank
                      value={answers[row.key] ?? ""}
                      onChange={set(row.key)}
                      grade={grades[row.key] ?? null}
                      disabled={readOnly || grades[row.key] === "correct"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kesimpulan */}
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Jadi banyaknya cara berbeda yaitu{" "}
            <InputBlank value={answers["kali1"] ?? ""} onChange={set("kali1")} grade={grades["kali1"] ?? null} disabled={readOnly || grades["kali1"] === "correct"} />{" "}
            ×{" "}
            <InputBlank value={answers["kali2"] ?? ""} onChange={set("kali2")} grade={grades["kali2"] ?? null} disabled={readOnly || grades["kali2"] === "correct"} />{" "}
            ×{" "}
            <InputBlank value={answers["kali3"] ?? ""} onChange={set("kali3")} grade={grades["kali3"] ?? null} disabled={readOnly || grades["kali3"] === "correct"} />{" "}
            ×{" "}
            <InputBlank value={answers["kali4"] ?? ""} onChange={set("kali4")} grade={grades["kali4"] ?? null} disabled={readOnly || grades["kali4"] === "correct"} />{" "}
            ={" "}
            <InputBlank value={answers["hasil"] ?? ""} onChange={set("hasil")} grade={grades["hasil"] ?? null} disabled={readOnly || grades["hasil"] === "correct"} />
          </p>
          <p className="mt-2 text-sm text-[#2C2C2A]">
            Ini adalah{" "}
            <InputBlank
              value={answers["faktorialNilai"] ?? ""}
              onChange={set("faktorialNilai")}
              className="w-14"
              grade={grades["faktorialNilai"] ?? null}
              disabled={readOnly || grades["faktorialNilai"] === "correct"}
            />{" "}
            faktorial, ditulis{" "}
            <InputBlank
              value={answers["faktorialNotasi"] ?? ""}
              onChange={set("faktorialNotasi")}
              className="w-14"
              grade={grades["faktorialNotasi"] ?? null}
              disabled={readOnly || grades["faktorialNotasi"] === "correct"}
            />
          </p>
        </div>

        {saved && (
          <FeedbackBox allCorrect={allCorrect} correctCount={correctCount} totalCount={totalCount} />
        )}

        <SaveButton onClick={handleSave} saved={saved && allCorrect} hidden={readOnly} />
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 2. Aktivitas Deep Learning — TABLE (with its own save button)
// ============================================================================

const DEEP_TABLE_EXPECTED: Record<string, string> = {
  val5: "120",
  sym6: "6!",
  val6: "720",
  sym7: "7!",
  val7: "5040",
  calc8: "8×7!",
  sym8: "8!",
  val8: "40320",
  calc9: "9×8!",
  sym9: "9!",
  val9: "362880",
  calc10: "10×9!",
  sym10: "10!",
  val10: "3628800",
};

const DEEP_TABLE_ROWS = [
  { n: 1, calc: "1", symbol: "1!", value: "1", calcRO: true, symRO: true, valRO: true },
  { n: 2, calc: "2×1", symbol: "2!", value: "2", calcRO: true, symRO: true, valRO: true },
  { n: 3, calc: "3×2×1", symbol: "3!", value: "6", calcRO: true, symRO: true, valRO: true },
  { n: 4, calc: "4×3×2×1", symbol: "4!", value: "24", calcRO: true, symRO: true, valRO: true },
  { n: 5, calc: "5×4×3×2×1", symbol: "5!", value: null, calcRO: true, symRO: true, valRO: false },
  { n: 6, calc: "6×5!", symbol: null, value: null, calcRO: true, symRO: false, valRO: false },
  { n: 7, calc: "7×6!", symbol: null, value: null, calcRO: true, symRO: false, valRO: false },
  { n: 8, calc: null, symbol: null, value: null, calcRO: false, symRO: false, valRO: false },
  { n: 9, calc: null, symbol: null, value: null, calcRO: false, symRO: false, valRO: false },
  { n: 10, calc: null, symbol: null, value: null, calcRO: false, symRO: false, valRO: false },
];

function DeepLearningTable({ readOnly = false, onSave, savedAnswers }: { readOnly?: boolean; onSave?: (allCorrect: boolean) => void; savedAnswers?: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers ?? {});
  const [grades, setGrades] = useState<GradeResult>({});
  const [saved, setSaved] = useState(false);

  // Sync savedAnswers into state
  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      setSaved(true);
      const g: GradeResult = {};
      for (const key of Object.keys(savedAnswers)) {
        g[key] = "correct";
      }
      setGrades(g);
    }
  }, [savedAnswers]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
      setGrades((p) => {
        if (!(key in p)) return p;
        const next = { ...p };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = () => {
    const { results } = gradeAnswers(DEEP_TABLE_EXPECTED, answers);
    setGrades(results);
    setSaved(true);

    // Fire-and-forget: save to DB
    const allCorrect = Object.keys(DEEP_TABLE_EXPECTED).every(
      (k) => results[k] === "correct"
    );
    fetch("/api/aktivitas-deep-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "faktorial",
        answer: { ...answers, graded: results },
        feedback: allCorrect ? "Semua jawaban benar!" : "Beberapa jawaban masih salah.",
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[deep-learning-table] DB save error:", err));

    if (onSave) onSave(allCorrect);
  };

  const gradedKeys = Object.keys(grades);
  const correctCount = gradedKeys.filter((k) => grades[k] === "correct").length;
  const totalCount = Object.keys(DEEP_TABLE_EXPECTED).length;
  const allCorrect = correctCount === totalCount;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-5">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#663362]">
              <th className="px-4 py-3 text-center font-semibold text-white w-14">n</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Perhitungan</th>
              <th className="px-4 py-3 text-center font-semibold text-white w-28">Simbol/Notasi</th>
              <th className="px-4 py-3 text-center font-semibold text-white w-32">Nilai n!</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#34673915]">
            {DEEP_TABLE_ROWS.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                <td className="px-4 py-3 text-center font-semibold text-[#346739]">{row.n}</td>
                <td className="px-4 py-3 text-[#2C2C2A] font-mono">
                  {row.calcRO ? (
                    row.calc
                  ) : (
                    <input
                      type="text"
                      value={answers[`calc${row.n}`] ?? ""}
                      onChange={(e) => set(`calc${row.n}`)(e.target.value)}
                      placeholder="…"
                      disabled={readOnly || grades[`calc${row.n}`] === "correct"}
                      className={`w-full rounded-md border-2 px-2 py-1 text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
                        grades[`calc${row.n}`] === "correct"
                          ? "border-[#346739] bg-[#DBFFD5]/40"
                          : grades[`calc${row.n}`] === "incorrect"
                            ? "border-[#C44F4F] bg-[#C44F4F]/5"
                            : "border-[#34673933] bg-white"
                      } text-[#2C2C2A] disabled:cursor-default disabled:text-[#6B6B66]`}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.symRO ? (
                    <span className="font-bold text-[#663362]">{row.symbol}</span>
                  ) : (
                    <input
                      type="text"
                      value={answers[`sym${row.n}`] ?? ""}
                      onChange={(e) => set(`sym${row.n}`)(e.target.value)}
                      placeholder="…"
                      disabled={readOnly || grades[`sym${row.n}`] === "correct"}
                      className={`w-16 rounded-md border-2 px-2 py-1 text-center text-sm font-bold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
                        grades[`sym${row.n}`] === "correct"
                          ? "border-[#346739] bg-[#DBFFD5]/40"
                          : grades[`sym${row.n}`] === "incorrect"
                            ? "border-[#C44F4F] bg-[#C44F4F]/5"
                            : "border-[#34673933] bg-white"
                      } text-[#663362] disabled:cursor-default disabled:text-[#6B6B66]`}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.valRO ? (
                    <span className="font-semibold text-[#2C2C2A]">{row.value}</span>
                  ) : (
                    <input
                      type="text"
                      value={answers[`val${row.n}`] ?? ""}
                      onChange={(e) => set(`val${row.n}`)(e.target.value)}
                      placeholder="…"
                      disabled={readOnly || grades[`val${row.n}`] === "correct"}
                      className={`w-24 rounded-md border-2 px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
                        grades[`val${row.n}`] === "correct"
                          ? "border-[#346739] bg-[#DBFFD5]/40"
                          : grades[`val${row.n}`] === "incorrect"
                            ? "border-[#C44F4F] bg-[#C44F4F]/5"
                            : "border-[#34673933] bg-white"
                      } text-[#2C2C2A] disabled:cursor-default disabled:text-[#6B6B66]`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saved && (
        <FeedbackBox allCorrect={allCorrect} correctCount={correctCount} totalCount={totalCount} />
      )}

      <SaveButton onClick={handleSave} saved={saved && allCorrect} hidden={readOnly} />
    </div>
  );
}

// ============================================================================
// 2b. Aktivitas Deep Learning — PERTANYAAN EKSPLORASI (with its own save)
// ============================================================================

function DeepLearningQuestions({
  readOnly = false,
  onQuestionDone,
  q1Unlocked = false,
  q2Unlocked = false,
  q3Unlocked = false,
  savedAnswers,
  savedFeedbacks,
  savedStatus,
}: {
  readOnly?: boolean;
  onQuestionDone?: (qKey: string, isCorrect: boolean | null) => void;
  q1Unlocked?: boolean;
  q2Unlocked?: boolean;
  q3Unlocked?: boolean;
  savedAnswers?: Record<string, string>;
  savedFeedbacks?: Record<string, { feedback: string; isCorrect: boolean | null }>;
  savedStatus?: Record<string, boolean>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers ?? {});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [aiFeedbacks, setAiFeedbacks] = useState<Record<string, { feedback: string; isCorrect: boolean | null }>>(savedFeedbacks ?? {});
  const [saved, setSaved] = useState<Record<string, boolean>>(savedStatus ?? {});

  // Sync saved data into state
  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers((prev) => ({ ...savedAnswers, ...prev }));
    }
    if (savedFeedbacks && Object.keys(savedFeedbacks).length > 0) {
      setAiFeedbacks((prev) => ({ ...savedFeedbacks, ...prev }));
    }
    if (savedStatus && Object.keys(savedStatus).length > 0) {
      setSaved((prev) => ({ ...savedStatus, ...prev }));
    }
  }, [savedAnswers, savedFeedbacks, savedStatus]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
    },
    [],
  );

  const handleSaveQuestion = async (qKey: string, soalTeks: string) => {
    const answer = answers[qKey] ?? "";
    if (!answer.trim()) {
      setAiFeedbacks((p) => ({
        ...p,
        [qKey]: { feedback: "Tulis jawabanmu dulu ya! 📝", isCorrect: false },
      }));
      return;
    }

    setLoading((p) => ({ ...p, [qKey]: true }));

    try {
      const res = await fetch("/api/ai/deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: soalTeks,
          jawaban: answer,
          concept_id: "faktorial",
        }),
      });

      if (!res.ok) throw new Error("AI API error");
      const data = await res.json();
      const fb = {
        feedback: data.feedback ?? "Jawaban tersimpan.",
        isCorrect: (data.isCorrect as boolean | null) ?? null,
      };
      setAiFeedbacks((p) => ({ ...p, [qKey]: fb }));

      // Save to DB (fire-and-forget)
      fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "faktorial",
          answer: { question_key: qKey, jawaban: answer },
          feedback: fb.feedback,
          is_correct: fb.isCorrect,
        }),
      }).catch((err) => console.error("[deep-learning-q] DB save error:", err));

      setSaved((p) => ({ ...p, [qKey]: true }));
      if (onQuestionDone) onQuestionDone(qKey, fb.isCorrect);
    } catch {
      setAiFeedbacks((p) => ({
        ...p,
        [qKey]: { feedback: "Maaf, ada kendala. Coba lagi ya!", isCorrect: null },
      }));
    } finally {
      setLoading((p) => ({ ...p, [qKey]: false }));
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 space-y-4">
      <h3 className="text-lg font-semibold text-[#2C2C2A]">Pertanyaan Eksplorasi:</h3>

      {/* Q1 — unlocked after table is done */}
      {(q1Unlocked || readOnly) && (
      <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
        <p className="text-sm font-medium text-[#346739] mb-2">
          1. Apakah kamu melihat pola? Bagaimana hubungan n! dan (n-1)!?
        </p>
        <textarea
          value={answers["eks1"] ?? ""}
          onChange={(e) => set("eks1")(e.target.value)}
          placeholder="Tulis jawabanmu..."
          rows={3}
          disabled={readOnly || saved["eks1"]}
          className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
            readOnly || saved["eks1"]
              ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
              : "border-[#34673933]"
          }`}
        />
        {aiFeedbacks["eks1"] && (
          <AiFeedbackBox feedback={aiFeedbacks["eks1"].feedback} isCorrect={aiFeedbacks["eks1"].isCorrect} />
        )}
        <SaveButton
          onClick={() => handleSaveQuestion("eks1", "Apakah kamu melihat pola dalam tabel faktorial? Bagaimana hubungan n! dan (n-1)!?")}
          loading={loading["eks1"]}
          saved={saved["eks1"]}
          hidden={readOnly}
        />
      </div>
      )}

      {/* Q2 — unlocked after Q1 is correct */}
      {(q2Unlocked || readOnly) && (
      <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
        <p className="text-sm font-medium text-[#346739] mb-2">
          2. Berapakah nilai 0! menurutmu? (Coba pikirkan: ada berapa cara menyusun nol objek?)
        </p>
        <input
          type="text"
          value={answers["eks2"] ?? ""}
          onChange={(e) => set("eks2")(e.target.value)}
          placeholder="Tulis jawabanmu..."
          disabled={readOnly || saved["eks2"]}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
            readOnly || saved["eks2"]
              ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default border-[#34673933]"
              : "border-[#34673933] bg-white"
          }`}
        />
        {aiFeedbacks["eks2"] && (
          <AiFeedbackBox feedback={aiFeedbacks["eks2"].feedback} isCorrect={aiFeedbacks["eks2"].isCorrect} />
        )}
        <SaveButton
          onClick={() => handleSaveQuestion("eks2", "Berapakah nilai 0! menurutmu? Jelaskan alasanmu.")}
          loading={loading["eks2"]}
          saved={saved["eks2"]}
          hidden={readOnly}
        />
      </div>
      )}

      {/* Q3 — unlocked after Q2 is correct */}
      {(q3Unlocked || readOnly) && (
      <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
        <p className="text-sm font-medium text-[#346739] mb-2">
          3. Apakah n! = n × (n-1)! selalu berlaku?
        </p>
        <div className="flex gap-2 mb-2">
          {["Ya", "Tidak"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => !(readOnly || saved["eks3"]) && set("eks3")(opt)}
              disabled={readOnly || saved["eks3"]}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                answers["eks3"] === opt
                  ? readOnly || saved["eks3"]
                    ? "bg-[#346739]/50 text-white/70"
                    : "bg-[#346739] text-white"
                  : readOnly || saved["eks3"]
                    ? "bg-[#34673915]/50 text-[#346739]/50"
                    : "bg-[#34673915] text-[#346739] hover:bg-[#34673926]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <textarea
          value={answers["eks3_alasan"] ?? ""}
          onChange={(e) => set("eks3_alasan")(e.target.value)}
          placeholder="Ceritakan alasanmu..."
          rows={2}
          disabled={readOnly || saved["eks3"]}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
            readOnly || saved["eks3"]
              ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
              : "border-[#34673933]"
          }`}
        />
        {aiFeedbacks["eks3"] && (
          <AiFeedbackBox feedback={aiFeedbacks["eks3"].feedback} isCorrect={aiFeedbacks["eks3"].isCorrect} />
        )}
        <SaveButton
          onClick={() =>
            handleSaveQuestion(
              "eks3",
              "Apakah n! = n × (n-1)! selalu berlaku? Mengapa?"
            )
          }
          loading={loading["eks3"]}
          saved={saved["eks3"]}
          hidden={readOnly}
        />
      </div>
      )}
    </div>
  );
}

function AktivitasDeepLearning({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: FaktorialSavedData["deepLearning"] }) {
  const [tableDone, setTableDone] = useState(() => {
    // If saved data has table answers, the table was already completed
    if (savedData?.tableAnswers && Object.keys(savedData.tableAnswers).length > 0) return true;
    return false;
  });
  const [questionsDone, setQuestionsDone] = useState<Record<string, boolean>>(() => {
    // Pre-populate from savedData
    const init: Record<string, boolean> = {};
    if (savedData?.questionsStatus) {
      for (const [k, v] of Object.entries(savedData.questionsStatus)) {
        if (v) init[k] = true;
      }
    }
    return init;
  });
  // Track per-question correct status for sequential unlock
  const [q1Correct, setQ1Correct] = useState(() => {
    return savedData?.questionsStatus?.["eks1"] === true && savedData?.questionsFeedbacks?.["eks1"]?.isCorrect === true;
  });
  const [q2Correct, setQ2Correct] = useState(() => {
    return savedData?.questionsStatus?.["eks2"] === true && savedData?.questionsFeedbacks?.["eks2"]?.isCorrect === true;
  });

  const handleTableSave = (allCorrect: boolean) => {
    setTableDone(allCorrect);
  };

  const handleQuestionDone = (qKey: string, isCorrect: boolean | null) => {
    setQuestionsDone((prev) => ({ ...prev, [qKey]: isCorrect === true }));
    if (qKey === "eks1" && isCorrect === true) setQ1Correct(true);
    if (qKey === "eks2" && isCorrect === true) setQ2Correct(true);
  };

  // Check completion when table or questions change
  useEffect(() => {
    if (!onComplete) return;
    if (!tableDone) return;
    const allQDone = ["eks1", "eks2", "eks3"].every((k) => questionsDone[k] === true);
    if (allQDone) {
      onComplete();
    }
  }, [tableDone, questionsDone, onComplete]);

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>
      <p className="mb-4 text-xl font-semibold text-[#346739]">
        🔍 Eksplorasi: Temukan Pola Faktorial!
      </p>
      <DeepLearningTable readOnly={readOnly} onSave={handleTableSave} savedAnswers={savedData?.tableAnswers} />
      {(tableDone || readOnly) && (
        <div className="mt-5">
          <DeepLearningQuestions
            readOnly={readOnly}
            onQuestionDone={handleQuestionDone}
            q1Unlocked={tableDone}
            q2Unlocked={q1Correct}
            q3Unlocked={q2Correct}
            savedAnswers={savedData?.questionsAnswers}
            savedFeedbacks={savedData?.questionsFeedbacks}
            savedStatus={savedData?.questionsStatus}
          />
        </div>
      )}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 3. Penjelasan Konsep (READ-ONLY)
// ============================================================================

function PenjelasanKonsep({ onNext }: { onNext?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await fetch("/api/student-section-status/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "faktorial",
          section: "penjelasan_konsep",
        }),
      });
    } catch (err) {
      console.error("[penjelasan-konsep] Complete error:", err);
    } finally {
      setLoading(false);
      if (onNext) onNext();
    }
  };

  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Definisi Faktorial</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Faktorial dari bilangan bulat positif <b>n</b> (ditulis <b>n!</b>) adalah hasil
          perkalian semua bilangan bulat positif dari 1 sampai n:
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>
            {"$n! = n \\times (n-1) \\times (n-2) \\times \\dots \\times 3 \\times 2 \\times 1$"}
          </RichText>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">🔄 Sifat Rekursif</h3>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center mb-3">
          <RichText>{"$n! = n \\times (n-1)!$"}</RichText>
        </div>
        <p className="text-sm leading-relaxed text-[#2C2C2A]">
          Sifat ini memungkinkan kita menghitung faktorial secara bertahap. Contoh:
        </p>
        <div className="mt-2 space-y-1 font-mono text-sm text-[#2C2C2A]">
          <p>5! = 5 × 4! = 5 × 24 = 120</p>
          <p>6! = 6 × 5! = 6 × 120 = 720</p>
          <p>7! = 7 × 6! = 7 × 720 = 5.040</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">❓ Mengapa 0! = 1?</h3>

        <div className="mb-4 rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-3">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">⚠ Miskonsepsi Umum</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Banyak siswa mengira <b>0! = 0</b>. Ini salah! 0! = 1 karena ada tepat satu cara
            menyusun nol objek (yaitu, tidak ada yang disusun dan &ldquo;tidak ada susunan&rdquo;
            itu dihitung satu cara).
          </p>
        </div>

        <p className="mb-2 text-sm font-semibold text-[#346739]">Pembuktian dengan sifat rekursif:</p>
        <p className="mb-2 leading-relaxed text-[#2C2C2A]">
          Kita tahu bahwa <RichText>{"$n! = n \\times (n-1)!$"}</RichText>, maka untuk n = 1:
        </p>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 space-y-1 font-mono text-sm">
          <p className="text-[#2C2C2A]">
            <RichText>{"$1! = 1 \\times 0!$"}</RichText>
          </p>
          <p className="text-[#346739]">
            ⟹ <RichText>{"$0! = \\dfrac{1!}{1}$"}</RichText> (ingat bahwa 1! = 1)
          </p>
          <p className="text-[#346739]">
            ⟹ <RichText>{"$0! = \\dfrac{1}{1}$"}</RichText>
          </p>
          <p className="text-lg font-bold text-[#663362]">⟹ 0! = 1</p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />

      {onNext && <NextButton onClick={handleNext} loading={loading} />}
    </article>
  );
}

// ============================================================================
// 4. Contoh Soal Bertahap
// ============================================================================

const CONTOH1_EXPECTED: Record<string, string> = {
  c1_a: "7",
  c1_b: "6",
  c1_hasil: "42",
};

const CONTOH2_EXPECTED: Record<string, string> = {
  c2_a: "6",
  c2_b: "5",
  c2_n: "6",
};

const CONTOH3_EXPECTED: Record<string, string> = {
  c3_p1: "1",
  c3_sisa: "4",
  c3_faktorial: "4!",
  c3_total1: "1",
  c3_total2: "4!",
  c3_hasil: "24",
};

function ContohSoalBertahap({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: FaktorialSavedData["contohSoal"] }) {
  // Track which soal have been answered correctly (for sequential unlock)
  const [soal1Correct, setSoal1Correct] = useState(false);
  const [soal2Correct, setSoal2Correct] = useState(false);
  const [soal3Correct, setSoal3Correct] = useState(false);

  const handleSoal1Correct = () => {
    setSoal1Correct(true);
  };
  const handleSoal2Correct = () => {
    setSoal2Correct(true);
  };
  const handleSoal3Correct = () => {
    setSoal3Correct(true);
    if (onComplete) onComplete();
  };

  return (
    <article>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>
      <div className="flex flex-col gap-5">
        {/* Soal 1 always visible */}
        <Contoh1
          readOnly={readOnly || soal1Correct}
          onCorrect={handleSoal1Correct}
          savedAnswers={savedData?.["penjumlahan_minuman"]?.answer}
        />

        {/* Soal 2 visible only after soal 1 is correct */}
        {(soal1Correct || readOnly) && (
          <Contoh2
            readOnly={readOnly || soal2Correct}
            onCorrect={handleSoal2Correct}
            savedAnswers={savedData?.["penjumlahan_buku"]?.answer}
          />
        )}

        {/* Soal 3 visible only after soal 2 is correct */}
        {(soal2Correct || readOnly) && (
          <Contoh3
            readOnly={readOnly || soal3Correct}
            onCorrect={handleSoal3Correct}
            savedAnswers={savedData?.["penjumlahan_transport"]?.answer}
          />
        )}
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

function Contoh1({ readOnly = false, onCorrect, savedAnswers }: { readOnly?: boolean; onCorrect?: () => void; savedAnswers?: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers ?? {});
  const [grades, setGrades] = useState<GradeResult>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      setSaved(true);
      const g: GradeResult = {};
      for (const key of Object.keys(savedAnswers)) {
        g[key] = "correct";
      }
      setGrades(g);
    }
  }, [savedAnswers]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
      setGrades((p) => {
        if (!(key in p)) return p;
        const next = { ...p };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = () => {
    const { results } = gradeAnswers(CONTOH1_EXPECTED, answers);
    setGrades(results);
    setSaved(true);

    const allCorrect = Object.values(results).every((v) => v === "correct");
    fetch("/api/contoh-soal-bertahap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "faktorial",
        question_key: "penjumlahan_minuman",
        difficulty_level: "mudah",
        order_index: 0,
        answer: answers,
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[contoh1] DB save error:", err));

    if (allCorrect && onCorrect) onCorrect();
  };

  const gradedKeys = Object.keys(grades);
  const correctCount = gradedKeys.filter((k) => grades[k] === "correct").length;
  const totalCount = Object.keys(CONTOH1_EXPECTED).length;
  const allCorrect = correctCount === totalCount;

  return (
    <ContohSoalCard level="mudah" number={1} title="Menyederhanakan Pembagian Faktorial">
      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Hitunglah nilai dari{" "}
        <span className="font-mono font-bold text-[#663362]">
          <RichText>{"$\\dfrac{7!}{5!}$"}</RichText>
        </span>
      </p>

      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <p className="text-xs font-semibold text-[#346739] mb-2">💡 Langkah Berpikir:</p>
        <p className="font-mono text-sm text-[#2C2C2A] mb-2">
          <RichText>
            {"$\\dfrac{7!}{5!} = \\dfrac{7 \\times 6 \\times \\cancel{5!}}{\\cancel{5!}}$"}
          </RichText>
        </p>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A]">
          <span>=</span>
          <InputBlank value={answers["c1_a"] ?? ""} onChange={set("c1_a")} grade={grades["c1_a"] ?? null} disabled={readOnly || grades["c1_a"] === "correct"} />
          <span>×</span>
          <InputBlank value={answers["c1_b"] ?? ""} onChange={set("c1_b")} grade={grades["c1_b"] ?? null} disabled={readOnly || grades["c1_b"] === "correct"} />
          <span>=</span>
          <InputBlank value={answers["c1_hasil"] ?? ""} onChange={set("c1_hasil")} grade={grades["c1_hasil"] ?? null} className="w-20" disabled={readOnly || grades["c1_hasil"] === "correct"} />
        </div>
      </div>

      <div className="rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-2.5">
        <p className="text-xs text-[#C44F4F]">
          ⚠ Jangan langsung hitung 7! dan 5! secara penuh — sederhanakan dulu!
        </p>
      </div>

      {saved && (
        <FeedbackBox allCorrect={allCorrect} correctCount={correctCount} totalCount={totalCount} />
      )}

      <SaveButton onClick={handleSave} saved={saved && allCorrect} hidden={readOnly} />
    </ContohSoalCard>
  );
}

function Contoh2({ readOnly = false, onCorrect, savedAnswers }: { readOnly?: boolean; onCorrect?: () => void; savedAnswers?: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers ?? {});
  const [grades, setGrades] = useState<GradeResult>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      setSaved(true);
    }
  }, [savedAnswers]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
      setGrades((p) => {
        if (!(key in p)) return p;
        const next = { ...p };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = () => {
    // Accept both orderings: 6×5 or 5×6
    const a = (answers["c2_a"] ?? "").trim();
    const b = (answers["c2_b"] ?? "").trim();
    const results: GradeResult = {};

    const pairOk = (a === "6" && b === "5") || (a === "5" && b === "6");
    results["c2_a"] = pairOk ? "correct" : "incorrect";
    results["c2_b"] = pairOk ? "correct" : "incorrect";
    results["c2_n"] = (answers["c2_n"] ?? "").trim() === "6" ? "correct" : "incorrect";

    setGrades(results);
    setSaved(true);

    const allCorrect = Object.values(results).every((v) => v === "correct");
    fetch("/api/contoh-soal-bertahap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "faktorial",
        question_key: "penjumlahan_buku",
        difficulty_level: "sedang",
        order_index: 1,
        answer: answers,
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[contoh2] DB save error:", err));

    if (allCorrect && onCorrect) onCorrect();
  };

  const gradedKeys = Object.keys(grades);
  const correctCount = gradedKeys.filter((k) => grades[k] === "correct").length;
  const totalCount = 3;
  const allCorrect = correctCount === totalCount;

  return (
    <ContohSoalCard level="sedang" number={2} title="Menentukan Nilai n dari Persamaan Faktorial">
      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Tentukan nilai n jika{" "}
        <span className="font-mono font-bold text-[#663362]">
          <RichText>{"$\\dfrac{n!}{(n-2)!} = 30$"}</RichText>
        </span>
      </p>

      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <p className="text-xs font-semibold text-[#346739] mb-2">💡 Langkah Berpikir:</p>
        <div className="font-mono text-sm text-[#2C2C2A] space-y-1 mb-2">
          <p>
            <RichText>{"$\\dfrac{n!}{(n-2)!} = 30$"}</RichText>
          </p>
          <p>
            <RichText>
              {"$\\iff \\dfrac{n \\times (n-1) \\times \\cancel{(n-2)!}}{\\cancel{(n-2)!}} = 30$"}
            </RichText>
          </p>
          <p>
            <RichText>{"$\\iff n \\times (n-1) = 30$"}</RichText>
          </p>
        </div>
        <p className="text-xs text-[#34673999] mb-2">
          Cari dua bilangan berurutan yang hasil kalinya 30:
        </p>
        <div className="flex items-center gap-1 flex-wrap text-sm text-[#2C2C2A]">
          <InputBlank value={answers["c2_a"] ?? ""} onChange={set("c2_a")} grade={grades["c2_a"] ?? null} disabled={readOnly || grades["c2_a"] === "correct"} />
          <span>×</span>
          <InputBlank value={answers["c2_b"] ?? ""} onChange={set("c2_b")} grade={grades["c2_b"] ?? null} disabled={readOnly || grades["c2_b"] === "correct"} />
          <span>= 30</span>
        </div>
      </div>

      <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
        <p className="text-sm text-[#2C2C2A]">
          Jadi n ={" "}
          <InputBlank value={answers["c2_n"] ?? ""} onChange={set("c2_n")} grade={grades["c2_n"] ?? null} className="w-16" disabled={readOnly || grades["c2_n"] === "correct"} />
        </p>
      </div>

      {saved && (
        <FeedbackBox allCorrect={allCorrect} correctCount={correctCount} totalCount={totalCount} />
      )}

      <SaveButton onClick={handleSave} saved={saved && allCorrect} hidden={readOnly} />
    </ContohSoalCard>
  );
}

function Contoh3({ readOnly = false, onCorrect, savedAnswers }: { readOnly?: boolean; onCorrect?: () => void; savedAnswers?: Record<string, string> }) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers ?? {});
  const [grades, setGrades] = useState<GradeResult>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      setSaved(true);
    }
  }, [savedAnswers]);

  const set = useCallback(
    (key: string) => (v: string) => {
      setAnswers((p) => ({ ...p, [key]: v }));
      setGrades((p) => {
        if (!(key in p)) return p;
        const next = { ...p };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = () => {
    const { results } = gradeAnswers(CONTOH3_EXPECTED, answers);

    // Allow "24" as alternative for "4!" in c3_faktorial & c3_total2
    // Both are logically correct: 4! = 24
    if (results["c3_faktorial"] === "incorrect") {
      const v = normalizeAnswer(answers["c3_faktorial"] ?? "");
      if (v === "24") results["c3_faktorial"] = "correct";
    }
    if (results["c3_total2"] === "incorrect") {
      const v = normalizeAnswer(answers["c3_total2"] ?? "");
      if (v === "24") results["c3_total2"] = "correct";
    }

    setGrades(results);
    setSaved(true);

    const allCorrect = Object.values(results).every((v) => v === "correct");
    fetch("/api/contoh-soal-bertahap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "faktorial",
        question_key: "penjumlahan_transport",
        difficulty_level: "sedang",
        order_index: 2,
        answer: answers,
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[contoh3] DB save error:", err));

    if (allCorrect && onCorrect) onCorrect();
  };

  const gradedKeys = Object.keys(grades);
  const correctCount = gradedKeys.filter((k) => grades[k] === "correct").length;
  const totalCount = Object.keys(CONTOH3_EXPECTED).length;
  const allCorrect = correctCount === totalCount;

  return (
    <ContohSoalCard level="sedang" number={3} title="Mengantri di Loket dengan Posisi Tetap">
      <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">
        Berapa banyak cara 5 siswa dapat mengantri di loket sekolah, jika siswa{" "}
        <b>A harus berada di posisi pertama</b>?
      </p>

      {/* Ilustrasi visual */}
      <div className="mb-4 rounded-xl border border-[#34673926] bg-white p-4">
        <p className="text-xs font-medium text-[#346739] mb-3">🎨 Visualisasi Posisi Antrian:</p>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#663362] text-white font-bold text-sm shadow-sm ring-2 ring-[#66336233]">
              A
            </div>
            <span className="mt-1 text-[10px] font-medium text-[#663362]">Posisi 1</span>
            <span className="text-[10px] text-[#34673999]">(tetap)</span>
          </div>
          <span className="text-[#34673999] text-lg">→</span>
          {["?", "?", "?", "?"].map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBFFD5] text-[#346739] font-bold text-sm border-2 border-dashed border-[#34673933]">
                  {label}
                </div>
                <span className="mt-1 text-[10px] font-medium text-[#34673999]">Posisi {i + 2}</span>
                <span className="text-[10px] text-[#34673966]">(bebas)</span>
              </div>
              {i < 3 && <span className="text-[#34673999] text-lg">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-3">
        <p className="text-xs font-semibold text-[#346739] mb-2">💡 Langkah Berpikir:</p>
        <ul className="space-y-2 text-sm leading-relaxed text-[#2C2C2A]">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#663362] text-[10px] font-bold text-white shrink-0">1</span>
            <span>
              Posisi 1 <b>sudah tetap</b> untuk A → hanya{" "}
              <InputBlank value={answers["c3_p1"] ?? ""} onChange={set("c3_p1")} grade={grades["c3_p1"] ?? null} className="w-12" disabled={readOnly || grades["c3_p1"] === "correct"} />{" "}
              pilihan
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#663362] text-[10px] font-bold text-white shrink-0">2</span>
            <span>
              Posisi 2–5 dapat diisi oleh{" "}
              <InputBlank value={answers["c3_sisa"] ?? ""} onChange={set("c3_sisa")} grade={grades["c3_sisa"] ?? null} className="w-12" disabled={readOnly || grades["c3_sisa"] === "correct"} />{" "}
              siswa lain secara bebas →{" "}
              <InputBlank value={answers["c3_faktorial"] ?? ""} onChange={set("c3_faktorial")} grade={grades["c3_faktorial"] ?? null} className="w-14" disabled={readOnly || grades["c3_faktorial"] === "correct"} />{" "}
              cara
            </span>
          </li>
        </ul>
      </div>

      <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
        <p className="text-sm text-[#2C2C2A]">
          Total ={" "}
          <InputBlank value={answers["c3_total1"] ?? ""} onChange={set("c3_total1")} grade={grades["c3_total1"] ?? null} className="w-12" disabled={readOnly || grades["c3_total1"] === "correct"} />{" "}
          ×{" "}
          <InputBlank value={answers["c3_total2"] ?? ""} onChange={set("c3_total2")} grade={grades["c3_total2"] ?? null} className="w-12" disabled={readOnly || grades["c3_total2"] === "correct"} />{" "}
          ={" "}
          <InputBlank value={answers["c3_hasil"] ?? ""} onChange={set("c3_hasil")} grade={grades["c3_hasil"] ?? null} className="w-20" disabled={readOnly || grades["c3_hasil"] === "correct"} />{" "}
          cara
        </p>
      </div>

      {saved && (
        <FeedbackBox allCorrect={allCorrect} correctCount={correctCount} totalCount={totalCount} />
      )}

      <SaveButton onClick={handleSave} saved={saved && allCorrect} hidden={readOnly} />
    </ContohSoalCard>
  );
}

// ── Helper: Contoh Soal Card ──────────────────────────────────────

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
// 5. Mengapa? Corner
// ============================================================================

function MengapaCorner({ readOnly = false, onNext, savedData }: { readOnly?: boolean; onNext?: () => void; savedData?: FaktorialSavedData["mengapa"] }) {
  const [answer, setAnswer] = useState(savedData?.jawaban ?? "");
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    feedback: string;
    isCorrect: boolean | null;
  } | null>(() => {
    if (savedData?.feedback) {
      return { feedback: savedData.feedback, isCorrect: savedData.isCorrect ?? null };
    }
    return null;
  });
  const [saved, setSaved] = useState(() => !!savedData);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync savedData when it arrives (e.g. from "Lihat jawabanku")
  useEffect(() => {
    if (savedData) {
      setAnswer(savedData.jawaban ?? "");
      if (savedData.feedback) {
        setAiFeedback({ feedback: savedData.feedback, isCorrect: savedData.isCorrect ?? null });
      }
      setSaved(true);
    }
  }, [savedData]);

  const handleSave = async () => {
    // Validate
    if (!answer.trim()) {
      setValidationError("Tulis jawabanmu dulu ya! 📝");
      return;
    }
    setValidationError(null);
    setLoading(true);

    try {
      // 1. Send to AI for feedback
      const aiRes = await fetch("/api/ai/eksplorasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soal: "Menurutmu, kenapa faktorial penting dalam kehidupan sehari-hari? Berikan contoh sederhana!",
          jawaban: answer,
          alasan: "",
        }),
      });

      if (!aiRes.ok) throw new Error("AI API error");
      const aiData = await aiRes.json();
      const fb = {
        feedback: aiData.feedback ?? "Jawaban tersimpan.",
        isCorrect: (aiData.isCorrect as boolean | null) ?? null,
      };
      setAiFeedback(fb);

      // 2. Save to eksplorasi_kontekstual (fire-and-forget)
      fetch("/api/eksplorasi-kontekstual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "faktorial",
          question_key: "mengapa_corner",
          answer: { soal: "Mengapa faktorial penting?", jawaban: answer, alasan: "" },
          feedback: fb.feedback,
          is_correct: fb.isCorrect,
        }),
      }).catch((err) => console.error("[mengapa-corner] DB save error:", err));

      // 3. Mark mengapa_corner as completed in student_section_status
      fetch("/api/student-section-status/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "faktorial",
          section: "mengapa_corner",
        }),
      }).catch((err) => console.error("[mengapa-corner] complete section error:", err));

      setSaved(true);

      // Advance to next section after brief delay (so user sees feedback first)
      if (onNext) {
        setTimeout(() => onNext(), 1500);
      }
    } catch {
      setAiFeedback({
        feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!",
        isCorrect: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-lg font-bold text-[#346739]">
          💡 Mengapa faktorial tumbuh sangat cepat?
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-[#663362] text-sm w-12">10!</span>
            <span className="text-sm text-[#2C2C2A]">= 3.628.800</span>
            <span className="text-xs text-[#34673999]">(3,6 juta)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-[#663362] text-sm w-12">20!</span>
            <span className="text-sm text-[#2C2C2A]">= 2.432.902.008.176.640.000</span>
            <span className="text-xs text-[#34673999]">(2,4 kuintiliun!)</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 mb-4">
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Faktorial bertumbuh <b>lebih cepat dari fungsi eksponensial</b>. Ini menjelaskan
            mengapa masalah penjadwalan atau pengurutan dalam jumlah besar sangat kompleks —
            bahkan komputer super pun butuh waktu lama untuk mencobanya satu per satu!
          </p>
        </div>

        <div className="rounded-lg border-2 border-[#34673926] bg-[#DBFFD5]/20 px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-[#346739] mb-1">🌟 Fakta Menarik</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Jika ada 20 orang dalam sebuah ruangan dan mereka bisa duduk dalam urutan berapa pun,
            jumlah kemungkinan susunannya <b>lebih banyak dari jumlah bintang di seluruh galaksi
            Bima Sakti!</b>
          </p>
        </div>

        <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
          <p className="text-sm font-medium text-[#346739] mb-2">
            🤔 Menurutmu, kenapa faktorial penting dalam kehidupan sehari-hari? Berikan contoh
            sederhana!
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tulis jawabanmu..."
            rows={3}
            disabled={readOnly || saved}
            className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
              readOnly || saved
                ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
                : "border-[#34673933]"
            }`}
          />
        </div>

        {validationError && (
          <div className="mt-3 rounded-lg border border-[#C44F4F33] bg-[#C44F4F08] p-3">
            <p className="text-sm text-[#C44F4F]">{validationError}</p>
          </div>
        )}

        {aiFeedback && (
          <AiFeedbackBox
            feedback={aiFeedback.feedback}
            isCorrect={aiFeedback.isCorrect}
          />
        )}

        <SaveButton onClick={handleSave} loading={loading} saved={saved} hidden={readOnly} />
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// 6. Refleksi Mini
// ============================================================================

function RefleksiMini({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: FaktorialSavedData["refleksi"] }) {
  const questions = [
    { key: "refleksi_faktorial_1", q: "Jelaskan dengan kata-katamu sendiri: apa itu faktorial?" },
    { key: "refleksi_faktorial_2", q: "Mengapa kita perlu konsep faktorial? Apa hubungannya dengan Kaidah Perkalian?" },
    { key: "refleksi_faktorial_3", q: "Bagaimana cara menyederhanakan n!/(n-2)! tanpa menghitung semua?" },
    { key: "refleksi_faktorial_4", q: "Sebentar lagi kamu akan mempelajari permutasi dan kombinasi. Berdasarkan apa yang sudah kamu pahami tentang faktorial sejauh ini, tuliskan dugaanmu mengapa rumus permutasi dan kombinasi kemungkinan akan melibatkan faktorial? Kamu tidak perlu benar, tuliskan saja pendapatmu!" },
  ];

  const allKeys = questions.map((q) => q.key);

  // ── Sequential unlocking state ──────────────────────────────────
  const [unlockedCount, setUnlockedCount] = useState(() => {
    // Determine how many questions were previously answered correctly from savedData
    let count = 1; // Q1 always unlocked
    if (savedData) {
      for (let i = 0; i < questions.length - 1; i++) {
        if (savedData[questions[i].key]?.isCorrect === true) {
          count = i + 2; // This Q is correct → unlock the next one
        } else {
          break; // Stop at first not-yet-correct question
        }
      }
    }
    return Math.min(count, questions.length);
  });

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (savedData) {
      for (const q of questions) {
        init[q.key] = savedData[q.key]?.answer ?? "";
      }
    }
    return init;
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [aiFeedbacks, setAiFeedbacks] = useState<Record<string, { feedback: string; isCorrect: boolean | null }>>(() => {
    const init: Record<string, { feedback: string; isCorrect: boolean | null }> = {};
    if (savedData) {
      for (const q of questions) {
        const entry = savedData[q.key];
        if (entry) {
          init[q.key] = { feedback: entry.feedback ?? "", isCorrect: entry.isCorrect };
        }
      }
    }
    return init;
  });
  const [saved, setSaved] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (savedData) {
      for (const q of questions) {
        // Only mark as saved if the answer was correct — wrong answers stay retryable
        if (savedData[q.key]?.isCorrect === true) init[q.key] = true;
      }
    }
    return init;
  });

  const set = useCallback(
    (key: string) => (v: string) => setAnswers((p) => ({ ...p, [key]: v })),
    [],
  );

  const handleSaveQuestion = async (q: { key: string; q: string }, index: number) => {
    const answer = answers[q.key] ?? "";
    if (!answer.trim()) {
      setAiFeedbacks((p) => ({
        ...p,
        [q.key]: { feedback: "Tulis jawabanmu dulu ya! 📝", isCorrect: false },
      }));
      return;
    }

    setLoading((p) => ({ ...p, [q.key]: true }));

    try {
      const res = await fetch("/api/refleksi-mini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "faktorial",
          rows: [{ question_key: q.key, soal: q.q, answer }],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const result = data.feedback?.[q.key];

      const fb = {
        feedback: (result as { feedback?: string })?.feedback ?? "Jawaban tersimpan.",
        isCorrect: ((result as { isCorrect?: boolean })?.isCorrect as boolean | null) ?? null,
      };
      setAiFeedbacks((p) => ({ ...p, [q.key]: fb }));

      // Only mark as saved & unlock next question if the answer is correct
      if (fb.isCorrect === true) {
        setSaved((p) => {
          const next = { ...p, [q.key]: true };
          // Check if all questions are saved
          if (allKeys.every((k) => next[k]) && onComplete) {
            onComplete();
          }
          return next;
        });

        // Unlock next question sequentially
        const nextIndex = index + 1;
        if (nextIndex < questions.length) {
          setUnlockedCount((prev) => Math.max(prev, nextIndex + 1));
        }
      }
      // If wrong, don't lock the field — allow retry
    } catch {
      setAiFeedbacks((p) => ({
        ...p,
        [q.key]: { feedback: "Maaf, ada kendala. Coba lagi ya!", isCorrect: null },
      }));
    } finally {
      setLoading((p) => ({ ...p, [q.key]: false }));
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
          const isUnlocked = i < unlockedCount || readOnly;
          const fb = aiFeedbacks[item.key];
          const isSaved = saved[item.key];
          const isLoading = loading[item.key];

          // ── Locked question (hidden until previous is answered) ─
          if (!isUnlocked) {
            return null;
          }

          // ── Unlocked question ──────────────────────────────────
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
                    rows={3}
                    disabled={readOnly || isSaved}
                    className={`w-full rounded-xl border px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] ${
                      readOnly || isSaved
                        ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none border-[#34673933]"
                        : "border-[#34673933]"
                    }`}
                  />
                  {fb && (
                    <AiFeedbackBox feedback={fb.feedback} isCorrect={fb.isCorrect} />
                  )}
                  <SaveButton
                    onClick={() => handleSaveQuestion(item, i)}
                    loading={isLoading}
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

/** Jawaban entries returned by /api/student-section-status/jawaban */
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

/** Saved data shapes per section for faktorial */
interface FaktorialSavedData {
  eksplorasi?: Record<string, string>;
  deepLearning?: {
    /** Table answer keys (val5, sym6, calc8, etc.) */
    tableAnswers: Record<string, string>;
    /** Table feedback / isCorrect */
    tableFeedback: string | null;
    tableIsCorrect: boolean | null;
    /** Q1/Q2/Q3 answers keyed by eks1, eks2, eks3 */
    questionsAnswers: Record<string, string>;
    /** Q1/Q2/Q3 AI feedbacks keyed by eks1, eks2, eks3 */
    questionsFeedbacks: Record<string, { feedback: string; isCorrect: boolean | null }>;
    /** Q1/Q2/Q3 saved status keyed by eks1, eks2, eks3 */
    questionsStatus: Record<string, boolean>;
  };
  contohSoal?: Record<string, { answer: Record<string, string>; isCorrect: boolean }>;
  mengapa?: { jawaban: string; alasan: string; feedback: string | null; isCorrect: boolean | null };
  refleksi?: Record<string, { answer: string; feedback: string | null; isCorrect: boolean | null }>;
}

/** Convert raw jawaban entries to section-specific saved data */
function entriesToSavedData(section: string, entries: JawabanEntry[]): Partial<FaktorialSavedData> {
  /** Safely parse answer — handles both JSON strings and objects from DB */
  function safeAnswer(raw: unknown): Record<string, unknown> | null {
    if (!raw) return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return null; }
    }
    if (typeof raw === "object" && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    return null;
  }

  switch (section) {
    case "eksplorasi_kontekstual": {
      // Multiple question_keys share the eksplorasi_kontekstual table
      // (e.g., "faktorialNotasi" + "mengapa_corner"). The real eksplorasi
      // answer always has many sub-answer keys. Pick the entry with the most keys.
      let bestEntry: JawabanEntry | undefined;
      let bestKeyCount = -1;
      for (const e of entries) {
        const ans = safeAnswer(e.answer);
        if (!ans) continue;
        const keyCount = Object.keys(ans).length;
        if (keyCount > bestKeyCount) {
          bestKeyCount = keyCount;
          bestEntry = e;
        }
      }
      const answer = safeAnswer(bestEntry?.answer);
      if (!answer) return {};
      return { eksplorasi: answer as Record<string, string> };
    }
    case "aktivitas_deep_learning": {
      // Separate table entry from Q entries based on questionKey
      // "deep_learning_table" = table answers, "eks1"/"eks2"/"eks3" = Q answers
      let tableEntry: JawabanEntry | null = null;
      const qEntries: JawabanEntry[] = [];

      for (const e of entries) {
        if (e.questionKey === "deep_learning_table") {
          tableEntry = e;
        } else if (["eks1", "eks2", "eks3"].includes(e.questionKey)) {
          qEntries.push(e);
        }
      }

      // Build tableAnswers from table entry
      const tableAnswerRaw = safeAnswer(tableEntry?.answer);
      const tableAnswers: Record<string, string> = {};
      if (tableAnswerRaw) {
        // Filter out meta keys (graded) and keep only answer keys
        for (const [k, v] of Object.entries(tableAnswerRaw)) {
          if (k !== "graded" && typeof v === "string") {
            tableAnswers[k] = v;
          }
        }
      }

      // Build questions data
      const questionsAnswers: Record<string, string> = {};
      const questionsFeedbacks: Record<string, { feedback: string; isCorrect: boolean | null }> = {};
      const questionsStatus: Record<string, boolean> = {};

      for (const qe of qEntries) {
        const ans = safeAnswer(qe.answer);
        const qKey = qe.questionKey;
        // The answer for Q entries is { question_key: "eks1", jawaban: "..." }
        const jawaban = (ans?.jawaban as string) ?? (typeof qe.answer === "string" ? qe.answer : "");
        questionsAnswers[qKey] = jawaban;
        questionsFeedbacks[qKey] = {
          feedback: qe.feedback ?? "",
          isCorrect: qe.isCorrect,
        };
        questionsStatus[qKey] = true;
      }

      return {
        deepLearning: {
          tableAnswers,
          tableFeedback: tableEntry?.feedback ?? null,
          tableIsCorrect: tableEntry?.isCorrect ?? null,
          questionsAnswers,
          questionsFeedbacks,
          questionsStatus,
        },
      };
    }
    case "contoh_soal": {
      const data: Record<string, { answer: Record<string, string>; isCorrect: boolean }> = {};
      for (const e of entries) {
        const answer = safeAnswer(e.answer);
        data[e.questionKey] = {
          answer: (answer as Record<string, string>) ?? {},
          isCorrect: e.isCorrect === true,
        };
      }
      return { contohSoal: data };
    }
    case "mengapa_corner": {
      // Stored in eksplorasi_kontekstual table with question_key = "mengapa_corner"
      // answer structure: { soal: string, jawaban: string, alasan: string }
      const entry = entries[0];
      if (!entry) return {};
      const ans = safeAnswer(entry.answer);
      return {
        mengapa: {
          jawaban: (ans?.jawaban as string) ?? "",
          alasan: (ans?.alasan as string) ?? "",
          feedback: entry.feedback,
          isCorrect: entry.isCorrect,
        },
      };
    }
    case "refleksi_mini": {
      const data: Record<string, { answer: string; feedback: string | null; isCorrect: boolean | null }> = {};
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

/**
 * Wraps a DB-tracked section. When the section was already completed before
 * the current session (wasPreCompleted=true), shows a collapsed "Bagian ini
 * sudah selesai" view with a "Lihat jawabanku" button.
 *
 * Uses render-prop pattern: children receives derived savedData.
 */
function CollapsibleJawabanSection({
  sectionName,
  isCompleted,
  wasPreCompleted,
  jawabanData,
  loadingJawaban,
  onFetchJawaban,
  children,
}: {
  sectionName: string;
  isCompleted: boolean;
  wasPreCompleted: boolean;
  jawabanData: Record<string, JawabanEntry[]>;
  loadingJawaban: Record<string, boolean>;
  onFetchJawaban: (sectionName: string) => void;
  children: (savedData: Partial<FaktorialSavedData> | undefined) => React.ReactNode;
}) {
  const entries = jawabanData[sectionName];
  const isLoading = loadingJawaban[sectionName] ?? false;
  const hasJawaban = entries !== undefined && entries.length > 0;

  if (!isCompleted) {
    return <>{children(undefined)}</>;
  }

  // Just completed in this session — show expanded immediately
  if (!wasPreCompleted) {
    return <>{children(undefined)}</>;
  }

  // Pre-completed + jawaban already loaded — pass savedData to children
  if (hasJawaban) {
    const savedData = entriesToSavedData(sectionName, entries);
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
          onClick={() => onFetchJawaban(sectionName)}
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

export default function FaktorialContent({
  onComplete,
  initialCompletedSections = {},
}: {
  onComplete?: () => void;
  /** Section indices yang sudah complete dari backend (hanya DB-tracked: 0,1,3,5) */
  initialCompletedSections?: Record<number, boolean>;
}) {
  const onCompleteCalled = useRef(false);

  // ── State untuk on-demand "Lihat jawabanku" ──────────────────
  const [jawabanData, setJawabanData] = useState<Record<string, JawabanEntry[]>>({});
  const [loadingJawaban, setLoadingJawaban] = useState<Record<string, boolean>>({});

  /** Fetch jawaban+feedback untuk satu section dari on-demand endpoint */
  async function fetchJawaban(sectionName: string) {
    if (loadingJawaban[sectionName] || jawabanData[sectionName]) return;

    setLoadingJawaban((prev) => ({ ...prev, [sectionName]: true }));
    try {
      const res = await fetch(
        `/api/student-section-status/jawaban?concept_id=faktorial&section=${sectionName}`
      );
      if (!res.ok) {
        console.error("[fetchJawaban] Failed:", res.status);
        return;
      }
      const data: JawabanResponse = await res.json();
      setJawabanData((prev) => ({ ...prev, [sectionName]: data.entries }));
    } catch (err) {
      console.error("[fetchJawaban] Error:", err);
    } finally {
      setLoadingJawaban((prev) => ({ ...prev, [sectionName]: false }));
    }
  }

  // ── Build initial state dari data backend ───────────────────────
  function buildInitialState(): {
    currentSection: number;
    completedSections: Record<number, boolean>;
  } {
    const cs: Record<number, boolean> = { ...initialCompletedSections };

    // Section 2 (Penjelasan Konsep, read-only) — infer dari section 3 atau 5
    if (cs[3] || cs[5]) cs[2] = true;
    // Section 4 (Mengapa Corner, read-only) — infer dari section 5
    if (cs[5]) cs[4] = true;

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
      if (sectionIndex === 3 || sectionIndex === 5) {
        next[2] = true; // penjelasan_konsep inferred from contoh_soal or refleksi
      }
      if (sectionIndex === 5) {
        next[4] = true; // mengapa_corner
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

  const allComplete = isCompleted(5);

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
          Materi 3
        </p>
        <h1 className="text-2xl font-bold text-[#1a3d1c]">Faktorial</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#5a7d5c]">
          Alat matematis penunjang permutasi & kombinasi — pelajari notasi ringkas perkalian
          berurutan sebelum merakit mesin yang lebih besar.
        </p>
      </div>

      {/* Catatan Penting */}
      <div className="mb-4 rounded-xl border border-[#34673926] bg-[#DBFFD5]/30 px-4 py-3">
        <p className="text-sm leading-relaxed text-[#2C2C2A]">
          📌 <b>Perhatikan:</b> Faktorial bukan bagian dari kaidah pencacahan — ia tidak
          menjawab &ldquo;berapa banyak cara?&rdquo; secara langsung. Faktorial adalah notasi
          matematika yang mempersingkat penulisan perkalian berurutan. Kita mempelajarinya di
          sini karena tanpa faktorial, rumus permutasi dan kombinasi tidak bisa dituliskan secara
          ringkas dan efisien. Anggap faktorial sebagai <b>kunci pas</b> yang kamu butuhkan
          sebelum merakit mesin yang lebih besar.
        </p>
      </div>

      <SectionProgress currentSection={currentSection} completedSections={completedSections} />

      {/* Section 0: Eksplorasi Kontekstual */}
      {isVisible(0) && (
        <CollapsibleJawabanSection
          sectionName="eksplorasi_kontekstual"
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
          sectionName="aktivitas_deep_learning"
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
          sectionName="contoh_soal"
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
          sectionName="mengapa_corner"
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
              onNext={isActive(4) ? () => handleNext(4) : undefined}
            />
          )}
        </CollapsibleJawabanSection>
      )}

      {/* Section 5: Refleksi Mini */}
      {isVisible(5) && (
        <CollapsibleJawabanSection
          sectionName="refleksi_mini"
          isCompleted={isCompleted(5)}
          wasPreCompleted={initialCompletedSections[5] === true}
          jawabanData={jawabanData}
          loadingJawaban={loadingJawaban}
          onFetchJawaban={fetchJawaban}
        >
          {(savedData) => (
            <RefleksiMini
              readOnly={isCompleted(5)}
              savedData={savedData?.refleksi}
              onComplete={isActive(5) ? () => markComplete(5) : undefined}
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
              🎉 Semua bagian Faktorial selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan Eksplorasi, Deep Learning, Penjelasan Konsep, Contoh Soal, Mengapa Corner, dan Refleksi. Lanjutkan mengerjakan Asesmen Formatif Materi Faktorial!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Named exports
export {
  EksplorasiKontekstual,
  AktivitasDeepLearning,
  PenjelasanKonsep,
  ContohSoalBertahap,
  MengapaCorner,
  RefleksiMini,
};
