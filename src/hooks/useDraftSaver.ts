/**
 * useDraftSaver — auto-save draft answers with debounce + interval fallback.
 *
 * Skema:
 *   1. Debounce save: setiap kali jawaban berubah (dan ada isinya), tunggu 3 detik
 *      setelah siswa berhenti mengetik, lalu simpan ke DB via API.
 *   2. Interval fallback: setiap 60 detik, simpan SEMUA jawaban yang ada isinya.
 *   3. Restore on mount: ambil draft dari DB dan isi kembali ke state answers.
 *
 * Usage:
 *   const { isRestoring, lastSavedAt } = useDraftSaver({
 *     answers,
 *     moduleSlug: "kaidah-pencacahan",
 *     questionCount: 10,
 *   });
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AnswerPair {
  cara_hitung: string;
  jawaban_akhir: string;
}

export interface DraftEntry {
  questionNumber: number;
  caraMengerjakan: string | null;
  jawabanAkhir: string | null;
  lastSavedAt: string;
}

interface UseDraftSaverOptions {
  /** Current answers state (from the page component). */
  answers: AnswerPair[];
  /** Module slug, e.g. "kaidah-pencacahan". */
  moduleSlug: string;
  /** Number of questions in the assessment. */
  questionCount: number;
  /** Called when drafts are restored from DB — pass the restored answers back. */
  onRestore?: (answers: AnswerPair[]) => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useDraftSaver({
  answers,
  moduleSlug,
  questionCount,
  onRestore,
}: UseDraftSaverOptions) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Ref to track if we've already attempted restore
  const restoredRef = useRef(false);
  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Interval timer ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track last saved state to avoid redundant saves (shallow compare)
  const lastSavedStateRef = useRef<string>("");

  // ─── Persist single question to API ──────────────────────────────────────────

  const saveDraft = useCallback(
    async (index: number, pair: AnswerPair) => {
      try {
        const res = await fetch("/api/asesmen-formatif/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module_slug: moduleSlug,
            question_number: index + 1, // 1-based
            cara_mengerjakan: pair.cara_hitung || null,
            jawaban_akhir: pair.jawaban_akhir || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          console.warn("[useDraftSaver] Save failed for Q", index + 1, err);
        } else {
          setLastSavedAt(new Date());
          setSaveError(null);
        }
      } catch (e) {
        console.warn("[useDraftSaver] Network error saving Q", index + 1, e);
      }
    },
    [moduleSlug]
  );

  // ─── Save all non-empty answers ───────────────────────────────────────────────

  const saveAllDrafts = useCallback(async () => {
    const currentSnapshot = JSON.stringify(answers);
    if (currentSnapshot === lastSavedStateRef.current) return; // no change

    const promises = answers
      .map((pair, i) => ({ index: i, pair }))
      .filter(
        ({ pair }) =>
          pair.cara_hitung.trim().length > 0 || pair.jawaban_akhir.trim().length > 0
      )
      .map(({ index, pair }) => saveDraft(index, pair));

    if (promises.length === 0) return;

    await Promise.allSettled(promises);
    lastSavedStateRef.current = currentSnapshot;
  }, [answers, saveDraft]);

  // ─── Debounced save on individual answer change ──────────────────────────────

  useEffect(() => {
    // Don't trigger debounce during initial restore
    if (isRestoring) return;

    // Clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Debounce 3 detik — simpan setelah siswa berhenti mengetik
    debounceRef.current = setTimeout(() => {
      saveAllDrafts();
    }, 3000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [answers, isRestoring, saveAllDrafts]);

  // ─── Interval fallback: save every 60 seconds ─────────────────────────────────

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      saveAllDrafts();
    }, 60_000); // 1 menit

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [saveAllDrafts]);

  // ─── Restore drafts on mount ──────────────────────────────────────────────────

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    async function restore() {
      try {
        const res = await fetch(
          `/api/asesmen-formatif/draft?module_slug=${encodeURIComponent(moduleSlug)}`
        );
        if (!res.ok) {
          setIsRestoring(false);
          return;
        }

        const data = await res.json();
        const drafts: DraftEntry[] = data.drafts ?? [];

        if (drafts.length === 0) {
          setIsRestoring(false);
          return;
        }

        // Build restored answers array
        const restored: AnswerPair[] = Array.from({ length: questionCount }, () => ({
          cara_hitung: "",
          jawaban_akhir: "",
        }));

        for (const d of drafts) {
          const idx = d.questionNumber - 1;
          if (idx >= 0 && idx < questionCount) {
            restored[idx] = {
              cara_hitung: d.caraMengerjakan ?? "",
              jawaban_akhir: d.jawabanAkhir ?? "",
            };
          }
        }

        // Update last saved state
        lastSavedStateRef.current = JSON.stringify(restored);

        onRestore?.(restored);
        setIsRestoring(false);
      } catch (e) {
        console.warn("[useDraftSaver] Failed to restore drafts:", e);
        setIsRestoring(false);
      }
    }

    restore();

    // Cleanup on unmount — force save all pending drafts
    return () => {
      // Fire-and-forget: save any remaining drafts
      const pending = answers.filter(
        (pair) =>
          pair.cara_hitung.trim().length > 0 || pair.jawaban_akhir.trim().length > 0
      );
      if (pending.length > 0) {
        navigator.sendBeacon?.(
          "/api/asesmen-formatif/draft",
          JSON.stringify({
            module_slug: moduleSlug,
            batch: pending.map((pair, i) => ({
              question_number: i + 1,
              cara_mengerjakan: pair.cara_hitung || null,
              jawaban_akhir: pair.jawaban_akhir || null,
            })),
          })
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isRestoring,
    lastSavedAt,
    saveError,
    /** Manually trigger a save of all drafts (e.g., before submit). */
    saveAllDrafts,
  };
}
