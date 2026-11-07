import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProfileForApi, invalidateProfileCache } from "@/lib/data/user-profile";
import { getUserRole } from "@/lib/auth/roles";
import { setUserRole } from "@/lib/supabase/admin";
import { findClassByJoinCode, isStudentNumberTaken } from "@/lib/data/classes";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getProfileForApi(user.id, user);

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/users] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users — lengkapi profil (siswa yang daftar via Google) ATAU ubah profil.
 * Body: { nama, nomorAbsen?, gender?, classCode? }
 *
 * - Guru (app_metadata.role = "guru"): hanya nama yang diubah (users + teachers).
 *   Tidak pernah membuat baris students / menurunkan role.
 * - Siswa baru (belum punya baris students): `classCode` WAJIB → kelas dari kode guru,
 *   lalu role "siswa" di-set di app_metadata (server-side).
 * - Siswa lama: ubah nama/nomor absen/gender; `classCode` opsional untuk pindah kelas.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
  const nomorAbsen = typeof body?.nomorAbsen === "string" ? body.nomorAbsen.trim() : "";
  const gender = typeof body?.gender === "string" ? body.gender.trim() : "";
  const classCode = typeof body?.classCode === "string" ? body.classCode.trim() : "";

  if (!nama) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  const role = getUserRole(user);

  try {
    // ── Guru: hanya nama ─────────────────────────────────────────
    if (role === "guru") {
      await prisma.user.update({ where: { id: user.id }, data: { name: nama } });
      await prisma.teacher.updateMany({ where: { userId: user.id }, data: { name: nama } });
      await invalidateProfileCache(user.id);
      return NextResponse.json({ success: true });
    }

    // ── Siswa ────────────────────────────────────────────────────
    if (!nomorAbsen) {
      return NextResponse.json({ error: "Nomor absen wajib diisi" }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ error: "Gender wajib diisi" }, { status: 400 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { classId: true },
    });

    // Kelas tujuan: dari kode (wajib untuk siswa baru, opsional untuk pindah kelas)
    let classId = existingStudent?.classId;
    let classLabel: string | null = null;
    if (classCode || !existingStudent) {
      if (!classCode) {
        return NextResponse.json({ error: "Kode kelas wajib diisi" }, { status: 400 });
      }
      const cls = await findClassByJoinCode(classCode);
      if (!cls) {
        return NextResponse.json({ error: "Kode kelas tidak ditemukan. Periksa lagi kode dari gurumu." }, { status: 400 });
      }
      classId = cls.id;
      classLabel = cls.label;
    }

    if (await isStudentNumberTaken(classId!, nomorAbsen, user.id)) {
      return NextResponse.json(
        { error: `Nomor absen ${nomorAbsen} sudah digunakan siswa lain di kelas ${classLabel ?? "ini"}. Gunakan nomor absen yang berbeda.` },
        { status: 409 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { name: nama, role: "siswa" },
      create: { id: user.id, email: user.email!, name: nama, role: "siswa" },
    });

    const dbStudent = await prisma.student.upsert({
      where: { userId: user.id },
      update: { studentNumber: nomorAbsen, name: nama, gender, classId: classId! },
      create: { userId: user.id, studentNumber: nomorAbsen, name: nama, gender, classId: classId! },
    });

    // Role terverifikasi — setelah DB sukses. Jika gagal, siswa cukup submit ulang (idempoten).
    if (role !== "siswa") {
      await setUserRole(user.id, "siswa");
    }

    await invalidateProfileCache(user.id);

    return NextResponse.json({ user: dbUser, student: dbStudent });
  } catch (err) {
    console.error("[POST /api/users] Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan profil. Coba lagi." }, { status: 500 });
  }
}
