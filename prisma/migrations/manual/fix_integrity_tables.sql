-- Idempotent fix-up: create or repair integrity_events and asesmen_formatif_attempts tables.
-- Run with: npx prisma db execute --file prisma/migrations/manual/fix_integrity_tables.sql

-- ── 1. Ensure asesmen_formatif_attempts exists ────────────────────────────────
CREATE TABLE IF NOT EXISTS asesmen_formatif_attempts (
  attempt_id    SERIAL PRIMARY KEY,
  student_id    INT4 NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  module_id     INT4 NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  device_type   VARCHAR NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  status        VARCHAR NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'abandoned')),
  started_at    TIMESTAMP NOT NULL DEFAULT now(),
  submission_id INT4 REFERENCES asesmen_formatif_submissions(submission_id) ON DELETE SET NULL,
  CONSTRAINT uq_attempt_student_module UNIQUE (student_id, module_id)
);

-- ── 2. Drop and recreate integrity_events (clean fix) ─────────────────────────
-- The previous multiSchema attempt may have created partial objects.
DROP TABLE IF EXISTS integrity_events CASCADE;

CREATE TABLE integrity_events (
  event_id    SERIAL PRIMARY KEY,
  student_id  INT4 NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  module_id   INT4 NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  attempt_id  INT4 NOT NULL REFERENCES asesmen_formatif_attempts(attempt_id) ON DELETE CASCADE,
  event_type  VARCHAR NOT NULL CHECK (
                event_type IN (
                  'fullscreen_enter',
                  'fullscreen_exit',
                  'visibility_hidden',
                  'visibility_visible',
                  'paste',
                  'resize'
                )
              ),
  device_type VARCHAR NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  metadata    JSONB,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrity_events_attempt ON integrity_events (attempt_id, created_at);
CREATE INDEX IF NOT EXISTS idx_integrity_events_student ON integrity_events (student_id);
CREATE INDEX IF NOT EXISTS idx_integrity_events_type ON integrity_events (attempt_id, event_type);
