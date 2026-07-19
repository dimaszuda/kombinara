/**
 * Asesmen Formatif — Evaluate API
 *
 * POST /api/asesmen-formatif/evaluate
 *   → Triggers AI evaluation for a submission. Evaluates all answers
 *     per-question using the AsesmenFormatif rubrik prompt.
 *   → Body: { submission_id: number, module_slug: string }
 *   → Response: { success: true, total_score: number, per_question: [...], ai_feedback: string }
 *
 * GET /api/asesmen-formatif/evaluate?submission_id=...
 *   → Returns evaluation results for a specific submission.
 *   → Response: { evaluated: boolean, total_score?: number, per_question?: [...], ai_feedback?: string }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { AsesmenFormatifEvaluatePrompt } from "@/lib/ai/client";

// ─── Ground truth & soal data (mirrors latihan.tsx) ─────────────────────────────

const SOAL_DATA: Array<{
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: number;
}> = [
  {
    question_number: 1, level: "mudah",
    question: "Dari kota A ke kota B tersedia transportasi 5 bus, 10 mobil travel, 4 kereta, dan 2 pesawat terbang. Berapa banyak cara Anda dapat bepergian dari kota A ke kota B?",
    answer: 21,
  },
  {
    question_number: 2, level: "mudah",
    question: "Di kelas XI terdapat 40 siswa, 15 siswa diantaranya perempuan. Berapa banyak cara untuk memilih seorang perempuan dan seorang laki–laki sebagai wakil dari kelas XI?",
    answer: 375,
  },
  {
    question_number: 3, level: "mudah",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil?",
    answer: 20,
  },
  {
    question_number: 4, level: "menengah",
    question: "Suatu kelas ada 10 siswa yang dijadikan kandidat pengurus kelas sebagai ketua, sekretaris, dan bendahara kelas. Jika tidak boleh ada jabatan yang dirangkap, berapa banyak cara yang bisa dilakukan dalam pemilihan tersebut?",
    answer: 720,
  },
  {
    question_number: 5, level: "menengah",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B lalu kembali lagi ke kota A juga melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil jika tidak boleh melalui jalur yang sama?",
    answer: 240,
  },
  {
    question_number: 6, level: "menengah",
    question: "Disediakan angka 0, 3, 5, 6, 8, 9. Berapa banyak bilangan ganjil terdiri dari 3 angka yang dapat dibuat dengan syarat tidak ada angka yang berulang? (0 tidak boleh sebagai ratusan)",
    answer: 48,
  },
  {
    question_number: 7, level: "menengah",
    question: "Terdapat angka 3, 4, 5, 6, dan 7. Berapa banyak bilangan 3 angka berbeda yang dapat dibuat, jika bilangan tersebut lebih dari 540?",
    answer: 33,
  },
  {
    question_number: 8, level: "hots",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur, dari kota A ke kota C ada 3 jalur. Bowo melakukan perjalanan dari kota A ke kota C dan kembali lagi ke kota A. Jika berangkatnya harus melalui kota B, berapa banyak rute perjalanan yang bisa Bowo ambil jika tidak boleh melalui jalur yang sama?",
    answer: 300,
  },
  {
    question_number: 9, level: "hots",
    question: "Disediakan angka 1, 2, 3, 4, dan 5. Berapa banyak bilangan genap terdiri dari 3 angka yang dapat dibuat, jika bilangan tersebut lebih dari 300 dan tidak ada angka yang berulang?",
    answer: 15,
  },
  {
    question_number: 10, level: "hots",
    question: "Seorang fotografer sedang mengatur foto keluarga. Keluarga tersebut terdiri dari ayah, ibu, 3 anak laki–laki dan 2 anak perempuan. Mereka akan duduk berjajar di depan rumah dengan syarat ayah dan ibu selalu duduk berdampingan. Berapa banyak susunan foto yang mungkin terjadi?",
    answer: 1440,
  },
];

// Map level to Indonesian for AI prompt
const LEVEL_MAP: Record<string, string> = {
  mudah: "dasar",
  menengah: "menengah",
  hots: "HOTS",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getStudentId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!student) return { error: NextResponse.json({ error: "Student not found" }, { status: 404 }) };

  return { studentId: student.id };
}

// ─── POST — trigger evaluation ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.submission_id !== "number" || typeof body.module_slug !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Required: submission_id (number), module_slug (string)" },
        { status: 400 }
      );
    }

    const { submission_id, module_slug } = body;

    // Verify submission belongs to this student
    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: submission_id },
      select: { id: true, studentId: true, answers: true, evaluatedAt: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already evaluated, return existing results
    if (submission.evaluatedAt) {
      const existing = await prisma.asesmenFormatifSubmission.findUnique({
        where: { id: submission_id },
        select: { totalScore: true, perQuestionResults: true, aiFeedback: true, evaluatedAt: true },
      });
      return NextResponse.json({
        success: true,
        already_evaluated: true,
        total_score: existing?.totalScore,
        per_question: existing?.perQuestionResults,
        ai_feedback: existing?.aiFeedback,
      });
    }

    // Parse answers
    const answers = submission.answers as unknown as Array<{
      question_number: number;
      cara_mengerjakan: string;
      jawaban_akhir: string;
    }>;

    // Evaluate each question
    const perQuestionResults: Record<string, unknown>[] = [];
    let totalScoreSum = 0;

    for (const answer of answers) {
      const soalRef = SOAL_DATA.find((s) => s.question_number === answer.question_number);
      if (!soalRef) continue;

      const caraHitungRaw = answer.cara_mengerjakan?.trim() ?? "";
      const jawabanAkhirRaw = answer.jawaban_akhir?.trim() ?? "";

      // ── Unanswered question: skip AI, langsung skor 0 ────────────────
      const isUnanswered = caraHitungRaw.length === 0 && jawabanAkhirRaw.length === 0;

      if (isUnanswered) {
        perQuestionResults.push({
          question_number: answer.question_number,
          step_by_step: {
            identifikasi_kondisi: { score: 0, reasoning: "Tidak dijawab" },
            pemilihan_rumus: { score: 0, reasoning: "Tidak dijawab" },
            eksekusi_perhitungan: { score: 0, reasoning: "Tidak dijawab" },
            justifikasi: { score: 0, reasoning: "Tidak dijawab" },
          },
          process_raw_score: 0,
          process_scaled_score: 0,
          final_answer_score: 0,
          total_score: 0,
          guardrail_applied: null,
          mistake_category: "tidak_diisi",
          mistake_detail: "Siswa tidak mengisi jawaban untuk soal ini.",
          feedback: "Kamu tidak mengisi jawaban untuk soal ini. Coba lagi di attempt berikutnya ya!",
        });
        // totalScoreSum stays 0 for this question
        continue;
      }

      const caraHitung = caraHitungRaw || "(tidak diisi)";
      const jawabanAkhir = jawabanAkhirRaw || "(tidak diisi)";

      // Check if final answer matches ground truth (normalize numbers)
      const normalizedJawaban = jawabanAkhir.replace(/[.,\s]/g, "");
      const normalizedGT = String(soalRef.answer);
      const isJawabanAkhirTrue =
        normalizedJawaban === normalizedGT ||
        jawabanAkhir === String(soalRef.answer);

      const levelLabel = LEVEL_MAP[soalRef.level] ?? soalRef.level;

      const result = await AsesmenFormatifEvaluatePrompt(
        soalRef.question,
        levelLabel,
        caraHitung,
        jawabanAkhir,
        isJawabanAkhirTrue
      );

      perQuestionResults.push({
        question_number: answer.question_number,
        ...result,
      });

      totalScoreSum += result.total_score;
    }

    // Compute overall score (average, scaled to 100)
    const overallScore = perQuestionResults.length > 0
      ? Math.round((totalScoreSum / (perQuestionResults.length * 10)) * 100)
      : 0;

    // Generate overall AI feedback
    const aiFeedback = generateOverallFeedback(perQuestionResults, overallScore);

    // Save to database
    await prisma.asesmenFormatifSubmission.update({
      where: { id: submission_id },
      data: {
        totalScore: overallScore,
        perQuestionResults: perQuestionResults as unknown as object,
        aiFeedback,
        evaluatedAt: new Date(),
        aiModel: "gpt-4o",
      },
    });

    return NextResponse.json({
      success: true,
      total_score: overallScore,
      per_question: perQuestionResults,
      ai_feedback: aiFeedback,
    });
  } catch (err) {
    console.error("[POST /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengevaluasi jawaban. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// ─── GET — retrieve evaluation results ─────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submission_id");

    if (!submissionId) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: parseInt(submissionId) },
      select: {
        id: true,
        studentId: true,
        totalScore: true,
        perQuestionResults: true,
        aiFeedback: true,
        evaluatedAt: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      evaluated: submission.evaluatedAt !== null,
      total_score: submission.totalScore,
      per_question: submission.perQuestionResults,
      ai_feedback: submission.aiFeedback,
      evaluated_at: submission.evaluatedAt,
    });
  } catch (err) {
    console.error("[GET /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil hasil evaluasi." },
      { status: 500 }
    );
  }
}

// ─── Helper: generate overall AI feedback ──────────────────────────────────────

function generateOverallFeedback(perQuestion: Record<string, unknown>[], overallScore: number): string {
  const correctCount = perQuestion.filter(
    (q) => (q as { mistake_category?: string | null }).mistake_category === null
  ).length;
  const unansweredCount = perQuestion.filter(
    (q) => (q as { mistake_category?: string | null }).mistake_category === "tidak_diisi"
  ).length;
  const totalQuestions = perQuestion.length;

  let feedback = `Skor keseluruhan: ${overallScore}/100. `;

  if (unansweredCount > 0) {
    feedback += `${unansweredCount} soal tidak diisi (skor 0). `;
  }

  if (overallScore >= 90) {
    feedback += `Kamu menguasai materi Kaidah Pencacahan dengan sangat baik! ${correctCount}/${totalQuestions} soal kamu jawab dengan tepat. Pertahankan pemahamanmu dan terus latihan untuk menjaga konsistensi.`;
  } else if (overallScore >= 75) {
    feedback += `Pemahamanmu tentang Kaidah Pencacahan sudah baik. ${correctCount}/${totalQuestions} soal terjawab dengan benar. Fokuslah memperbaiki kesalahan pada soal yang masih kurang tepat, terutama pastikan kamu bisa membedakan kapan menggunakan aturan penjumlahan vs perkalian.`;
  } else if (overallScore >= 50) {
    feedback += `Kamu sudah memahami dasar-dasarnya, tapi masih perlu banyak latihan. ${correctCount}/${totalQuestions} soal berhasil kamu jawab dengan benar. Coba perhatikan lagi konsep permutasi vs kombinasi, dan kapan urutan diperhatikan.`;
  } else {
    feedback += `Sepertinya kamu masih kesulitan dengan materi Kaidah Pencacahan. Hanya ${correctCount}/${totalQuestions} soal yang terjawab benar. Jangan berkecil hati! Mulailah dari konsep paling dasar: pahami dulu perbedaan aturan penjumlahan (ATAU) dan aturan perkalian (DAN).`;
  }

  return feedback;
}
