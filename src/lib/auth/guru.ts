/**
 * Otorisasi guru untuk route handler.
 *
 * Dua lapis:
 *   1. Role terverifikasi `app_metadata.role === "guru"` (lihat `src/lib/auth/roles.ts`).
 *   2. Baris `teachers` di DB — menentukan sekolah dan kelas yang BOLEH dilihat guru.
 *
 * Fungsi analytics di `src/lib/data/*` menganggap `classIds` kosong/undefined = SEMUA kelas.
 * Karena itu route guru WAJIB memakai `scopeClassIds()` dan berhenti lebih awal jika hasilnya kosong.
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getUserRole } from "@/lib/auth/roles";

export interface GuruContext {
  userId: string;
  teacherId: number;
  schoolId: number;
  name: string;
  /** Kelas yang diajar guru ini (dari teacher_classes). Bisa kosong. */
  classIds: number[];
}

export async function requireGuru(): Promise<{ guru: GuruContext } | { error: NextResponse }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (getUserRole(user) !== "guru") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true, schoolId: true, name: true, classes: { select: { classId: true } } },
  });

  if (!teacher) {
    return {
      error: NextResponse.json({ error: "Akun guru belum terhubung ke sekolah mana pun" }, { status: 403 }),
    };
  }

  return {
    guru: {
      userId: user.id,
      teacherId: teacher.id,
      schoolId: teacher.schoolId,
      name: teacher.name,
      classIds: teacher.classes.map((c) => c.classId),
    },
  };
}

/**
 * Batasi filter kelas dari request ke kelas milik guru.
 * - Tanpa filter → semua kelas guru.
 * - Dengan filter → irisan filter ∩ kelas guru (kelas lain diabaikan diam-diam).
 * Hasil kosong berarti guru tidak boleh melihat data apa pun → pemanggil harus return data kosong.
 */
export function scopeClassIds(requested: number[] | undefined, allowed: number[]): number[] {
  if (!requested || requested.length === 0) return allowed;
  const allowedSet = new Set(allowed);
  return requested.filter((id) => allowedSet.has(id));
}

/** Apakah siswa ini berada di salah satu kelas guru. */
export async function guruCanAccessStudent(guru: GuruContext, studentId: number): Promise<boolean> {
  if (guru.classIds.length === 0) return false;
  const student = await prisma.student.findFirst({
    where: { id: studentId, classId: { in: guru.classIds } },
    select: { id: true },
  });
  return student !== null;
}
