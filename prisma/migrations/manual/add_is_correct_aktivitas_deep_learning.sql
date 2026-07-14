-- Migration: add_is_correct_aktivitas_deep_learning
-- Adds is_correct column to aktivitas_deep_learning table.
-- Populated from LLM AnswerClassification response.

ALTER TABLE aktivitas_deep_learning
  ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;

COMMENT ON COLUMN aktivitas_deep_learning.is_correct IS
  'Whether the student answer is correct according to LLM classification. NULL if not yet classified.';
