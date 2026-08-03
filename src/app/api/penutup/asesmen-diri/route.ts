/**
 * Asesmen Diri — Save Checklist to DB
 *
 * POST /api/penutup/asesmen-diri
 * Body: {
 *   checklist: Array<{ indicator_number: number; pernyataan: string; status: "ya" | "belum" | "ragu" }>
 * }
 *
 * No AI, no rule-based. Simply saves the checklist JSON to the DB.
 *
 * Response: { success: true }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { toGMT7SQL } from "@/lib/date";

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

    if (!body || !Array.isArray(body.checklist) || body.checklist.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body — required: checklist (non-empty array)" },
        { status: 400 }
      );
    }

    const { checklist } = body as {
      checklist: { indicator_number: number; pernyataan: string; status: "ya" | "belum" | "ragu" }[];
    };

    // Validate each checklist item
    const validStatuses = ["ya", "belum", "ragu"];
    for (const item of checklist) {
      if (
        typeof item.indicator_number !== "number" ||
        typeof item.pernyataan !== "string" ||
        !validStatuses.includes(item.status)
      ) {
        return NextResponse.json(
          { error: "Invalid checklist item — each must have: indicator_number (number), pernyataan (string), status (ya|belum|ragu)" },
          { status: 400 }
        );
      }
    }

    // ── UPSERT to DB ──────────────────────────────────────────────
    await prisma.$executeRaw`
      INSERT INTO asesmen_diri_submissions (student_id, checklist, submitted_at)
      VALUES (
        ${student.id},
        ${JSON.stringify(checklist)}::jsonb,
        ${toGMT7SQL()}::timestamptz
      )
      ON CONFLICT (student_id)
      DO UPDATE SET
        checklist = EXCLUDED.checklist,
        submitted_at = ${toGMT7SQL()}::timestamptz
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/penutup/asesmen-diri] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database" },
      { status: 500 }
    );
  }
}
