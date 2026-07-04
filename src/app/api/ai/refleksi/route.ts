/**
 * Refleksi Mini — AI Feedback API
 *
 * POST /api/ai/refleksi
 * Body: { jawabanQ1: string, jawabanQ2: string, jawabanQ3: string }
 * Response: { q1: { valid: boolean, feedback: string }, q2: {...}, q3: {...} }
 *
 * Edge Runtime — low latency AI feedback.
 */
export const runtime = "edge";

import { RefleksiPrompt } from "@/lib/ai/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.jawabanQ1 !== "string" ||
      typeof body.jawabanQ2 !== "string" ||
      typeof body.jawabanQ3 !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid request: jawabanQ1, jawabanQ2, and jawabanQ3 are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { jawabanQ1, jawabanQ2, jawabanQ3 } = body;

    const result = await RefleksiPrompt(jawabanQ1, jawabanQ2, jawabanQ3);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[refleksi] AI feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
