/**
 * Simple markdown-to-HTML converter untuk rendering chat AI.
 *
 * Hanya menangani formatting dasar yang mungkin muncul dari respons LLM:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - # / ## / ### headings → heading tags
 * - - / * unordered list items
 * - 1. ordered list items
 * - \n\n → paragraph breaks
 *
 * Math $...$ dan $$...$$ TIDAK disentuh — dilewatkan ke RichText untuk KaTeX.
 */

/** Placeholder unik untuk melindungi math block saat parsing markdown */
const MATH_PLACEHOLDER_PREFIX = "⧼MATH⧽";

/**
 * Konversi markdown sederhana ke HTML.
 * Math $...$ dan $$...$$ tidak diubah — biarkan RichText yang render KaTeX.
 */
export function markdownToHtml(raw: string): string {
  // ── 1. Lindungi math blocks ──
  const mathBlocks: string[] = [];
  let protected_ = raw;

  // $$...$$ block math dulu (multi-line)
  protected_ = protected_.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push(`$$${math}$$`);
    return `${MATH_PLACEHOLDER_PREFIX}${idx}⧼END⧽`;
  });

  // $...$ inline math
  protected_ = protected_.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push(`$${math}$`);
    return `${MATH_PLACEHOLDER_PREFIX}${idx}⧼END⧽`;
  });

  // ── 2. Escape HTML ──
  let html = protected_
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // ── 3. Headings ──
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^# (.+)$/gm, "<h2>$1</h2>");

  // ── 4. Bold & italic (sebelum list processing) ──
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // ── 5. Unordered list (- item / * item) ──
  // Deteksi blok list: kumpulan baris berurutan yang diawali - atau *
  html = html.replace(/((?:^[-*] .+$\n?)+)/gm, (block) => {
    const items = block
      .split("\n")
      .filter((line) => /^[-*] /.test(line))
      .map((line) => `<li>${line.replace(/^[-*] /, "").trim()}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // ── 6. Ordered list (1. item) ──
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (block) => {
    const items = block
      .split("\n")
      .filter((line) => /^\d+\. /.test(line))
      .map((line) => `<li>${line.replace(/^\d+\. /, "").trim()}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // ── 7. Paragraph breaks (double newline) ──
  html = html.replace(/\n\n+/g, "</p><p>");
  // Wrap dalam <p> jika belum
  html = `<p>${html}</p>`;
  // Bersihkan <p> kosong dan nested <p>
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<[houl])/g, "$1");
  html = html.replace(/(<\/[houl]>)(?!\s*$)/g, "$1<p>");
  html = html.replace(/<p>\s*$/, "");

  // ── 8. Line break (single newline) ──
  html = html.replace(/\n/g, "<br>");

  // ── 9. Kembalikan math blocks ──
  html = html.replace(
    new RegExp(`${escapeRegex(MATH_PLACEHOLDER_PREFIX)}(\\d+)⧼END⧽`, "g"),
    (_, idx) => mathBlocks[parseInt(idx, 10)]
  );

  return html;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
