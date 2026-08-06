"use client";

/**
 * AktivitasKamuPanel — Student progress panel (refactored)
 *
 * Fetches progress from /api/student-section-status/progress and displays
 * ALL concept-level progress as filled donut charts in a responsive grid.
 *
 * Falls back to an empty-state invitation when no progress yet.
 *
 * Layout fix notes (see ProgressDonut.tsx for the actual root-cause fix):
 * - Card height is now a floor (`min-h-[300px]`), not a cage — with 7
 *   concepts the grid can grow past 300px instead of being squeezed.
 * - Grid starts at 1 col and steps up, so it never gets tighter than
 *   the card actually has room for.
 * - Each cell gets `min-w-0` so long labels can't silently push the
 *   grid track wider than its column (classic flex/grid overflow bug).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { CONCEPT_ORDER, CONCEPT_LABELS } from "@/lib/data/student-section-status";
import ProgressDonut from "@/components/dashboard/ProgressDonut";

interface ConceptProgress {
  total: number;
  completed: number;
  unlocked: number;
  locked: number;
  percentage: number;
}

interface ProgressData {
  total: number;
  completed: number;
  unlocked: number;
  locked: number;
  percentage: number;
  concepts: Record<string, ConceptProgress>;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProgressData }
  | { status: "error" }
  | { status: "empty" }; // no rows seeded yet

/** Build a compact label from the full concept name. */
function shortLabel(full: string): string {
  const map: Record<string, string> = {
    "Kaidah Penjumlahan": "Penjumlahan",
    "Kaidah Perkalian": "Perkalian",
    "Faktorial": "Faktorial",
    "Permutasi r Unsur dari n Unsur": "Permutasi r-n",
    "Permutasi dengan Unsur Sama": "Permutasi Sama",
    "Permutasi Siklis": "Permutasi Siklis",
    "Kombinasi": "Kombinasi",
  };
  return map[full] ?? full;
}

/** Shared card shell so every state (loading/empty/error/loaded) matches exactly. */
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <article className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border-2 border-brand-600 bg-white p-6">
      {children}
    </article>
  );
}

function PanelHeading() {
  return (
    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-brand-500">
      Aktivitas kamu
    </p>
  );
}

function EmptyMessage() {
  return (
    <p
      className="m-0 max-w-[240px] text-center leading-relaxed text-zinc-600"
      style={{ fontSize: "var(--right-card-text-size)" }}
    >
      Belum ada aktivitas. Yuk, mulai belajar hari ini!
    </p>
  );
}

export default function AktivitasKamuPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchProgress() {
      try {
        const res = await fetch("/api/student-section-status/progress");
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setState({ status: "empty" });
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data: ProgressData = await res.json();

        if (!cancelled) {
          setState(data.total === 0 ? { status: "empty" } : { status: "loaded", data });
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading state ──
  if (state.status === "loading") {
    return (
      <CardShell>
        <PanelHeading />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        </div>
      </CardShell>
    );
  }

  // ── Empty state ──
  if (state.status === "empty") {
    return (
      <CardShell>
        <PanelHeading />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Image
            src="/images/my aktivitas.png"
            alt=""
            width={104}
            height={118}
            className="h-auto w-[92px]"
          />
          <EmptyMessage />
        </div>
      </CardShell>
    );
  }

  // ── Error state ──
  if (state.status === "error") {
    return (
      <CardShell>
        <PanelHeading />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p
            className="m-0 max-w-[240px] leading-relaxed text-zinc-600"
            style={{ fontSize: "var(--right-card-text-size)" }}
          >
            Gagal memuat data. Coba lagi nanti.
          </p>
        </div>
      </CardShell>
    );
  }

  // ── Has progress — build concept list in curriculum order ──
  const { data } = state;
  const hasProgress = data.completed > 0;

  const conceptEntries = CONCEPT_ORDER
    .filter((id) => data.concepts[id] != null && data.concepts[id].total > 0)
    .map((id) => ({ id, ...data.concepts[id]! }));

  return (
    <CardShell>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <PanelHeading />
        {hasProgress && (
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
            Kamu hebat! 🔥
          </span>
        )}
      </div>

      {/* Donut grid — all concepts */}
      {conceptEntries.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
          {conceptEntries.map((c) => {
            const fullLabel = CONCEPT_LABELS[c.id] ?? c.id;
            return (
              <div
                key={c.id}
                className="flex min-w-0 flex-col items-center gap-2 rounded-xl bg-brand-50/50 px-3 py-3"
              >
                <ProgressDonut
                  percentage={c.percentage}
                  size={64}
                  strokeWidth={6}
                  color="#16a34a"
                  trackColor="#dcfce7"
                  animated
                />
                <span
                  className="line-clamp-2 w-full break-words text-center text-[11px] font-medium leading-tight text-zinc-600"
                  title={fullLabel}
                >
                  {shortLabel(fullLabel)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyMessage />
        </div>
      )}
    </CardShell>
  );
}