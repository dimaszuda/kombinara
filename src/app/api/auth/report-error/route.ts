/**
 * Endpoint untuk menerima laporan error auth dari client-side pages.
 * (login, forgot-password, reset-password menggunakan Supabase browser client
 *  sehingga error-nya terjadi di browser, bukan di server)
 *
 * Keamanan:
 * - Error type dibatasi dengan allowlist (mencegah log injection)
 * - Route di-sanitasi (max 100 karakter)
 * - Tidak ada data user yang diteruskan ke log/alert
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { sendAlert } from "@/lib/alerts";

const VALID_TYPES = ["rate_limit", "unexpected_error", "oauth_error"] as const;
type ErrorType = (typeof VALID_TYPES)[number];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return new NextResponse(null, { status: 400 });
  }

  const { type, route } = body as Record<string, unknown>;

  if (!VALID_TYPES.includes(type as ErrorType)) {
    return new NextResponse(null, { status: 400 });
  }

  // Sanitasi route — hanya terima string pendek
  const safeRoute =
    typeof route === "string" ? route.replace(/[^\w\s/:-]/g, "").slice(0, 100) : "unknown";

  switch (type as ErrorType) {
    case "rate_limit":
      logger.warn("auth:client", "Rate limit hit", { route: safeRoute });
      break;

    case "oauth_error":
      logger.warn("auth:client", "OAuth error on client", { route: safeRoute });
      break;

    case "unexpected_error":
      logger.error("auth:client", "Unexpected auth error on client", { route: safeRoute });
      sendAlert({
        title: "Unexpected Auth Error (Client-side)",
        route: safeRoute,
        message: "Error tidak terduga terjadi di halaman auth sisi client.",
      });
      break;
  }

  return new NextResponse(null, { status: 204 });
}
