/**
 * Guru Dashboard — Data Access Layer
 *
 * Query Prisma untuk ringkasan dashboard guru:
 * - Total Kelas, Total Siswa
 * - Distribusi Kelas (donut chart)
 * - Daftar Siswa (table)
 */

import { prisma } from "@/lib/prisma/client";
import { formatTanggal } from "@/lib/date";
import { ALL_SECTIONS } from "@/lib/data/student-section-status";
import { Prisma } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface DistribusiKelasItem {
  classId: number;
  namaKelas: string; // "X-1 A" format
  totalSiswa: number;
}

export interface DaftarSiswaItem {
  name: string;
  kelas: string;
  tanggalJoin: string; // "DD Month YYYY" format
}

export interface KelasOption {
  classId: number;
  namaKelas: string;
}

export interface GenderBreakdown {
  gender: string;
  total: number;
}

export interface StudentProgressItem {
  studentId: number;
  name: string;
  kelas: string;
  completed: number;
  total: number;
  pct: number;
}

export interface GuruDashboardData {
  totalKelas: number;
  totalSiswa: number;
  genderBreakdown: GenderBreakdown[];
  kelasOptions: KelasOption[];
  distribusiKelas: DistribusiKelasItem[];
  daftarSiswa: DaftarSiswaItem[];
  studentProgress: StudentProgressItem[];
}

// ═══════════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════════

/**
 * Kelas yang ditampilkan di dashboard guru.
 * Kelas lain disembunyikan dari filter & tile dashboard, TAPI TIDAK dihapus dari DB.
 */
const VISIBLE_CLASSES: Array<{ className: string; group: string }> = [
  { className: "XII", group: "G" },
  { className: "XII", group: "J" },
  { className: "XII", group: "L" },
];

/** Ambil id kelas yang visible untuk dipakai sebagai filter query. */
async function getVisibleClassIds(): Promise<number[]> {
  const classes = await prisma.class.findMany({
    where: { OR: VISIBLE_CLASSES },
    select: { id: true },
  });
  return classes.map((c) => c.id);
}

/** Total Kelas — hanya kelas visible (XII G/J/L) yang memiliki siswa, difilter oleh kelas */
export async function getTotalKelas(classIds?: number[]): Promise<number> {
  const visibleIds = await getVisibleClassIds();
  const targetIds = classIds && classIds.length > 0
    ? classIds.filter((id) => visibleIds.includes(id))
    : visibleIds;

  if (targetIds.length === 0) return 0;

  const result = await prisma.student.groupBy({
    by: ["classId"],
    where: {
      user: { role: "siswa" },
      classId: { in: targetIds },
    },
  });

  return result.length;
}

/** Total Siswa — difilter oleh kelas */
export async function getTotalSiswa(classIds?: number[]): Promise<number> {
  const hasFilter = classIds && classIds.length > 0;
  return prisma.student.count({
    where: {
      user: { role: "siswa" },
      ...(hasFilter ? { classId: { in: classIds } } : {}),
    },
  });
}

/** Breakdown gender siswa (laki-laki / perempuan) — difilter oleh kelas */
export async function getSiswaGenderBreakdown(classIds?: number[]): Promise<GenderBreakdown[]> {
  const hasFilter = classIds && classIds.length > 0;
  const result = await prisma.student.groupBy({
    by: ["gender"],
    where: {
      user: { role: "siswa" },
      ...(hasFilter ? { classId: { in: classIds } } : {}),
    },
    _count: { _all: true },
  });

  return result.map((r) => ({
    gender: r.gender,
    total: r._count?._all ?? 0,
  }));
}

/** Daftar kelas untuk opsi filter — hanya kelas visible (XII G/J/L) */
export async function getKelasOptions(): Promise<KelasOption[]> {
  const classes = await prisma.class.findMany({
    where: { OR: VISIBLE_CLASSES },
    select: { id: true, className: true, group: true },
    orderBy: [{ className: "asc" }, { group: "asc" }],
  });
  return classes.map((c) => ({
    classId: c.id,
    namaKelas: `${c.className} ${c.group}`,
  }));
}

/** Distribusi Siswa per Kelas — hanya kelas visible (XII G/J/L) */
export async function getDistribusiKelas(
  classIds?: number[]
): Promise<DistribusiKelasItem[]> {
  const visibleIds = await getVisibleClassIds();
  const targetIds = classIds && classIds.length > 0
    ? classIds.filter((id) => visibleIds.includes(id))
    : visibleIds;

  if (targetIds.length === 0) return [];

  const students = await prisma.student.groupBy({
    by: ["classId"],
    where: {
      user: { role: "siswa" },
      classId: { in: targetIds },
    },
    _count: { _all: true },
  });

  if (students.length === 0) return [];

  // Fetch class names in one query
  const allClassIds = students.map((s) => s.classId);
  const classes = await prisma.class.findMany({
    where: { id: { in: allClassIds } },
    select: { id: true, className: true, group: true },
  });

  const classMap = new Map(classes.map((c) => [c.id, c]));

  return students.map((s) => {
    const cls = classMap.get(s.classId);
    return {
      classId: s.classId,
      namaKelas: cls ? `${cls.className} ${cls.group}` : `Kelas ${s.classId}`,
      totalSiswa: s._count?._all ?? 0,
    };
  });
}

/** Daftar Siswa dengan Nama, Kelas, Tanggal Join */
export async function getDaftarSiswa(
  classIds?: number[]
): Promise<DaftarSiswaItem[]> {
  const whereClass = classIds && classIds.length > 0
    ? { classId: { in: classIds } }
    : {};

  const students = await prisma.student.findMany({
    where: {
      user: { role: "siswa" },
      ...whereClass,
    },
    select: {
      name: true,
      class: {
        select: { className: true, group: true },
      },
      user: {
        select: { createdAt: true },
      },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return students.map((s) => ({
    name: s.name,
    kelas: `${s.class.className} ${s.class.group}`,
    tanggalJoin: formatTanggal(s.user.createdAt),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Progress Belajar Siswa
// ═══════════════════════════════════════════════════════════════

/**
 * Total langkah (denominator persentase).
 *
 * Numerator & denominator harus di granularity yang sama: per SECTION,
 * bukan per konsep. Kalau numerator per konsep (max 8) tapi denominator 34,
 * semua siswa mentok di ~24%.
 */

/** Total langkah "semua materi": semua section yang di-track di DB + 1 langkah asesmen diagnostik. */
const TOTAL_ALL_STEPS = ALL_SECTIONS.length + 1; // 36 section + 1 diagnostik = 37

/** Section pendahuluan — disimpan di DB di bawah concept `kaidah_penjumlahan`. */
const PENDAHULUAN_SECTIONS = ["apersepsi", "pemantik", "refleksi_sebelum_mulai"] as const;

function getTotalSteps(materis: string[] | undefined): number {
  if (!materis || materis.length === 0) return TOTAL_ALL_STEPS;
  if (materis.includes("pendahuluan")) return PENDAHULUAN_SECTIONS.length + 1; // 3 section + 1 diagnostik = 4

  // Jumlah section per conceptId dari konstanta kanonik (student-section-status.ts)
  const sectionCounts: Record<string, number> = {};
  for (const s of ALL_SECTIONS) {
    sectionCounts[s.conceptId] = (sectionCounts[s.conceptId] ?? 0) + 1;
  }
  const total = materis.reduce((sum, m) => sum + (sectionCounts[m] ?? 0), 0);
  return total > 0 ? total : 6; // fallback aman jika slug tak dikenal
}

/**
 * Progress siswa: gabungan diagnostic_attempts (passed) + student_section_status (completed).
 * Filterable by classIds, materis (concept_id array), dan searchName.
 */
export async function getStudentProgress(
  classIds?: number[],
  materis?: string[],
  searchName?: string
): Promise<StudentProgressItem[]> {
  const totalSteps = getTotalSteps(materis);
  const isMateriAll = !materis || materis.length === 0;

  // Build filter fragments
  const classFilter = classIds && classIds.length > 0
    ? Prisma.sql`AND d.class_id IN (${Prisma.join(classIds)})`
    : Prisma.empty;
  const nameFilter = searchName
    ? Prisma.sql`AND LOWER(a.name) LIKE ${"%" + searchName.toLowerCase() + "%"}`
    : Prisma.empty;
  const materiDiagFilter = !isMateriAll && !materis.includes("pendahuluan")
    ? Prisma.sql`AND FALSE` // diagnostic hanya dihitung untuk pendahuluan atau all
    : Prisma.empty;
  const materiSectionFilter = !isMateriAll
    ? materis.includes("pendahuluan")
      ? Prisma.sql`AND b.concept_id = 'kaidah_penjumlahan' AND b.section IN (${Prisma.join(PENDAHULUAN_SECTIONS.map((s) => Prisma.sql`${s}`))})`
      : Prisma.sql`AND b.concept_id IN (${Prisma.join(materis.map((m) => Prisma.sql`${m}`))})`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<Array<{
    student_id: number;
    name: string;
    kelas: string;
    completed: bigint;
  }>>`
    WITH progress AS (
      SELECT DISTINCT
        a.student_id,
        a.name,
        'diagnostik' AS langkah,
        CONCAT(d.class_name, ' ', d."group") AS kelas
      FROM students a
      JOIN diagnostic_attempts b ON a.student_id = b.student_id
      JOIN users c ON a.user_id = c.user_id
      JOIN classes d ON a.class_id = d.class_id
      WHERE b.status = 'passed'
        AND c.role = 'siswa'
        ${classFilter}
        ${nameFilter}
        ${materiDiagFilter}

      UNION ALL

      SELECT DISTINCT
        a.student_id,
        a.name,
        b.concept_id || ':' || b.section AS langkah,
        CONCAT(d.class_name, ' ', d."group") AS kelas
      FROM students a
      JOIN student_section_status b ON a.student_id = b.student_id
      JOIN users c ON a.user_id = c.user_id
      JOIN classes d ON a.class_id = d.class_id
      WHERE b.status = 'completed'
        AND c.role = 'siswa'
        ${classFilter}
        ${nameFilter}
        ${materiSectionFilter}
    )
    SELECT
      student_id,
      name,
      kelas,
      COUNT(*)::int AS completed
    FROM progress
    GROUP BY student_id, name, kelas
    ORDER BY completed DESC
  `;

  return rows.map((r) => ({
    studentId: r.student_id,
    name: r.name,
    kelas: r.kelas,
    completed: Math.min(totalSteps, Number(r.completed)),
    total: totalSteps,
    pct: Math.min(100, Math.round((Number(r.completed) / totalSteps) * 100)),
  }));
}

/** Gabung semua data dashboard dalam satu parallel fetch */
export async function getGuruDashboardData(
  classIds?: number[],
  materis?: string[],
  searchName?: string
): Promise<GuruDashboardData> {
  const [totalKelas, totalSiswa, genderBreakdown, kelasOptions, distribusiKelas, daftarSiswa, studentProgress] =
    await Promise.all([
      getTotalKelas(classIds),
      getTotalSiswa(classIds),
      getSiswaGenderBreakdown(classIds),
      getKelasOptions(),
      getDistribusiKelas(classIds),
      getDaftarSiswa(classIds),
      getStudentProgress(classIds, materis, searchName),
    ]);

  return { totalKelas, totalSiswa, genderBreakdown, kelasOptions, distribusiKelas, daftarSiswa, studentProgress };
}
