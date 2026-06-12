/**
 * User Profile Data Layer (dengan Redis Cache)
 * 
 * Dipakai oleh:
 * - DashboardLayout (server component) → getProfileForLayout()
 * - GET /api/users                           → getProfileForApi()
 * 
 * Cache Strategy:
 * - TTL: 1 jam (PROFILE_CACHE_TTL)
 * - Invalidation: setelah POST /api/users (update profil) via invalidateProfileCache()
 */

import { prisma } from "@/lib/prisma/client";
import { cacheThrough, cacheInvalidate } from "@/lib/redis/cache";
import {
  CACHE_KEYS,
  PROFILE_CACHE_TTL,
} from "@/lib/redis/client";
import type { UserProfile } from "@/types";
import type { User } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════
// Shared DB Query (single source of truth — cached)
// ═══════════════════════════════════════════════════════════════

interface DbUserProfile {
  name: string;
  role: string;
  student: {
    studentNumber: string;
    gender: string;
    class: {
      className: string;
      group: string;
    };
  } | null;
}

/** Query Prisma — hanya dipanggil saat cache MISS */
async function fetchProfileFromDb(userId: string): Promise<DbUserProfile | null> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
      student: {
        select: {
          studentNumber: true,
          gender: true,
          class: { select: { className: true, group: true } },
        },
      },
    },
  });
  return dbUser;
}

function mapToUserProfile(
  dbUser: DbUserProfile,
  supabaseUser: User | null,
): UserProfile {
  const isSiswa = dbUser.role === "siswa" && dbUser.student;

  return {
    name: dbUser.name,
    role: dbUser.role,
    avatarUrl:
      (supabaseUser?.user_metadata?.avatar_url as string | undefined) ?? null,
    className: isSiswa
      ? `${dbUser.student!.class.className} ${dbUser.student!.class.group}`
      : null,
    gender: isSiswa ? dbUser.student!.gender : null,
  };
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Get user profile dengan caching untuk DashboardLayout (server component).
 * 
 * Supabase user object didapat dari server client di layout.
 */
export async function getProfileForLayout(
  userId: string,
  supabaseUser: User | null,
): Promise<UserProfile | null> {
  const cacheKey = CACHE_KEYS.userProfile(userId);

  const dbUser = await cacheThrough(cacheKey, PROFILE_CACHE_TTL, () =>
    fetchProfileFromDb(userId),
  );

  if (!dbUser) return null;
  return mapToUserProfile(dbUser, supabaseUser);
}

/**
 * Get user profile dengan caching untuk API route (GET /api/users).
 * 
 * Return raw data yang dibutuhkan oleh response JSON API.
 */
export interface ApiUserData {
  name: string;
  role: string;
  avatarUrl: string | null;
  studentNumber: string | null;
  className: string | null;
  group: string | null;
  gender: string | null;
}

export async function getProfileForApi(
  userId: string,
  supabaseUser: User | null,
): Promise<ApiUserData | null> {
  const cacheKey = CACHE_KEYS.userProfile(userId);

  const dbUser = await cacheThrough(cacheKey, PROFILE_CACHE_TTL, () =>
    fetchProfileFromDb(userId),
  );

  if (!dbUser) return null;

  const isSiswa = dbUser.role === "siswa" && dbUser.student;

  return {
    name: dbUser.name,
    role: dbUser.role,
    avatarUrl:
      (supabaseUser?.user_metadata?.avatar_url as string | undefined) ?? null,
    studentNumber: isSiswa ? dbUser.student!.studentNumber : null,
    className: isSiswa ? dbUser.student!.class.className : null,
    group: isSiswa ? dbUser.student!.class.group : null,
    gender: isSiswa ? dbUser.student!.gender : null,
  };
}

/**
 * Hapus cache profil user (dipanggil setelah update profil).
 */
export async function invalidateProfileCache(userId: string): Promise<void> {
  await cacheInvalidate(CACHE_KEYS.userProfile(userId));
}
