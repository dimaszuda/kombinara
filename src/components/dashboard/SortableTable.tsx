"use client";

import React, { useState, useMemo, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => ReactNode;
  /** fixed width hint */
  width?: string;
}

type SortDir = "asc" | "desc" | null;

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T, index: number) => string | number;
  maxHeight?: number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  fontSize?: number;
  minWidth?: number;
}

// ═══════════════════════════════════════════════════════════════
// Pastel alternating colors
// ═══════════════════════════════════════════════════════════════

const ROW_EVEN = "#F4FAF5";
const ROW_ODD = "#ffffff";
const HEADER_BG = "#ffffff";
const BORDER_COLOR = "#F2F2F2";
const HEADER_BORDER = "#E8E8E8";
const TEXT_MUTED = "#8A8A8A";
const TEXT_PRIMARY = "#333";
const TEXT_SECONDARY = "#666";

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function SortableTable<T>({
  columns,
  data,
  rowKey,
  maxHeight = 400,
  emptyMessage = "Belum ada data",
  stickyHeader = true,
  fontSize = 12.5,
  minWidth,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "id", { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const getSortSymbol = (key: string): string => {
    if (sortKey !== key) return "↿⇂";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const getSortColor = (key: string): string => {
    if (sortKey !== key) return TEXT_MUTED;
    return TEXT_PRIMARY;
  };

  return (
    <div style={{ maxHeight, overflow: "auto", position: "relative" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize, ...(minWidth ? { minWidth } : {}) }}>
        {renderTable()}
      </table>
    </div>
  );

  function renderTable() {
    return (
      <>
        <thead>
          <tr style={{ textAlign: "left", color: TEXT_MUTED, fontWeight: 500 }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "7px 8px",
                  borderBottom: `1px solid ${HEADER_BORDER}`,
                  textAlign: col.align ?? "left",
                  position: stickyHeader ? "sticky" : "static",
                  top: 0,
                  zIndex: 2,
                  background: HEADER_BG,
                  whiteSpace: "nowrap",
                  ...(col.width ? { width: col.width } : {}),
                }}
              >
                {col.sortable !== false ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    title={`Urutkan ${col.label}`}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: getSortColor(col.key),
                      fontWeight: 500,
                      fontSize,
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {col.label}
                    <span style={{ fontSize: fontSize * 0.9, opacity: sortKey === col.key ? 1 : 0.5 }}>
                      {getSortSymbol(col.key)}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: "16px", textAlign: "center", color: TEXT_MUTED, fontSize }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, idx) => (
              <tr
                key={rowKey(item, idx)}
                style={{
                  background: idx % 2 === 0 ? ROW_ODD : ROW_EVEN,
                  transition: "background 0.15s ease",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "8px",
                      borderBottom: `1px solid ${BORDER_COLOR}`,
                      textAlign: col.align ?? "left",
                      color: col.key === columns[0]?.key ? TEXT_PRIMARY : TEXT_SECONDARY,
                    }}
                  >
                    {col.render ? col.render(item, idx) : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </>
    );
  }
}
