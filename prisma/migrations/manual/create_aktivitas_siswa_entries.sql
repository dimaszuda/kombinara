-- Migration: create_aktivitas_siswa_entries
-- Sequential unlocking entries for student activities.
-- Every answer attempt (correct or incorrect) is stored for tracking.

CREATE TABLE IF NOT EXISTS aktivitas_siswa_entries (
  entry_id      SERIAL    PRIMARY KEY,
  student_id    INT       NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  concept_id    VARCHAR   NOT NULL CHECK (
    concept_id IN ('kaidah_penjumlahan', 'kaidah_perkalian', 'faktorial', 'permutasi', 'kombinasi')
  ),
  activity_key  VARCHAR   NOT NULL,
  entry_type    VARCHAR   NOT NULL CHECK (entry_type IN ('soal', 'refleksi')),
  question_key  VARCHAR   NOT NULL,
  answer        TEXT      NOT NULL,
  is_correct    BOOLEAN   NOT NULL,
  feedback      TEXT,
  submitted_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Unique: one submission per (student, concept, activity, question) at a given time
-- This allows retries — each retry creates a new row with a different timestamp
CREATE UNIQUE INDEX IF NOT EXISTS idx_ase_unique_attempt
  ON aktivitas_siswa_entries (student_id, concept_id, activity_key, question_key, submitted_at);

CREATE INDEX IF NOT EXISTS idx_ase_student ON aktivitas_siswa_entries (student_id);
CREATE INDEX IF NOT EXISTS idx_ase_student_concept ON aktivitas_siswa_entries (student_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_ase_student_concept_activity ON aktivitas_siswa_entries (student_id, concept_id, activity_key);

COMMENT ON TABLE aktivitas_siswa_entries IS
  'Stores every student answer attempt for sequential-unlocked activity questions & reflections. '
  'Each row is one attempt — retries create new rows. LLM-evaluated (is_correct + feedback).';
