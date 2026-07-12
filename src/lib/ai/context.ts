/**
 * DOM Selection Context Extractor
 *
 * Mengekstrak teks yang dipilih + 2-3 kalimat sebelum & sesudah
 * dari sebuah DOM Selection / Range.
 */

export interface SelectionContext {
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
}

/**
 * Kumpulkan semua text node dalam sebuah root element (depth-first).
 */
function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    nodes.push(node);
  }
  return nodes;
}

/**
 * Ambil n kalimat dari sebuah string teks.
 * Kalimat dipisahkan oleh . ! ? diikuti spasi atau akhir string.
 */
function takeSentences(text: string, count: number, fromEnd = false): string {
  if (!text) return "";

  // Split by sentence boundaries: .!? followed by space or end
  const sentences = text.match(/[^.!?\n]+[.!?]?(\s|$)/g) ?? [text];

  if (fromEnd) {
    return sentences.slice(-count).join("").trim();
  }
  return sentences.slice(0, count).join("").trim();
}

/**
 * Ekstrak konteks dari sebuah Selection:
 * - selectedText: teks yang di-highlight
 * - contextBefore: ~2-3 kalimat sebelum seleksi
 * - contextAfter: ~2-3 kalimat setelah seleksi
 *
 * @param selection - DOM Selection object (harus non-collapsed)
 * @param rootElement - Root element tempat seleksi terjadi (untuk membatasi pencarian)
 * @param sentenceCount - Jumlah kalimat konteks (default 3)
 */
export function extractSelectionContext(
  selection: Selection,
  rootElement: HTMLElement,
  sentenceCount = 3
): SelectionContext | null {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();
  if (!selectedText) return null;

  // Pastikan seleksi berada di dalam rootElement
  if (!rootElement.contains(range.commonAncestorContainer)) {
    return null;
  }

  // ── Kumpulkan semua text node dalam root ──
  const allTextNodes = collectTextNodes(rootElement);
  if (allTextNodes.length === 0) {
    return { selectedText, contextBefore: "", contextAfter: "" };
  }

  // ── Temukan indeks text node tempat seleksi mulai & berakhir ──
  let startNodeIdx = -1;
  let endNodeIdx = -1;

  for (let i = 0; i < allTextNodes.length; i++) {
    const node = allTextNodes[i];
    // Cek apakah node mengandung startContainer
    if (startNodeIdx === -1 && range.startContainer === node) {
      startNodeIdx = i;
    }
    // Bisa juga startContainer adalah parent yang mengandung text node
    if (startNodeIdx === -1 && range.startContainer.contains(node)) {
      // Cek apakah node adalah text node pertama yang mengandung offset
      if (node === allTextNodes[i]) {
        startNodeIdx = i;
      }
    }

    if (range.endContainer === node) {
      endNodeIdx = i;
    }
    if (endNodeIdx === -1 && range.endContainer.contains(node)) {
      endNodeIdx = i;
    }
  }

  // Fallback: cari berdasarkan konten teks jika node index tidak ditemukan
  if (startNodeIdx === -1 || endNodeIdx === -1) {
    // Coba cari text node yang mengandung selected text
    for (let i = 0; i < allTextNodes.length; i++) {
      const text = allTextNodes[i].textContent ?? "";
      if (startNodeIdx === -1 && text.includes(selectedText.substring(0, Math.min(20, selectedText.length)))) {
        startNodeIdx = i;
        endNodeIdx = i; // asumsikan dalam satu node
        break;
      }
    }
    if (startNodeIdx === -1) {
      return { selectedText, contextBefore: "", contextAfter: "" };
    }
  }

  // ── Bangun contextBefore ──
  const beforeParts: string[] = [];

  // Ambil teks SEBELUM offset di start node
  if (startNodeIdx >= 0 && startNodeIdx < allTextNodes.length) {
    const startNode = allTextNodes[startNodeIdx];
    if (range.startContainer === startNode) {
      const textBefore = startNode.textContent?.substring(0, range.startOffset) ?? "";
      if (textBefore.trim()) {
        beforeParts.unshift(textBefore);
      }
    }
  }

  // Mundur ke node sebelumnya sampai dapat cukup kalimat
  for (let i = startNodeIdx - 1; i >= 0; i--) {
    const text = allTextNodes[i].textContent?.trim();
    if (text) {
      beforeParts.unshift(text);
      const combined = beforeParts.join(" ");
      if (takeSentences(combined, sentenceCount, true).split(/[.!?]\s/).length >= sentenceCount) {
        break;
      }
    }
  }

  let contextBefore = beforeParts.join(" ").trim();
  contextBefore = takeSentences(contextBefore, sentenceCount, true);

  // ── Bangun contextAfter ──
  const afterParts: string[] = [];

  if (endNodeIdx >= 0 && endNodeIdx < allTextNodes.length) {
    const endNode = allTextNodes[endNodeIdx];
    if (range.endContainer === endNode) {
      const textAfter = endNode.textContent?.substring(range.endOffset) ?? "";
      if (textAfter.trim()) {
        afterParts.push(textAfter);
      }
    }
  }

  for (let i = endNodeIdx + 1; i < allTextNodes.length; i++) {
    const text = allTextNodes[i].textContent?.trim();
    if (text) {
      afterParts.push(text);
      const combined = afterParts.join(" ");
      if (takeSentences(combined, sentenceCount).split(/[.!?]\s/).length >= sentenceCount) {
        break;
      }
    }
  }

  let contextAfter = afterParts.join(" ").trim();
  contextAfter = takeSentences(contextAfter, sentenceCount);

  return { selectedText, contextBefore, contextAfter };
}
