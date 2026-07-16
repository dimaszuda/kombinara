"use client";

import React, { useState, useRef, useEffect } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { IconLightbulb, IconHelpCircle, IconTable, IconGrid, IconBranch } from "@/components/ui/IconButton";
import { ExampleShell, type ExampleStatus } from "./contoh-soal-bertahap/primitive";
import { gradeBlanks } from "./contoh-soal-bertahap/grading";
import { SectionBadge } from "@/components/ui/Materi";
import {
  C,
  InputBlank,
  ChoiceToggle,
  KotakPengisian,
  PohonKeputusan,
  SectionLabel,
} from "./contoh-soal-perkalian/internals";
import {
  type Feedback,
  type Results,
  EXPECTED_PLAT,
  ExamplePlat,
  EXPECTED_PIN,
  ExamplePIN,
  EXPECTED_FOTO,
  ExampleFoto,
  EXPECTED_MENU,
  ExampleMenu,
  EXPECTED_BILANGAN,
  ExampleBilangan,
} from "./contoh-soal-perkalian/examples";
import { CheckIcon } from "@/components/ui/IconButton";
// ============================================================================
// Shared types
// ============================================================================

type ToggleValue = "yes" | "no" | null;

// ── Saved data types dari backend ──────────────────────────────────
export interface EksplorasiSavedData {
  answer: {
    soal: string;
    jawaban: string;
    alasan: string;
  };
  feedback: string | null;
  isCorrect: boolean | null;
}

export interface DeepLearningSavedData {
  answer: {
    pengisian_tempat: {
      kotak_1: { value: string; isCorrect: boolean | null };
      kotak_2: { value: string; isCorrect: boolean | null };
      kotak_3: { value: string; isCorrect: boolean | null };
    };
    inline_checkers: Record<string, { value: string; isCorrect: boolean }>;
    diagram_pohon: {
      makanan_count: { value: string; isCorrect: boolean | null };
      minuman_count: { value: string; isCorrect: boolean | null };
    };
    simpulan: string;
  };
  feedback: string | null;
  isCorrect: boolean | null;
}

export interface ContohSoalSavedData {
  [questionKey: string]: {
    answer: Record<string, string>;
    isCorrect: boolean;
  };
}

export interface RefleksiSavedData {
  [questionKey: string]: {
    answer: string;
    feedback: string | null;
    isCorrect: boolean | null;
  };
}

export interface KaidahPerkalianSavedData {
  eksplorasi?: EksplorasiSavedData | null;
  deepLearning?: DeepLearningSavedData | null;
  contohSoal?: ContohSoalSavedData;
  refleksi?: RefleksiSavedData;
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

const TOTAL_SECTIONS = 8;

const SECTION_LABELS = [
  "Eksplorasi Kontekstual",
  "Deep Learning",
  "Penjelasan Konsep",
  "Contoh Soal Bertahap",
  "Mengapa? Corner",
  "Aktivitas Siswa",
  "Panduan Cepat",
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

// ── Next Button (for read-only sections) ───────────────────────────
function NextButton({ onClick, label = "Lanjutkan" }: { onClick: () => void; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4 mt-4">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        <CheckIcon />
        {label}
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

const SOAL_EKSPLORASI_PERKALIAN = `Seragam sekolah tersedia dalam 3 pilihan warna kemeja (putih, biru, abu abu) dan 2 pilihan warna celana/rok (hitam, navy). Berapa banyak kombinasi seragam yang berbeda bisa dikenakan? Apakah hasilnya 3x2?`;

function EksplorasiKontekstual({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: EksplorasiSavedData | null }) {
    // ── Restore saved data when in readOnly mode ────────────────────
    const savedAnswer = savedData?.answer;
    const savedFeedback = savedData?.feedback;
    const wasAlreadyCorrect = savedData?.isCorrect === true;

    const [_choice1, _setChoice1] = useState<ToggleValue>(null);
    const [reasoning1, setReasoning1] = useState(readOnly ? (savedAnswer?.alasan ?? "") : "");
    const [choice2, setChoice2] = useState<ToggleValue>(
      readOnly && savedAnswer
        ? savedAnswer.jawaban === "Bisa" ? "yes" : savedAnswer.jawaban === "Tidak" ? "no" : null
        : null
    );
    const [_reasoning2, _setReasoning2] = useState("");

    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<Record<string, string | null>>(
      readOnly && savedFeedback ? { situasi1: savedFeedback } : {}
    );
    const [textColor, setTextColor] = useState<Record<string, string | null>>(
      readOnly && savedFeedback ? { situasi1: "text-[#2C2C2A]" } : {}
    );
    const [submitted, setSubmitted] = useState(wasAlreadyCorrect);

    // Notify parent when submitted (or already correct from DB)
    const eksCalledComplete = useRef(false);
    useEffect(() => {
      if ((submitted || wasAlreadyCorrect) && onComplete && !eksCalledComplete.current) {
        eksCalledComplete.current = true;
        onComplete();
      }
    }, [submitted, wasAlreadyCorrect, onComplete]);

    // ── Sync state from savedData when readOnly becomes true (timing fix) ──
    const didRestoreEks = useRef(false);
    useEffect(() => {
      if (didRestoreEks.current) return;
      if (!readOnly || !savedData) return;

      const ans = savedData.answer;
      if (ans) {
        setChoice2(ans.jawaban === "Bisa" ? "yes" : ans.jawaban === "Tidak" ? "no" : null);
        setReasoning1(ans.alasan ?? "");
      }
      if (savedData.feedback) {
        setFeedback({ situasi1: savedData.feedback });
        setTextColor({ situasi1: "text-[#2C2C2A]" });
      }
      if (savedData.isCorrect === true) {
        setSubmitted(true);
      }

      didRestoreEks.current = true;
    }, [readOnly, savedData]);

    async function handleSubmit() {
      setIsChecking(true);
      setFeedback({});
      setTextColor({});

      const jawaban = choice2 === "yes" ? "Bisa" : choice2 === "no" ? "Tidak" : "";
      const alasan = reasoning1;

      // Validasi: cek apakah sudah dijawab
      const newFeedback: Record<string, string | null> = {};
      const newColor: Record<string, string | null> = {};

      if (!jawaban || !alasan.trim()) {
        newFeedback["situasi1"] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor["situasi1"] = "text-red-500";
        setFeedback(newFeedback);
        setTextColor(newColor);
        setIsChecking(false);
        return;
      }

      // Semua lengkap → panggil API
      let eksplorasiIsCorrect: boolean | null = null;
      try {
        const res = await fetch("/api/ai/eksplorasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soal: SOAL_EKSPLORASI_PERKALIAN,
            jawaban,
            alasan,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        newFeedback["situasi1"] = data.feedback as string;
        newColor["situasi1"] = "text-[#2C2C2A]";
        eksplorasiIsCorrect = data.isCorrect ?? null;
      } catch {
        newFeedback["situasi1"] = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
        newColor["situasi1"] = "text-[#2C2C2A]";
      }

      setFeedback(newFeedback);
      setTextColor(newColor);
      setSubmitted(true);
      setIsChecking(false);

      // Simpan ke database per question (fire-and-forget)
      fetch("/api/eksplorasi-kontekstual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_perkalian",
          question_key: "situasi_1",
          answer: {
            soal: SOAL_EKSPLORASI_PERKALIAN,
            jawaban,
            alasan,
          },
          feedback: newFeedback["situasi1"] ?? null,
          is_correct: eksplorasiIsCorrect,
        }),
      }).catch((err) => console.error("[eksplorasi-kontekstual] DB save error:", err));
    }

    return (
        <article>
            <SectionBadge>Eksplorasi Kontekstual</SectionBadge>
            <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
            <p className="mb-3 text-justify leading-relaxed text-[#2C2C2A]">
                Seragam sekolah tersedia dalam 3 pilihan warna kemeja (putih, biru, abu abu) 
                dan 2 pilihan warna celana/rok (hitam, navy). 
                Berapa banyak kombinasi seragam yang berbeda bisa dikenakan?
            </p>
            <p className="mb-1 text-sm italic text-[#34673999]">
                Sebelum lanjur, buat tabel pasangan di bawah ini:
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#34673926]">
            <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                    <tr className="bg-[#B8E6BC]">
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-1/4">
                            Kemeja
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-1/4">
                            Celana/Rok
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600 w-1/2">
                            Kombinasi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#34673915]">
                    <tr>
                        <td className="px-3 py-2.5 text-gray-700">Putih</td>
                        <td className="px-3 py-2.5 text-gray-700">Hitam</td>
                        <td className="px-3 py-2.5 text-gray-700">(Putih, Hitam)</td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2.5 text-gray-700">Putih</td>
                        <td className="px-3 py-2.5 text-gray-700">Navy</td>
                        <td className="px-3 py-2.5 text-gray-700">(Putih, Navy)</td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2.5 text-gray-700">Biru</td>
                        <td className="px-3 py-2.5 text-gray-700">Hitam</td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="kombinasi 3"
                                placeholder="(..., ...)"
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2.5 text-gray-700">Biru</td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="Celana/Rok 4"
                                placeholder="..."
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="kombinasi 4"
                                placeholder="(..., ...)"
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="Kemeja 5"
                                placeholder="..."
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="Celana/Rok 5"
                                placeholder="..."
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="kombinasi 5"
                                placeholder="(..., ...)"
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="Kemeja 6"
                                placeholder="..."
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="Celana/Rok 6"
                                placeholder="..."
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                        <td className="px-3 py-2.5">
                            <input
                                type="text"
                                name="kombinasi 6"
                                placeholder="(..., ...)"
                                disabled={readOnly}
                                className={`w-full rounded-md border border-[#34673933] px-2 py-1.5 text-xs placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default" : ""}`}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
            <p className="mt-3">Hitung manual: Berapa total baris yang kamu isi? </p>
            <p><b>Apakah hasilnya</b> 3x2? </p>
            <div className="mb-3 flex gap-2">
                <ToggleButton label="Bisa" active={choice2 === "yes"} onClick={() => !readOnly && setChoice2("yes")} disabled={readOnly} />
                <ToggleButton label="Tidak" active={choice2 === "no"} onClick={() => !readOnly && setChoice2("no")} disabled={readOnly} />
            </div>
            <div>
                <label className="mb-1.5 block text-xs font-medium text-[#663362]">
                    Mengapa bisa begitu? Jelaskan!
                </label>
                <textarea
                    placeholder="Ceritakan alasanmu..."
                    value={reasoning1}
                    onChange={(e) => setReasoning1(e.target.value)}
                    disabled={readOnly}
                    className={`w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] ${readOnly ? "bg-[#F5F5F0] cursor-default resize-none" : ""}`}
                />
            </div>

            {/* AI Feedback */}
            {feedback["situasi1"] && (
              <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
                <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
                <p className={`text-sm leading-relaxed ${textColor["situasi1"] || "text-[#2C2C2A]"}`}>
                  {feedback["situasi1"]}
                </p>
              </div>
            )}

            {!readOnly && (
            <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isChecking || submitted}
                className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
              >
                {isChecking ? (
                  <>
                    <Spinner />
                    Mengecek...
                  </>
                ) : submitted ? (
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
            </div>
            )}
            <div className="border-b-2 border-[#34673966] mt-4" />
        </article>
    )
}


// ============================================================================
// Deep Learning
// ============================================================================

function DeepLearning({ readOnly = false, onComplete, savedData }: SectionProps & { savedData?: DeepLearningSavedData | null }) {
  const savedAnswer = savedData?.answer;
  const savedFeedback = savedData?.feedback;
  const wasAlreadyCorrect = savedData?.isCorrect === true;

  // ── Restore saved kotak values ────────────────────────────────
  const [kotak, setKotak] = useState(
    readOnly && savedAnswer?.pengisian_tempat
      ? [
          savedAnswer.pengisian_tempat.kotak_1?.value ?? "",
          savedAnswer.pengisian_tempat.kotak_2?.value ?? "",
          savedAnswer.pengisian_tempat.kotak_3?.value ?? "",
        ]
      : ["", "", ""]
  );
  const [kotakChecked, setKotakChecked] = useState(
    readOnly && savedAnswer?.pengisian_tempat
      ? [
          savedAnswer.pengisian_tempat.kotak_1?.isCorrect === true,
          savedAnswer.pengisian_tempat.kotak_2?.isCorrect === true,
          savedAnswer.pengisian_tempat.kotak_3?.isCorrect === true,
        ]
      : [false, false, false]
  );
  const [simpulanText, setSimpulanText] = useState(
    readOnly ? (savedAnswer?.simpulan ?? "") : ""
  );
  const [simpulanSubmitted, setSimpulanSubmitted] = useState(wasAlreadyCorrect);
  const [dlSaving, setDlSaving] = useState(false);
  const [dlFeedback, setDlFeedback] = useState<string | null>(
    readOnly ? (savedFeedback ?? null) : null
  );
  const [dlFeedbackType, setDlFeedbackType] = useState<"success" | "retry" | "error" | null>(
    wasAlreadyCorrect ? "success" : null
  );
  const expectedKotak = ["5", "4", "3"];

  // Notify parent when submitted
  const dlCalledComplete = useRef(false);
  useEffect(() => {
    if (simpulanSubmitted && onComplete && !dlCalledComplete.current) {
      dlCalledComplete.current = true;
      onComplete();
    }
  }, [simpulanSubmitted, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreDL = useRef(false);
  useEffect(() => {
    if (didRestoreDL.current) return;
    if (!readOnly || !savedData) return;
    const ans = savedData.answer;
    if (ans?.pengisian_tempat) {
      setKotak([
        ans.pengisian_tempat.kotak_1?.value ?? "",
        ans.pengisian_tempat.kotak_2?.value ?? "",
        ans.pengisian_tempat.kotak_3?.value ?? "",
      ]);
      setKotakChecked([
        ans.pengisian_tempat.kotak_1?.isCorrect === true,
        ans.pengisian_tempat.kotak_2?.isCorrect === true,
        ans.pengisian_tempat.kotak_3?.isCorrect === true,
      ]);
    }
    if (ans) {
      setSimpulanText(ans.simpulan ?? "");
      setMakananInput(ans.diagram_pohon?.makanan_count?.value ?? "");
      setMinumanInput(ans.diagram_pohon?.minuman_count?.value ?? "");
    }
    if (savedData.feedback) setDlFeedback(savedData.feedback);
    if (savedData.isCorrect === true) {
      setSimpulanSubmitted(true);
      setDlFeedbackType("success");
    }
    didRestoreDL.current = true;
  }, [readOnly, savedData]);

  // Collect inline checker answers (InputBlank / ChoiceToggle)
  const inlineRef = useRef<Record<string, { value: string; isCorrect: boolean }>>({});
  function recordInline(key: string, value: string, isCorrect: boolean) {
    inlineRef.current[key] = { value, isCorrect };
  }

  // Plain inputs for makanan × minuman
  const [makananInput, setMakananInput] = useState(
    readOnly ? (savedAnswer?.diagram_pohon?.makanan_count?.value ?? "") : ""
  );
  const [minumanInput, setMinumanInput] = useState(
    readOnly ? (savedAnswer?.diagram_pohon?.minuman_count?.value ?? "") : ""
  );

  function checkKotak(i: number) {
    setKotakChecked((prev) => prev.map((c, idx) => (idx === i ? true : c)));
  }

  async function handleSimpanSemua() {
    if (!simpulanText.trim()) return;

    setDlSaving(true);
    setDlFeedback(null);
    setDlFeedbackType(null);

    // Build comprehensive answer object
    const jawabanObj = {
      pengisian_tempat: {
        kotak_1: { value: kotak[0], isCorrect: kotakChecked[0] ? kotak[0].trim() === expectedKotak[0] : null },
        kotak_2: { value: kotak[1], isCorrect: kotakChecked[1] ? kotak[1].trim() === expectedKotak[1] : null },
        kotak_3: { value: kotak[2], isCorrect: kotakChecked[2] ? kotak[2].trim() === expectedKotak[2] : null },
      },
      inline_checkers: { ...inlineRef.current },
      diagram_pohon: {
        makanan_count: { value: makananInput, isCorrect: makananInput.trim() === "2" ? true : makananInput.trim() !== "" ? false : null },
        minuman_count: { value: minumanInput, isCorrect: minumanInput.trim() === "3" ? true : minumanInput.trim() !== "" ? false : null },
      },
      simpulan: simpulanText,
    };

    const soal =
      "Aktivitas deep learning kaidah perkalian: Siswa mengerjakan pengisian tempat (kotak digit PIN), diagram pohon keputusan (menu kantin: 2 makanan × 3 minuman), dan membuat simpulan tentang perbedaan kaidah perkalian dengan penjumlahan.";

    try {
      // Step 1: Panggil AI untuk dapatkan feedback & penilaian
      const aiRes = await fetch("/api/ai/deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soal, jawaban: JSON.stringify(jawabanObj) }),
      });

      if (!aiRes.ok) {
        throw new Error("AI API returned non-OK status");
      }

      const aiData = await aiRes.json();

      // Step 2: Simpan ke DB (selalu INSERT, bukan upsert)
      await fetch("/api/aktivitas-deep-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_perkalian",
          answer: jawabanObj,
          feedback: aiData?.feedback ?? null,
          is_correct: aiData?.isCorrect ?? null,
        }),
      });

      // Step 3: Validasi — hanya lanjut section berikutnya jika AI menilai benar
      if (aiData?.isCorrect === true) {
        setSimpulanSubmitted(true);
        setDlFeedback(aiData.feedback ?? null);
        setDlFeedbackType("success");
      } else {
        // Jawaban belum tepat → tampilkan feedback & biarkan siswa retry
        setDlFeedback(aiData?.feedback ?? "Coba lagi ya, jawabanmu belum tepat. Perbaiki simpulanmu!");
        setDlFeedbackType("retry");
        // simpulanSubmitted tetap false → siswa bisa edit & kirim ulang
      }
    } catch (err) {
      console.error("[deep-learning] error:", err);
      setDlFeedback("Maaf, ada kendala saat memproses jawabanmu. Coba lagi ya!");
      setDlFeedbackType("error");
    } finally {
      setDlSaving(false);
    }
  }
 
  return (
    <article>
      <SectionBadge>Deep Learning</SectionBadge>
      {/* ============ SECTION 1: PENGISIAN TEMPAT ============ */}
      <SectionLabel>🔍 Visualisasi: Aturan Pengisian Tempat</SectionLabel>

      <p className="text-slate-700 leading-relaxed mb-3">
        Sebelum masuk ke prinsip umumnya, mari kita &ldquo;lihat&rdquo; kaidah perkalian secara konkret.
        Bayangkan setiap tahap keputusan sebagai sebuah kotak tempat yang harus diisi satu per satu.
      </p>

      <p className="font-semibold mb-1" style={{ color: C.purple }}>
        Contoh: Kode PIN 3 digit dari angka 1–5 tanpa pengulangan.
      </p>
      <p className="text-slate-700 mb-3">Perhatikan ilustrasi berikut!</p>

      <ul className="space-y-2.5 mb-4 pl-1">
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-1 ada angka 1, 2, 3, 4, 5 yang bisa digunakan, misal kamu pilih angka 5 untuk
          digit ke-1, sisa angka ada berapa?
          <InputBlank answer={4} disabled={readOnly} onChange={(v, ok) => recordInline("sisa_angka_1", v, ok)} />
        </li>
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-2 berarti masih ada 4 angka yaitu 1, 2, 3, 4 yang bisa digunakan, misal kamu
          pilih angka 1, sisa angka ada berapa?
          <InputBlank answer={3} disabled={readOnly} onChange={(v, ok) => recordInline("sisa_angka_2", v, ok)} />
        </li>
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-3 berarti tinggal 3 angka yang bisa dipilih yaitu 2, 3, 4.
        </li>
      </ul>

      <p className="text-slate-700 mb-2">
        Coba masukkan ilustrasi ke kerangka perhitungan berupa pengisian tempat berikut!
      </p>

      <div className="space-y-2 mb-2">
        <p className="text-slate-700">
          Kotak ke-1 = Digit ke-1, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[0]}
            onChange={(e) => {
              if (readOnly) return;
              setKotak([e.target.value, kotak[1], kotak[2]]);
              setKotakChecked([false, kotakChecked[1], kotakChecked[2]]);
            }}
            onBlur={() => !readOnly && checkKotak(0)}
            placeholder="..."
            disabled={readOnly}
            style={{
              borderColor: kotakChecked[0]
                ? (kotak[0].trim() === expectedKotak[0] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          {kotakChecked[0] && kotak[0].trim() === expectedKotak[0] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[0] && kotak[0].trim() !== expectedKotak[0] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[0]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Kotak ke-2 = Digit ke-2, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[1]}
            onChange={(e) => {
              if (readOnly) return;
              setKotak([kotak[0], e.target.value, kotak[2]]);
              setKotakChecked([kotakChecked[0], false, kotakChecked[2]]);
            }}
            onBlur={() => !readOnly && checkKotak(1)}
            placeholder="..."
            disabled={readOnly}
            style={{
              borderColor: kotakChecked[1]
                ? (kotak[1].trim() === expectedKotak[1] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          <span className="text-slate-500"> (Ingat: satu angka sudah dipakai)</span>
          {kotakChecked[1] && kotak[1].trim() === expectedKotak[1] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[1] && kotak[1].trim() !== expectedKotak[1] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[1]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Kotak ke-3 = Digit ke-3, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[2]}
            onChange={(e) => {
              if (readOnly) return;
              setKotak([kotak[0], kotak[1], e.target.value]);
              setKotakChecked([kotakChecked[0], kotakChecked[1], false]);
            }}
            onBlur={() => !readOnly && checkKotak(2)}
            placeholder="..."
            disabled={readOnly}
            style={{
              borderColor: kotakChecked[2]
                ? (kotak[2].trim() === expectedKotak[2] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          <span className="text-slate-500"> (Ingat: 2 angka sudah dipakai)</span>
          {kotakChecked[2] && kotak[2].trim() === expectedKotak[2] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[2] && kotak[2].trim() !== expectedKotak[2] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[2]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Jadi berapa kemungkinan PIN yang bisa dibentuk?
          <InputBlank answer={60} width={64} disabled={readOnly} onChange={(v, ok) => recordInline("total_pin", v, ok)} />
        </p>
      </div>

      <KotakPengisian values={kotak} labels={["Kotak ke-1", "Kotak ke-2", "Kotak ke-3"]} />

      <p className="text-slate-700 leading-relaxed">
        Inilah cara paling mudah &ldquo;melihat&rdquo; kaidah perkalian secara visual. Kamu cukup menggambar
        kotak sejumlah tahap, lalu isi banyaknya pilihan di tiap kotak, kemudian kalikan semuanya.
      </p>

      <div
        className="mt-4 rounded-xl border-2 p-4 flex gap-3"
        style={{ backgroundColor: C.greenLight, borderColor: C.green }}
      >
        <IconLightbulb/>
        <p className="text-sm leading-relaxed" style={{ color: C.green }}>
          <span className="font-bold">Catatan Penting:</span> Aturan pengisian tempat dan kaidah
          perkalian adalah hal yang sama, yang satu adalah gambaran visualnya, yang lain adalah
          prinsip matematisnya. Setelah kamu terbiasa berpikir bertahap, kamu tidak perlu lagi
          menggambar kotak dan bisa langsung menggunakan kaidah perkalian secara langsung.
        </p>
      </div>
 
      {/* ============ SECTION 2: DIAGRAM POHON ============ */}
      <section className="bg-white rounded-2xl border-2 p-5 sm:p-7 mt-8" style={{ borderColor: C.greenLight }}>
        <SectionLabel>🔍 Eksplorasi: Diagram Pohon Keputusan</SectionLabel>
 
        <p className="text-slate-700 leading-relaxed mb-4">
          Di kantin sekolahmu tersedia 2 menu makanan yaitu soto dan sop serta 3 menu minuman yaitu
          es teh, es jeruk, es buah. Kamu ingin memesan menu paketan di kantin. Berapa macam menu
          paketan yang bisa kamu pesan?
        </p>
 
        <PohonKeputusan />
 
        <div className="space-y-3 mt-4">
          <p className="text-slate-700">
            Hitung cabang paling ujung: ada berapa?
            <InputBlank answer={6} disabled={readOnly} onChange={(v, ok) => recordInline("cabang_ujung", v, ok)} />
          </p>
 
          <p className="text-slate-700 leading-relaxed">
            Coba perhatikan! Ketika kamu memesan menu paketan, kamu memesan
            <ChoiceToggle
              options={["makanan dan minuman", "makanan atau minuman"]}
              correct="makanan dan minuman"
              disabled={readOnly}
              onChange={(v, ok) => recordInline("pesan_apa", v, ok)}
            />
          </p>
 
          <p className="text-slate-700">
            Kata kunci yang kamu pegang apa?
            <ChoiceToggle options={["dan", "atau"]} correct="dan" disabled={readOnly} onChange={(v, ok) => recordInline("kata_kunci", v, ok)} />
          </p>
 
          <p className="text-slate-700">
            Jadi ada berapa menu paketan yang bisa kamu pesan?
            <input
              type="text"
              placeholder="..."
              value={makananInput}
              onChange={(e) => setMakananInput(e.target.value)}
              disabled={readOnly}
              style={{ color: C.green, borderColor: "#94a3b8" }}
              className="border-2 rounded-md px-2 py-0.5 w-11 text-center font-semibold text-sm mx-1 focus:outline-none"
            /> (makanan) ×
            <input
              type="text"
              placeholder="..."
              value={minumanInput}
              onChange={(e) => setMinumanInput(e.target.value)}
              disabled={readOnly}
              style={{ color: C.green, borderColor: "#94a3b8" }}
              className="border-2 rounded-md px-2 py-0.5 w-11 text-center font-semibold text-sm mx-1 focus:outline-none"
            /> (minuman) =
            <InputBlank answer={6} width={44} disabled={readOnly} onChange={(v, ok) => recordInline("total_paketan", v, ok)} />
          </p>
          <p className="text-slate-500 text-sm italic">Sebutkan!</p>
        </div>
 
        <div
          className="mt-5 rounded-xl border-2 p-4 flex gap-3"
          style={{ backgroundColor: C.white, borderColor: C.purple }}
        >
          <IconHelpCircle/>
          <div className="text-sm flex-1 min-w-0">
            <p className="font-bold mb-1" style={{ color: C.purple }}>
              Apa yang kamu simpulkan?
            </p>
            <p className="text-slate-700">Apakah ini sama dengan aturan penjumlahan?</p>
            <div className="mt-2 flex items-center gap-4 border-t border-[#34673926] pt-4">
              <textarea
                placeholder="Tulis jawabanmu di sini..."
                rows={3}
                value={simpulanText}
                disabled={readOnly || simpulanSubmitted}
                onChange={(e) => {
                  setSimpulanText(e.target.value);
                  setSimpulanSubmitted(false);
                  // Clear feedback lama saat siswa mulai mengedit ulang
                  if (dlFeedback) {
                    setDlFeedback(null);
                    setDlFeedbackType(null);
                  }
                }}
                style={{ borderColor: C.purple, color: C.green }}
                className={`flex-1 border-2 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none ${readOnly || simpulanSubmitted ? "bg-[#F5F5F0] cursor-default" : ""}`}
              />
              {!readOnly && (
              <button
                type="button"
                onClick={handleSimpanSemua}
                disabled={simpulanSubmitted || !simpulanText.trim() || dlSaving}
                className="flex shrink-0 items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
              >
                {dlSaving ? (
                  <>
                    <Spinner />
                    Mengecek...
                  </>
                ) : simpulanSubmitted ? (
                  <>
                    <CheckIcon />
                    Tersimpan ✅
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Simpan Jawaban
                  </>
                )}
              </button>
              )}
            </div>

            {/* Feedback AI — tampil setelah submit */}
            {dlFeedback && (
              <div
                className={`mt-3 rounded-lg border p-3 ${
                  dlFeedbackType === "success"
                    ? "border-[#34673933] bg-[#DBFFD5]/50"
                    : dlFeedbackType === "retry"
                    ? "border-[#FFB34733] bg-[#FFF3E0]/50"
                    : "border-[#EF444433] bg-[#FEF2F2]/50"
                }`}
              >
                <p className="mb-1 text-xs font-medium text-[#663362]">
                  {dlFeedbackType === "success"
                    ? "✅ Feedback Kombi"
                    : dlFeedbackType === "retry"
                    ? "💬 Feedback Kombi — Yuk diperbaiki!"
                    : "⚠️ Ups, ada kendala"}
                </p>
                <p className="text-sm leading-relaxed text-[#2C2C2A] whitespace-pre-wrap">
                  {dlFeedback}
                </p>
                {dlFeedbackType === "retry" && (
                  <p className="mt-2 text-xs text-[#663362] italic">
                    Kamu bisa mengedit jawabanmu di atas lalu klik &ldquo;Simpan Jawaban&rdquo; lagi.
                  </p>
                )}
                {dlFeedbackType === "error" && (
                  <p className="mt-2 text-xs text-[#663362] italic">
                    Silakan coba klik &ldquo;Simpan Jawaban&rdquo; lagi.
                  </p>
                )}
              </div>
            )}

            {/* Sukses permanen — hanya saat is_correct true */}
            {simpulanSubmitted && (
              <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
                <p className="text-sm leading-relaxed text-[#2C2C2A]">
                  Jawaban kamu sudah benar dan tersimpan! Lanjut ke bagian berikutnya ya. 🎉
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
 
      {/* ============ SECTION 3: KESIMPULAN ============ */}
      <section className="rounded-2xl p-5 sm:p-7 mt-4" style={{ backgroundColor: C.green }}>
        <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-white">
          ✅ Tiga Cara Merepresentasikan Kaidah Perkalian
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: C.greenLight }}>
          Dari bagian ekplorasi kontekstual dan aktivitas deep learning, ada 3 cara untuk
          merepresentasikan kaidah perkalian yaitu:
        </p>
 
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: IconTable, label: "Tabel" },
            { icon: IconGrid, label: "Pengisian Tempat" },
            { icon: IconBranch, label: "Diagram Pohon" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              style={{ backgroundColor: C.greenLight }}
            >
              <Icon/>
              <span className="font-semibold text-sm" style={{ color: C.green }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function PenjelasanKonsep({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      {/* Konsep Dasar */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Konsep Dasar</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika suatu kejadian terdiri dari tahap 1 dan tahap 2 dan seterusnya yang dilakukan secara <b>berurutan/bersamaan</b>, 
          maka total cara melakukan kejadian tersebut adalah: 
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total  = $n_1 \\times n_2 \\times n_3 \\times ... \\times n_k$"}</RichText>
        </div>
      </div>

      {/* Kata Kunci */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-bold text-[#346739]">Kata Kunci</h3>
        <p className="text-2xl font-bold text-[#663362]">
          &ldquo;DAN&rdquo;{" "}
          <span className="text-base font-normal text-[#2C2C2A]">&rarr; Perkalian (tahap-tahap yang harus dilalui semua) </span>
        </p>
      </div>

      {/* Mengapa penjumlahan? */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Mengapa perkalian?</h3>
        <RichText>
          {"Setiap pilihan di tahap 1 dapat dipasangkan dengan setiap pilihan di tahap 2. \
          Jadi untuk setiap 1 pilihan di tahap 1, ada $n_2$ kemungkinan di tahap 2. \
          Karena ada $n_1$ pilihan di tahap 1, totalnya adalah $n_1 \\times n_2$. "}
        </RichText>
        <p className="mt-3 leading-relaxed text-[#2C2C2A]">
          <b>Ingat</b>Diagram pohon selalu menghasilkan perkalian jumlah cabang di setiap tingkat!
        </p>
      </div>
      {onNext && <NextButton onClick={onNext} />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// ContohSoal — orchestrator with unlock mechanism
// ============================================================================

function ContohSoal({ onComplete, readOnly = false, savedData }: SectionProps & { savedData?: ContohSoalSavedData }) {
  // Question keys in order
  const QUESTION_KEYS = [
    "perkalian_plat",
    "perkalian_pin",
    "perkalian_foto",
    "perkalian_menu",
    "perkalian_bilangan",
  ] as const;

  const QUESTION_META: { question_key: string; difficulty_level: "mudah" | "sedang" | "hots"; order_index: number }[] = [
    { question_key: "perkalian_plat",      difficulty_level: "mudah",  order_index: 0 },
    { question_key: "perkalian_pin",       difficulty_level: "sedang", order_index: 1 },
    { question_key: "perkalian_foto",      difficulty_level: "sedang", order_index: 2 },
    { question_key: "perkalian_menu",      difficulty_level: "hots",   order_index: 3 },
    { question_key: "perkalian_bilangan",  difficulty_level: "hots",   order_index: 4 },
  ];

  // ── Restore passed count from savedData ──────────────────────────
  const initialPassedCount = (() => {
    if (!savedData) return 0;
    return QUESTION_KEYS.filter((k) => savedData[k]?.isCorrect === true).length;
  })();

  const [passedCount, setPassedCount] = useState(initialPassedCount);

  // Notify parent when all 5 examples passed (or already complete from DB)
  const csCalledComplete = useRef(false);
  useEffect(() => {
    if ((passedCount >= 5 || initialPassedCount >= 5) && onComplete && !csCalledComplete.current) {
      csCalledComplete.current = true;
      onComplete();
    }
  }, [passedCount, initialPassedCount, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreCS = useRef(false);
  useEffect(() => {
    if (didRestoreCS.current) return;
    if (!readOnly || !savedData) return;

    const count = QUESTION_KEYS.filter((k) => savedData[k]?.isCorrect === true).length;
    setPassedCount(count);

    // Restore each example's values and feedback
    const keys = QUESTION_KEYS;
    if (savedData[keys[0]]) { setValues1(savedData[keys[0]].answer as Record<string, string>); setFeedback1("correct"); }
    if (savedData[keys[1]]) { setValues2(savedData[keys[1]].answer as Record<string, string>); setFeedback2("correct"); }
    if (savedData[keys[2]]) { setValues3(savedData[keys[2]].answer as Record<string, string>); setFeedback3("correct"); }
    if (savedData[keys[3]]) { setValues4(savedData[keys[3]].answer as Record<string, string>); setFeedback4("correct"); }
    if (savedData[keys[4]]) { setValues5(savedData[keys[4]].answer as Record<string, string>); setFeedback5("correct"); }

    didRestoreCS.current = true;
  }, [readOnly, savedData]);

  // ── Restore values & feedback from savedData ────────────────────
  function restoreValues(key: string): Record<string, string> {
    if (readOnly && savedData?.[key]?.answer) {
      return savedData[key].answer as Record<string, string>;
    }
    return {};
  }
  function restoreFeedback(key: string): Feedback {
    if (readOnly && savedData?.[key]?.isCorrect) return "correct";
    return "idle";
  }

  // Contoh 1
  const [values1, setValues1] = useState<Record<string, string>>(restoreValues("perkalian_plat"));
  const [results1, setResults1] = useState<Results>(null);
  const [feedback1, setFeedback1] = useState<Feedback>(restoreFeedback("perkalian_plat"));

  // Contoh 2
  const [values2, setValues2] = useState<Record<string, string>>(restoreValues("perkalian_pin"));
  const [results2, setResults2] = useState<Results>(null);
  const [feedback2, setFeedback2] = useState<Feedback>(restoreFeedback("perkalian_pin"));

  // Contoh 3
  const [values3, setValues3] = useState<Record<string, string>>(restoreValues("perkalian_foto"));
  const [results3, setResults3] = useState<Results>(null);
  const [feedback3, setFeedback3] = useState<Feedback>(restoreFeedback("perkalian_foto"));

  // Contoh 4
  const [values4, setValues4] = useState<Record<string, string>>(restoreValues("perkalian_menu"));
  const [results4, setResults4] = useState<Results>(null);
  const [feedback4, setFeedback4] = useState<Feedback>(restoreFeedback("perkalian_menu"));

  // Contoh 5
  const [values5, setValues5] = useState<Record<string, string>>(restoreValues("perkalian_bilangan"));
  const [results5, setResults5] = useState<Results>(null);
  const [feedback5, setFeedback5] = useState<Feedback>(restoreFeedback("perkalian_bilangan"));

  function statusFor(index: number): ExampleStatus {
    if (index < passedCount) return "completed";
    if (index === passedCount) return "active";
    return "locked";
  }

  function check(
    index: number,
    expected: Record<string, string>,
    values: Record<string, string>,
    setResults: React.Dispatch<React.SetStateAction<Results>>,
    setFeedback: React.Dispatch<React.SetStateAction<Feedback>>
  ) {
    if (readOnly) return;
    const { results, allCorrect } = gradeBlanks(expected, values);
    setResults(results);
    setFeedback(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, index + 1));

    const meta = QUESTION_META[index];
    fetch("/api/contoh-soal-bertahap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concept_id: "kaidah_perkalian",
        question_key: meta.question_key,
        difficulty_level: meta.difficulty_level,
        order_index: meta.order_index,
        answer: values,
        is_correct: allCorrect,
      }),
    }).catch((err) => console.error("[contoh-soal-bertahap] DB save error:", err));
  }

  const TOTAL = 5;

  return (
    <section>
      {/* Progress bar */}
      <div className="mb-6 flex gap-2" aria-label="Progress contoh soal">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < passedCount ? "#346739" : "#34673926" }}
          />
        ))}
      </div>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>

      {passedCount === TOTAL && (
        <div className="mb-6 rounded-xl bg-[#346739] px-5 py-4 text-center text-white font-semibold text-base">
          🎉 Semua contoh soal selesai! Kamu sudah menguasai Kaidah Perkalian.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* ---- Contoh 1 ---- */}
        <ExampleShell
          status={statusFor(0)}
          level="mudah"
          title="Contoh 1: Pelat Nomor Kendaraan 📝"
          illustrationSrc="/images/plat.png"
          illustrationAlt="Ilustrasi pelat nomor kendaraan"
          lockedHint="Contoh 1: Pelat Nomor Kendaraan — selesaikan contoh sebelumnya dulu"
          onCheck={() => check(0, EXPECTED_PLAT, values1, setResults1, setFeedback1)}
          feedback={feedback1}
        >
          <ExamplePlat
            values={values1}
            results={results1}
            onChange={(id, v) => setValues1((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 2 ---- */}
        <ExampleShell
          status={statusFor(1)}
          level="sedang"
          title="Contoh 2: Kode PIN 4 Digit 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/pin.svg"
          illustrationAlt="Ilustrasi kode PIN 4 digit"
          lockedHint="Contoh 2: Kode PIN 4 Digit — selesaikan Contoh 1 dulu"
          onCheck={() => check(1, EXPECTED_PIN, values2, setResults2, setFeedback2)}
          feedback={feedback2}
        >
          <ExamplePIN
            values={values2}
            results={results2}
            onChange={(id, v) => setValues2((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 3 ---- */}
        <ExampleShell
          status={statusFor(2)}
          level="sedang"
          title="Contoh 3: Foto Berjajar dengan Syarat 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/foto-berjajar.svg"
          illustrationAlt="Ilustrasi orang berjajar untuk foto"
          lockedHint="Contoh 3: Foto Berjajar — selesaikan Contoh 2 dulu"
          onCheck={() => check(2, EXPECTED_FOTO, values3, setResults3, setFeedback3)}
          feedback={feedback3}
        >
          <ExampleFoto
            values={values3}
            results={results3}
            onChange={(id, v) => setValues3((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 4 ---- */}
        <ExampleShell
          status={statusFor(3)}
          level="hots"
          title="Contoh 4: Menu Restoran 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/menu-restoran.svg"
          illustrationAlt="Ilustrasi pilihan menu restoran"
          lockedHint="Contoh 4: Menu Restoran — selesaikan Contoh 3 dulu"
          onCheck={() => check(3, EXPECTED_MENU, values4, setResults4, setFeedback4)}
          feedback={feedback4}
        >
          <ExampleMenu
            values={values4}
            results={results4}
            onChange={(id, v) => setValues4((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 5 ---- */}
        <ExampleShell
          status={statusFor(4)}
          level="hots"
          title="Contoh 5: Bilangan Ganjil 3 Digit < 600 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/bilangan-ganjil.svg"
          illustrationAlt="Ilustrasi bilangan tiga digit"
          lockedHint="Contoh 5: Bilangan Ganjil 3 Digit — selesaikan Contoh 4 dulu"
          onCheck={() => check(4, EXPECTED_BILANGAN, values5, setResults5, setFeedback5)}
          feedback={feedback5}
        >
          <ExampleBilangan
            values={values5}
            results={results5}
            onChange={(id, v) => setValues5((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>
      </div>
    </section>
  );
}

function MengapaCorner({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>
      <blockquote className="kp-quote text-justify">
        💡 <b>Mengapa kita mengalikan? </b> 
        Bayangkan membuat keputusan secara bertahap. 
        Di setiap tahap, kamu &ldquo;membuka&rdquo; seluruh pilihan yang ada. Untuk setiap satu pilihan yang sudah dibuat di tahap sebelumnya, ada sejumlah pilihan baru yang terbuka. Ini seperti pohon yang terus bercabang dan total daun (pilihan akhir) adalah hasil perkalian semua jumlah cabang di setiap tingkat. 
      </blockquote>
      {onNext && <NextButton onClick={onNext} />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

function AktivitasSiswa({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Aktivitas Siswa</SectionBadge>
      <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#663362] p-5">
        <p className="text-xl leading-relaxed text-white">
          🧾 JANGAN LUPA kerjakan aktivitas kamu di halaman Aktivitas yang ada di panel sebelah kiri ya! 
        </p>
      </div>
      {onNext && <NextButton onClick={onNext} label="Aku sudah mengerjakan aktivitas" />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  )
}

const PANDUAN_ROWS = [
  { kunci: "Pilihan dilakukan secara berurutan/bertahap", gunakan: "Perkalian" },
  { kunci: "Pilihan hanya satu dari beberapa kelompok yang dipilih", gunakan: "Penjumlahan" },
  { kunci: 'Ada kata "DAN" antara tahap\u2013tahap', gunakan: "Perkalian" },
  { kunci: 'Ada kata "ATAU" antara pilihan', gunakan: "Penjumlahan" },
  { kunci: "Dua kejadian terjadi bersamaan", gunakan: "Perkalian" },
  { kunci: "Dua kejadian tidak bersamaan / saling lepas", gunakan: "Penjumlahan" },
];

function PanduanCepat({ onNext }: ReadOnlySectionProps) {
  return (
    <article>
      <SectionBadge>Panduan Cepat</SectionBadge>
      <h3 className="mb-1 text-lg font-semibold text-[#2C2C2A]">
        Aturan Penjumlahan vs Perkalian
      </h3>
      <p className="mb-4 text-sm text-[#2C2C2A99]">
        Gunakan tabel ini untuk menentukan aturan mana yang tepat dipakai.
      </p>

      <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl border border-[#34673920]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_128px] bg-[#346739]">
          <div className="px-4 py-2.5 text-sm font-semibold text-[#DBFFD5]">
            Pertanyaan Kunci
          </div>
          <div className="px-4 py-2.5 text-center text-sm font-semibold text-[#DBFFD5]">
            Gunakan
          </div>
        </div>

        {/* Rows */}
        {PANDUAN_ROWS.map((row, i) => {
          const isEven = i % 2 === 0;
          const isPerkalian = row.gunakan === "Perkalian";
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_128px] items-center"
              style={{ backgroundColor: isEven ? "#DBFFD5" : "#ffffff" }}
            >
              <div className="px-4 py-3 text-sm leading-snug text-[#2C2C2A]">
                {row.kunci}
              </div>
              <div className="flex justify-center px-4 py-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={
                    isPerkalian
                      ? { backgroundColor: "#346739", color: "#DBFFD5" }
                      : { backgroundColor: "#663362", color: "#ffffff" }
                  }
                >
                  {row.gunakan}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {onNext && <NextButton onClick={onNext} />}
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Refleksi Mini — Sequential Unlocking (1 soal per langkah)
// ============================================================================

const REFLEKSI_PERKALIAN_QUESTIONS = [
  {
    key: "refleksi_perkalian_1",
    soal: "Apa perbedaan mendasar antara aturan penjumlahan dan perkalian?",
  },
  {
    key: "refleksi_perkalian_2",
    soal: 'Mengapa kata "DAN" identik dengan perkalian?',
  },
  {
    key: "refleksi_perkalian_3",
    soal:
      "Buatlah contoh soal dari kehidupan sehari-hari yang menggunakan KEDUA aturan sekaligus.",
  },
];

const TOTAL_REFLEKSI_PERKALIAN = REFLEKSI_PERKALIAN_QUESTIONS.length;

interface RefleksiStepFeedback {
  text: string;
  isCorrect: boolean;
}

function RefleksiMini({ onComplete, readOnly = false, savedData }: SectionProps & { savedData?: RefleksiSavedData }) {
  const savedKeys = Object.keys(savedData ?? {});
  const allSavedComplete =
    REFLEKSI_PERKALIAN_QUESTIONS.every((q) => savedData?.[q.key]?.isCorrect === true);

  const [currentStep, setCurrentStep] = useState(() => {
    if (allSavedComplete) return TOTAL_REFLEKSI_PERKALIAN - 1;
    // Cari step pertama yang belum isCorrect
    for (let i = 0; i < TOTAL_REFLEKSI_PERKALIAN; i++) {
      const key = REFLEKSI_PERKALIAN_QUESTIONS[i].key;
      if (savedData?.[key]?.isCorrect !== true) return i;
    }
    return 0;
  });
  const [answers, setAnswers] = useState<string[]>(() =>
    REFLEKSI_PERKALIAN_QUESTIONS.map((q) => savedData?.[q.key]?.answer ?? "")
  );
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, RefleksiStepFeedback>>(() => {
    const map: Record<number, RefleksiStepFeedback> = {};
    REFLEKSI_PERKALIAN_QUESTIONS.forEach((q, i) => {
      const d = savedData?.[q.key];
      if (d) {
        map[i] = { text: d.feedback ?? "Jawaban tersimpan.", isCorrect: d.isCorrect ?? false };
      }
    });
    return map;
  });

  const allComplete =
    currentStep >= TOTAL_REFLEKSI_PERKALIAN - 1 &&
    feedbackMap[TOTAL_REFLEKSI_PERKALIAN - 1]?.isCorrect === true;

  // Notify parent when all refleksi steps are done
  const refCalledComplete = useRef(false);
  useEffect(() => {
    if (allComplete && onComplete && !refCalledComplete.current) {
      refCalledComplete.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  // ── Sync state from savedData when readOnly becomes true (timing fix) ──
  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    if (!readOnly || !savedData) return;

    setAnswers(REFLEKSI_PERKALIAN_QUESTIONS.map((q) => savedData[q.key]?.answer ?? ""));

    const allDone = REFLEKSI_PERKALIAN_QUESTIONS.every((q) => savedData[q.key]?.isCorrect === true);
    if (allDone) {
      setCurrentStep(TOTAL_REFLEKSI_PERKALIAN - 1);
    } else {
      for (let i = 0; i < TOTAL_REFLEKSI_PERKALIAN; i++) {
        if (savedData[REFLEKSI_PERKALIAN_QUESTIONS[i].key]?.isCorrect !== true) {
          setCurrentStep(i);
          break;
        }
      }
    }

    const fbMap: Record<number, RefleksiStepFeedback> = {};
    REFLEKSI_PERKALIAN_QUESTIONS.forEach((q, i) => {
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
    const q = REFLEKSI_PERKALIAN_QUESTIONS[stepIndex];
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
          concept_id: "kaidah_perkalian",
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
      if (fb.isCorrect && stepIndex < TOTAL_REFLEKSI_PERKALIAN - 1) {
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
        <div className="flex flex-col gap-5">
          {REFLEKSI_PERKALIAN_QUESTIONS.map((q, i) => {
            const fb = feedbackMap[i];
            return (
              <div
                key={i}
                className="rounded-2xl border border-[#34673920] bg-[#DBFFD5] p-4"
              >
                <label className="mb-2 flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#346739] text-[10px] font-bold text-[#DBFFD5]">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium leading-snug text-[#2C2C2A]">
                    {q.soal}
                  </span>
                </label>
                <div className="w-full resize-y rounded-xl border border-[#34673930] bg-white px-4 py-3 text-sm leading-relaxed text-[#6B6B66]">
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
              tentang aturan perkalian semakin baik!
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article>
      <SectionBadge>Refleksi Mini</SectionBadge>
      <h3 className="mb-1 text-lg font-semibold text-[#2C2C2A]">Pikirkan dan Jawab</h3>
      <p className="mb-5 text-sm text-[#2C2C2A99]">
        Luangkan waktu untuk merefleksikan pemahamanmu sebelum melanjutkan.
      </p>

      {/* Progress */}
      <div className="mb-5">
        <p className="text-xs font-medium text-[#663362]">
          Pertanyaan {currentStep + 1} dari {TOTAL_REFLEKSI_PERKALIAN}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {REFLEKSI_PERKALIAN_QUESTIONS.map((_, i) => {
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
                {i < TOTAL_REFLEKSI_PERKALIAN - 1 && (
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
      <div className="flex flex-col gap-5">
        {REFLEKSI_PERKALIAN_QUESTIONS.map((q, i) => {
          // Only show up to current step
          if (i > currentStep) return null;

          const fb = feedbackMap[i];
          const isCurrent = i === currentStep;
          const isCompleted = fb?.isCorrect === true;

          return (
            <div
              key={i}
              className="rounded-2xl border border-[#34673920] bg-[#DBFFD5] p-4"
            >
              <label className="mb-2 flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#346739] text-[10px] font-bold text-[#DBFFD5]">
                  {i + 1}
                </span>
                <span className="text-sm font-medium leading-snug text-[#2C2C2A]">
                  {q.soal}
                </span>
              </label>
              <textarea
                value={answers[i]}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder="Tuliskan jawabanmu di sini..."
                rows={3}
                disabled={isCompleted || readOnly}
                className={`w-full resize-y rounded-xl border border-[#34673930] bg-white px-4 py-3 text-sm leading-relaxed text-[#2C2C2A] placeholder:text-[#34673966] focus:border-[#346739] focus:outline-none focus:ring-2 focus:ring-[#34673920] ${
                  isCompleted || readOnly
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

              {/* Submit button — only for active, not-yet-correct step, and not readOnly */}
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
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-75"
                          />
                        </svg>
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

export default function KaidahPerkalian({
  onComplete,
  initialCompletedSections = {},
  savedData,
}: {
  onComplete?: () => void;
  /** Section indices yang sudah complete dari backend (hanya DB-tracked: 0,1,7) */
  initialCompletedSections?: Record<number, boolean>;
  /** Data jawaban & feedback yang sudah tersimpan di DB */
  savedData?: KaidahPerkalianSavedData;
}) {
  const onCompleteCalled = useRef(false);

  // ── Build initial state dari data backend ───────────────────────
  function buildInitialState(): {
    currentSection: number;
    completedSections: Record<number, boolean>;
  } {
    const cs: Record<number, boolean> = { ...initialCompletedSections };

    // Section 2 (Penjelasan Konsep, read-only) — infer dari section 1 atau 7
    if (cs[1] || cs[7]) cs[2] = true;
    // Section 4 (Mengapa Corner, read-only) — infer dari section 7
    if (cs[7]) cs[4] = true;
    // Section 6 (Panduan Cepat, read-only) — infer dari section 7
    if (cs[7]) cs[6] = true;
    // Section 3 (Contoh Soal) & 5 (Aktivitas Siswa) — section 3 now tracked by DB,
    // section 5 inferred from section 7
    if (cs[7]) cs[5] = true;
    // Section 3 may already be set from DB (contoh_soal_bertahap_attempts), don't override

    // Cari section pertama yang belum complete
    let firstUncompleted = TOTAL_SECTIONS - 1;
    for (let i = 0; i < TOTAL_SECTIONS; i++) {
      if (!cs[i]) {
        firstUncompleted = i;
        break;
      }
    }

    console.log(
      "[KaidahPerkalian] buildInitialState:",
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
  const didSyncInitial = useRef(false);
  useEffect(() => {
    if (didSyncInitial.current) return;
    if (Object.keys(initialCompletedSections).length === 0) return;

    const rebuilt = buildInitialState();
    console.log(
      "[KaidahPerkalian] syncing from initialCompletedSections:",
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

  const allComplete = isCompleted(7);

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
          Kaidah Perkalian
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

      {/* Section 5: Aktivitas Siswa (read-only with custom button) */}
      {isVisible(5) && (
        <AktivitasSiswa
          onNext={isActive(5) ? () => handleNext(5) : undefined}
        />
      )}

      {/* Section 6: Panduan Cepat (read-only) */}
      {isVisible(6) && (
        <PanduanCepat
          onNext={isActive(6) ? () => handleNext(6) : undefined}
        />
      )}

      {/* Section 7: Refleksi Mini */}
      {isVisible(7) && (
        <RefleksiMini
          readOnly={isCompleted(7)}
          savedData={savedData?.refleksi}
          onComplete={isActive(7) ? () => markComplete(7) : undefined}
        />
      )}

      {allComplete && (
        <div className="flex items-start gap-3.5 rounded-2xl bg-[#663362] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">
              Selamat! Kamu sudah menyelesaikan Kaidah Penjumlahan dan Kaidah Perkalian!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Langkah selanjutnya, kerjakan Asesmen Formatif di menu Asesmen untuk menguji pemahamanmu.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}