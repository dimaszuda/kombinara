/**
 * Deep Learning Activity — AI Feedback API
 *
 * POST /api/ai/deep-learning
 * Body: { soal: string, jawaban: string }
 * Response: { feedback: string }
 *
 * Uses AnswerClassification prompt to analyse student answers and return
 * constructive feedback without revealing the correct answer explicitly.
 */
export const runtime = "edge";

import { AnswerClassificationPrompt } from "@/lib/ai/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.soal !== "string" ||
      typeof body.jawaban !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid request: soal and jawaban are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { soal, jawaban } = body;

    if (!soal.trim() || !jawaban.trim()) {
      return new Response(
        JSON.stringify({ error: "soal and jawaban must be non-empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await AnswerClassificationPrompt(soal, jawaban);

    return new Response(JSON.stringify({ feedback: result.feedback }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[deep-learning] AI feedback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
