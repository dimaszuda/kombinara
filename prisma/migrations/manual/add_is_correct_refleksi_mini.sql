-- Migration: add_is_correct_refleksi_mini
-- Adds is_correct column to refleksi_mini table.
-- Populated from LLM AnswerClassification response per question.

ALTER TABLE refleksi_mini
  ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;

COMMENT ON COLUMN refleksi_mini.is_correct IS
  'Whether the student reflection answer is correct according to LLM classification. NULL if not yet classified.';
