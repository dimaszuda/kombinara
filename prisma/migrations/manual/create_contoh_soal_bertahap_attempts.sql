-- Migration: create_contoh_soal_bertahap_attempts
-- Tracks every "Cek Jawaban" submission in the Contoh Soal Bertahap section.
-- attempt_number is per (student_id, question_key), NOT per section.

CREATE TABLE IF NOT EXISTS contoh_soal_bertahap_attempts (
  attempt_id       SERIAL        PRIMARY KEY,
  student_id       INT           NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  concept_id       VARCHAR       NOT NULL
                     CHECK (concept_id IN ('kaidah_penjumlahan', 'kaidah_perkalian', 'permutasi', 'kombinasi')),
  question_key     VARCHAR       NOT NULL,
  difficulty_level VARCHAR       NOT NULL
                     CHECK (difficulty_level IN ('mudah', 'sedang', 'hots')),
  order_index      INT           NOT NULL,
  attempt_number   INT           NOT NULL,
  answer           JSONB         NOT NULL,
  is_correct       BOOL          NOT NULL,
  submitted_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csba_student      ON contoh_soal_bertahap_attempts (student_id);
CREATE INDEX IF NOT EXISTS idx_csba_concept      ON contoh_soal_bertahap_attempts (concept_id);
CREATE INDEX IF NOT EXISTS idx_csba_question_key ON contoh_soal_bertahap_attempts (student_id, question_key);

COMMENT ON TABLE contoh_soal_bertahap_attempts IS
  'Every Cek Jawaban click in Contoh Soal Bertahap. '
  'attempt_number is scoped per (student_id, question_key).';
