/**
 * GET /api/guru/diagnostic/draft-answers
 *
 * Fetch draft_answers untuk modal "Lihat Jawaban" di dashboard guru.
 * Dipanggil on-demand saat user klik tombol "Lihat Jawaban".
 *
 * Query params:
 *   - studentId (required): student_id dari tabel students
 *   - attemptNumber (required): nomor percobaan
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDiagnosticDraftAnswers } from "@/lib/data/diagnostic-analytics";

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
  const attemptNumberRaw = searchParams.get("attemptNumber");

  const studentId = studentIdRaw ? parseInt(studentIdRaw, 10) : NaN;
  const attemptNumber = attemptNumberRaw ? parseInt(attemptNumberRaw, 10) : NaN;

  if (isNaN(studentId) || isNaN(attemptNumber)) {
    return NextResponse.json(
      { error: "studentId dan attemptNumber wajib berupa angka" },
      { status: 400 }
    );
  }

  // ── 3. Fetch draft answers ───────────────────────────────────
  try {
    const answers = await getDiagnosticDraftAnswers(studentId, attemptNumber);
    return NextResponse.json({ answers });
  } catch (err) {
    console.error("[GET /api/guru/diagnostic/draft-answers] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil jawaban siswa" },
      { status: 500 }
    );
  }
}
