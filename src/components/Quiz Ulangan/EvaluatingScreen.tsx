"use client";

import React from "react";

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
      <p style={{ marginTop: 20, fontSize: 12, color: "#9aada0" }}>
        Mohon jangan menutup halaman ini.
      </p>
    </div>
  );
}
