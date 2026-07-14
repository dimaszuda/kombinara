/**
 * Apersepsi · Pemantik · Refleksi — Answer Classification API
 *
 * POST /api/ai/apersepsi-pemantik
 * Body: {
 *   section: "apersepsi" | "pemantik" | "refleksi",
 *   responses: Array<{
 *     question_key: string,
 *     soal: string,
 *     response_data: Record<string, unknown>
 *   }>
 * }
 * Response: {
 *   feedback: Record<question_key, { isCorrect: boolean, misconceptionType: string | null, feedback: string }>
 * }
 *
 * Flow:
 * 1. Auth via Supabase session
 * 2. Get student_id from students table
 * 3. For each question: call LLM AnswerClassification in parallel
 * 4. Insert each result to apersepsi_pemantik_responses (new row per attempt)
 * 5. Return per-question feedback to client
 */

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { AnswerClassificationPrompt } from "@/lib/ai/client";

type ResponseItem = {
  question_key: string;
  soal: string;
  response_data: Record<string, unknown>;
};

type RequestBody = {
  section: "apersepsi" | "pemantik" | "refleksi";
  responses: ResponseItem[];
};

const VALID_SECTIONS = new Set(["apersepsi", "pemantik", "refleksi"]);

const VALID_QUESTION_KEYS = new Set([
  "kendaraan",
  "outfit",
  "pengurus",
  "password_kapasitas",
  "tim_sama_beda",
  "rute_kurir",
  "refleksi_sebelum_mulai",
  "refleksi_sebelum_mulai_1",
  "refleksi_sebelum_mulai_2",
  // Refleksi Mini — Kaidah Penjumlahan
  "refleksi_penjumlahan_1",
  "refleksi_penjumlahan_2",
  "refleksi_penjumlahan_3",
  // Refleksi Mini — Kaidah Perkalian
  "refleksi_perkalian_1",
  "refleksi_perkalian_2",
  "refleksi_perkalian_3",
]);

export async function POST(req: Request) {
  try {
    // ── 1. Parse & validate body ───────────────────────────────
    const body = (await req.json().catch(() => null)) as RequestBody | null;

    if (
      !body ||
      !VALID_SECTIONS.has(body.section) ||
      !Array.isArray(body.responses) ||
      body.responses.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    for (const item of body.responses) {
      if (
        typeof item.question_key !== "string" ||
        !VALID_QUESTION_KEYS.has(item.question_key) ||
        typeof item.soal !== "string" ||
        !item.soal.trim() ||
        typeof item.response_data !== "object" ||
        item.response_data === null
      ) {
        return NextResponse.json(
          { error: `Invalid response item for question_key: ${item.question_key}` },
          { status: 400 }
        );
      }
    }

    // ── 2. Auth ────────────────────────────────────────────────
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Get student_id ──────────────────────────────────────
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ── 4. LLM classify + DB insert for each question in parallel
    const results = await Promise.all(
      body.responses.map(async (item) => {
        const jawabanStr = JSON.stringify(item.response_data);
        const llmResult = await AnswerClassificationPrompt(item.soal, jawabanStr);

        await prisma.apersepsiPemantikResponse.create({
          data: {
            studentId: student.id,
            section: body.section,
            questionKey: item.question_key,
            responseData: item.response_data as Prisma.InputJsonValue,
            isCorrect: llmResult.isCorrect,
            misconceptionType: llmResult.misconceptionType,
            feedback: llmResult.feedback,
          },
        });

        return { question_key: item.question_key, ...llmResult };
      })
    );

    // ── 5. Build feedback map keyed by question_key ────────────
    const feedback = Object.fromEntries(
      results.map(({ question_key, isCorrect, misconceptionType, feedback: fb }) => [
        question_key,
        { isCorrect, misconceptionType, feedback: fb },
      ])
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("[apersepsi-pemantik] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
