"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GradingResult } from "@/lib/data/asesmen-diagnostik";

const AUTO_SAVE_DEBOUNCE_MS = 500;
const COOLDOWN_MINUTES = 10;

export interface DiagnosticStatus {
  status: "none" | "in_progress" | "passed" | "failed";
  lastScore: number | null;
  lastCorrectCount: number | null;
  lastTotalQuestions: number | null;
  lastQuestions: { number: number; correct: boolean }[] | null;
  lastSubmittedAt: string | null;
  cooldownEndsAt: string | null;
  cooldownRemainingSeconds: number | null;
}

export interface UseAsesmenDiagnostikReturn {
  /** Jawaban siswa: key "nomor-subIndex" → value */
  answers: Record<string, string>;
  /** Update jawaban untuk satu sub-soal */
  setAnswer: (questionNumber: number, subIndex: number, value: string) => void;
  /** Submit jawaban ke API grading. Opsional: override answers (untuk merge FormData). */
  submitAnswers: (answersOverride?: Record<string, string>) => Promise<GradingResult>;
  /** Sedang mengirim ke API */
  isSubmitting: boolean;
  /** Hasil grading terakhir (null sebelum submit) */
  lastResult: GradingResult | null;
  /** Reset semua jawaban & hasil, lalu mulai attempt baru */
  reset: () => void;
  /** Status auto-save terakhir — bisa dipakai untuk indikator UI */
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
  /** true saat draft sedang dimuat dari server saat pertama kali buka */
  isLoadingDraft: boolean;
  /** Status diagnostik keseluruhan (dari server) */
  diagnosticStatus: DiagnosticStatus | null;
  /** true jika sedang memuat status dari server */
  isLoadingStatus: boolean;
  /** Detik tersisa sebelum boleh retry (null = sudah boleh) */
  cooldownRemaining: number | null;
}

export function useAsesmenDiagnostik(): UseAsesmenDiagnostikReturn {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<GradingResult | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Refs: akses nilai terbaru di dalam callbacks tanpa re-render / stale closure
  const attemptIdRef = useRef<number | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-save: debounced, baca dari ref → tidak ada dependency ──────────
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      const id = attemptIdRef.current;
      if (!id) return;

      setAutoSaveStatus("saving");
      try {
        const res = await fetch("/api/asesmen-diagnostik/attempt", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt_id: id,
            draft_answers: answersRef.current,
          }),
        });
        setAutoSaveStatus(res.ok ? "saved" : "error");
      } catch {
        setAutoSaveStatus("error");
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, []);

  // ── Fetch diagnostic status dari server ──────────────────────────────────
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/asesmen-diagnostik/status");
      if (res.ok) {
        const status: DiagnosticStatus = await res.json();
        setDiagnosticStatus(status);

        // Jika sudah lulus, set lastResult dari data server
        if (status.status === "passed" && status.lastScore !== null) {
          setLastResult({
            correctCount: status.lastCorrectCount ?? 0,
            totalQuestions: status.lastTotalQuestions ?? 10,
            isPass: true,
            score: status.lastScore,
            questions: (status.lastQuestions ?? []).map((q) => ({
              number: q.number,
              correct: q.correct,
              details: [],
            })),
            feedback: null,
          });
        }

        // Jika gagal dan ada cooldown, set timer
        if (
          status.status === "failed" &&
          status.cooldownRemainingSeconds !== null &&
          status.cooldownRemainingSeconds > 0
        ) {
          setCooldownRemaining(status.cooldownRemainingSeconds);
        }
        // Jika gagal dan cooldown sudah habis, set null
        if (
          status.status === "failed" &&
          (status.cooldownRemainingSeconds === null ||
            status.cooldownRemainingSeconds <= 0)
        ) {
          setCooldownRemaining(null);
        }
      }
    } catch (err) {
      console.warn("[useAsesmenDiagnostik] failed to fetch status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // ── Cooldown countdown timer ─────────────────────────────────────────────
  const isCoolingDown = cooldownRemaining !== null;

  useEffect(() => {
    if (cooldownRemaining !== null && cooldownRemaining > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoolingDown]);

  // ── Init: GET attempt saat mount (buat baru / restore draft) ────────────
  const initAttempt = useCallback(async () => {
    setIsLoadingDraft(true);
    try {
      const res = await fetch("/api/asesmen-diagnostik/attempt");
      if (!res.ok) return;

      const data: { attempt_id: number; draft_answers: Record<string, string> } =
        await res.json();

      attemptIdRef.current = data.attempt_id;

      if (data.draft_answers && Object.keys(data.draft_answers).length > 0) {
        setAnswers(data.draft_answers);
        answersRef.current = data.draft_answers;
      }
    } catch (err) {
      console.warn("[useAsesmenDiagnostik] failed to init attempt:", err);
    } finally {
      setIsLoadingDraft(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    initAttempt();
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [fetchStatus, initAttempt]);

  // ── Set answer + jadwalkan auto-save ────────────────────────────────────
  const setAnswer = useCallback(
    (questionNumber: number, subIndex: number, value: string) => {
      const key = `${questionNumber}-${subIndex}`;
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        answersRef.current = next;
        return next;
      });
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const submitAnswers = useCallback(
    async (answersOverride?: Record<string, string>): Promise<GradingResult> => {
      setIsSubmitting(true);
      // Batalkan auto-save yang pending — submit sudah handle persist
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      const payload = answersOverride ?? answers;
      try {
        const res = await fetch("/api/asesmen-diagnostik", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: payload,
            attempt_id: attemptIdRef.current,
          }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const result: GradingResult = await res.json();
        setLastResult(result);
        setAutoSaveStatus("idle");

        // Update diagnostic status setelah submit
        setDiagnosticStatus((prev) => ({
          ...prev,
          status: result.isPass ? "passed" : "failed",
          lastScore: result.score,
          lastCorrectCount: result.correctCount,
          lastTotalQuestions: result.totalQuestions,
          lastQuestions: result.questions.map((q) => ({
            number: q.number,
            correct: q.correct,
          })),
          lastSubmittedAt: new Date().toISOString(),
          cooldownEndsAt: result.isPass
            ? null
            : new Date(
                Date.now() + COOLDOWN_MINUTES * 60 * 1000
              ).toISOString(),
          cooldownRemainingSeconds: result.isPass
            ? null
            : COOLDOWN_MINUTES * 60,
        }));

        // Set cooldown timer jika gagal
        if (!result.isPass) {
          setCooldownRemaining(COOLDOWN_MINUTES * 60);
        }

        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers]
  );

  // ── Reset (Coba Lagi) ────────────────────────────────────────────────────
  const reset = useCallback(() => {
    // Jangan izinkan retry jika masih dalam cooldown
    if (cooldownRemaining !== null && cooldownRemaining > 0) return;

    setAnswers({});
    answersRef.current = {};
    setLastResult(null);
    setAutoSaveStatus("idle");
    attemptIdRef.current = null;
    setDiagnosticStatus((prev) =>
      prev ? { ...prev, status: "in_progress" } : null
    );
    setCooldownRemaining(null);
    initAttempt(); // buat attempt in_progress baru
  }, [initAttempt, cooldownRemaining]);

  return {
    answers,
    setAnswer,
    submitAnswers,
    isSubmitting,
    lastResult,
    reset,
    autoSaveStatus,
    isLoadingDraft,
    diagnosticStatus,
    isLoadingStatus,
    cooldownRemaining,
  };
}
