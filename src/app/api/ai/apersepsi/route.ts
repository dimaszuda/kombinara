/**
 * Apersepsi Feedback — AI grading & feedback API
 *
 * POST /api/ai/apersepsi
 * Body: { soal: string, jawaban: string, cara_menghitung: string }
 * Response: { feedback: string }
 *
 * Edge Runtime — fast feedback loop.
 */
export const runtime = "edge";

import { ApersepsiPrompt } from "@/lib/ai/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.soal || !body.jawaban || !body.cara_menghitung) {
      return new Response(
        JSON.stringify({ error: "soal, jawaban, and cara_menghitung are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const feedback = await ApersepsiPrompt(
      body.soal,
      body.jawaban,
      body.cara_menghitung
    );

    return new Response(JSON.stringify({ feedback }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[apersepsi] AI error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
