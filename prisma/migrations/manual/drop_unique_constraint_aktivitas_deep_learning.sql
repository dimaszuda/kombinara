-- Migration: drop_unique_constraint_aktivitas_deep_learning
-- Removes the unique constraint on (student_id, concept_id) so that
-- every student submission creates a new row (allowing multiple attempts).
-- This supports the learning model where every attempt (correct or incorrect)
-- is preserved for review.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'aktivitas_deep_learning'
    AND con.contype = 'u';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE aktivitas_deep_learning DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No unique constraint found on aktivitas_deep_learning';
  END IF;
END $$;
