// Seed data untuk development
// Jalankan: npx prisma db seed
// Tambahkan ke package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Guru
  const guru = await prisma.user.upsert({
    where: { email: "guru@kombinara.dev" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "guru@kombinara.dev",
      name: "Pak Budi",
      role: "guru",
    },
  });

  // Kelas
  const kelas = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      className: "Kelas XII IPA 1",
      group: "IPA 1",
      academicYear: "2024/2025",
      teacherId: guru.id,
    },
  });

  // Default settings untuk kelas
  await prisma.classSettings.upsert({
    where: { classId: kelas.id },
    update: {},
    create: {
      classId: kelas.id,
      readingWeight: 0.25,
      frequencyWeight: 0.25,
      depthWeight: 0.3,
      quizWeight: 0.2,
      leaderboardMode: "activity_score",
    },
  });

  // Siswa sample
  const siswaSample = [
    {
      id: "00000000-0000-0000-0000-000000000010",
      email: "siswa1@kombinara.dev",
      name: "Andi Pratama",
      studentNumber: "2024001",
      gender: "L",
    },
    {
      id: "00000000-0000-0000-0000-000000000011",
      email: "siswa2@kombinara.dev",
      name: "Bela Sari",
      studentNumber: "2024002",
      gender: "P",
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      email: "siswa3@kombinara.dev",
      name: "Candra Wijaya",
      studentNumber: "2024003",
      gender: "L",
    },
  ];

  for (const s of siswaSample) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        email: s.email,
        name: s.name,
        role: "siswa",
      },
    });

    // Student adalah profil tambahan yang terhubung 1:1 ke User,
    // dan classId langsung di sini (tidak ada tabel junction terpisah)
    await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentNumber: s.studentNumber,
        name: s.name,
        gender: s.gender,
        classId: kelas.id,
      },
    });
  }

  // Materi placeholder
  await prisma.materi.upsert({
    where: { slug: "aturan-penjumlahan-dan-perkalian" },
    update: {},
    create: {
      slug: "aturan-penjumlahan-dan-perkalian",
      judul: "Aturan Penjumlahan dan Perkalian",
      konten: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Aturan Penjumlahan dan Perkalian" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Konten materi akan diisi oleh guru." }],
          },
        ],
      },
      urutan: 1,
      publishedAt: new Date(),
    },
  });

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });