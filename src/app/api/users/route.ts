import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        student: {
          include: { class: true },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ?? null;

    const className =
      dbUser.role === "siswa" && dbUser.student
        ? `${dbUser.student.class.className} ${dbUser.student.class.group}`
        : null;

    const gender = dbUser.role === "siswa" && dbUser.student ? dbUser.student.gender : null;

    return NextResponse.json({
      name: dbUser.name,
      role: dbUser.role,
      avatarUrl,
      className,
      gender,
    });
  } catch (err) {
    console.error("[GET /api/users] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const nama = body.nama?.trim();
  const nomorAbsen = body.nomorAbsen?.trim();
  const kelas = body.kelas?.trim();
  const groupKelas = body.groupKelas?.trim();
  const gender = body.gender?.trim();

  if (!nama) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }
  if (!nomorAbsen) {
    return NextResponse.json({ error: "Nomor absen wajib diisi" }, { status: 400 });
  }
  if (!kelas) {
    return NextResponse.json({ error: "Kelas wajib diisi" }, { status: 400 });
  }
  if (!groupKelas) {
    return NextResponse.json({ error: "Group kelas wajib diisi" }, { status: 400 });
  }
  if (!gender) {
    return NextResponse.json({ error: "Gender wajib diisi" }, { status: 400 });
  }

  try {
    // 1. Upsert users (Google auth — tidak ada password)
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { name: nama, role: "siswa" },
      create: {
        id: user.id,
        email: user.email!,
        name: nama,
        role: "siswa",
      },
    });
    // 2. Find-or-create class
    const academicYear = getAcademicYear();
    let dbClass = await prisma.class.findFirst({
      where: { className: kelas, group: groupKelas, academicYear },
    });
    if (!dbClass) {
      dbClass = await prisma.class.create({
        data: { className: kelas, group: groupKelas, academicYear },
      });
    }

    // 3. Upsert student
    const dbStudent = await prisma.student.upsert({
      where: { userId: user.id },
      update: { studentNumber: nomorAbsen, name: nama, gender, classId: dbClass.id },
      create: {
        userId: user.id,
        studentNumber: nomorAbsen,
        name: nama,
        gender,
        classId: dbClass.id,
      },
    });

    return NextResponse.json({ user: dbUser, student: dbStudent });
  } catch (err) {
    console.error("[POST /api/users] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
