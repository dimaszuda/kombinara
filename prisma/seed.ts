// Seed data untuk development
// Jalankan: npx prisma db seed
// Tambahkan ke package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }

import { PrismaClient, UserRole } from "@prisma/client";

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
      nama: "Pak Budi",
      role: UserRole.guru,
    },
  });

  // Kelas
  const kelas = await prisma.kelas.upsert({
    where: { kode: "KOMB-2024" },
    update: {},
    create: {
      nama: "Kelas XII IPA 1",
      kode: "KOMB-2024",
      guruId: guru.id,
    },
  });

  // Default settings untuk kelas
  await prisma.classSettings.upsert({
    where: { kelasId: kelas.id },
    update: {},
    create: {
      kelasId: kelas.id,
      readingWeight: 0.25,
      frequencyWeight: 0.25,
      depthWeight: 0.30,
      quizWeight: 0.20,
      leaderboardMode: "activity_score",
    },
  });

  // Siswa sample
  const siswaSample = [
    { id: "00000000-0000-0000-0000-000000000010", email: "siswa1@kombinara.dev", nama: "Andi Pratama" },
    { id: "00000000-0000-0000-0000-000000000011", email: "siswa2@kombinara.dev", nama: "Bela Sari" },
    { id: "00000000-0000-0000-0000-000000000012", email: "siswa3@kombinara.dev", nama: "Candra Wijaya" },
  ];

  for (const s of siswaSample) {
    const siswa = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, role: UserRole.siswa },
    });

    await prisma.kelasAnggota.upsert({
      where: { kelasId_siswaId: { kelasId: kelas.id, siswaId: siswa.id } },
      update: {},
      create: { kelasId: kelas.id, siswaId: siswa.id },
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
