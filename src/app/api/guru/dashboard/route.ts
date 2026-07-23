/**
 * GET /api/guru/dashboard
 *
 * Dashboard data untuk halaman guru dashboard.
 * Query params:
 *   - classIds (optional, comma-separated): filter kelas
 *   - materi (optional): filter materi (concept_id) untuk progress siswa
 *   - searchName (optional): filter nama siswa untuk progress
 *   - diagAttempt (optional): percobaan ke-n untuk asesmen diagnostik ("latest" | number)
 *   - includeDiagnostic (optional): "true" untuk menyertakan data chart diagnostik
 *   - includeJourney (optional): "true" untuk menyertakan data journey siswa
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuruDashboardData } from "@/lib/data/guru-dashboard";
import { getDiagnosticAnalyticsData } from "@/lib/data/diagnostic-analytics";
import { getJourneyAnalyticsData } from "@/lib/data/journey-analytics";

export async function GET(req: Request) {
  // ── 1. Autentikasi ───────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Role check — hanya guru ───────────────────────────────
  if (user.user_metadata?.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── 3. Parse query params ────────────────────────────────────
  const { searchParams } = new URL(req.url);
  const classIdsRaw = searchParams.get("classIds");
  const materi = searchParams.get("materi") || undefined;
  const searchName = searchParams.get("searchName") || undefined;
  const diagAttemptRaw = searchParams.get("diagAttempt") || undefined;
  const includeDiagnostic = searchParams.get("includeDiagnostic") === "true";
  const includeJourney = searchParams.get("includeJourney") === "true";

  const classIds = classIdsRaw
    ? classIdsRaw
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    : undefined;

  // Parse diagAttempt: "latest" | number
  const diagAttempt: number | "latest" | undefined =
    diagAttemptRaw === "latest"
      ? "latest"
      : diagAttemptRaw
        ? parseInt(diagAttemptRaw, 10)
        : undefined;

  // ── 4. Fetch data ────────────────────────────────────────────
  try {
    // Parallel: overview + diagnostic + journey
    const [overview, diagnostic, journey] = await Promise.all([
      getGuruDashboardData(classIds, materi, searchName),
      includeDiagnostic
        ? getDiagnosticAnalyticsData({
            classIds,
            attempt: diagAttempt ?? "latest",
          })
        : Promise.resolve(null),
      includeJourney
        ? getJourneyAnalyticsData(classIds, materi, searchName)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ...overview,
      diagnostic,
      journey,
    });
  } catch (err) {
    console.error("[GET /api/guru/dashboard] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}
