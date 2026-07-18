"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface AccessCheckResponse {
  allowed: boolean;
  missingSections: Array<{ conceptId: string; section: string }>;
  summary: { totalRequired: number; completed: number; missing: number };
}

interface AktivitasSiswaAccessGateProps {
  conceptId: string;
  /** Slug used to build the "back to material" link. Defaults to "kaidah-pencacahan". */
  materialSlug?: string;
  children: React.ReactNode;
}

// ── Color palette (matching the aktivitas_siswa pages) ──────────────────────

const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  border: "#e2e8f0",
  bg: "#f8fafc",
};

// ── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-75"
      />
    </svg>
  );
}

// ── Gate Component ──────────────────────────────────────────────────────────

export default function AktivitasSiswaAccessGate({
  conceptId,
  materialSlug = "kaidah-pencacahan",
  children,
}: AktivitasSiswaAccessGateProps) {
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const res = await fetch(
          `/api/aktivitas-siswa/check-access?concept_id=${encodeURIComponent(conceptId)}`
        );
        if (cancelled) return;

        if (!res.ok) {
          // Endpoint error or unsupported concept_id -- deny access for safety.
          setAccessAllowed(false);
          return;
        }

        const data: AccessCheckResponse = await res.json();
        if (cancelled) return;

        setAccessAllowed(data.allowed);
      } catch {
        if (!cancelled) {
          // Network error -- deny access for safety.
          setAccessAllowed(false);
        }
      }
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [conceptId]);

  // ── Loading state ──────────────────────────────────────────────────
  if (accessAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.white }}>
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm" style={{ color: C.green }}>
            Memeriksa akses aktivitas...
          </p>
        </div>
      </div>
    );
  }

  // ── Access denied ───────────────────────────────────────────────────
  if (!accessAllowed) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: C.white }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: "#fff5f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b45309"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#b45309",
                opacity: 0.7,
                margin: "0 0 6px",
              }}
            >
              Akses Terkunci
            </p>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#7c2d12",
                margin: "0 0 8px",
              }}
            >
              Selesaikan Materi Terlebih Dahulu
            </h1>
            <p style={{ fontSize: 14, color: "#9a7b5c", margin: 0, lineHeight: 1.7 }}>
              Kamu harus menyelesaikan section Contoh Soal pada materi Kaidah
              Perkalian sebelum dapat mengakses halaman Aktivitas Siswa ini.
            </p>
          </div>

          {/* Info card */}
          <div
            style={{
              backgroundColor: "#fffbeb",
              borderRadius: 12,
              border: "1.5px solid #fde68a",
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#92400e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#92400e",
                    margin: "0 0 4px",
                  }}
                >
                  Yang perlu diselesaikan:
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <li
                    style={{
                      fontSize: 13,
                      color: "#92400e",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#d97706",
                        flexShrink: 0,
                      }}
                    />
                    Kaidah Perkalian &mdash; Contoh Soal
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <Link
              href={`/siswa/materi/${materialSlug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 32px",
                backgroundColor: C.green,
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Kembali ke Materi
            </Link>
            <p style={{ marginTop: 10, fontSize: 12, color: "#9aada0" }}>
              Selesaikan Contoh Soal terlebih dahulu, lalu kembali ke halaman
              ini untuk mengerjakan aktivitas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Access granted ──────────────────────────────────────────────────
  return <>{children}</>;
}
