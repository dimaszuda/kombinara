/**
 * Asesmen Formatif — Draft API
 *
 * POST /api/asesmen-formatif/draft
 *   → Save/upsert a single draft answer per question.
 *   → If both cara_mengerjakan AND jawaban_akhir are empty/null, the draft row is deleted.
 *   → Body: { module_slug, question_number, cara_mengerjakan, jawaban_akhir }
 *
 * GET /api/asesmen-formatif/draft?module_slug=...
 *   → Retrieve all saved drafts for the current student + module.
 *   → Used to restore answers on page load / refresh.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

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

// ─── POST — save/upsert draft ──────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.module_slug !== "string" ||
      typeof body.question_number !== "number" ||
      body.question_number < 1 ||
      body.question_number > 10
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { module_slug, question_number, cara_mengerjakan, jawaban_akhir } = body;

    const moduleId = await getModuleId(module_slug);
    if (!moduleId) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const hasContent =
      (typeof cara_mengerjakan === "string" && cara_mengerjakan.trim().length > 0) ||
      (typeof jawaban_akhir === "string" && jawaban_akhir.trim().length > 0);

    if (!hasContent) {
      // Delete draft if both fields are empty — clean up
      await prisma.asesmenFormatifDraft.deleteMany({
        where: { studentId, moduleId, questionNumber: question_number },
      });
      return NextResponse.json({ success: true, action: "deleted" });
    }

    // Upsert draft
    await prisma.asesmenFormatifDraft.upsert({
      where: {
        studentId_moduleId_questionNumber: {
          studentId,
          moduleId,
          questionNumber: question_number,
        },
      },
      update: {
        caraMengerjakan: cara_mengerjakan ?? null,
        jawabanAkhir: jawaban_akhir ?? null,
        lastSavedAt: new Date(),
      },
      create: {
        studentId,
        moduleId,
        questionNumber: question_number,
        caraMengerjakan: cara_mengerjakan ?? null,
        jawabanAkhir: jawaban_akhir ?? null,
      },
    });

    return NextResponse.json({ success: true, action: "saved" });
  } catch (err) {
    console.error("[POST /api/asesmen-formatif/draft] Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan draft" }, { status: 500 });
  }
}

// ─── GET — retrieve drafts ─────────────────────────────────────────────────────

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

    const drafts = await prisma.asesmenFormatifDraft.findMany({
      where: { studentId, moduleId },
      select: {
        questionNumber: true,
        caraMengerjakan: true,
        jawabanAkhir: true,
        lastSavedAt: true,
      },
      orderBy: { questionNumber: "asc" },
    });

    return NextResponse.json({ drafts });
  } catch (err) {
    console.error("[GET /api/asesmen-formatif/draft] Error:", err);
    return NextResponse.json({ error: "Gagal mengambil draft" }, { status: 500 });
  }
}
