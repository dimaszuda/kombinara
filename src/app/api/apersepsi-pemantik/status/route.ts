/**
 * Apersepsi & Pemantik — Status API
 *
 * GET /api/apersepsi-pemantik/status
 *   → Mengecek per-step mana yang sudah diselesaikan siswa
 *     + mengembalikan data jawaban & feedback yang sudah disimpan.
 *
 * Response:
 * {
 *   completedSteps: Record<number, boolean>,
 *   savedData: Record<questionKey, { responseData, feedback, isCorrect }>
 * }
 *
 * Step indices sesuai urutan STEPS di komponen:
 *   0 = kendaraan, 1 = outfit, 2 = pengurus,
 *   3 = password_kapasitas, 4 = tim_sama_beda, 5 = rute_kurir,
 *   6 = refleksi_sebelum_mulai_1, 7 = refleksi_sebelum_mulai_2
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ── Semua question_key sesuai urutan STEPS ─────────────────────────
const REQUIRED_QUESTION_KEYS = [
  "kendaraan",
  "outfit",
  "pengurus",
  "password_kapasitas",
  "tim_sama_beda",
  "rute_kurir",
  "refleksi_sebelum_mulai_1",
  "refleksi_sebelum_mulai_2",
];

// ─── GET ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // ── Ambil semua response, diurutkan dari terbaru ──────────────
    const allResponses = await prisma.apersepsiPemantikResponse.findMany({
      where: { studentId: student.id },
      orderBy: [{ questionKey: "asc" }, { submittedAt: "desc" }],
      select: { questionKey: true, responseData: true, feedback: true, isCorrect: true },
    });

    // ── Ambil yang terbaru per question_key ───────────────────────
    const latestByKey = new Map<string, { responseData: unknown; feedback: string | null; isCorrect: boolean | null }>();
    for (const r of allResponses) {
      if (!latestByKey.has(r.questionKey)) {
        latestByKey.set(r.questionKey, {
          responseData: r.responseData,
          feedback: r.feedback,
          isCorrect: r.isCorrect,
        });
      }
    }

    // ── Build completedSteps by index ─────────────────────────────
    const completedSteps: Record<number, boolean> = {};
    REQUIRED_QUESTION_KEYS.forEach((key, index) => {
      if (latestByKey.get(key)?.isCorrect === true) {
        completedSteps[index] = true;
      }
    });

    // ── Build savedData ───────────────────────────────────────────
    const savedData: Record<string, { responseData: unknown; feedback: string | null; isCorrect: boolean | null }> = {};
    for (const [key, val] of latestByKey) {
      savedData[key] = val;
    }

    return NextResponse.json({ completedSteps, savedData });
  } catch (error) {
    console.error("[GET /api/apersepsi-pemantik/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
