/**
 * Daftar akun SISWA (email + password).
 *
 * POST /api/auth/signup
 * Body: { email, password, nama, nomorAbsen, gender, classCode }
 * Response: { success: true }
 *
 * - `classCode` = kode kelas dari guru (classes.join_code), diverifikasi di server.
 *   Kelas & sekolah ditentukan oleh kode, bukan diketik siswa.
 * - Role disimpan di `app_metadata.role` (tidak bisa diubah user dari browser).
 * - Jika penyimpanan DB gagal, user auth di-rollback.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { logger, maskEmail } from "@/lib/logger";
import { sendAlert } from "@/lib/alerts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findClassByJoinCode, isStudentNumberTaken } from "@/lib/data/classes";

const REQUIRED_FIELDS = ["email", "password", "nama", "nomorAbsen", "gender", "classCode"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
  if (missing.length > 0) {
    logger.warn("auth:signup", "Validation failed - missing fields", { missingFields: missing });
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const email = body.email.trim();
  const password: string = body.password;
  const nama = body.nama.trim();
  const nomorAbsen = body.nomorAbsen.trim();
  const gender = body.gender.trim();

  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  // ── Verifikasi kode kelas SEBELUM membuat akun ────────────────
  const cls = await findClassByJoinCode(body.classCode);
  if (!cls) {
    logger.warn("auth:signup", "Signup rejected - invalid class code", { email: maskEmail(email) });
    return NextResponse.json({ error: "Kode kelas tidak ditemukan. Periksa lagi kode dari gurumu." }, { status: 400 });
  }

  if (await isStudentNumberTaken(cls.id, nomorAbsen)) {
    return NextResponse.json(
      { error: `Nomor absen ${nomorAbsen} sudah digunakan siswa lain di kelas ${cls.label}.` },
      { status: 409 }
    );
  }

  logger.info("auth:signup", "Signup request received", {
    email: maskEmail(email),
    classId: cls.id,
    schoolId: cls.schoolId,
  });

  const supabaseAdmin = createSupabaseAdminClient();

  // Email langsung terkonfirmasi (bypass email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "siswa" },
    user_metadata: { nama, nomorAbsen, gender },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    const isEmailTaken =
      msg.includes("already been registered") || msg.includes("already registered") || msg.includes("already exists");
    if (isEmailTaken) {
      logger.warn("auth:signup", "Signup rejected - email already registered", { email: maskEmail(email) });
    } else {
      logger.error("auth:signup", "Supabase auth error during signup", {
        email: maskEmail(email),
        error: authError.message,
      });
      sendAlert({
        title: "Signup Auth Error",
        route: "POST /api/auth/signup",
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
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: nama, role: "siswa" },
      create: { id: user.id, email: user.email!, name: nama, role: "siswa" },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: { studentNumber: nomorAbsen, name: nama, gender, classId: cls.id },
      create: { userId: user.id, studentNumber: nomorAbsen, name: nama, gender, classId: cls.id },
    });

    logger.info("auth:signup", "Signup completed successfully", { userId: user.id, classId: cls.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    // Rollback: hapus user auth jika DB gagal
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    const error = err instanceof Error ? err.message : String(err);
    logger.error("auth:signup", "DB error during signup - auth user rolled back", { userId: user.id, error });
    sendAlert({
      title: "Signup DB Error — User Rolled Back",
      route: "POST /api/auth/signup",
      error,
      meta: { userId: user.id },
    });
    return NextResponse.json({ error: "Gagal menyimpan profil. Coba lagi." }, { status: 500 });
  }
}
