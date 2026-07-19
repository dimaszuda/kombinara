"use client";

/**
 * AktivitasKamuPanel — Student progress panel
 *
 * Fetches progress from /api/student-section-status/progress and displays:
 * - Large percentage figure as the visual anchor, ring drawn behind it
 * - Section stats and CTA to continue learning
 *
 * Falls back to an empty-state invitation when no progress yet.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ProgressData {
  total: number;
  completed: number;
  unlocked: number;
  locked: number;
  percentage: number;
  concepts: Record<
    string,
    {
      total: number;
      completed: number;
      unlocked: number;
      locked: number;
      percentage: number;
    }
  >;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProgressData }
  | { status: "error" }
  | { status: "empty" }; // no rows seeded yet

/** Ring drawn as a backdrop behind the big percentage number. Flat, no gradient. */
function BackdropRing({ percentage, size = 172 }: { percentage: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = c - (clamped / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#EAF3DE"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#16a34a"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function CtaButton({ label }: { label: string }) {
  return (
    <Link
      href="/siswa/materi/kaidah-pencacahan"
      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 no-underline transition-colors duration-200 hover:bg-brand-700"
    >
      <span
        className="font-semibold leading-none text-white"
        style={{ fontSize: "var(--right-card-link-size)" }}
      >
        {label}
      </span>
      <Image
        src="/icons/green arrow.png"
        alt=""
        width={16}
        height={16}
        className="shrink-0 brightness-0 invert transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
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
          if (data.total === 0) {
            setState({ status: "empty" });
          } else {
            setState({ status: "loaded", data });
          }
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
      <article className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        </div>
      </article>
    );
  }

  // ── Empty / Error states ──
  if (state.status === "error" || state.status === "empty") {
    return (
      <article className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-brand-500">
          Aktivitas kamu
        </p>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Image
            src="/images/my aktivitas.png"
            alt=""
            width={104}
            height={118}
            className="h-auto w-[92px]"
          />
          <p
            className="m-0 max-w-[240px] leading-relaxed text-zinc-600"
            style={{ fontSize: "var(--right-card-text-size)" }}
          >
            Belum ada aktivitas. Yuk, mulai belajar hari ini!
          </p>
        </div>

        <CtaButton label="Ayo mulai belajar" />
      </article>
    );
  }

  // ── Has progress ──
  const { data } = state;
  const hasProgress = data.completed > 0;
  const remaining = data.total - data.completed;

  return (
    <article className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border-2 border-brand-600 bg-white p-6 md:h-[300px]">
      {/* Header — pinned to top-left */}
      <div className="absolute left-6 right-6 top-6 flex items-start justify-between">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-brand-500">
          Aktivitas kamu
        </p>
        {hasProgress && (
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
            Kamu hebat! 🔥
          </span>
        )}
      </div>

      {/* Hero + Description — vertically centered */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Hero: big percentage inside the ring */}
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <BackdropRing percentage={data.percentage} size={140} />
            <div className="relative z-[1] flex flex-col items-center">
              <span className="text-3xl font-bold leading-none text-brand-600">
                {Math.round(data.percentage)}%
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-zinc-500">
                {data.completed} dari {data.total} bagian
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          className="mx-auto mt-2 text-center leading-relaxed text-zinc-600"
          style={{ fontSize: "var(--right-card-text-size)" }}
        >
          Kamu telah mempelajari{" "}
          <span className="font-semibold text-brand-600">{data.completed}</span>{" "}
          dari{" "}
          <span className="font-semibold text-brand-600">{data.total}</span>{" "}
          bagian di materi Kaidah Pencacahan
        </p>
      </div>

      {/* CTA — pushed to bottom naturally */}
      <div className="mt-auto w-full">
        <CtaButton label={hasProgress ? "Lanjutkan belajar" : "Ayo mulai belajar"} />
      </div>
    </article>
  );
}