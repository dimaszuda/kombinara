/**
 * Asesmen Formatif — Submit API
 *
 * POST /api/asesmen-formatif/submit
 *   → Saves a submission record (multiple allowed) and deletes drafts.
 *   → Body: {
 *       module_slug: string,
 *       concept_id: string,  // REQUIRED — derived from the module being assessed
 *       answers: Array<{ question_number: number, cara_mengerjakan: string, jawaban_akhir: string }>
 *     }
 *   → Response: { success: true, submission_id: number }
 *
 * GET /api/asesmen-formatif/submit?module_slug=...
 *   → Get all submissions for this student + module.
 *   → Response: { submissions: Array<{ id, submitted_at, total_score, evaluated_at }> }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { gmt7Now } from "@/lib/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getStudentId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!student) return { error: NextResponse.json({ error: "Student not found" }, { status: 404 }) };

  return { studentId: student.id };
}

async function getModuleId(slug: string) {
  const mod = await prisma.module.findUnique({
    where: { slug },
    select: { id: true },
  });
  return mod?.id ?? null;
}

const VALID_CONCEPT_IDS = [
  "kaidah_penjumlahan",
  "kaidah_perkalian",
  "kaidah-pencacahan",
  "faktorial",
  "permutasi",
  "kombinasi",
];

// ─── POST — submission ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.module_slug !== "string" ||
      typeof body.concept_id !== "string" ||
      !Array.isArray(body.answers)
    ) {
      return NextResponse.json(
        { error: "Invalid request body. Required: module_slug, concept_id, answers[]" },
        { status: 400 }
      );
    }

    const { module_slug, concept_id, answers } = body;

    // Validate concept_id
    if (!VALID_CONCEPT_IDS.includes(concept_id)) {
      return NextResponse.json(
        { error: `Invalid concept_id. Must be one of: ${VALID_CONCEPT_IDS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate answers array
    if (answers.length === 0) {
      return NextResponse.json({ error: "answers array cannot be empty" }, { status: 400 });
    }

    for (const a of answers) {
      if (
        typeof a.question_number !== "number" ||
        a.question_number < 1 ||
        a.question_number > 10
      ) {
        return NextResponse.json(
          { error: `Invalid question_number: ${a.question_number}` },
          { status: 400 }
        );
      }
    }

    const moduleId = await getModuleId(module_slug);
    if (!moduleId) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Build the JSONB answers array
    const answersJson = answers.map(
      (a: { question_number: number; cara_mengerjakan?: string; jawaban_akhir?: string }) => ({
        question_number: a.question_number,
        cara_mengerjakan: a.cara_mengerjakan ?? "",
        jawaban_akhir: a.jawaban_akhir ?? "",
      })
    );

    // Create submission and delete drafts in a transaction
    const [submission] = await prisma.$transaction([
      prisma.asesmenFormatifSubmission.create({
        data: {
          studentId,
          moduleId,
          conceptId: concept_id,
          answers: answersJson as unknown as object,
          submittedAt: gmt7Now(),
        },
      }),
      prisma.asesmenFormatifDraft.deleteMany({
        where: { studentId, moduleId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
    });
  } catch (err) {
    console.error("[POST /api/asesmen-formatif/submit] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// ─── GET — list submissions ───────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const { searchParams } = new URL(req.url);
    const module_slug = searchParams.get("module_slug");

    if (!module_slug) {
      return NextResponse.json({ error: "module_slug is required" }, { status: 400 });
    }

    const moduleId = await getModuleId(module_slug);
    if (!moduleId) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const submissions = await prisma.asesmenFormatifSubmission.findMany({
      where: { studentId, moduleId },
      select: {
        id: true,
        submittedAt: true,
        totalScore: true,
        evaluatedAt: true,
        aiFeedback: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("[GET /api/asesmen-formatif/submit] Error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status submission" }, { status: 500 });
  }
}
