"use client";

import React, { useState, useCallback, useEffect } from "react";
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

// ── Step Definitions ───────────────────────────────────────────
interface StepConfig {
  index: number;
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
  /** If true, always allow progression (AI gives feedback, no grading gate). */
  aiFeedbackOnly?: boolean;
}

const STEPS: StepConfig[] = [
  {
    index: 0,
    questionKey: "bagian_a",
    entryType: "soal",
    label: "Bagian A — Eksplorasi Cara Cepat",
    soalText:
      "Bagian A: (1) 8!/6! = ? (2) 9!/7! = ? (3) 10!/8! = ?\nPola: n!/(n-2)! = ?",
  },
  {
    index: 1,
    questionKey: "bagian_b",
    entryType: "soal",
    label: "Bagian B — Tantangan Lebih Dalam",
    soalText:
      "Bagian B: (4) 7!/(3!·4!) = ? (5) 10!/(2!·8!) = ? (6) n!/(n-1)! = ? (dalam n)",
  },
  {
    index: 2,
    questionKey: "bagian_c",
    entryType: "soal",
    label: "Bagian C — Cari Nilai n",
    soalText:
      "Bagian C: (7) n!/(n-2)! = 42, n = ? (8) n!/(n-3)! = 60, n = ?",
    aiFeedbackOnly: true,
  },
  {
    index: 3,
    questionKey: "bagian_d",
    entryType: "refleksi",
    label: "Bagian D — Diskusi Pasangan",
    soalText:
      "Diskusi: (a) Mengapa mencoret faktor sama bisa dilakukan? (b) Cek: 5!/3! vs 2! dan 2!×3! vs (2×3)! (c) Tips cara cepat faktorial.",
    aiFeedbackOnly: true,
  },
];

const TOTAL_STEPS = STEPS.length;

// ── Ground truth for rule-based grading (Bagian A & B) ──────────

/** Normalize a number string: remove spaces, commas, leading zeros */
function normalizeNumber(s: string): string {
  return s.replace(/[\s,]/g, "").replace(/^0+(?=\d)/, "");
}

/** Normalize a pattern answer: lowercase, remove spaces, normalize multiplication signs */
function normalizePattern(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[xX]/g, "×")     // letter x → multiplication sign
    .replace(/\*/g, "×")       // * → multiplication sign
    .replace(/\.(?=\()/g, "×") // . before ( → multiplication sign (e.g. n.(n-1))
    .replace(/\^2/g, "²")      // ^2 → ²
    .replace(/−/g, "-");       // unicode minus → regular minus
}

/** Check if a numeric answer is correct */
function checkNumberAnswer(input: string, expected: string): boolean {
  const norm = normalizeNumber(input.trim());
  const exp = normalizeNumber(expected);
  // Also check if input contains the expected as part of a longer expression (e.g. "8×7 = 56")
  return norm === exp || norm.includes(exp) || exp.includes(norm);
}

/** Check pattern answer for n!/(n-2)! — accept n×(n-1), n²-n, n(n-1), etc. */
function checkPatternNMinus2(input: string): boolean {
  const n = normalizePattern(input);
  // Remove common prefixes like "pola:" or "="
  const cleaned = n.replace(/^(pola[:=]?\s*|=\s*)/, "");
  const validPatterns = [
    "n×(n-1)", "n(n-1)",
    "n²-n",
  ];
  return validPatterns.some((p) => normalizePattern(p) === cleaned);
}

/** Check pattern answer for n!/(n-1)! — accept "n" */
function checkPatternNMinus1(input: string): boolean {
  const n = normalizePattern(input);
  const cleaned = n.replace(/^(pola[:=]?\s*|=\s*)/, "");
  return cleaned === "n" || cleaned === "n1";
}

// ── Spinner ──────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Feedback Box ─────────────────────────────────────────────────
function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const borderColor = isCorrect === false ? "border-[#C44F4F33]" : "border-[#34673933]";
  const bgColor = isCorrect === false ? "bg-[#C44F4F08]" : "bg-[#34673908]";
  const labelColor = isCorrect === false ? "text-[#C44F4F]" : "text-[#346739]";
  const icon = isCorrect === false ? "❌" : "💬";

  return (
    <div className={`mt-3 rounded-lg border ${borderColor} ${bgColor} p-3`}>
      <p className={`mb-1 text-xs font-medium ${labelColor}`}>{icon} Feedback Kombi</p>
      <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{text}</p>
    </div>
  );
}

// ── Submit Button ────────────────────────────────────────────────
function SubmitButton({
  isChecking,
  isCorrect,
  onClick,
}: {
  isChecking: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
}) {
  if (isCorrect === true) return null;

  return (
    <div className="flex flex-col items-center gap-2 border-t pt-4 mt-4" style={{ borderColor: `${C.green}26` }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isChecking}
        className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {isChecking ? (
          <>
            <Spinner />
            Mengecek...
          </>
        ) : (
          "Simpan Jawaban"
        )}
      </button>
    </div>
  );
}

// ── Progress Indicator ───────────────────────────────────────────
function ProgressIndicator({
  currentStep,
  feedbackMap,
}: {
  currentStep: number;
  feedbackMap: Record<number, { text: string; isCorrect: boolean }>;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium mb-3" style={{ color: C.purple }}>
        Langkah {currentStep + 1} dari {TOTAL_STEPS}
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {STEPS.map((step) => {
          const fb = feedbackMap[step.index];
          const isCompleted = fb?.isCorrect === true;
          const isActive = step.index === currentStep;
          const isLocked = step.index > currentStep;

          let dotBg = "bg-[#E5E5E0]";
          let dotBorder = "border-[#C5C5C0]";
          let dotText = "text-[#9E9D99]";
          if (isCompleted) {
            dotBg = "bg-[#346739]";
            dotBorder = "border-[#346739]";
            dotText = "text-white";
          } else if (isActive) {
            dotBg = "bg-white";
            dotBorder = "border-[#346739]";
            dotText = "text-[#346739]";
          }

          return (
            <React.Fragment key={step.index}>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} ${dotText} text-[10px] font-bold transition-colors`}
                title={isLocked ? `Terkunci: ${step.label}` : step.label}
              >
                {isCompleted ? "✓" : step.index + 1}
              </div>
              {step.index < TOTAL_STEPS - 1 && (
                <div
                  className={`h-0.5 w-3 rounded transition-colors ${
                    isCompleted ? "bg-[#346739]" : "bg-[#E5E5E0]"
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

// ── Reusable components ──────────────────────────────────────────
function TextInput({
  label,
  value,
  onChange,
  placeholder,
  id,
  readOnly = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
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
        type="text"
        className={`border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-full ${
          readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""
        }`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

function SectionBadge({
  label,
  isCompleted,
}: {
  label: string;
  isCompleted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: isCompleted ? C.green : C.purple }}
      >
        {isCompleted ? "✓" : "●"}
      </div>
      <h2 className="text-base font-bold" style={{ color: C.purple }}>
        {label}
      </h2>
    </div>
  );
}

function SubBox({
  title,
  children,
  readOnly,
}: {
  title: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: readOnly ? "#F5F5F0" : C.bg,
        border: `1px solid ${C.greenLight}`,
      }}
    >
      <p
        className={`text-sm font-semibold ${
          readOnly ? "text-[#6B6B66]" : ""
        }`}
        style={{ color: readOnly ? undefined : C.green }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Format stored answer for display ─────────────────────────
function formatJawaban(raw: string): string {
  return raw
    .replace(/ \| /g, "\n• ")
    .replace(/\. (Aturan|Hitungan|Total|Sekaligus|Bagian|Gabungan|Rancangan|Mencukupi)/g, ".\n$1");
}

// ── Main Page ────────────────────────────────────────────────────

export default function AktivitasFaktorial1() {
  // ── Sequential step tracking ──────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<number, { text: string; isCorrect: boolean }>
  >({});

  // ── Answer states ─────────────────────────────────────────────
  // Bagian A — Q1, Q2, Q3 + pattern
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [patternA, setPatternA] = useState("");

  // Bagian B — Q4, Q5, Q6
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");

  // Bagian C — Q7, Q8 + langkah berpikir
  const [q7, setQ7] = useState("");
  const [langkah7, setLangkah7] = useState("");
  const [q8, setQ8] = useState("");
  const [langkah8, setLangkah8] = useState("");

  // Bagian D — Diskusi
  const [diskusiA, setDiskusiA] = useState("");
  const [diskusiB, setDiskusiB] = useState("");
  const [diskusiC, setDiskusiC] = useState("");

  // ── Loading existing submissions ──────────────────────────────
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      try {
        const res = await fetch(
          "/api/aktivitas-siswa?concept_id=faktorial&activity_key=aktivitas_1"
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions && data.submissions) {
          setHasExistingSubmissions(true);
          const fb: Record<number, { text: string; isCorrect: boolean }> = {};
          for (const step of STEPS) {
            const sub = data.submissions[step.questionKey];
            if (sub) {
              fb[step.index] = {
                text: `📝 Jawaban kamu:\n${formatJawaban(sub.answer)}\n\n💬 Feedback:\n${sub.feedback ?? "Jawaban sudah tersimpan."}`,
                isCorrect: sub.isCorrect,
              };
            }
          }
          setFeedbackMap(fb);
          setCurrentStep(TOTAL_STEPS - 1);
        }
      } catch {
        // Silently ignore
      } finally {
        if (!cancelled) setIsLoadingExisting(false);
      }
    }
    loadExisting();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allComplete =
    currentStep >= TOTAL_STEPS - 1 &&
    feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // ── Build jawaban string for each step ────────────────────────
  function buildJawaban(stepIndex: number): {
    jawaban: string;
    alasan: string;
  } {
    switch (stepIndex) {
      case 0:
        return {
          jawaban: [
            `(1) ${q1 || "(belum diisi)"}`,
            `(2) ${q2 || "(belum diisi)"}`,
            `(3) ${q3 || "(belum diisi)"}`,
            `Pola: ${patternA || "(belum diisi)"}`,
          ].join(" | "),
          alasan: "Menyederhanakan faktorial dengan mencoret faktor yang sama.",
        };
      case 1:
        return {
          jawaban: [
            `(4) ${q4 || "(belum diisi)"}`,
            `(5) ${q5 || "(belum diisi)"}`,
            `(6) ${q6 || "(belum diisi)"}`,
          ].join(" | "),
          alasan: "Menyederhanakan pecahan faktorial dengan lebih dari dua faktorial.",
        };
      case 2:
        return {
          jawaban: [
            `(7) n = ${q7 || "(belum diisi)"}. Langkah: ${langkah7 || "(belum diisi)"}`,
            `(8) n = ${q8 || "(belum diisi)"}. Langkah: ${langkah8 || "(belum diisi)"}`,
          ].join(" | "),
          alasan: "Mencari nilai n dengan menyelesaikan persamaan faktorial.",
        };
      case 3:
        return {
          jawaban: [
            `(a) ${diskusiA || "(belum diisi)"}`,
            `(b) ${diskusiB || "(belum diisi)"}`,
            `(c) ${diskusiC || "(belum diisi)"}`,
          ].join(" | "),
          alasan: "",
        };
      default:
        return { jawaban: "", alasan: "" };
    }
  }

  // ── Validate step input before submitting ──────────────────────
  function validateStep(stepIndex: number): string | null {
    switch (stepIndex) {
      case 0:
        if (!q1.trim() || !q2.trim() || !q3.trim() || !patternA.trim())
          return "Lengkapi semua jawaban di Bagian A dulu ya! (soal 1, 2, 3, dan pola)";
        break;
      case 1:
        if (!q4.trim() || !q5.trim() || !q6.trim())
          return "Lengkapi semua jawaban di Bagian B dulu ya! (soal 4, 5, 6)";
        break;
      case 2:
        if (!q7.trim() || !langkah7.trim() || !q8.trim() || !langkah8.trim())
          return "Lengkapi jawaban dan langkah berpikir untuk soal 7 dan 8 dulu ya!";
        break;
      case 3:
        if (!diskusiA.trim() || !diskusiB.trim() || !diskusiC.trim())
          return "Lengkapi semua pertanyaan diskusi dulu ya!";
        break;
    }
    return null;
  }

  // ── Rule-based grading for Bagian A ───────────────────────────
  function gradeBagianA(): { isCorrect: boolean; feedback: string } {
    const checks: { label: string; ok: boolean; expected: string }[] = [
      { label: "(1) 8!/6!", ok: checkNumberAnswer(q1, "56"), expected: "56" },
      { label: "(2) 9!/7!", ok: checkNumberAnswer(q2, "72"), expected: "72" },
      { label: "(3) 10!/8!", ok: checkNumberAnswer(q3, "90"), expected: "90" },
      { label: "Pola n!/(n-2)!", ok: checkPatternNMinus2(patternA), expected: "n×(n-1) atau n²−n" },
    ];

    const allOk = checks.every((c) => c.ok);
    const wrongItems = checks.filter((c) => !c.ok);

    if (allOk) {
      return {
        isCorrect: true,
        feedback:
          "🎯 Mantap! Semua jawaban di Bagian A benar.\n\n" +
          "Kamu sudah menemukan pola penting: n!/(n-2)! = n×(n-1). " +
          "Ini karena faktorial yang lebih kecil (n-2)! bisa dicoret dengan bagian dari faktorial yang lebih besar. " +
          "Lanjut ke Bagian B ya!",
      };
    }

    const wrongList = wrongItems
      .map((w) => `• ${w.label}: seharusnya ${w.expected}`)
      .join("\n");

    return {
      isCorrect: false,
      feedback:
        `🤔 Ada yang perlu diperbaiki nih:\n\n${wrongList}\n\n` +
        "Tips: Tuliskan dulu ekspansi faktorialnya ya. Misal 8!/6! = (8×7×6!)/6! = 8×7. " +
        "Coba periksa lagi perhitunganmu!",
    };
  }

  // ── Rule-based grading for Bagian B ───────────────────────────
  function gradeBagianB(): { isCorrect: boolean; feedback: string } {
    const checks: { label: string; ok: boolean; expected: string }[] = [
      { label: "(4) 7!/(3!·4!)", ok: checkNumberAnswer(q4, "35"), expected: "35" },
      { label: "(5) 10!/(2!·8!)", ok: checkNumberAnswer(q5, "45"), expected: "45" },
      { label: "(6) n!/(n-1)!", ok: checkPatternNMinus1(q6), expected: "n" },
    ];

    const allOk = checks.every((c) => c.ok);
    const wrongItems = checks.filter((c) => !c.ok);

    if (allOk) {
      return {
        isCorrect: true,
        feedback:
          "🎯 Keren! Semua jawaban di Bagian B benar.\n\n" +
          "Kamu sudah bisa menyederhanakan pecahan faktorial meskipun ada lebih dari dua faktorial. " +
          "Perhatikan bahwa 7!/(3!·4!) itu sebenarnya bentuk kombinasi lho — nanti akan kamu pelajari lebih lanjut.\n\n" +
          "Lanjut ke Bagian C ya!",
      };
    }

    const wrongList = wrongItems
      .map((w) => `• ${w.label}: seharusnya ${w.expected}`)
      .join("\n");

    return {
      isCorrect: false,
      feedback:
        `🤔 Ada yang perlu dicek lagi:\n\n${wrongList}\n\n` +
        "Tips untuk (4): 7!/(3!·4!) = (7×6×5×4!)/(3×2×1×4!) = (7×6×5)/(6) = 35.\n" +
        "Tips untuk (6): n! = n×(n-1)!, jadi n!/(n-1)! = n. Coba periksa lagi ya!",
    };
  }

  // ── Handle step submission ─────────────────────────────────────
  const handleStepSubmit = useCallback(async () => {
    const step = STEPS[currentStep];
    const validationMsg = validateStep(currentStep);

    if (validationMsg) {
      setFeedbackMap((prev) => ({
        ...prev,
        [currentStep]: { text: validationMsg, isCorrect: false },
      }));
      return;
    }

    setCheckingStep(currentStep);

    try {
      const { jawaban, alasan } = buildJawaban(currentStep);
      const isAiStep = step.aiFeedbackOnly === true;

      // For rule-based steps (Bagian A & B), grade locally
      let ruleBasedResult: { isCorrect: boolean; feedback: string } | null = null;
      if (!isAiStep) {
        if (currentStep === 0) {
          ruleBasedResult = gradeBagianA();
        } else if (currentStep === 1) {
          ruleBasedResult = gradeBagianB();
        }
      }

      // Build request body
      const body: Record<string, unknown> = {
        concept_id: "faktorial",
        activity_key: "aktivitas_1",
        entry_type: step.entryType,
        question_key: step.questionKey,
        soal: step.soalText,
        jawaban,
        alasan,
      };

      // Attach rule_based override if available
      if (ruleBasedResult) {
        body.rule_based = {
          isCorrect: ruleBasedResult.isCorrect,
          feedback: ruleBasedResult.feedback,
        };
      }

      const res = await fetch("/api/aktivitas-siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      // For AI feedback steps, always allow progression
      const effectiveIsCorrect = isAiStep
        ? true // Always pass for AI-feedback-only steps
        : data.isCorrect ?? false;

      const fb = {
        text: data.feedback ?? "Jawaban tersimpan.",
        isCorrect: effectiveIsCorrect,
      };

      setFeedbackMap((prev) => ({ ...prev, [currentStep]: fb }));

      if (fb.isCorrect && currentStep < TOTAL_STEPS - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch {
      setFeedbackMap((prev) => ({
        ...prev,
        [currentStep]: {
          text: "Maaf, ada kendala. Coba lagi ya!",
          isCorrect: false,
        },
      }));
    } finally {
      setCheckingStep(null);
    }
  }, [
    currentStep,
    q1, q2, q3, patternA,
    q4, q5, q6,
    q7, langkah7, q8, langkah8,
    diskusiA, diskusiB, diskusiC,
  ]);

  // ── Render visible steps ───────────────────────────────────────
  function renderVisibleSteps() {
    const elements: React.ReactNode[] = [];

    for (let i = 0; i <= currentStep; i++) {
      const fb = feedbackMap[i];
      const isCompleted = fb?.isCorrect === true;
      const isCurrent = i === currentStep;
      const readOnly = isCompleted;

      elements.push(
        <div key={`step-${i}`} className={i > 0 ? "mt-8" : ""}>
          {renderStep(i, readOnly, isCurrent)}
        </div>
      );
    }

    return elements;
  }

  function renderStep(
    stepIndex: number,
    readOnly: boolean,
    isCurrent: boolean
  ) {
    const fb = feedbackMap[stepIndex];

    switch (stepIndex) {
      case 0:
        return renderBagianA(readOnly, isCurrent, fb);
      case 1:
        return renderBagianB(readOnly, isCurrent, fb);
      case 2:
        return renderBagianC(readOnly, isCurrent, fb);
      case 3:
        return renderBagianD(readOnly, isCurrent, fb);
      default:
        return null;
    }
  }

  // ── Step 0: Bagian A — Eksplorasi Cara Cepat ──────────────────
  function renderBagianA(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 0;
    return (
      <div>
        <SectionBadge label="Bagian A — Eksplorasi Cara Cepat" isCompleted={readOnly} />

        {/* Contoh */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: C.greenLight }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: C.green }}>
            📖 Contoh
          </p>
          <p className="text-sm text-slate-700">
            6!/4! = (6×5×4!)/4! = 6×5 = <strong>30</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tanpa menghitung 6! dan 4! secara penuh, hasilnya langsung diperoleh
            dengan mencoret faktor yang sama.
          </p>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: readOnly ? "#F5F5F0" : C.bg,
              border: `1px solid ${C.greenLight}`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: C.green }}>
              Coba sendiri dengan cara yang sama:
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <TextInput
                id="q1"
                label="(1) 8!/6! ="
                value={q1}
                onChange={setQ1}
                placeholder="Tulis jawabanmu..."
                readOnly={readOnly}
              />
              <TextInput
                id="q2"
                label="(2) 9!/7! ="
                value={q2}
                onChange={setQ2}
                placeholder="Tulis jawabanmu..."
                readOnly={readOnly}
              />
              <TextInput
                id="q3"
                label="(3) 10!/8! ="
                value={q3}
                onChange={setQ3}
                placeholder="Tulis jawabanmu..."
                readOnly={readOnly}
              />
            </div>

            <TextInput
              id="patternA"
              label="Dari ketiga soal di atas, temukan polanya: n!/(n-2)! ="
              value={patternA}
              onChange={setPatternA}
              placeholder="Tulis polanya (dalam n)..."
              readOnly={readOnly}
            />
          </div>
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIdx}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  // ── Step 1: Bagian B — Tantangan Lebih Dalam ──────────────────
  function renderBagianB(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 1;
    return (
      <div>
        <SectionBadge label="Bagian B — Tantangan Lebih Dalam" isCompleted={readOnly} />

        <div className="space-y-4">
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: readOnly ? "#F5F5F0" : C.bg,
              border: `1px solid ${C.greenLight}`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: C.green }}>
              Sekarang coba yang lebih menantang:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <TextInput
                id="q4"
                label="(4) 7!/(3!·4!) ="
                value={q4}
                onChange={setQ4}
                placeholder="Tulis jawabanmu..."
                readOnly={readOnly}
              />
              <TextInput
                id="q5"
                label="(5) 10!/(2!·8!) ="
                value={q5}
                onChange={setQ5}
                placeholder="Tulis jawabanmu..."
                readOnly={readOnly}
              />
            </div>

            <TextInput
              id="q6"
              label="(6) n!/(n-1)! = … (dalam bentuk n)"
              value={q6}
              onChange={setQ6}
              placeholder="Tulis dalam bentuk n..."
              readOnly={readOnly}
            />
          </div>
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIdx}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  // ── Step 2: Bagian C — Cari Nilai n ───────────────────────────
  function renderBagianC(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 2;
    return (
      <div>
        <SectionBadge label="Bagian C — Cari Nilai n" isCompleted={readOnly} />

        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.greenLight }}>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            💡 Petunjuk
          </p>
          <p className="text-sm text-slate-700">
            Tuliskan langkah berpikirmu dengan lengkap. AI akan memberikan
            feedback dan koreksi terhadap proses berpikirmu — bukan sekadar
            menilai benar/salah.
          </p>
        </div>

        <div className="space-y-6">
          {/* Soal 7 */}
          <SubBox title="(7) Jika n!/(n-2)! = 42, maka n = …" readOnly={readOnly}>
            <TextInput
              id="q7"
              label="Nilai n:"
              value={q7}
              onChange={setQ7}
              placeholder="n = ..."
              readOnly={readOnly}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="langkah7" className="text-xs font-semibold text-slate-500">
                Langkah berpikirku:
              </label>
              <textarea
                id="langkah7"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${
                  readOnly
                    ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none"
                    : "resize-none"
                }`}
                style={{ borderColor: C.border }}
                value={langkah7}
                onChange={(e) => setLangkah7(e.target.value)}
                placeholder="Tulis langkah berpikirmu di sini..."
                readOnly={readOnly}
              />
            </div>
          </SubBox>

          {/* Soal 8 */}
          <SubBox title="(8) Jika n!/(n-3)! = 60, maka n = …" readOnly={readOnly}>
            <TextInput
              id="q8"
              label="Nilai n:"
              value={q8}
              onChange={setQ8}
              placeholder="n = ..."
              readOnly={readOnly}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="langkah8" className="text-xs font-semibold text-slate-500">
                Langkah berpikirku:
              </label>
              <textarea
                id="langkah8"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${
                  readOnly
                    ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none"
                    : "resize-none"
                }`}
                style={{ borderColor: C.border }}
                value={langkah8}
                onChange={(e) => setLangkah8(e.target.value)}
                placeholder="Tulis langkah berpikirmu di sini..."
                readOnly={readOnly}
              />
            </div>
          </SubBox>
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIdx}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  // ── Step 3: Bagian D — Diskusi Pasangan ───────────────────────
  function renderBagianD(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 3;

    const DISKUSI_ITEMS = [
      {
        key: "a",
        label:
          "(a) Mengapa cara \"mencoret faktor yang sama\" bisa dilakukan? Apa yang membolehkan hal itu secara matematis?",
        state: diskusiA,
        setter: setDiskusiA,
      },
      {
        key: "b",
        label:
          "(b) Apakah 5!/3! sama dengan (5−3)! = 2!? Dan apakah 2!×3! = (2×3)!? Cek kebenarannya!",
        state: diskusiB,
        setter: setDiskusiB,
      },
      {
        key: "c",
        label:
          "(c) Tuliskan satu tips cara cepat menyederhanakan ekspresi faktorial yang akan kamu bagikan ke temanmu:",
        state: diskusiC,
        setter: setDiskusiC,
      },
    ];

    return (
      <div>
        <SectionBadge label="Bagian D — Diskusi Pasangan" isCompleted={readOnly} />

        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: C.greenLight }}>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            👥 Diskusi Pasangan
          </p>
          <p className="text-sm text-slate-700">
            Setelah menyelesaikan semua soal, diskusikan bersama pasanganmu.
            AI akan memberikan feedback terhadap hasil diskusi kalian.
          </p>
        </div>

        <div className="space-y-4">
          {DISKUSI_ITEMS.map(({ key, label, state, setter }) => (
            <div key={key}>
              <label
                htmlFor={`diskusi-${key}`}
                className="text-sm font-medium text-slate-700 block mb-2"
              >
                {label}
              </label>
              <textarea
                id={`diskusi-${key}`}
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] ${
                  readOnly
                    ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none"
                    : "resize-none"
                }`}
                style={{ borderColor: C.border }}
                value={state}
                onChange={(e) => setter(e.target.value)}
                placeholder="Tuliskan diskusi kalian..."
                readOnly={readOnly}
              />
            </div>
          ))}
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIdx}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div
            className="border-2 rounded-2xl p-6 space-y-6"
            style={{ borderColor: C.greenLight }}
          >
            {/* ── HEADER ── */}
            <div>
              <div
                className="flex items-center gap-1.5 text-sm mb-3"
                style={{ color: C.green }}
              >
                <Link
                  href="/siswa/activity/faktorial"
                  className="hover:underline font-medium opacity-70"
                >
                  Faktorial
                </Link>
                <span className="opacity-40">›</span>
                <span className="font-semibold">Aktivitas 1</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: C.greenLight, color: C.green }}
                >
                  <IconUserSolo /> INDIVIDU & PASANGAN
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: C.green, color: C.white }}
                >
                  <IconClock /> 35 menit
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: "#C9962B" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#C9962B" }}
                  />{" "}
                  Joyful
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: "#2A5A8C" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#2A5A8C" }}
                  />{" "}
                  Mindful
                </span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: C.purple }}>
                &ldquo;Membangun Pemahaman dari Pola&rdquo;
              </h1>
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
                Faktorial tumbuh sangat cepat. Tapi dalam soal, faktorial sering
                muncul dalam bentuk pecahan. Jika langsung dihitung semua
                faktorialnya, butuh waktu lama dan rawan salah.
              </p>
              <p className="text-sm text-slate-700">
                Aktivitas ini melatihmu menemukan cara cepat dan cermat
                menyederhanakan ekspresi faktorial.
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                🎯 Tujuan
              </p>
              <p className="text-sm text-slate-700">
                Setelah menyelesaikan aktivitas ini, kamu mampu menjelaskan
                konsep faktorial sebagai notasi matematis yang muncul secara
                alami dari Kaidah Perkalian, menghitung nilainya secara efisien,
                dan memahami alasan 0! = 1 — bukan sekadar menghafalnya.
              </p>
            </div>

            {/* ── Progress Indicator ── */}
            <ProgressIndicator
              currentStep={currentStep}
              feedbackMap={feedbackMap}
            />

            {/* ── Loading State ── */}
            {isLoadingExisting && (
              <div className="flex items-center justify-center py-12">
                <Spinner />
                <span className="ml-3 text-sm text-slate-500">
                  Memuat aktivitas...
                </span>
              </div>
            )}

            {/* ── Already Completed Banner ── */}
            {!isLoadingExisting && hasExistingSubmissions && (
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: C.greenLight }}
              >
                <p className="font-bold text-base" style={{ color: C.green }}>
                  ✅ Kamu sudah menyelesaikan aktivitas ini!
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Berikut jawaban dan feedback dari AI. Tidak perlu menjawab
                  ulang.
                </p>
              </div>
            )}

            {/* ── All Complete Banner ── */}
            {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: C.greenLight }}
              >
                <p className="font-bold text-base" style={{ color: C.green }}>
                  🎉 Semua langkah selesai!
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Semua jawabanmu sudah tersimpan. Lanjutkan ke materi
                  berikutnya ya!
                </p>
              </div>
            )}

            {/* ── Sequential Steps ── */}
            {!isLoadingExisting && renderVisibleSteps()}
          </div>
        </div>
    </div>
  );
}
