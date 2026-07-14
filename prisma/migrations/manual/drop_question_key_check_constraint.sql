-- Migration: drop_question_key_check_constraint
-- Removes the CHECK constraint on question_key from apersepsi_pemantik_responses
-- because validation is already done at the application level (VALID_QUESTION_KEYS set).
-- The CHECK constraint became out-of-sync with new question keys added over time.

ALTER TABLE apersepsi_pemantik_responses
  DROP CONSTRAINT IF EXISTS apersepsi_pemantik_responses_question_key_check;
