/**
 * GET /api/guru/formatif/submission-answers
 *
 * Fetch answers + per_question_results untuk modal "Lihat Jawaban"
 * di dashboard guru (asesmen formatif).
 *
 * Query params:
 *   - studentId (required): student_id dari tabel students
 *   - conceptId (required): concept_id (slug materi), e.g. "permutasi"
 *   - attemptNumber (optional): "latest" (default) atau nomor percobaan (1, 2, 3, ...)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFormatifSubmissionAnswers } from "@/lib/data/formatif-analytics";

export async function GET(req: Request) {
  // ── 1. Autentikasi ───────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── 2. Parse query params ────────────────────────────────────
  const { searchParams } = new URL(req.url);
  const studentIdRaw = searchParams.get("studentId");
  const conceptId = searchParams.get("conceptId");
  const attemptNumberRaw = searchParams.get("attemptNumber") || "latest";

  const studentId = studentIdRaw ? parseInt(studentIdRaw, 10) : NaN;

  if (isNaN(studentId) || !conceptId) {
    return NextResponse.json(
      { error: "studentId dan conceptId wajib diisi" },
      { status: 400 }
    );
  }

  const attemptNumber: number | "latest" =
    attemptNumberRaw === "latest"
      ? "latest"
      : parseInt(attemptNumberRaw, 10);

  if (typeof attemptNumber === "number" && (isNaN(attemptNumber) || attemptNumber < 1)) {
    return NextResponse.json(
      { error: "attemptNumber harus 'latest' atau angka >= 1" },
      { status: 400 }
    );
  }

  // ── 3. Fetch submission answers ──────────────────────────────
  try {
    const result = await getFormatifSubmissionAnswers(
      studentId,
      conceptId,
      attemptNumber
    );

    if (!result) {
      return NextResponse.json(
        { error: "Submission tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/guru/formatif/submission-answers] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil jawaban siswa" },
      { status: 500 }
    );
  }
}
