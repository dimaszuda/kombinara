// Edge Runtime — streaming Q&A untuk block text highlight
// Model: Claude Haiku (low stakes)
// Context: sliding window (selected text + 2 paragraf sekitar)
// Caching: Upstash Redis semantic cache, TTL 24 jam
export const runtime = "edge";

export async function POST(req: Request) {
  // TODO: Implement
  // 1. Parse { selectedText, contextBefore, contextAfter, materiSlug }
  // 2. Check semantic cache di Redis
  // 3. Stream ke Claude Haiku via Vercel AI SDK
  // 4. Simpan response ke cache
  // 5. Log question ke DB untuk depth scoring async
  return new Response("Not implemented", { status: 501 });
}
