-- ============================================================================
-- Multi-Attempts & AI Evaluation Support
-- ============================================================================
-- Changes:
-- 1. Drop UNIQUE constraints on asesmen_formatif_attempts & submissions
--    (allow multiple attempts/submissions per student per module)
-- 2. Make concept_id NOT NULL in asesmen_formatif_submissions
-- 3. Add evaluation columns to asesmen_formatif_submissions
-- 4. Add completed_at to asesmen_formatif_attempts
-- ============================================================================

-- 1. Drop unique constraints
ALTER TABLE asesmen_formatif_attempts 
  DROP CONSTRAINT IF EXISTS asesmen_formatif_attempts_student_id_module_id_key;

ALTER TABLE asesmen_formatif_submissions 
  DROP CONSTRAINT IF EXISTS asesmen_formatif_submissions_student_id_module_id_key;

-- 2. Drop check constraint on concept_id & make concept_id NOT NULL
--    First find and drop any existing check constraint
DO $$
DECLARE
  constraint_name_var text;
BEGIN
  SELECT con.conname INTO constraint_name_var
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'asesmen_formatif_submissions'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%concept_id%';
  
  IF constraint_name_var IS NOT NULL THEN
    EXECUTE 'ALTER TABLE asesmen_formatif_submissions DROP CONSTRAINT ' || constraint_name_var;
  END IF;
END $$;

-- Fill nulls with default
UPDATE asesmen_formatif_submissions 
  SET concept_id = 'kaidah-pencacahan' 
  WHERE concept_id IS NULL;

ALTER TABLE asesmen_formatif_submissions 
  ALTER COLUMN concept_id SET NOT NULL;

-- 3. Add evaluation columns to submissions
ALTER TABLE asesmen_formatif_submissions 
  ADD COLUMN IF NOT EXISTS total_score DOUBLE PRECISION;

ALTER TABLE asesmen_formatif_submissions 
  ADD COLUMN IF NOT EXISTS per_question_results JSONB;

ALTER TABLE asesmen_formatif_submissions 
  ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

ALTER TABLE asesmen_formatif_submissions 
  ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ;

ALTER TABLE asesmen_formatif_submissions 
  ADD COLUMN IF NOT EXISTS ai_model TEXT;

-- 4. Add completed_at to attempts
ALTER TABLE asesmen_formatif_attempts 
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 5. Add index for cooldown queries
CREATE INDEX IF NOT EXISTS idx_attempts_student_module_completed 
  ON asesmen_formatif_attempts (student_id, module_id, completed_at DESC);
