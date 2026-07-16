/**
 * Semantic Cache — AI Chat Response Caching
 *
 * Strategy:
 * 1. Embed pertanyaan siswa via OpenAI text-embedding-3-small
 * 2. Cari di Upstash Vector untuk pertanyaan yang semantically similar
 * 3. Jika similarity ≥ threshold DAN lab (konteks percakapan) cocok → cache HIT
 * 4. Jika MISS → panggil AI → simpan jawaban di Redis + vector di Upstash Vector
 *
 * Sliding Window Integration:
 * - `lab` parameter adalah fingerprint dari 3 pesan terakhir dalam history,
 *   sehingga pertanyaan yang sama dalam konteks percakapan berbeda TIDAK akan
 *   menghasilkan cache hit yang salah.
 * - History sliding window tetap dikirim ke AI saat cache MISS, menjaga
 *   kontinuitas percakapan.
 *
 * Edge Runtime compatible — semua operasi via REST (Upstash) atau HTTP (OpenAI).
 */

import { randomUUID } from "crypto";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import { Index } from "@upstash/vector";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CacheMetadata {
  cache_id: string;
  question: string;
  lab: string;
  /** ISO timestamp kapan entry ini dibuat */
  created_at: string;
}

export interface CacheEntry {
  answer: string;
  question: string;
  lab: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default cosine similarity threshold (0.85 = cukup ketat, hindari false positive) */
const DEFAULT_THRESHOLD = 0.85;

/** Default TTL: 7 hari (detik) */
const DEFAULT_TTL = 60 * 60 * 24 * 7;

/** Embedding model — ringan & cepat, cocok untuk semantic search */
const EMBEDDING_MODEL = "text-embedding-3-small";

// ---------------------------------------------------------------------------
// SemanticCache Class
// ---------------------------------------------------------------------------

export class SemanticCache {
  private threshold: number;
  private ttl: number;
  private redis: Redis;
  private vectorIndex: Index;
  private openai: OpenAI;

  /**
   * @param threshold - Cosine similarity minimum (0–1) untuk cache hit
   * @param ttl       - TTL Redis entry dalam detik (default 24 jam)
   */
  constructor(threshold: number = DEFAULT_THRESHOLD, ttl: number = DEFAULT_TTL) {
    this.threshold = threshold;
    this.ttl = ttl;

    this.redis = Redis.fromEnv();
    this.vectorIndex = Index.fromEnv();
    this.openai = new OpenAI();
  }

  // ------------------------------------------------------------------
  // Private Helpers
  // ------------------------------------------------------------------

  /**
   * Embed teks menjadi vector menggunakan OpenAI text-embedding-3-small.
   */
  private async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  }

  /** Redis key untuk menyimpan jawaban berdasarkan cache_id */
  private redisKey(cacheId: string): string {
    return `semantic_cache:${cacheId}`;
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Cari jawaban di cache berdasarkan pertanyaan + lab (konteks percakapan).
   *
   * @param question - Pertanyaan siswa (teks mentah)
   * @param lab      - Fingerprint konteks percakapan (hash dari N pesan terakhir)
   * @returns CacheEntry jika HIT, null jika MISS
   */
  async get(question: string, lab: string): Promise<CacheEntry | null> {
    try {
      const vector = await this.embed(question);

      const results = await this.vectorIndex.query({
        vector,
        topK: 1,
        includeMetadata: true,
      });

      if (!results || results.length === 0) {
        console.log("[semantic-cache] ❌ MISS — vector index kosong");
        return null;
      }

      const best = results[0];
      const score = best.score ?? 0;
      const meta = (best.metadata ?? {}) as Partial<CacheMetadata>;

      // Cek: similarity cukup tinggi DAN lab (konteks) cocok
      if (score >= this.threshold && meta.lab === lab) {
        const cacheId = meta.cache_id;
        if (!cacheId) {
          console.log("[semantic-cache] ⚠️  Metadata tidak punya cache_id");
          return null;
        }

        console.log(
          `[semantic-cache] ✅ HIT | similarity: ${score.toFixed(4)} | id: ${cacheId}`
        );

        const raw = await this.redis.get<CacheEntry>(this.redisKey(cacheId));
        if (!raw) {
          // Vector entry ada tapi Redis sudah expired → treat as MISS
          console.log("[semantic-cache] ⚠️  Redis entry expired, treating as MISS");
          return null;
        }

        return raw;
      }

      console.log(
        `[semantic-cache] ❌ MISS | best similarity: ${score.toFixed(4)} (threshold: ${this.threshold}) | lab match: ${meta.lab === lab}`
      );
      return null;
    } catch (err) {
      // Jangan crash — cache is optional optimization
      console.warn("[semantic-cache] ⚠️  Error saat get:", err);
      return null;
    }
  }

  /**
   * Simpan jawaban ke cache (Redis + Vector).
   *
   * @param question - Pertanyaan siswa
   * @param lab      - Fingerprint konteks percakapan
   * @param answer   - Jawaban dari AI
   * @returns cache_id yang dipakai
   */
  async set(question: string, lab: string, answer: string): Promise<string> {
    const cacheId = randomUUID();
    const vector = await this.embed(question);

    const entry: CacheEntry = { answer, question, lab };

    // Simpan jawaban di Redis (dengan TTL)
    await this.redis.set(this.redisKey(cacheId), entry, { ex: this.ttl });

    // Simpan vector + metadata di Upstash Vector
    await this.vectorIndex.upsert([
      {
        id: cacheId,
        vector,
        metadata: {
          cache_id: cacheId,
          question,
          lab,
          created_at: new Date().toISOString(),
        } satisfies CacheMetadata,
      },
    ]);

    console.log(`[semantic-cache] 💾 Cached | id: ${cacheId} | lab: ${lab}`);
    return cacheId;
  }

  /**
   * Hapus satu entry dari Redis dan Vector (untuk admin/invalidation).
   */
  async delete(cacheId: string): Promise<void> {
    try {
      await Promise.all([
        this.redis.del(this.redisKey(cacheId)),
        this.vectorIndex.delete([cacheId]),
      ]);
      console.log(`[semantic-cache] 🗑️  Deleted: ${cacheId}`);
    } catch (err) {
      console.warn("[semantic-cache] ⚠️  Error saat delete:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

/** Shared SemanticCache instance — inisialisasi sekali di level module */
export const semanticCache = new SemanticCache();

// ---------------------------------------------------------------------------
// Sliding Window Context Fingerprint
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Buat "lab" fingerprint dari N pesan terakhir dalam history chat.
 *
 * Tujuannya: pertanyaan yang sama dalam konteks percakapan berbeda
 * TIDAK akan menghasilkan cache hit yang salah.
 *
 * Algoritma:
 * - Ambil 3 pesan USER terakhir (abaikan assistant)
 * - Gabungkan jadi satu string
 * - Hash pendek (first 12 char dari base64url)
 *
 * @param history - Array pesan chat (user + assistant)
 * @returns Fingerprint string, atau "__no_context__" jika history kosong
 */
export function buildContextFingerprint(history?: ChatMessage[]): string {
  if (!history || history.length === 0) {
    return "__no_context__";
  }

  // Ambil maks 3 pesan USER terakhir untuk fingerprint
  const userMessages = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content.trim().toLowerCase())
    .join(" | ");

  if (!userMessages) {
    return "__no_context__";
  }

  // Hash sederhana: base64url dari buffer, ambil 12 karakter pertama
  return Buffer.from(userMessages).toString("base64url").slice(0, 12);
}
