-- Migration: drop_apersepsi_unique_constraint
-- Removes the unique constraint on (student_id, question_key) from apersepsi_pemantik_responses
-- so that each submission always creates a new row (INSERT, not UPSERT).
-- The response_id auto-increment PK already guarantees uniqueness.

ALTER TABLE apersepsi_pemantik_responses
  DROP CONSTRAINT IF EXISTS uq_student_question;
