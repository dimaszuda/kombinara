/**
 * Supabase admin client (service role) — HANYA untuk server (route handler / script).
 * Jangan pernah diimpor dari Client Component.
 */
import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Set role terverifikasi di `app_metadata` (tidak bisa diubah user dari browser).
 * Throw jika gagal — pemanggil yang memutuskan rollback.
 */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { app_metadata: { role } });
  if (error) {
    throw new Error(`Gagal menyimpan role: ${error.message}`);
  }
}
