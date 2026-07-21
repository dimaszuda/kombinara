// Middleware Next.js — route protection + role-based redirect
// Dijalankan di Edge Runtime sebelum setiap request
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: readonly { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
            request.cookies.set(name, value);
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Dapatkan user dengan fallback — handle network error (ECONNRESET, dll)
  let user: { id: string; user_metadata?: { role?: string } } | null = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch (err: unknown) {
    logger.warn("auth:middleware", "getUser() failed — falling back to getSession()", {
      error: err instanceof Error ? err.message : String(err),
      code: err instanceof Error ? (err as Error & { cause?: { code?: string } }).cause?.code : undefined,
    });

    // Fallback: baca session dari cookie (tidak perlu network call ke Supabase)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        user = sessionData.session.user;
        logger.info("auth:middleware", "Session fallback succeeded", {
          userId: user!.id,
        });
      }
    } catch (sessionErr: unknown) {
      logger.error("auth:middleware", "getSession() fallback also failed", {
        error: sessionErr instanceof Error ? sessionErr.message : String(sessionErr),
      });
      // Biarkan user tetap null — akan ditangani di bawah
    }
  }

  const pathname = request.nextUrl.pathname;

  // Unauthenticated — redirect ke login
  const publicPaths = ["/login", "/join", "/signup", "/auth/callback", "/complete-profil", "/forgot-password", "/reset-password"];
  if (!user && !publicPaths.some((p) => pathname.startsWith(p))) {
    logger.warn("auth:middleware", "Unauthenticated access attempt", { pathname });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    const role = user.user_metadata?.role as string;

    // Belum lengkap profil (belum punya role) — paksa ke complete-profil
    if (!role && !pathname.startsWith("/complete-profil") && !pathname.startsWith("/auth")) {
      logger.info("auth:middleware", "Incomplete profile - redirecting to complete-profil", {
        userId: user.id,
        pathname,
      });
      return NextResponse.redirect(new URL("/complete-profil", request.url));
    }

    // Authenticated — redirect dari login ke dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(
        new URL(role === "guru" ? "/guru" : "/siswa", request.url)
      );
    }

    // Role guard — siswa tidak bisa akses /guru
    // Guru bisa akses semua halaman (guru = admin)
    if (pathname.startsWith("/guru") && role !== "guru") {
      logger.warn("auth:middleware", "Role violation - non-guru attempted to access /guru", {
        userId: user.id,
        role,
        pathname,
      });
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|api).*)"],
};
