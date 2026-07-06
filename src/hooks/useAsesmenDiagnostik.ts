"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GradingResult } from "@/lib/data/asesmen-diagnostik";

const AUTO_SAVE_DEBOUNCE_MS = 500;

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
}

export function useAsesmenDiagnostik(): UseAsesmenDiagnostikReturn {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<GradingResult | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  // Refs: akses nilai terbaru di dalam callbacks tanpa re-render / stale closure
  const attemptIdRef = useRef<number | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    initAttempt();
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [initAttempt]);

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
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers]
  );

  // ── Reset (Coba Lagi) ────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setAnswers({});
    answersRef.current = {};
    setLastResult(null);
    setAutoSaveStatus("idle");
    attemptIdRef.current = null;
    initAttempt(); // buat attempt in_progress baru
  }, [initAttempt]);

  return {
    answers,
    setAnswer,
    submitAnswers,
    isSubmitting,
    lastResult,
    reset,
    autoSaveStatus,
    isLoadingDraft,
  };
}
