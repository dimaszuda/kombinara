"use client";

import React, { useEffect } from "react";

// ============================================================================
// EvaluatingScreen — reusable AI evaluation loading screen
// ============================================================================

interface EvaluatingScreenProps {
  /** Title shown below the spinner. Default: "Mengevaluasi Jawaban" */
  title?: string;
  /** Subtitle / description. Default explains AI evaluation process. */
  description?: string;
  /** Info card text. Default explains the rubric. */
  infoText?: string;
}

export default function EvaluatingScreen({
  title = "Mengevaluasi Jawaban",
  description = "Kombi sedang memeriksa jawabanmu menggunakan AI. Proses ini memakan waktu beberapa detik.",
  infoText = "Setiap jawaban dinilai berdasarkan rubrik: proses pengerjaan (identifikasi kondisi, pemilihan rumus, eksekusi perhitungan) dan jawaban akhir.",
}: EvaluatingScreenProps) {
  // ── beforeunload warning ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "60px 24px 48px",
        textAlign: "center",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "#f3e8f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          position: "relative",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#663362"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1.5s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#1a3d1c",
          margin: "0 0 10px",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#5a7d5c",
          margin: 0,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>

      {/* Info card */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: "#f8fdf8",
          borderRadius: 10,
          border: "1px solid #d4e8d4",
          padding: "14px 18px",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#346739"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1a3d1c",
                margin: "0 0 4px",
              }}
            >
              AI Evaluation in progress
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#6b8f6d",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {infoText}
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ Warning: do not close or refresh */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: "#fffbf0",
          borderRadius: 12,
          border: "2px solid #f59e0b",
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* Warning icon */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#92400e",
                margin: "0 0 8px",
              }}
            >
              Jangan Tutup atau Refresh Halaman!
            </p>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 18px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <li style={{ fontSize: 13, color: "#a16207", lineHeight: 1.6 }}>
                Jangan <strong>menutup tab</strong> atau <strong>browser</strong>
              </li>
              <li style={{ fontSize: 13, color: "#a16207", lineHeight: 1.6 }}>
                Jangan <strong>me-refresh</strong> halaman
              </li>
              <li style={{ fontSize: 13, color: "#a16207", lineHeight: 1.6 }}>
                Jangan <strong>menekan tombol Back</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
