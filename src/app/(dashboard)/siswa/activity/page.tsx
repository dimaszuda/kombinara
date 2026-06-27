"use client";

import Image from "next/image";
import Link from "next/link";
import { MATERI_CARDS } from "@/lib/data/siswa-dashboard";

const ACTIVITY_CARDS = [
  {
    ...MATERI_CARDS[0],
    tujuan:
      "Setelah menyelesaikan aktivitas ini, siswa mampu membedakan situasi yang memerlukan aturan penjumlahan dan aturan perkalian berdasarkan analisis konteks, bukan sekadar mengenali kata kunci.",
  },
  {
    ...MATERI_CARDS[1],
    tujuan:
      "Setelah menyelesaikan aktivitas ini, siswa mampu menentukan banyaknya susunan berbeda dari sejumlah objek dengan memperhatikan urutan penyusunnya.",
  },
  {
    ...MATERI_CARDS[2],
    tujuan:
      "Setelah menyelesaikan aktivitas ini, siswa mampu menentukan banyaknya cara memilih beberapa objek dari suatu himpunan tanpa memperhatikan urutan penyusunnya.",
  },
];

export default function ActivityPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Activity Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pilih Aktivitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACTIVITY_CARDS.map((card, index) => (
            <div
              key={card.id}
              className="relative rounded-2xl overflow-hidden bg-[#EDFCE7] border border-green-100 flex flex-col"
              style={{ minHeight: 340 }}
            >
              {/* Decorative bottom-left blob */}
              <div
                className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-green-200 opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none"
                aria-hidden
              />
              {/* Decorative dots */}
              <div
                className="absolute bottom-16 right-4 grid grid-cols-4 gap-1 pointer-events-none"
                aria-hidden
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-green-300 opacity-60 inline-block"
                  />
                ))}
              </div>

              {/* Card Body */}
              <div className="relative z-10 p-6 flex flex-col flex-1">
                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white rounded-full px-3 py-1 w-fit shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#346739] inline-block" />
                  Materi {index + 1}
                </span>

                {/* Title + Icon row */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-extrabold text-green-800 leading-tight">
                    {card.title}
                  </h3>
                  <Image
                    src={card.image}
                    alt={card.alt}
                    width={28}
                    height={28}
                    className="object-contain shrink-0"
                  />
                </div>

                {/* Tujuan Aktivitas */}
                <div className="flex-1 mb-4 bg-white rounded-lg p-3">
                  <p className="text-xs font-bold mb-1" style={{ color: "#663362" }}>
                    🎯 Tujuan Aktivitas:
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{card.tujuan}</p>
                </div>

                {/* CTA Button */}
                <Link
                  href={card.activity}
                  className="flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white font-semibold text-sm rounded-xl py-3 px-4 transition-colors"
                >
                  Mulai Aktivitas
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8l4 4-4 4M8 12h8" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
