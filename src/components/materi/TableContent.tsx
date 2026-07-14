"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TocSection {
  /** Unique key untuk tracking completion (cocokkan dengan statusKey dari API) */
  key: string;
  label: string;
  sub: string;
  icon: string;
  /** DOM id target untuk scroll-to. undefined = tidak bisa di-scroll (header only) */
  targetId?: string;
  /** Sub-sections (indented) */
  children?: TocSection[];
}

// ─── TOC Data untuk Kaidah Pencacahan ─────────────────────────────────────────
const TOC_SECTIONS: TocSection[] = [
  {
    key: "asesmen",
    label: "Asesmen Diagnostik",
    sub: "Ukur pemahaman awal sebelum mulai belajar",
    icon: "ti-clipboard-check",
    targetId: "asesmen-diagnostik",
  },
  {
    key: "apersepsi",
    label: "Apersepsi dan Pemantik",
    sub: "Bangun koneksi & rasa ingin tahu",
    icon: "ti-flame",
    targetId: "apersepsi-pemantik",
    children: [
      { key: "apersepsi-sub", label: "Apersepsi", sub: "Eksplorasi situasi kontekstual", icon: "ti-bulb", targetId: "apersepsi-pemantik" },
      { key: "pemantik-sub", label: "Pemantik", sub: "Pertanyaan pemicu rasa ingin tahu", icon: "ti-rocket", targetId: "apersepsi-pemantik" },
      { key: "refleksi-sub", label: "Refleksi Sebelum Mulai", sub: "Renungkan sebelum masuk materi", icon: "ti-edit-circle", targetId: "apersepsi-pemantik" },
    ],
  },
  {
    key: "penjumlahan",
    label: "Kaidah Penjumlahan",
    sub: "Aturan pencacahan untuk pilihan saling lepas",
    icon: "ti-plus",
    targetId: "kaidah-penjumlahan",
    children: [
      { key: "penjumlahan-1", label: "Eksplorasi Kontekstual", sub: "Temukan pola dari situasi nyata", icon: "ti-search", targetId: "kaidah-penjumlahan" },
      { key: "penjumlahan-2", label: "Aktivitas Deep Learning", sub: "Eksplorasi mendalam & kolaborasi", icon: "ti-brain", targetId: "kaidah-penjumlahan" },
      { key: "penjumlahan-3", label: "Penjelasan Konsep", sub: "Pahami materi inti", icon: "ti-book", targetId: "kaidah-penjumlahan" },
      { key: "penjumlahan-4", label: "Contoh Soal Bertahap", sub: "Latihan dari mudah ke kompleks", icon: "ti-stairs-up", targetId: "kaidah-penjumlahan" },
      { key: "penjumlahan-5", label: "Mengapa Corner", sub: "Jawaban atas pertanyaan \"mengapa?\"", icon: "ti-question-mark", targetId: "kaidah-penjumlahan" },
      { key: "penjumlahan-6", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles", targetId: "kaidah-penjumlahan" },
    ],
  },
  {
    key: "perkalian",
    label: "Kaidah Perkalian",
    sub: "Aturan pencacahan untuk tahapan berurutan",
    icon: "ti-x",
    targetId: "kaidah-perkalian",
    children: [
      { key: "perkalian-1", label: "Eksplorasi Kontekstual", sub: "Temukan pola dari situasi nyata", icon: "ti-search", targetId: "kaidah-perkalian" },
      { key: "perkalian-2", label: "Aktivitas Deep Learning", sub: "Eksplorasi mendalam & kolaborasi", icon: "ti-brain", targetId: "kaidah-perkalian" },
      { key: "perkalian-3", label: "Penjelasan Konsep", sub: "Pahami materi inti", icon: "ti-book", targetId: "kaidah-perkalian" },
      { key: "perkalian-4", label: "Contoh Soal Bertahap", sub: "Latihan dari mudah ke kompleks", icon: "ti-stairs-up", targetId: "kaidah-perkalian" },
      { key: "perkalian-5", label: "Mengapa Corner", sub: "Jawaban atas pertanyaan \"mengapa?\"", icon: "ti-question-mark", targetId: "kaidah-perkalian" },
      { key: "perkalian-6", label: "Aktivitas Siswa", sub: "Kerjakan sesuai materi yang diselesaikan", icon: "ti-pencil", targetId: "kaidah-perkalian" },
      { key: "perkalian-7", label: "Panduan Cepat", sub: "Ringkasan langkah-langkah penting", icon: "ti-bolt", targetId: "kaidah-perkalian" },
      { key: "perkalian-8", label: "Refleksi Mini", sub: "Renungkan & rangkum belajar", icon: "ti-sparkles", targetId: "kaidah-perkalian" },
    ],
  },
];

/** Hitung total item (termasuk sub-item) untuk progress bar */
function countAllItems(sections: TocSection[]): number {
  let count = 0;
  for (const s of sections) {
    count++;
    if (s.children) count += s.children.length;
  }
  return count;
}
const TOTAL_ITEMS = countAllItems(TOC_SECTIONS);

/** Hitung berapa item yang completed */
function countCompleted(sections: TocSection[], completedKeys: Set<string>): number {
  let count = 0;
  for (const s of sections) {
    if (completedKeys.has(s.key)) count++;
    if (s.children) {
      for (const c of s.children) {
        if (completedKeys.has(c.key)) count++;
      }
    }
  }
  return count;
}

// ─── Portal Tooltip ───────────────────────────────────────────────────────────
function PortalTooltip({
  label,
  anchorRef,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        right: window.innerWidth - rect.left + 10,
      });
    }
  }, [anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
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

// ─── TOC Item ─────────────────────────────────────────────────────────────────
function TocItem({
  section,
  displayNumber,
  isActive,
  isCompleted,
  isLocked,
  isSubItem = false,
}: {
  section: TocSection;
  /** Nomor tampilan, e.g. "1", "2.3" */
  displayNumber: string;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  isSubItem?: boolean;
}) {
  const numBg = isActive
    ? "white"
    : isCompleted
    ? "rgba(255,255,255,0.55)"
    : "rgba(255,255,255,0.15)";

  const numColor = isActive ? "#4d8444" : "white";

  const labelOpacity = isLocked ? 0.4 : 0.93;
  const subOpacity   = isLocked ? 0.3 : 0.62;
  const iconOpacity  = isLocked ? 0.3 : isActive ? 1 : 0.65;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: isSubItem ? "8px 12px 8px 42px" : "10px 12px 10px 10px",
        borderRadius: 12,
        cursor: "default",
        position: "relative",
        zIndex: 1,
        background: isActive ? "rgba(255,255,255,0.24)" : "transparent",
        transition: "background 0.18s ease",
      }}
    >
      {/* Number bubble */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: numBg,
          color: numColor,
          fontSize: isSubItem ? 10 : 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1.5px solid rgba(255,255,255,0.4)",
          transition: "background 0.18s ease, color 0.18s ease",
        }}
      >
        {displayNumber}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: `rgba(255,255,255,${labelOpacity})`,
            fontSize: isSubItem ? 12.5 : 13.5,
            fontWeight: isSubItem ? 400 : 600,
            lineHeight: 1.3,
          }}
        >
          {section.label}
        </div>
        <div
          style={{
            color: `rgba(255,255,255,${subOpacity})`,
            fontSize: isSubItem ? 10.5 : 11.5,
            marginTop: 1,
          }}
        >
          {section.sub}
        </div>
      </div>

      {/* Right icon */}
      {isLocked ? (
        <i
          className="ti ti-lock"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
          aria-hidden="true"
        />
      ) : (
        <i
          className={`ti ${section.icon}`}
          style={{
            fontSize: 15,
            color: `rgba(255,255,255,${iconOpacity})`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── TOC List ─────────────────────────────────────────────────────────────────
function TocList({
  activeKey,
  completedKeys,
}: {
  activeKey: string | null;
  completedKeys: Set<string>;
}) {
  const completedCount = countCompleted(TOC_SECTIONS, completedKeys);
  const pct = TOTAL_ITEMS > 0 ? Math.round((completedCount / TOTAL_ITEMS) * 100) : 0;

  // Flatten sections dengan display number: 1, 2, 2.1, 2.2, 2.3, 3, 3.1, ...
  const flatItems: Array<{ section: TocSection; isSubItem: boolean; displayNumber: string }> = [];
  let mainNum = 0;
  for (const s of TOC_SECTIONS) {
    mainNum++;
    flatItems.push({ section: s, isSubItem: false, displayNumber: String(mainNum) });
    if (s.children) {
      let subNum = 0;
      for (const c of s.children) {
        subNum++;
        flatItems.push({ section: c, isSubItem: true, displayNumber: `${mainNum}.${subNum}` });
      }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Scrollable list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 6px",
          position: "relative",
        }}
      >
        {/* Vertical connector line — only behind main items */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 22,
            bottom: 22,
            width: 1.5,
            background: "rgba(255,255,255,0.25)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {flatItems.map(({ section, isSubItem, displayNumber }) => {
          const isCompleted = completedKeys.has(section.key);
          const isActive    = section.key === activeKey;

          // Locked logic: parent is locked if previous parent is not completed
          // Sub-item is locked if its parent is not completed
          let isLocked = false;
          if (isSubItem) {
            // Find parent
            const parent = TOC_SECTIONS.find((p) =>
              p.children?.some((c) => c.key === section.key)
            );
            if (parent && !completedKeys.has(parent.key) && parent.key !== activeKey) {
              isLocked = true;
            }
          } else {
            // Main section: locked if previous main section is not completed
            const idx = TOC_SECTIONS.findIndex((s) => s.key === section.key);
            if (idx > 0) {
              const prevKey = TOC_SECTIONS[idx - 1].key;
              if (!completedKeys.has(prevKey) && prevKey !== activeKey) {
                isLocked = true;
              }
            }
          }

          // Override: if it's completed or active, it's never locked
          if (isCompleted || isActive) isLocked = false;

          return (
            <TocItem
              key={section.key}
              section={section}
              displayNumber={displayNumber}
              isActive={isActive}
              isCompleted={isCompleted}
              isLocked={isLocked}
              isSubItem={isSubItem}
            />
          );
        })}
      </div>

      {/* Footer progress */}
      <div
        style={{
          marginTop: 12,
          padding: "14px 16px 0",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 11.5 }}>
            Progress belajar
          </span>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11.5, fontWeight: 500 }}>
            {completedCount} / {TOTAL_ITEMS}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "white",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TableContentProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  otherPanelOpen: boolean;
  /** Key dari section yang sedang aktif (sedang dikerjakan) */
  activeKey?: string | null;
  /** Set of section keys yang sudah completed */
  completedKeys?: Set<string>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TableContent({
  isOpen,
  onOpen,
  onClose,
  otherPanelOpen,
  activeKey = null,
  completedKeys = new Set(),
}: TableContentProps) {
  const [hovered, setHovered] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const headerContent = (
    <div style={{ flexShrink: 0 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
        }}
      >
        <button
          type="button"
          onClick={() => { setHovered(false); onClose(); }}
          style={{
            background: "rgba(0,0,0,0.12)",
            border: "none",
            cursor: "pointer",
            padding: 0,
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Tutup Daftar Isi"
        >
          <Image
            src="/icons/table of contents.png"
            alt=""
            width={22}
            height={22}
            style={{ objectFit: "contain", width: 16, height: 16 }}
          />
        </button>

        <span style={{ color: "white", fontWeight: 700, fontSize: 16, letterSpacing: "0.01em" }}>
          Daftar Isi
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.22)",
          margin: "0 16px",
        }}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <>
      {/* DESKTOP — toggle button */}
      {!isOpen && !otherPanelOpen && (
        <button
          ref={toggleRef}
          type="button"
          onClick={() => { setHovered(false); onOpen(); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="hidden md:flex"
          style={{
            position: "fixed",
            right: 14,
            top: "50%",
            transform: "translateY(90%)",
            background: "#79AE6F",
            border: "none",
            cursor: "pointer",
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: "10px 0 0 10px",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            boxShadow: "-2px 2px 10px rgba(0,0,0,0.15)",
          }}
          aria-label="Buka daftar isi"
        >
          <Image
            src="/icons/table of contents.png"
            alt=""
            width={28}
            height={28}
            style={{ objectFit: "contain", display: "block", width: 12, height: 12 }}
          />
        </button>
      )}

      {hovered && !isOpen && !otherPanelOpen && (
        <PortalTooltip label="Daftar Isi" anchorRef={toggleRef} />
      )}

      {/* MOBILE — toggle button */}
      {!isOpen && !otherPanelOpen && (
        <button
          type="button"
          onClick={() => { setHovered(false); onOpen(); }}
          className="flex md:hidden"
          style={{
            position: "fixed",
            bottom: 8,
            left: "50%",
            transform: "translateX(-110%)",
            background: "#79AE6F",
            border: "none",
            cursor: "pointer",
            padding: "12px 20px",
            height: 48,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            zIndex: 1000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
          aria-label="Buka Daftar Isi"
        >
          <Image
            src="/icons/table of contents.png"
            alt=""
            width={22}
            height={22}
            style={{ objectFit: "contain", display: "block" }}
          />
          <span style={{ color: "white", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
            Daftar Isi
          </span>
        </button>
      )}

      {/* MOBILE — backdrop */}
      <div
        className="block md:hidden"
        onClick={() => { setHovered(false); onClose(); }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1001,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* MOBILE — bottom-sheet panel */}
      <div
        className="flex md:hidden"
        style={{
          position: "fixed",
          bottom: isOpen ? 0 : "-82vh",
          left: 0,
          right: 0,
          height: "82vh",
          background: "#79AE6F",
          flexDirection: "column",
          zIndex: 1002,
          transition: "bottom 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.22)",
        }}
        aria-hidden={!isOpen}
      >
        {/* Mobile header — close button on the right */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "14px 16px",
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: 16, letterSpacing: "0.01em" }}>
              Daftar Isi
            </span>

            <button
              type="button"
              onClick={() => { setHovered(false); onClose(); }}
              style={{
                background: "rgba(0,0,0,0.12)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                width: 38,
                height: 38,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Tutup Daftar Isi"
            >
              <Image
                src="/icons/close panel.png"
                alt=""
                width={22}
                height={22}
                style={{ objectFit: "contain", width: 16, height: 16 }}
              />
            </button>
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.22)",
              margin: "0 16px",
            }}
            aria-hidden="true"
          />
        </div>

        <div style={{ height: 12, flexShrink: 0 }} />
        <TocList activeKey={activeKey} completedKeys={completedKeys} />
        <div style={{ height: 20, flexShrink: 0 }} />
      </div>

      {/* DESKTOP — right-side slide-in panel */}
      <div
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: 64,
          right: isOpen ? 0 : -340,
          width: 320,
          height: "calc(100vh - 64px)",
          background: "#79AE6F",
          flexDirection: "column",
          zIndex: 1000,
          transition: "right 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isOpen ? "-4px 0 24px rgba(0,0,0,0.18)" : "none",
          borderRadius: "16px 0 0 16px",
          overflow: "hidden",
        }}
        aria-hidden={!isOpen}
      >
        {headerContent}
        <div style={{ height: 12, flexShrink: 0 }} />
        <TocList activeKey={activeKey} completedKeys={completedKeys} />
        <div style={{ height: 16, flexShrink: 0 }} />
      </div>
    </>
  );
}