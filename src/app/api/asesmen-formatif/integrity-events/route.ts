/**
 * Asesmen Formatif — Integrity Events API
 *
 * POST /api/asesmen-formatif/integrity-events
 *   → Batch-insert integrity events. Accepts an array of events in one request.
 *   → Validates that the attempt belongs to the authenticated student and is still
 *     in_progress (prevents log manipulation after the exam is over).
 *   → Body: { attempt_id: number, module_slug: string, events: Array<{
 *       event_type: string,
 *       device_type: 'mobile' | 'tablet' | 'desktop',
 *       metadata?: Record<string, unknown>,
 *       created_at?: string  // ISO timestamp from client, optional
 *     }> }
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

const VALID_EVENT_TYPES = [
  "fullscreen_enter",
  "fullscreen_exit",
  "visibility_hidden",
  "visibility_visible",
  "paste",
  "resize",
];

const VALID_DEVICE_TYPES = ["mobile", "tablet", "desktop"];

// ─── POST — batch insert integrity events ─────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.attempt_id !== "number" ||
      typeof body.module_slug !== "string" ||
      !Array.isArray(body.events)
    ) {
      return NextResponse.json(
        { error: "Invalid request body. Required: attempt_id, module_slug, events[]" },
        { status: 400 }
      );
    }

    const { attempt_id, module_slug, events } = body;

    if (events.length === 0) {
      return NextResponse.json({ inserted: 0 });
    }

    // Validate each event shape
    for (const ev of events) {
      if (
        !VALID_EVENT_TYPES.includes(ev.event_type) ||
        !VALID_DEVICE_TYPES.includes(ev.device_type)
      ) {
        return NextResponse.json(
          { error: `Invalid event: ${JSON.stringify(ev)}` },
          { status: 400 }
        );
      }
    }

    // Resolve module_id
    const mod = await prisma.module.findUnique({
      where: { slug: module_slug },
      select: { id: true },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Verify attempt ownership + status
    const attempt = await prisma.asesmenFormatifAttempt.findUnique({
      where: { attemptId: attempt_id },
      select: { attemptId: true, studentId: true, status: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Reject inserts if attempt is no longer in_progress
    if (attempt.status !== "in_progress") {
      return NextResponse.json(
        { error: `Attempt is ${attempt.status}; cannot log new events.` },
        { status: 409 }
      );
    }

    // Batch insert
    const rows = events.map((ev) => ({
      studentId,
      moduleId: mod.id,
      attemptId: attempt_id,
      eventType: ev.event_type,
      deviceType: ev.device_type,
      metadata: ev.metadata ?? null,
      createdAt: ev.created_at ? new Date(ev.created_at) : undefined,
    }));

    await prisma.integrityEvent.createMany({
      data: rows,
    });

    return NextResponse.json({ inserted: rows.length });
  } catch (error) {
    console.error("[integrity-events] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
