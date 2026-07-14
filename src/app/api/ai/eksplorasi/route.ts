/**
 * Eksplorasi Kontekstual — AI Feedback API
 *
 * POST /api/ai/eksplorasi
 * Body: { soal: string, jawaban: string, alasan: string }
 * Response: { feedback: string, isCorrect: boolean }
 *
 * Edge Runtime — low latency AI feedback.
 */
export const runtime = "edge";

import { EskplorasiPrompt } from "@/lib/ai/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.soal !== "string" || typeof body.jawaban !== "string" || typeof body.alasan !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: soal, jawaban, and alasan are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { soal, jawaban, alasan } = body;

    if (!soal.trim() || !jawaban.trim() || !alasan.trim()) {
      return new Response(
        JSON.stringify({ error: "All fields must be non-empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await EskplorasiPrompt(soal, jawaban, alasan);

    return new Response(JSON.stringify({ feedback: result.feedback, isCorrect: result.isCorrect }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[eksplorasi] AI feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
