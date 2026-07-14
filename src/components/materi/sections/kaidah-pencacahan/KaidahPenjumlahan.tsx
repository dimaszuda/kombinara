"use client";

import React, { useState, useEffect, useRef } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { gradeBlanks } from "./contoh-soal-bertahap/grading";
import { ExampleShell, type ExampleStatus } from "./contoh-soal-bertahap/primitive";
import { SectionBadge } from "@/components/ui/Materi";
import {
  type Feedback,
  type Results,
  EXPECTED_DRINKS,
  ExampleDrinks,
  EXPECTED_BOOKS,
  ExampleBooks,
  EXPECTED_TRANSPORT,
  ExampleTransport,
} from "./contoh-soal-penjumlahan/examples";
import { CheckIcon } from "@/components/ui/IconButton";

// ============================================================================
// Shared types
// ============================================================================

type ToggleValue = "yes" | "no" | null;

// ── Saved data types dari backend ──────────────────────────────────
export interface PenjumlahanEksplorasiSavedData {
  [questionKey: string]: {
    answer: {
      soal: string;
      jawaban: string;
      alasan?: string;
    };
    feedback: string | null;
    isCorrect: boolean | null;
  };
}

export interface PenjumlahanDeepLearningSavedData {
  answer: {
    tabel: Array<{
      situasi: string;
      boleh_keduanya: string;
      total_pilihan: string;
    }>;
    ada_pola: string;
    operasi_matematika: string;
  };
  feedback: string | null;
  isCorrect: boolean | null;
}

export interface PenjumlahanContohSoalSavedData {
  [questionKey: string]: {
    answer: Record<string, string>;
    isCorrect: boolean;
  };
}

export interface PenjumlahanRefleksiSavedData {
  [questionKey: string]: {
    answer: string;
    feedback: string | null;
    isCorrect: boolean | null;
  };
}

export interface KaidahPenjumlahanSavedData {
  eksplorasi?: PenjumlahanEksplorasiSavedData;
  deepLearning?: PenjumlahanDeepLearningSavedData | null;
  contohSoal?: PenjumlahanContohSoalSavedData;
  refleksi?: PenjumlahanRefleksiSavedData;
}

// ── Section sequential unlocking types ────────────────────────────
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

// ── Spinner SVG ────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Lanjutkan Button (for read-only sections) ──────────────────────
function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4 mt-4">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        <CheckIcon />
        Lanjutkan
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
// Eksplorasi Kontekstual
// ============================================================================

const SOAL_EKSPLORASI_1 = `Kamu memiliki 4 baju batik berbeda motif dan 3 baju polos berbeda warna. Kamu ingin pergi bersama kedua orang tuamu untuk menghadiri pernikahan saudara. Berapa banyak pilihan baju yang bisa kamu pakai? Apakah kamu bisa memakai baju batik dan baju polos sekaligus? Atau bersamaan?`;

const SOAL_EKSPLORASI_2 = `Kamu ingin pergi dari Jakarta ke Bali. Ada 3 penerbangan langsung dan 2 rute jalur laut yang tersedia. Berapa total pilihan cara kamu bisa pergi ke Bali? Apakah kamu bisa mengambil penerbangan dan jalur laut sekaligus dalam satu perjalanan?`;

function EksplorasiKontekstual({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: PenjumlahanEksplorasiSavedData }) {
  // ── Restore answers from savedData ──────────────────────────────
  const savedSituasi1 = savedData?.["situasi_1"];
  const savedSituasi2 = savedData?.["situasi_2"];
  const savedOperasi = savedData?.["operasi_matematika"];

  const [choice1, setChoice1] = useState<ToggleValue>(() => {
    if (readOnly && savedSituasi1) {
      const jwb = savedSituasi1.answer.jawaban;
      return jwb === "Bisa" ? "yes" : jwb === "Tidak" ? "no" : null;
    }
    return null;
  });
  const [reasoning1, setReasoning1] = useState(
    readOnly ? (savedSituasi1?.answer?.alasan ?? "") : ""
  );
  const [choice2, setChoice2] = useState<ToggleValue>(() => {
    if (readOnly && savedSituasi2) {
      const jwb = savedSituasi2.answer.jawaban;
      return jwb === "Bisa" ? "yes" : jwb === "Tidak" ? "no" : null;
    }
    return null;
  });
  const [reasoning2, setReasoning2] = useState(
    readOnly ? (savedSituasi2?.answer?.alasan ?? "") : ""
  );
  const [operasiMatematika, setOperasiMatematika] = useState(
    readOnly ? (savedOperasi?.answer?.jawaban ?? "") : ""
  );

  // Sequential sub-step unlocking (0: situasi1, 1: situasi2, 2: operasiMatematika)
  const TOTAL_SUBSTEPS = 3;
  const EKSPLORASI_SUBSTEP_KEYS = ["situasi_1", "situasi_2", "operasi_matematika"] as const;
  // ── Restore sub-step state from savedData ───────────────────────
  const allSubStepsFromDB = EKSPLORASI_SUBSTEP_KEYS.every(
    (k) => savedData?.[k]?.isCorrect === true
  );
  const initialSubStep = (() => {
    if (allSubStepsFromDB) return TOTAL_SUBSTEPS - 1;
    for (let i = 0; i < TOTAL_SUBSTEPS; i++) {
      if (savedData?.[EKSPLORASI_SUBSTEP_KEYS[i]]?.isCorrect !== true) return i;
    }
    return 0;
  })();
  const [currentSubStep, setCurrentSubStep] = useState(initialSubStep);
  const [checkingSubStep, setCheckingSubStep] = useState<number | null>(null);
  const [subStepFeedback, setSubStepFeedback] = useState<Record<number, { text: string; isCorrect: boolean }>>(() => {
    const map: Record<number, { text: string; isCorrect: boolean }> = {};
    EKSPLORASI_SUBSTEP_KEYS.forEach((key, i) => {
      const d = savedData?.[key];
      if (d) {
        map[i] = { text: d.feedback ?? "Jawaban tersimpan.", isCorrect: d.isCorrect ?? false };
      }
    });
    return map;
  });

  const allSubStepsComplete =
    currentSubStep >= TOTAL_SUBSTEPS - 1 &&
    subStepFeedback[TOTAL_SUBSTEPS - 1]?.isCorrect === true;

  // Notify parent when all sub-steps done
  const eksCalledComplete = useRef(false);
  useEffect(() => {
    if (allSubStepsComplete && onComplete && !eksCalledComplete.current) {
      eksCalledComplete.current = true;
      onComplete();
    }
  }, [allSubStepsComplete, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  // useState initial values only apply on FIRST render. But savedData arrives
  // asynchronously AFTER first render. So we need a useEffect to sync.
  const didRestoreFromSaved = useRef(false);
  useEffect(() => {
    if (didRestoreFromSaved.current) return;
    if (!readOnly || !savedData) return;

    const s1 = savedData["situasi_1"];
    const s2 = savedData["situasi_2"];
    const s3 = savedData["operasi_matematika"];

    if (s1) {
      const jwb = s1.answer.jawaban;
      setChoice1(jwb === "Bisa" ? "yes" : jwb === "Tidak" ? "no" : null);
      setReasoning1(s1.answer.alasan ?? "");
    }
    if (s2) {
      const jwb = s2.answer.jawaban;
      setChoice2(jwb === "Bisa" ? "yes" : jwb === "Tidak" ? "no" : null);
      setReasoning2(s2.answer.alasan ?? "");
    }
    if (s3) {
      setOperasiMatematika(s3.answer.jawaban ?? "");
    }

    // Restore sub-step progress
    const allDone = EKSPLORASI_SUBSTEP_KEYS.every((k) => savedData[k]?.isCorrect === true);
    if (allDone) {
      setCurrentSubStep(TOTAL_SUBSTEPS - 1);
    } else {
      for (let i = 0; i < TOTAL_SUBSTEPS; i++) {
        if (savedData[EKSPLORASI_SUBSTEP_KEYS[i]]?.isCorrect !== true) {
          setCurrentSubStep(i);
          break;
        }
      }
    }

    // Restore feedback map
    const fbMap: Record<number, { text: string; isCorrect: boolean }> = {};
    EKSPLORASI_SUBSTEP_KEYS.forEach((key, i) => {
      const d = savedData[key];
      if (d) {
        fbMap[i] = { text: d.feedback ?? "Jawaban tersimpan.", isCorrect: d.isCorrect ?? false };
      }
    });
    setSubStepFeedback(fbMap);

    didRestoreFromSaved.current = true;
  }, [readOnly, savedData]);

  async function handleSubStepSubmit(subStepIndex: number) {
    setCheckingSubStep(subStepIndex);

    try {
      let soal: string;
      let jawaban: string;
      let alasan: string;
      const id = `substep-${subStepIndex}`;

      // Build payload based on sub-step
      if (subStepIndex === 0) {
        jawaban = choice1 === "yes" ? "Bisa" : choice1 === "no" ? "Tidak" : "";
        alasan = reasoning1;
        soal = SOAL_EKSPLORASI_1;
      } else if (subStepIndex === 1) {
        jawaban = choice2 === "yes" ? "Bisa" : choice2 === "no" ? "Tidak" : "";
        alasan = reasoning2;
        soal = SOAL_EKSPLORASI_2;
      } else {
        // Sub-step 2: operasi matematika
        jawaban = operasiMatematika;
        alasan = "Operasi matematika yang paling tepat";
        soal = "Jadi, operasi matematika apa yang paling tepat digunakan?";
      }

      // Client-side validation
      if (!jawaban || (subStepIndex < 2 && !alasan.trim()) || (subStepIndex === 2 && !jawaban.trim())) {
        setSubStepFeedback((prev) => ({
          ...prev,
          [subStepIndex]: {
            text: subStepIndex === 2
              ? "Tulis jawabanmu dulu ya!"
              : "Jawab pertanyaan dan ceritakan alasanmu dulu ya!",
            isCorrect: false,
          },
        }));
        setCheckingSubStep(null);
        return;
      }

      // Call AI API
      let feedbackText: string;
      let isCorrect: boolean;

      try {
        const res = await fetch("/api/ai/eksplorasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soal, jawaban, alasan }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        feedbackText = data.feedback ?? "Jawaban tersimpan.";
        isCorrect = data.isCorrect ?? false;
      } catch {
        feedbackText = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
        isCorrect = false;
      }

      setSubStepFeedback((prev) => ({
        ...prev,
        [subStepIndex]: { text: feedbackText, isCorrect },
      }));

      // Advance to next sub-step if correct
      if (isCorrect && subStepIndex < TOTAL_SUBSTEPS - 1) {
        setCurrentSubStep((prev) => prev + 1);
      }

      // Save to DB per question (fire-and-forget)
      let questionKey: string;
      let answerPayload: Record<string, unknown>;

      if (subStepIndex === 0) {
        questionKey = "situasi_1";
        answerPayload = { soal: SOAL_EKSPLORASI_1, jawaban, alasan };
      } else if (subStepIndex === 1) {
        questionKey = "situasi_2";
        answerPayload = { soal: SOAL_EKSPLORASI_2, jawaban, alasan };
      } else {
        questionKey = "operasi_matematika";
        answerPayload = { soal: "Operasi matematika yang paling tepat digunakan?", jawaban };
      }

      fetch("/api/eksplorasi-kontekstual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_penjumlahan",
          question_key: questionKey,
          answer: answerPayload,
          feedback: feedbackText,
          is_correct: isCorrect,
        }),
      }).catch((err) => console.error("[eksplorasi-kontekstual] DB save error:", err));
    } finally {
      setCheckingSubStep(null);
    }
  }

  // ── Render helpers per sub-step ─────────────────────────────────
  function renderSituasi1(readOnlyStep: boolean) {
    const fb = subStepFeedback[0];
    const isActive = currentSubStep === 0;

    return (
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata 1</h3>
        <p className="mb-3 text-justify leading-relaxed text-[#2C2C2A]">
          Kamu memiliki 4 baju batik berbeda motif dan 3 baju polos berbeda warna. Kamu ingin
          pergi bersama kedua orang tuamu untuk menghadiri pernikahan saudara. Berapa banyak
          pilihan baju yang bisa kamu pakai?
        </p>
        <p className="mb-3 text-sm font-medium text-[#2C2C2A]">
          Apakah kamu bisa memakai baju batik dan baju polos sekaligus? Atau bersamaan?
        </p>
        <div className="mb-3 flex gap-2">
          <ToggleButton label="Bisa" active={choice1 === "yes"} disabled={readOnlyStep} onClick={readOnlyStep ? () => {} : () => setChoice1("yes")} />
          <ToggleButton label="Tidak" active={choice1 === "no"} disabled={readOnlyStep} onClick={readOnlyStep ? () => {} : () => setChoice1("no")} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#663362]">
            Ceritakan Alasanmu!
          </label>
          <textarea
            placeholder="Ceritakan alasanmu..."
            value={reasoning1}
            disabled={readOnlyStep}
            onChange={(e) => setReasoning1(e.target.value)}
            className={`w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] ${readOnlyStep ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : ""}`}
          />
        </div>

        {fb && (
          <div className={`mt-3 rounded-lg border p-3 ${fb.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
            <p className={`mb-1 text-xs font-medium ${fb.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
              {fb.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
            </p>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">{fb.text}</p>
          </div>
        )}

        {/* Submit only for active, not-yet-correct sub-step */}
        {isActive && !readOnlyStep && fb?.isCorrect !== true && (
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
      </div>
    );
  }

  function renderSituasi2(readOnlyStep: boolean) {
    const fb = subStepFeedback[1];
    const isActive = currentSubStep === 1;

    return (
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata 2</h3>
        <p className="mb-2 text-justify leading-relaxed text-[#2C2C2A]">
          Kamu ingin pergi dari Jakarta ke Bali. Ada 3 penerbangan langsung dan 2 rute jalur
          laut yang tersedia. Berapa total pilihan cara kamu bisa pergi ke Bali?
        </p>
        <p className="mb-1 text-sm italic text-[#34673999]">
          Sebelum membaca penjelasan, diskusikan dengan temanmu!
        </p>
        <p className="mb-3 text-sm font-medium text-[#2C2C2A]">
          Apakah kamu bisa mengambil penerbangan dan jalur laut sekaligus dalam satu perjalanan?
        </p>
        <div className="mb-3 flex gap-2">
          <ToggleButton label="Bisa" active={choice2 === "yes"} disabled={readOnlyStep} onClick={readOnlyStep ? () => {} : () => setChoice2("yes")} />
          <ToggleButton label="Tidak" active={choice2 === "no"} disabled={readOnlyStep} onClick={readOnlyStep ? () => {} : () => setChoice2("no")} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#663362]">
            Ceritakan Alasanmu!
          </label>
          <textarea
            placeholder="Ceritakan alasanmu..."
            value={reasoning2}
            disabled={readOnlyStep}
            onChange={(e) => setReasoning2(e.target.value)}
            className={`w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] ${readOnlyStep ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : ""}`}
          />
        </div>

        {fb && (
          <div className={`mt-3 rounded-lg border p-3 ${fb.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
            <p className={`mb-1 text-xs font-medium ${fb.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
              {fb.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
            </p>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">{fb.text}</p>
          </div>
        )}

        {isActive && !readOnlyStep && fb?.isCorrect !== true && (
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
      </div>
    );
  }

  function renderOperasiMatematika(readOnlyStep: boolean) {
    const fb = subStepFeedback[2];
    const isActive = currentSubStep === 2;

    return (
      <div className="rounded-xl border border-[#34673926] bg-[#DBFFD5]/50 p-5">
        <label className="mb-2 block text-base font-semibold text-[#346739]">
          Jadi, operasi matematika apa yang paling tepat digunakan?
        </label>
        <input
          type="text"
          placeholder="Tulis jawabanmu..."
          value={operasiMatematika}
          disabled={readOnlyStep}
          onChange={(e) => setOperasiMatematika(e.target.value)}
          className={`w-full rounded-lg border border-[#34673933] bg-white px-4 py-2.5 text-sm placeholder:text-[#34673966] ${readOnlyStep ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
        />

        {fb && (
          <div className={`mt-3 rounded-lg border p-3 ${fb.isCorrect === false ? "border-[#C44F4F33] bg-[#C44F4F08]" : "border-[#66336233] bg-[#66336208]"}`}>
            <p className={`mb-1 text-xs font-medium ${fb.isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]"}`}>
              {fb.isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
            </p>
            <p className="text-sm leading-relaxed text-[#2C2C2A]">{fb.text}</p>
          </div>
        )}

        {isActive && !readOnlyStep && fb?.isCorrect !== true && (
          <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
            <button
              type="button"
              onClick={() => handleSubStepSubmit(2)}
              disabled={checkingSubStep === 2}
              className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              {checkingSubStep === 2 ? <><Spinner /> Mengecek...</> : <><CheckIcon /> Simpan Jawaban</>}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── If readOnly (section completed), show all sub-steps as read-only ──
  if (readOnly) {
    return (
      <article>
        <SectionBadge>Eksplorasi Kontekstual</SectionBadge>
        <div className="flex flex-col gap-4">
          {renderSituasi1(true)}
          {renderSituasi2(true)}
          {renderOperasiMatematika(true)}
        </div>
        <div className="border-b-2 border-[#34673966] mt-4" />
      </article>
    );
  }

  // ── Show completed + current sub-steps ──────────────────────────
  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      {/* Sub-step progress */}
      <div className="mb-4">
        <p className="text-xs font-medium text-[#663362] mb-2">
          Langkah {currentSubStep + 1} dari {TOTAL_SUBSTEPS}
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => {
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
                {i < 2 && <div className={`h-0.5 flex-1 rounded transition-colors ${subStepFeedback[i]?.isCorrect ? "bg-[#346739]" : "bg-[#E5E5E0]"}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Sub-step 0: Situasi 1 */}
        {currentSubStep >= 0 && renderSituasi1(subStepFeedback[0]?.isCorrect === true)}
        {/* Sub-step 1: Situasi 2 */}
        {currentSubStep >= 1 && renderSituasi2(subStepFeedback[1]?.isCorrect === true)}
        {/* Sub-step 2: Operasi Matematika */}
        {currentSubStep >= 2 && renderOperasiMatematika(subStepFeedback[2]?.isCorrect === true)}
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Deep Learning
// ============================================================================

function DeepLearning({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: PenjumlahanDeepLearningSavedData | null }) {
  const savedAnswer = savedData?.answer;
  const savedFeedback = savedData?.feedback;
  const wasAlreadyCorrect = savedData?.isCorrect === true;

  const situations = [
    {
      situation: "Pilih transportasi (pesawat atau kapal)",
      optionA: "3 jenis pesawat",
      optionB: "2 jenis kapal",
    },
    {
      situation: "Pilih baju (batik atau polos)",
      optionA: "4 batik beda motif",
      optionB: "2 baju polos beda warna",
    },
    {
      situation: "Pilih jurusan (IPA atau IPS)",
      optionA: "6 jurusan IPA",
      optionB: "8 jurusan IPS",
    },
  ];

  const [tableAnswers, setTableAnswers] = useState(
    readOnly && savedAnswer?.tabel
      ? savedAnswer.tabel.map((t) => ({
          both: t.boleh_keduanya === "Ya" ? "yes" : t.boleh_keduanya === "Tidak" ? "no" : t.boleh_keduanya || "",
          total: t.total_pilihan || "",
        }))
      : situations.map(() => ({ both: "", total: "" }))
  );
  const [foundPattern, setFoundPattern] = useState<ToggleValue>(
    readOnly && savedAnswer
      ? savedAnswer.ada_pola === "Ya" ? "yes" : savedAnswer.ada_pola === "Tidak" ? "no" : null
      : null
  );
  const [operasiMatematika, setOperasiMatematika] = useState(
    readOnly ? (savedAnswer?.operasi_matematika ?? "") : ""
  );
  const [submitted, setSubmitted] = useState(wasAlreadyCorrect);

  // Notify parent when submitted
  const dlCalledComplete = useRef(false);
  useEffect(() => {
    if (submitted && onComplete && !dlCalledComplete.current) {
      dlCalledComplete.current = true;
      onComplete();
    }
  }, [submitted, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreDL = useRef(false);
  useEffect(() => {
    if (didRestoreDL.current) return;
    if (!readOnly || !savedData) return;

    const ans = savedData.answer;
    if (ans?.tabel) {
      setTableAnswers(
        ans.tabel.map((t) => ({
          both: t.boleh_keduanya === "Ya" ? "yes" : t.boleh_keduanya === "Tidak" ? "no" : t.boleh_keduanya || "",
          total: t.total_pilihan || "",
        }))
      );
    }
    if (ans) {
      setFoundPattern(ans.ada_pola === "Ya" ? "yes" : ans.ada_pola === "Tidak" ? "no" : null);
      setOperasiMatematika(ans.operasi_matematika ?? "");
    }
    if (savedData.isCorrect === true) {
      setSubmitted(true);
    }

    didRestoreDL.current = true;
  }, [readOnly, savedData]);

  function handleSubmit() {
    const jawabanObj = {
      tabel: situations.map((s, i) => ({
        situasi: s.situation,
        boleh_keduanya: tableAnswers[i].both || "(belum dijawab)",
        total_pilihan: tableAnswers[i].total || "(belum dijawab)",
      })),
      ada_pola: foundPattern === "yes" ? "Ya" : foundPattern === "no" ? "Tidak" : "(belum dijawab)",
      operasi_matematika: operasiMatematika || "(belum dijawab)",
    };

    const soal =
      "Aktivitas menemukan pola kaidah penjumlahan: Siswa menganalisis 3 situasi pilihan saling lepas (transportasi, baju, jurusan) untuk menentukan boleh tidaknya memilih keduanya, total pilihan, apakah ada pola, dan operasi matematika yang digunakan.";

    setSubmitted(true);

    // Background: call AI then save to DB
    fetch("/api/ai/deep-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soal, jawaban: JSON.stringify(jawabanObj) }),
    })
      .then((res) => (res.ok ? res.json() : Promise.resolve(null)))
      .then((data) =>
        fetch("/api/aktivitas-deep-learning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept_id: "kaidah_penjumlahan",
            answer: jawabanObj,
            feedback: data?.feedback ?? null,
            is_correct: data?.isCorrect ?? null,
          }),
        })
      )
      .catch((err) => console.error("[deep-learning] background error:", err));
  }

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <p className="mb-4 text-xl font-semibold text-[#346739]">
        🔍 Eksplorasi: Temukan Polanya
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#34673926]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#663362]">
              <th className="px-4 py-3 text-left font-semibold text-white">Situasi</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Pilihan A</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Pilihan B</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Boleh Keduanya?</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Total Pilihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#34673915]">
            {situations.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                <td className="px-4 py-3 text-[#2C2C2A]">{item.situation}</td>
                <td className="px-4 py-3 text-center text-[#2C2C2A]">{item.optionA}</td>
                <td className="px-4 py-3 text-center text-[#2C2C2A]">{item.optionB}</td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={tableAnswers[i].both}
                    disabled={readOnly}
                    onChange={(e) =>
                      setTableAnswers((prev) =>
                        prev.map((a, idx) => idx === i ? { ...a, both: e.target.value } : a)
                      )
                    }
                    className={`rounded-md border border-[#34673933] px-2 py-1.5 text-xs text-[#2C2C2A] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                  >
                    <option value="">Ya/Tidak</option>
                    <option value="yes">Ya</option>
                    <option value="no">Tidak</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="text"
                    value={tableAnswers[i].total}
                    disabled={readOnly}
                    onChange={(e) =>
                      setTableAnswers((prev) =>
                        prev.map((a, idx) => idx === i ? { ...a, total: e.target.value } : a)
                      )
                    }
                    placeholder="..."
                    className={`w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-base font-medium text-[#2C2C2A]">
        Pertanyaan: Apa yang kamu perhatikan dari kolom &ldquo;Boleh keduanya?&rdquo; dan
        &ldquo;Total Pilihan&rdquo;?
      </p>

      <p className="mt-4 text-lg font-semibold text-[#346739]">🤔 Apakah ada pola?</p>
      <div className="mt-2.5 flex gap-2">
        <ToggleButton label="Ya" active={foundPattern === "yes"} onClick={readOnly ? () => {} : () => setFoundPattern("yes")} />
        <ToggleButton label="Tidak" active={foundPattern === "no"} onClick={readOnly ? () => {} : () => setFoundPattern("no")} />
      </div>

      <p className="mt-4 text-lg font-semibold text-[#346739]">
        Operasi matematika apa yang selalu muncul?
      </p>
      <input
        type="text"
        placeholder="Tulis jawabanmu..."
        value={operasiMatematika}
        disabled={readOnly}
        onChange={(e) => setOperasiMatematika(e.target.value)}
        className={`mt-2 w-full rounded-lg border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""}`}
      />
      {!readOnly && (
        <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
          >
            {submitted ? (
              <>
                <CheckIcon />
                Tersimpan
              </>
            ) : (
              <>
                <CheckIcon />
                Simpan Jawaban
              </>
            )}
          </button>

          {/* Saved confirmation */}
          {submitted && (
            <div className="w-full rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="text-sm leading-relaxed text-[#2C2C2A]">Jawaban kamu sudah tersimpan! ✅</p>
            </div>
          )}
        </div>
      )}

      {/* Show saved AI feedback when readOnly */}
      {readOnly && savedFeedback && (
        <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
          <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">{savedFeedback}</p>
        </div>
      )}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Penjelasan Konsep
// ============================================================================

function PenjelasanKonsep({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      {/* Konsep Dasar */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Konsep Dasar</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika suatu kejadian dapat dilakukan dengan cara A <b>atau</b> cara B (tidak keduanya
          sekaligus), maka total cara melakukan kejadian tersebut adalah:
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total  = $n(A) + n(B)$"}</RichText>
        </div>
        <p className="mt-3 text-sm text-[#34673999]">Dimana:</p>
        <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-2">
          <RichText>
            {"$n(A)$ = banyaknya cara kejadian A"}
          </RichText>
          <br/>
          <RichText>
            {"$n(B)$ = banyaknya cara kejadian B"}
          </RichText>
        </div>
      </div>

      {/* Kata Kunci */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-bold text-[#346739]">Kata Kunci</h3>
        <p className="text-2xl font-bold text-[#663362]">
          &ldquo;ATAU&rdquo;{" "}
          <span className="text-base font-normal text-[#2C2C2A]">&rarr; Penjumlahan</span>
        </p>
      </div>

      {/* Mengapa penjumlahan? */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Mengapa penjumlahan?</h3>
        <p className="leading-relaxed text-[#2C2C2A]">
          Bayangkan kamu punya kotak A berisi 3 bola merah dan kotak B berisi 4 bola biru. Kamu
          hanya boleh mengambil dari <b>satu kotak saja</b>. Berapa pilihan yang ada? Tentu 3 +
          4 = 7. Kamu tidak mengalikan karena kamu tidak memilih dari kedua kotak secara
          bersamaan.
        </p>
        <p className="mt-3 leading-relaxed text-[#2C2C2A]">
          <b>Syarat penting</b>: Kejadian A dan B{" "}
          <b>bersifat saling lepas (mutually exclusive)</b> artinya tidak bisa terjadi
          bersamaan.
        </p>
      </div>

      {/* Generalisasi */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Generalisasi</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika ada <b>k kejadian saling lepas</b> dengan masing-masing{" "}
          <RichText>{"$n_1, n_2, n_3, ... , n_k$"}</RichText> cara:
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total = $n_1 + n_2 + n_3 + ... + n_k$"}</RichText>
        </div>
      </div>
      {onNext && <NextButton onClick={onNext} />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Contoh Soal
// ============================================================================

function ContohSoal({ onComplete, readOnly = false, savedData }: SectionProps & { savedData?: PenjumlahanContohSoalSavedData }) {
  const CONTOH_KEYS = ["penjumlahan_minuman", "penjumlahan_buku", "penjumlahan_transport"] as const;

  // ── Restore passedCount from savedData ───────────────────────────
  const initialPassedCount = (() => {
    if (!savedData) return 0;
    return CONTOH_KEYS.filter((k) => savedData[k]?.isCorrect === true).length;
  })();

  const [passedCount, setPassedCount] = useState(initialPassedCount);

  // Notify parent when all 3 examples passed (or already complete from DB)
  const csCalledComplete = useRef(false);
  useEffect(() => {
    if ((passedCount >= 3 || initialPassedCount >= 3) && onComplete && !csCalledComplete.current) {
      csCalledComplete.current = true;
      onComplete();
    }
  }, [passedCount, initialPassedCount, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreCS = useRef(false);
  useEffect(() => {
    if (didRestoreCS.current) return;
    if (!readOnly || !savedData) return;

    const count = CONTOH_KEYS.filter((k) => savedData[k]?.isCorrect === true).length;
    setPassedCount(count);

    const d1 = savedData["penjumlahan_minuman"];
    if (d1) {
      setValuesDrinks(d1.answer as Record<string, string>);
      setFeedbackDrinks("correct");
    }
    const d2 = savedData["penjumlahan_buku"];
    if (d2) {
      setValuesBooks(d2.answer as Record<string, string>);
      setFeedbackBooks("correct");
    }
    const d3 = savedData["penjumlahan_transport"];
    if (d3) {
      setValuesTransport(d3.answer as Record<string, string>);
      setFeedbackTransport("correct");
    }

    didRestoreCS.current = true;
  }, [readOnly, savedData]);

  function restoreFeedback(key: string): Feedback {
    if (readOnly && savedData?.[key]?.isCorrect) return "correct";
    return "idle";
  }

  const [valuesDrinks, setValuesDrinks] = useState<Record<string, string>>(
    readOnly ? (savedData?.["penjumlahan_minuman"]?.answer as Record<string, string> ?? {}) : {}
  );
  const [resultsDrinks, setResultsDrinks] = useState<Results>(null);
  const [feedbackDrinks, setFeedbackDrinks] = useState<Feedback>(restoreFeedback("penjumlahan_minuman"));

  const [valuesBooks, setValuesBooks] = useState<Record<string, string>>(
    readOnly ? (savedData?.["penjumlahan_buku"]?.answer as Record<string, string> ?? {}) : {}
  );
  const [resultsBooks, setResultsBooks] = useState<Results>(null);
  const [feedbackBooks, setFeedbackBooks] = useState<Feedback>(restoreFeedback("penjumlahan_buku"));

  const [valuesTransport, setValuesTransport] = useState<Record<string, string>>(
    readOnly ? (savedData?.["penjumlahan_transport"]?.answer as Record<string, string> ?? {}) : {}
  );
  const [resultsTransport, setResultsTransport] = useState<Results>(null);
  const [feedbackTransport, setFeedbackTransport] = useState<Feedback>(restoreFeedback("penjumlahan_transport"));

  function statusFor(index: number): ExampleStatus {
    if (index < passedCount) return "completed";
    if (index === passedCount) return "active";
    return "locked";
  }

  function saveAttempt(
    question_key: string,
    difficulty_level: "mudah" | "sedang" | "hots",
    order_index: number,
    answer: Record<string, string>,
    is_correct: boolean
  ) {
    fetch("/api/contoh-soal-bertahap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "kaidah_penjumlahan",
        question_key,
        difficulty_level,
        order_index,
        answer,
        is_correct,
      }),
    }).catch((err) => console.error("[contoh-soal-bertahap] DB save error:", err));
  }

  function checkDrinks() {
    if (readOnly) return;
    const { results, allCorrect } = gradeBlanks(EXPECTED_DRINKS, valuesDrinks);
    setResultsDrinks(results);
    setFeedbackDrinks(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 1));
    saveAttempt("penjumlahan_minuman", "mudah", 0, valuesDrinks, allCorrect);
  }

  function checkBooks() {
    if (readOnly) return;
    const { results, allCorrect } = gradeBlanks(EXPECTED_BOOKS, valuesBooks);
    setResultsBooks(results);
    setFeedbackBooks(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 2));
    saveAttempt("penjumlahan_buku", "sedang", 1, valuesBooks, allCorrect);
  }

  function checkTransport() {
    if (readOnly) return;
    const { results, allCorrect } = gradeBlanks(EXPECTED_TRANSPORT, valuesTransport);
    setResultsTransport(results);
    setFeedbackTransport(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 3));
    saveAttempt("penjumlahan_transport", "hots", 2, valuesTransport, allCorrect);
  }

  return (
    <article>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>
      <section>
        {/* Progress bar */}
        <div className="mb-6 flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < passedCount ? "#346739" : "#34673926" }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <ExampleShell
            status={statusFor(0)}
            level="mudah"
            title="Contoh 1: Minuman Kantin"
            illustrationSrc="/images/minuman.png"
            illustrationAlt="Ilustrasi minuman panas dan dingin"
            lockedHint="Contoh 1: Minuman Kantin"
            onCheck={checkDrinks}
            feedback={feedbackDrinks}
          >
            <ExampleDrinks
              values={valuesDrinks}
              results={resultsDrinks}
              onChange={(id, v) => setValuesDrinks((prev) => ({ ...prev, [id]: v }))}
            />
          </ExampleShell>

          <ExampleShell
            status={statusFor(1)}
            level="sedang"
            title="Contoh 2: Buku Perpustakaan"
            illustrationSrc="/illustrations/floating-book.svg"
            illustrationAlt="Ilustrasi rak buku perpustakaan"
            lockedHint="Contoh 2: Buku Perpustakaan — selesaikan Contoh 1 dulu"
            onCheck={checkBooks}
            feedback={feedbackBooks}
          >
            <ExampleBooks
              values={valuesBooks}
              results={resultsBooks}
              onChange={(id, v) => setValuesBooks((prev) => ({ ...prev, [id]: v }))}
            />
          </ExampleShell>

          <ExampleShell
            status={statusFor(2)}
            level="hots"
            title="Contoh 3: Rute Andi ke Sekolah"
            illustrationSrc="/illustrations/car.svg"
            illustrationAlt="Ilustrasi pilihan transportasi ke sekolah"
            lockedHint="Contoh 3: Rute Andi ke Sekolah — selesaikan Contoh 2 dulu"
            onCheck={checkTransport}
            feedback={feedbackTransport}
          >
            <ExampleTransport
              values={valuesTransport}
              results={resultsTransport}
              onChange={(id, v) => setValuesTransport((prev) => ({ ...prev, [id]: v }))}
            />
          </ExampleShell>
        </div>
      </section>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Mengapa? Corner
// ============================================================================

function MengapaCorner({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>
      <blockquote className="kp-quote text-justify">
        💡 Mengapa kita menjumlahkan, bukan mengalikan? Aturan penjumlahan berlaku ketika kita
        memilih satu dari beberapa kelompok. Kuncinya adalah kata{" "}
        <b>&ldquo;ATAU&rdquo;</b>. Jika kamu memilih mie ATAU nasi, kamu hanya makan satu
        bukan keduanya. Jadi pilihan total ya sekadar <b>digabungkan (dijumlahkan)</b>, bukan
        dikalikan. Analogi: Jika ada 3 pintu masuk dari sisi kiri dan 4 pintu masuk dari sisi
        kanan, total pintu yang bisa kamu gunakan (hanya satu) adalah 3 + 4 = 7. Kamu tidak
        mengalikan karena tidak melewati semua pintu sekaligus!
      </blockquote>
      {onNext && <NextButton onClick={onNext} />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Refleksi Mini — Sequential Unlocking (1 soal per langkah)
// ============================================================================

const REFLEKSI_PENJUMLAHAN_QUESTIONS = [
  {
    key: "refleksi_penjumlahan_1",
    soal:
      "Dalam situasi apa kamu menggunakan aturan penjumlahan, bukan perkalian?",
  },
  {
    key: "refleksi_penjumlahan_2",
    soal:
      "Apa kata kunci dalam soal yang menandakan aturan penjumlahan?",
  },
  {
    key: "refleksi_penjumlahan_3",
    soal:
      "Berikan satu contoh dari kehidupan nyata di sekitar sekolahmu!",
  },
];

const TOTAL_REFLEKSI = REFLEKSI_PENJUMLAHAN_QUESTIONS.length;

interface RefleksiStepFeedback {
  text: string;
  isCorrect: boolean;
}

function RefleksiMini({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: PenjumlahanRefleksiSavedData }) {
  const allSavedComplete =
    REFLEKSI_PENJUMLAHAN_QUESTIONS.every((q) => savedData?.[q.key]?.isCorrect === true);

  const [currentStep, setCurrentStep] = useState(() => {
    if (allSavedComplete) return TOTAL_REFLEKSI - 1;
    for (let i = 0; i < TOTAL_REFLEKSI; i++) {
      const key = REFLEKSI_PENJUMLAHAN_QUESTIONS[i].key;
      if (savedData?.[key]?.isCorrect !== true) return i;
    }
    return 0;
  });
  const [answers, setAnswers] = useState<string[]>(() =>
    REFLEKSI_PENJUMLAHAN_QUESTIONS.map((q) => savedData?.[q.key]?.answer ?? "")
  );
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, RefleksiStepFeedback>>(() => {
    const map: Record<number, RefleksiStepFeedback> = {};
    REFLEKSI_PENJUMLAHAN_QUESTIONS.forEach((q, i) => {
      const d = savedData?.[q.key];
      if (d) {
        map[i] = { text: d.feedback ?? "Jawaban tersimpan.", isCorrect: d.isCorrect ?? false };
      }
    });
    return map;
  });

  const onCompleteCalled = useRef(false);

  const allComplete =
    currentStep >= TOTAL_REFLEKSI - 1 &&
    feedbackMap[TOTAL_REFLEKSI - 1]?.isCorrect === true;

  useEffect(() => {
    if (allComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    if (!readOnly || !savedData) return;

    setAnswers(REFLEKSI_PENJUMLAHAN_QUESTIONS.map((q) => savedData[q.key]?.answer ?? ""));

    const allDone = REFLEKSI_PENJUMLAHAN_QUESTIONS.every((q) => savedData[q.key]?.isCorrect === true);
    if (allDone) {
      setCurrentStep(TOTAL_REFLEKSI - 1);
    } else {
      for (let i = 0; i < TOTAL_REFLEKSI; i++) {
        if (savedData[REFLEKSI_PENJUMLAHAN_QUESTIONS[i].key]?.isCorrect !== true) {
          setCurrentStep(i);
          break;
        }
      }
    }

    const fbMap: Record<number, RefleksiStepFeedback> = {};
    REFLEKSI_PENJUMLAHAN_QUESTIONS.forEach((q, i) => {
      const d = savedData[q.key];
      if (d) {
        fbMap[i] = { text: d.feedback ?? "Jawaban tersimpan.", isCorrect: d.isCorrect ?? false };
      }
    });
    setFeedbackMap(fbMap);

    didRestoreRef.current = true;
  }, [readOnly, savedData]);

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  async function handleSubmit(stepIndex: number) {
    const q = REFLEKSI_PENJUMLAHAN_QUESTIONS[stepIndex];
    const answer = answers[stepIndex];

    if (!answer.trim()) {
      setFeedbackMap((prev) => ({
        ...prev,
        [stepIndex]: {
          text: "Tulis jawabanmu dulu ya! 📝",
          isCorrect: false,
        },
      }));
      return;
    }

    setCheckingStep(stepIndex);

    try {
      // ── AI classification ──────────────────────────────────
      const res = await fetch("/api/ai/apersepsi-pemantik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "refleksi",
          responses: [
            {
              question_key: q.key,
              soal: q.soal,
              response_data: { jawaban: answer },
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const result = data.feedback?.[q.key];

      const fb: RefleksiStepFeedback = {
        text: result?.feedback ?? "Jawaban tersimpan.",
        isCorrect: result?.isCorrect ?? false,
      };

      setFeedbackMap((prev) => ({ ...prev, [stepIndex]: fb }));

      // ── Save to DB per question ────────────────────────────
      fetch("/api/refleksi-mini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_penjumlahan",
          rows: [
            {
              question_key: q.key,
              answer,
              feedback: fb.text,
              is_correct: fb.isCorrect,
            },
          ],
        }),
      }).catch((err) => console.error("[refleksi-mini] DB save error:", err));

      // Advance if correct
      if (fb.isCorrect && stepIndex < TOTAL_REFLEKSI - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch {
      setFeedbackMap((prev) => ({
        ...prev,
        [stepIndex]: {
          text: "Maaf, ada kendala. Coba lagi ya!",
          isCorrect: false,
        },
      }));
    } finally {
      setCheckingStep(null);
    }
  }

  if (allComplete) {
    return (
      <article>
        <SectionBadge>Refleksi Mini ✅</SectionBadge>

        {/* Show all completed questions stacked */}
        <div className="flex flex-col gap-4">
          {REFLEKSI_PENJUMLAHAN_QUESTIONS.map((q, i) => {
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
                  <div className="mt-2 rounded-lg border border-[#66336233] bg-[#66336208] p-2.5">
                    <p className="mb-0.5 text-xs font-medium text-[#663362]">
                      💬 Feedback Kombi
                    </p>
                    <p className="text-sm leading-relaxed text-[#2C2C2A]">
                      {fb.text}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#346739] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">
              🎉 Refleksi selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan semua pertanyaan refleksi. Pemahamanmu
              tentang aturan penjumlahan semakin baik!
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
          Pertanyaan {currentStep + 1} dari {TOTAL_REFLEKSI}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {REFLEKSI_PENJUMLAHAN_QUESTIONS.map((_, i) => {
            const fb = feedbackMap[i];
            const isCompleted = fb?.isCorrect === true;
            const isActive = i === currentStep;
            const isLocked = i > currentStep && !isCompleted;

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
                    isCompleted
                      ? "text-white"
                      : isActive
                        ? "text-[#346739]"
                        : "text-[#9E9D99]"
                  }`}
                  title={isLocked ? "Terkunci" : `Pertanyaan ${i + 1}`}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>
                {i < TOTAL_REFLEKSI - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded transition-colors ${
                      feedbackMap[i]?.isCorrect ? "bg-[#346739]" : "bg-[#E5E5E0]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Show completed + current questions */}
      <div className="flex flex-col gap-4">
        {REFLEKSI_PENJUMLAHAN_QUESTIONS.map((q, i) => {
          // Only show up to current step
          if (i > currentStep) return null;

          const fb = feedbackMap[i];
          const isCurrent = i === currentStep;
          const isCompleted = fb?.isCorrect === true;
          const disabled = isCompleted || readOnly;

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
                className={`w-full resize-y rounded-lg border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966] ${
                  disabled
                    ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none"
                    : ""
                }`}
              />
              {fb && (
                <div className="mt-2 rounded-lg border border-[#66336233] bg-[#66336208] p-2.5">
                  <p className="mb-0.5 text-xs font-medium text-[#663362]">
                    💬 Feedback Kombi
                  </p>
                  <p className="text-sm leading-relaxed text-[#2C2C2A]">
                    {fb.text}
                  </p>
                </div>
              )}

              {/* Submit button — only for active, not-yet-correct step */}
              {isCurrent && !isCompleted && !readOnly && (
                <div className="mt-3 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
                  <button
                    type="button"
                    onClick={() => handleSubmit(i)}
                    disabled={checkingStep === i}
                    className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
                  >
                    {checkingStep === i ? (
                      <>
                        <Spinner />
                        Mengecek...
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        Simpan Jawaban
                      </>
                    )}
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
// Main Export — Sequential Section Unlocking
// ============================================================================

export default function KaidahPenjumlahan({
  onComplete,
  initialCompletedSections = {},
  savedData,
}: {
  onComplete?: () => void;
  /** Section indices yang sudah complete dari backend (hanya DB-tracked: 0,1,5) */
  initialCompletedSections?: Record<number, boolean>;
  /** Data jawaban & feedback yang sudah tersimpan di DB */
  savedData?: KaidahPenjumlahanSavedData;
}) {
  const onCompleteCalled = useRef(false);

  // ── Build initial state dari data backend ───────────────────────
  // Infer read-only sections: jika section berikutnya sudah complete,
  // maka section read-only di antaranya juga pasti sudah dilalui.
  function buildInitialState(): {
    currentSection: number;
    completedSections: Record<number, boolean>;
  } {
    const cs: Record<number, boolean> = { ...initialCompletedSections };

    // Section 2 (Penjelasan Konsep, read-only) — infer dari section 1 atau 5
    if (cs[1] || cs[5]) cs[2] = true;
    // Section 4 (Mengapa Corner, read-only) — infer dari section 5
    if (cs[5]) cs[4] = true;
    // Section 3 (Contoh Soal) — now tracked by DB via contoh_soal_bertahap_attempts,
    // also infer from section 5 as fallback
    if (cs[5] && !cs[3]) cs[3] = true;

    // Cari section pertama yang belum complete
    let firstUncompleted = TOTAL_SECTIONS - 1;
    for (let i = 0; i < TOTAL_SECTIONS; i++) {
      if (!cs[i]) {
        firstUncompleted = i;
        break;
      }
    }

    console.log(
      "[KaidahPenjumlahan] buildInitialState:",
      "initialCompletedSections:", JSON.stringify(initialCompletedSections),
      "cs:", JSON.stringify(cs),
      "firstUncompleted:", firstUncompleted
    );

    return { currentSection: firstUncompleted, completedSections: cs };
  }

  const initState = buildInitialState();

  const [currentSection, setCurrentSection] = useState(initState.currentSection);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(
    initState.completedSections
  );

  // ── Sync initialCompletedSections from backend when it arrives ──
  // buildInitialState() is called on EVERY render but useState only uses
  // the initial value on the FIRST mount. If the parent passes empty props
  // on first render then updates them after API response, we must sync.
  const didSyncInitial = useRef(false);
  useEffect(() => {
    if (didSyncInitial.current) return;
    if (Object.keys(initialCompletedSections).length === 0) return;

    const rebuilt = buildInitialState();
    console.log(
      "[KaidahPenjumlahan] syncing from initialCompletedSections:",
      JSON.stringify(initialCompletedSections),
      "→ currentSection:", rebuilt.currentSection,
      "completedSections:", JSON.stringify(rebuilt.completedSections)
    );
    setCurrentSection(rebuilt.currentSection);
    setCompletedSections(rebuilt.completedSections);
    didSyncInitial.current = true;
  }, [initialCompletedSections]);

  function markComplete(sectionIndex: number) {
    setCompletedSections((prev) => ({ ...prev, [sectionIndex]: true }));
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

  // Sections 2 (PenjelasanKonsep) and 4 (MengapaCorner) are read-only
  const allComplete = isCompleted(5);

  // Notify parent when all sections done
  useEffect(() => {
    if (allComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  return (
    <section className="rounded-xl border border-[#346739] p-7 flex flex-col gap-8">
      <h2 className="kp-subtitle" style={{ color: "#346739" }}>
          Kaidah Penjumlahan
      </h2>

      <SectionProgress currentSection={currentSection} completedSections={completedSections} />

      {/* Section 0: Eksplorasi Kontekstual */}
      {isVisible(0) && (
        <EksplorasiKontekstual
          readOnly={isCompleted(0)}
          savedData={savedData?.eksplorasi}
          onComplete={isActive(0) ? () => markComplete(0) : undefined}
        />
      )}

      {/* Section 1: Deep Learning */}
      {isVisible(1) && (
        <DeepLearning
          readOnly={isCompleted(1)}
          savedData={savedData?.deepLearning}
          onComplete={isActive(1) ? () => markComplete(1) : undefined}
        />
      )}

      {/* Section 2: Penjelasan Konsep (read-only) */}
      {isVisible(2) && (
        <PenjelasanKonsep
          onNext={isActive(2) ? () => handleNext(2) : undefined}
        />
      )}

      {/* Section 3: Contoh Soal Bertahap */}
      {isVisible(3) && (
        <ContohSoal
          readOnly={isCompleted(3)}
          savedData={savedData?.contohSoal}
          onComplete={isActive(3) ? () => markComplete(3) : undefined}
        />
      )}

      {/* Section 4: Mengapa? Corner (read-only) */}
      {isVisible(4) && (
        <MengapaCorner
          onNext={isActive(4) ? () => handleNext(4) : undefined}
        />
      )}

      {/* Section 5: Refleksi Mini */}
      {isVisible(5) && (
        <RefleksiMini
          readOnly={isCompleted(5)}
          savedData={savedData?.refleksi}
          onComplete={isActive(5) ? () => markComplete(5) : undefined}
        />
      )}

      {/* All complete banner */}
      {allComplete && (
        <div className="flex items-start gap-3.5 rounded-2xl bg-[#346739] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">
              🎉 Semua bagian Kaidah Penjumlahan selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan Eksplorasi, Deep Learning, Penjelasan Konsep, Contoh Soal, Mengapa Corner, dan Refleksi. Lanjutkan ke materi berikutnya!
            </p>
          </div>
        </div>
      )}
    </section>
  );
}