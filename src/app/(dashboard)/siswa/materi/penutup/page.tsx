"use client";

import React, { useRef } from "react";
import Link from "next/link";
import PenutupContent from "@/components/materi/sections/penutup/Penutup";
import ChatbotShell from "@/components/materi/ChatbotShell";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import type { TocSection } from "@/components/materi/TableContent";

// ── TOC Data untuk Penutup ──────────────────────────────────────
const PENUTUP_TOC: TocSection[] = [
  {
    key: "penutup",
    label: "Penutup Modul",
    sub: "Refleksi, rangkuman, dan glosarium",
    icon: "ti-flag",
    children: [
      { key: "penutup-tantangan", label: "Soal Tantangan", sub: "10 soal pemecahan masalah", icon: "ti-trophy", dotOnly: true },
      { key: "penutup-asesmen-diri", label: "Asesmen Diri", sub: "Checklist pemahaman materi", icon: "ti-clipboard-check", dotOnly: true },
      { key: "penutup-refleksi", label: "Refleksi Mendalam", sub: "6 pertanyaan reflektif", icon: "ti-lightbulb", dotOnly: true },
      { key: "penutup-rangkuman", label: "Rangkuman Konsep", sub: "Poin-poin penting", icon: "ti-book", dotOnly: true },
      { key: "penutup-glosarium", label: "Glosarium", sub: "Daftar istilah penting", icon: "ti-dictionary", dotOnly: true },
    ],
  },
];

export default function PenutupPage() {
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

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "24px",
          marginBottom: "36px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              color: "#346739",
              fontSize: "var(--materi-heading-size)",
              fontWeight: 700,
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Bagian Penutup Modul
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "15px",
              lineHeight: "1.6",
              marginBottom: 0,
            }}
          >
            Refleksi, rangkuman, dan glosarium untuk memperkuat pemahamanmu terhadap
            seluruh materi Kaidah Pencacahan.
          </p>
        </div>
      </div>

      {/* Main Content Wrapper — rounded-xl border like other materi */}
      <div className="rounded-xl border border-[#346739] bg-white p-6 sm:p-8">
        <PenutupContent />
      </div>
    </div>
  );

  return (
    <ChatbotShell
      tocSections={PENUTUP_TOC}
      materiSlug="penutup"
    >
      {pageContent}
    </ChatbotShell>
  );
}
