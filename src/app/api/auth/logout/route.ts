import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );

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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      logger.info("auth:logout", "User logging out", { userId: user.id });
    }

    // Sign out dari Supabase
    await supabase.auth.signOut();

    return response;
  } catch (error) {
    logger.error("auth:logout", "Logout error", { 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    return NextResponse.json(
      { error: "Logout gagal" },
      { status: 500 }
    );
  }
}
