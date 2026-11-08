"use client";

import React from "react";

// ============================================================================
// IntroInfoCard — reusable info card for IntroScreen (durasi, jumlah soal, etc.)
// ============================================================================

interface IntroInfoCardProps {
  label: string;
  value: string;
  color: string;
  bg: string;
}

export default function IntroInfoCard({
  label,
  value,
  color,
  bg,
}: IntroInfoCardProps) {
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
