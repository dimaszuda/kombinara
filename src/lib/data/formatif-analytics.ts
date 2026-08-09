/**
 * Formatif Analytics — Data Access Layer
 *
 * Query untuk chart asesmen formatif di dashboard guru:
 * - Distribusi Nilai (Bar Chart) dengan range 0-10, 10-20, ..., 90-100
 * - Durasi Pengerjaan vs Nilai (Scatter Plot)
 *
 * Sumber data: public.asesmen_formatif_submissions + public.asesmen_formatif_attempts
 * Diakses via prisma.$queryRaw.
 */

import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

/** Satu bar distribusi nilai (range score → jumlah siswa) */
export interface FormatifScoreDistributionItem {
  /** Label range, e.g. "0-10", "10-20", ..., "90-100" */
  scoreRange: string;
  /** Jumlah submission dalam range tersebut */
  jumlah: number;
}

/** Statistik deskriptif nilai formatif */
export interface FormatifStats {
  mean: number;
  median: number;
  std: number;
  n: number;
}

/** Satu titik di scatter plot durasi vs nilai */
export interface FormatifDurationScatterItem {
  /** Nama siswa */
  nama: string;
  /** Nama kelas (format: "X-1 A") */
  kelas: string;
  /** Nilai (total_score) */
  nilai: number;
  /** Durasi pengerjaan dalam menit */
  durasiMenit: number;
}

/** Data distribusi percobaan (simple bar chart) */
export interface FormatifAttemptDistributionItem {
  /** Label percobaan, e.g. "1x", "2x", "3x" */
  attempt: string;
  /** Jumlah (student, module) pair dengan jumlah attempt tsb */
  total: number;
}

/** Satu baris di tabel detail hasil formatif per siswa */
export interface FormatifDetailItem {
  /** student_id (untuk keperluan fetch jawaban di modal) */
  studentId: number;
  /** Nama siswa */
  nama: string;
  /** Nama kelas (format: "X-1 A") */
  kelas: string;
  /** concept_id (slug materi) */
  conceptId: string;
  /** Nilai (total_score) */
  nilai: number;
  /** Jumlah percobaan untuk (student, concept) pair ini */
  totalAttempts: number;
  /** Durasi pengerjaan dalam menit */
  durasiMenit: number;
  /** Status: "Selesai" jika total_score = 100, "Belum Selesai" jika belum */
  status: string;
}

export interface FormatifAnalyticsData {
  scoreDistribution: FormatifScoreDistributionItem[];
  stats: FormatifStats;
  durationScatter: FormatifDurationScatterItem[];
  attemptDistribution: FormatifAttemptDistributionItem[];
  /** Detail hasil formatif per siswa (untuk tabel di bawah chart formatif) */
  detailPerSiswa: FormatifDetailItem[];
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

/** Range nilai yang digunakan di bar chart (harus persis sama dengan query SQL) */
export const SCORE_RANGES = [
  "0-10",
  "10-20",
  "20-30",
  "30-40",
  "40-50",
  "50-60",
  "60-70",
  "70-80",
  "80-90",
  "90-100",
] as const;

/** Titik tengah (midpoint) setiap range untuk kalkulasi statistik */
const RANGE_MIDPOINTS: Record<string, number> = {
  "0-10": 5,
  "10-20": 15,
  "20-30": 25,
  "30-40": 35,
  "40-50": 45,
  "50-60": 55,
  "60-70": 65,
  "70-80": 75,
  "80-90": 85,
  "90-100": 95,
};

// ═══════════════════════════════════════════════════════════════
// Filter helpers
// ═══════════════════════════════════════════════════════════════

interface FormatifFilter {
  /** Filter by class IDs (via student.class_id) */
  classIds?: number[];
  /** Filter by concept_ids (materi). Array = multi-concept pakai SQL IN. */
  conceptIds?: string[];
  /** Filter by attempt number. "latest" = ambil submission terbaru per (student, concept). Number = ambil percobaan ke-n. */
  attempt?: number | "latest";
  /** Exclude specific student IDs (e.g. test accounts) */
  excludeStudentIds?: number[];
}

function buildFormatifFilterClauses(filter: FormatifFilter): {
  classWhere: Prisma.Sql;
  conceptWhere: Prisma.Sql;
  studentExclude: Prisma.Sql;
} {
  const classWhere =
    filter.classIds && filter.classIds.length > 0
      ? Prisma.sql`AND s.class_id IN (${Prisma.join(filter.classIds)})`
      : Prisma.empty;

  const conceptWhere =
    filter.conceptIds && filter.conceptIds.length > 0
      ? Prisma.sql`AND afs.concept_id IN (${Prisma.join(filter.conceptIds.map((m) => Prisma.sql`${m}`))})`
      : Prisma.empty;

  const studentExclude =
    filter.excludeStudentIds && filter.excludeStudentIds.length > 0
      ? Prisma.sql`AND afs.student_id NOT IN (${Prisma.join(filter.excludeStudentIds)})`
      : Prisma.empty;

  return { classWhere, conceptWhere, studentExclude };
}

// ═══════════════════════════════════════════════════════════════
// Query 1: Distribusi Nilai Formatif (per range)
// ═══════════════════════════════════════════════════════════════

/**
 * Distribusi Nilai Asesmen Formatif
 *
 * Mengelompokkan total_score ke dalam range 0-10, 10-20, ..., 90-100.
 * Mengembalikan jumlah submission per range (diagregasi dari semua concept_id
 * kecuali jika filter conceptId diberikan).
 *
 * SQL:
 *   SELECT
 *     CASE
 *       WHEN total_score >= 0 AND total_score < 10 THEN '0-10'
 *       WHEN total_score >= 10 AND total_score < 20 THEN '10-20'
 *       ...
 *     END AS score_range,
 *     COUNT(*) AS jumlah
 *   FROM public.asesmen_formatif_submissions afs
 *   JOIN public.students s ON afs.student_id = s.student_id
 *   WHERE afs.total_score IS NOT NULL
 *   GROUP BY score_range
 *   ORDER BY score_range
 */
export async function getFormatifScoreDistribution(
  filter: FormatifFilter = {}
): Promise<FormatifScoreDistributionItem[]> {
  const { classWhere, conceptWhere, studentExclude } =
    buildFormatifFilterClauses(filter);

  const rows = await prisma.$queryRaw<
    Array<{ score_range: string; jumlah: bigint }>
  >`
    SELECT
      CASE
        WHEN afs.total_score >= 0 AND afs.total_score < 10 THEN '0-10'
        WHEN afs.total_score >= 10 AND afs.total_score < 20 THEN '10-20'
        WHEN afs.total_score >= 20 AND afs.total_score < 30 THEN '20-30'
        WHEN afs.total_score >= 30 AND afs.total_score < 40 THEN '30-40'
        WHEN afs.total_score >= 40 AND afs.total_score < 50 THEN '40-50'
        WHEN afs.total_score >= 50 AND afs.total_score < 60 THEN '50-60'
        WHEN afs.total_score >= 60 AND afs.total_score < 70 THEN '60-70'
        WHEN afs.total_score >= 70 AND afs.total_score < 80 THEN '70-80'
        WHEN afs.total_score >= 80 AND afs.total_score < 90 THEN '80-90'
        WHEN afs.total_score >= 90 AND afs.total_score <= 100 THEN '90-100'
      END AS score_range,
      COUNT(*) AS jumlah
    FROM public.asesmen_formatif_submissions afs
    JOIN public.students s ON afs.student_id = s.student_id
    WHERE afs.total_score IS NOT NULL
      ${classWhere}
      ${conceptWhere}
      ${studentExclude}
    GROUP BY score_range
    ORDER BY score_range
  `;

  return rows.map((r) => ({
    scoreRange: r.score_range,
    jumlah: Number(r.jumlah),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 2: Statistik Nilai Formatif (mean, median, std)
// ═══════════════════════════════════════════════════════════════

/**
 * Menghitung mean, median, dan standard deviation langsung dari PostgreSQL.
 *
 * PostgreSQL menyediakan:
 * - AVG() untuk mean
 * - PERCENTILE_CONT(0.5) untuk median
 * - STDDEV_SAMP() atau STDDEV_POP() untuk standard deviation
 *
 * Kita gunakan STDDEV_SAMP (sample std dev) agar konsisten dengan
 * perhitungan statistik umum.
 */
export async function getFormatifStats(
  filter: FormatifFilter = {}
): Promise<FormatifStats> {
  const { classWhere, conceptWhere, studentExclude } =
    buildFormatifFilterClauses(filter);

  const rows = await prisma.$queryRaw<
    Array<{
      mean: number;
      median: number;
      std: number;
      n: bigint;
    }>
  >`
    SELECT
      ROUND(AVG(afs.total_score)::numeric, 2) AS mean,
      ROUND(
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY afs.total_score)::numeric,
        2
      ) AS median,
      ROUND(STDDEV_SAMP(afs.total_score)::numeric, 2) AS std,
      COUNT(*) AS n
    FROM public.asesmen_formatif_submissions afs
    JOIN public.students s ON afs.student_id = s.student_id
    WHERE afs.total_score IS NOT NULL
      ${classWhere}
      ${conceptWhere}
      ${studentExclude}
  `;

  if (rows.length === 0) {
    return { mean: 0, median: 0, std: 0, n: 0 };
  }

  return {
    mean: Number(rows[0].mean) || 0,
    median: Number(rows[0].median) || 0,
    std: Number(rows[0].std) || 0,
    n: Number(rows[0].n),
  };
}

// ═══════════════════════════════════════════════════════════════
// Query 3: Durasi Pengerjaan vs Nilai (Scatter Plot)
// ═══════════════════════════════════════════════════════════════

/**
 * Durasi Pengerjaan vs Nilai Asesmen Formatif
 *
 * Join asesmen_formatif_attempts → asesmen_formatif_submissions
 * untuk mendapatkan durasi pengerjaan (completed_at - started_at) dan total_score.
 * Hanya data dengan durasi 0–180 menit.
 *
 * Karena tidak ada kolom passed di formatif, semua titik pakai satu warna.
 *
 * SQL:
 *   WITH perhitungan AS (
 *     SELECT
 *       b.total_score,
 *       a.started_at,
 *       a.completed_at,
 *       ROUND(EXTRACT(EPOCH FROM (a.completed_at - a.started_at)) / 60.0, 2) AS durasi_menit
 *     FROM public.asesmen_formatif_attempts a
 *     LEFT JOIN public.asesmen_formatif_submissions b ON a.student_id = b.student_id
 *     WHERE a.completed_at IS NOT NULL AND b.total_score IS NOT NULL
 *   )
 *   SELECT total_score, durasi_menit
 *   FROM perhitungan
 *   WHERE durasi_menit >= 0 AND durasi_menit < 180
 *   ORDER BY durasi_menit DESC
 */
export async function getFormatifDurationScatter(
  filter: FormatifFilter = {}
): Promise<FormatifDurationScatterItem[]> {
  const classWhere =
    filter.classIds && filter.classIds.length > 0
      ? Prisma.sql`AND s.class_id IN (${Prisma.join(filter.classIds)})`
      : Prisma.empty;

  const conceptWhere =
    filter.conceptIds && filter.conceptIds.length > 0
      ? Prisma.sql`AND afs.concept_id IN (${Prisma.join(filter.conceptIds.map((m) => Prisma.sql`${m}`))})`
      : Prisma.empty;

  const studentExclude =
    filter.excludeStudentIds && filter.excludeStudentIds.length > 0
      ? Prisma.sql`AND afa.student_id NOT IN (${Prisma.join(filter.excludeStudentIds)})`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<
    Array<{
      total_score: number;
      durasi_menit: number;
      nama: string;
      kelas: string;
    }>
  >`
    WITH perhitungan AS (
      SELECT
        afs.total_score,
        afa.started_at,
        afa.completed_at,
        s.name AS nama,
        CONCAT(c.class_name, ' ', c."group") AS kelas,
        ROUND(
          EXTRACT(
            EPOCH FROM (afa.completed_at - afa.started_at)
          ) / 60.0,
          2
        ) AS durasi_menit
      FROM public.asesmen_formatif_attempts afa
      LEFT JOIN public.asesmen_formatif_submissions afs
        ON afa.student_id = afs.student_id
      JOIN public.students s ON afa.student_id = s.student_id
      JOIN public.classes c ON s.class_id = c.class_id
      WHERE afa.completed_at IS NOT NULL
        AND afs.total_score IS NOT NULL
        ${classWhere}
        ${conceptWhere}
        ${studentExclude}
      ORDER BY durasi_menit DESC
    )
    SELECT
      total_score,
      durasi_menit,
      nama,
      kelas
    FROM perhitungan
    WHERE durasi_menit >= 0 AND durasi_menit < 180
    ORDER BY durasi_menit DESC
  `;

  return rows.map((r) => ({
    nama: r.nama,
    kelas: r.kelas,
    nilai: r.total_score,
    durasiMenit: Number(r.durasi_menit),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 4: Distribusi Percobaan (Simple Bar Chart)
// ═══════════════════════════════════════════════════════════════

/**
 * Distribusi Percobaan Asesmen Formatif.
 *
 * Menghitung berapa banyak (student, module) pair yang memiliki
 * 1x, 2x, 3x, ... percobaan.
 *
 * SQL:
 *   WITH attempts AS (
 *     SELECT student_id, module_id, COUNT(*) AS total_attempts
 *     FROM public.asesmen_formatif_attempts
 *     GROUP BY student_id, module_id
 *   )
 *   SELECT total_attempts, COUNT(*) AS distribusi_attempt
 *   FROM attempts
 *   GROUP BY total_attempts
 *   ORDER BY total_attempts
 */
export async function getFormatifAttemptDistribution(
  filter: FormatifFilter = {}
): Promise<FormatifAttemptDistributionItem[]> {
  const classWhere =
    filter.classIds && filter.classIds.length > 0
      ? Prisma.sql`AND s.class_id IN (${Prisma.join(filter.classIds)})`
      : Prisma.empty;

  const studentExclude =
    filter.excludeStudentIds && filter.excludeStudentIds.length > 0
      ? Prisma.sql`AND afa.student_id NOT IN (${Prisma.join(filter.excludeStudentIds)})`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<
    Array<{
      total_attempts: bigint;
      distribusi_attempt: bigint;
    }>
  >`
    WITH attempts AS (
      SELECT
        afa.student_id,
        afa.module_id,
        COUNT(*) AS total_attempts
      FROM public.asesmen_formatif_attempts afa
      JOIN public.students s ON afa.student_id = s.student_id
      WHERE 1=1
        ${classWhere}
        ${studentExclude}
      GROUP BY afa.student_id, afa.module_id
    )
    SELECT
      total_attempts,
      COUNT(*) AS distribusi_attempt
    FROM attempts
    GROUP BY total_attempts
    ORDER BY total_attempts
  `;

  return rows.map((r) => ({
    attempt: `${r.total_attempts}x`,
    total: Number(r.distribusi_attempt),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 5: Detail Hasil Formatif per Siswa
// ═══════════════════════════════════════════════════════════════

/**
 * Detail Hasil Formatif per Siswa.
 *
 * Menggunakan CTE untuk mendapatkan submission terbaru (atau percobaan ke-n)
 * per (student_id, concept_id), lalu join ke attempts untuk durasi.
 *
 * Filter:
 *   - classIds: filter kelas
 *   - conceptId: filter materi (diterapkan di CTE)
 *   - attempt: "latest" → submission terbaru; number → percobaan ke-n (1-based, ASC)
 *
 * Status: "Selesai" jika total_score = 100, "Belum Selesai" jika belum.
 */
export async function getFormatifDetailPerSiswa(
  filter: FormatifFilter = {}
): Promise<FormatifDetailItem[]> {
  const classWhere =
    filter.classIds && filter.classIds.length > 0
      ? Prisma.sql`AND a.class_id IN (${Prisma.join(filter.classIds)})`
      : Prisma.empty;

  const conceptWhere =
    filter.conceptIds && filter.conceptIds.length > 0
      ? Prisma.sql`AND afs.concept_id IN (${Prisma.join(filter.conceptIds.map((m) => Prisma.sql`${m}`))})`
      : Prisma.empty;

  // Attempt filter logic:
  // - "latest" atau undefined → ORDER BY submission_id DESC, ambil rn = 1
  // - number (1, 2, 3, ...) → ORDER BY submission_id ASC, ambil rn = number
  const attemptNum = typeof filter.attempt === "number" ? filter.attempt : undefined;
  const isLatest = !attemptNum || filter.attempt === "latest";

  // Build the rn_filter dynamically
  const rnFilter = isLatest
    ? Prisma.sql`ls.rn = 1`
    : Prisma.sql`ls.rn = ${attemptNum}`;

  const rows = await prisma.$queryRaw<
    Array<{
      student_id: number;
      name: string;
      kelas: string;
      concept_id: string;
      total_score: number;
      total_attempts: bigint;
      durasi: number;
      status: string;
    }>
  >`
    WITH latest_submission AS (
      SELECT
        afs.student_id,
        afs.concept_id,
        afs.submission_id,
        afs.total_score,
        ROW_NUMBER() OVER (
          PARTITION BY afs.student_id, afs.concept_id
          ORDER BY afs.submission_id ${isLatest ? Prisma.sql`DESC` : Prisma.sql`ASC`}
        ) AS rn,
        COUNT(*) OVER (
          PARTITION BY afs.student_id, afs.concept_id
        ) AS total_attempts
      FROM public.asesmen_formatif_submissions AS afs
      WHERE afs.total_score IS NOT NULL
        ${conceptWhere}
    ),

    latest_attempt AS (
      SELECT
        ls.student_id,
        ls.concept_id,
        ls.total_score,
        ls.total_attempts,
        ROUND(
          EXTRACT(
            EPOCH FROM (b.completed_at - b.started_at)
          ) / 60.0,
          2
        ) AS durasi
      FROM latest_submission AS ls
      LEFT JOIN public.asesmen_formatif_attempts AS b
        ON ls.submission_id = b.submission_id
      WHERE ${rnFilter}
    )

    SELECT
      a.student_id,
      a.name,
      CONCAT(b.class_name, ' ', b."group") AS kelas,
      c.concept_id,
      c.total_score,
      c.total_attempts,
      c.durasi,
      CASE
        WHEN c.total_score = 100
          THEN 'Selesai'
        ELSE 'Belum Selesai'
      END AS status
    FROM public.students AS a
    LEFT JOIN public.classes AS b
      ON a.class_id = b.class_id
    LEFT JOIN latest_attempt AS c
      ON a.student_id = c.student_id
    LEFT JOIN public.users AS d
      ON a.user_id = d.user_id
    WHERE d.role = 'siswa'
      ${classWhere}
    ORDER BY a.name ASC
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    nama: r.name,
    kelas: r.kelas,
    conceptId: r.concept_id,
    nilai: r.total_score ?? 0,
    totalAttempts: Number(r.total_attempts),
    durasiMenit: Number(r.durasi),
    status: r.status,
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 6: Submission Answers (untuk modal "Lihat Jawaban")
// ═══════════════════════════════════════════════════════════════

/** Data jawaban satu submission formatif untuk ditampilkan di modal */
export interface FormatifSubmissionAnswers {
  studentId: number;
  conceptId: string;
  submissionId: number;
  totalScore: number | null;
  totalAttempts: number;
  /** Jawaban mentah siswa: [{ question_number, cara_mengerjakan, jawaban_akhir }] */
  answers: unknown;
  /** Hasil evaluasi per soal dari AI: [{ question_number, feedback, total_score, ... }] */
  perQuestionResults: unknown;
  /** Feedback AI keseluruhan */
  aiFeedback: string | null;
}

/**
 * Ambil jawaban submission formatif untuk modal "Lihat Jawaban".
 *
 * Menggunakan ROW_NUMBER() untuk identifikasi attempt ke-n.
 * - attemptNumber = "latest" → submission terbaru (ORDER BY submission_id DESC, rn=1)
 * - attemptNumber = 1, 2, 3, ... → percobaan ke-n (ORDER BY submission_id ASC, rn=n)
 *
 * @param studentId - student_id dari tabel students
 * @param conceptId - concept_id (slug materi)
 * @param attemptNumber - "latest" atau nomor percobaan (1-based)
 */
export async function getFormatifSubmissionAnswers(
  studentId: number,
  conceptId: string,
  attemptNumber: number | "latest" = "latest"
): Promise<FormatifSubmissionAnswers | null> {
  const isLatest = attemptNumber === "latest";
  const attemptNum = typeof attemptNumber === "number" ? attemptNumber : undefined;

  const rnFilter = isLatest
    ? Prisma.sql`rn = 1`
    : Prisma.sql`rn = ${attemptNum}`;

  const rows = await prisma.$queryRaw<
    Array<{
      student_id: number;
      concept_id: string;
      submission_id: number;
      total_score: number | null;
      total_attempts: bigint;
      answers: unknown;
      per_question_results: unknown;
      ai_feedback: string | null;
    }>
  >`
    WITH ranked AS (
      SELECT
        afs.student_id,
        afs.concept_id,
        afs.submission_id,
        afs.total_score,
        ROW_NUMBER() OVER (
          PARTITION BY afs.student_id, afs.concept_id
          ORDER BY afs.submission_id ${isLatest ? Prisma.sql`DESC` : Prisma.sql`ASC`}
        ) AS rn,
        COUNT(*) OVER (
          PARTITION BY afs.student_id, afs.concept_id
        ) AS total_attempts,
        afs.answers,
        afs.per_question_results,
        afs.ai_feedback
      FROM public.asesmen_formatif_submissions AS afs
      WHERE afs.student_id = ${studentId}
        AND afs.concept_id = ${conceptId}
    )
    SELECT
      student_id,
      concept_id,
      submission_id,
      total_score,
      total_attempts,
      answers,
      per_question_results,
      ai_feedback
    FROM ranked
    WHERE ${rnFilter}
  `;

  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    studentId: r.student_id,
    conceptId: r.concept_id,
    submissionId: r.submission_id,
    totalScore: r.total_score,
    totalAttempts: Number(r.total_attempts),
    answers: r.answers,
    perQuestionResults: r.per_question_results,
    aiFeedback: r.ai_feedback,
  };
}

// ═══════════════════════════════════════════════════════════════
// Combined fetch
// ═══════════════════════════════════════════════════════════════

export async function getFormatifAnalyticsData(
  filter: FormatifFilter = {}
): Promise<FormatifAnalyticsData> {
  const [scoreDistribution, stats, durationScatter, attemptDistribution, detailPerSiswa] = await Promise.all([
    getFormatifScoreDistribution(filter),
    getFormatifStats(filter),
    getFormatifDurationScatter(filter),
    getFormatifAttemptDistribution(filter),
    getFormatifDetailPerSiswa(filter),
  ]);

  return { scoreDistribution, stats, durationScatter, attemptDistribution, detailPerSiswa };
}
