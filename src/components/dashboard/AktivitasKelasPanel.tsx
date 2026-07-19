"use client";

/**
 * AktivitasKelasPanel — Class-level activity panel
 *
 * Fetches class stats from /api/aktivitas-kelas and displays:
 * - How many students have completed the Asesmen Formatif
 * - Total students in the class
 * - Visual progress bar
 *
 * Falls back to an empty-state when no data yet.
 */

import { useEffect, useState } from "react";
import Image from "next/image";

interface ClassActivityData {
  className: string;
  totalStudents: number;
  completedCount: number;
  percentage: number;
  moduleName: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ClassActivityData }
  | { status: "error" }
  | { status: "empty" };

function PanelTitle() {
  return (
    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-brand-500">
      Aktivitas kelas
    </p>
  );
}

export default function AktivitasKelasPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/aktivitas-kelas");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ClassActivityData = await res.json();

        if (!cancelled) {
          if (data.totalStudents === 0) {
            setState({ status: "empty" });
          } else {
            setState({ status: "loaded", data });
          }
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading ──
  if (state.status === "loading") {
    return (
      <article className="flex min-h-[300px] flex-col rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        </div>
      </article>
    );
  }

  // ── Empty / Error ──
  if (state.status === "error" || state.status === "empty") {
    return (
      <article className="flex min-h-[300px] flex-col rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
        <PanelTitle />

        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Image
            src="/images/class activity.png"
            alt=""
            width={140}
            height={118}
            className="h-auto w-[120px]"
          />
          <p
            className="m-0 text-zinc-600"
            style={{ fontSize: "var(--right-card-text-size)" }}
          >
            Belum ada yang mulai minggu ini
          </p>
        </div>

        <div className="rounded-2xl bg-brand-50 py-2.5 text-center">
          <span className="text-sm font-bold text-brand-600">
            Jadilah yang pertama!
          </span>
        </div>
      </article>
    );
  }

  // ── Has data ──
  const { data } = state;
  const hasCompletions = data.completedCount > 0;
  const pct = Math.round(data.percentage);

  if (!hasCompletions) {
    return (
      <article className="flex min-h-[300px] flex-col rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
        <PanelTitle />

        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Image
            src="/images/class activity.png"
            alt=""
            width={140}
            height={118}
            className="h-auto w-[120px]"
          />
          <p
            className="m-0 text-zinc-600"
            style={{ fontSize: "var(--right-card-text-size)" }}
          >
            Belum ada yang mengumpulkan
            <br />
            Asesmen Formatif {data.moduleName}
          </p>
        </div>

        <div className="rounded-2xl bg-brand-50 py-2.5 text-center">
          <span className="text-sm font-bold text-brand-600">
            Jadilah yang pertama!
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="flex min-h-[300px] flex-col rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
      <div className="flex items-start justify-between">
        <PanelTitle />
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
          {pct}% selesai
        </span>
      </div>

      {/* Hero: thick horizontal bar with count stacked above it */}
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold leading-none text-brand-600">
            {data.completedCount}
          </span>
          <span className="text-base font-medium leading-none text-zinc-400">
            / {data.totalStudents} siswa
          </span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p
          className="m-0 leading-relaxed text-zinc-600"
          style={{ fontSize: "var(--right-card-text-size)" }}
        >
          Siswa telah menyelesaikan Asesmen Formatif{" "}
          <span className="font-semibold text-zinc-800">
            {data.moduleName}
          </span>
        </p>
      </div>

      <div className="rounded-2xl bg-brand-50 py-2.5 text-center">
        <span className="text-sm font-bold text-brand-600">
          {pct}% sudah selesai!
        </span>
      </div>
    </article>
  );
}