"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  LEVEL_META,
  SOAL_DATA,
  SoalKepahaman,
} from "@/components/materi/sections/kaidah-pencacahan/contoh-soal-perkalian/latihan";
import { useAssesmentLock } from "@/components/dashboard/assesment-lock-context";
import { useDraftSaver } from "@/hooks/useDraftSaver";
import type { AnswerPair as DraftAnswerPair } from "@/hooks/useDraftSaver";
import { useIntegrityMonitor } from "@/hooks/useIntegrityMonitor";
import type { UseIntegrityMonitorReturn } from "@/hooks/useIntegrityMonitor";
import { getDeviceType } from "@/lib/device";
import type { DeviceType } from "@/lib/device";
import IntegrityToast from "@/components/activity/IntegrityToast";
import IntegrityBlockingModal from "@/components/activity/IntegrityBlockingModal";

// ── Config ─────────────────────────────────────────────────────────────────────────────────
const DURASI_DETIK = 2 * 60; // 2 menit (testing)
const COOLDOWN_DETIK = 5 * 60; // 5 menit cooldown antar attempt

const PETUNJUK = [
  "Baca setiap soal dengan teliti sebelum menjawab.",
  'Tuliskan langkah-langkah cara perhitungan secara lengkap pada kolom "Cara Hitung".',
  'Tuliskan hasil akhir jawaban pada kolom "Jawaban Akhir".',
  "Pastikan semua soal telah dijawab sebelum menekan tombol Submit.",
  "Asesmen ini dapat dikerjakan lebih dari satu kali dengan jeda 5 menit",
];

const BOLEH = ["Menggunakan coretan / kertas buram", "Menghitung secara manual"];
const TIDAK_BOLEH = [
  "Membuka tab atau aplikasi lain",
  "Bekerja sama dengan teman",
  "Menggunakan kalkulator",
];

// ── Types ─────────────────────────────────────────────────────────────────────────────────
type Phase = "intro" | "active" | "submitted" | "evaluating" | "results";
type AnswerPair = { cara_hitung: string; jawaban_akhir: string };

/** Evaluation result per question from the API */
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

/** Evaluation result from the evaluate API */
interface EvaluationResult {
  total_score: number;
  per_question: PerQuestionResult[];
  ai_feedback: string;
}

/** Response shape from GET /api/asesmen-formatif/check-access */
interface AccessCheckResponse {
  allowed: boolean;
  missingSections: Array<{ conceptId: string; section: string }>;
  summary: { totalRequired: number; completed: number; missing: number };
}

/** Human-readable labels for sections, used in the locked screen. */
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
  kaidah_penjumlahan: "Kaidah Penjumlahan",
  kaidah_perkalian: "Kaidah Perkalian",
};

// ── Helpers ───────────────────────────────────────────────────────────────────────────────
function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
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

// ── Page ────────────────────────────────────────────────────────────────────────────────────
export default function AsesmenKaidahPencacahanPage() {
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

  // ── Integrity monitoring state ──────────────────────────────────────────────
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [attemptError, setAttemptError] = useState<string | null>(null);

  // ── Evaluation state ────────────────────────────────────────────────────────
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // ── Cooldown state ──────────────────────────────────────────────────────────
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

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

  // ── Access check on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const res = await fetch(
          "/api/asesmen-formatif/check-access?module_slug=kaidah-pencacahan"
        );
        if (cancelled) return;

        if (!res.ok) {
          // If the endpoint fails, default to denying access for safety.
          setAccessAllowed(false);
          setMissingSections([]);
          return;
        }

        const data: AccessCheckResponse = await res.json();
        if (cancelled) return;

        setAccessAllowed(data.allowed);
        setMissingSections(data.missingSections);
        setAccessSummary(data.summary);
      } catch {
        if (!cancelled) {
          // Network error -- deny access for safety.
          setAccessAllowed(false);
          setMissingSections([]);
        }
      }
    }
    checkAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Draft auto-save hook ──────────────────────────────────────────────────────
  const { isRestoring, saveAllDrafts } = useDraftSaver({
    answers,
    moduleSlug: "kaidah-pencacahan",
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
          // Trigger submit via ref (auto-submit on timer expiry)
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
    // Detect device type ONCE at attempt start
    const dt = getDeviceType();
    setDeviceType(dt);

    try {
      const res = await fetch("/api/asesmen-formatif/start-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_slug: "kaidah-pencacahan",
          device_type: dt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));

        // Handle cooldown (429)
        if (res.status === 429 && err.cooldown_remaining_seconds) {
          setCooldownSeconds(err.cooldown_remaining_seconds);
          setAttemptError(err.message ?? "Silakan tunggu sebelum memulai asesmen kembali.");
          return;
        }

        setAttemptError(
          err.error ?? "Gagal memulai asesmen. Silakan coba lagi."
        );
        return;
      }

      const data = await res.json();
      setAttemptId(data.attempt_id);
      setCooldownSeconds(null); // Clear cooldown on success

      // Request fullscreen — graceful fallback if denied
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Browser may deny fullscreen without user gesture or in iframe.
        // This is non-blocking — the assessment continues regardless.
      }

      setPhase("active");
    } catch (e) {
      console.error("[handleStart] Failed to create attempt:", e);
      setAttemptError(
        "Gagal memulai asesmen. Periksa koneksi internet dan coba lagi."
      );
    }
  }

  async function handleSubmit() {
    // Prevent double-submit
    if (hasSubmittedRef.current || isSubmitting) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Save drafts one last time before submitting
      await saveAllDrafts();

      // Build the answers payload
      const answersPayload = answers.map((a, i) => ({
        question_number: i + 1,
        cara_mengerjakan: a.cara_hitung,
        jawaban_akhir: a.jawaban_akhir,
      }));

      const res = await fetch("/api/asesmen-formatif/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_slug: "kaidah-pencacahan",
          concept_id: "kaidah-pencacahan",
          answers: answersPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Gagal menyimpan jawaban");
      }

      const submissionData = await res.json();

      // Update attempt status to 'submitted' (or 'timed_out' if triggered by timer)
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
          // Non-critical — attempt status update failure should not block UX
        });
      }

      // ── Trigger AI Evaluation ───────────────────────────────────────────
      setPhase("evaluating");
      setEvalError(null);

      try {
        const evalRes = await fetch("/api/asesmen-formatif/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_id: submissionData.submission_id,
            module_slug: "kaidah-pencacahan",
          }),
        });

        if (!evalRes.ok) {
          const evalErr = await evalRes.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(evalErr.error ?? "Gagal mengevaluasi jawaban");
        }

        const evalData: EvaluationResult = await evalRes.json();
        setEvaluationResult(evalData);
        setPhase("results");
      } catch (evalErr: unknown) {
        const message = evalErr instanceof Error ? evalErr.message : "Gagal mengevaluasi jawaban";
        setEvalError(message);
        setPhase("submitted"); // Fallback to submitted screen
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan jawaban. Silakan coba lagi.";
      setSubmitError(message);
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  // Keep ref in sync so timer auto-submit can call the latest handleSubmit
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // ── Cooldown countdown timer ──────────────────────────────────────────────
  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setAttemptError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  function updateAnswer(idx: number, field: keyof AnswerPair, value: string) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  }

  // ── Loading: access check in progress ────────────────────────────────────────
  if (accessAllowed === null) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "#6b8f6d" }}>Memeriksa akses asesmen...</p>
      </div>
    );
  }

  // ── Access denied: show locked screen with missing sections ──────────────────
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
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#6b8f6d" }}>Memulihkan jawaban yang tersimpan...</p>
        </div>
      );
    }
    return (
      <>
        {attemptError && (
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 24px 0" }}>
            <div style={{ backgroundColor: "#fff5f5", borderRadius: 10, border: "1.5px solid #fecaca", padding: "12px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>{attemptError}</p>
              {cooldownSeconds !== null && cooldownSeconds > 0 && (
                <p style={{ fontSize: 12, color: "#9a7b5c", margin: "6px 0 0" }}>
                  ⏳ {formatTime(cooldownSeconds)} hingga dapat memulai kembali
                </p>
              )}
            </div>
          </div>
        )}
        <IntroScreen onStart={handleStart} isOnCooldown={cooldownSeconds !== null && cooldownSeconds > 0} cooldownSeconds={cooldownSeconds} />
      </>
    );
  }
  if (phase === "submitted") return <SubmittedScreen answers={answers} />;
  if (phase === "evaluating") return <EvaluatingScreen />;
  if (phase === "results") return <ResultsScreen evaluationResult={evaluationResult} answers={answers} evalError={evalError} onRetry={() => setPhase("submitted")} />;
  return (
    <ActiveScreen
      answers={answers}
      timeLeft={timeLeft}
      onUpdateAnswer={updateAnswer}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      onDismissSubmitError={() => { setSubmitError(null); hasSubmittedRef.current = false; }}
      attemptId={attemptId!}
      deviceType={deviceType!}
    />
  );
}

// ── Locked Screen ────────────────────────────────────────────────────────────────────────

interface LockedScreenProps {
  missingSections: Array<{ conceptId: string; section: string }>;
  summary: { totalRequired: number; completed: number; missing: number } | null;
}

function LockedScreen({ missingSections, summary }: LockedScreenProps) {
  // Group missing sections by concept_id for a cleaner display.
  const grouped = new Map<string, string[]>();
  for (const ms of missingSections) {
    const list = grouped.get(ms.conceptId);
    if (list) {
      list.push(ms.section);
    } else {
      grouped.set(ms.conceptId, [ms.section]);
    }
  }

  // If the API response did not include section details (e.g. network error),
  // show a generic message instead of an empty list.
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
        <p style={{ fontSize: 14, color: "#9a7b5c", margin: 0, lineHeight: 1.7 }}>
          Kamu harus menyelesaikan seluruh section pada materi Kaidah
          Penjumlahan dan Kaidah Perkalian sebelum dapat mengerjakan asesmen
          formatif ini.
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
            <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>
              Progress Materi
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>
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
          href="/siswa/materi/kaidah-pencacahan"
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
          memulai asesmen.
        </p>
      </div>
    </div>
  );
}

// ── Intro Screen ────────────────────────────────────────────────────────────────────────────
function IntroScreen({ onStart, isOnCooldown, cooldownSeconds }: { onStart: () => void; isOnCooldown?: boolean; cooldownSeconds?: number | null }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#346739", opacity: 0.7, margin: "0 0 6px" }}>
        Asesmen Formatif
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a3d1c", margin: "0 0 28px" }}>
        Kaidah Pencacahan
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "⏱", label: "Durasi", value: "120 Menit", color: "#346739", bg: "#DBFFD5" },
          { icon: "📄", label: "Jumlah Soal", value: "10 Soal", color: "#346739", bg: "#DBFFD5" },
          { icon: "✍️", label: "Jenis", value: "Uraian", color: "#663362", bg: "#f3e8f2" },
          { icon: "🔒", label: "Pengerjaan", value: "Dapat diulang", color: "#663362", bg: "#f3e8f2" },
        ].map((info) => (
          <div key={info.label} style={{ backgroundColor: info.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{info.icon}</div>
            <div style={{ fontSize: 10, color: info.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>{info.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: info.color }}>{info.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#f8fdf8", borderRadius: 12, border: "1px solid #d4e8d4", padding: "18px 20px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#346739", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Petunjuk Pengerjaan
        </h3>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {PETUNJUK.map((p, i) => (
            <li key={i} style={{ fontSize: 14, color: "#3b5e3d", lineHeight: 1.7, marginBottom: i < PETUNJUK.length - 1 ? 6 : 0 }}>{p}</li>
          ))}
        </ol>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        <RuleBox title="Yang Diperbolehkan" items={BOLEH} type="allowed" />
        <RuleBox title="Yang Tidak Diperbolehkan" items={TIDAK_BOLEH} type="forbidden" />
      </div>

      {/* Cooldown notice */}
      {isOnCooldown && cooldownSeconds != null && cooldownSeconds > 0 && (
        <div style={{ textAlign: "center", marginBottom: 16, backgroundColor: "#fff5f0", borderRadius: 10, border: "1.5px solid #fde68a", padding: "12px 16px" }}>
          <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
            ⏳ Silakan tunggu <strong>{formatTime(cooldownSeconds)}</strong> sebelum dapat memulai asesmen kembali.
          </p>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <button
          onClick={onStart}
          disabled={isOnCooldown}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 40px",
            backgroundColor: isOnCooldown ? "#9aada0" : "#346739", color: "#fff",
            borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none",
            cursor: isOnCooldown ? "not-allowed" : "pointer",
            opacity: isOnCooldown ? 0.7 : 1,
          }}
        >
          Siap, Mulai Asesmen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <p style={{ marginTop: 10, fontSize: 12, color: "#9aada0" }}>
          {isOnCooldown ? "Timer cooldown sedang berjalan..." : "Timer akan mulai berjalan setelah kamu klik tombol di atas."}
        </p>
      </div>
    </div>
  );
}

function RuleBox({ title, items, type }: { title: string; items: string[]; type: "allowed" | "forbidden" }) {
  const ok = type === "allowed";
  const color = ok ? "#346739" : "#b91c1c";
  const bg = ok ? "#f0faf0" : "#fff5f5";
  const border = ok ? "#c3e6c3" : "#fecaca";
  return (
    <div style={{ backgroundColor: bg, borderRadius: 12, border: `1.5px solid ${border}`, padding: "14px 16px" }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color, display: "flex", gap: 8, marginBottom: i < items.length - 1 ? 8 : 0, alignItems: "flex-start" }}>
            <span style={{ fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{ok ? "✓" : "✕"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Active Screen ─────────────────────────────────────────────────────────────────────────────
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
}: ActiveScreenProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const color = timerColor(timeLeft);
  const pct = (timeLeft / DURASI_DETIK) * 100;
  const answeredCount = answers.filter(isAnswered).length;

  // ── Integrity monitor ─────────────────────────────────────────────────────
  const integrity = useIntegrityMonitor({
    attemptId,
    moduleSlug: "kaidah-pencacahan",
    deviceType,
  });

  // Ref callback to register paste targets for each question's textarea/input
  const pasteTargetRefs = useRef<Map<number, { cara: HTMLTextAreaElement | null; jawaban: HTMLInputElement | null }>>(new Map());

  // Register paste targets callback
  const registerPasteForQuestion = useCallback(
    (idx: number, caraEl: HTMLTextAreaElement | null, jawabanEl: HTMLInputElement | null) => {
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
          onDismiss={() => {
            // Toast auto-dismisses; this is the cleanup callback after animation
          }}
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
      <div style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#fff", borderBottom: "1.5px solid #e2ede2", paddingTop: 10, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#346739", opacity: 0.7, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Asesmen Formatif — Kaidah Pencacahan
            </p>
            <p style={{ fontSize: 12, color: "#6b8f6d", margin: "2px 0 0" }}>{answeredCount}/{SOAL_DATA.length} soal terjawab</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, backgroundColor: color + "18", borderRadius: 10, padding: "8px 14px", border: `1.5px solid ${color}30` }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 20, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div style={{ height: 3, backgroundColor: "#e2ede2", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", backgroundColor: color, borderRadius: 99, width: `${pct}%`, transition: "width 1s linear, background-color 0.5s" }} />
        </div>
      </div>

      {/* Question Navigator */}
      <div style={{ marginBottom: 24, backgroundColor: "#f8fdf8", borderRadius: 12, border: "1px solid #e2ede2", padding: "14px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Navigasi Soal</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SOAL_DATA.map((soal, i) => {
            const answered = isAnswered(answers[i]);
            return (
              <a key={soal.question_number} href={`#soal-${i + 1}`} title={LEVEL_META[soal.level].label}
                style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, textDecoration: "none", backgroundColor: answered ? "#346739" : "#fff", color: answered ? "#fff" : "#346739", border: `2px solid ${answered ? "#346739" : "#d4e8d4"}`, transition: "all 0.15s ease" }}>
                {i + 1}
              </a>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {Object.entries(LEVEL_META).map(([key, meta]) => (
            <span key={key} style={{ fontSize: 11, fontWeight: 600, backgroundColor: meta.bg, color: meta.text, padding: "2px 8px", borderRadius: 99 }}>{meta.label}</span>
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
        {SOAL_DATA.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          const lm = LEVEL_META[soal.level];
          return (
            <div key={soal.question_number} id={`soal-${i + 1}`}
              style={{ backgroundColor: "#fff", borderRadius: 14, border: `2px solid ${answered ? "#346739" : "#e2ede2"}`, overflow: "hidden", transition: "border-color 0.2s ease" }}>
              <div style={{ height: 4, backgroundColor: answered ? "#346739" : "#e2ede2", transition: "background-color 0.2s ease" }} />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: "#346739", flexShrink: 0 }}>
                    {soal.question_number}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: lm.bg, color: lm.text, padding: "3px 10px", borderRadius: 99 }}>{lm.label}</span>
                  {answered && <span style={{ fontSize: 11, color: "#346739", fontWeight: 700, marginLeft: "auto" }}>✓ Terjawab</span>}
                </div>
                <p style={{ fontSize: 15, color: "#2C2C2A", lineHeight: 1.75, margin: "0 0 18px", fontWeight: 500 }}>{soal.question}</p>
                <div style={{ marginBottom: 14 }}>
                  <label htmlFor={`cara-hitung-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Cara Hitung</label>
                  <textarea
                    id={`cara-hitung-${i}`}
                    ref={(el) => {
                      const prev = pasteTargetRefs.current.get(i);
                      registerPasteForQuestion(i, el, prev?.jawaban ?? null);
                    }}
                    value={answers[i].cara_hitung}
                    onChange={(e) => onUpdateAnswer(i, "cara_hitung", e.target.value)}
                    placeholder="Tuliskan langkah-langkah perhitunganmu di sini..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed text-[#2C2C2A] resize-y border border-[#d4e8d4] bg-[#fafffe] placeholder:text-[#b0c4b1] focus:outline-none focus:ring-2 focus:ring-[#346739]/30 focus:border-[#346739] transition-all"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label htmlFor={`jawaban-akhir-${i}`} style={{ fontSize: 12, fontWeight: 700, color: "#663362", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Jawaban Akhir</label>
                  <input
                    id={`jawaban-akhir-${i}`}
                    ref={(el) => {
                      const prev = pasteTargetRefs.current.get(i);
                      registerPasteForQuestion(i, prev?.cara ?? null, el);
                    }}
                    type="text"
                    value={answers[i].jawaban_akhir}
                    onChange={(e) => onUpdateAnswer(i, "jawaban_akhir", e.target.value)}
                    placeholder="Tulis jawaban akhirmu di sini..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[#2C2C2A] border border-[#e8d4e8] bg-[#fdf8fd] placeholder:text-[#c4a8c2] focus:outline-none focus:ring-2 focus:ring-[#663362]/25 focus:border-[#663362] transition-all"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1.5px solid #e2ede2" }}>
        {submitError && (
          <div style={{ backgroundColor: "#fff5f5", borderRadius: 10, border: "1.5px solid #fecaca", padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>{submitError}</p>
            <button
              onClick={onDismissSubmitError}
              style={{ marginTop: 10, padding: "8px 20px", borderRadius: 8, border: "1.5px solid #fecaca", backgroundColor: "#fff", fontSize: 13, fontWeight: 600, color: "#b91c1c", cursor: "pointer" }}
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!showConfirm ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#6b8f6d", marginBottom: 12 }}>Sudah yakin dengan jawabanmu? Setelah submit, jawaban akan langsung dievaluasi.</p>
            <button onClick={() => setShowConfirm(true)} disabled={isSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", backgroundColor: isSubmitting ? "#9aada0" : "#346739", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {isSubmitting ? "Mengevaluasi..." : "Submit Jawaban"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", backgroundColor: "#fff5f5", borderRadius: 12, border: "1.5px solid #fecaca", padding: "20px 24px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#b91c1c", margin: "0 0 6px" }}>Konfirmasi Submit</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
              Kamu telah menjawab <strong style={{ color: "#1a3d1c" }}>{answeredCount}</strong> dari <strong>{SOAL_DATA.length}</strong> soal. Setelah di-submit, jawaban tidak dapat diubah.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setShowConfirm(false)} disabled={isSubmitting} style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #d1d5db", backgroundColor: "#fff", fontSize: 14, fontWeight: 600, color: "#6b7280", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}>Batal</button>
              <button onClick={onSubmit} disabled={isSubmitting} style={{ padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "#b91c1c", fontSize: 14, fontWeight: 700, color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Mengirim..." : "Ya, Submit Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Submitted Screen ────────────────────────────────────────────────────────────────────────
function SubmittedScreen({ answers }: { answers: AnswerPair[] }) {
  const answeredCount = answers.filter(isAnswered).length;
  const allAnswered = answeredCount === SOAL_DATA.length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 48px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#DBFFD5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a3d1c", margin: "0 0 8px" }}>Jawaban Terkirim!</h1>
        <p style={{ fontSize: 15, color: "#5a7d5c", margin: 0, lineHeight: 1.7 }}>
          {allAnswered ? "Semua soal telah kamu jawab. Terima kasih telah menyelesaikan asesmen ini!" : `Kamu menjawab ${answeredCount} dari ${SOAL_DATA.length} soal. Jawaban telah dikirimkan.`}
        </p>

        {/* Status: jawaban tersimpan & sedang dikoreksi */}
        <div style={{ marginTop: 20, backgroundColor: "#f0faf0", borderRadius: 10, border: "1px solid #c3e6c3", padding: "14px 18px", textAlign: "left" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1a3d1c", margin: "0 0 4px" }}>Jawaban sudah tersimpan</p>
              <p style={{ fontSize: 12, color: "#5a7d5c", margin: 0, lineHeight: 1.6 }}>
                Jawabanmu sedang dilakukan proses koreksi. Kembali lagi ke menu asesmen setelah beberapa jam untuk mendapatkan nilai hasil asesmen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>
        Ringkasan Jawaban
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, pointerEvents: "none" }}>
        {SOAL_DATA.map((soal, i) => {
          const answered = isAnswered(answers[i]);
          return (
            <div key={soal.question_number}>
              {answers[i].cara_hitung.trim() && (
                <div style={{ backgroundColor: "#f8fdf8", borderRadius: "8px 8px 0 0", border: "1px solid #d4e8d4", borderBottom: "none", padding: "10px 16px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Cara Hitung</p>
                  <p style={{ fontSize: 13, color: "#3b5e3d", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{answers[i].cara_hitung}</p>
                </div>
              )}
              <div style={answers[i].cara_hitung.trim() ? { borderRadius: "0 0 12px 12px", overflow: "hidden" } : {}}>
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
        <Link href="/siswa/ulangan" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", backgroundColor: "#346739", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Kembali ke Daftar Asesmen
        </Link>
      </div>
    </div>
  );
}

// ── Evaluating Screen ──────────────────────────────────────────────────────────────────────

function EvaluatingScreen() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 48px", textAlign: "center" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#f3e8f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", position: "relative" }}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#663362"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1.5s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a3d1c", margin: "0 0 10px" }}>
        Mengevaluasi Jawaban
      </h1>
      <p style={{ fontSize: 14, color: "#5a7d5c", margin: 0, lineHeight: 1.7 }}>
        Kombi sedang memeriksa jawabanmu menggunakan AI. Proses ini memakan waktu beberapa detik.
      </p>
      <div style={{ marginTop: 24, backgroundColor: "#f8fdf8", borderRadius: 10, border: "1px solid #d4e8d4", padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1a3d1c", margin: "0 0 4px" }}>AI Evaluation in progress</p>
            <p style={{ fontSize: 11, color: "#6b8f6d", margin: 0, lineHeight: 1.6 }}>
              Setiap jawaban dinilai berdasarkan rubrik: proses pengerjaan (identifikasi kondisi, pemilihan rumus, eksekusi perhitungan) dan jawaban akhir.
            </p>
          </div>
        </div>
      </div>
      <p style={{ marginTop: 20, fontSize: 12, color: "#9aada0" }}>Mohon jangan menutup halaman ini.</p>
    </div>
  );
}

// ── Results Screen ──────────────────────────────────────────────────────────────────────────

interface ResultsScreenProps {
  evaluationResult: EvaluationResult | null;
  answers: AnswerPair[];
  evalError: string | null;
  onRetry: () => void;
}

function ResultsScreen({ evaluationResult, answers, evalError, onRetry }: ResultsScreenProps) {
  if (evalError) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#b91c1c", margin: "0 0 8px" }}>Evaluasi Gagal</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>{evalError}</p>
        <button onClick={onRetry} style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #d4e8d4", backgroundColor: "#fff", fontSize: 14, fontWeight: 600, color: "#346739", cursor: "pointer" }}>
          Lihat Ringkasan Jawaban
        </button>
      </div>
    );
  }

  if (!evaluationResult) return null;

  const { total_score, per_question, ai_feedback } = evaluationResult;
  const scoreColor = total_score >= 75 ? "#346739" : total_score >= 50 ? "#d97706" : "#b91c1c";
  const scoreBg = total_score >= 75 ? "#DBFFD5" : total_score >= 50 ? "#FFF3CD" : "#fff5f5";
  const scoreBorder = total_score >= 75 ? "#c3e6c3" : total_score >= 50 ? "#fde68a" : "#fecaca";

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
          <span style={{ fontSize: 36, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{total_score}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: scoreColor, opacity: 0.7 }}>dari 100</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a3d1c", margin: "0 0 6px" }}>
          {total_score >= 90 ? "Luar Biasa! 🎉" : total_score >= 75 ? "Kerja Bagus! 👏" : total_score >= 50 ? "Lumayan! 💪" : "Tetap Semangat! 📚"}
        </h1>
        <p style={{ fontSize: 13, color: "#5a7d5c", margin: 0, lineHeight: 1.6, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          {ai_feedback}
        </p>
      </div>

      {/* Cooldown Notice */}
      <div style={{ marginBottom: 24, backgroundColor: "#fff5f0", borderRadius: 10, border: "1.5px solid #fde68a", padding: "12px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
          ⏳ Kamu dapat memulai asesmen kembali dalam <strong>5 menit</strong>. Gunakan waktu ini untuk mempelajari feedback dan memperbaiki pemahamanmu.
        </p>
      </div>

      {/* Per-Question Results */}
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#346739", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
        Detail Per Soal
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
        {per_question.map((pq) => {
          const soalRef = SOAL_DATA.find((s) => s.question_number === pq.question_number);
          const userAnswer = answers[pq.question_number - 1];
          const isUnanswered = pq.mistake_category === "tidak_diisi";
          const hasMistake = pq.mistake_category !== null && pq.mistake_category !== "tidak_diisi";
          const itemColor = isUnanswered ? "#d97706" : hasMistake ? "#b91c1c" : "#346739";
          const itemBg = isUnanswered ? "#fff5f0" : hasMistake ? "#fff5f5" : "#f0faf0";
          const itemBorder = isUnanswered ? "#fde68a" : hasMistake ? "#fecaca" : "#c3e6c3";

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
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: itemColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {pq.question_number}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: itemColor }}>
                    Skor: {pq.total_score.toFixed(1)}/10
                  </span>
                </div>
                {soalRef && (
                  <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: LEVEL_META[soalRef.level].bg, color: LEVEL_META[soalRef.level].text, padding: "2px 8px", borderRadius: 99 }}>
                    {LEVEL_META[soalRef.level].label}
                  </span>
                )}
              </div>

              {/* User's answer summary */}
              {userAnswer && (
                <div style={{ marginBottom: 8, fontSize: 12, color: "#5a7d5c", lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600 }}>Jawabanmu: </span>
                  {userAnswer.jawaban_akhir || "(tidak diisi)"}
                </div>
              )}

              {/* AI Feedback */}
              <p style={{ fontSize: 13, color: "#3b5e3d", margin: "0 0 8px", lineHeight: 1.6, fontStyle: "italic" }}>
                💬 {pq.feedback}
              </p>

              {/* Mistake / Unanswered info */}
              {isUnanswered && (
                <div style={{ fontSize: 11, color: "#92400e", backgroundColor: "#fffbeb", borderRadius: 6, padding: "6px 10px" }}>
                  ⚠️ <strong>Tidak diisi</strong> — soal ini dikosongkan, skor otomatis 0.
                </div>
              )}
              {hasMistake && (
                <div style={{ fontSize: 11, color: "#b91c1c", backgroundColor: "#fff", borderRadius: 6, padding: "6px 10px" }}>
                  <strong>Kesalahan:</strong> {pq.mistake_category === "konsep" ? "Konsep" : pq.mistake_category === "formula" ? "Formula/Rumus" : pq.mistake_category === "perhitungan" ? "Perhitungan" : "Lainnya"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
        <Link href="/siswa/ulangan" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", backgroundColor: "#346739", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Kembali ke Daftar Asesmen
        </Link>
      </div>
    </div>
  );
}
