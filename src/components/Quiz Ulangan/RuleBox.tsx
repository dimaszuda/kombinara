"use client";

import React from "react";

// ============================================================================
// RuleBox — reusable "Diperbolehkan" / "Tidak Diperbolehkan" card
// ============================================================================

interface RuleBoxProps {
  title: string;
  items: string[];
  type: "allowed" | "forbidden";
}

export default function RuleBox({ title, items, type }: RuleBoxProps) {
  const ok = type === "allowed";
  const color = ok ? "#346739" : "#b91c1c";
  const bg = ok ? "#f3fff1" : "#fff5f5";
  const border = ok ? "#d4e8d4" : "#fecaca";

  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 12,
        border: `1.5px solid ${border}`,
        padding: "14px 16px",
      }}
    >
      <h4
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          margin: "0 0 10px",
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              color,
              display: "flex",
              gap: 8,
              marginBottom: i < items.length - 1 ? 8 : 0,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {ok ? "✓" : "✕"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
