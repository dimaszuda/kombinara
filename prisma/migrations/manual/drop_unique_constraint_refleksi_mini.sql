-- Migration: drop_unique_constraint_refleksi_mini
-- Drop the unique constraint on (student_id, concept_id, question_key)
-- to allow multiple attempts per question (track both correct & incorrect answers).

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'refleksi_mini'
    AND con.contype = 'u';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE refleksi_mini DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No unique constraint found on refleksi_mini';
  END IF;
END $$;
