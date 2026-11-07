/**
 * Role helpers — Edge-safe (dipakai juga di middleware).
 *
 * SUMBER ROLE: `app_metadata.role`, BUKAN `user_metadata.role`.
 * `user_metadata` bisa diubah sendiri oleh user lewat `supabase.auth.updateUser()`
 * dari browser, sehingga tidak boleh dipakai untuk otorisasi. `app_metadata` hanya
 * bisa ditulis dengan service role (lihat `setUserRole` di `src/lib/supabase/admin.ts`).
 */

import type { UserRole } from "@/types";

const VALID_ROLES: readonly UserRole[] = ["siswa", "guru"];

/** Ambil role terverifikasi dari user Supabase. `null` = belum punya role (profil belum lengkap). */
export function getUserRole(user: { app_metadata?: Record<string, unknown> } | null | undefined): UserRole | null {
  const role = user?.app_metadata?.role;
  return typeof role === "string" && (VALID_ROLES as readonly string[]).includes(role)
    ? (role as UserRole)
    : null;
}

/** Halaman beranda dashboard sesuai role. */
export function dashboardPathFor(role: UserRole): string {
  return role === "guru" ? "/guru" : "/siswa";
}
