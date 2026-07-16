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

// ── Step Definitions (6 sequential questions) ────────────────────
interface StepConfig {
  index: number; // 0–5
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
}

const STEPS: StepConfig[] = [
  {
    index: 0,
    questionKey: "situasi_1",
    entryType: "soal",
    label: "Situasi 1 — Alat Tulis",
    soalText:
      "Di koperasi sekolah tersedia 4 jenis pensil dan 3 jenis pulpen. Seorang siswa ingin membeli SATU ALAT TULIS SAJA. Apakah siswa membeli pensil dan pulpen sekaligus? Aturan apa yang digunakan? Berapa banyak kemungkinan pilihan siswa?",
  },
  {
    index: 1,
    questionKey: "situasi_2",
    entryType: "soal",
    label: "Situasi 2 — Seragam",
    soalText:
      "Siswa harus membeli 1 kemeja (dari 3 pilihan warna) dan 1 celana (dari 2 pilihan warna). Apakah siswa harus memilih kemeja dan celana sekaligus? Aturan apa yang digunakan? Berapa banyak pasangan baju dan celana yang bisa dikenakan?",
  },
  {
    index: 2,
    questionKey: "situasi_3",
    entryType: "soal",
    label: "Situasi 3 — Ekskul",
    soalText:
      "Ekskul sekolah: ada 5 ekskul olahraga dan 4 ekskul seni. Seorang siswa HANYA BOLEH MEMILIH SATU ekskul. Aturan apa yang digunakan? Berapa banyak kemungkinan ekskul yang dipilih?",
  },
  {
    index: 3,
    questionKey: "situasi_4",
    entryType: "soal",
    label: "Situasi 4 — Bioskop",
    soalText:
      "Rina ingin memesan tiket. Bioskop A: 3 film × 2 jadwal. Bioskop B: 2 film × 3 jadwal. Rina hanya pergi ke SATU bioskop. Hitung pilihan di Bioskop A, Bioskop B, lalu gabungkan. Aturan apa yang digunakan di setiap langkah? Berapa total pilihan tontonan Rina?",
  },
  {
    index: 4,
    questionKey: "situasi_5",
    entryType: "soal",
    label: "Situasi 5 — Soal Ujian",
    soalText:
      "Soal ujian terdiri dari 2 bagian. Bagian A: pilih 5 dari 6 soal. Bagian B: pilih 2 dari 3 soal. Berapa banyak kombinasi soal yang bisa dipilih siswa? Hitung masing-masing bagian, lalu gabungkan.",
  },
  {
    index: 5,
    questionKey: "refleksi",
    entryType: "refleksi",
    label: "Refleksi Individu",
    soalText:
      "Setelah mengerjakan kelima situasi di atas: (1) Apa pola yang kamu temukan untuk membedakan kapan menggunakan penjumlahan dan kapan menggunakan perkalian? (2) Situasi mana yang paling sulit dianalisis? Mengapa?",
  },
];

const TOTAL_STEPS = STEPS.length;

const ATURAN_OPTIONS = [
  { value: "penjumlahan", label: "Penjumlahan" },
  { value: "perkalian", label: "Perkalian" },
];

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


// ── Utility Components ───────────────────────────────────────────

function AturanSelect({
  value,
  onChange,
  id,
  readOnly = false,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label htmlFor={id} className="text-sm font-medium text-slate-600">
        Aturan yang digunakan:
      </label>
      <select
        id={id}
        className={`border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 ${
          readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""
        }`}
        style={{ borderColor: C.border }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
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

function YaTidak({
  question,
  name,
  value,
  onChange,
  readOnly = false,
}: {
  question: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
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
            disabled={readOnly}
          />
          <span className="capitalize font-medium text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function SituasiLabel({ nomor, isCompleted }: { nomor: number; isCompleted?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: isCompleted ? C.green : C.green }}
      >
        {isCompleted ? "✓" : nomor}
      </div>
      <span className="font-bold text-sm" style={{ color: C.green }}>
        Situasi {nomor}
      </span>
    </div>
  );
}

function SubBox({ title, children, readOnly }: { title: string; children: React.ReactNode; readOnly?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}
    >
      <p className={`text-sm font-semibold ${readOnly ? "text-[#6B6B66]" : ""}`} style={{ color: readOnly ? undefined : C.green }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Format stored answer for display ─────────────────────────
function formatJawaban(raw: string): string {
  return raw
    .replace(/ \| /g, '\n• ')
    .replace(/\. (Aturan|Hitungan|Total|Sekaligus|Bagian|Gabungan|Rancangan|Mencukupi)/g, '.\n$1');
}

// ── Main Page ────────────────────────────────────────────────────

export default function AktivitasKP1() {
  // ── Sequential step tracking ──────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});

  // ── Answer states ─────────────────────────────────────────────
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

  // ── Loading existing submissions ──────────────────────────────
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      try {
        const res = await fetch(
          "/api/aktivitas-siswa?concept_id=kaidah_penjumlahan&activity_key=aktivitas_1"
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.hasSubmissions && data.submissions) {
          setHasExistingSubmissions(true);
          // Build feedbackMap from stored data
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
          // Show all steps
          setCurrentStep(TOTAL_STEPS - 1);
        }
      } catch {
        // Silently ignore — user can still fill in manually
      } finally {
        if (!cancelled) setIsLoadingExisting(false);
      }
    }
    loadExisting();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allComplete =
    currentStep >= TOTAL_STEPS - 1 &&
    feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // ── Build jawaban string for each step ────────────────────────
  function buildJawaban(stepIndex: number): { jawaban: string; alasan: string } {
    switch (stepIndex) {
      case 0:
        return {
          jawaban: `Sekaligus: ${s1.bersamaan || "(belum dipilih)"}. Aturan: ${s1.aturan || "(belum dipilih)"}. Hitungan: ${s1.hitungan || "(belum diisi)"}`,
          alasan: "Analisis apakah membeli pensil dan pulpen sekaligus atau salah satu saja.",
        };
      case 1:
        return {
          jawaban: `Sekaligus: ${s2.bersamaan || "(belum dipilih)"}. Aturan: ${s2.aturan || "(belum dipilih)"}. Hitungan: ${s2.hitungan || "(belum diisi)"}`,
          alasan: "Analisis apakah memilih kemeja dan celana sekaligus atau salah satu saja.",
        };
      case 2:
        return {
          jawaban: `Aturan: ${s3.aturan || "(belum dipilih)"}. Hitungan: ${s3.hitungan || "(belum diisi)"}`,
          alasan: "Analisis apakah memilih satu ekskul dari beberapa kelompok.",
        };
      case 3:
        return {
          jawaban: [
            `Bioskop A - Aturan: ${s4.aturanA || "-"}, Hitungan: ${s4.hitunganA || "-"}`,
            `Bioskop B - Aturan: ${s4.aturanB || "-"}, Hitungan: ${s4.hitunganB || "-"}`,
            `Gabungan - Aturan: ${s4.aturanGabungan || "-"}, Hitungan: ${s4.hitunganGabungan || "-"}`,
            `Total: ${s4.total || "-"}`,
          ].join(" | "),
          alasan: "Analisis dua bioskop lalu gabungkan dengan aturan penjumlahan karena hanya memilih salah satu bioskop.",
        };
      case 4:
        return {
          jawaban: [
            `Bagian A: ${s5.hitunganA || "-"}`,
            `Bagian B: ${s5.hitunganB || "-"}`,
            `Total kombinasi: ${s5.total || "-"}`,
          ].join(" | "),
          alasan: "Menghitung kombinasi soal dari dua bagian yang harus dikerjakan sekaligus.",
        };
      case 5:
        return {
          jawaban: `(1) ${refleksi1 || ""} | (2) ${refleksi2 || ""}`,
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
        if (!s1.bersamaan || !s1.aturan || !s1.hitungan)
          return "Lengkapi semua bagian di Situasi 1 dulu ya!";
        break;
      case 1:
        if (!s2.bersamaan || !s2.aturan || !s2.hitungan)
          return "Lengkapi semua bagian di Situasi 2 dulu ya!";
        break;
      case 2:
        if (!s3.aturan || !s3.hitungan)
          return "Lengkapi aturan dan hitungan di Situasi 3 dulu ya!";
        break;
      case 3:
        if (!s4.aturanA || !s4.hitunganA || !s4.aturanB || !s4.hitunganB || !s4.aturanGabungan || !s4.hitunganGabungan || !s4.total)
          return "Lengkapi semua bagian di Situasi 4 dulu ya!";
        break;
      case 4:
        if (!s5.hitunganA || !s5.hitunganB || !s5.total)
          return "Lengkapi semua bagian di Situasi 5 dulu ya!";
        break;
      case 5:
        if (!refleksi1.trim() || !refleksi2.trim())
          return "Tulis kedua refleksimu dulu ya!";
        break;
    }
    return null;
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

      const res = await fetch("/api/aktivitas-siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_penjumlahan",
          activity_key: "aktivitas_1",
          entry_type: step.entryType,
          question_key: step.questionKey,
          soal: step.soalText,
          jawaban,
          alasan,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const fb = {
        text: data.feedback ?? "Jawaban tersimpan.",
        isCorrect: data.isCorrect ?? false,
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
  }, [currentStep, s1, s2, s3, s4, s5, refleksi1, refleksi2]);

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

  function renderStep(stepIndex: number, readOnly: boolean, isCurrent: boolean) {
    const fb = feedbackMap[stepIndex];

    switch (stepIndex) {
      case 0: return renderSituasi1(readOnly, isCurrent, fb);
      case 1: return renderSituasi2(readOnly, isCurrent, fb);
      case 2: return renderSituasi3(readOnly, isCurrent, fb);
      case 3: return renderSituasi4(readOnly, isCurrent, fb);
      case 4: return renderSituasi5(readOnly, isCurrent, fb);
      case 5: return renderRefleksi(readOnly, isCurrent, fb);
      default: return null;
    }
  }

  // ── Step 0: Situasi 1 — Alat Tulis ────────────────────────────
  function renderSituasi1(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 0;
    return (
      <div>
        <SituasiLabel nomor={1} isCompleted={readOnly} />
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            <p className={`text-sm ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Di koperasi sekolah tersedia <strong>4 jenis pensil</strong> dan{" "}
              <strong>3 jenis pulpen</strong>. Seorang siswa ingin membeli{" "}
              <em>satu alat tulis saja</em>. Berapa banyak kemungkinan pilihan siswa?
            </p>
            <YaTidak
              question="Apakah siswa membeli pensil dan pulpen sekaligus?"
              name="s1-bersamaan" value={s1.bersamaan}
              onChange={(v) => setS1((p) => ({ ...p, bersamaan: v }))}
              readOnly={readOnly}
            />
            <AturanSelect id="s1-aturan" value={s1.aturan} onChange={(v) => setS1((p) => ({ ...p, aturan: v }))} readOnly={readOnly} />
            <TextInput id="s1-hitungan" label="Hitungan:" value={s1.hitungan} onChange={(v) => setS1((p) => ({ ...p, hitungan: v }))} placeholder="Tulis jawabanmu disini" readOnly={readOnly} />
          </div>
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );
  }

  // ── Step 1: Situasi 2 — Seragam ───────────────────────────────
  function renderSituasi2(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 1;
    return (
      <div>
        <SituasiLabel nomor={2} isCompleted={readOnly} />
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            <p className={`text-sm ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Koperasi yang sama menjual <strong>seragam lengkap</strong>. Siswa harus membeli
              1 kemeja (dari <strong>3 pilihan warna</strong>) dan 1 celana (dari{" "}
              <strong>2 pilihan warna</strong>). Berapa banyak pasangan baju dan celana yang
              bisa dikenakan siswa?
            </p>
            <YaTidak
              question="Apakah siswa harus memilih kemeja dan celana sekaligus?"
              name="s2-bersamaan" value={s2.bersamaan}
              onChange={(v) => setS2((p) => ({ ...p, bersamaan: v }))}
              readOnly={readOnly}
            />
            <AturanSelect id="s2-aturan" value={s2.aturan} onChange={(v) => setS2((p) => ({ ...p, aturan: v }))} readOnly={readOnly} />
            <TextInput id="s2-hitungan" label="Hitungan:" value={s2.hitungan} onChange={(v) => setS2((p) => ({ ...p, hitungan: v }))} placeholder="Tulis jawabanmu disini" readOnly={readOnly} />
          </div>
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );
  }

  // ── Step 2: Situasi 3 — Ekskul ────────────────────────────────
  function renderSituasi3(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 2;
    return (
      <div>
        <SituasiLabel nomor={3} isCompleted={readOnly} />
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            <p className={`text-sm ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Ekskul sekolah membuka pendaftaran: ada <strong>5 ekskul olahraga</strong> dan{" "}
              <strong>4 ekskul seni</strong>. Seorang siswa{" "}
              <em>hanya boleh memilih satu ekskul</em>. Berapa banyak kemungkinan ekskul
              yang dipilih oleh siswa?
            </p>
            <AturanSelect id="s3-aturan" value={s3.aturan} onChange={(v) => setS3((p) => ({ ...p, aturan: v }))} readOnly={readOnly} />
            <TextInput id="s3-hitungan" label="Hitungan:" value={s3.hitungan} onChange={(v) => setS3((p) => ({ ...p, hitungan: v }))} placeholder="Tulis jawabanmu disini" readOnly={readOnly} />
          </div>
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );
  }

  // ── Step 3: Situasi 4 — Bioskop ───────────────────────────────
  function renderSituasi4(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 3;
    return (
      <div>
        <SituasiLabel nomor={4} isCompleted={readOnly} />
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <p className={`text-sm ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              <strong>Rina</strong> ingin memesan tiket bioskop. Tersedia dua bioskop di kotanya:
            </p>
            <ul className={`text-sm mt-2 space-y-1 list-disc pl-5 ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              <li><strong>Bioskop A</strong>: 3 film sedang tayang, masing-masing tersedia dalam 2 jadwal</li>
              <li><strong>Bioskop B</strong>: 2 film sedang tayang, masing-masing tersedia dalam 3 jadwal</li>
            </ul>
            <p className={`text-sm mt-2 ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Rina <em>hanya akan pergi ke satu bioskop</em>. Berapa banyak pilihan tontonan (film + jadwal)?
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <SubBox title="Bioskop A" readOnly={readOnly}>
            <AturanSelect id="s4-aturanA" value={s4.aturanA} onChange={(v) => setS4((p) => ({ ...p, aturanA: v }))} readOnly={readOnly} />
            <TextInput id="s4-hitunganA" label="Hitungan:" value={s4.hitunganA} onChange={(v) => setS4((p) => ({ ...p, hitunganA: v }))} placeholder="Tulis jawabanmu disini" readOnly={readOnly} />
          </SubBox>
          <SubBox title="Bioskop B" readOnly={readOnly}>
            <AturanSelect id="s4-aturanB" value={s4.aturanB} onChange={(v) => setS4((p) => ({ ...p, aturanB: v }))} readOnly={readOnly} />
            <TextInput id="s4-hitunganB" label="Hitungan:" value={s4.hitunganB} onChange={(v) => setS4((p) => ({ ...p, hitunganB: v }))} placeholder="Tulis jawabanmu disini" readOnly={readOnly} />
          </SubBox>
        </div>
        <div className="mt-3 rounded-xl p-4 space-y-3" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
          <p className={`text-sm font-semibold ${readOnly ? "text-[#6B6B66]" : "text-slate-600"}`}>
            Rina menonton di <em>Bioskop A <strong>atau</strong> Bioskop B</em>
          </p>
          <AturanSelect id="s4-aturanGabungan" value={s4.aturanGabungan} onChange={(v) => setS4((p) => ({ ...p, aturanGabungan: v }))} readOnly={readOnly} />
          <TextInput id="s4-hitunganGabungan" label="Hitungan:" value={s4.hitunganGabungan} onChange={(v) => setS4((p) => ({ ...p, hitunganGabungan: v }))} readOnly={readOnly} />
          <TextInput id="s4-total" label="Jadi, banyak pilihan tontonan Rina ada … pilihan:" value={s4.total} onChange={(v) => setS4((p) => ({ ...p, total: v }))} placeholder="..." readOnly={readOnly} />
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );
  }

  // ── Step 4: Situasi 5 — Soal Ujian ────────────────────────────
  function renderSituasi5(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 4;
    return (
      <div>
        <SituasiLabel nomor={5} isCompleted={readOnly} />
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <p className={`text-sm ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Sebuah soal ujian terdiri dari 2 bagian:
            </p>
            <ul className={`text-sm mt-2 space-y-1 list-disc pl-5 ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              <li><strong>Bagian A</strong> (pilihan ganda): 6 soal tersedia, siswa mengerjakan <em>5 soal</em></li>
              <li><strong>Bagian B</strong> (isian): 3 soal tersedia, siswa mengerjakan <em>2 soal</em></li>
            </ul>
            <p className={`text-sm mt-2 ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
              Berapa banyak kombinasi soal yang bisa dipilih siswa?
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <SubBox title="Bagian A — Pilih 5 dari 6 soal" readOnly={readOnly}>
            <TextInput id="s5-hitunganA" label="Hitungan:" value={s5.hitunganA} onChange={(v) => setS5((p) => ({ ...p, hitunganA: v }))} placeholder="Tuliskan caranya..." readOnly={readOnly} />
          </SubBox>
          <SubBox title="Bagian B — Pilih 2 dari 3 soal" readOnly={readOnly}>
            <TextInput id="s5-hitunganB" label="Hitungan:" value={s5.hitunganB} onChange={(v) => setS5((p) => ({ ...p, hitunganB: v }))} placeholder="Tuliskan caranya..." readOnly={readOnly} />
          </SubBox>
        </div>
        <div className="mt-3 rounded-xl p-4" style={{ background: readOnly ? "#F5F5F0" : C.bg, border: `1px solid ${C.greenLight}` }}>
          <TextInput id="s5-total" label="Banyak kemungkinan kombinasi soal adalah:" value={s5.total} onChange={(v) => setS5((p) => ({ ...p, total: v }))} placeholder="..." readOnly={readOnly} />
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
      </div>
    );
  }

  // ── Step 5: Refleksi Individu ──────────────────────────────────
  function renderRefleksi(
    readOnly: boolean, isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 5;
    return (
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>Refleksi Individu</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="refleksi1" className="text-sm font-medium text-slate-700 block mb-2">
              Dari kelima situasi di atas, apa pola yang kamu temukan untuk membedakan kapan menggunakan penjumlahan dan kapan menggunakan perkalian?
            </label>
            <textarea
              id="refleksi1"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
              style={{ borderColor: C.border }}
              value={refleksi1} onChange={(e) => setRefleksi1(e.target.value)}
              placeholder="Tuliskan refleksimu..." readOnly={readOnly}
            />
          </div>
          <div>
            <label htmlFor="refleksi2" className="text-sm font-medium text-slate-700 block mb-2">
              Situasi mana yang paling sulit dianalisis? Mengapa?
            </label>
            <textarea
              id="refleksi2"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[80px] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"}`}
              style={{ borderColor: C.border }}
              value={refleksi2} onChange={(e) => setRefleksi2(e.target.value)}
              placeholder="Tuliskan refleksimu..." readOnly={readOnly}
            />
          </div>
        </div>
        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}
        {isCurrent && !readOnly && <SubmitButton isChecking={checkingStep === stepIdx} isCorrect={fb?.isCorrect ?? null} onClick={handleStepSubmit} />}
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5A8C" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} /> Mindful
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
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: C.greenLight }}>
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
              <div className="rounded-lg bg-white p-3 border-l-4" style={{ borderLeftColor: C.green }}>
                <p className="text-sm text-slate-700">
                  🤔 &ldquo;Apakah semua tahap harus dilakukan <strong>sekaligus</strong>?&rdquo;
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: C.green }}>
                  → Jika YA → Perkalian
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 border-l-4" style={{ borderLeftColor: "#2A5A8C" }}>
                <p className="text-sm text-slate-700">
                  🤔 &ldquo;Apakah hanya <strong>satu pilihan</strong> dari beberapa kelompok (saling lepas)?&rdquo;
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: "#2A5A8C" }}>
                  → Jika YA → Penjumlahan
                </p>
              </div>
            </div>
          </div>

          {/* ── Progress Indicator ── */}
          <ProgressIndicator currentStep={currentStep} feedbackMap={feedbackMap} />

          {/* ── Loading State ── */}
          {isLoadingExisting && (
            <div className="flex items-center justify-center py-12">
              <Spinner />
              <span className="ml-3 text-sm text-slate-500">Memuat aktivitas...</span>
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
                Berikut jawaban dan feedback dari AI. Tidak perlu menjawab ulang.
              </p>
            </div>
          )}

          {/* ── All Complete Banner ── */}
          {!isLoadingExisting && !hasExistingSubmissions && allComplete && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.greenLight }}>
              <p className="font-bold text-base" style={{ color: C.green }}>
                🎉 Semua langkah selesai!
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Semua jawabanmu sudah tersimpan. Lanjutkan ke aktivitas berikutnya ya!
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
