-- Migration: create_refleksi_mini
-- Stores student reflective answers and LLM feedback for the Refleksi Mini section.
-- Each question gets its own row (1 soal = 1 row).

CREATE TABLE IF NOT EXISTS refleksi_mini (
  refleksi_id  SERIAL    PRIMARY KEY,
  student_id   INT       NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  concept_id   VARCHAR   NOT NULL
                 CHECK (concept_id IN ('kaidah_penjumlahan', 'kaidah_perkalian', 'permutasi', 'kombinasi')),
  question_key VARCHAR   NOT NULL,
  answer       TEXT      NOT NULL,
  feedback     TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refleksi_mini_student  ON refleksi_mini (student_id);
CREATE INDEX IF NOT EXISTS idx_refleksi_mini_concept  ON refleksi_mini (concept_id);
CREATE INDEX IF NOT EXISTS idx_refleksi_mini_q        ON refleksi_mini (student_id, concept_id, question_key);

COMMENT ON TABLE refleksi_mini IS
  'Student reflective answers for the Refleksi Mini section. '
  'One row per question per submission. feedback is populated synchronously by the LLM.';
