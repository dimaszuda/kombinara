"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

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

interface DownloadModulButtonProps {
  /** Apakah sidebar dalam keadaan expanded (menampilkan label teks) */
  expanded: boolean;
  /** Class tambahan untuk styling */
  className?: string;
}

/**
 * Tombol navigasi ke halaman Download Modul di sidebar.
 *
 * Klik tombol ini akan mengarahkan siswa ke halaman `/siswa/download`
 * yang berisi daftar modul yang bisa di-download beserta syarat penyelesaiannya.
 */
export default function DownloadModulButton({ expanded, className = "" }: DownloadModulButtonProps) {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleClick = () => {
    router.push("/siswa/download");
  };

  const tooltipLabel = "Download Modul";

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 16 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
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
          cursor: "pointer",
          width: "100%",
          borderRadius: 8,
          transition: "background-color 0.2s ease",
          backgroundColor: hovered ? "rgba(255,255,255,0.08)" : "transparent",
        }}
        aria-label="Halaman download modul"
        title="Download Modul"
      >
        {/* Ikon */}
        <span
          style={{
            flexShrink: 0,
            transform: expanded ? "translateX(0px)" : "translateX(8px)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            color: "white",
            display: "flex",
            alignItems: "center",
          }}
        >
          <DownloadIcon />
        </span>

        {/* Label teks */}
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: expanded ? 160 : 0,
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? "max-width 0.3s ease, opacity 0.2s ease 0.15s"
              : "opacity 0s, max-width 0.3s ease",
          }}
        >
          Download Modul
        </span>
      </button>

      {/* Tooltip saat sidebar collapsed dan hover */}
      {!expanded && hovered && <Tooltip label={tooltipLabel} anchorRef={buttonRef} />}
    </div>
  );
}
