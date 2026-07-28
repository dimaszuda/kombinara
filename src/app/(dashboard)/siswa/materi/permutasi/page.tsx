"use client";

import { useRef } from "react";
import Link from "next/link";
import PermutasiContent from "@/components/materi/sections/permutasi/Permutasi";
import ChatbotShell from "@/components/materi/ChatbotShell";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import type { TocSection } from "@/components/materi/TableContent";

// ── TOC Data untuk Permutasi ─────────────────────────────────────
const PERMUTASI_TOC: TocSection[] = [
  {
    key: "permutasi",
    label: "Permutasi",
    sub: "Susunan objek dengan memperhatikan urutan",
    icon: "ti-math",
    children: [
      { key: "permutasi-1", label: "Eksplorasi Kontekstual (1)", sub: "Lomba lari — siapa juara?", icon: "ti-search" },
      { key: "permutasi-2", label: "Aktivitas Deep Learning (1)", sub: "Susunan huruf & temukan rumus", icon: "ti-brain" },
      { key: "permutasi-3", label: "Penjelasan Konsep (1)", sub: "Rumus P(n,r)", icon: "ti-book" },
      { key: "permutasi-4", label: "Eksplorasi (2): Password WiFi", sub: "Unsur yang sama", icon: "ti-search" },
      { key: "permutasi-5", label: "Deep Learning (2)", sub: "Pola permutasi unsur sama", icon: "ti-brain" },
      { key: "permutasi-6", label: "Penjelasan Konsep (2)", sub: "Rumus unsur sama", icon: "ti-book" },
      { key: "permutasi-7", label: "Eksplorasi (3): Meja Bundar", sub: "Susunan melingkar", icon: "ti-search" },
      { key: "permutasi-8", label: "Deep Learning (3)", sub: "Pola permutasi siklis", icon: "ti-brain" },
      { key: "permutasi-9", label: "Penjelasan Konsep (3)", sub: "Rumus siklis & kalung", icon: "ti-book" },
      { key: "permutasi-10", label: "Contoh Soal Bertahap", sub: "7 soal dari mudah ke HOTS", icon: "ti-stairs-up" },
      { key: "permutasi-11", label: "Mengapa? Corner", sub: "Mengapa urutan penting?", icon: "ti-question-mark" },
      { key: "permutasi-12", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles" },
    ],
  },
];

export default function PermutasiPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const pageContent = (
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
        <PermutasiContent />
      </div>
    </div>
  );

  return (
    <ChatbotShell
      activeKey={null}
      completedKeys={new Set()}
      tocSections={PERMUTASI_TOC}
      materiSlug="permutasi"
    >
      {pageContent}
    </ChatbotShell>
  );
}