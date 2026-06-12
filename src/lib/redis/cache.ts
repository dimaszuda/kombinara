/**
 * Generic Redis Cache Utility
 * 
 * Pattern: Cache-Aside (Lazy Loading)
 * - Baca: cek Redis dulu, kalau MISS → query DB → simpan ke Redis → return
 * - Tulis: update DB → invalidate Redis key
 * 
 * Kenapa bukan Cache-Through?
 * - Upstash Redis adalah REST-based, latency tidak sepantas in-memory Redis
 * - Cache-Aside lebih sederhana dan tidak blocking saat cache dingin
 */

import { redis } from "./client";
import { logger } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
// Core Cache Operations
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil data dari cache. Return null jika MISS.
 * 
 * Upstash Redis (`@upstash/redis`) auto-serializes objects via JSON
 * dan auto-deserializes saat `get()`. Jadi TIDAK perlu JSON.parse/stringify manual.
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get<T>(key);
    return raw ?? null;
  } catch (err) {
    logger.warn("redis:cache", "Gagal baca cache", { key, error: String(err) });
    return null; // Degrade gracefully — jangan crash
  }
}

/**
 * Simpan data ke cache dengan TTL.
 * 
 * Upstash Redis auto-serializes objects — cukup pass object langsung.
 */
export async function cacheSet<T = unknown>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (err) {
    // Silent fail — cache is optional, DB is source of truth
    logger.warn("redis:cache", "Gagal tulis cache", { key, error: String(err) });
  }
}

/**
 * Hapus key dari cache (invalidation).
 */
export async function cacheInvalidate(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn("redis:cache", "Gagal invalidasi cache", { key, error: String(err) });
  }
}

/**
 * Hapus multiple keys sekaligus (batch invalidation).
 */
export async function cacheInvalidateMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    logger.warn("redis:cache", "Gagal batch invalidasi", { count: keys.length, error: String(err) });
  }
}

// ═══════════════════════════════════════════════════════════════
// High-Level Patterns
// ═══════════════════════════════════════════════════════════════

/**
 * Cache-Aside: baca dari cache, fallback ke DB fetcher jika MISS.
 * 
 * @example
 * const profile = await cacheThrough("user:profile:abc", 3600, () => prisma.user.findUnique(...));
 */
export async function cacheThrough<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  // 1. Cek cache dulu
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 2. Cache MISS — fetch dari source (DB)
  const data = await fetcher();
  if (data === null) {
    return null;
  }

  // 3. Simpan ke cache untuk next request
  await cacheSet(key, data, ttlSeconds);

  return data;
}

/**
 * Invalidate cache setelah write operation.
 * Panggil ini setelah berhasil UPDATE/DELETE di database.
 * 
 * @example
 * await prisma.user.update(...);
 * await invalidateAfterWrite(CACHE_KEYS.userProfile(userId));
 */
export async function invalidateAfterWrite(...keys: string[]): Promise<void> {
  await cacheInvalidateMany(keys);
}
