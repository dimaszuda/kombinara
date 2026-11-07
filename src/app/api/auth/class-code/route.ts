/**
 * Cek kode kelas (publik).
 *
 * POST /api/auth/class-code
 * Body: { code: string }
 * Response 200: { className, group, academicYear, schoolName, label }
 * Response 404: { error }
 *
 * Dipakai halaman /join dan form daftar untuk menampilkan kelas tujuan sebelum
 * siswa membuat akun. Hanya mengembalikan identitas kelas — tidak ada data siswa.
 * Verifikasi final tetap dilakukan ulang di /api/auth/signup dan /api/users.
 */
import { NextResponse } from "next/server";
import { findClassByJoinCode } from "@/lib/data/classes";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const cls = await findClassByJoinCode(body?.code);

  if (!cls) {
    return NextResponse.json({ error: "Kode kelas tidak ditemukan. Periksa lagi kode dari gurumu." }, { status: 404 });
  }

  return NextResponse.json({
    className: cls.className,
    group: cls.group,
    academicYear: cls.academicYear,
    schoolName: cls.schoolName,
    label: cls.label,
  });
}
