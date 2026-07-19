/**
 * IntegrityBlockingModal — full-overlay blocking modal for paste detection.
 *
 * Blocks the active question area with a full overlay when a paste event
 * is detected. Must be manually dismissed by the student clicking
 * "Saya Mengerti". The overlay uses pointer-events to prevent interaction
 * with answers beneath.
 *
 * Copy is neutral: explains that paste activity is logged, does NOT claim
 * the answer will be automatically disqualified.
 */

"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IntegrityBlockingModalData {
  message: string;
  timestamp: number;
}

interface IntegrityBlockingModalProps {
  modal: IntegrityBlockingModalData;
  onDismiss: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntegrityBlockingModal({
  modal,
  onDismiss,
}: IntegrityBlockingModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Peringatan Aktivitas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          maxWidth: 420,
          width: "100%",
          padding: "28px 24px 24px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "#f3e8f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#663362"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1a3d1c",
            margin: "0 0 8px",
          }}
        >
          Aktivitas Tercatat
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#5a7d5c",
            lineHeight: 1.7,
            margin: "0 0 20px",
          }}
        >
          {modal.message}
        </p>

        <div
          style={{
            backgroundColor: "#f8fdf8",
            borderRadius: 10,
            border: "1px solid #d4e8d4",
            padding: "12px 14px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#6b8f6d",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#346739" }}>Catatan:</strong> Aktivitas
            menempel (paste) teks telah tercatat dan dapat ditinjau oleh
            gurumu nanti. Keputusan penilaian sepenuhnya ada pada guru, bukan
            sistem otomatis.
          </p>
        </div>

        <button
          onClick={onDismiss}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 32px",
            backgroundColor: "#663362",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}
