-- Migration: create_apersepsi_pemantik_responses
-- Stores student responses for Apersepsi, Pemantik, and Refleksi sections.
-- LLM classification results (is_correct, misconception_type) are written async after submit.

CREATE TABLE IF NOT EXISTS apersepsi_pemantik_responses (
  response_id       SERIAL        PRIMARY KEY,
  student_id        INT           NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  section           VARCHAR       NOT NULL CHECK (section IN ('apersepsi', 'pemantik', 'refleksi')),
  question_key      VARCHAR       NOT NULL,
  response_data     JSONB         NOT NULL,
  is_correct        BOOL,
  misconception_type VARCHAR,
  feedback          TEXT,
  submitted_at      TIMESTAMP     NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_student_question UNIQUE (student_id, question_key)
);

CREATE INDEX IF NOT EXISTS idx_apr_student ON apersepsi_pemantik_responses (student_id);
CREATE INDEX IF NOT EXISTS idx_apr_section  ON apersepsi_pemantik_responses (section);

COMMENT ON TABLE apersepsi_pemantik_responses IS
  'Student open-ended responses for Apersepsi / Pemantik / Refleksi sections. '
  'is_correct and misconception_type are populated by LLM classification on submit.';
