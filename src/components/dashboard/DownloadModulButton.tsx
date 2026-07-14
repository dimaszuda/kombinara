"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getModulDownloadUrl } from "@/lib/supabase/storage";

/**
 * Inline SVG icon untuk download.
 * Drop-in replacement untuk lucide-react `Download` icon.
 * Ukuran 16x16 agar konsisten dengan icon sidebar lainnya.
 */
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Tooltip via portal, identik dengan PortalTooltip di Sidebar.
 * Dirender di document.body agar tidak terpotong oleh overflow sidebar.
 */
function Tooltip({ label, anchorRef, offset = 10 }: {
  label: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  offset?: number;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + offset,
      });
    }
  }, [anchorRef, offset]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        backgroundColor: "rgba(30, 30, 30, 0.92)",
        color: "white",
        fontSize: 13,
        fontWeight: 500,
        padding: "5px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </div>,
    document.body
  );
}

type DownloadState = "idle" | "loading" | "error";

interface DownloadModulButtonProps {
  /** Apakah sidebar dalam keadaan expanded (menampilkan label teks) */
  expanded: boolean;
  /** Class tambahan untuk styling */
  className?: string;
}

/**
 * Tombol download modul PDF untuk sidebar.
 *
 * State handling:
 * - idle: Tampilan normal, siap diklik
 * - loading: Menampilkan spinner, tombol disabled
 * - error: Menampilkan indikator error, bisa diklik ulang untuk retry
 *
 * Setiap klik akan generate signed URL baru dari Supabase Storage,
 * lalu membuka URL tersebut di tab baru untuk memulai download.
 */
export default function DownloadModulButton({ expanded, className = "" }: DownloadModulButtonProps) {
  const [state, setState] = useState<DownloadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    setState("loading");
    setErrorMessage(null);

    try {
      const signedUrl = await getModulDownloadUrl();
      window.open(signedUrl, "_blank");
      setState("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengunduh modul.";
      setErrorMessage(message);
      setState("error");
    }
  };

  const isDisabled = state === "loading";

  const tooltipLabel =
    state === "loading"
      ? "Mengunduh..."
      : state === "error"
      ? errorMessage ?? "Gagal - Coba lagi"
      : "Download Modul";

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 16 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          background: "none",
          border: "none",
          cursor: isDisabled ? "not-allowed" : "pointer",
          width: "100%",
          borderRadius: 8,
          transition: "background-color 0.2s ease",
          backgroundColor: state === "error"
            ? "rgba(239, 68, 68, 0.15)"
            : hovered && !isDisabled
            ? "rgba(255,255,255,0.08)"
            : "transparent",
          opacity: isDisabled ? 0.6 : 1,
        }}
        aria-label="Download modul pembelajaran"
        title={state === "error" && errorMessage ? errorMessage : "Download modul pembelajaran"}
      >
        {/* Ikon */}
        <span
          style={{
            flexShrink: 0,
            transform: expanded ? "translateX(0px)" : "translateX(8px)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            color: state === "error" ? "#fca5a5" : "white",
            display: "flex",
            alignItems: "center",
          }}
        >
          {state === "loading" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : state === "error" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <DownloadIcon />
          )}
        </span>

        {/* Label teks */}
        <span
          style={{
            color: state === "error" ? "#fca5a5" : "white",
            fontSize: 14,
            fontWeight: state === "error" ? 500 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: expanded ? 160 : 0,
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? "max-width 0.3s ease, opacity 0.2s ease 0.15s"
              : "opacity 0s, max-width 0.3s ease",
          }}
        >
          {state === "loading"
            ? "Mengunduh..."
            : state === "error"
            ? "Gagal - Coba lagi"
            : "Download Modul"}
        </span>
      </button>

      {/* Tooltip saat sidebar collapsed dan hover */}
      {!expanded && hovered && <Tooltip label={tooltipLabel} anchorRef={buttonRef} />}

      {/* Keyframe untuk spinner animasi */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
