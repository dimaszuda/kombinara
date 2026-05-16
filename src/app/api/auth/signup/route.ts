import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma/client";
import { logger } from "@/lib/logger";
import { sendAlert } from "@/lib/alerts";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, nama, nomorAbsen, kelas, groupKelas, gender } = body;

  if (!email || !password || !nama || !nomorAbsen || !kelas || !groupKelas || !gender) {
    const missing = ["email", "password", "nama", "nomorAbsen", "kelas", "groupKelas", "gender"]
      .filter((f) => !body[f as keyof typeof body]);
    logger.warn("auth:signup", "Validation failed - missing fields", { missingFields: missing });
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  logger.info("auth:signup", "Signup request received", {
    email: maskEmail(email),
    kelas,
    groupKelas,
    gender,
  });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Buat user dengan email sudah terkonfirmasi (bypass email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: {
      role: "siswa",
      nama: nama.trim(),
      nomorAbsen: nomorAbsen.trim(),
      kelas: kelas.trim(),
      groupKelas: groupKelas.trim(),
      gender,
    },
  });

  if (authError) {
    const isEmailTaken =
      authError.message.toLowerCase().includes("already been registered") ||
      authError.message.toLowerCase().includes("already registered") ||
      authError.message.toLowerCase().includes("already exists");
    if (isEmailTaken) {
      logger.warn("auth:signup", "Signup rejected - email already registered", {
        email: maskEmail(email),
      });
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
      { error: isEmailTaken ? "Email ini sudah terdaftar. Coba login atau gunakan email lain." : authError.message },
      { status: 400 }
    );
  }

  const user = authData.user;
  logger.info("auth:signup", "Supabase user created successfully", {
    userId: user.id,
    kelas,
    groupKelas,
  });

  try {
    const academicYear = getAcademicYear();

    let dbClass = await prisma.class.findFirst({
      where: { className: kelas.trim(), group: groupKelas.trim(), academicYear },
    });
    if (!dbClass) {
      dbClass = await prisma.class.create({
        data: { className: kelas.trim(), group: groupKelas.trim(), academicYear },
      });
      logger.info("auth:signup", "New class created in DB", {
        classId: dbClass.id,
        className: dbClass.className,
        group: dbClass.group,
        academicYear,
      });
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: nama.trim(), role: "siswa" },
      create: {
        id: user.id,
        email: user.email!,
        name: nama.trim(),
        role: "siswa",
      },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: { studentNumber: nomorAbsen.trim(), name: nama.trim(), gender, classId: dbClass.id },
      create: {
        userId: user.id,
        studentNumber: nomorAbsen.trim(),
        name: nama.trim(),
        gender,
        classId: dbClass.id,
      },
    });

    logger.info("auth:signup", "Signup completed successfully", {
      userId: user.id,
      classId: dbClass.id,
      studentNumber: nomorAbsen.trim(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    // Rollback: hapus user auth jika DB gagal
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    logger.error("auth:signup", "DB error during signup - auth user rolled back", {
      userId: user.id,
      error: err instanceof Error ? err.message : String(err),
    });
    sendAlert({
      title: "Signup DB Error — User Rolled Back",
      route: "POST /api/auth/signup",
      error: err instanceof Error ? err.message : String(err),
      meta: { userId: user.id },
    });
    return NextResponse.json(
      { error: "Gagal menyimpan profil", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
