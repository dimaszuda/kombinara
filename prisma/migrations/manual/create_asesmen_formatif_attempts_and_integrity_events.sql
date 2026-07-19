-- Migration: create_asesmen_formatif_attempts_and_integrity_events
-- Creates the attempt lifecycle table and the append-only integrity event log.

-- ── 1. Create asesmen_formatif_attempts ───────────────────────────────────────

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

CREATE INDEX idx_attempts_student ON asesmen_formatif_attempts (student_id);
CREATE INDEX idx_attempts_module ON asesmen_formatif_attempts (module_id);

-- ── 2. Drop old activity_logs if exists (clean slate) ─────────────────────────
-- Note: activity_logs was never populated in production; dropping is safe.
DROP TABLE IF EXISTS activity_logs CASCADE;

-- ── 3. Create integrity_events ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS integrity_events (
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

CREATE INDEX idx_integrity_events_attempt ON integrity_events (attempt_id, created_at);
CREATE INDEX idx_integrity_events_student ON integrity_events (student_id);
CREATE INDEX idx_integrity_events_type ON integrity_events (attempt_id, event_type);
