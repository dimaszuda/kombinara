/**
 * IntegrityToast — non-blocking toast notification for integrity events.
 *
 * Appears top-right when the integrity monitor detects an event that
 * warrants user awareness (fullscreen exit > 5s, page hidden > 5s).
 *
 * Auto-dismisses after ~4.5 seconds. Tone is neutral — never implies
 * cheating, only that activity is being logged for teacher review.
 */

"use client";

import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IntegrityToast {
  message: string;
  timestamp: number;
}

interface IntegrityToastProps {
  toast: IntegrityToast;
  onDismiss: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntegrityToast({ toast, onDismiss }: IntegrityToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Enter animation
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 4.5s
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast.timestamp, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 340,
        backgroundColor: "#2d2d2d",
        color: "#f0ede8",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 13,
        lineHeight: 1.5,
        fontWeight: 500,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        border: "1px solid #4a4a4a",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        opacity: visible && !exiting ? 1 : 0,
        transform:
          visible && !exiting
            ? "translateY(0)"
            : "translateY(-12px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: "auto",
      }}
    >
      {/* Icon — neutral clipboard */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: 1, opacity: 0.7 }}
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
      <span>{toast.message}</span>
    </div>
  );
}
