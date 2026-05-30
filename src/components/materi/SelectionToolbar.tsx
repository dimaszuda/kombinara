"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ToolbarPos {
  x: number;
  y: number;
}

interface SelectionToolbarProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export default function SelectionToolbar({ contentRef }: SelectionToolbarProps) {
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    // Defer slightly so the browser finalises the selection range
    setTimeout(() => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setPos(null);
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        setPos(null);
        return;
      }

      const range = selection.getRangeAt(0);

      // Only show toolbar when the selection is inside the materi content area
      if (
        !contentRef.current ||
        !contentRef.current.contains(range.commonAncestorContainer)
      ) {
        setPos(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }, 0);
  }, [contentRef]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Do not hide when the user is clicking on the toolbar itself
      if (toolbarRef.current?.contains(e.target as Node)) return;
      setPos(null);
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  if (!pos) return null;

  return (
    <div
      ref={toolbarRef}
      // preventDefault keeps the text selection (blue highlight) alive
      // when the user clicks a button inside the toolbar
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: "translateX(-50%) translateY(calc(-100% - 10px))",
        zIndex: 9999,
        backgroundColor: "#79AE6F",
        borderRadius: "10px",
        padding: "5px 6px",
        display: "flex",
        alignItems: "center",
        gap: "2px",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.28), 0 1px 6px rgba(0,0,0,0.18)",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Arrow pointing downward */}
      <span
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #79AE6F",
        }}
      />

      <ToolbarButton
        icon="✨"
        label="Tanya AI"
        onClick={() => {
          console.log("berhasil dijalankan");
        }}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#346739" : "transparent",
        border: "none",
        color: "black",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        padding: "5px 12px",
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "background 0.15s",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: "14px" }}>{icon}</span>
      {label}
    </button>
  );
}
