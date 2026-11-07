/**
 * Classes Data Layer — kelas, kode kelas (join code), dan tahun ajaran.
 *
 * Model multi-sekolah:
 *   schools 1─* classes *─* teachers (via teacher_classes)
 *   classes 1─* students
 *
 * Siswa bergabung ke kelas lewat `classes.join_code`. Kelas dibuat/diklaim oleh
 * guru (halaman Kelas Saya), tidak lagi dibuat otomatis saat siswa mendaftar.
 */

import { randomInt } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

// ═══════════════════════════════════════════════════════════════
// Tingkat, grup, tahun ajaran
// ═══════════════════════════════════════════════════════════════

export const CLASS_LEVELS = ["X", "XI", "XII"] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

export function isValidClassLevel(value: unknown): value is ClassLevel {
  return typeof value === "string" && (CLASS_LEVELS as readonly string[]).includes(value);
}

/** Grup kelas = satu huruf kapital A–Z. */
export function isValidClassGroup(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]$/.test(value);
}

/** Tahun ajaran berjalan. Juli ke atas = tahun ajaran baru (mis. Juli 2026 → "2026/2027"). */
export function getAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export function formatClassLabel(cls: { className: string; group: string }): string {
  return `${cls.className} ${cls.group}`;
}

// ═══════════════════════════════════════════════════════════════
// Kode kelas (join code)
// ═══════════════════════════════════════════════════════════════

/** Tanpa 0/O dan 1/I agar tidak tertukar saat didikte / ditulis di papan. */
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 8;

/**
 * Normalisasi input kode dari user: trim, uppercase, buang spasi & tanda hubung.
 * Return `null` jika formatnya jelas tidak valid (hemat query DB).
 */
export function normalizeJoinCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z0-9]{4,16}$/.test(code) ? code : null;
}

function randomJoinCode(): string {
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

/** Buat kode kelas yang belum dipakai. Kolom `join_code` juga UNIQUE di DB sebagai pengaman akhir. */
export async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomJoinCode();
    const taken = await prisma.class.findUnique({ where: { joinCode: code }, select: { id: true } });
    if (!taken) return code;
  }
  throw new Error("Gagal membuat kode kelas unik setelah 5 percobaan");
}

// ═══════════════════════════════════════════════════════════════
// Lookup
// ═══════════════════════════════════════════════════════════════

export interface ClassWithSchool {
  id: number;
  schoolId: number;
  schoolName: string;
  className: string;
  group: string;
  academicYear: string;
  label: string;
}

/** Cari kelas dari kode kelas. Return `null` jika kode tidak valid / tidak ditemukan. */
export async function findClassByJoinCode(rawCode: unknown): Promise<ClassWithSchool | null> {
  const code = normalizeJoinCode(rawCode);
  if (!code) return null;

  const cls = await prisma.class.findUnique({
    where: { joinCode: code },
    select: {
      id: true,
      schoolId: true,
      className: true,
      group: true,
      academicYear: true,
      school: { select: { name: true } },
    },
  });
  if (!cls) return null;

  return {
    id: cls.id,
    schoolId: cls.schoolId,
    schoolName: cls.school.name,
    className: cls.className,
    group: cls.group,
    academicYear: cls.academicYear,
    label: formatClassLabel(cls),
  };
}

/** Nomor absen sudah dipakai siswa LAIN di kelas yang sama? */
export async function isStudentNumberTaken(
  classId: number,
  studentNumber: string,
  excludeUserId?: string
): Promise<boolean> {
  const existing = await prisma.student.findFirst({
    where: {
      classId,
      studentNumber,
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

// ═══════════════════════════════════════════════════════════════
// Create
// ═══════════════════════════════════════════════════════════════

/**
 * Ambil kelas (sekolah, tingkat, grup, tahun ajaran) atau buat baru beserta kode kelasnya.
 * Kelas lama yang belum punya kode akan dibuatkan kode.
 */
export async function findOrCreateClass(params: {
  schoolId: number;
  className: ClassLevel;
  group: string;
  academicYear?: string;
}): Promise<{ classId: number; created: boolean }> {
  const academicYear = params.academicYear ?? getAcademicYear();
  const where = {
    schoolId: params.schoolId,
    className: params.className,
    group: params.group,
    academicYear,
  };

  const existing = await prisma.class.findFirst({ where, select: { id: true, joinCode: true } });
  if (existing) {
    if (!existing.joinCode) {
      await prisma.class.update({ where: { id: existing.id }, data: { joinCode: await generateUniqueJoinCode() } });
    }
    return { classId: existing.id, created: false };
  }

  try {
    const created = await prisma.class.create({
      data: { ...where, joinCode: await generateUniqueJoinCode() },
      select: { id: true },
    });
    return { classId: created.id, created: true };
  } catch (err) {
    // Race: kelas yang sama dibuat bersamaan oleh guru lain → ambil yang sudah ada
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const again = await prisma.class.findFirst({ where, select: { id: true } });
      if (again) return { classId: again.id, created: false };
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// Kelas milik guru (teacher_classes) — dipakai halaman "Kelas Saya"
// ═══════════════════════════════════════════════════════════════

export interface TeacherClassItem {
  classId: number;
  label: string;
  academicYear: string;
  studentCount: number;
  /** Hanya diisi untuk kelas milik guru sendiri. */
  joinCode: string | null;
}

export interface TeacherClassOverview {
  schoolName: string;
  currentAcademicYear: string;
  /** Kelas yang diajar guru ini. */
  classes: TeacherClassItem[];
  /** Kelas lain di sekolah yang sama yang bisa diklaim. */
  available: TeacherClassItem[];
}

export async function getTeacherClassOverview(teacherId: number, schoolId: number): Promise<TeacherClassOverview> {
  const [school, schoolClasses, mine] = await Promise.all([
    prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
    prisma.class.findMany({
      where: { schoolId },
      select: { id: true, className: true, group: true, academicYear: true, joinCode: true },
      orderBy: [{ academicYear: "desc" }, { className: "asc" }, { group: "asc" }],
    }),
    prisma.teacherClass.findMany({ where: { teacherId }, select: { classId: true } }),
  ]);

  const counts = schoolClasses.length
    ? await prisma.student.groupBy({
        by: ["classId"],
        where: { classId: { in: schoolClasses.map((c) => c.id) } },
        _count: { _all: true },
      })
    : [];
  const countMap = new Map(counts.map((c) => [c.classId, c._count._all]));
  const mineSet = new Set(mine.map((m) => m.classId));

  const toItem = (c: (typeof schoolClasses)[number], isMine: boolean): TeacherClassItem => ({
    classId: c.id,
    label: formatClassLabel(c),
    academicYear: c.academicYear,
    studentCount: countMap.get(c.id) ?? 0,
    joinCode: isMine ? c.joinCode : null,
  });

  return {
    schoolName: school?.name ?? "",
    currentAcademicYear: getAcademicYear(),
    classes: schoolClasses.filter((c) => mineSet.has(c.id)).map((c) => toItem(c, true)),
    available: schoolClasses.filter((c) => !mineSet.has(c.id)).map((c) => toItem(c, false)),
  };
}

/**
 * Hubungkan guru ke kelas di sekolahnya (idempoten). Kelas tanpa kode akan dibuatkan kode.
 * Return `false` jika kelas tidak ada / bukan milik sekolah guru.
 */
export async function linkTeacherToClass(teacherId: number, schoolId: number, classId: number): Promise<boolean> {
  const cls = await prisma.class.findFirst({
    where: { id: classId, schoolId },
    select: { id: true, joinCode: true },
  });
  if (!cls) return false;

  if (!cls.joinCode) {
    await prisma.class.update({ where: { id: cls.id }, data: { joinCode: await generateUniqueJoinCode() } });
  }

  await prisma.teacherClass.upsert({
    where: { teacherId_classId: { teacherId, classId } },
    create: { teacherId, classId },
    update: {},
  });
  return true;
}

/** Lepas kelas dari daftar guru. Data kelas & siswa TIDAK dihapus. */
export async function unlinkTeacherFromClass(teacherId: number, classId: number): Promise<void> {
  await prisma.teacherClass.deleteMany({ where: { teacherId, classId } });
}
