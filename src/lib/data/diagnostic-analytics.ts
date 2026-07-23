/**
 * Diagnostic Analytics — Data Access Layer
 *
 * Query untuk chart asesmen diagnostik di dashboard guru:
 * - Distribusi Nilai (Bar Chart)
 * - Durasi Pengerjaan (Scatter Plot)
 * - Distribusi Percobaan (Horizontal Bar Chart)
 *
 * Sumber data: public.diagnostic_attempts (Supabase / raw PostgreSQL)
 * Diakses via prisma.$queryRaw karena tabel belum dimodelkan di schema.prisma.
 */

import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ScoreDistributionItem {
  totalScore: number;
  jumlahSiswa: number;
}

export interface DurationScatterItem {
  /** Nama siswa */
  nama: string;
  /** Nama kelas (format: "X-1 A") */
  kelas: string;
  /** Nilai (total_score) */
  nilai: number;
  /** Durasi pengerjaan dalam menit */
  durasiMenit: number;
  /** Lulus atau tidak */
  passed: boolean;
}

export interface AttemptDistributionItem {
  attemptNumber: number;
  total: number;
}

// ═══════════════════════════════════════════════════════════════
// Filter helpers
// ═══════════════════════════════════════════════════════════════

interface DiagnosticFilter {
  /** Filter by class IDs (via student.class_id) */
  classIds?: number[];
  /** Filter by student IDs */
  studentIds?: number[];
  /** Filter by attempt_number. If "latest", take the max attempt_number per student. */
  attempt?: number | "latest";
  /** Exclude specific student IDs (e.g. test accounts) */
  excludeStudentIds?: number[];
}

function buildFilterClauses(filter: DiagnosticFilter): {
  classJoin: Prisma.Sql;
  classWhere: Prisma.Sql;
  studentWhere: Prisma.Sql;
  attemptWhere: Prisma.Sql;
  studentExclude: Prisma.Sql;
} {
  const classJoin = filter.classIds && filter.classIds.length > 0
    ? Prisma.sql``  // no extra join needed — we already join via students
    : Prisma.empty;

  const classWhere = filter.classIds && filter.classIds.length > 0
    ? Prisma.sql`AND s.class_id IN (${Prisma.join(filter.classIds)})`
    : Prisma.empty;

  const studentWhere = filter.studentIds && filter.studentIds.length > 0
    ? Prisma.sql`AND da.student_id IN (${Prisma.join(filter.studentIds)})`
    : Prisma.empty;

  const studentExclude = filter.excludeStudentIds && filter.excludeStudentIds.length > 0
    ? Prisma.sql`AND da.student_id NOT IN (${Prisma.join(filter.excludeStudentIds)})`
    : Prisma.empty;

  let attemptWhere: Prisma.Sql;
  if (filter.attempt === "latest") {
    attemptWhere = Prisma.sql`
      AND da.attempt_number = (
        SELECT MAX(da2.attempt_number)
        FROM public.diagnostic_attempts da2
        WHERE da2.student_id = da.student_id
      )
    `;
  } else if (typeof filter.attempt === "number") {
    attemptWhere = Prisma.sql`AND da.attempt_number = ${filter.attempt}`;
  } else {
    attemptWhere = Prisma.empty;
  }

  return { classJoin, classWhere, studentWhere, attemptWhere, studentExclude };
}

// ═══════════════════════════════════════════════════════════════
// Query 7: Distribusi Nilai
// ═══════════════════════════════════════════════════════════════

/**
 * Distribusi Nilai Asesmen Diagnostik
 *
 * SQL asli:
 *   SELECT total_score, COUNT(total_score) AS jumlah_siswa
 *   FROM public.diagnostic_attempts
 *   WHERE total_score IS NOT NULL
 *   GROUP BY total_score
 *   ORDER BY 1 DESC
 */
export async function getDiagnosticScoreDistribution(
  filter: DiagnosticFilter = {}
): Promise<ScoreDistributionItem[]> {
  const { classWhere, studentWhere, studentExclude } =
    buildFilterClauses(filter);

  const rows = await prisma.$queryRaw<Array<{ total_score: number; jumlah_siswa: bigint }>>`
    SELECT
      da.total_score,
      COUNT(da.total_score) AS jumlah_siswa
    FROM public.diagnostic_attempts da
    JOIN public.students s ON da.student_id = s.student_id
    WHERE da.total_score IS NOT NULL
      ${classWhere}
      ${studentWhere}
      ${studentExclude}
    GROUP BY da.total_score
    ORDER BY da.total_score DESC
  `;

  return rows.map((r) => ({
    totalScore: r.total_score,
    jumlahSiswa: Number(r.jumlah_siswa),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 8: Durasi Pengerjaan
// ═══════════════════════════════════════════════════════════════

/**
 * Durasi Pengerjaan vs Nilai (Scatter Plot)
 *
 * NOTE: started_at, submitted_at, dan last_saved_at kini SEMUA pakai GMT+7 (WIB)
 *       via toGMT7ISO(). Sebelumnya started_at dari DB DEFAULT NOW() adalah UTC,
 *       sehingga perlu hack "- INTERVAL '7 hours'" — sekarang sudah tidak perlu.
 *
 * SQL:
 *   WITH perhitungan AS (
 *     SELECT total_score, passed, started_at, submitted_at,
 *       ROUND(EXTRACT(EPOCH FROM (submitted_at - started_at)) / 60.0, 2) AS durasi_menit
 *     FROM public.diagnostic_attempts
 *     WHERE submitted_at IS NOT NULL AND total_score IS NOT NULL
 *       AND student_id NOT IN (10, 27, 29, 76)
 *     ORDER BY durasi_menit DESC
 *   )
 *   SELECT total_score, passed, durasi_menit
 *   FROM perhitungan
 *   WHERE durasi_menit >= 0 AND durasi_menit < 180
 *   ORDER BY durasi_menit DESC
 */
export async function getDiagnosticDurationScatter(
  filter: DiagnosticFilter = {}
): Promise<DurationScatterItem[]> {
  const { classWhere, studentWhere, studentExclude } =
    buildFilterClauses({
      ...filter,
      // Default: exclude test accounts if not explicitly overridden
      excludeStudentIds: filter.excludeStudentIds ?? [10, 27, 29, 76],
    });

  const rows = await prisma.$queryRaw<Array<{
    total_score: number;
    passed: boolean;
    durasi_menit: number;
    nama: string;
    kelas: string;
  }>>`
    WITH perhitungan AS (
      SELECT
        da.total_score,
        da.passed,
        da.started_at,
        da.submitted_at,
        s.name AS nama,
        CONCAT(c.class_name, ' ', c."group") AS kelas,
        ROUND(
          EXTRACT(
            EPOCH FROM (da.submitted_at - da.started_at)
          ) / 60.0,
          2
        ) AS durasi_menit
      FROM public.diagnostic_attempts da
      JOIN public.students s ON da.student_id = s.student_id
      JOIN public.classes c ON s.class_id = c.class_id
      WHERE da.submitted_at IS NOT NULL
        AND da.total_score IS NOT NULL
        ${classWhere}
        ${studentWhere}
        ${studentExclude}
    )
    SELECT
      total_score,
      passed,
      durasi_menit,
      nama,
      kelas
    FROM perhitungan
    WHERE durasi_menit >= 0 AND durasi_menit < 180
    ORDER BY durasi_menit DESC
  `;

  return rows.map((r) => ({
    nilai: r.total_score,
    passed: r.passed,
    durasiMenit: Number(r.durasi_menit),
    nama: r.nama,
    kelas: r.kelas,
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 9: Distribusi Percobaan
// ═══════════════════════════════════════════════════════════════

/**
 * Distribusi Percobaan — berapa banyak siswa yang lulus di attempt ke-n
 *
 * SQL asli:
 *   SELECT attempt_number, COUNT(attempt_number)
 *   FROM public.diagnostic_attempts
 *   WHERE status = 'passed'
 *   GROUP BY attempt_number
 */
export async function getDiagnosticAttemptDistribution(
  filter: DiagnosticFilter = {}
): Promise<AttemptDistributionItem[]> {
  const { classWhere, studentWhere, studentExclude } =
    buildFilterClauses(filter);

  const rows = await prisma.$queryRaw<Array<{ attempt_number: number; count: bigint }>>`
    SELECT
      da.attempt_number,
      COUNT(da.attempt_number) AS count
    FROM public.diagnostic_attempts da
    JOIN public.students s ON da.student_id = s.student_id
    WHERE da.status = 'passed'
      ${classWhere}
      ${studentWhere}
      ${studentExclude}
    GROUP BY da.attempt_number
    ORDER BY da.attempt_number
  `;

  return rows.map((r) => ({
    attemptNumber: r.attempt_number,
    total: Number(r.count),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Query 10: Detail Hasil Diagnostik per Siswa
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticDetailItem {
  studentId: number;
  nama: string;
  kelas: string;
  nilai: number;
  attemptNumber: number;
  durasiMenit: number;
  status: string; // "Lulus" | "Belum Lulus"
  submittedAt: string; // ISO timestamp
}

/**
 * Detail Hasil Diagnostik per Siswa — tabel dengan filter kelas & percobaan.
 *
 * Connected Filter: Kelas, Percobaan Asesmen Diagnostik
 */
export async function getDiagnosticDetailPerSiswa(
  filter: DiagnosticFilter = {}
): Promise<DiagnosticDetailItem[]> {
  const { classWhere } = buildFilterClauses(filter);

  // Attempt filter: hanya berlaku untuk nomor spesifik (1, 2, 3, ...)
  // "latest" / undefined → tidak difilter, GROUP BY + MAX yang handle
  const attemptNumberWhere =
    typeof filter.attempt === "number"
      ? Prisma.sql`AND c.attempt_number = ${filter.attempt}`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{
    student_id: number;
    name: string;
    kelas: string;
    total_score: number;
    attempt_number: number;
    durasi_menit: number;
    status: string;
    submitted_at: string;
  }>>`
    WITH detail AS (
      SELECT
        s.student_id,
        s.name,
        CONCAT(b.class_name, ' ', b."group") AS kelas,
        c.total_score,
        c.attempt_number,
        c.submitted_at,
        ROUND(
          EXTRACT(
            EPOCH FROM (c.submitted_at - c.started_at)
          ) / 60.0,
          2
        ) AS durasi_menit,
        CASE
          WHEN c.passed = TRUE THEN 'Lulus'
          ELSE 'Belum Lulus'
        END AS status
      FROM public.students s
      LEFT JOIN public.classes b ON s.class_id = b.class_id
      LEFT JOIN public.diagnostic_attempts c ON s.student_id = c.student_id
      LEFT JOIN public.users d ON s.user_id = d.user_id
      WHERE d.role = 'siswa'
        AND c.submitted_at IS NOT NULL
        AND c.total_score IS NOT NULL
        ${classWhere}
        ${attemptNumberWhere}
      ORDER BY c.attempt_number DESC
    )
    SELECT
      student_id,
      name,
      kelas,
      total_score,
      MAX(attempt_number)::int AS attempt_number,
      durasi_menit,
      status,
      submitted_at
    FROM detail
    WHERE durasi_menit > 0 AND durasi_menit < 180
    GROUP BY student_id, name, kelas, total_score, durasi_menit, status, submitted_at
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    nama: r.name,
    kelas: r.kelas,
    nilai: r.total_score,
    attemptNumber: r.attempt_number,
    durasiMenit: Number(r.durasi_menit),
    status: r.status,
    submittedAt: r.submitted_at,
  }));
}

// ═══════════════════════════════════════════════════════════════
// Modal: Draft Answers (on-demand fetch saat klik "Lihat Jawaban")
// ═══════════════════════════════════════════════════════════════

export interface DraftAnswerItem {
  soal: string;    // label soal, e.g. "Soal 1"
  jawaban: string; // jawaban siswa diformat
}

/**
 * Ambil draft_answers untuk student_id + attempt_number tertentu.
 * Mengembalikan answers yang sudah diformat per nomor soal.
 */
export async function getDiagnosticDraftAnswers(
  studentId: number,
  attemptNumber: number
): Promise<DraftAnswerItem[]> {
  const rows = await prisma.$queryRaw<Array<{ draft_answers: Record<string, string> | null }>>`
    SELECT da.draft_answers
    FROM public.diagnostic_attempts da
    JOIN public.students s ON da.student_id = s.student_id
    JOIN public.users u ON s.user_id = u.user_id
    WHERE da.student_id = ${studentId}
      AND da.attempt_number = ${attemptNumber}
      AND u.role = 'siswa'
    LIMIT 1
  `;

  const draft = rows[0]?.draft_answers;
  if (!draft || Object.keys(draft).length === 0) return [];

  // Group by soal number ("1-0" → soal 1, sub 0)
  const soalMap = new Map<number, string[]>();
  for (const [key, value] of Object.entries(draft)) {
    const soalNumber = parseInt(key.split("-")[0], 10);
    // Defensive: skip keys that don't parse to a valid number (e.g. "q1-0")
    if (isNaN(soalNumber)) continue;
    if (!soalMap.has(soalNumber)) soalMap.set(soalNumber, []);
    soalMap.get(soalNumber)!.push(value);
  }

  // Format per soal: gabungkan sub-jawaban jadi satu string
  const result: DraftAnswerItem[] = [];
  for (const [soalNum, answers] of [...soalMap.entries()].sort((a, b) => a[0] - b[0])) {
    const jawabanStr = answers.length === 1
      ? answers[0]
      : answers.map((a, i) => `${String.fromCharCode(97 + i)}. ${a}`).join(", ");
    result.push({
      soal: `Soal ${soalNum}`,
      jawaban: jawabanStr,
    });
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// Gabungan fetch
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticAnalyticsData {
  scoreDistribution: ScoreDistributionItem[];
  durationScatter: DurationScatterItem[];
  attemptDistribution: AttemptDistributionItem[];
  detailPerSiswa: DiagnosticDetailItem[];
}

export async function getDiagnosticAnalyticsData(
  filter: DiagnosticFilter = {}
): Promise<DiagnosticAnalyticsData> {
  const [scoreDistribution, durationScatter, attemptDistribution, detailPerSiswa] =
    await Promise.all([
      getDiagnosticScoreDistribution(filter),
      getDiagnosticDurationScatter(filter),
      getDiagnosticAttemptDistribution(filter),
      getDiagnosticDetailPerSiswa(filter),
    ]);

  return { scoreDistribution, durationScatter, attemptDistribution, detailPerSiswa };
}
