/**
 * Aktivitas Kelas — Class Activity Stats
 *
 * GET /api/aktivitas-kelas
 *   Returns how many students in the logged-in student's class
 *   have completed the Asesmen Formatif for Kaidah Pencacahan.
 *
 * Response:
 * {
 *   className: string,
 *   totalStudents: number,
 *   completedCount: number,
 *   percentage: number,       // 0-100
 *   moduleName: string         // "Kaidah Pencacahan"
 * }
 */
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

const MODULE_SLUG = "kaidah-pencacahan";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student with class info
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        classId: true,
        class: {
          select: { className: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get the module
    const mod = await prisma.module.findUnique({
      where: { slug: MODULE_SLUG },
      select: { id: true, nama: true },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Total students in the class
    const totalStudents = await prisma.student.count({
      where: { classId: student.classId },
    });

    // Students who have submitted asesmen formatif for this module
    const completedCount = await prisma.asesmenFormatifSubmission.count({
      where: {
        moduleId: mod.id,
        student: { classId: student.classId },
      },
    });

    const percentage = totalStudents > 0
      ? Math.round((completedCount / totalStudents) * 1000) / 10
      : 0;

    return NextResponse.json({
      className: student.class.className,
      totalStudents,
      completedCount,
      percentage,
      moduleName: mod.nama,
    });
  } catch (error) {
    // Handle Prisma P2032: schema says non-nullable Int, but DB has NULL
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2032"
    ) {
      const field = (error.meta as { field?: string })?.field ?? "unknown";
      console.error(
        `[GET /api/aktivitas-kelas] Data integrity error: field "${field}" is NULL in DB but non-nullable in schema. ` +
          `Run: npx ts-node scripts/fix-null-class-id.ts --check`
      );
      return NextResponse.json(
        {
          error: `Data integrity issue: field "${field}" is missing. Please contact admin to fix student data.`,
        },
        { status: 500 }
      );
    }

    console.error("[GET /api/aktivitas-kelas] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
