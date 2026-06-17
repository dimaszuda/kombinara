"use client";

import { useState, useCallback } from "react";
import type { GradingResult } from "@/lib/data/asesmen-diagnostik";

/**
 * Hook untuk mengelola state jawaban Asesmen Diagnostik.
 *
 * Dipisahkan dari komponen UI agar:
 * 1. State management terisolasi & testable
 * 2. Komponen UI tidak dibebani logic jawaban
 * 3. Bisa dipanggil dari mana saja (page, komponen, dll.)
 */

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
  /** Reset semua jawaban & hasil */
  reset: () => void;
}

export function useAsesmenDiagnostik(): UseAsesmenDiagnostikReturn {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<GradingResult | null>(null);

  const setAnswer = useCallback(
    (questionNumber: number, subIndex: number, value: string) => {
      const key = `${questionNumber}-${subIndex}`;
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const submitAnswers = useCallback(
    async (answersOverride?: Record<string, string>): Promise<GradingResult> => {
      setIsSubmitting(true);
      const payload = answersOverride ?? answers;
      try {
        const res = await fetch("/api/asesmen-diagnostik", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const result: GradingResult = await res.json();
        setLastResult(result);
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers]
  );

  const reset = useCallback(() => {
    setAnswers({});
    setLastResult(null);
  }, []);

  return {
    answers,
    setAnswer,
    submitAnswers,
    isSubmitting,
    lastResult,
    reset,
  };
}
