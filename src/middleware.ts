// Middleware Next.js — route protection + role-based redirect
// Dijalankan di Edge Runtime sebelum setiap request
import { createServerClient } from "@supabase/ssr";
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

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

    // Role guard — siswa tidak bisa akses /guru dan sebaliknya
    if (pathname.startsWith("/guru") && role !== "guru") {
      logger.warn("auth:middleware", "Role violation - siswa attempted to access /guru", {
        userId: user.id,
        role,
        pathname,
      });
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
    if (pathname.startsWith("/siswa") && role !== "siswa") {
      logger.warn("auth:middleware", "Role violation - guru attempted to access /siswa", {
        userId: user.id,
        role,
        pathname,
      });
      return NextResponse.redirect(new URL("/guru", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons|api).*)"],
};
