/**
 * Kelas Saya — kelola kelas yang diajar guru.
 *
 * GET    /api/guru/kelas
 *   → { schoolName, currentAcademicYear, classes: [...], available: [...] }
 *     `classes` = kelas guru ini (dengan joinCode untuk dibagikan ke siswa)
 *     `available` = kelas lain di sekolah yang sama yang bisa diklaim (tanpa joinCode)
 *
 * POST   /api/guru/kelas
 *   Body: { classId: number }                → klaim kelas yang sudah ada di sekolah sendiri
 *   Body: { className: "X"|"XI"|"XII", group: "A".."Z" }
 *                                            → buat kelas baru (tahun ajaran berjalan) / pakai yang sudah ada
 *   → { success: true, classId }
 *
 * DELETE /api/guru/kelas?classId=…           → lepas kelas dari daftar guru (data kelas & siswa tetap)
 *   → { success: true }
 *
 * Semua aksi dibatasi ke sekolah guru (requireGuru → teachers.school_id).
 */
import { NextResponse } from "next/server";
import { requireGuru } from "@/lib/auth/guru";
import {
  findOrCreateClass,
  getTeacherClassOverview,
  isValidClassGroup,
  isValidClassLevel,
  linkTeacherToClass,
  unlinkTeacherFromClass,
} from "@/lib/data/classes";

export async function GET() {
  const auth = await requireGuru();
  if ("error" in auth) return auth.error;
  const { guru } = auth;

  try {
    return NextResponse.json(await getTeacherClassOverview(guru.teacherId, guru.schoolId));
  } catch (err) {
    console.error("[GET /api/guru/kelas] Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireGuru();
  if ("error" in auth) return auth.error;
  const { guru } = auth;

  const body = await req.json().catch(() => null);

  try {
    // ── Klaim kelas yang sudah ada ─────────────────────────────
    if (typeof body?.classId === "number") {
      const linked = await linkTeacherToClass(guru.teacherId, guru.schoolId, body.classId);
      if (!linked) {
        return NextResponse.json({ error: "Kelas tidak ditemukan di sekolahmu" }, { status: 404 });
      }
      return NextResponse.json({ success: true, classId: body.classId });
    }

    // ── Buat kelas baru ────────────────────────────────────────
    const className = typeof body?.className === "string" ? body.className.trim().toUpperCase() : "";
    const group = typeof body?.group === "string" ? body.group.trim().toUpperCase() : "";

    if (!isValidClassLevel(className)) {
      return NextResponse.json({ error: "Tingkat kelas hanya boleh X, XI, atau XII" }, { status: 400 });
    }
    if (!isValidClassGroup(group)) {
      return NextResponse.json({ error: "Grup kelas hanya boleh satu huruf A–Z" }, { status: 400 });
    }

    const { classId } = await findOrCreateClass({ schoolId: guru.schoolId, className, group });
    await linkTeacherToClass(guru.teacherId, guru.schoolId, classId);
    return NextResponse.json({ success: true, classId });
  } catch (err) {
    console.error("[POST /api/guru/kelas] Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan kelas" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireGuru();
  if ("error" in auth) return auth.error;
  const { guru } = auth;

  const classId = parseInt(new URL(req.url).searchParams.get("classId") ?? "", 10);
  if (isNaN(classId)) {
    return NextResponse.json({ error: "classId wajib berupa angka" }, { status: 400 });
  }

  try {
    await unlinkTeacherFromClass(guru.teacherId, classId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/guru/kelas] Error:", err);
    return NextResponse.json({ error: "Gagal melepas kelas" }, { status: 500 });
  }
}
