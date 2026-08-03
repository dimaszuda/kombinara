/**
 * Penutup — On-Demand Jawaban API
 *
 * GET /api/penutup/jawaban?section=tantangan|asesmen-diri|refleksi-mendalam
 *   Returns the student's saved answers for the specified penutup section.
 *
 * Response shape per section:
 *
 *   tantangan:
 *     { section, entries: [{ questionNumber, questionText, jawaban, isCorrect, feedback, submittedAt }] }
 *
 *   asesmen-diri:
 *     { section, checklist: [{ indicator_number, pernyataan, status }], submittedAt }
 *
 *   refleksi-mendalam:
 *     { section, entries: [{ questionNumber, questionKey, jawaban, submittedAt }] }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ─── GET ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (!section || !["tantangan", "asesmen-diri", "refleksi-mendalam"].includes(section)) {
      return NextResponse.json(
        { error: "Query param required: section (tantangan | asesmen-diri | refleksi-mendalam)" },
        { status: 400 }
      );
    }

    // ── Auth ────────────────────────────────────────────────────────
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

    const studentId = student.id;

    // ── TANTANGAN ──────────────────────────────────────────────────
    if (section === "tantangan") {
      // Get the LATEST submission per question_number (student may retry)
      const rows = await prisma.$queryRaw<
        Array<{
          question_number: number;
          question_text: string;
          jawaban: string;
          is_correct: boolean | null;
          feedback: string | null;
          submitted_at: string;
        }>
      >`
        SELECT DISTINCT ON (question_number)
          question_number,
          question_text,
          jawaban,
          is_correct,
          feedback,
          submitted_at
        FROM tantangan_submissions
        WHERE student_id = ${studentId}
        ORDER BY question_number ASC, submitted_at DESC
      `;

      const entries = rows.map((r) => ({
        questionNumber: r.question_number,
        questionText: r.question_text,
        jawaban: r.jawaban,
        isCorrect: r.is_correct,
        feedback: r.feedback,
        submittedAt: r.submitted_at,
      }));

      return NextResponse.json({
        section,
        entries,
        hasSubmission: entries.length > 0,
      });
    }

    // ── ASESMEN DIRI ───────────────────────────────────────────────
    if (section === "asesmen-diri") {
      const sub = await prisma.asesmenDiriSubmission.findUnique({
        where: { studentId },
        select: { checklist: true, submittedAt: true },
      });

      if (!sub) {
        return NextResponse.json({
          section,
          checklist: null,
          hasSubmission: false,
        });
      }

      return NextResponse.json({
        section,
        checklist: sub.checklist,
        submittedAt: sub.submittedAt?.toISOString() ?? null,
        hasSubmission: true,
      });
    }

    // ── REFLEKSI MENDALAM ──────────────────────────────────────────
    if (section === "refleksi-mendalam") {
      const rows = await prisma.refleksiMendalamSubmission.findMany({
        where: { studentId },
        orderBy: { questionNumber: "asc" },
        select: {
          questionNumber: true,
          questionKey: true,
          jawaban: true,
          submittedAt: true,
        },
      });

      const entries = rows.map((r) => ({
        questionNumber: r.questionNumber,
        questionKey: r.questionKey,
        jawaban: r.jawaban,
        submittedAt: r.submittedAt?.toISOString() ?? null,
      }));

      return NextResponse.json({
        section,
        entries,
        hasSubmission: entries.length > 0,
      });
    }

    // Should never reach here due to validation above
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (error) {
    console.error("[GET /api/penutup/jawaban] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
