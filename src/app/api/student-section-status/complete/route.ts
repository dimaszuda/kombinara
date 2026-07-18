/**
 * Student Section Status -- Complete a section (Trigger 2)
 *
 * POST /api/student-section-status/complete
 * Body: { concept_id: string, section: string }
 * Response: { success: true }
 *
 * Used for sections that have no questions to answer (penjelasan_konsep).
 * Completion is triggered by an explicit user action ("Lanjutkan" button).
 * The shared function completeSectionAndUnlockNext handles both marking the
 * current section as completed and unlocking the next sequential section.
 *
 * This is Trigger 2 -- separate entry point from Trigger 1 (answer-based),
 * but both call the same shared function for the actual DB update.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { completeSectionAndUnlockNext } from "@/lib/data/student-section-status";

const ALLOWED_SECTIONS = ["penjelasan_konsep"] as const;

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.concept_id !== "string" ||
      typeof body.section !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request body. Required: concept_id (string), section (string)" },
        { status: 400 }
      );
    }

    const { concept_id, section } = body;

    if (!ALLOWED_SECTIONS.includes(section as (typeof ALLOWED_SECTIONS)[number])) {
      return NextResponse.json(
        { error: `Section '${section}' is not eligible for explicit completion.` },
        { status: 400 }
      );
    }

    // Execute in its own transaction -- no answer insert to bundle with.
    await prisma.$transaction(async (tx) => {
      await completeSectionAndUnlockNext(student.id, concept_id, section, tx);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/student-section-status/complete] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan status section" },
      { status: 500 }
    );
  }
}
