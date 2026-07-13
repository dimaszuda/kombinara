"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import ChatbotShell from "@/components/materi/ChatbotShell";
import AsesmenDiagnostik from "@/components/materi/sections/kaidah-pencacahan/AsesmenDiagnostik";
import ApersepsiSection from "@/components/materi/sections/kaidah-pencacahan/ApersepsiPemantik";
import KaidahPenjumlahan from "@/components/materi/sections/kaidah-pencacahan/KaidahPenjumlahan";
import KaidahPerkalian from "@/components/materi/sections/kaidah-pencacahan/KaidahPerkalian";

interface MateriItem {
  title: string;
  icon: string;
  description: string;
}

const materiData: Record<string, MateriItem> = {
  "kaidah-pencacahan": {
    title: "Kaidah Pencacahan",
    icon: "/images/kaidah pencacahan.png",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
  },
  "faktorial": {
    title: "Faktorial",
    icon: "/images/faktorial.png",
    description:
      "Konsep perkalian bilangan berurutan menurun hingga 1, dasar penting untuk memahami permutasi dan kombinasi.",
  },
  "permutasi": {
    title: "Permutasi",
    icon: "/images/permutasi.png",
    description:
      "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
  },
  "kombinasi": {
    title: "Kombinasi",
    icon: "/images/kombinasi.png",
    description:
      "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
  },
};

/** Status respons dari /api/asesmen-diagnostik/status */
interface DiagnosticStatusResponse {
  status: "none" | "in_progress" | "passed" | "failed";
  lastScore: number | null;
  lastCorrectCount: number | null;
  lastTotalQuestions: number | null;
}

export default function MateriDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const materi = materiData[params.slug];
  const [passAssesmen, setPassAssesment] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Cek status diagnostik saat mount ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const res = await fetch("/api/asesmen-diagnostik/status");
        if (!res.ok) return;
        const data: DiagnosticStatusResponse = await res.json();
        if (!cancelled && data.status === "passed") {
          setPassAssesment(true);
        }
      } catch {
        // silent fail — biarkan default false
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    }
    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!materi) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>Materi tidak ditemukan</h1>
        <Link href="/siswa">
          <button style={{ padding: "10px 20px", marginTop: "16px", cursor: "pointer" }}>
            Kembali
          </button>
        </Link>
      </div>
    );
  }

  // ── Konten halaman (tanpa AI features) ─────────────────────────────
  const pageContent = (
    <div ref={contentRef} style={{ padding: "32px 12px 80px", margin: "0 auto" }}>
      {/* SelectionToolbar hanya aktif kalau sudah lulus asesmen */}
      {passAssesmen && <SelectionToolbar contentRef={contentRef} />}
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
      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "36px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "#346739", fontSize: "var(--materi-heading-size)", fontWeight: 700, marginTop: 0, marginBottom: "8px" }}>
            {materi.title}
          </h1>
          <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6", marginBottom: 0 }}>
            {materi.description}
          </p>
        </div>
        {materi.icon && (
          <div style={{ flexShrink: 0 }}>
            <Image src={materi.icon} alt={materi.title} width={120} height={120} />
          </div>
        )}
      </div>
      
      {/* Asesmen Diagnostik section */}
      <div key="Asesmen Diagnostik" style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
          Asesmen Diagnostik
        </p>
        <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
          <div
            style={{
              height: "100%",
              width: "25%",
              background: "#346739",
              borderRadius: "4px",
            }}
          />
        </div>
        {isCheckingStatus ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#888", fontSize: "14px" }}>
            Memeriksa status asesmen...
          </div>
        ) : (
          <AsesmenDiagnostik onPass={setPassAssesment} />
        )}
      </div>

      {/* Section terkunci: Apersepsi dan Pemantik */}
      <LockableSection
        unlocked={passAssesmen}
        label="Apersepsi dan Pemantik"
        progressWidth="50%"
      >
        <ApersepsiSection />
      </LockableSection>

      {/* Section terkunci: MATERI 1 */}
      <LockableSection
        unlocked={passAssesmen}
        label="MATERI 1 : KAIDAH PENJUMLAHAN"
        progressWidth="75%"
      >
        <KaidahPenjumlahan />
      </LockableSection>

      {/* Section terkunci: MATERI 2 */}
      <LockableSection
        unlocked={passAssesmen}
        label="MATERI 2 : KAIDAH PERKALIAN"
        progressWidth="100%"
      >
        <KaidahPerkalian />
      </LockableSection>
    </div>
  );

  // ── Bungkus dengan ChatbotShell hanya kalau sudah lulus asesmen ──────
  return passAssesmen ? (
    <ChatbotShell>{pageContent}</ChatbotShell>
  ) : (
    pageContent
  );
}

/**
 * Wrapper section yang terkunci sampai siswa lulus asesmen diagnostik.
 */
function LockableSection({
  unlocked,
  label,
  progressWidth,
  children,
}: {
  unlocked: boolean;
  label: string;
  progressWidth: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <p
        style={{
          fontSize: "12px",
          color: "#888",
          marginBottom: "6px",
          fontFamily: "monospace",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>
      <div
        style={{
          height: "4px",
          background: "#e0e0e0",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: unlocked ? progressWidth : "0%",
            background: unlocked ? "#346739" : "#e0e0e0",
            borderRadius: "4px",
            transition: "width 0.5s ease, background 0.5s ease",
          }}
        />
      </div>
      {unlocked ? (
        children
      ) : (
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "16px",
            padding: "40px 32px",
            border: "2px dashed #d1d5db",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#6b7280",
              margin: "0 0 8px",
            }}
          >
            Selesaikan Asesmen Diagnostik Terlebih Dahulu
          </p>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
            Kamu harus lulus asesmen diagnostik di atas untuk membuka section ini.
          </p>
        </div>
      )}
    </div>
  );
}