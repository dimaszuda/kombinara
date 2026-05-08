-- Leaderboard Materialized View
-- Jalankan manual setelah prisma migrate dev selesai
-- File ini tidak dijalankan otomatis oleh Prisma

-- Buat materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_mv AS
SELECT
  ka.kelas_id,
  u.id                                                        AS siswa_id,
  u.nama,
  COALESCE(a.total_score, 0)                                  AS activity_score,
  COALESCE(a.reading_engagement, 0)                           AS reading_engagement,
  COALESCE(a.question_frequency, 0)                           AS question_frequency,
  COALESCE(a.question_depth, 0)                               AS question_depth,
  COALESCE(a.quiz_score, 0)                                   AS quiz_score,
  -- completion_rate: jumlah materi yang punya reading_progress / total materi published
  ROUND(
    COUNT(DISTINCT rp.materi_id)::numeric /
    NULLIF((SELECT COUNT(*) FROM materi WHERE published_at IS NOT NULL), 0),
    4
  )                                                           AS completion_rate
FROM kelas_anggota ka
JOIN users u ON u.id = ka.siswa_id
LEFT JOIN activity_scores a
  ON a.siswa_id = u.id AND a.kelas_id = ka.kelas_id
LEFT JOIN reading_progress rp
  ON rp.siswa_id = u.id
GROUP BY
  ka.kelas_id,
  u.id,
  u.nama,
  a.total_score,
  a.reading_engagement,
  a.question_frequency,
  a.question_depth,
  a.quiz_score;

-- Index untuk query cepat per kelas
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_mv_unique_idx
  ON leaderboard_mv (kelas_id, siswa_id);

CREATE INDEX IF NOT EXISTS leaderboard_mv_kelas_score_idx
  ON leaderboard_mv (kelas_id, activity_score DESC);

CREATE INDEX IF NOT EXISTS leaderboard_mv_kelas_completion_idx
  ON leaderboard_mv (kelas_id, completion_rate DESC);

-- Refresh view (jalankan periodik via cron atau setelah activity update)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_mv;
