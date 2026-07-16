/**
 * Eksplorasi Kontekstual — AI Feedback API
 *
 * POST /api/ai/eksplorasi
 * Body: { soal: string, jawaban: string, alasan: string }
 * Response: { feedback: string, isCorrect: boolean }
 *
 * Strategy:
 * - Jika soal memiliki ground truth (jawaban faktual pasti) → gunakan
 *   AnswerClassificationPrompt untuk perbandingan objektif.
 * - Jika tidak → gunakan EskplorasiPrompt untuk feedback eksploratif.
 *
 * Edge Runtime — low latency AI feedback.
 */
export const runtime = "edge";

import { EskplorasiPrompt, AnswerClassificationPrompt } from "@/lib/ai/client";
import { EKSPLORASI_GROUND_TRUTH } from "@/lib/ai/ground-truths";

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

    // ── Pilih strategi berdasarkan ketersediaan ground truth ──────
    const groundTruth = EKSPLORASI_GROUND_TRUTH[soal];

    if (groundTruth) {
      // Soal faktual dengan jawaban pasti → gunakan AnswerClassification
      const result = await AnswerClassificationPrompt(soal, groundTruth, jawaban);
      return new Response(JSON.stringify({ feedback: result.feedback, isCorrect: result.isCorrect }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Soal eksploratif → gunakan EskplorasiPrompt (existing behavior)
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
