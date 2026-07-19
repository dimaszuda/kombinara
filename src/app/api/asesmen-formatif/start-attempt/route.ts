/**
 * Asesmen Formatif — Start Attempt API
 *
 * POST /api/asesmen-formatif/start-attempt
 *   → Creates a new asesmen_formatif_attempts row when the student clicks
 *     "Siap, Mulai Asesmen".
 *   → Body: { module_slug: string, device_type: 'mobile' | 'tablet' | 'desktop' }
 *   → Returns: { attempt_id: number }
 *   → Cooldown: 5 minutes since the last completed attempt.
 *
 * PUT /api/asesmen-formatif/start-attempt
 *   → Updates the attempt status to 'submitted' or 'timed_out'
 *   → Body: { attempt_id: number, status: 'submitted' | 'timed_out', submission_id?: number }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────────
const COOLDOWN_MINUTES = 5;

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

const VALID_DEVICE_TYPES = ["mobile", "tablet", "desktop"];
const VALID_STATUSES = ["submitted", "timed_out"];

// ─── POST — create attempt ────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.module_slug !== "string" || !VALID_DEVICE_TYPES.includes(body.device_type)) {
      return NextResponse.json(
        { error: "Invalid request body. Required: module_slug (string), device_type (mobile|tablet|desktop)" },
        { status: 400 }
      );
    }

    const moduleId = await getModuleId(body.module_slug);
    if (!moduleId) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // 1. Check if there's an existing in_progress attempt (page refresh scenario)
    const inProgress = await prisma.asesmenFormatifAttempt.findFirst({
      where: {
        studentId,
        moduleId,
        status: "in_progress",
      },
      orderBy: { startedAt: "desc" },
    });

    if (inProgress) {
      return NextResponse.json({ attempt_id: inProgress.attemptId });
    }

    // 2. Check cooldown — 5 minutes since last completed attempt
    const lastCompleted = await prisma.asesmenFormatifAttempt.findFirst({
      where: {
        studentId,
        moduleId,
        status: { in: ["submitted", "timed_out"] },
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    });

    if (lastCompleted?.completedAt) {
      const now = new Date();
      const cooldownUntil = new Date(lastCompleted.completedAt.getTime() + COOLDOWN_MINUTES * 60 * 1000);

      if (now < cooldownUntil) {
        const remainingSeconds = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
        return NextResponse.json(
          {
            error: "cooldown",
            message: `Silakan tunggu ${Math.ceil(remainingSeconds / 60)} menit lagi sebelum memulai asesmen kembali.`,
            cooldown_remaining_seconds: remainingSeconds,
          },
          { status: 429 }
        );
      }
    }

    // 3. Create new attempt
    const attempt = await prisma.asesmenFormatifAttempt.create({
      data: {
        studentId,
        moduleId,
        deviceType: body.device_type,
        status: "in_progress",
      },
      select: { attemptId: true },
    });

    return NextResponse.json({ attempt_id: attempt.attemptId }, { status: 201 });
  } catch (error) {
    console.error("[start-attempt] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT — update attempt status ──────────────────────────────────────────────

export async function PUT(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.attempt_id !== "number" ||
      !VALID_STATUSES.includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Invalid request body. Required: attempt_id (number), status (submitted|timed_out)" },
        { status: 400 }
      );
    }

    // Verify the attempt belongs to this student and is in_progress
    const attempt = await prisma.asesmenFormatifAttempt.findUnique({
      where: { attemptId: body.attempt_id },
      select: { attemptId: true, studentId: true, status: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        { error: `Attempt already ${attempt.status}` },
        { status: 409 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: body.status,
      completedAt: new Date(),
    };
    if (body.submission_id) {
      updateData.submissionId = body.submission_id;
    }

    await prisma.asesmenFormatifAttempt.update({
      where: { attemptId: body.attempt_id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[start-attempt] PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
