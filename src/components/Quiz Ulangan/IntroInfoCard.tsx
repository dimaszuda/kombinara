"use client";

import React from "react";

// ============================================================================
// IntroInfoCard — reusable info card for IntroScreen (durasi, jumlah soal, etc.)
// ============================================================================

interface IntroInfoCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
}

export default function IntroInfoCard({
  icon,
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
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontSize: 10,
          color,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.7,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
