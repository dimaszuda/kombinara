import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileForLayout } from "@/lib/data/user-profile";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { UserProfile } from "@/types";

// Server Component — profile di-fetch server-side dengan Redis cache,
// sehingga icon profil langsung muncul tanpa waterfall client-side
// dan tanpa query Prisma di setiap page load.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: UserProfile | null = null;

  if (user) {
    try {
      profile = await getProfileForLayout(user.id, user);
    } catch {
      // Gagal fetch profile tidak boleh crash layout
    }
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}