-- Migration: create_asesmen_formatif_drafts
-- Auto-save draft answers per question for formative assessments.
-- Prevents data loss due to technical failures (browser crash, network issues, etc.).

CREATE TABLE IF NOT EXISTS asesmen_formatif_drafts (
  draft_id         SERIAL    PRIMARY KEY,
  student_id       INT       NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  module_id        INT       NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  question_number  INT       NOT NULL CHECK (question_number BETWEEN 1 AND 10),
  cara_mengerjakan TEXT,
  jawaban_akhir    TEXT,
  last_saved_at    TIMESTAMP NOT NULL DEFAULT NOW(),

  -- One draft row per (student, module, question_number)
  UNIQUE (student_id, module_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_afd_student_module ON asesmen_formatif_drafts (student_id, module_id);

COMMENT ON TABLE asesmen_formatif_drafts IS
  'Draft answers for formative assessments. Saved on interval (1 min) and on typing pause via debounce. '
  'Only rows with non-null cara_mengerjakan OR jawaban_akhir are persisted by the API.';
