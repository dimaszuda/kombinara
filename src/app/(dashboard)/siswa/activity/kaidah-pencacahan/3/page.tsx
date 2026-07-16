"use client";

import React, { useState, useCallback, useEffect } from "react";
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

// ── Step Definitions (4 sequential questions) ────────────────────
interface StepConfig {
  index: number; // 0–3
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
}

const STEPS: StepConfig[] = [
  {
    index: 0,
    questionKey: "sistem_a",
    entryType: "soal",
    label: "Sistem A — Kode Tunggal",
    soalText:
      "Sekolah membuat sistem kode unik untuk kartu identitas siswa. Sistem A: siswa mendapat kode berdasarkan SALAH SATU kategori — warna (merah, biru, hijau, kuning = 4 pilihan), angka romawi (I, II, III, V = 4 pilihan), atau huruf (A, B, C = 3 pilihan). Berapa total kode berbeda yang bisa dibuat? Aturan apa yang digunakan? Mengapa?",
  },
  {
    index: 1,
    questionKey: "sistem_b",
    entryType: "soal",
    label: "Sistem B — Kode Kombinasi",
    soalText:
      "Sistem B: setiap kode terdiri dari 3 bagian SEKALIGUS — warna (4 pilihan), angka romawi (4 pilihan), dan huruf (3 pilihan). Berapa total kode berbeda yang bisa dibuat? Aturan apa yang digunakan? Mengapa?",
  },
  {
    index: 2,
    questionKey: "rancangan",
    entryType: "soal",
    label: "Rancang Sistem Kalian Sendiri",
    soalText:
      "Rancang sistem kode unikmu sendiri dengan ketentuan: harus ada minimal satu bagian yang menggunakan aturan penjumlahan, harus ada minimal satu bagian yang menggunakan aturan perkalian, dan total kode harus mampu menampung minimal 500 siswa. Deskripsikan rancanganmu, hitung total kode yang bisa dihasilkan, dan jelaskan apakah mencukupi untuk 500 siswa.",
  },
  {
    index: 3,
    questionKey: "refleksi",
    entryType: "refleksi",
    label: "Refleksi",
    soalText:
      "Setelah mengerjakan ketiga langkah di atas, apa perbedaan paling mendasar antara aturan penjumlahan dan aturan perkalian dalam konteks membuat sistem kode? Kapan kamu menggunakan masing-masing aturan?",
  },
];

const TOTAL_STEPS = STEPS.length;

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
      <div className="flex items-center gap-1.5">
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
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} ${dotText} text-[10px] font-bold transition-colors`}
                title={isLocked ? `Terkunci: ${step.label}` : step.label}
              >
                {isCompleted ? "✓" : step.index + 1}
              </div>
              {step.index < TOTAL_STEPS - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded transition-colors ${
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
        Aturan:
      </label>
      <select
        id={id}
        className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
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

function StepBadge({
  step,
  title,
  isCompleted,
}: {
  step: number;
  title: string;
  isCompleted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ backgroundColor: isCompleted ? C.green : C.purple }}
      >
        {isCompleted ? "✓" : step}
      </div>
      <h2 className="text-base font-bold" style={{ color: C.purple }}>
        {title}
      </h2>
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

export default function AktivitasKP3() {
  // ── Sequential step tracking ──────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});

  // ── Answer states ─────────────────────────────────────────────
  const [sistemA, setSistemA] = useState({ total: "", aturan: "", alasan: "" });
  const [sistemB, setSistemB] = useState({ total: "", aturan: "", alasan: "" });
  const [rancangan, setRancangan] = useState({
    deskripsi: "",
    totalKode: "",
    cukup: "",
    alasanCukup: "",
  });
  const [refleksi, setRefleksi] = useState("");

  // ── Loading existing submissions ──────────────────────────────
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      try {
        const res = await fetch(
          "/api/aktivitas-siswa?concept_id=kaidah_penjumlahan&activity_key=aktivitas_3"
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
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allComplete =
    currentStep >= TOTAL_STEPS - 1 &&
    feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // ── Build jawaban + alasan string for each step ────────────────
  function buildJawaban(stepIndex: number): { jawaban: string; alasan: string } {
    switch (stepIndex) {
      case 0:
        return {
          jawaban: `Aturan: ${sistemA.aturan || "(belum dipilih)"}. Total kode: ${sistemA.total || "(belum diisi)"}`,
          alasan: sistemA.alasan || "",
        };
      case 1:
        return {
          jawaban: `Aturan: ${sistemB.aturan || "(belum dipilih)"}. Total kode: ${sistemB.total || "(belum diisi)"}`,
          alasan: sistemB.alasan || "",
        };
      case 2:
        return {
          jawaban: [
            `Rancangan: ${rancangan.deskripsi || "(belum diisi)"}`,
            `Total kode: ${rancangan.totalKode || "(belum diisi)"}`,
            `Mencukupi 500 siswa: ${rancangan.cukup || "(belum dipilih)"}`,
          ].join(" | "),
          alasan: rancangan.alasanCukup || "",
        };
      case 3:
        return {
          jawaban: refleksi || "",
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
        if (!sistemA.aturan || !sistemA.total || !sistemA.alasan)
          return "Lengkapi aturan, total kode, dan alasanmu dulu ya!";
        break;
      case 1:
        if (!sistemB.aturan || !sistemB.total || !sistemB.alasan)
          return "Lengkapi aturan, total kode, dan alasanmu dulu ya!";
        break;
      case 2:
        if (!rancangan.deskripsi || !rancangan.totalKode || !rancangan.cukup || !rancangan.alasanCukup)
          return "Lengkapi semua bagian rancanganmu dulu ya!";
        break;
      case 3:
        if (!refleksi.trim()) return "Tulis refleksimu dulu ya!";
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
          activity_key: "aktivitas_3",
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
  }, [currentStep, sistemA, sistemB, rancangan, refleksi]);

  // ── Render visible steps (0..currentStep) ──────────────────────
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

  // ── Render individual step ─────────────────────────────────────
  function renderStep(stepIndex: number, readOnly: boolean, isCurrent: boolean) {
    const fb = feedbackMap[stepIndex];

    switch (stepIndex) {
      case 0:
        return renderSistemA(readOnly, isCurrent, fb);
      case 1:
        return renderSistemB(readOnly, isCurrent, fb);
      case 2:
        return renderRancangan(readOnly, isCurrent, fb);
      case 3:
        return renderRefleksi(readOnly, isCurrent, fb);
      default:
        return null;
    }
  }

  // ── Step 0: Sistem A ───────────────────────────────────────────
  function renderSistemA(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 0;
    return (
      <div>
        <StepBadge step={1} title="Pahami Sistem A — Kode Tunggal" isCompleted={readOnly} />
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
        >
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
            readOnly={readOnly}
          />
          <TextInput
            id="sistemA-total"
            label="Total kode berbeda:"
            value={sistemA.total}
            onChange={(v) => setSistemA((p) => ({ ...p, total: v }))}
            placeholder="Tulis jawabanmu disini"
            readOnly={readOnly}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="sistemA-alasan" className="text-xs font-semibold text-slate-500">
              Mengapa menggunakan aturan tersebut?
            </label>
            <textarea
              id="sistemA-alasan"
              className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[56px] ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
              }`}
              style={{ borderColor: C.border }}
              value={sistemA.alasan}
              onChange={(e) => setSistemA((p) => ({ ...p, alasan: e.target.value }))}
              placeholder="Tuliskan alasanmu..."
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

  // ── Step 1: Sistem B ───────────────────────────────────────────
  function renderSistemB(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 1;
    return (
      <div>
        <StepBadge step={2} title="Pahami Sistem B — Kode Kombinasi" isCompleted={readOnly} />
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
        >
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
            readOnly={readOnly}
          />
          <TextInput
            id="sistemB-total"
            label="Total kode berbeda:"
            value={sistemB.total}
            onChange={(v) => setSistemB((p) => ({ ...p, total: v }))}
            placeholder="Tulis jawabanmu disini"
            readOnly={readOnly}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="sistemB-alasan" className="text-xs font-semibold text-slate-500">
              Mengapa menggunakan aturan tersebut?
            </label>
            <textarea
              id="sistemB-alasan"
              className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[56px] ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
              }`}
              style={{ borderColor: C.border }}
              value={sistemB.alasan}
              onChange={(e) => setSistemB((p) => ({ ...p, alasan: e.target.value }))}
              placeholder="Tuliskan alasanmu..."
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

  // ── Step 2: Rancang Sistem ─────────────────────────────────────
  function renderRancangan(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 2;
    return (
      <div>
        <StepBadge step={3} title="Rancang Sistem Kalian Sendiri" isCompleted={readOnly} />
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
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="rancangan-deskripsi" className="text-xs font-semibold text-slate-500">
                Rancangan Sistem Kode Kelompok Kami:
              </label>
              <textarea
                id="rancangan-deskripsi"
                className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[96px] ${
                  readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
                }`}
                style={{ borderColor: C.border }}
                value={rancangan.deskripsi}
                onChange={(e) => setRancangan((p) => ({ ...p, deskripsi: e.target.value }))}
                placeholder="Deskripsikan bagian-bagian kode yang kalian rancang, beserta jumlah pilihan dan aturan yang digunakan..."
                readOnly={readOnly}
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
              readOnly={readOnly}
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
                      disabled={readOnly}
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
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
              }`}
              style={{ borderColor: C.border }}
              value={rancangan.alasanCukup}
              onChange={(e) => setRancangan((p) => ({ ...p, alasanCukup: e.target.value }))}
              placeholder="Jelaskan mengapa cukup atau tidak..."
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

  // ── Step 3: Refleksi ───────────────────────────────────────────
  function renderRefleksi(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 3;
    return (
      <div>
        <StepBadge step={4} title="Refleksi" isCompleted={readOnly} />
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: C.bg, border: `1px solid ${C.greenLight}` }}
        >
          <p className="text-sm text-slate-700">
            Setelah mengerjakan ketiga langkah di atas, jawab pertanyaan refleksi berikut:
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="refleksi" className="text-sm font-medium text-slate-700">
              Apa perbedaan paling mendasar antara aturan penjumlahan dan aturan perkalian dalam konteks membuat sistem kode? Kapan kamu menggunakan masing-masing aturan?
            </label>
            <textarea
              id="refleksi"
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[100px] ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
              }`}
              style={{ borderColor: C.border }}
              value={refleksi}
              onChange={(e) => setRefleksi(e.target.value)}
              placeholder="Tulis refleksimu..."
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
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: C.greenLight }}
            >
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
