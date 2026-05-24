import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { UserProfile } from "@/components/dashboard/DashboardShell";

// Server Component — profile di-fetch server-side saat SSR,
// sehingga icon profil langsung muncul tanpa waterfall client-side.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;

  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          name: true,
          role: true,
          student: {
            select: {
              gender: true,
              class: { select: { className: true, group: true } },
            },
          },
        },
      });

      if (dbUser) {
        profile = {
          name: dbUser.name,
          role: dbUser.role,
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
          className:
            dbUser.role === "siswa" && dbUser.student
              ? `${dbUser.student.class.className} ${dbUser.student.class.group}`
              : null,
          gender: dbUser.role === "siswa" && dbUser.student ? dbUser.student.gender : null,
        };
      }
    } catch {
      // Gagal fetch profile tidak boleh crash layout
    }
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}