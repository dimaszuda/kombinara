const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const nullCount = await p.$queryRawUnsafe(
    `SELECT count(*) as cnt FROM students WHERE class_id IS NULL`
  );
  console.log("Students with NULL classId:", Number(nullCount[0].cnt));

  const total = await p.$queryRawUnsafe(
    `SELECT count(*) as cnt FROM students`
  );
  console.log("Total students:", Number(total[0].cnt));

  const classCount = await p.$queryRawUnsafe(
    `SELECT count(*) as cnt FROM classes`
  );
  console.log("Total classes:", Number(classCount[0].cnt));

  const fkInfo = await p.$queryRawUnsafe(
    `SELECT
      tc.constraint_name,
      tc.constraint_type,
      rc.delete_rule
     FROM information_schema.table_constraints tc
     LEFT JOIN information_schema.referential_constraints rc
       ON tc.constraint_name = rc.constraint_name
     WHERE tc.table_name = 'students'
       AND tc.constraint_type = 'FOREIGN KEY'`
  );
  console.log("\nFK constraints on students:");
  console.log(JSON.stringify(fkInfo, null, 2));

  if (nullCount[0].cnt > 0) {
    const sample = await p.$queryRawUnsafe(
      `SELECT student_id, name, class_id FROM students WHERE class_id IS NULL LIMIT 5`
    );
    console.log("\nSample students with NULL classId:");
    console.log(JSON.stringify(sample, null, 2));
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  p.$disconnect();
});
