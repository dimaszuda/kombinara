"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import PermutasiContent from "@/components/materi/sections/permutasi/Permutasi";
import ChatbotShell from "@/components/materi/ChatbotShell";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import type { TocSection } from "@/components/materi/TableContent";

/** Status respons dari /api/permutasi/status */
interface PermutasiStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
}

// ── TOC Data untuk Permutasi ─────────────────────────────────────
const PERMUTASI_TOC: TocSection[] = [
  {
    key: "permutasi-bagian1",
    label: "Permutasi r Unsur dari n Unsur",
    sub: "Susunan objek berbeda dengan urutan diperhatikan",
    icon: "ti-arrows-sort",
    numberOverride: "4.1",
    children: [
      { key: "permutasi-1a", label: "Eksplorasi", sub: "Lomba lari — siapa juara?", icon: "ti-search", dotOnly: true },
      { key: "permutasi-1b", label: "Aktivitas Deep Learning", sub: "Susunan huruf & temukan rumus", icon: "ti-brain", dotOnly: true },
      { key: "permutasi-1c", label: "Penjelasan Konsep", sub: "Rumus P(n,r) = n!/(n-r)!", icon: "ti-book", dotOnly: true },
    ],
  },
  {
    key: "permutasi-bagian2",
    label: "Permutasi dengan Unsur yang Sama",
    sub: "Ketika ada huruf/objek yang identik",
    icon: "ti-arrows-sort",
    numberOverride: "4.2",
    children: [
      { key: "permutasi-2a", label: "Eksplorasi", sub: "Password WiFi dari kata ADA", icon: "ti-search", dotOnly: true },
      { key: "permutasi-2b", label: "Aktivitas Deep Learning", sub: "Pola permutasi unsur sama", icon: "ti-brain", dotOnly: true },
      { key: "permutasi-2c", label: "Penjelasan Konsep", sub: "Rumus n!/(k₁!·k₂!·...)", icon: "ti-book", dotOnly: true },
    ],
  },
  {
    key: "permutasi-bagian3",
    label: "Permutasi Siklis",
    sub: "Susunan melingkar — rotasi dianggap sama",
    icon: "ti-circle",
    numberOverride: "4.3",
    children: [
      { key: "permutasi-3a", label: "Eksplorasi", sub: "Rapat OSIS meja bundar", icon: "ti-search", dotOnly: true },
      { key: "permutasi-3b", label: "Aktivitas Deep Learning", sub: "Pola permutasi siklis", icon: "ti-brain", dotOnly: true },
      { key: "permutasi-3c", label: "Penjelasan Konsep", sub: "Rumus P(siklis) = (n-1)!", icon: "ti-book", dotOnly: true },
      { key: "permutasi-3d", label: "Contoh Soal Bertahap", sub: "7 soal dari mudah ke HOTS", icon: "ti-stairs-up", dotOnly: true },
      { key: "permutasi-3e", label: "Mengapa Corner", sub: "Mengapa urutan penting?", icon: "ti-question-mark", dotOnly: true },
      { key: "permutasi-3f", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles", dotOnly: true },
    ],
  },
];

export default function PermutasiPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});
  const [allDone, setAllDone] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // ── Seed + Fetch status secara sequential ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Seed student_section_status rows (idempotent)
        await fetch("/api/materi/permutasi/seed");

        if (cancelled) return;

        // 2. Fetch status dari backend
        const res = await fetch("/api/permutasi/status");
        if (!res.ok || cancelled) return;

        const data: PermutasiStatusResponse = await res.json();

        // Build section-key → status lookup
        const s = data.sections;

        // Concept 1: permutasi_r_unsur_dari_n_unsur → component sections 0,1,2
        const c1Eksplorasi = s["permutasi_r_unsur_dari_n_unsur:eksplorasi_kontekstual"];
        const c1Deep = s["permutasi_r_unsur_dari_n_unsur:aktivitas_deep_learning"];
        const c1Penjelasan = s["permutasi_r_unsur_dari_n_unsur:penjelasan_konsep"];

        // Concept 2: permutasi_dengan_unsur_sama → component sections 3,4,5
        const c2Eksplorasi = s["permutasi_dengan_unsur_sama:eksplorasi_kontekstual"];
        const c2Deep = s["permutasi_dengan_unsur_sama:aktivitas_deep_learning"];
        const c2Penjelasan = s["permutasi_dengan_unsur_sama:penjelasan_konsep"];

        // Concept 3: permutasi_siklis → component sections 6,7,8,9,10
        const c3Eksplorasi = s["permutasi_siklis:eksplorasi_kontekstual"];
        const c3Deep = s["permutasi_siklis:aktivitas_deep_learning"];
        const c3Penjelasan = s["permutasi_siklis:penjelasan_konsep"];
        const c3Contoh = s["permutasi_siklis:contoh_soal"];
        const c3Refleksi = s["permutasi_siklis:refleksi_mini"];

        const cs: Record<number, boolean> = {};

        // Section 0: eksplorasi kontekstual (c1)
        if (c1Eksplorasi === "completed") cs[0] = true;
        // Section 1: aktivitas deep learning (c1)
        if (c1Deep === "completed") cs[1] = true;
        // Section 2: penjelasan konsep (c1) — read-only, status dari DB
        if (c1Penjelasan === "completed") cs[2] = true;

        // Section 3: eksplorasi kontekstual (c2)
        if (c2Eksplorasi === "completed") cs[3] = true;
        // Section 4: aktivitas deep learning (c2)
        if (c2Deep === "completed") cs[4] = true;
        // Section 5: penjelasan konsep (c2) — read-only, status dari DB
        if (c2Penjelasan === "completed") cs[5] = true;

        // Section 6: eksplorasi kontekstual (c3)
        if (c3Eksplorasi === "completed") cs[6] = true;
        // Section 7: aktivitas deep learning (c3)
        if (c3Deep === "completed") cs[7] = true;
        // Section 8: penjelasan konsep (c3) — read-only, status dari DB
        if (c3Penjelasan === "completed") cs[8] = true;
        // Section 9: contoh soal (c3)
        if (c3Contoh === "completed") cs[9] = true;
        // Section 10: refleksi mini (c3)
        if (c3Refleksi === "completed") {
          cs[10] = true;
          setAllDone(true);
        }

        setCompletedSections(cs);
      } catch (err) {
        console.error("[permutasi-page] init error:", err);
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // ── Compute completedKeys & activeKey untuk TableContent ──────────
  const { completedKeys, activeKey } = useMemo(() => {
    const keys = new Set<string>();
    const cs = completedSections;

    if (cs[0]) keys.add("permutasi-1a");
    if (cs[1]) keys.add("permutasi-1b");
    if (cs[2]) keys.add("permutasi-1c");
    if (cs[3]) keys.add("permutasi-2a");
    if (cs[4]) keys.add("permutasi-2b");
    if (cs[5]) keys.add("permutasi-2c");
    if (cs[6]) keys.add("permutasi-3a");
    if (cs[7]) keys.add("permutasi-3b");
    if (cs[8]) keys.add("permutasi-3c");
    if (cs[9]) keys.add("permutasi-3d");
    if (cs[10]) { keys.add("permutasi-3e"); keys.add("permutasi-3f"); }
    if (allDone) {
      keys.add("permutasi-bagian1");
      keys.add("permutasi-bagian2");
      keys.add("permutasi-bagian3");
    }

    let active: string | null = null;
    if (!cs[0]) active = "permutasi-1a";
    else if (!cs[1]) active = "permutasi-1b";
    else if (!cs[2]) active = "permutasi-1c";
    else if (!cs[3]) active = "permutasi-2a";
    else if (!cs[4]) active = "permutasi-2b";
    else if (!cs[5]) active = "permutasi-2c";
    else if (!cs[6]) active = "permutasi-3a";
    else if (!cs[7]) active = "permutasi-3b";
    else if (!cs[8]) active = "permutasi-3c";
    else if (!cs[9]) active = "permutasi-3d";
    else if (!cs[10]) active = "permutasi-3f";
    else active = null;

    return { completedKeys: keys, activeKey: active };
  }, [completedSections, allDone]);

  const pageContent = isCheckingStatus ? (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <svg className="h-8 w-8 animate-spin text-[#346739]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
        </svg>
        <p className="text-sm text-[#346739]">Memuat progres belajar...</p>
      </div>
    </div>
  ) : (
    <div ref={contentRef} style={{ padding: "32px 12px 80px", margin: "0 auto" }}>
      <SelectionToolbar contentRef={contentRef} />

      {/* Back to Dashboard */}
      <Link href="/siswa">
        <button
          style={{
            background: "none",
            border: "none",
            color: "#346739",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "20px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Kembali ke Dashboard
        </button>
      </Link>

      {/* Main Content Wrapper */}
      <div className="rounded-xl border border-[#346739] bg-white p-6 sm:p-8">
        <PermutasiContent
          initialCompletedSections={completedSections}
          onComplete={() => setAllDone(true)}
        />
      </div>
    </div>
  );

  return (
    <ChatbotShell
      activeKey={activeKey}
      completedKeys={completedKeys}
      tocSections={PERMUTASI_TOC}
      materiSlug="permutasi"
    >
      {pageContent}
    </ChatbotShell>
  );
}