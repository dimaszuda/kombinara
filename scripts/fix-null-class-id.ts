/**
 * Script: Check & fix students with NULL class_id
 *
 * Run: npx ts-node scripts/fix-null-class-id.ts
 *
 * This script identifies Student records where class_id is NULL
 * (which violates the Prisma schema's non-nullable Int constraint).
 * It can optionally fix them by assigning a default class.
 *
 * Usage:
 *   --check   Only list affected students (default)
 *   --fix     Assign affected students to a specified class
 *   --classId The target class ID to assign when --fix is used
 */

import { prisma } from "../src/lib/prisma/client";

interface NullClassStudent {
  student_id: number;
  user_id: string;
  student_number: string;
  name: string;
  gender: string;
  class_id: null;
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--fix") ? "fix" : "check";
  const classIdArg = args.find((a) => a.startsWith("--classId="));
  const targetClassId = classIdArg ? parseInt(classIdArg.split("=")[1], 10) : null;

  console.log("🔍 Checking for students with NULL class_id...\n");

  // Use raw query to avoid Prisma P2032 error
  const nullClassStudents = await prisma.$queryRawUnsafe<NullClassStudent[]>(
    `SELECT student_id, user_id, student_number, name, gender, class_id
     FROM students
     WHERE class_id IS NULL`
  );

  if (nullClassStudents.length === 0) {
    console.log("✅ No students with NULL class_id found. Database is clean.");
    await prisma.$disconnect();
    return;
  }

  console.log(`⚠️  Found ${nullClassStudents.length} student(s) with NULL class_id:\n`);
  for (const s of nullClassStudents) {
    console.log(`  • ID: ${s.student_id} | NIS: ${s.student_number} | Name: ${s.name} | Gender: ${s.gender}`);
  }

  if (mode === "fix") {
    if (!targetClassId || isNaN(targetClassId)) {
      console.log("\n❌ Error: --classId=<id> is required when using --fix");
      console.log("   Provide a valid class ID to assign to these students.");
      await prisma.$disconnect();
      process.exit(1);
    }

    // Verify the target class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: targetClassId },
      select: { id: true, className: true },
    });

    if (!targetClass) {
      console.log(`\n❌ Error: Class with ID ${targetClassId} not found.`);
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`\n🔧 Assigning students to class "${targetClass.className}" (ID: ${targetClass.id})...\n`);

    for (const s of nullClassStudents) {
      await prisma.$executeRawUnsafe(
        `UPDATE students SET class_id = $1 WHERE student_id = $2`,
        targetClassId,
        s.student_id
      );
      console.log(`  ✅ Fixed: ${s.name} (NIS: ${s.student_number}) → class_id = ${targetClassId}`);
    }

    console.log(`\n🎉 All ${nullClassStudents.length} students fixed successfully.`);
  } else {
    console.log("\n💡 To fix these students, run:");
    console.log(`   npx ts-node scripts/fix-null-class-id.ts --fix --classId=<TARGET_CLASS_ID>`);
    console.log("\n   First, find available classes:");
    console.log("   npx ts-node -e \"const{prisma}=require('./src/lib/prisma/client');prisma.class.findMany({select:{id:true,className:true}}).then(c=>{console.table(c);prisma.\\$disconnect()})\"");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  prisma.$disconnect();
  process.exit(1);
});
