import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { sendAlert } from "@/lib/alerts";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (!code) {
    logger.warn("auth:callback", "OAuth callback received without code param", {
      type: type ?? "oauth",
    });
    return NextResponse.redirect(new URL("/login?error=oauth_error", origin));
  }

  // Buat response sementara untuk attach cookies saat exchange session
  const tempResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          tempResponse.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          tempResponse.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  logger.info("auth:callback", "Exchanging OAuth code for session", { type: type ?? "oauth" });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.error("auth:callback", "Code exchange failed", {
      error: error.message,
      type: type ?? "oauth",
    });
    sendAlert({
      title: "OAuth Code Exchange Failed",
      route: "GET /auth/callback",
      error: error.message,
      meta: { type: type ?? "oauth" },
    });
    return NextResponse.redirect(new URL("/login?error=oauth_error", origin));
  }

  // Jika recovery flow, arahkan ke halaman reset password
  if (type === "recovery") {
    const email = data.session?.user?.email ?? "";
    logger.info("auth:callback", "Recovery flow - redirecting to reset password", {
      userId: data.session?.user?.id,
      email: maskEmail(email),
    });
    const response = NextResponse.redirect(
      new URL(`/reset-password?email=${encodeURIComponent(email)}`, origin)
    );
    tempResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
      response.cookies.set({ name, value, ...opts });
    });
    return response;
  }

  // Jika user sudah punya role (login ulang), langsung ke dashboard
  // Jika belum (pertama kali Google signup), arahkan ke complete-profil
  const role = data.session?.user?.user_metadata?.role as string | undefined;
  const redirectPath = role ? (role === "guru" ? "/guru" : "/siswa") : "/complete-profil";

  if (role) {
    logger.info("auth:callback", "OAuth login - redirecting to dashboard", {
      userId: data.session?.user?.id,
      role,
      redirectPath,
    });
  } else {
    logger.info("auth:callback", "New OAuth user - redirecting to complete profile", {
      userId: data.session?.user?.id,
    });
  }

  const response = NextResponse.redirect(new URL(redirectPath, origin));
  // Salin cookies dari tempResponse ke response akhir
  tempResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
    response.cookies.set({ name, value, ...opts });
  });

  return response;
}
