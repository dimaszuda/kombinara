"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  LEVEL_META,
  SOAL_DATA,
  SUB_PART_CONFIG,
  SoalKepahaman,
} from "@/components/materi/sections/faktorial/latihan";
import { useAssesmentLock } from "@/components/dashboard/assesment-lock-context";
import { useDraftSaver } from "@/hooks/useDraftSaver";
import type { AnswerPair as DraftAnswerPair } from "@/hooks/useDraftSaver";
import { useIntegrityMonitor } from "@/hooks/useIntegrityMonitor";
import type { UseIntegrityMonitorReturn } from "@/hooks/useIntegrityMonitor";
import { getDeviceType } from "@/lib/device";
import type { DeviceType } from "@/lib/device";
import IntegrityToast from "@/components/activity/IntegrityToast";
import IntegrityBlockingModal from "@/components/activity/IntegrityBlockingModal";
import { useEvaluationPersistence } from "@/hooks/useEvaluationPersistence";
import RuleBox from "@/components/Quiz Ulangan/RuleBox";
import IntroInfoCard from "@/components/Quiz Ulangan/IntroInfoCard";
import EvaluatingScreen from "@/components/Quiz Ulangan/EvaluatingScreen";
import NumericAnswerInput from "@/components/shared/NumericAnswerInput";

// ── Config ───────────────────────────────────────────────────────────────────
const DURASI_DETIK = 120 * 60; // 120 menit

const PETUNJUK = [
  "Baca setiap soal dengan teliti sebelum menjawab.",
  'Tuliskan langkah-langkah cara perhitungan secara lengkap pada kolom "Cara Hitung".',
  'Tuliskan hasil akhir jawaban pada kolom "Jawaban Akhir".',
  "Pastikan semua soal telah dijawab sebelum menekan tombol Submit."
];

const BOLEH = ["Menggunakan coretan / kertas buram", "Menghitung secara manual"];
const TIDAK_BOLEH = [
  "Membuka tab atau aplikasi lain",
  "Bekerja sama dengan teman",
  "Menggunakan kalkulator",
];

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "intro" | "active" | "submitted" | "evaluating" | "results";
type AnswerPair = { cara_hitung: string; jawaban_akhir: string };

interface PerQuestionResult {
  question_number: number;
  total_score: number;
  feedback: string;
  mistake_category: string | null;
  step_by_step?: {
    identifikasi_kondisi: { score: number; reasoning: string };
    pemilihan_rumus: { score: number; reasoning: string };
    eksekusi_perhitungan: { score: number; reasoning: string };
    justifikasi: { score: number; reasoning: string };
  };
}

interface EvaluationResult {
  total_score: number;
  per_question: PerQuestionResult[];
  ai_feedback: string;
}

interface AccessCheckResponse {
  allowed: boolean;
  missingSections: Array<{ conceptId: string; section: string }>;
  summary: { totalRequired: number; completed: number; missing: number };
  masteredQuestions?: number[];
  remainingQuestions?: number[];
  isFullyMastered?: boolean;
  initialScore?: number | null;
}

// ── Module-specific labels ───────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  apersepsi: "Apersepsi",
  pemantik: "Pemantik",
  refleksi_sebelum_mulai: "Refleksi Sebelum Mulai",
  eksplorasi_kontekstual: "Eksplorasi Kontekstual",
  aktivitas_deep_learning: "Aktivitas Deep Learning",
  penjelasan_konsep: "Penjelasan Konsep",
  contoh_soal: "Contoh Soal",
  refleksi_mini: "Refleksi Mini",
};

const CONCEPT_LABELS: Record<string, string> = {
  faktorial: "Faktorial",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function timerColor(secs: number) {
  if (secs > 10 * 60) return "#346739";
  if (secs > 3 * 60) return "#d97706";
  return "#b91c1c";
}

function isAnswered(a: AnswerPair) {
  return a.cara_hitung.trim().length > 0 || a.jawaban_akhir.trim().length > 0;
}

// ── Sub-answer helpers ───────────────────────────────────────────────────────
const SUB_DELIMITER = "\n";

/** Soal dengan sub-part yang jawabannya murni integer — input dibatasi hanya angka. */
const INTEGER_ONLY_SUB_PARTS = new Set([1, 2, 3, 6]);

/** Parse sub-answers from jawaban_akhir string. Returns array of values per part. */
function parseSubAnswers(jawabanAkhir: string, parts: string[]): string[] {
  const lines = jawabanAkhir.split(SUB_DELIMITER);
  return parts.map((letter) => {
    const prefix = `${letter}) `;
    const line = lines.find((l) => l.trim().startsWith(prefix));
    return line ? line.trim().slice(prefix.length) : "";
  });
}

/** Serialize sub-answers back into jawaban_akhir format. */
function serializeSubAnswers(parts: string[], values: string[]): string {
  return parts.map((letter, i) => `${letter}) ${values[i] || ""}`).join(SUB_DELIMITER);
}

// ── Soal 4 table data ────────────────────────────────────────────────────────
const SOAL4_ROWS = [
  { key: "a", statement: "0! = 0" },
  { key: "b", statement: "5! / 3! = 2!" },
  { key: "c", statement: "5! = 5 × 4!" },
  { key: "d", statement: "n! / (n-1)! = n" },
];

/** Parse soal 4 table data from jawaban_akhir: returns array of { benarSalah, alasan } */
function parseSoal4Table(jawabanAkhir: string): { benarSalah: string; alasan: string }[] {
  return SOAL4_ROWS.map((row) => {
    // One line per row, anchored at the start of the line: "a) ..."
    const regex = new RegExp(`^${row.key}\\)\\s*(.+)$`, "m");
    const match = jawabanAkhir.match(regex);
    if (!match) {
      return { benarSalah: "", alasan: "" };
    }
    const val = match[1].trim();

    // Format: "✅ | alasan" / "❌ | alasan" — emoji first, optional "|" after it.
    // Collapse ANY run of "|" separators — this also heals old corrupted
    // drafts where a "|" leaked into the alasan on every keystroke.
    if (val.startsWith("✅") || val.startsWith("❌")) {
      const emoji = val.slice(0, 1);
      const rest = val
        .slice(1)
        .trim()
        .replace(/^(?:\s*\|)+/, "")
        .trim();
      return { benarSalah: emoji, alasan: rest };
    }

    // Legacy format: "Benar | alasan" / "Salah alasan". Only match when the
    // value STARTS with the word, so an alasan that merely contains
    // "benar"/"salah" (e.g. "Pernyataan ini benar") is left untouched.
    const legacy = val.match(/^(Benar|Salah)\b\s*(?:\|\s*)?(.*)$/i);
    if (legacy) {
      const emoji = /^benar$/i.test(legacy[1]) ? "✅" : "❌";
      return { benarSalah: emoji, alasan: (legacy[2] ?? "").trim() };
    }

    // Plain alasan without B/S selection. Also collapse leftover "|" runs
    // from the old buggy format.
    return { benarSalah: "", alasan: val.replace(/^(?:\s*\|)+/, "").trim() };
  });
}

function serializeSoal4Table(rows: { benarSalah: string; alasan: string }[]): string {
  return SOAL4_ROWS.map((row, i) => {
    const bs = rows[i]?.benarSalah || "";
    const alasan = rows[i]?.alasan || "";
    // Only include | separator when benarSalah is actually set
    return bs ? `${row.key}) ${bs} | ${alasan}` : `${row.key}) ${alasan}`;
  }).join("\n");
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AsesmenFaktorialPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<AnswerPair[]>(
    SOAL_DATA.map(() => ({ cara_hitung: "", jawaban_akhir: "" }))
  );
  const [timeLeft, setTimeLeft] = useState(DURASI_DETIK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);
  const handleSubmitRef = useRef<() => void>(() => {});
  const { setLocked } = useAssesmentLock();

  // ── Integrity monitoring state ────────────────────────────────────────────
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);

  // ── Evaluation state ──────────────────────────────────────────────────────
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // ── Mastery / retry state ─────────────────────────────────────────────────
  const [masteredQuestions, setMasteredQuestions] = useState<number[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState<number[]>([]);
  const [isFullyMastered, setIsFullyMastered] = useState(false);
  const [initialScore, setInitialScore] = useState<number | null>(null);

  // ── Evaluation persistence (resume after refresh) ────────────────────────
  const { savePending } = useEvaluationPersistence({
    phase,
    moduleSlug: "faktorial",
    onEvaluationComplete: (result: unknown) => {
      setEvaluationResult(result as EvaluationResult);
      setPhase("results");
    },
    onEvaluationError: (error: string) => {
      setEvalError(error);
      setPhase("submitted");
    },
    onResumeEvaluation: () => {
      setPhase("evaluating");
    },
    onPendingResolved: () => {
      // Handled in onEvaluationComplete/onEvaluationError
    },
  });

  // ── Access check state ────────────────────────────────────────────────────
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);
  const [missingSections, setMissingSections] = useState<
    Array<{ conceptId: string; section: string }>
  >([]);
  const [accessSummary, setAccessSummary] = useState<{
    totalRequired: number;
    completed: number;
    missing: number;
  } | null>(null);

  // ── Access check on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const res = await fetch(
          "/api/asesmen-formatif/check-access?module_slug=faktorial"
        );
        if (cancelled) return;

        if (!res.ok) {
          // API error — allow access with all questions as fallback
          // TODO: update check-access API to support faktorial module
          setAccessAllowed(true);
          const allQuestions = SOAL_DATA.map((s) => s.question_number);
          setRemainingQuestions(allQuestions);
          setAnswers(allQuestions.map(() => ({ cara_hitung: "", jawaban_akhir: "" })));
          return;
        }

        const data: AccessCheckResponse = await res.json();
        if (cancelled) return;

        setAccessAllowed(data.allowed);
        setMissingSections(data.missingSections);
        setAccessSummary(data.summary);

        // Mastery tracking — fallback to all questions if API returns empty remainingQuestions
        const allQns = SOAL_DATA.map((s) => s.question_number);
        const remaining = (data.remainingQuestions && data.remainingQuestions.length > 0)
          ? data.remainingQuestions
          : allQns;
        setRemainingQuestions(remaining);
        if (data.masteredQuestions) setMasteredQuestions(data.masteredQuestions);
        setIsFullyMastered(data.isFullyMastered ?? false);
        setInitialScore(data.initialScore ?? null);

        // Initialize answers for remaining questions
        setAnswers(remaining.map(() => ({ cara_hitung: "", jawaban_akhir: "" })));
      } catch {
        if (!cancelled) {
          // Network error — allow access with all questions as fallback
          setAccessAllowed(true);
          const allQuestions = SOAL_DATA.map((s) => s.question_number);
          setRemainingQuestions(allQuestions);
          setAnswers(allQuestions.map(() => ({ cara_hitung: "", jawaban_akhir: "" })));
        }
      }
    }
    checkAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Draft auto-save hook ──────────────────────────────────────────────────
  const { isRestoring, saveAllDrafts } = useDraftSaver({
    answers,
    moduleSlug: "faktorial",
    questionCount: SOAL_DATA.length,
    onRestore: useCallback((restored: DraftAnswerPair[]) => {
      setAnswers(restored);
    }, []),
  });

  useEffect(() => {
    setLocked(phase === "active");
    return () => setLocked(false);
  }, [phase, setLocked]);

  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => handleSubmitRef.current(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  async function handleStart() {
    const dt = getDeviceType();
    setDeviceType(dt);

    try {
      const res = await fetch("/api/asesmen-formatif/start-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_slug: "faktorial",
          device_type: dt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setAttemptError(
          err.error ?? "Gagal memulai latihan. Silakan coba lagi."
        );
        return;
      }

      const data = await res.json();
      setAttemptId(data.attempt_id);

      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Graceful fallback if fullscreen denied
      }

      setPhase("active");
    } catch (e) {
      console.error("[handleStart] Failed to create attempt:", e);
      setAttemptError(
        "Gagal memulai latihan. Periksa koneksi internet dan coba lagi."
      );
    }
  }

  async function handleSubmit() {
    if (hasSubmittedRef.current || isSubmitting) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await saveAllDrafts();

      const answersPayload = answers.map((a, i) => ({
        question_number: remainingQuestions[i] ?? (i + 1),
        cara_mengerjakan: a.cara_hitung,
        jawaban_akhir: a.jawaban_akhir,
      }));

      const res = await fetch("/api/asesmen-formatif/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_slug: "faktorial",
          concept_id: "faktorial",
          answers: answersPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Gagal menyimpan jawaban");
      }

      const submissionData = await res.json();

      // Save pending evaluation to sessionStorage (resume after refresh)
      if (submissionData.submission_id) {
        savePending(submissionData.submission_id);
      }

      if (attemptId !== null) {
        const isTimedOut = timeLeft <= 0;
        fetch("/api/asesmen-formatif/start-attempt", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt_id: attemptId,
            status: isTimedOut ? "timed_out" : "submitted",
            submission_id: submissionData.submission_id ?? undefined,
          }),
        }).catch(() => {
          // Non-critical
        });
      }

      setPhase("evaluating");
      setEvalError(null);

      try {
        const evalRes = await fetch("/api/asesmen-formatif/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_id: submissionData.submission_id,
            module_slug: "faktorial",
          }),
        });

        if (!evalRes.ok) {
          const evalErr = await evalRes
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(evalErr.error ?? "Gagal mengevaluasi jawaban");
        }

        const evalData: EvaluationResult = await evalRes.json();
        setEvaluationResult(evalData);
        setPhase("results");
      } catch (evalErr: unknown) {
        const message =
          evalErr instanceof Error
            ? evalErr.message
            : "Gagal mengevaluasi jawaban";
        setEvalError(message);
        setPhase("submitted");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan jawaban. Silakan coba lagi.";
      setSubmitError(message);
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  function updateAnswer(idx: number, field: keyof AnswerPair, value: string) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  }

  // ── Loading: access check in progress ─────────────────────────────────────
  if (accessAllowed === null) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 15, color: "#6b8f6d" }}>
          Memeriksa akses latihan...
        </p>
      </div>
    );
  }

  // ── Access denied: show locked screen ─────────────────────────────────────
  if (!accessAllowed) {
    return (
      <LockedScreen
        missingSections={missingSections}
        summary={accessSummary}
      />
    );
  }

  if (phase === "intro") {
    if (isRestoring) {
      return (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, color: "#6b8f6d" }}>
            Memulihkan jawaban yang tersimpan...
          </p>
        </div>
      );
    }
    return (
      <>
        {attemptError && (
          <div
            style={{ maxWidth: 700, margin: "0 auto", padding: "12px 24px 0" }}
          >
            <div
              style={{
                backgroundColor: "#fff5f5",
                borderRadius: 10,
                border: "1.5px solid #fecaca",
                padding: "12px 16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>
                {attemptError}
              </p>
            </div>
          </div>
        )}
        <IntroScreen
          onStart={handleStart}
          isFullyMastered={isFullyMastered}
          initialScore={initialScore}
          remainingCount={remainingQuestions.length}
          totalCount={SOAL_DATA.length}
        />
      </>
    );
  }
  if (phase === "submitted")
    return <SubmittedScreen answers={answers} remainingQuestions={remainingQuestions} />;
  if (phase === "evaluating")
    return <EvaluatingScreen />;
  if (phase === "results")
    return (
      <ResultsScreen
        evaluationResult={evaluationResult}
        answers={answers}
        evalError={evalError}
        onRetry={() => setPhase("submitted")}
        remainingQuestions={remainingQuestions}
      />
    );
  return (
    <ActiveScreen
      answers={answers}
      timeLeft={timeLeft}
      onUpdateAnswer={updateAnswer}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onDismissSubmitError={() => {
        setSubmitError(null);
        hasSubmittedRef.current = false;
      }}
      attemptId={attemptId!}
      deviceType={deviceType!}
      remainingQuestions={remainingQuestions}
    />
  );
}

// ── Locked Screen ────────────────────────────────────────────────────────────

interface LockedScreenProps {
  missingSections: Array<{ conceptId: string; section: string }>;
  summary: { totalRequired: number; completed: number; missing: number } | null;
}

function LockedScreen({ missingSections, summary }: LockedScreenProps) {
  const grouped = new Map<string, string[]>();
  for (const ms of missingSections) {
    const list = grouped.get(ms.conceptId);
    if (list) {
      list.push(ms.section);
    } else {
      grouped.set(ms.conceptId, [ms.section]);
    }
  }

  const hasDetail = missingSections.length > 0 && summary !== null;

  const progressPct =
    summary && summary.totalRequired > 0
      ? Math.round((summary.completed / summary.totalRequired) * 100)
      : 0;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#fff5f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b45309"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#b45309",
            opacity: 0.7,
            margin: "0 0 6px",
          }}
        >
          Akses Terkunci
        </p>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#7c2d12",
            margin: "0 0 8px",
          }}
        >
          Selesaikan Materi Terlebih Dahulu
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#9a7b5c",
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          Kamu harus menyelesaikan seluruh section pada materi Faktorial
          sebelum dapat mengerjakan latihan formatif ini.
        </p>
      </div>

      {/* Progress summary */}
      {summary && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            borderRadius: 12,
            border: "1.5px solid #fde68a",
            padding: "14px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}
            >
              Progress Materi
            </span>
            <span
              style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}
            >
              {summary.completed}/{summary.totalRequired} selesai
            </span>
          </div>
          <div
            style={{
              height: 8,
              backgroundColor: "#fde68a",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#d97706",
                borderRadius: 99,
                width: `${progressPct}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Missing sections list */}
      {hasDetail ? (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "1.5px solid #e2ede2",
            padding: "18px 20px",
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#346739",
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Section yang Belum Selesai
          </h3>
          {Array.from(grouped.entries()).map(([conceptId, sections]) => (
            <div key={conceptId} style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1a3d1c",
                  margin: "0 0 6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {CONCEPT_LABELS[conceptId] ?? conceptId}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: "0 0 0 4px",
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {sections.map((section) => (
                  <li
                    key={section}
                    style={{
                      fontSize: 13,
                      color: "#5a7d5c",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#d97706",
                        flexShrink: 0,
                      }}
                    />
                    {SECTION_LABELS[section] ?? section}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fff5f5",
            borderRadius: 12,
            border: "1.5px solid #fecaca",
            padding: "14px 18px",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>
            Tidak dapat memeriksa status materi saat ini. Silakan coba lagi
            beberapa saat.
          </p>
        </div>
      )}

      {/* CTA button */}
      <div style={{ textAlign: "center" }}>
        <Link
          href="/siswa/materi/faktorial"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 32px",
            backgroundColor: "#346739",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke Materi
        </Link>
        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#9aada0",
          }}
        >
          Selesaikan semua section di atas, lalu kembali ke halaman ini untuk
          memulai latihan pemahaman.
        </p>
      </div>
    </div>
  );
}

// ── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({
  onStart,
  isFullyMastered,
  initialScore,
  remainingCount,
  totalCount,
}: {
  onStart: () => void;
  isFullyMastered?: boolean;
  initialScore?: number | null;
  remainingCount?: number;
  totalCount?: number;
}) {
  const hasAttemptedBefore = initialScore !== null && initialScore !== undefined;
  const displayRemaining = remainingCount ?? totalCount ?? SOAL_DATA.length;
  const displayTotal = totalCount ?? SOAL_DATA.length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#346739",
          opacity: 0.7,
          margin: "0 0 6px",
        }}
      >
        Latihan Pemahaman (Asesmen)
      </p>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#1a3d1c",
          margin: "0 0 28px",
        }}
      >
        Faktorial
      </h1>

      {/* Initial score banner (only on retry) */}
      {hasAttemptedBefore && (
        <div
          style={{
            backgroundColor: "#f0faf0",
            borderRadius: 12,
            border: "1.5px solid #c3e6c3",
            padding: "14px 18px",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: "#5a7d5c", margin: "0 0 4px" }}>
             Skor Awal Kamu
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#1a3d1c", margin: 0 }}>
            {initialScore}/100
          </p>
          {!isFullyMastered && displayRemaining < displayTotal && (
            <p style={{ fontSize: 12, color: "#6b8f6d", margin: "6px 0 0" }}>
              {displayRemaining} dari {displayTotal} soal masih perlu dikerjakan ulang
            </p>
          )}
        </div>
      )}

      {/* Fully mastered banner */}
      {isFullyMastered && (
        <div
          style={{
            backgroundColor: "#f0faf0",
            borderRadius: 12,
            border: "2px solid #346739",
            padding: "18px 20px",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1a3d1c", margin: "0 0 4px" }}>
            🎉 Semua Soal Sudah Terjawab Benar!
          </p>
          <p style={{ fontSize: 13, color: "#5a7d5c", margin: 0 }}>
            Kamu sudah menguasai seluruh materi Faktorial. Tidak ada soal yang perlu diulang.
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <IntroInfoCard
          icon="⏱"
          label="Durasi"
          value="120 Menit"
          color="#346739"
          bg="#DBFFD5"
        />
        <IntroInfoCard
          icon="📄"
          label="Jumlah Soal"
          value={`${displayRemaining} Soal`}
          color="#346739"
          bg="#DBFFD5"
        />
        <IntroInfoCard
          icon="✍️"
          label="Jenis"
          value="Uraian"
          color="#663362"
          bg="#f3e8f2"
        />
        <IntroInfoCard
          icon="🔒"
          label="Pengerjaan"
          value="Dapat diulang"
          color="#663362"
          bg="#f3e8f2"
        />
      </div>

      <div
        style={{
          backgroundColor: "#f8fdf8",
          borderRadius: 12,
          border: "1px solid #d4e8d4",
          padding: "18px 20px",
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#346739",
            margin: "0 0 12px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Petunjuk Pengerjaan
        </h3>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {PETUNJUK.map((p, i) => (
            <li
              key={i}
              style={{
                fontSize: 14,
                color: "#3b5e3d",
                lineHeight: 1.7,
                marginBottom: i < PETUNJUK.length - 1 ? 6 : 0,
              }}
            >
              {p}
            </li>
          ))}
        </ol>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <RuleBox title="Yang Diperbolehkan" items={BOLEH} type="allowed" />
        <RuleBox
          title="Yang Tidak Diperbolehkan"
          items={TIDAK_BOLEH}
          type="forbidden"
        />
      </div>

      <div style={{ textAlign: "center" }}>
        {isFullyMastered ? (
          <>
            <Link
              href="/siswa/materi/faktorial"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 40px",
                backgroundColor: "#346739",
                color: "#fff",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Kembali ke Materi
            </Link>
            <p style={{ marginTop: 10, fontSize: 12, color: "#9aada0" }}>
              Semua soal sudah dikuasai. Tidak perlu mengulang latihan.
            </p>
          </>
        ) : (
          <>
            <button
              onClick={onStart}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 40px",
                backgroundColor: "#346739",
                color: "#fff",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Siap, Mulai latihan
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: "#9aada0" }}>
              Timer akan mulai berjalan setelah kamu klik tombol di atas.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Active Screen ────────────────────────────────────────────────────────────

interface ActiveScreenProps {
  answers: AnswerPair[];
  timeLeft: number;
  onUpdateAnswer: (idx: number, field: keyof AnswerPair, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  onDismissSubmitError: () => void;
  attemptId: number;
  deviceType: DeviceType;
  remainingQuestions: number[];
}

function ActiveScreen({
  answers,
  timeLeft,
  onUpdateAnswer,
  onSubmit,
  isSubmitting,
  submitError,
  onDismissSubmitError,
  attemptId,
  deviceType,
  remainingQuestions,
}: ActiveScreenProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const color = timerColor(timeLeft);
  const pct = (timeLeft / DURASI_DETIK) * 100;
  const answeredCount = answers.filter(isAnswered).length;

  // Build filtered soal list
  const filteredSoal = remainingQuestions
    .map((qn) => SOAL_DATA.find((s) => s.question_number === qn))
    .filter((s): s is typeof SOAL_DATA[number] => s !== undefined);

  // ── Integrity monitor ────────────────────────────────────────────────────
  const integrity = useIntegrityMonitor({
    attemptId,
    moduleSlug: "faktorial",
    deviceType,
  });

  const pasteTargetRefs = useRef<
    Map<
      number,
      { cara: HTMLTextAreaElement | null; jawaban: HTMLInputElement | null }
    >
  >(new Map());

  const registerPasteForQuestion = useCallback(
    (
      idx: number,
      caraEl: HTMLTextAreaElement | null,
      jawabanEl: HTMLInputElement | null
    ) => {
      const prev = pasteTargetRefs.current.get(idx);
      if (prev) {
        integrity.registerPasteTarget(`cara_hitung_${idx + 1}`, null);
        integrity.registerPasteTarget(`jawaban_akhir_${idx + 1}`, null);
      }
      pasteTargetRefs.current.set(idx, { cara: caraEl, jawaban: jawabanEl });
      integrity.registerPasteTarget(`cara_hitung_${idx + 1}`, caraEl);
      integrity.registerPasteTarget(`jawaban_akhir_${idx + 1}`, jawabanEl);
    },
    [integrity]
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 48px" }}>
      {/* Integrity Toast (non-blocking) */}
      {integrity.activeToast && (
        <IntegrityToast
          toast={integrity.activeToast}
          onDismiss={() => {}}
        />
      )}

      {/* Integrity Blocking Modal (paste) */}
      {integrity.activeBlockingModal && (
        <IntegrityBlockingModal
          modal={integrity.activeBlockingModal}
          onDismiss={integrity.dismissBlockingModal}
        />
      )}

      {/* Sticky Timer */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#fff",
          borderBottom: "1.5px solid #e2ede2",
          paddingTop: 10,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 8,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#346739",
                opacity: 0.7,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Latihan Pemahaman — Faktorial
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#6b8f6d",
                margin: "2px 0 0",
              }}
            >
              {answeredCount}/{answers.length} soal terjawab
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              backgroundColor: color + "18",
              borderRadius: 10,
              padding: "8px 14px",
              border: `1.5px solid ${color}30`,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: 20,
                color,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div
          style={{
            height: 3,
            backgroundColor: "#e2ede2",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: color,
              borderRadius: 99,
              width: `${pct}%`,
              transition: "width 1s linear, background-color 0.5s",
            }}
          />
        </div>
      </div>

      {/* Question Navigator */}
      <div
        style={{
          marginBottom: 24,
          backgroundColor: "#f8fdf8",
          borderRadius: 12,
          border: "1px solid #e2ede2",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#346739",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 10px",
          }}
        >
          Navigasi Soal
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filteredSoal.map((soal, i) => {
            const answered = isAnswered(answers[i]);
            return (
              <a
                key={soal.question_number}
                href={`#soal-${soal.question_number}`}
                title={LEVEL_META[soal.level].label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  backgroundColor: answered ? "#346739" : "#fff",
                  color: answered ? "#fff" : "#346739",
                  border: `2px solid ${answered ? "#346739" : "#d4e8d4"}`,
                  transition: "all 0.15s ease",
                }}
              >
                {i + 1}
              </a>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <span
              key={key}
              style={{
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: meta.bg,
                color: meta.text,
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          pointerEvents: integrity.isBlocking ? "none" : "auto",
          opacity: integrity.isBlocking ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {filteredSoal.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          const lm = LEVEL_META[soal.level];
          const qNum = soal.question_number;
          const subParts = SUB_PART_CONFIG[qNum];
          const isSoal4 = qNum === 4;

          return (
            <div
              key={soal.question_number}
              id={`soal-${soal.question_number}`}
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                border: `2px solid ${answered ? "#346739" : "#e2ede2"}`,
                overflow: "hidden",
                transition: "border-color 0.2s ease",
              }}
            >
              <div
                style={{
                  height: 4,
                  backgroundColor: answered ? "#346739" : "#e2ede2",
                  transition: "background-color 0.2s ease",
                }}
              />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: "#346739", flexShrink: 0 }}>{soal.question_number}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: lm.bg, color: lm.text, padding: "3px 10px", borderRadius: 99 }}>{lm.label}</span>
                  {answered && <span style={{ fontSize: 11, color: "#346739", fontWeight: 700, marginLeft: "auto" }}>✓ Terjawab</span>}
                </div>
                <p style={{ fontSize: 15, color: "#2C2C2A", lineHeight: 1.75, margin: "0 0 18px", fontWeight: 500, whiteSpace: "pre-wrap" }}>{soal.question}</p>

                {/* ── Soal 4: Table with dropdown + alasan ── */}
                {isSoal4 ? (
                  <Soal4Table
                    jawabanAkhir={answers[i].jawaban_akhir}
                    onUpdate={(newJawabanAkhir) => onUpdateAnswer(i, "jawaban_akhir", newJawabanAkhir)}
                  />
                ) : qNum === 7 || qNum === 10 ? (
                  /* Soal 7 & 10: only Cara Hitung, no Jawaban Akhir */
                  <div>
                    <label htmlFor={`cara-hitung-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Cara Hitung</label>
                    <textarea id={`cara-hitung-${i}`} ref={(el) => { const prev = pasteTargetRefs.current.get(i); registerPasteForQuestion(i, el, null); }} value={answers[i].cara_hitung} onChange={(e) => onUpdateAnswer(i, "cara_hitung", e.target.value)} placeholder="Tuliskan analisis dan perhitunganmu di sini..." rows={5} className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed text-[#2C2C2A] resize-y border border-[#d4e8d4] bg-[#fafffe] placeholder:text-[#b0c4b1] focus:outline-none focus:ring-2 focus:ring-[#346739]/30 focus:border-[#346739] transition-all" style={{ fontFamily: "inherit" }} />
                  </div>
                ) : (
                  <>
                    {/* Cara Hitung textarea */}
                    <div style={{ marginBottom: 14 }}>
                      <label htmlFor={`cara-hitung-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Cara Hitung</label>
                      <textarea id={`cara-hitung-${i}`} ref={(el) => { const prev = pasteTargetRefs.current.get(i); registerPasteForQuestion(i, el, prev?.jawaban ?? null); }} value={answers[i].cara_hitung} onChange={(e) => onUpdateAnswer(i, "cara_hitung", e.target.value)} placeholder="Tuliskan langkah-langkah perhitunganmu di sini..." rows={4} className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed text-[#2C2C2A] resize-y border border-[#d4e8d4] bg-[#fafffe] placeholder:text-[#b0c4b1] focus:outline-none focus:ring-2 focus:ring-[#346739]/30 focus:border-[#346739] transition-all" style={{ fontFamily: "inherit" }} />
                    </div>

                    {/* ── Sub-inputs for soal 1,2,3,5,6 ── */}
                    {subParts ? (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#663362", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Jawaban Akhir</label>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          {(() => {
                            const subValues = parseSubAnswers(answers[i].jawaban_akhir, subParts);
                            const restrictInteger = INTEGER_ONLY_SUB_PARTS.has(qNum);
                            return subParts.map((letter, si) => (
                              <div key={letter} style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 100 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#2C2C2A", whiteSpace: "nowrap" }}>{letter})</span>
                                {restrictInteger ? (
                                  <NumericAnswerInput
                                    value={subValues[si]}
                                    onChange={(val) => {
                                      const newSubValues = [...subValues];
                                      newSubValues[si] = val;
                                      onUpdateAnswer(i, "jawaban_akhir", serializeSubAnswers(subParts, newSubValues));
                                    }}
                                    placeholder="Angka"
                                    className="flex-1 min-w-0 px-2.5 py-2 rounded-lg text-sm text-[#2C2C2A] border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all"
                                    style={{ fontFamily: "inherit" }}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={subValues[si]}
                                    onChange={(e) => {
                                      const newSubValues = [...subValues];
                                      newSubValues[si] = e.target.value;
                                      onUpdateAnswer(i, "jawaban_akhir", serializeSubAnswers(subParts, newSubValues));
                                    }}
                                    placeholder="..."
                                    className="flex-1 min-w-0 px-2.5 py-2 rounded-lg text-sm text-[#2C2C2A] border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all"
                                    style={{ fontFamily: "inherit" }}
                                  />
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    ) : (
                      /* Standard single Jawaban Akhir input */
                      <div>
                        <label htmlFor={`jawaban-akhir-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#663362", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Jawaban Akhir</label>
                        <input id={`jawaban-akhir-${i}`} ref={(el) => { const prev = pasteTargetRefs.current.get(i); registerPasteForQuestion(i, prev?.cara ?? null, el); }} type="text" value={answers[i].jawaban_akhir} onChange={(e) => onUpdateAnswer(i, "jawaban_akhir", e.target.value)} placeholder="Tulis jawaban akhirmu di sini..." className="w-full px-3 py-2.5 rounded-lg text-sm text-[#2C2C2A] border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all" style={{ fontFamily: "inherit" }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1.5px solid #e2ede2",
        }}
      >
        {submitError && (
          <div
            style={{
              backgroundColor: "#fff5f5",
              borderRadius: 10,
              border: "1.5px solid #fecaca",
              padding: "12px 16px",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>
              {submitError}
            </p>
            <button
              onClick={onDismissSubmitError}
              style={{
                marginTop: 10,
                padding: "8px 20px",
                borderRadius: 8,
                border: "1.5px solid #fecaca",
                backgroundColor: "#fff",
                fontSize: 13,
                fontWeight: 600,
                color: "#b91c1c",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!showConfirm ? (
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 13,
                color: "#6b8f6d",
                marginBottom: 12,
              }}
            >
              Sudah yakin dengan jawabanmu? Setelah submit, jawaban akan
              langsung dievaluasi.
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 32px",
                backgroundColor: isSubmitting ? "#9aada0" : "#346739",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {isSubmitting ? "Mengevaluasi..." : "Submit Jawaban"}
            </button>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              backgroundColor: "#fff5f5",
              borderRadius: 12,
              border: "1.5px solid #fecaca",
              padding: "20px 24px",
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#b91c1c",
                margin: "0 0 6px",
              }}
            >
              Konfirmasi Submit
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                margin: "0 0 16px",
              }}
            >
              Kamu telah menjawab{" "}
              <strong style={{ color: "#1a3d1c" }}>{answeredCount}</strong>{" "}
              dari <strong>{answers.length}</strong> soal. Setelah di-submit,
              jawaban tidak dapat diubah.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "1.5px solid #d1d5db",
                  backgroundColor: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#6b7280",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                Batal
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#b91c1c",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "Mengirim..." : "Ya, Submit Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Soal 4 Table Component ───────────────────────────────────────────────────

function Soal4Table({
  jawabanAkhir,
  onUpdate,
}: {
  jawabanAkhir: string;
  onUpdate: (newVal: string) => void;
}) {
  // Local state is the single source of truth for the UI. The parent string is
  // only WRITTEN during editing (never read back per keystroke), so whatever
  // the student types is shown exactly as typed — no delimiter round-trip that
  // can leak "|" characters, multiply them, or make the cursor jump.
  const [rows, setRows] = useState<{ benarSalah: string; alasan: string }[]>(() =>
    parseSoal4Table(jawabanAkhir)
  );
  const lastPushedRef = useRef(jawabanAkhir);

  // Re-sync only when the parent value changed from OUTSIDE this component
  // (draft restore / answer reset), not from our own pushes.
  useEffect(() => {
    if (jawabanAkhir !== lastPushedRef.current) {
      lastPushedRef.current = jawabanAkhir;
      setRows(parseSoal4Table(jawabanAkhir));
    }
  }, [jawabanAkhir]);

  function updateRow(idx: number, field: "benarSalah" | "alasan", value: string) {
    const newRows = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    const serialized = serializeSoal4Table(newRows);
    lastPushedRef.current = serialized;
    setRows(newRows);
    onUpdate(serialized);
  }

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#663362", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Jawaban Per Pernyataan</label>
      <div style={{ border: "1.5px solid #e2ede2", borderRadius: 10, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", backgroundColor: "#f8fdf8", borderBottom: "1.5px solid #e2ede2", fontWeight: 700, fontSize: 11, color: "#346739", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <div style={{ width: 36, padding: "8px 10px", textAlign: "center", flexShrink: 0 }}>No</div>
          <div style={{ flex: 2, padding: "8px 10px", minWidth: 0 }}>Pernyataan</div>
          <div style={{ width: 90, padding: "8px 10px", textAlign: "center", flexShrink: 0 }}>B/S</div>
          <div style={{ flex: 4, padding: "8px 10px", minWidth: 0 }}>Alasan</div>
        </div>
        {/* Rows */}
        {SOAL4_ROWS.map((row, idx) => (
          <div key={row.key} style={{ display: "flex", borderBottom: idx < SOAL4_ROWS.length - 1 ? "1px solid #e2ede2" : "none", alignItems: "stretch" }}>
            <div style={{ width: 36, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#2C2C2A", flexShrink: 0, borderRight: "1px solid #f0f4f0" }}>{row.key}</div>
            <div style={{ flex: 2, padding: "8px 10px", display: "flex", alignItems: "center", fontSize: 12, color: "#2C2C2A", minWidth: 0, borderRight: "1px solid #f0f4f0", lineHeight: 1.4 }}>{row.statement}</div>
            <div style={{ width: 90, padding: "8px 6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRight: "1px solid #f0f4f0" }}>
              <select
                value={rows[idx]?.benarSalah ?? ""}
                onChange={(e) => updateRow(idx, "benarSalah", e.target.value)}
                style={{ width: "100%", padding: "5px 4px", borderRadius: 6, border: "1.5px solid #e2ede2", fontSize: 12, color: "#2C2C2A", backgroundColor: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", textAlign: "center" }}
              >
                <option value="">—</option>
                <option value="✅">✅ Benar</option>
                <option value="❌">❌ Salah</option>
              </select>
            </div>
            <div style={{ flex: 4, padding: "6px 8px", display: "flex", alignItems: "center", minWidth: 0 }}>
              <textarea
                value={rows[idx]?.alasan ?? ""}
                onChange={(e) => updateRow(idx, "alasan", e.target.value.replace(/\r?\n/g, " "))}
                placeholder="Tulis alasan..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg text-sm text-[#2C2C2A] resize-y border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all"
                style={{ fontFamily: "inherit" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Submitted Screen ─────────────────────────────────────────────────────────

function SubmittedScreen({ answers, remainingQuestions }: { answers: AnswerPair[]; remainingQuestions: number[] }) {
  const filteredSoal = remainingQuestions
    .map((qn) => SOAL_DATA.find((s) => s.question_number === qn))
    .filter((s): s is typeof SOAL_DATA[number] => s !== undefined);
  const answeredCount = answers.filter(isAnswered).length;
  const allAnswered = answeredCount === answers.length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 48px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#DBFFD5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#346739"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1a3d1c",
            margin: "0 0 8px",
          }}
        >
          Jawaban Terkirim!
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#5a7d5c",
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          {allAnswered
            ? "Semua soal telah kamu jawab. Terima kasih telah menyelesaikan latihan ini!"
            : `Kamu menjawab ${answeredCount} dari ${answers.length} soal. Jawaban telah dikirimkan.`}
        </p>

        <div
          style={{
            marginTop: 20,
            backgroundColor: "#f0faf0",
            borderRadius: 10,
            border: "1px solid #c3e6c3",
            padding: "14px 18px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#346739"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a3d1c",
                  margin: "0 0 4px",
                }}
              >
                Jawaban sudah tersimpan
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#5a7d5c",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Jawabanmu sedang dilakukan proses koreksi. Kembali lagi ke menu
                latihan setelah beberapa jam untuk mendapatkan nilai hasil
                latihan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#346739",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          margin: "0 0 16px",
        }}
      >
        Ringkasan Jawaban
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          pointerEvents: "none",
        }}
      >
        {filteredSoal.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          return (
            <div key={soal.question_number}>
              {answers[i].cara_hitung.trim() && (
                <div
                  style={{
                    backgroundColor: "#f8fdf8",
                    borderRadius: "8px 8px 0 0",
                    border: "1px solid #d4e8d4",
                    borderBottom: "none",
                    padding: "10px 16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#346739",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      margin: "0 0 4px",
                    }}
                  >
                    Cara Hitung
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#3b5e3d",
                      margin: 0,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {answers[i].cara_hitung}
                  </p>
                </div>
              )}
              <div
                style={
                  answers[i].cara_hitung.trim()
                    ? { borderRadius: "0 0 12px 12px", overflow: "hidden" }
                    : {}
                }
              >
                <SoalKepahaman
                  question_number={soal.question_number}
                  level={soal.level}
                  question={soal.question}
                  answer={soal.answer}
                  hideCheckButton={true}
                  value={answered ? answers[i].jawaban_akhir || "—" : "—"}
                  onChange={() => {}}
                  checked={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link
          href="/siswa/ulangan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            backgroundColor: "#346739",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Kembali ke Daftar Latihan
        </Link>
      </div>
    </div>
  );
}

// ── Results Screen ───────────────────────────────────────────────────────────

interface ResultsScreenProps {
  evaluationResult: EvaluationResult | null;
  answers: AnswerPair[];
  evalError: string | null;
  onRetry: () => void;
  remainingQuestions: number[];
}

function ResultsScreen({
  evaluationResult,
  answers,
  evalError,
  onRetry,
  remainingQuestions: _remainingQuestions,
}: ResultsScreenProps) {
  if (evalError) {
    return (
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "60px 24px 48px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#fff5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b91c1c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#b91c1c",
            margin: "0 0 8px",
          }}
        >
          Evaluasi Gagal
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
          {evalError}
        </p>
        <button
          onClick={onRetry}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "1.5px solid #d4e8d4",
            backgroundColor: "#fff",
            fontSize: 14,
            fontWeight: 600,
            color: "#346739",
            cursor: "pointer",
          }}
        >
          Lihat Ringkasan Jawaban
        </button>
      </div>
    );
  }

  if (!evaluationResult) return null;

  const { total_score, per_question, ai_feedback } = evaluationResult;
  const scoreColor =
    total_score >= 75
      ? "#346739"
      : total_score >= 50
        ? "#d97706"
        : "#b91c1c";
  const scoreBg =
    total_score >= 75
      ? "#DBFFD5"
      : total_score >= 50
        ? "#FFF3CD"
        : "#fff5f5";
  const scoreBorder =
    total_score >= 75
      ? "#c3e6c3"
      : total_score >= 50
        ? "#fde68a"
        : "#fecaca";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 48px" }}>
      {/* Score Card */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: scoreBg,
            border: `3px solid ${scoreBorder}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {total_score}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: scoreColor,
              opacity: 0.7,
            }}
          >
            dari 100
          </span>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1a3d1c",
            margin: "0 0 6px",
          }}
        >
          {total_score >= 90
            ? "Luar Biasa! 🎉"
            : total_score >= 75
              ? "Kerja Bagus! 👏"
              : total_score >= 50
                ? "Lumayan! 💪"
                : "Tetap Semangat! 📚"}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5a7d5c",
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {ai_feedback}
        </p>
      </div>

      {/* Per-Question Results */}
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#346739",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 14px",
        }}
      >
        Detail Per Soal
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {per_question.map((pq) => {
          const soalRef = SOAL_DATA.find(
            (s) => s.question_number === pq.question_number
          );
          const answerIdx = _remainingQuestions.indexOf(pq.question_number);
          const userAnswer = answerIdx >= 0 ? answers[answerIdx] : null;
          const isUnanswered = pq.mistake_category === "tidak_diisi" || pq.mistake_category === "tidak_memadai";
          const hasMistake =
            pq.mistake_category !== null &&
            pq.mistake_category !== "tidak_diisi" &&
            pq.mistake_category !== "tidak_memadai";
          const itemColor = isUnanswered
            ? "#d97706"
            : hasMistake
              ? "#b91c1c"
              : "#346739";
          const itemBg = isUnanswered
            ? "#fff5f0"
            : hasMistake
              ? "#fff5f5"
              : "#f0faf0";
          const itemBorder = isUnanswered
            ? "#fde68a"
            : hasMistake
              ? "#fecaca"
              : "#c3e6c3";

          return (
            <div
              key={pq.question_number}
              style={{
                backgroundColor: itemBg,
                borderRadius: 12,
                border: `1.5px solid ${itemBorder}`,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: itemColor,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {pq.question_number}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: itemColor,
                    }}
                  >
                    Skor: {pq.total_score.toFixed(1)}/10
                  </span>
                </div>
                {soalRef && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      backgroundColor: LEVEL_META[soalRef.level].bg,
                      color: LEVEL_META[soalRef.level].text,
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {LEVEL_META[soalRef.level].label}
                  </span>
                )}
              </div>

              {/* User's answer summary */}
              {userAnswer && (
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 12,
                    color: "#5a7d5c",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Jawabanmu: </span>
                  {userAnswer.jawaban_akhir || (pq.mistake_category === "tidak_memadai" ? "(terlalu singkat)" : "(tidak diisi)")}
                </div>
              )}

              {/* AI Feedback */}
              <p
                style={{
                  fontSize: 13,
                  color: "#3b5e3d",
                  margin: "0 0 8px",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                💬 {pq.feedback}
              </p>

              {/* Mistake / Unanswered info */}
              {isUnanswered && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#92400e",
                    backgroundColor: "#fffbeb",
                    borderRadius: 6,
                    padding: "6px 10px",
                  }}
                >
                  ⚠️ <strong>{pq.mistake_category === "tidak_memadai" ? "Jawaban terlalu singkat" : "Tidak diisi"}</strong> — {pq.mistake_category === "tidak_memadai" ? "jawaban tidak cukup untuk dievaluasi, " : "soal ini dikosongkan, "}skor
                  otomatis 0.
                </div>
              )}
              {hasMistake && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#b91c1c",
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    padding: "6px 10px",
                  }}
                >
                  <strong>Kesalahan:</strong>{" "}
                  {pq.mistake_category === "konsep"
                    ? "Konsep"
                    : pq.mistake_category === "formula"
                      ? "Formula/Rumus"
                      : pq.mistake_category === "perhitungan"
                        ? "Perhitungan"
                        : "Lainnya"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          textAlign: "center",
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <Link
          href="/siswa/ulangan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            backgroundColor: "#346739",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Kembali ke Daftar Latihan
        </Link>
      </div>
    </div>
  );
}
