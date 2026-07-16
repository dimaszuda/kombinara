"use client";

import React, { useState, useCallback, useEffect } from "react";
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

// ── Step Definitions (2 sequential questions) ────────────────────
interface StepConfig {
  index: number;
  questionKey: string;
  entryType: "soal" | "refleksi";
  label: string;
  soalText: string;
}

const STEPS: StepConfig[] = [
  {
    index: 0,
    questionKey: "klasifikasi_10_situasi",
    entryType: "soal",
    label: "Klasifikasi 10 Situasi",
    soalText:
      "Klasifikasikan 10 situasi berikut ke dalam aturan penjumlahan atau perkalian. Situasi A: Memilih satu warna cat dari 5 warna merek X atau 4 warna merek Y. B: Membuat kode loker 1 huruf (A–E) diikuti 1 angka (1–4). C: Memilih satu film: 6 aksi, 4 komedi, atau 3 horor. D: Memesan paket makan siang: 1 nasi (3 jenis) dan 1 lauk (5 jenis). E: Memilih satu hadiah: buku (8 pilihan) atau mainan (5 pilihan). F: Membuat username: 2 huruf (A–Z) diikuti 2 angka (0–9), boleh berulang. G: Memilih satu jurusan: IPA (6), IPS (7), atau Vokasi (4). H: Membuat PIN ATM 4 digit (0–9), bebas. I: Memilih satu mapel: Matematika (3 topik) atau Fisika (4 topik). J: Mendaftar lomba: pilih kategori (3) dan hari (2).",
  },
  {
    index: 1,
    questionKey: "diskusi_pasangan",
    entryType: "refleksi",
    label: "Diskusi Pasangan",
    soalText:
      "Setelah mengklasifikasikan 10 situasi di atas, diskusikan bersama pasanganmu: (a) Adakah situasi yang membuat kalian ragu? Mengapa? (b) Pola kata yang sering muncul pada situasi penjumlahan. (c) Pola situasi yang sering muncul pada aturan perkalian. (d) Apa perbedaan mendasar antara aturan penjumlahan dan perkalian?",
  },
];

const TOTAL_STEPS = STEPS.length;

// ── Situations data ──
const SITUASI = [
  { kode: "A", teks: "Memilih satu warna cat dari 5 warna merek X atau 4 warna merek Y untuk mengecat kamar" },
  { kode: "B", teks: "Membuat kode loker: 1 huruf (dari A–E) diikuti 1 angka (dari 1–4)" },
  { kode: "C", teks: "Memilih satu film untuk ditonton: 6 film aksi atau 4 film komedi atau 3 film horor" },
  { kode: "D", teks: "Memesan paket makan siang: pilih 1 nasi (dari 3 jenis) dan 1 lauk (dari 5 jenis)" },
  { kode: "E", teks: "Memilih satu hadiah ulang tahun: buku (8 pilihan) atau mainan (5 pilihan)" },
  { kode: "F", teks: "Membuat username: 2 huruf pertama (dari A–Z) diikuti 2 angka (dari 0–9), boleh berulang" },
  { kode: "G", teks: "Memilih satu jurusan kuliah: IPA (6 jurusan) atau IPS (7 jurusan) atau Vokasi (4 jurusan)" },
  { kode: "H", teks: "Membuat PIN ATM baru: 4 digit angka (0–9), setiap digit bebas dipilih" },
  { kode: "I", teks: "Memilih satu mata pelajaran untuk diperdalam: Matematika (3 topik) atau Fisika (4 topik)" },
  { kode: "J", teks: "Mendaftar lomba: pilih kategori (3 pilihan) dan pilih hari lomba (2 pilihan)" },
];

type AturanValue = "" | "penjumlahan" | "perkalian";

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

function AturanRadio({
  name,
  value,
  onChange,
  readOnly = false,
}: {
  name: string;
  value: AturanValue;
  onChange: (v: AturanValue) => void;
  readOnly?: boolean;
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
            disabled={readOnly}
          />
          <span className="text-sm capitalize font-medium text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

type AnswerRow = { aturan: AturanValue };

export default function AktivitasKP2() {
  // ── Sequential step tracking ──────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; isCorrect: boolean }>>({});

  // ── Answer states ─────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>(
    Object.fromEntries(SITUASI.map((s) => [s.kode, { aturan: "" as AturanValue }]))
  );
  const [diskusi, setDiskusi] = useState({ a: "", b: "", c: "", d: "" });

  // ── Loading existing submissions ──────────────────────────────
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [hasExistingSubmissions, setHasExistingSubmissions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      try {
        const res = await fetch(
          "/api/aktivitas-siswa?concept_id=kaidah_penjumlahan&activity_key=aktivitas_2"
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
                text: `📝 Jawaban kamu: ${sub.answer}\n\n💬 Feedback: ${sub.feedback ?? "Jawaban sudah tersimpan."}`,
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

  function setAturan(kode: string, val: AturanValue) {
    setAnswers((prev) => ({ ...prev, [kode]: { aturan: val } }));
  }

  // ── Build jawaban string for each step ────────────────────────
  function buildJawaban(stepIndex: number): { jawaban: string; alasan: string } {
    switch (stepIndex) {
      case 0: {
        const lines = SITUASI.map(
          (s) => `Situasi ${s.kode}: ${answers[s.kode]?.aturan || "(belum dipilih)"}`
        );
        return {
          jawaban: lines.join(" | "),
          alasan: "Klasifikasi berdasarkan aturan penjumlahan (memilih satu dari beberapa kelompok) vs perkalian (memilih beberapa hal sekaligus).",
        };
      }
      case 1: {
        const dLines = [
          `(a) Ragu: ${diskusi.a || "(belum diisi)"}`,
          `(b) Pola penjumlahan: ${diskusi.b || "(belum diisi)"}`,
          `(c) Pola perkalian: ${diskusi.c || "(belum diisi)"}`,
          `(d) Perbedaan: ${diskusi.d || "(belum diisi)"}`,
        ];
        return { jawaban: dLines.join(" | "), alasan: "" };
      }
      default:
        return { jawaban: "", alasan: "" };
    }
  }

  // ── Validate step input before submitting ──────────────────────
  function validateStep(stepIndex: number): string | null {
    switch (stepIndex) {
      case 0: {
        const unanswered = SITUASI.filter((s) => !answers[s.kode]?.aturan);
        if (unanswered.length > 0)
          return `Situasi ${unanswered.map((s) => s.kode).join(", ")} belum diklasifikasikan. Lengkapi dulu ya!`;
        break;
      }
      case 1:
        if (!diskusi.a.trim() || !diskusi.b.trim() || !diskusi.c.trim() || !diskusi.d.trim())
          return "Lengkapi semua pertanyaan diskusi dulu ya!";
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
          activity_key: "aktivitas_2",
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
  }, [currentStep, answers, diskusi]);

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
      case 0:
        return renderKlasifikasi(readOnly, isCurrent, fb);
      case 1:
        return renderDiskusi(readOnly, isCurrent, fb);
      default:
        return null;
    }
  }

  // ── Step 0: Klasifikasi 10 Situasi ────────────────────────────
  function renderKlasifikasi(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 0;
    return (
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>
          Daftar Situasi
        </h2>
        <div className="space-y-3">
          {SITUASI.map((s) => (
            <div
              key={s.kode}
              className="rounded-xl p-4"
              style={{
                background: readOnly ? "#F5F5F0" : C.bg,
                border: `1px solid ${C.greenLight}`,
              }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: C.green }}
                >
                  {s.kode}
                </div>
                <div className="flex-1 space-y-3">
                  <p className={`text-sm flex-1 ${readOnly ? "text-[#6B6B66]" : "text-slate-700"}`}>
                    {s.teks}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">Aturan:</span>
                    <AturanRadio
                      name={`situasi-${s.kode}`}
                      value={answers[s.kode]?.aturan ?? ""}
                      onChange={(v) => setAturan(s.kode, v)}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </div>
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

  // ── Step 1: Diskusi Pasangan ───────────────────────────────────
  function renderDiskusi(
    readOnly: boolean,
    isCurrent: boolean,
    fb: { text: string; isCorrect: boolean } | undefined
  ) {
    const stepIdx = 1;
    const DISKUSI_ITEMS = [
      { key: "a" as const, label: "(a) Adakah situasi yang sempat membuat kalian ragu? Situasi mana? Mengapa?" },
      { key: "b" as const, label: "(b) Dari 10 situasi di atas, temukan pola kata yang sering muncul pada situasi penjumlahan:" },
      { key: "c" as const, label: "(c) Temukan pola situasi yang sering muncul pada aturan perkalian:" },
      { key: "d" as const, label: "(d) Rumuskan bersama: dengan kalimat kalian sendiri, apa perbedaan mendasar antara aturan penjumlahan dan perkalian?" },
    ];

    return (
      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: C.purple }}>
          Diskusi Pasangan
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Setelah mengisi tabel, diskusikan bersama pasanganmu:
        </p>
        <div className="space-y-4">
          {DISKUSI_ITEMS.map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={`diskusi-${key}`} className="text-sm font-medium text-slate-700 block mb-2">
                {label}
              </label>
              <textarea
                id={`diskusi-${key}`}
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 min-h-[72px] ${
                  readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : "resize-none"
                }`}
                style={{ borderColor: C.border }}
                value={diskusi[key]}
                onChange={(e) => setDiskusi((prev) => ({ ...prev, [key]: e.target.value }))}
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#C9962B" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#C9962B" }} /> Joyful
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5A8C" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5A8C" }} /> Mindful
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
