// Upstash Redis client untuk caching (AI responses + data layer)
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ═══════════════════════════════════════════════════════════════
// TTL Constants (dalam detik)
// ═══════════════════════════════════════════════════════════════

/** AI response cache: 24 jam — chat answers jarang berubah */
export const AI_CACHE_TTL = 60 * 60 * 24;

/** User profile cache: 1 jam — profil relatif statis */
export const PROFILE_CACHE_TTL = 60 * 60;

/** Materi content cache: 1 jam — konten materi hampir tidak pernah berubah */
export const MATERI_CACHE_TTL = 60 * 60;

/** Leaderboard cache: 5 menit — data agregat, acceptable slight staleness */
export const LEADERBOARD_CACHE_TTL = 5 * 60;

// ═══════════════════════════════════════════════════════════════
// Key Prefix Conventions (namespace untuk menghindari collision)
// ═══════════════════════════════════════════════════════════════

export const CACHE_KEYS = {
  /** User profile by userId */
  userProfile: (userId: string) => `user:profile:${userId}`,
  /** Materi by slug */
  materiBySlug: (slug: string) => `materi:slug:${slug}`,
  /** Semua materi (list) */
  materiList: () => `materi:list`,
  /** Leaderboard by classId + mode */
  leaderboard: (classId: number, mode: string) => `leaderboard:${classId}:${mode}`,
  /** AI chat response */
  aiChat: (hash: string) => `ai:chat:${hash}`,
  /** AI depth score */
  aiDepth: (hash: string) => `ai:depth:${hash}`,
} as const;

/**
 * Simple hash untuk AI cache keys (digunakan oleh AI routes).
 * Untuk data-layer cache, gunakan CACHE_KEYS di atas.
 */
export function buildCacheKey(prefix: string, content: string): string {
  return `${prefix}:${Buffer.from(content).toString("base64url").slice(0, 64)}`;
}
