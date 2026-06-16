"use client";

import { useMemo } from "react";
import katex from "katex";

interface RichTextProps {
  /** Teks yang bisa mengandung HTML dan math $...$ atau $$...$$ */
  children: string;
  /** Class tambahan untuk wrapper */
  className?: string;
}

/**
 * RichText — merender string dengan:
 * - HTML markup (via dangerouslySetInnerHTML, aman karena konten statis)
 * - Inline math $...$ dan block math $$...$$ via KaTeX
 */
export function RichText({ children, className = "" }: RichTextProps) {
  const rendered = useMemo(() => renderMixedContent(children), [children]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

/**
 * Parse string menjadi array segment { type: "text" | "math", content: string }
 */
function parseSegments(input: string): { type: "text" | "math"; content: string; displayMode?: boolean }[] {
  const segments: { type: "text" | "math"; content: string; displayMode?: boolean }[] = [];

  // Regex: tangkap $$...$$ dulu (block), lalu $...$ (inline)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Teks sebelum math
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("$$") && raw.endsWith("$$")) {
      // Block math
      segments.push({ type: "math", content: raw.slice(2, -2), displayMode: true });
    } else {
      // Inline math
      segments.push({ type: "math", content: raw.slice(1, -1) });
    }

    lastIndex = match.index + raw.length;
  }

  // Sisa teks setelah math terakhir
  if (lastIndex < input.length) {
    segments.push({ type: "text", content: input.slice(lastIndex) });
  }

  return segments;
}

/**
 * Render campuran teks dan math menjadi HTML string
 */
function renderMixedContent(input: string): string {
  const segments = parseSegments(input);
  return segments
    .map((seg) => {
      if (seg.type === "math") {
        try {
          return katex.renderToString(seg.content, {
            throwOnError: false,
            displayMode: seg.displayMode ?? false,
            output: "html",
          });
        } catch {
          // Fallback: tampilkan raw LaTeX jika gagal
          return `<code>${escapeHtml(seg.content)}</code>`;
        }
      }
      // Teks sudah mengandung HTML, return apa adanya
      return seg.content;
    })
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
