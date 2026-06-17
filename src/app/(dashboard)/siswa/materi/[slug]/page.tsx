"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import ChatbotShell from "@/components/materi/ChatbotShell";
import AsesmenDiagnostik from "@/components/materi/sections/kaidah-pencacahan/AsesmenDiagnostik";
import ApersepsiPemantik from "@/components/materi/sections/kaidah-pencacahan/ApersepsiPemantik";
import PenjelasanKonsep from "@/components/materi/sections/kaidah-pencacahan/PenjelasanKonsep";
import AktivitasDeepLearning from "@/components/materi/sections/kaidah-pencacahan/AktivitasDeepLearning";
import ContohSoalBertahap from "@/components/materi/sections/kaidah-pencacahan/ContohSoalBertahap";
import RefleksiMini from "@/components/materi/sections/kaidah-pencacahan/RefleksiMini";

interface MateriItem {
  title: string;
  icon: string;
  description: string;
}

const SECTIONS = [
  { title: "Asesmen Diagnostik", Component: AsesmenDiagnostik },
  { title: "Apersepsi & Pemantik", Component: ApersepsiPemantik },
  { title: "Penjelasan Konsep", Component: PenjelasanKonsep },
  { title: "Aktivitas Deep Learning", Component: AktivitasDeepLearning },
  { title: "Contoh Soal Bertahap", Component: ContohSoalBertahap },
  { title: "Refleksi Mini", Component: RefleksiMini },
];

const materiData: Record<string, MateriItem> = {
  "kaidah-pencacahan": {
    title: "Kaidah Pencacahan",
    icon: "/images/Kaidah pencacahan.png",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
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

export default function MateriDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const materi = materiData[params.slug];
  const [passAssesmen, setPassAssesment] = useState(false);

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

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <ChatbotShell>
    <div style={{ padding: "32px 24px 80px", margin: "0 auto" }}>
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
              width: "16%",
              background: "#346739",
              borderRadius: "4px",
            }}
          />
        </div>
        <AsesmenDiagnostik onPass={setPassAssesment} />
      </div>
    </div>
    </ChatbotShell>
  );
}