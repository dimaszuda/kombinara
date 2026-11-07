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
import { requireGuru, guruCanAccessStudent } from "@/lib/auth/guru";
import { getDiagnosticDraftAnswers } from "@/lib/data/diagnostic-analytics";

export async function GET(req: Request) {
  // ── 1. Autentikasi + otorisasi guru ──────────────────────────
  const auth = await requireGuru();
  if ("error" in auth) return auth.error;
  const { guru } = auth;

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

  // ── 3. Fetch draft answers (hanya siswa di kelas guru ini) ───
  try {
    if (!(await guruCanAccessStudent(guru, studentId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
