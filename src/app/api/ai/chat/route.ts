/**
 * Chatbot Panel — AI Q&A API
 *
 * POST /api/ai/chat
 * Body: {
 *   question: string,
 *   selectedText?: string,
 *   contextBefore?: string,
 *   contextAfter?: string,
 *   history?: Array<{ role: "user" | "assistant", content: string }>
 * }
 * Response: { answer: string }
 *
 * Edge Runtime — low latency conversational AI with sliding window memory.
 */
export const runtime = "edge";

import { ChatPrompt } from "@/lib/ai/client";

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.question !== "string" || !body.question.trim()) {
      return new Response(
        JSON.stringify({ error: "Invalid request: question is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { question, selectedText, contextBefore, contextAfter, history } = body;

    // Validate history array jika ada
    let parsedHistory: ChatHistoryItem[] | undefined;
    if (Array.isArray(history)) {
      parsedHistory = history
        .filter(
          (item: unknown) =>
            item &&
            typeof item === "object" &&
            (item as ChatHistoryItem).role &&
            (item as ChatHistoryItem).content
        )
        .slice(-10) as ChatHistoryItem[]; // Max 5 exchanges (10 messages)
    }

    const answer = await ChatPrompt(
      question.trim(),
      typeof selectedText === "string" ? selectedText : undefined,
      typeof contextBefore === "string" ? contextBefore : undefined,
      typeof contextAfter === "string" ? contextAfter : undefined,
      parsedHistory
    );

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[chat] AI error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
