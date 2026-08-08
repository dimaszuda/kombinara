/**
 * GET /api/guru/dashboard
 *
 * Dashboard data untuk halaman guru dashboard.
 * Query params:
 *   - classIds (optional, comma-separated): filter kelas
 *   - materi (optional): filter materi (concept_id) untuk overview & journey
 *   - formatifMateri (optional): filter materi (concept_id) untuk asesmen formatif & integrity
 *   - searchName (optional): filter nama siswa untuk progress
 *   - diagAttempt (optional): percobaan ke-n untuk asesmen diagnostik ("latest" | number)
 *   - formAttempt (optional): percobaan ke-n untuk asesmen formatif ("latest" | number)
 *   - includeDiagnostic (optional): "true" untuk menyertakan data chart diagnostik
 *   - includeJourney (optional): "true" untuk menyertakan data journey siswa
 *   - includeFormatif (optional): "true" untuk menyertakan data chart formatif
 *   - includeIntegrity (optional): "true" untuk menyertakan data integrity events
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuruDashboardData } from "@/lib/data/guru-dashboard";
import { getDiagnosticAnalyticsData } from "@/lib/data/diagnostic-analytics";
import { getJourneyAnalyticsData } from "@/lib/data/journey-analytics";
import { getFormatifAnalyticsData } from "@/lib/data/formatif-analytics";
import { getIntegrityEvents } from "@/lib/data/integrity-analytics";

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
  const formatifMateri = searchParams.get("formatifMateri") || undefined;
  const searchName = searchParams.get("searchName") || undefined;
  const diagAttemptRaw = searchParams.get("diagAttempt") || undefined;
  const formAttemptRaw = searchParams.get("formAttempt") || undefined;
  const includeDiagnostic = searchParams.get("includeDiagnostic") === "true";
  const includeJourney = searchParams.get("includeJourney") === "true";
  const includeFormatif = searchParams.get("includeFormatif") === "true";
  const includeIntegrity = searchParams.get("includeIntegrity") === "true";

  const classIds = classIdsRaw
    ? classIdsRaw
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    : undefined;

  // Parse materi: comma-separated concept_id slugs (untuk overview & journey)
  const materis = materi
    ? materi.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  // Parse formatifMateri: comma-separated concept_id slugs (untuk asesmen formatif & integrity)
  const formatifMateris = formatifMateri
    ? formatifMateri.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  console.log("[GET /api/guru/dashboard] 📋 materis:", materis, "| formatifMateris:", formatifMateris, "| classIds:", classIds);

  // Parse diagAttempt: "latest" | number
  const diagAttempt: number | "latest" | undefined =
    diagAttemptRaw === "latest"
      ? "latest"
      : diagAttemptRaw
        ? parseInt(diagAttemptRaw, 10)
        : undefined;

  // Parse formAttempt: "latest" | number
  const formAttempt: number | "latest" | undefined =
    formAttemptRaw === "latest"
      ? "latest"
      : formAttemptRaw
        ? parseInt(formAttemptRaw, 10)
        : undefined;

  // ── 4. Fetch data ────────────────────────────────────────────
  try {
    // Parallel: overview + diagnostic + journey + formatif + integrity
    const [overview, diagnostic, journey, formatif, integrity] = await Promise.all([
      getGuruDashboardData(classIds, materis, searchName),
      includeDiagnostic
        ? getDiagnosticAnalyticsData({
            classIds,
            attempt: diagAttempt ?? "latest",
          })
        : Promise.resolve(null),
      includeJourney
        ? getJourneyAnalyticsData(classIds, materis, searchName)
        : Promise.resolve(null),
      includeFormatif
        ? getFormatifAnalyticsData({
            classIds,
            conceptIds: formatifMateris,
            attempt: formAttempt ?? "latest",
          })
        : Promise.resolve(null),
      includeIntegrity
        ? getIntegrityEvents({
            classIds,
            conceptIds: formatifMateris,
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ...overview,
      diagnostic,
      journey,
      formatif,
      integrity,
    });
  } catch (err) {
    console.error("[GET /api/guru/dashboard] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}
