"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import FaktorialContent from "@/components/materi/sections/faktorial/Faktorial";
import ChatbotShell from "@/components/materi/ChatbotShell";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import type { TocSection } from "@/components/materi/TableContent";

/** Status respons dari /api/faktorial/status */
interface FaktorialStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
}

// ── TOC Data untuk Faktorial ─────────────────────────────────────
const FAKTORIAL_TOC: TocSection[] = [
  {
    key: "faktorial",
    label: "Faktorial",
    sub: "Notasi perkalian berurutan — dasar permutasi & kombinasi",
    icon: "ti-math",
    children: [
      { key: "faktorial-1", label: "Eksplorasi Kontekstual", sub: "Temukan pola dari situasi nyata", icon: "ti-search" },
      { key: "faktorial-2", label: "Aktivitas Deep Learning", sub: "Eksplorasi mendalam & kolaborasi", icon: "ti-brain" },
      { key: "faktorial-3", label: "Penjelasan Konsep", sub: "Pahami materi inti", icon: "ti-book" },
      { key: "faktorial-4", label: "Contoh Soal Bertahap", sub: "Latihan dari mudah ke kompleks", icon: "ti-stairs-up" },
      { key: "faktorial-5", label: "Mengapa? Corner", sub: "Jawaban atas pertanyaan \"mengapa?\"", icon: "ti-question-mark" },
      { key: "faktorial-6", label: "Aktivitas Siswa", sub: "Kerjakan sesuai materi yang diselesaikan", icon: "ti-pencil" },
      { key: "faktorial-7", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles" },
    ],
  },
];

export default function FaktorialPage() {
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});
  const [allDone, setAllDone] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Seed + Fetch status secara sequential ─────────────────────────
  // Seed HARUS selesai sebelum fetch status, agar student_section_status rows
  // sudah tersedia saat status dicek. Seed bersifat idempotent (no-op jika rows
  // sudah ada). completeSectionAndUnlockNext sekarang menggunakan UPSERT sehingga
  // tetap aman meskipun seed belum sempat berjalan.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Seed student_section_status rows (idempotent — no-op jika sudah ada)
        await fetch("/api/materi/faktorial/seed");

        if (cancelled) return;

        // 2. Fetch status dari backend
        const res = await fetch("/api/faktorial/status");
        if (!res.ok || cancelled) return;

        const data: FaktorialStatusResponse = await res.json();

        // Convert section-name-based status to index-based
        const cs: Record<number, boolean> = {};
        if (data.sections["eksplorasi_kontekstual"] === "completed") cs[0] = true;
        if (data.sections["aktivitas_deep_learning"] === "completed") cs[1] = true;
        if (data.sections["penjelasan_konsep"] === "completed") cs[2] = true;
        if (data.sections["contoh_soal"] === "completed") cs[3] = true;
        if (data.sections["mengapa_corner"] === "completed") cs[4] = true;
        if (data.sections["refleksi_mini"] === "completed") {
          cs[5] = true;
          setAllDone(true);
        }

        setCompletedSections(cs);
      } catch (err) {
        console.error("[faktorial-page] init error:", err);
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

    // Section index → TOC key mapping
    if (cs[0]) keys.add("faktorial-1"); // eksplorasi
    if (cs[1]) { keys.add("faktorial-2"); keys.add("faktorial-3"); } // deep learning → implies penjelasan done
    if (cs[3]) keys.add("faktorial-4"); // contoh soal
    if (cs[4]) keys.add("faktorial-5"); // mengapa corner
    if (cs[5]) { keys.add("faktorial-6"); keys.add("faktorial-7"); } // refleksi → implies aktivitas & refleksi done
    if (allDone) keys.add("faktorial");

    // Active key: first section not yet completed
    let active: string | null = null;
    if (!cs[0]) active = "faktorial-1";
    else if (!cs[1]) active = "faktorial-2";
    else if (!cs[3]) active = "faktorial-4";
    else if (!cs[4]) active = "faktorial-5";
    else if (!cs[5]) active = "faktorial-7";
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
      <div className="rounded-xl border border-[#346739] bg-white p-6 sm:p-8">
        <FaktorialContent
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
      tocSections={FAKTORIAL_TOC}
      materiSlug="faktorial"
    >
      {pageContent}
    </ChatbotShell>
  );
}
