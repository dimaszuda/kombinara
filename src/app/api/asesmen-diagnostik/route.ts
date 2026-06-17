/**
 * Asesmen Diagnostik — Grading API
 *
 * POST /api/asesmen-diagnostik
 * Body: { answers: Record<string, string> }
 * Response: GradingResult { isPass, correctCount, score, questions }
 *
 * Edge Runtime — low latency grading.
 */
export const runtime = "edge";

import { gradeAnswers, type StudentAnswers } from "@/lib/data/asesmen-diagnostik";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.answers || typeof body.answers !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: answers object required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const answers: StudentAnswers = {};

    // Hanya terima string values
    for (const [key, value] of Object.entries(body.answers)) {
      if (typeof value === "string") {
        answers[key] = value;
      } else if (value !== null && value !== undefined) {
        answers[key] = String(value);
      }
    }

    const result = gradeAnswers(answers);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[asesmen-diagnostik] grading error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
