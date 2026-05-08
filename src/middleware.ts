// Middleware Next.js — route protection + role-based redirect
// Dijalankan di Edge Runtime sebelum setiap request
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Unauthenticated — redirect ke login
  if (!user && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated — redirect dari login ke dashboard
  if (user && pathname === "/login") {
    const role = user.user_metadata?.role as string;
    return NextResponse.redirect(
      new URL(role === "guru" ? "/guru" : "/siswa", request.url)
    );
  }

  // Role guard — siswa tidak bisa akses /guru dan sebaliknya
  if (user) {
    const role = user.user_metadata?.role as string;
    if (pathname.startsWith("/guru") && role !== "guru") {
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
    if (pathname.startsWith("/siswa") && role !== "siswa") {
      return NextResponse.redirect(new URL("/guru", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
