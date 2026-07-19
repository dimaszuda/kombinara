/**
 * useIntegrityMonitor — client-side integrity event capture for Asesmen Formatif.
 *
 * Captures: fullscreen enter/exit, page visibility changes, paste events,
 * and viewport resize (as context for fullscreen-exit suppression).
 *
 * Events are batched client-side and flushed to the server every 10 events
 * or 15 seconds, whichever comes first. On page unload, remaining events
 * are flushed via navigator.sendBeacon() (best-effort).
 *
 * Design principles:
 * - Pure event logging — no automatic scoring or "cheating" thresholds.
 * - Deterrence-focused: students are aware their activity is recorded.
 * - No prevention/lockdown claims anywhere.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DeviceType } from "@/lib/device";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseIntegrityMonitorParams {
  attemptId: number;
  moduleSlug: string;
  deviceType: DeviceType;
}

export interface IntegrityToast {
  message: string;
  timestamp: number;
}

export interface IntegrityBlockingModal {
  message: string;
  timestamp: number;
}

export interface UseIntegrityMonitorReturn {
  activeToast: IntegrityToast | null;
  activeBlockingModal: IntegrityBlockingModal | null;
  dismissBlockingModal: () => void;
  registerPasteTarget: (fieldId: string, element: HTMLElement | null) => void;
  /** Set by the hook; parent wraps the question area when modal is active. */
  isBlocking: boolean;
}

// ─── Internal event shape ─────────────────────────────────────────────────────

interface QueuedEvent {
  event_type: string;
  device_type: DeviceType;
  metadata?: Record<string, unknown>;
  created_at: string; // ISO timestamp
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 15_000; // 15 seconds
const FULLSCREEN_EXIT_SUPPRESS_MS = 300; // suppress fullscreen_exit if resize preceded within 300ms
const RESIZE_HEIGHT_DROP_RATIO = 0.25; // suppress if viewport height dropped >25%
const TOAST_THRESHOLD_MS = 5_000; // 5 seconds before toast triggers

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useIntegrityMonitor({
  attemptId,
  moduleSlug,
  deviceType,
}: UseIntegrityMonitorParams): UseIntegrityMonitorReturn {
  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeToast, setActiveToast] = useState<IntegrityToast | null>(null);
  const [activeBlockingModal, setActiveBlockingModal] =
    useState<IntegrityBlockingModal | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // ── Refs (mutable, no re-render) ────────────────────────────────────────────
  const bufferRef = useRef<QueuedEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteTargetsRef = useRef<Map<string, HTMLElement>>(new Map());
  const hiddenSinceRef = useRef<number | null>(null);
  const fsExitTimeRef = useRef<number | null>(null);
  const fsExitToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeHistoryRef = useRef<Array<{ time: number; heightBefore: number; heightAfter: number }>>([]);
  const lastViewportHeightRef = useRef<number>(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const isFlushingRef = useRef(false);
  const mountedRef = useRef(true);

  // ── Flush buffer to server ──────────────────────────────────────────────────

  const flushBuffer = useCallback(async () => {
    const events = bufferRef.current;
    if (events.length === 0) return;
    if (isFlushingRef.current) return;

    // Snapshot and clear buffer optimistically
    const batch = [...events];
    bufferRef.current = [];
    isFlushingRef.current = true;

    try {
      const res = await fetch("/api/asesmen-formatif/integrity-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId,
          module_slug: moduleSlug,
          events: batch,
        }),
      });

      if (!res.ok) {
        // Re-queue on failure — prepend to preserve order
        bufferRef.current = [...batch, ...bufferRef.current];
        console.warn(
          "[useIntegrityMonitor] Flush failed, re-queued",
          batch.length,
          "events"
        );
      }
    } catch (e) {
      // Network error — re-queue
      bufferRef.current = [...batch, ...bufferRef.current];
      console.warn("[useIntegrityMonitor] Network error flushing events:", e);
    } finally {
      isFlushingRef.current = false;
    }
  }, [attemptId, moduleSlug]);

  // ── Enqueue a single event ──────────────────────────────────────────────────

  const enqueue = useCallback(
    (event_type: string, metadata?: Record<string, unknown>, createdAtOverride?: string) => {
      const ev: QueuedEvent = {
        event_type,
        device_type: deviceType,
        metadata: metadata ?? undefined,
        created_at: createdAtOverride ?? new Date().toISOString(),
      };

      bufferRef.current.push(ev);

      // Flush if batch size reached
      if (bufferRef.current.length >= BATCH_SIZE) {
        flushBuffer();
      }
    },
    [deviceType, flushBuffer]
  );

  // ── Send-beacon flush on unload (best-effort) ───────────────────────────────

  useEffect(() => {
    function handleUnload() {
      const events = bufferRef.current;
      if (events.length === 0) return;

      const payload = JSON.stringify({
        attempt_id: attemptId,
        module_slug: moduleSlug,
        events,
      });

      // sendBeacon is unreliable during page unload but better than nothing.
      // Known limitation: data may be lost if the device crashes or network
      // drops. This is acceptable — the system is an audit log, not a
      // guarantee of perfect data capture.
      try {
        navigator.sendBeacon(
          "/api/asesmen-formatif/integrity-events",
          new Blob([payload], { type: "application/json" })
        );
      } catch {
        // Silently ignore — best-effort only
      }
    }

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [attemptId, moduleSlug]);

  // ── Periodic flush timer ────────────────────────────────────────────────────

  useEffect(() => {
    // Start the 15s interval flush
    flushTimerRef.current = setInterval(() => {
      flushBuffer();
    }, FLUSH_INTERVAL_MS);

    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, [flushBuffer]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Flush remaining events synchronously on unmount (not ideal but best we can do)
      if (bufferRef.current.length > 0) {
        // Use sendBeacon for unmount too
        const events = bufferRef.current;
        const payload = JSON.stringify({
          attempt_id: attemptId,
          module_slug: moduleSlug,
          events,
        });
        try {
          navigator.sendBeacon(
            "/api/asesmen-formatif/integrity-events",
            new Blob([payload], { type: "application/json" })
          );
        } catch {
          // Best-effort
        }
        bufferRef.current = [];
      }
      // Clear toast timer
      if (fsExitToastTimerRef.current) clearTimeout(fsExitToastTimerRef.current);
    };
  }, [attemptId, moduleSlug]);

  // ── 2.3 Fullscreen handling ─────────────────────────────────────────────────

  useEffect(() => {
    function handleFullscreenChange() {
      const isFullscreen = !!document.fullscreenElement;

      if (isFullscreen) {
        // Entered fullscreen
        enqueue("fullscreen_enter");

        // Clear any pending exit-toast timer
        if (fsExitToastTimerRef.current) {
          clearTimeout(fsExitToastTimerRef.current);
          fsExitToastTimerRef.current = null;
        }
        fsExitTimeRef.current = null;
      } else {
        // Exited fullscreen
        const now = Date.now();

        // Check resize history for soft-keyboard suppression
        const recentResize = resizeHistoryRef.current.find(
          (r) =>
            now - r.time <= FULLSCREEN_EXIT_SUPPRESS_MS &&
            r.heightBefore > 0 &&
            (r.heightBefore - r.heightAfter) / r.heightBefore >
              RESIZE_HEIGHT_DROP_RATIO
        );

        if (recentResize) {
          // Suppress — this exit was likely triggered by mobile soft keyboard.
          // Do NOT log fullscreen_exit; treat as noise.
          return;
        }

        // Log fullscreen_exit
        enqueue("fullscreen_exit");

        // Start 5-second toast timer
        fsExitTimeRef.current = now;

        if (fsExitToastTimerRef.current) {
          clearTimeout(fsExitToastTimerRef.current);
        }

        fsExitToastTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          // If student still hasn't re-entered fullscreen after 5s, show toast
          if (fsExitTimeRef.current !== null) {
            setActiveToast({
              message:
                "Aktivitas terdeteksi — tercatat untuk ditinjau guru.",
              timestamp: Date.now(),
            });
          }
        }, TOAST_THRESHOLD_MS);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enqueue]);

  // ── 2.6 Resize tracking (supporting suppression rule) ────────────────────────

  useEffect(() => {
    function handleResize() {
      const heightBefore = lastViewportHeightRef.current;
      const heightAfter = window.innerHeight;

      // Record to rolling history for suppression check
      resizeHistoryRef.current.push({
        time: Date.now(),
        heightBefore,
        heightAfter,
      });

      // Keep only last 10 resize events
      if (resizeHistoryRef.current.length > 10) {
        resizeHistoryRef.current = resizeHistoryRef.current.slice(-10);
      }

      // Log resize event (only significant height changes to avoid noise
      // from scroll-triggered address bar hide/show on mobile)
      const heightDiff = Math.abs(heightAfter - heightBefore);
      if (heightDiff > 50) {
        enqueue("resize", {
          viewport_height_before: heightBefore,
          viewport_height_after: heightAfter,
        });
      }

      lastViewportHeightRef.current = heightAfter;
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enqueue]);

  // ── 2.4 Page Visibility handling ────────────────────────────────────────────

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        // Page became hidden — record timestamp locally
        hiddenSinceRef.current = Date.now();
      } else {
        // Page became visible again
        const hiddenAt = hiddenSinceRef.current;
        hiddenSinceRef.current = null;

        if (hiddenAt === null) return;

        const now = Date.now();
        const durationMs = now - hiddenAt;

        // Log both events (with back-dated timestamp for visibility_hidden
        // so the audit trail accurately reflects when the page was hidden)
        enqueue("visibility_hidden", undefined, new Date(hiddenAt).toISOString());

        // Log visibility_visible with current timestamp
        enqueue("visibility_visible", undefined);

        // Trigger toast only if hidden >= 5 seconds
        if (durationMs >= TOAST_THRESHOLD_MS) {
          setActiveToast({
            message:
              "Aktivitas terdeteksi — tercatat untuk ditinjau guru.",
            timestamp: Date.now(),
          });
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enqueue]);

  // ── 2.5 Paste detection ─────────────────────────────────────────────────────

  const registerPasteTarget = useCallback(
    (fieldId: string, element: HTMLElement | null) => {
      if (element) {
        pasteTargetsRef.current.set(fieldId, element);
        // Attach paste listener
        element.addEventListener("paste", handlePaste);
      } else {
        // Cleanup on unmount
        const existing = pasteTargetsRef.current.get(fieldId);
        if (existing) {
          existing.removeEventListener("paste", handlePaste);
          pasteTargetsRef.current.delete(fieldId);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handlePaste(e: Event) {
    const event = e as ClipboardEvent;
    const pastedText = event.clipboardData?.getData("text") ?? "";

    if (pastedText.length === 0) return;

    // Find which field this paste belongs to
    const target = event.target as HTMLElement;
    let fieldId = "unknown";

    for (const [id, el] of pasteTargetsRef.current.entries()) {
      if (el === target || el.contains(target)) {
        fieldId = id;
        break;
      }
    }

    // Log paste event
    enqueue("paste", {
      field: fieldId,
      content: pastedText,
      char_length: pastedText.length,
    });

    // Trigger blocking modal immediately
    setActiveBlockingModal({
      message:
        "Aktivitas menempel (paste) teks terdeteksi dan telah dicatat. " +
        "Gurumu dapat meninjau catatan aktivitas ini nanti.",
      timestamp: Date.now(),
    });
    setIsBlocking(true);
  }

  const dismissBlockingModal = useCallback(() => {
    setActiveBlockingModal(null);
    setIsBlocking(false);
  }, []);

  // ── Cleanup paste listeners on unmount ──────────────────────────────────────

  useEffect(() => {
    return () => {
      for (const [, el] of pasteTargetsRef.current.entries()) {
        el.removeEventListener("paste", handlePaste);
      }
      pasteTargetsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activeToast,
    activeBlockingModal,
    dismissBlockingModal,
    registerPasteTarget,
    isBlocking,
  };
}
