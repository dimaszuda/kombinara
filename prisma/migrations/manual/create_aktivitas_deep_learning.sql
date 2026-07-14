-- Migration: create_aktivitas_deep_learning
-- Stores student answers and AI feedback for the Deep Learning activity sections.

CREATE TABLE IF NOT EXISTS aktivitas_deep_learning (
  deep_learning_id  SERIAL        PRIMARY KEY,
  student_id        INT           NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  concept_id        VARCHAR       NOT NULL,
  answer            JSONB         NOT NULL,
  feedback          TEXT,
  is_correct        BOOLEAN,
  created_at        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adl_student ON aktivitas_deep_learning (student_id);
CREATE INDEX IF NOT EXISTS idx_adl_concept ON aktivitas_deep_learning (concept_id);

COMMENT ON TABLE aktivitas_deep_learning IS
  'Student answers and AI feedback for Deep Learning activity sections.';
COMMENT ON COLUMN aktivitas_deep_learning.is_correct IS
  'Whether the student answer is correct according to LLM classification. NULL if not yet classified.';
