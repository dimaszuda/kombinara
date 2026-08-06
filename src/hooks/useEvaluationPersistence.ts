/**
 * useEvaluationPersistence — Resume AI evaluation after page refresh
 *
 * Saves the submission_id to sessionStorage when evaluation starts,
 * so if the student accidentally refreshes, the page automatically
 * resumes the "evaluating" state and polls for results.
 *
 * Also registers a beforeunload handler to warn the student before
 * leaving the page during evaluation.
 */

import { useEffect, useRef, useCallback } from "react";

const EVAL_STORAGE_KEY = "pending_evaluation";

interface PendingEvaluation {
  submissionId: number;
  moduleSlug: string;
}

interface UseEvaluationPersistenceOptions {
  /** Current phase of the ulangan. */
  phase: string;
  /** Module slug (faktorial, permutasi, kombinasi, kaidah-pencacahan). */
  moduleSlug: string;
  /** Called when evaluation is complete with the result data. */
  onEvaluationComplete: (result: unknown) => void;
  /** Called when evaluation fails with the error message. */
  onEvaluationError: (error: string) => void;
  /** Called when a pending evaluation is detected on mount (should set phase to "evaluating"). */
  onResumeEvaluation: () => void;
  /** Called when the pending evaluation has been resolved (clear storage + go to results/error). */
  onPendingResolved: () => void;
}

/**
 * Polls the GET evaluate endpoint until evaluation is complete.
 * The API returns { evaluated: boolean, total_score, per_question, ai_feedback }
 */
async function pollEvaluation(
  submissionId: number,
  signal: AbortSignal
): Promise<{ evaluated: boolean; data?: unknown }> {
  const res = await fetch(
    `/api/asesmen-formatif/evaluate?submission_id=${submissionId}`,
    { signal }
  );

  if (!res.ok) {
    throw new Error("Gagal memeriksa status evaluasi");
  }

  const data = await res.json();

  if (data.evaluated) {
    return { evaluated: true, data };
  }

  return { evaluated: false };
}

export function useEvaluationPersistence({
  phase,
  moduleSlug,
  onEvaluationComplete,
  onEvaluationError,
  onResumeEvaluation,
  onPendingResolved,
}: UseEvaluationPersistenceOptions) {
  const pendingRef = useRef<PendingEvaluation | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Save pending evaluation to sessionStorage ──────────────────────────
  const savePending = useCallback(
    (submissionId: number) => {
      const pending: PendingEvaluation = { submissionId, moduleSlug };
      sessionStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(pending));
      pendingRef.current = pending;
    },
    [moduleSlug]
  );

  // ── Clear pending evaluation from sessionStorage ───────────────────────
  const clearPending = useCallback(() => {
    sessionStorage.removeItem(EVAL_STORAGE_KEY);
    pendingRef.current = null;
  }, []);

  // ── beforeunload warning during evaluation ─────────────────────────────
  useEffect(() => {
    if (phase !== "evaluating") return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages; they show a generic one.
      // Including returnValue ensures the dialog appears.
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // ── Resume pending evaluation on mount ─────────────────────────────────
  useEffect(() => {
    // Only check on initial mount (not on phase changes)
    const stored = sessionStorage.getItem(EVAL_STORAGE_KEY);
    if (!stored) return;

    let pending: PendingEvaluation;
    try {
      pending = JSON.parse(stored) as PendingEvaluation;
    } catch {
      // Corrupted data — clear it
      sessionStorage.removeItem(EVAL_STORAGE_KEY);
      return;
    }

    // Validate that the stored module matches current page
    if (pending.moduleSlug !== moduleSlug) {
      // Stale data from a different module — clear it
      sessionStorage.removeItem(EVAL_STORAGE_KEY);
      return;
    }

    // Resume evaluation
    pendingRef.current = pending;
    onResumeEvaluation();

    const controller = new AbortController();
    abortRef.current = controller;

    let attempts = 0;
    const MAX_ATTEMPTS = 30; // ~5 minutes with 10s intervals

    const poll = async () => {
      while (attempts < MAX_ATTEMPTS) {
        try {
          const result = await pollEvaluation(
            pending.submissionId,
            controller.signal
          );

          if (result.evaluated) {
            sessionStorage.removeItem(EVAL_STORAGE_KEY);
            pendingRef.current = null;
            onEvaluationComplete(result.data);
            return;
          }
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return; // Cleanup — do nothing
          }
          // Network error — keep polling
          console.warn("[useEvaluationPersistence] Poll attempt failed:", err);
        }

        attempts++;

        // Wait before next poll (exponential backoff: 2s → 5s → 10s, max 15s)
        const delay = Math.min(2000 * Math.pow(1.5, attempts), 15000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Max attempts reached — show error
      sessionStorage.removeItem(EVAL_STORAGE_KEY);
      pendingRef.current = null;
      onEvaluationError(
        "Evaluasi memakan waktu terlalu lama. Silakan coba submit ulang jawabanmu."
      );
    };

    poll();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // ── Clear storage when evaluation completes normally ──────────────────
  useEffect(() => {
    if (phase === "results" || phase === "submitted") {
      clearPending();
    }
  }, [phase, clearPending]);

  return { savePending, clearPending, pendingRef };
}
