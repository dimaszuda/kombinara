// AI client setup — Vercel AI SDK + Anthropic
// Model routing berdasarkan stakes level
import { anthropic } from "@ai-sdk/anthropic";

// High stakes: handwritten feedback, depth scoring
export const highStakesModel = anthropic("claude-sonnet-4-20250514");

// Low stakes: block text Q&A, casual chat
export const lowStakesModel = anthropic("claude-haiku-4-5-20251001");
