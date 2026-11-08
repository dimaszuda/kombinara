/**
 * Daftar akun GURU.
 *
 * POST /api/auth/signup-guru
 * Body: { nama, email, password, teacherCode }
 * Response: { success: true, schoolName }
 *
 * - `teacherCode` dicocokkan ke `schools.teacher_code` (di server, tidak case-sensitive).
 *   Kode menentukan sekolah guru. NULL di DB = pendaftaran guru sekolah itu ditutup.
 * - Role `guru` disimpan di `app_metadata` (tidak bisa diubah user dari browser).
 * - Membuat baris `users` (role guru) + `teachers`. Kelas dipilih sesudahnya di /guru/kelas.
 * - Jika penyimpanan DB gagal, user auth di-rollback.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { logger, maskEmail } from "@/lib/logger";
import { sendAlert } from "@/lib/alerts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const REQUIRED_FIELDS = ["nama", "email", "password", "teacherCode"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
  if (missing.length > 0) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const nama = body.nama.trim();
  const email = body.email.trim();
  const password: string = body.password;
  const teacherCode = body.teacherCode.trim();

  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  // ── Verifikasi kode guru SEBELUM membuat akun ─────────────────
  const school = await prisma.school.findFirst({
    where: { teacherCode: { equals: teacherCode, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!school) {
    logger.warn("auth:signup-guru", "Signup rejected - invalid teacher code", { email: maskEmail(email) });
    return NextResponse.json({ error: "Kode guru tidak valid. Hubungi admin sekolahmu." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "guru" },
    user_metadata: { nama },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    const isEmailTaken =
      msg.includes("already been registered") || msg.includes("already registered") || msg.includes("already exists");
    if (!isEmailTaken) {
      logger.error("auth:signup-guru", "Supabase auth error during signup", {
        email: maskEmail(email),
        error: authError.message,
      });
      sendAlert({
        title: "Signup Guru Auth Error",
        route: "POST /api/auth/signup-guru",
        error: authError.message,
        meta: { email: maskEmail(email) },
      });
    }
    return NextResponse.json(
      { error: isEmailTaken ? "Email ini sudah terdaftar. Coba login atau gunakan email lain." : "Gagal membuat akun. Coba lagi." },
      { status: 400 }
    );
  }

  const user = authData.user;

  try {
    await prisma.$transaction([
      prisma.user.upsert({
        where: { id: user.id },
        update: { name: nama, role: "guru" },
        create: { id: user.id, email: user.email!, name: nama, role: "guru" },
      }),
      prisma.teacher.create({
        data: { userId: user.id, schoolId: school.id, name: nama },
      }),
    ]);

    logger.info("auth:signup-guru", "Guru signup completed", { userId: user.id, schoolId: school.id });
    return NextResponse.json({ success: true, schoolName: school.name });
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    const error = err instanceof Error ? err.message : String(err);
    logger.error("auth:signup-guru", "DB error during signup - auth user rolled back", { userId: user.id, error });
    sendAlert({
      title: "Signup Guru DB Error: User Rolled Back",
      route: "POST /api/auth/signup-guru",
      error,
      meta: { userId: user.id },
    });
    return NextResponse.json({ error: "Gagal menyimpan akun guru. Coba lagi." }, { status: 500 });
  }
}
