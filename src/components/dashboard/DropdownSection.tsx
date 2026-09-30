"use client";

import { useState, type ReactNode } from "react";

interface DropdownSectionProps {
  title: string;
  /** Kondisi awal dropdown (default: terbuka) */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Bagian dashboard yang bisa dibuka/tutup (dropdown/akordeon).
 *
 * Header berupa baris judul + chevron yang bisa diklik; konten dianimasikan
 * dengan trik CSS `grid-template-rows: 0fr → 1fr` (lihat kelas `.dd-*`
 * di globals.css). Diletakkan di kolom kiri dashboard (Kata Pengantar s.d.
 * Capaian dan Tujuan Pembelajaran).
 */
export default function DropdownSection({
  title,
  defaultOpen = true,
  children,
}: DropdownSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        className="dd-header"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="dd-title">{title}</span>
        <svg
          className={`dd-chevron${open ? " open" : ""}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#346739"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`dd-collapse${open ? " open" : ""}`}>
        <div className="dd-collapse-inner">{children}</div>
      </div>
    </section>
  );
}
