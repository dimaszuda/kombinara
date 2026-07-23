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

/** Total Kelas — tidak terpengaruh filter */
export async function getTotalKelas(): Promise<number> {
  return prisma.class.count();
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

/** Daftar kelas untuk opsi filter */
export async function getKelasOptions(): Promise<KelasOption[]> {
  const classes = await prisma.class.findMany({
    select: { id: true, className: true, group: true },
    orderBy: [{ className: "asc" }, { group: "asc" }],
  });
  return classes.map((c) => ({
    classId: c.id,
    namaKelas: `${c.className} ${c.group}`,
  }));
}

/** Distribusi Siswa per Kelas */
export async function getDistribusiKelas(
  classIds?: number[]
): Promise<DistribusiKelasItem[]> {
  const hasFilter = classIds && classIds.length > 0;

  const students = await prisma.student.groupBy({
    by: ["classId"],
    where: {
      user: { role: "siswa" },
      ...(hasFilter ? { classId: { in: classIds } } : {}),
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

/** Total langkah per materi (denominator untuk persentase) */
const MATERI_TOTAL_STEPS: Record<string, number> = {
  all: 34,
  pendahuluan: 4,
  default: 6,
};

function getTotalSteps(materi: string | undefined): number {
  if (!materi || materi === "all") return MATERI_TOTAL_STEPS.all;
  if (materi === "pendahuluan") return MATERI_TOTAL_STEPS.pendahuluan;
  return MATERI_TOTAL_STEPS.default;
}

/**
 * Progress siswa: gabungan diagnostic_attempts (passed) + student_section_status (completed).
 * Filterable by classIds, materi (concept_id), dan searchName.
 */
export async function getStudentProgress(
  classIds?: number[],
  materi?: string,
  searchName?: string
): Promise<StudentProgressItem[]> {
  const totalSteps = getTotalSteps(materi);
  const isMateriAll = !materi || materi === "all";

  // Build filter fragments
  const classFilter = classIds && classIds.length > 0
    ? Prisma.sql`AND d.class_id IN (${Prisma.join(classIds)})`
    : Prisma.empty;
  const nameFilter = searchName
    ? Prisma.sql`AND LOWER(a.name) LIKE ${"%" + searchName.toLowerCase() + "%"}`
    : Prisma.empty;
  const materiDiagFilter = !isMateriAll && materi !== "pendahuluan"
    ? Prisma.sql`AND FALSE` // diagnostic hanya untuk pendahuluan
    : Prisma.empty;
  const materiSectionFilter = !isMateriAll
    ? Prisma.sql`AND b.concept_id = ${materi}`
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
        'pendahuluan' AS materi,
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
        b.concept_id AS materi,
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
    completed: Number(r.completed),
    total: totalSteps,
    pct: Math.round((Number(r.completed) / totalSteps) * 100),
  }));
}

/** Gabung semua data dashboard dalam satu parallel fetch */
export async function getGuruDashboardData(
  classIds?: number[],
  materi?: string,
  searchName?: string
): Promise<GuruDashboardData> {
  const [totalKelas, totalSiswa, genderBreakdown, kelasOptions, distribusiKelas, daftarSiswa, studentProgress] =
    await Promise.all([
      getTotalKelas(),
      getTotalSiswa(classIds),
      getSiswaGenderBreakdown(classIds),
      getKelasOptions(),
      getDistribusiKelas(classIds),
      getDaftarSiswa(classIds),
      getStudentProgress(classIds, materi, searchName),
    ]);

  return { totalKelas, totalSiswa, genderBreakdown, kelasOptions, distribusiKelas, daftarSiswa, studentProgress };
}
