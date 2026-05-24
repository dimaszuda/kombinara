"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const materiData: Record<string, any> = {
  "kaidah-pencacahan": {
    title: "Kaidah Pencacahan",
    icon: "/images/Kaidah pencacahan.png",
    description: "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
    content: `
      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Pengertian Kaidah Pencacahan</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        Kaidah pencacahan adalah aturan menghitung banyaknya cara suatu kejadian dapat terjadi. Dengan kaidah pencacahan, kita dapat menentukan banyaknya hasil tanpa menuliskan semua hasil satu per satu.
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Prinsip Dasar</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Ada dua prinsip dasar dalam kaidah pencacahan:
      </p>
      <ul style="font-size: 14px; line-height: 1.8; margin-bottom: 16px; margin-left: 20px;">
        <li><strong>Prinsip Penjumlahan:</strong> Jika suatu pekerjaan dapat dilakukan dengan m cara atau n cara, maka banyaknya cara melakukan pekerjaan tersebut adalah (m + n) cara.</li>
        <li><strong>Prinsip Perkalian:</strong> Jika suatu pekerjaan dapat dilakukan dengan m cara, dan untuk setiap cara tersebut dapat dilanjutkan dengan n cara, maka banyaknya cara melakukan pekerjaan tersebut adalah (m × n) cara.</li>
      </ul>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Contoh Soal</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Seorang siswa memiliki 3 pilihan baju, 2 pilihan celana, dan 4 pilihan sepatu. Berapa banyak cara siswa tersebut dapat berpakaian lengkap?
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong>Jawab:</strong> Menggunakan prinsip perkalian, banyaknya cara = 3 × 2 × 4 = 24 cara.
      </p>
    `,
  },
  "permutasi": {
    title: "Permutasi",
    icon: "/images/permutasi.png",
    description: "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
    content: `
      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Pengertian Permutasi</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        Permutasi adalah banyaknya cara menyusun objek-objek dengan memperhatikan urutan. Permutasi merupakan bagian dari kaidah pencacahan yang digunakan ketika urutan sangat penting.
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Rumus Permutasi</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Permutasi r objek dari n objek dinotasikan dengan P(n,r) atau <sup>n</sup>P<sub>r</sub>
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong>Rumus:</strong> P(n,r) = n! / (n-r)!
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Contoh Soal</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Berapa banyak cara menyusun 3 huruf dari 5 huruf A, B, C, D, E?
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong>Jawab:</strong> P(5,3) = 5! / (5-3)! = 5! / 2! = (5 × 4 × 3 × 2 × 1) / (2 × 1) = 60 cara.
      </p>
    `,
  },
  "kombinasi": {
    title: "Kombinasi",
    icon: "/images/kombinasi.png",
    description: "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
    content: `
      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Pengertian Kombinasi</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        Kombinasi adalah banyaknya cara memilih objek-objek tanpa memperhatikan urutan. Kombinasi merupakan bagian dari kaidah pencacahan yang digunakan ketika urutan tidak penting.
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Rumus Kombinasi</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Kombinasi r objek dari n objek dinotasikan dengan C(n,r) atau <sup>n</sup>C<sub>r</sub>
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong>Rumus:</strong> C(n,r) = n! / (r! × (n-r)!)
      </p>

      <h3 style="font-size: 24px; font-weight: 600; color: #346739; margin-top: 24px; margin-bottom: 12px;">Contoh Soal</h3>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
        Berapa banyak cara memilih 3 orang dari 5 orang untuk membentuk sebuah tim?
      </p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        <strong>Jawab:</strong> C(5,3) = 5! / (3! × 2!) = (5 × 4 × 3 × 2 × 1) / ((3 × 2 × 1) × (2 × 1)) = 10 cara.
      </p>
    `,
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
        <Link href="/dashboard/siswa">
          <button style={{ padding: "10px 20px", marginTop: "16px", cursor: "pointer" }}>
            Kembali
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link href="/dashboard/siswa">
          <button style={{
            background: "none",
            border: "none",
            color: "#346739",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "16px",
            padding: "0",
          }}>
            ← Kembali
          </button>
        </Link>
        
        <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              color: "#346739",
              fontSize: "48px",
              fontWeight: 700,
              marginTop: 0,
              marginBottom: "12px",
            }}>
              {materi.title}
            </h1>
            <p style={{
              color: "#666",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: 0,
            }}>
              {materi.description}
            </p>
          </div>
          {materi.icon && (
            <div style={{ flexShrink: 0 }}>
              <Image
                src={materi.icon}
                alt={materi.title}
                width={150}
                height={150}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        lineHeight: "1.8",
      }}>
        <div dangerouslySetInnerHTML={{ __html: materi.content }} />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginTop: "32px",
      }}>
        <Link href={`/dashboard/siswa/quiz`}>
          <button style={{
            backgroundColor: "#346739",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d5a2e")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#346739")}
          >
            Mulai Quiz
          </button>
        </Link>
        <Link href={`/dashboard/siswa/ulangan`}>
          <button style={{
            backgroundColor: "white",
            color: "#346739",
            border: "2px solid #346739",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#346739";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#346739";
          }}
          >
            Mulai Ulangan
          </button>
        </Link>
      </div>
    </div>
  );
}
