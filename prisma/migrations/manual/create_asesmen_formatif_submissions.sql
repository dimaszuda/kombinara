-- Migration: create_asesmen_formatif_submissions
-- Final one-shot submission for formative assessments.
-- Students can only submit once per module (enforced by UNIQUE constraint).

CREATE TABLE IF NOT EXISTS asesmen_formatif_submissions (
  submission_id SERIAL    PRIMARY KEY,
  student_id    INT       NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  module_id     INT       NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  concept_id    VARCHAR   CHECK (concept_id IN ('kaidah_penjumlahan', 'kaidah_perkalian', 'faktorial', 'permutasi', 'kombinasi')),
  answers       JSONB     NOT NULL,  -- Array of { question_number, cara_mengerjakan, jawaban_akhir }
  submitted_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  -- One submission per student per module
  UNIQUE (student_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_afs_student ON asesmen_formatif_submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_afs_module  ON asesmen_formatif_submissions (module_id);

COMMENT ON TABLE asesmen_formatif_submissions IS
  'Final submitted answers for formative assessments. One-shot: one row per (student, module). '
  'answers is a JSONB array of 10 question objects. concept_id is optional for sub-topic tagging.';
