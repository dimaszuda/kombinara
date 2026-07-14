"use client";

import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { CheckIcon, LightbulbIcon } from "@/components/ui/IconButton";
import VehicleChoicePicker from "./VehicleChoicePicker";
import OutfitComboPicker from "./OutfitComboPicker";
import CommitteePicker from "./CommitteePicker";
import PasswordCounterPemantik from "./PasswordCounterPemantik";
import TeamSelectionComparator from "./TeamSelectionComparator";
import CourierRouteExplorer from "./CourierRouteExplorer";

// ── Types ──────────────────────────────────────────────────────────
type ToggleValue = "yes" | "no" | null;

// ── Saved data type dari backend ───────────────────────────────────
export interface ApersepsiSavedData {
  [questionKey: string]: {
    responseData: Record<string, unknown>;
    feedback: string | null;
    isCorrect: boolean | null;
  };
}

type StepType =
  | "apersepsi-vehicles"
  | "apersepsi-clothes"
  | "apersepsi-badges"
  | "pemantik-password"
  | "pemantik-team"
  | "pemantik-courier"
  | "refleksi";

interface StepConfig {
  index: number; // 0–6
  questionKey: string;
  section: "apersepsi" | "pemantik" | "refleksi";
  type: StepType;
  soal: string;
  label: string;
}

interface StepFeedback {
  text: string;
  isCorrect: boolean;
}

// ── Step Definitions (7 sequential questions) ──────────────────────
const STEPS: StepConfig[] = [
  {
    index: 0,
    questionKey: "kendaraan",
    section: "apersepsi",
    type: "apersepsi-vehicles",
    soal:
      "Kamu punya 3 sepeda, 2 motor, dan 1 mobil. Ayah membolehkanmu pakai salah satu buat belajar kelompok. Kira-kira ada berapa kemungkinan kendaraan yang bisa kamu pilih?",
    label: "Pilihan Kendaraan",
  },
  {
    index: 1,
    questionKey: "outfit",
    section: "apersepsi",
    type: "apersepsi-clothes",
    soal:
      "Kamu punya 4 baju dan 3 celana. Kira-kira ada berapa kombinasi outfit berbeda yang bisa kamu pakai buat pergi?",
    label: "Kombinasi Outfit",
  },
  {
    index: 2,
    questionKey: "pengurus",
    section: "apersepsi",
    type: "apersepsi-badges",
    soal:
      "Ada 3 kandidat pengurus karang taruna. Dari situ akan dipilih 1 ketua dan 1 sekretaris. Kira-kira ada berapa susunan pengurus yang mungkin terbentuk?",
    label: "Susunan Pengurus",
  },
  {
    index: 3,
    questionKey: "password_kapasitas",
    section: "pemantik",
    type: "pemantik-password",
    soal:
      "Setiap pengguna wajib bikin password 4 karakter dari angka 0–9 dan huruf A–Z, boleh berulang. Kira-kira sistemmu bisa menampung berapa pelanggan kalau setiap password harus unik?",
    label: "Kapasitas Password",
  },
  {
    index: 4,
    questionKey: "tim_sama_beda",
    section: "pemantik",
    type: "pemantik-team",
    soal:
      "Dari 10 teman, kamu mau pilih 3 orang buat tim lomba. Aturan A: ada jabatan (ketua, wakil, notulen). Aturan B: tanpa jabatan. Apakah jumlah cara membentuk timnya sama?",
    label: "Tim Sama atau Beda?",
  },
  {
    index: 5,
    questionKey: "rute_kurir",
    section: "pemantik",
    type: "pemantik-courier",
    soal:
      "Dari kota A ke B ada 5 jalan, dari B ke C ada 4 jalan. Kamu antar paket A → C lalu balik C → A, tapi nggak boleh lewat jalan yang sama. Apakah kamu perlu menghitung rute pergi dan pulang secara terpisah?",
    label: "Rute Kurir",
  },
  {
    index: 6,
    questionKey: "refleksi_sebelum_mulai_1",
    section: "refleksi",
    type: "refleksi",
    soal:
      "Apakah cara menghitung yang kamu gunakan di Apersepsi tadi cukup untuk menjawab ketiga situasi Pemantik? Mengapa?",
    label: "Refleksi 1",
  },
  {
    index: 7,
    questionKey: "refleksi_sebelum_mulai_2",
    section: "refleksi",
    type: "refleksi",
    soal:
      "Apa yang menurutmu perlu kamu pelajari untuk bisa menjawabnya?",
    label: "Refleksi 2",
  },
];

const TOTAL_STEPS = STEPS.length;

// ── Spinner SVG (reusable) ────────────────────────────────────────
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
    </svg>
  );
}

// ── Feedback Box (reusable) ────────────────────────────────────────
function FeedbackBox({ text, isCorrect }: { text: string; isCorrect?: boolean }) {
  const borderColor = isCorrect === false ? "border-[#C44F4F33]" : "border-[#66336233]";
  const bgColor = isCorrect === false ? "bg-[#C44F4F08]" : "bg-[#66336208]";
  const labelColor = isCorrect === false ? "text-[#C44F4F]" : "text-[#663362]";

  return (
    <div className={`mt-3 rounded-lg border ${borderColor} ${bgColor} p-3`}>
      <p className={`mb-1 text-xs font-medium ${labelColor}`}>
        {isCorrect === false ? "❌ Feedback Kombi" : "💬 Feedback Kombi"}
      </p>
      <p className="text-sm leading-relaxed text-[#2C2C2A]">{text}</p>
    </div>
  );
}

// ── Submit Button (reusable) ───────────────────────────────────────
function SubmitButton({
  isChecking,
  isCorrect,
  onClick,
}: {
  isChecking: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
}) {
  // Hide entirely when already answered correctly
  if (isCorrect === true) return null;

  return (
    <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={isChecking}
        className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        {isChecking ? (
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
  );
}

// ── Progress Indicator ────────────────────────────────────────────
function ProgressIndicator({
  currentStep,
  feedbackMap,
}: {
  currentStep: number;
  feedbackMap: Record<number, StepFeedback>;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-[#663362] mb-3">
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
          if (isCompleted) {
            dotBg = "bg-[#346739]";
            dotBorder = "border-[#346739]";
          } else if (isActive) {
            dotBg = "bg-white";
            dotBorder = "border-[#346739]";
          }

          return (
            <React.Fragment key={step.index}>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${dotBorder} ${dotBg} text-[10px] font-bold transition-colors ${
                  isCompleted ? "text-white" : isActive ? "text-[#346739]" : "text-[#9E9D99]"
                }`}
                title={isLocked ? `Terkunci: ${step.label}` : step.label}
              >
                {isCompleted ? "✓" : step.index + 1}
              </div>
              {step.index < TOTAL_STEPS - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded transition-colors ${
                    feedbackMap[step.index]?.isCorrect ? "bg-[#346739]" : "bg-[#E5E5E0]"
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

// ── Main Component ─────────────────────────────────────────────────
export default function ApersepsiSection({
  onComplete,
  initialCompletedSteps = {},
  savedData,
}: {
  onComplete?: () => void;
  /** Step indices (0–7) yang sudah benar dari backend */
  initialCompletedSteps?: Record<number, boolean>;
  /** Data jawaban & feedback yang sudah tersimpan di DB */
  savedData?: ApersepsiSavedData;
}) {
  const onCompleteCalled = useRef(false);

  // ── Build initial state dari data backend ──────────────────────
  function buildInitialState(): {
    currentStep: number;
    feedbackMap: Record<number, StepFeedback>;
  } {
    const fb: Record<number, StepFeedback> = {};

    for (let i = 0; i < TOTAL_STEPS; i++) {
      if (initialCompletedSteps[i]) {
        // Use actual saved feedback, or fallback
        const key = STEPS[i].questionKey;
        const sd = savedData?.[key];
        fb[i] = {
          text: sd?.feedback ?? "Jawaban benar! 🎉",
          isCorrect: true,
        };
      }
    }

    // currentStep = step pertama yang BELUM complete
    // Jika semua complete, tetap di step terakhir (all-complete view)
    let firstUncompleted = TOTAL_STEPS - 1;
    for (let i = 0; i < TOTAL_STEPS; i++) {
      if (!initialCompletedSteps[i]) {
        firstUncompleted = i;
        break;
      }
    }

    return {
      currentStep: firstUncompleted,
      feedbackMap: fb,
    };
  }

  const initState = buildInitialState();

  // ── Sequential step tracking ────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(initState.currentStep);
  const [checkingStep, setCheckingStep] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, StepFeedback>>(
    initState.feedbackMap
  );

  // ── Apersepsi answer states (per item by questionKey) ───────────
  const [answers, setAnswers] = useState<
    Record<string, { perkiraan: string; caraHitung: string }>
  >(() => {
    const init: Record<string, { perkiraan: string; caraHitung: string }> = {};
    const apersepsiKeys = ["kendaraan", "outfit", "pengurus"];
    for (const key of apersepsiKeys) {
      const sd = savedData?.[key];
      if (sd?.responseData) {
        init[key] = {
          perkiraan: (sd.responseData as Record<string, string>).estimated_answer ?? "",
          caraHitung: (sd.responseData as Record<string, string>).reasoning ?? "",
        };
      }
    }
    return init;
  });

  // ── Pemantik answer states ──────────────────────────────────────
  const [passwordGuess, setPasswordGuess] = useState(
    () => (savedData?.["password_kapasitas"]?.responseData as Record<string, string>)?.estimated_answer ?? ""
  );
  const [passwordReasoning, setPasswordReasoning] = useState(
    () => (savedData?.["password_kapasitas"]?.responseData as Record<string, string>)?.reasoning ?? ""
  );

  const [teamChoice, setTeamChoice] = useState<ToggleValue>(() => {
    const choice = (savedData?.["tim_sama_beda"]?.responseData as Record<string, string>)?.choice;
    return choice === "sama" ? "yes" : choice === "beda" ? "no" : null;
  });
  const [teamReasoning, setTeamReasoning] = useState(
    () => (savedData?.["tim_sama_beda"]?.responseData as Record<string, string>)?.reasoning ?? ""
  );

  const [courierChoice, setCourierChoice] = useState<ToggleValue>(() => {
    const choice = (savedData?.["rute_kurir"]?.responseData as Record<string, string>)?.choice;
    return choice === "perlu" ? "yes" : choice === "nggak_perlu" ? "no" : null;
  });
  const [courierReasoning, setCourierReasoning] = useState(
    () => (savedData?.["rute_kurir"]?.responseData as Record<string, string>)?.reasoning ?? ""
  );
  const [courierCalc, setCourierCalc] = useState(
    () => (savedData?.["rute_kurir"]?.responseData as Record<string, string>)?.calculation ?? ""
  );

  // ── Refleksi answer states ──────────────────────────────────────
  const [refleksiAnswers, setRefleksiAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    const refleksiKeys = ["refleksi_sebelum_mulai_1", "refleksi_sebelum_mulai_2"];
    for (const key of refleksiKeys) {
      const sd = savedData?.[key];
      if (sd?.responseData) {
        init[key] = (sd.responseData as Record<string, string>).jawaban ?? "";
      }
    }
    return init;
  });

  // ── Helpers ─────────────────────────────────────────────────────
  const currentStepConfig = STEPS[currentStep];

  function updateApersepsiAnswer(
    questionKey: string,
    field: "perkiraan" | "caraHitung",
    value: string
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: { ...prev[questionKey], [field]: value },
    }));
  }

  // ── Generic per-step submit handler ─────────────────────────────
  const handleStepSubmit = useCallback(async () => {
    const step = STEPS[currentStep];
    setCheckingStep(currentStep);

    try {
      // Build response_data based on step type
      let responseData: Record<string, unknown>;
      let soal: string;
      let section: string;
      let questionKey: string;

      // Client-side validation helpers
      let isValid = true;
      let validationMsg = "";

      switch (step.type) {
        case "apersepsi-vehicles":
        case "apersepsi-clothes":
        case "apersepsi-badges": {
          const ans = answers[step.questionKey];
          if (!ans?.perkiraan || !ans?.caraHitung) {
            isValid = false;
            validationMsg = "Lengkapi perkiraan dan cara hitungmu dulu ya!";
          }
          responseData = {
            estimated_answer: ans?.perkiraan ?? "",
            reasoning: ans?.caraHitung ?? "",
          };
          soal = step.soal;
          section = "apersepsi";
          questionKey = step.questionKey;
          break;
        }

        case "pemantik-password": {
          if (!passwordGuess || !passwordReasoning) {
            isValid = false;
            validationMsg = "Lengkapi perkiraan dan cara hitungmu dulu ya!";
          }
          responseData = {
            estimated_answer: passwordGuess,
            reasoning: passwordReasoning,
          };
          soal = step.soal;
          section = "pemantik";
          questionKey = step.questionKey;
          break;
        }

        case "pemantik-team": {
          const choice =
            teamChoice === "yes" ? "sama" : teamChoice === "no" ? "beda" : "";
          if (!teamChoice || !teamReasoning) {
            isValid = false;
            validationMsg = "Pilih jawaban dan tulis alasanmu dulu ya!";
          }
          responseData = { choice, reasoning: teamReasoning };
          soal = step.soal;
          section = "pemantik";
          questionKey = step.questionKey;
          break;
        }

        case "pemantik-courier": {
          const choice =
            courierChoice === "yes"
              ? "perlu"
              : courierChoice === "no"
                ? "nggak_perlu"
                : "";
          if (!courierChoice || !courierReasoning) {
            isValid = false;
            validationMsg = "Pilih jawaban dan tulis alasanmu dulu ya!";
          }
          responseData = {
            choice,
            reasoning: courierReasoning,
            calculation: courierCalc,
          };
          soal = step.soal;
          section = "pemantik";
          questionKey = step.questionKey;
          break;
        }

        case "refleksi": {
          const ans = refleksiAnswers[step.questionKey];
          if (!ans?.trim()) {
            isValid = false;
            validationMsg = "Tulis jawabanmu dulu ya!";
          }
          responseData = { jawaban: ans ?? "" };
          soal = step.soal;
          section = "refleksi";
          questionKey = step.questionKey;
          break;
        }

        default:
          return;
      }

      if (!isValid) {
        setFeedbackMap((prev) => ({
          ...prev,
          [currentStep]: { text: validationMsg, isCorrect: false },
        }));
        setCheckingStep(null);
        return;
      }

      // ── Call API ──────────────────────────────────────────────
      const res = await fetch("/api/ai/apersepsi-pemantik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          responses: [
            {
              question_key: questionKey,
              soal,
              response_data: responseData,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const result = data.feedback?.[questionKey];

      const fb: StepFeedback = {
        text: result?.feedback ?? "Jawaban tersimpan.",
        isCorrect: result?.isCorrect ?? false,
      };

      setFeedbackMap((prev) => ({ ...prev, [currentStep]: fb }));

      // Advance to next step if correct
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
    answers,
    passwordGuess,
    passwordReasoning,
    teamChoice,
    teamReasoning,
    courierChoice,
    courierReasoning,
    courierCalc,
    refleksiAnswers,
  ]);

  // ── Determine current section for header display ────────────────
  const showApersepsiHeader = currentStepConfig.section === "apersepsi";
  const showPemantikHeader = currentStepConfig.section === "pemantik";
  const showRefleksiHeader = currentStepConfig.section === "refleksi";

  // ── Determine if all steps are complete ─────────────────────────
  const allComplete =
    currentStep >= TOTAL_STEPS - 1 &&
    feedbackMap[TOTAL_STEPS - 1]?.isCorrect === true;

  // Notify parent when all steps are done (only once)
  useEffect(() => {
    if (allComplete && onComplete && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  }, [allComplete, onComplete]);

  // ── Sync state from savedData (timing fix) ──────────────────────
  // If savedData arrives after first mount, restore answers & feedback
  const didRestoreFromSaved = useRef(false);
  useEffect(() => {
    if (didRestoreFromSaved.current) return;
    if (!savedData || Object.keys(savedData).length === 0) return;

    // Restore apersepsi answers
    const apersepsiKeys = ["kendaraan", "outfit", "pengurus"];
    const newAnswers: Record<string, { perkiraan: string; caraHitung: string }> = {};
    let hasApersepsiData = false;
    for (const key of apersepsiKeys) {
      const sd = savedData[key];
      if (sd?.responseData) {
        newAnswers[key] = {
          perkiraan: (sd.responseData as Record<string, string>).estimated_answer ?? "",
          caraHitung: (sd.responseData as Record<string, string>).reasoning ?? "",
        };
        hasApersepsiData = true;
      }
    }
    if (hasApersepsiData) setAnswers(newAnswers);

    // Restore pemantik answers
    const pwd = savedData["password_kapasitas"]?.responseData as Record<string, string> | undefined;
    if (pwd) {
      setPasswordGuess(pwd.estimated_answer ?? "");
      setPasswordReasoning(pwd.reasoning ?? "");
    }

    const team = savedData["tim_sama_beda"]?.responseData as Record<string, string> | undefined;
    if (team) {
      const choice = team.choice;
      setTeamChoice(choice === "sama" ? "yes" : choice === "beda" ? "no" : null);
      setTeamReasoning(team.reasoning ?? "");
    }

    const courier = savedData["rute_kurir"]?.responseData as Record<string, string> | undefined;
    if (courier) {
      const choice = courier.choice;
      setCourierChoice(choice === "perlu" ? "yes" : choice === "nggak_perlu" ? "no" : null);
      setCourierReasoning(courier.reasoning ?? "");
      setCourierCalc(courier.calculation ?? "");
    }

    // Restore refleksi answers
    const refleksiKeys = ["refleksi_sebelum_mulai_1", "refleksi_sebelum_mulai_2"];
    const newRefleksi: Record<string, string> = {};
    let hasRefleksiData = false;
    for (const key of refleksiKeys) {
      const sd = savedData[key];
      if (sd?.responseData) {
        newRefleksi[key] = (sd.responseData as Record<string, string>).jawaban ?? "";
        hasRefleksiData = true;
      }
    }
    if (hasRefleksiData) setRefleksiAnswers(newRefleksi);

    // Restore feedbackMap with actual feedback text
    const newFb: Record<number, StepFeedback> = {};
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const sd = savedData[STEPS[i].questionKey];
      if (sd?.isCorrect === true) {
        newFb[i] = { text: sd.feedback ?? "Jawaban benar! 🎉", isCorrect: true };
      }
    }
    if (Object.keys(newFb).length > 0) setFeedbackMap((prev) => ({ ...prev, ...newFb }));

    didRestoreFromSaved.current = true;
  }, [savedData]);

  // ══════════════════════════════════════════════════════════════════
  // Render helpers per step type (accept stepIndex + readOnly)
  // ══════════════════════════════════════════════════════════════════

  function renderApersepsiStep(stepIndex: number, readOnly: boolean) {
    const cfg = STEPS[stepIndex];
    const fb = feedbackMap[stepIndex] ?? null;
    const isActive = stepIndex === currentStep;
    const ans = answers[cfg.questionKey] ?? { perkiraan: "", caraHitung: "" };

    return (
      <div className="rounded-xl bg-white p-4 pb-4">
        {cfg.type === "apersepsi-vehicles" && (
          <div className="mt-3">
            <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{cfg.soal}</p>
            <VehicleChoicePicker />
          </div>
        )}
        {cfg.type === "apersepsi-clothes" && (
          <div className="mt-3">
            <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{cfg.soal}</p>
            <OutfitComboPicker />
          </div>
        )}
        {cfg.type === "apersepsi-badges" && (
          <div className="mt-3">
            <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{cfg.soal}</p>
            <CommitteePicker />
          </div>
        )}

        <div className="mt-3 grid grid-rows gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Perkiraanmu
            </label>
            <input
              type="text"
              placeholder="tulis dugaan jumlahnya"
              value={ans.perkiraan}
              disabled={readOnly}
              onChange={(e) =>
                updateApersepsiAnswer(cfg.questionKey, "perkiraan", e.target.value)
              }
              className={`w-full rounded-md border border-[#34673933] px-3 py-2 text-sm ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Cara hitungnya
            </label>
            <textarea
              placeholder="ceritain logikamu"
              value={ans.caraHitung}
              disabled={readOnly}
              onChange={(e) =>
                updateApersepsiAnswer(cfg.questionKey, "caraHitung", e.target.value)
              }
              className={`w-full h-[calc(100%-20px)] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : ""
              }`}
            />
          </div>
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}

        {/* Submit only for active, not-yet-correct step */}
        {isActive && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIndex}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  function renderPemantikPasswordStep(stepIndex: number, readOnly: boolean) {
    const fb = feedbackMap[stepIndex] ?? null;
    const isActive = stepIndex === currentStep;

    return (
      <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
          Tantangan 1 · Kapasitas password
        </span>
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Setiap pengguna wajib bikin password 4 karakter, boleh angka 0–9 dan huruf A–Z, dan
          boleh berulang.
        </p>

        <PasswordCounterPemantik />

        <p className="mt-4 text-sm font-medium leading-relaxed text-[#2C2C2A]">
          Kira-kira sistemmu bisa menampung berapa pelanggan kalau setiap password harus beda?
        </p>

        <div className="mt-3 grid grid-rows-[1fr_4fr] gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Perkiraanmu
            </label>
            <input
              type="text"
              placeholder="tulis dugaan jumlahnya"
              value={passwordGuess}
              disabled={readOnly}
              onChange={(e) => setPasswordGuess(e.target.value)}
              className={`w-full rounded-md border border-[#34673933] px-3 py-2 text-sm ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""
              }`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Cara hitungmu
            </label>
            <textarea
              placeholder="ceritain logikamu"
              value={passwordReasoning}
              disabled={readOnly}
              onChange={(e) => setPasswordReasoning(e.target.value)}
              className={`w-full h-[calc(100%-20px)] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-none ${
                readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default" : ""
              }`}
            />
          </div>
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}

        {isActive && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIndex}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  function renderPemantikTeamStep(stepIndex: number, readOnly: boolean) {
    const fb = feedbackMap[stepIndex] ?? null;
    const isActive = stepIndex === currentStep;

    return (
      <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
          Tantangan 2 · Sama atau beda?
        </span>
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Dari 10 teman, kamu mau pilih 3 orang buat tim lomba, dengan dua aturan berbeda.
        </p>

        <TeamSelectionComparator
          choice={teamChoice}
          onChoiceChange={readOnly ? () => {} : setTeamChoice}
          reasoning={teamReasoning}
          onReasoningChange={readOnly ? () => {} : setTeamReasoning}
        />

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}

        {isActive && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIndex}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  function renderPemantikCourierStep(stepIndex: number, readOnly: boolean) {
    const fb = feedbackMap[stepIndex] ?? null;
    const isActive = stepIndex === currentStep;

    return (
      <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
          Tantangan 3 · Rute kurir
        </span>
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Dari kota A ke B ada 5 jalan, dari B ke C ada 4 jalan. Kamu antar paket A → C lalu
          balik lagi C → A, tapi nggak boleh lewat jalan yang sama.
        </p>

        <CourierRouteExplorer
          choice={courierChoice}
          onChoiceChange={readOnly ? () => {} : setCourierChoice}
          reasoning={courierReasoning}
          onReasoningChange={readOnly ? () => {} : setCourierReasoning}
          calcMethod={courierCalc}
          onCalcMethodChange={readOnly ? () => {} : setCourierCalc}
        />

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}

        {isActive && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIndex}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  function renderRefleksiStep(stepIndex: number, readOnly: boolean) {
    const cfg = STEPS[stepIndex];
    const fb = feedbackMap[stepIndex] ?? null;
    const isActive = stepIndex === currentStep;
    const ans = refleksiAnswers[cfg.questionKey] ?? "";

    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium leading-relaxed text-[#2C2C2A]">
            {cfg.soal}
          </p>
          <textarea
            rows={3}
            placeholder="tulis jawabanmu di sini"
            value={ans}
            disabled={readOnly}
            onChange={(e) =>
              setRefleksiAnswers((prev) => ({
                ...prev,
                [cfg.questionKey]: e.target.value,
              }))
            }
            className={`w-full resize-y rounded-md border border-[#34673933] px-3 py-2 text-sm ${
              readOnly ? "bg-[#F5F5F0] text-[#6B6B66] cursor-default resize-none" : ""
            }`}
          />
        </div>

        {fb && <FeedbackBox text={fb.text} isCorrect={fb.isCorrect} />}

        {isActive && !readOnly && (
          <SubmitButton
            isChecking={checkingStep === stepIndex}
            isCorrect={fb?.isCorrect ?? null}
            onClick={handleStepSubmit}
          />
        )}
      </div>
    );
  }

  function renderStep(stepIndex: number, readOnly: boolean) {
    const cfg = STEPS[stepIndex];
    switch (cfg.type) {
      case "apersepsi-vehicles":
      case "apersepsi-clothes":
      case "apersepsi-badges":
        return renderApersepsiStep(stepIndex, readOnly);
      case "pemantik-password":
        return renderPemantikPasswordStep(stepIndex, readOnly);
      case "pemantik-team":
        return renderPemantikTeamStep(stepIndex, readOnly);
      case "pemantik-courier":
        return renderPemantikCourierStep(stepIndex, readOnly);
      case "refleksi":
        return renderRefleksiStep(stepIndex, readOnly);
      default:
        return null;
    }
  }

  // ── Section header renderers ────────────────────────────────────
  function renderApersepsiHeader() {
    return (
      <>
        <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
          Apersepsi
        </span>
        <p className="mt-4 text-sm">
          🌍 <b>Tujuan</b>: Mengaktifkan pengetahuan dan pengalaman yang sudah kamu miliki
          sebagai jembatan menuju materi baru.
        </p>
        <p className="mt-4 text-xl font-medium text-[#346739]">
          Sebelum masuk materi, coba bayangkan satu harimu
        </p>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#346739]">
          Tiga keputusan kecil di bawah ini sebenarnya soal matematika yang sama. Tulis aja
          dugaanmu, nggak ada yang salah di sini.
        </p>
      </>
    );
  }

  function renderPemantikHeader() {
    return (
      <>
        <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
          Pemantik
        </span>
        <p className="mt-4 text-xl font-medium text-[#346739]">
          Coba pikir lagi, caramu biasanya cukup nggak?
        </p>
        <p className="mt-1 text-[13px] leading-relaxed">
          🟡 <b>Tujuan</b>: Membangun rasa ingin tahu dan menyadarkan bahwa cara berpikir
          biasa belum cukup untuk menjawab pertanyaan-pertanyaan ini.
        </p>
      </>
    );
  }

  function renderRefleksiHeader() {
    return (
      <>
        <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
          Refleksi
        </span>
        <p className="mt-4 text-xl font-medium text-[#346739]">Refleksi Sebelum Mulai</p>
        <p className="mt-2.5 text-sm leading-relaxed text-[#2C2C2A]">
          Setelah melihat ketiga situasi di atas, jawab pertanyaan ini:
        </p>
      </>
    );
  }

  // ── Render all visible steps (0..currentStep) with section headers inline ──
  function renderVisibleSteps() {
    const elements: React.ReactNode[] = [];
    let lastSection = "";

    for (let i = 0; i <= currentStep; i++) {
      const cfg = STEPS[i];
      const isCompleted = feedbackMap[i]?.isCorrect === true;
      const isCurrent = i === currentStep;

      // Insert section header when section changes
      if (cfg.section !== lastSection) {
        lastSection = cfg.section;
        elements.push(
          <div key={`section-${cfg.section}`} className="mt-6">
            {cfg.section === "apersepsi" && renderApersepsiHeader()}
            {cfg.section === "pemantik" && renderPemantikHeader()}
            {cfg.section === "refleksi" && renderRefleksiHeader()}
          </div>
        );
      }

      // Completed steps: read-only (no submit, disabled inputs)
      // Current step: editable unless already correct
      const readOnly = isCompleted || (isCurrent && feedbackMap[i]?.isCorrect === true);

      elements.push(
        <div key={`step-${i}`} className={i > 0 ? "mt-4" : "mt-5"}>
          {renderStep(i, readOnly)}
        </div>
      );
    }

    return elements;
  }

  // ══════════════════════════════════════════════════════════════════
  // All Complete State — show all questions stacked + success banner
  // ══════════════════════════════════════════════════════════════════
  if (allComplete) {
    return (
      <section className="rounded-xl border border-[#346739] p-7">
        <h2 className="kp-subtitle" style={{ color: "#346739" }}>
          Apersepsi dan Pemantik
        </h2>

        <ProgressIndicator currentStep={currentStep} feedbackMap={feedbackMap} />

        {/* Show all completed questions stacked */}
        <div className="mt-5">{renderVisibleSteps()}</div>

        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#346739] p-6">
          <CheckIcon />
          <div>
            <p className="text-lg font-semibold text-white">
              🎉 Semua langkah selesai!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              Kamu sudah menyelesaikan Apersepsi, Pemantik, dan Refleksi. Bagus sekali!
              Lanjutkan ke materi Kaidah Pencacahan untuk memperdalam pemahamanmu.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#663362] p-5">
          <LightbulbIcon />
          <p className="text-[15px] leading-relaxed text-white">
            Itulah mengapa kita mempelajari Kaidah Pencacahan. Bukan untuk menghafal rumus,
            melainkan untuk membangun cara berpikir yang sistematis dalam menghitung kemungkinan
            sehingga pertanyaan-pertanyaan di atas bisa dijawab dengan tepat dan efisien.
          </p>
        </div>
      </section>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // Main Render
  // ══════════════════════════════════════════════════════════════════
  return (
    <section className="rounded-xl border border-[#346739] p-7">
      <h2 className="kp-subtitle" style={{ color: "#346739" }}>
        Apersepsi dan Pemantik
      </h2>

      {/* Progress indicator */}
      <div className="mt-5">
        <ProgressIndicator currentStep={currentStep} feedbackMap={feedbackMap} />
      </div>

      {/* Render all visible steps: completed (read-only) + current (active) */}
      {renderVisibleSteps()}

      {/* Lightbulb insight — only shown on refleksi step */}
      {showRefleksiHeader && (
        <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#663362] p-5">
          <LightbulbIcon />
          <p className="text-[15px] leading-relaxed text-white">
            Itulah mengapa kita mempelajari Kaidah Pencacahan. Bukan untuk menghafal rumus,
            melainkan untuk membangun cara berpikir yang sistematis dalam menghitung kemungkinan
            sehingga pertanyaan-pertanyaan di atas bisa dijawab dengan tepat dan efisien.
          </p>
        </div>
      )}
    </section>
  );
}
