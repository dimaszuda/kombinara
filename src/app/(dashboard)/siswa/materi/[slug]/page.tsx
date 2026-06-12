"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import ChatbotShell from "@/components/materi/ChatbotShell";

interface MateriPage {
  title: string;
  content: string;
}

interface MateriItem {
  title: string;
  icon: string;
  description: string;
  pages: MateriPage[];
}

const materiData: Record<string, MateriItem> = {
  "kaidah-pencacahan": {
    title: "Kaidah Pencacahan",
    icon: "/images/Kaidah pencacahan.png",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
    pages: [
      {
        title: "Pengertian & Latar Belakang",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Apa itu Kaidah Pencacahan?</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Kaidah pencacahan adalah aturan menghitung banyaknya cara suatu kejadian dapat terjadi. Dengan kaidah ini, kita tidak perlu menuliskan semua kemungkinan satu per satu — cukup dengan perhitungan sistematis.
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Dalam kehidupan sehari-hari, kita sering menghadapi pertanyaan seperti: <em>"Berapa banyak password yang bisa dibuat dari 4 digit angka?"</em> — inilah yang dijawab oleh kaidah pencacahan.
          </p>
        `,
      },
      {
        title: "Prinsip Penjumlahan & Perkalian",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Prinsip Penjumlahan</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Jika suatu pekerjaan dapat dilakukan dengan <strong>m cara</strong> atau <strong>n cara</strong> (tidak bersamaan), maka total cara = <strong>(m + n) cara</strong>.
          </p>
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 20px; margin-bottom: 12px;">Prinsip Perkalian</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Jika terdapat beberapa tahap berurutan, banyaknya cara = <strong>hasil kali</strong> cara di tiap tahap.
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 0;">
            <strong>Contoh:</strong> 3 baju × 2 celana × 4 sepatu = <strong>24 cara</strong> berpakaian.
          </p>
        `,
      },
      {
        title: "Contoh Soal",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Soal 1</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 8px;">
            Dari kota A ke B ada 3 rute, dari B ke C ada 4 rute. Berapa cara perjalanan A ke C via B?
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 20px;"><strong>Jawab:</strong> 3 × 4 = 12 cara</p>

          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Soal 2</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 8px;">
            Menu terdiri dari 4 makanan dan 3 minuman. Berapa kombinasi menu?
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 0;"><strong>Jawab:</strong> 4 × 3 = 12 kombinasi</p>
        `,
      },
    ],
  },
  "permutasi": {
    title: "Permutasi",
    icon: "/images/permutasi.png",
    description:
      "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
    pages: [
      {
        title: "Pengertian Permutasi",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Apa itu Permutasi?</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Permutasi adalah banyaknya cara menyusun objek-objek dengan <strong>memperhatikan urutan</strong>. Permutasi digunakan ketika urutan sangat penting — AB berbeda dengan BA.
          </p>
        `,
      },
      {
        title: "Rumus & Contoh Soal",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Rumus Permutasi</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Permutasi r objek dari n objek:
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 20px;">
            <strong>P(n,r) = n! / (n-r)!</strong>
          </p>
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Contoh Soal</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 8px;">
            Berapa banyak cara menyusun 3 huruf dari 5 huruf A, B, C, D, E?
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 0;">
            <strong>Jawab:</strong> P(5,3) = 5! / 2! = 60 cara.
          </p>
        `,
      },
    ],
  },
  "kombinasi": {
    title: "Kombinasi",
    icon: "/images/kombinasi.png",
    description:
      "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
    pages: [
      {
        title: "Pengertian Kombinasi",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Apa itu Kombinasi?</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            Kombinasi adalah banyaknya cara memilih objek-objek <strong>tanpa memperhatikan urutan</strong>. AB sama dengan BA dalam kombinasi.
          </p>
        `,
      },
      {
        title: "Rumus & Contoh Soal",
        content: `
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Rumus Kombinasi</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 14px;">
            <strong>C(n,r) = n! / (r! × (n-r)!)</strong>
          </p>
          <h3 style="font-size: 22px; font-weight: 700; color: #346739; margin-top: 0; margin-bottom: 12px;">Contoh Soal</h3>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 8px;">
            Berapa cara memilih 3 orang dari 5 orang untuk membentuk tim?
          </p>
          <p style="font-size: 15px; line-height: 1.75; margin-bottom: 0;">
            <strong>Jawab:</strong> C(5,3) = 5! / (3! × 2!) = 10 cara.
          </p>
        `,
      },
    ],
  },
};

export default function MateriDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const materi = materiData[params.slug];

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

  const totalPages = materi.pages.length;
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

      {/* Sections — all rendered sequentially */}
      <div ref={contentRef}>
        {materi.pages.map((page, i) => {
          const sectionProgress = ((i + 1) / totalPages) * 100;
          return (
            <div key={i} style={{ marginBottom: "40px" }}>
              {/* Sub-materi label + fill bar */}
              <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                {page.title}
              </p>
              <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${sectionProgress}%`,
                    background: "#346739",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* Content Card */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "32px",
                  border: "1px solid #e8e8e8",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mulai Quiz — paling bawah */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Link href="/siswa/quiz">
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              borderRadius: "30px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              background: "#346739",
              color: "white",
              border: "2px solid #346739",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d5a2e")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#346739")}
          >
            Mulai Quiz →
          </button>
        </Link>
      </div>
    </div>
    </ChatbotShell>
  );
}