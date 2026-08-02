"use client";

import { useEffect, useState, useRef } from "react";
import KombinasiContent from "@/components/materi/sections/kombinasi/Kombinasi";
import ChatbotShell from "@/components/materi/ChatbotShell";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import type { TocSection } from "@/components/materi/TableContent";

/** Status respons dari /api/kombinasi/status */
interface KombinasiStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
}

// ── TOC Data untuk Kombinasi ─────────────────────────────────────
const KOMBINASI_TOC: TocSection[] = [
  {
    key: "kombinasi",
    label: "Kombinasi",
    sub: "Pemilihan tanpa urutan — tim, kelompok, komite",
    icon: "ti-math",
    children: [
      { key: "kombinasi-1", label: "Eksplorasi Kontekstual", sub: "Tim basket — urutan penting?", icon: "ti-search" },
      { key: "kombinasi-2", label: "Aktivitas Deep Learning", sub: "Hilangkan urutan berlebihan", icon: "ti-brain" },
      { key: "kombinasi-3", label: "Penjelasan Konsep", sub: "Rumus & sifat kombinasi", icon: "ti-book" },
      { key: "kombinasi-4", label: "Contoh Soal Bertahap", sub: "Latihan dari mudah ke HOTS", icon: "ti-stairs-up" },
      { key: "kombinasi-5", label: "Mengapa? Corner", sub: "Kenapa dibagi r!?", icon: "ti-question-mark" },
      { key: "kombinasi-6", label: "Permutasi vs Kombinasi", sub: "Panduan definitif", icon: "ti-table" },
      { key: "kombinasi-7", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles" },
    ],
  },
];

export default function KombinasiPage() {
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Seed + Fetch status ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Seed student_section_status rows (idempotent)
        await fetch("/api/materi/kombinasi/seed");

        if (cancelled) return;

        // 2. Fetch status dari backend
        const res = await fetch("/api/kombinasi/status");
        if (!res.ok || cancelled) return;

        const data: KombinasiStatusResponse = await res.json();

        // Build completed sections map
        const cs: Record<number, boolean> = {};

        const sectionOrder = [
          "eksplorasi_kontekstual",
          "aktivitas_deep_learning",
          "penjelasan_konsep",
          "contoh_soal",
          "mengapa_corner",
          // permutasi_vs_kombinasi is skipped (read-only, not in DB)
          "refleksi_mini",
        ];

        sectionOrder.forEach((section, i) => {
          if (data.sections[section] === "completed") {
            // Map DB section index to UI section index (permutasi_vs_kombinasi at index 5 shifts refleksi_mini)
            const uiIndex = section === "refleksi_mini" ? 6 : i;
            cs[uiIndex] = true;
          }
        });

        setCompletedSections(cs);
      } catch (err) {
        console.error("[kombinasi-page] init error:", err);
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const pageContent = (
    <div ref={contentRef} style={{ padding: "32px 12px 80px", margin: "0 auto" }}>
      <SelectionToolbar contentRef={contentRef} />
      <div className="rounded-xl border border-[#346739] bg-white p-6 sm:p-8">
        <KombinasiContent
          initialCompletedSections={isCheckingStatus ? {} : completedSections}
        />
      </div>
    </div>
  );

  return (
    <ChatbotShell
      activeKey="kombinasi-1"
      completedKeys={new Set()}
      tocSections={KOMBINASI_TOC}
      materiSlug="kombinasi"
    >
      {pageContent}
    </ChatbotShell>
  );
}
