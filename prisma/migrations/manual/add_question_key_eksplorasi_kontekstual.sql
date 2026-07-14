-- Migration: add_question_key_eksplorasi_kontekstual
-- Adds question_key column to eksplorasi_kontekstual table.
-- Enables per-question (per-row) saving instead of per-section saving.
-- Also adds a composite index for efficient lookups.

-- Step 1: Add question_key column (NOT NULL with a default for existing rows)
ALTER TABLE eksplorasi_kontekstual
  ADD COLUMN IF NOT EXISTS question_key VARCHAR(100) NOT NULL DEFAULT 'legacy';

COMMENT ON COLUMN eksplorasi_kontekstual.question_key IS
  'Key identifier for each question/sub-step within an eksplorasi kontekstual section. Enables per-question row-level saving.';

-- Step 2: Add composite index for (student_id, concept_id, question_key)
CREATE INDEX IF NOT EXISTS idx_eksplorasi_student_concept_question
  ON eksplorasi_kontekstual (student_id, concept_id, question_key);

-- Step 3: Remove the default after backfilling existing rows
-- (The default is only needed for the ALTER TABLE to succeed on existing rows)
ALTER TABLE eksplorasi_kontekstual
  ALTER COLUMN question_key DROP DEFAULT;
