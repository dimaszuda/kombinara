"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ModulStatus {
  key: string;
  name: string;
  description: string;
  requirementSummary: string;
  eligible: boolean;
  totalSections: number;
  completedSections: number;
}

interface DownloadStatusResponse {
  moduls: ModulStatus[];
}

type DownloadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; moduls: ModulStatus[] }
  | { kind: "error"; message: string };

type FileDownloadState = "ready" | "downloading" | "blocked";

// ─── Icons ──────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500">
        {completed}/{total} ({pct}%)
      </span>
    </div>
  );
}

// ─── Modul Card ─────────────────────────────────────────────────────────────

function ModulCard({ modul }: { modul: ModulStatus }) {
  const [fileState, setFileState] = useState<FileDownloadState>(
    modul.eligible ? "ready" : "blocked"
  );

  const handleDownload = useCallback(async () => {
    if (!modul.eligible) return;

    setFileState("downloading");
    try {
      const res = await fetch(`/api/download/file?file=${modul.key}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memverifikasi kelayakan download.");
      }
      const data = await res.json();
      window.open(data.signedUrl, "_blank");
      setFileState("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal download.";
      alert(message);
      setFileState("ready");
    }
  }, [modul.key, modul.eligible]);

  return (
    <div className={`flex flex-col rounded-[24px] bg-white p-6 shadow-sm border transition-opacity ${
      modul.eligible ? "border-gray-100" : "border-amber-200"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DBFFD5]">
          <Image src="/icons/green materi.png" alt="Modul" width={22} height={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="m-0 text-lg font-semibold text-brand-600">{modul.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{modul.description}</p>
        </div>
        {/* Status badge */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            modul.eligible
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {modul.eligible ? "✅ Bisa Download" : "🔒 Terkunci"}
        </span>
      </div>

      {/* Requirement summary + progress */}
      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
        <p className="m-0 text-sm text-gray-600">{modul.requirementSummary}</p>
        <ProgressBar completed={modul.completedSections} total={modul.totalSections} />
      </div>

      {/* CTA / Message */}
      <div className="mt-4">
        {modul.eligible ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={fileState === "downloading"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600/85 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {fileState === "downloading" ? (
              <>
                <Spinner /> Menyiapkan Download...
              </>
            ) : (
              <>
                <DownloadIcon /> Download Modul
              </>
            )}
          </button>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="m-0 text-sm font-semibold text-amber-800 flex items-center gap-2">
              <LockIcon /> Modul Terkunci
            </p>
            <p className="m-0 mt-1 text-xs text-amber-600">
              Kamu harus menyelesaikan semua section yang diperlukan terlebih dahulu sebelum bisa mendownload modul ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 h-16 rounded-lg bg-gray-100" />
      <div className="mt-4 h-12 w-full rounded-xl bg-gray-200" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DownloadPage() {
  const [state, setState] = useState<DownloadState>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      setState({ kind: "loading" });
      try {
        const res = await fetch("/api/download/status");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal memuat status download.");
        }
        const data: DownloadStatusResponse = await res.json();
        if (!cancelled) {
          setState({ kind: "success", moduls: data.moduls });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Gagal memuat data.",
          });
        }
      }
    }

    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="m-0 text-2xl font-bold text-brand-600 sm:text-3xl">
            📥 Download Modul
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Unduh modul pembelajaran dalam format PDF. Setiap modul memiliki syarat penyelesaian section yang harus dipenuhi terlebih dahulu.
          </p>
        </div>
      </ScrollReveal>

      {/* Content */}
      {state.kind === "loading" && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {state.kind === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-center">
          <p className="m-0 text-sm font-semibold text-red-700">⚠️ Gagal Memuat</p>
          <p className="m-0 mt-1 text-sm text-red-600">{state.message}</p>
        </div>
      )}

      {state.kind === "success" && (
        <div className="space-y-5">
          {state.moduls.map((modul) => (
            <ScrollReveal key={modul.key}>
              <ModulCard modul={modul} />
            </ScrollReveal>
          ))}

          {/* Info tambahan */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
            <p className="m-0 text-sm font-semibold text-blue-700">💡 Tips</p>
            <p className="m-0 mt-1 text-xs text-blue-600">
              Selesaikan semua section pada materi terlebih dahulu. Setiap section yang selesai akan membuka akses ke modul yang bisa kamu download. Progress bar menunjukkan sejauh mana kamu sudah menyelesaikan syarat setiap modul.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
