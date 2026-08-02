"use client";

import React, { useRef } from "react";
import Link from "next/link";
import PenutupContent from "@/components/materi/sections/penutup/Penutup";

export default function PenutupPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={contentRef} style={{ padding: "32px 12px 80px", margin: "0 auto" }}>
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
}
