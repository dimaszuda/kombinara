/**
 * Asesmen Diagnostik — Draft Attempt API
 *
 * GET  /api/asesmen-diagnostik/attempt
 *   → Cari in_progress attempt yang sudah ada, atau buat baru.
 *   → Response: { attempt_id, draft_answers, is_new }
 *
 * PATCH /api/asesmen-diagnostik/attempt
 *   → Auto-save draft_answers ke attempt yang sedang berjalan.
 *   → Body: { attempt_id, draft_answers }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Shared auth helper ────────────────────────────────────────────────────

async function getStudentId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<{ studentId: number } | NextResponse> {
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

  return { studentId: student.id };
}

// ─── GET — ambil / buat attempt ──────────────────────────────────────────────

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const authResult = await getStudentId(supabase);
  if (authResult instanceof NextResponse) return authResult;
  const { studentId } = authResult;

  // Cari attempt yang sedang berjalan
  const { data: existing } = await supabase
    .from("diagnostic_attempts")
    .select("attempt_id, draft_answers")
    .eq("student_id", studentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      attempt_id: (existing as { attempt_id: number; draft_answers: Record<string, string> }).attempt_id,
      draft_answers: (existing as { attempt_id: number; draft_answers: Record<string, string> }).draft_answers ?? {},
      is_new: false,
    });
  }

  // Tidak ada — buat baru
  const { data: lastAttempt } = await supabase
    .from("diagnostic_attempts")
    .select("attempt_number")
    .eq("student_id", studentId)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber =
    ((lastAttempt as { attempt_number: number } | null)?.attempt_number ?? 0) + 1;

  const { data: newAttempt, error: insertError } = await supabase
    .from("diagnostic_attempts")
    .insert({ student_id: studentId, attempt_number: nextNumber, status: "in_progress", correct_count: 0, feedback: "" })
    .select("attempt_id")
    .single();

  if (insertError || !newAttempt) {
    // Race condition: ada attempt lain yang baru saja dibuat
    const { data: raceAttempt } = await supabase
      .from("diagnostic_attempts")
      .select("attempt_id, draft_answers")
      .eq("student_id", studentId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (raceAttempt) {
      return NextResponse.json({
        attempt_id: (raceAttempt as { attempt_id: number; draft_answers: Record<string, string> }).attempt_id,
        draft_answers: (raceAttempt as { attempt_id: number; draft_answers: Record<string, string> }).draft_answers ?? {},
        is_new: false,
      });
    }

    console.error("[attempt GET] failed to create:", insertError);
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
  }

  return NextResponse.json({
    attempt_id: (newAttempt as { attempt_id: number }).attempt_id,
    draft_answers: {},
    is_new: true,
  });
}

// ─── PATCH — auto-save draft ──────────────────────────────────────────────────

export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const authResult = await getStudentId(supabase);
  if (authResult instanceof NextResponse) return authResult;
  const { studentId } = authResult;

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.attempt_id !== "number" ||
    typeof body.draft_answers !== "object"
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("diagnostic_attempts")
    .update({
      draft_answers: body.draft_answers,
      last_saved_at: new Date().toISOString(),
    })
    .eq("attempt_id", body.attempt_id)
    .eq("student_id", studentId) // verifikasi kepemilikan
    .eq("status", "in_progress");

  if (error) {
    console.error("[attempt PATCH] failed to save draft:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
