/**
 * Materi Data Layer (dengan Redis Cache)
 * 
 * Pattern: Cache-Aside
 * - Materi konten sangat jarang berubah (statis seperti CMS)
 * - TTL: 1 jam dengan invalidasi manual saat materi di-update
 * 
 * Saat ini materi masih hardcoded di page files.
 * Layer ini disiapkan untuk migrasi ke DB-driven content (model Materi di Prisma).
 */

import { prisma } from "@/lib/prisma/client";
import { cacheThrough, cacheInvalidateMany } from "@/lib/redis/cache";
import { CACHE_KEYS, MATERI_CACHE_TTL } from "@/lib/redis/client";
import type { Materi } from "@/types";
import type { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Type Mapper: Prisma result → Domain Materi
// ═══════════════════════════════════════════════════════════════

type MateriSelect = Prisma.MateriGetPayload<Record<string, never>>;

function mapToMateri(record: MateriSelect): Materi {
  return {
    id: record.id,
    slug: record.slug,
    judul: record.judul,
    konten: record.konten as Materi["konten"], // Prisma Json → TipTapJSON (runtime-safe)
    urutan: record.urutan,
    publishedAt: record.publishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// ═══════════════════════════════════════════════════════════════
// Read Operations (cached)
// ═══════════════════════════════════════════════════════════════

export async function getMateriBySlug(slug: string): Promise<Materi | null> {
  const cacheKey = CACHE_KEYS.materiBySlug(slug);

  const cached = await cacheThrough<MateriSelect>(cacheKey, MATERI_CACHE_TTL, async () => {
    const result = await prisma.materi.findUniqueOrThrow({ where: { slug } });
    return result;
  });

  return cached ? mapToMateri(cached) : null;
}

export async function getAllMateri(): Promise<Materi[]> {
  const cacheKey = CACHE_KEYS.materiList();

  const cached = await cacheThrough<MateriSelect[]>(cacheKey, MATERI_CACHE_TTL, async () => {
    const results = await prisma.materi.findMany({ orderBy: { urutan: "asc" } });
    return results;
  });

  return (cached ?? []).map(mapToMateri);
}

// ═══════════════════════════════════════════════════════════════
// Invalidation
// ═══════════════════════════════════════════════════════════════

/**
 * Invalidate semua materi cache (dipanggil setelah create/update/delete materi).
 */
export async function invalidateMateriCache(slug?: string): Promise<void> {
  const keys: string[] = [CACHE_KEYS.materiList()];
  if (slug) {
    keys.push(CACHE_KEYS.materiBySlug(slug));
  }
  await cacheInvalidateMany(keys);
}
