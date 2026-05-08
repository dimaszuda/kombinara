// Upstash Redis client untuk semantic caching AI responses
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// TTL default untuk AI response cache: 24 jam
export const AI_CACHE_TTL = 60 * 60 * 24;

// Key prefix conventions:
// ai:chat:{hash}     -> cached chat response
// ai:depth:{hash}    -> cached depth score
export function buildCacheKey(prefix: string, content: string): string {
  // TODO: Implement semantic hashing (bisa pakai embedding similarity)
  // Untuk MVP: pakai simple hash dari content string
  return `${prefix}:${Buffer.from(content).toString("base64url").slice(0, 64)}`;
}
