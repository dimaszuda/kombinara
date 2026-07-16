/**
 * Deep Learning Activity — AI Feedback API
 *
 * POST /api/ai/deep-learning
 * Body: { soal: string, jawaban: string, concept_id?: string }
 * Response: { feedback: string, isCorrect: boolean }
 *
 * Uses AnswerClassification prompt to analyse student answers and return
 * constructive feedback without revealing the correct answer explicitly.
 * Ground truth is determined from concept_id or auto-detected from soal text.
 */
export const runtime = "edge";

import { AnswerClassificationPrompt } from "@/lib/ai/client";
import { DEEP_LEARNING_GROUND_TRUTH } from "@/lib/ai/ground-truths";

/** Auto-detect concept_id from soal description text */
function detectConcept(soal: string): string | null {
  if (soal.includes("kaidah_penjumlahan") || soal.includes("kaidah penjumlahan")) return "kaidah_penjumlahan";
  if (soal.includes("kaidah_perkalian") || soal.includes("kaidah perkalian")) return "kaidah_perkalian";
  return null;
}

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

    const { soal, jawaban, concept_id } = body as { soal: string; jawaban: string; concept_id?: string };

    if (!soal.trim() || !jawaban.trim()) {
      return new Response(
        JSON.stringify({ error: "soal and jawaban must be non-empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cid = concept_id ?? detectConcept(soal);
    const groundTruth = cid ? (DEEP_LEARNING_GROUND_TRUTH[cid] ?? "") : "";

    const result = await AnswerClassificationPrompt(soal, groundTruth, jawaban);

    return new Response(JSON.stringify({ feedback: result.feedback, isCorrect: result.isCorrect }), {
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
