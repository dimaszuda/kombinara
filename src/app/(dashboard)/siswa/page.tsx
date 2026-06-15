"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const materiCards = [
  {
    id: "1",
    title: "Kaidah Pencacahan",
    href: "/siswa/materi/kaidah-pencacahan",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
    image: "/images/Kaidah pencacahan.png",
    alt: "Kaidah Pencacahan",
  },
  {
    id: "2",
    title: "Permutasi",
    href: "/siswa/materi/permutasi",
    description:
      "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
    image: "/images/permutasi.png",
    alt: "Permutasi",
  },
  {
    id: "3",
    title: "Kombinasi",
    href: "/siswa/materi/kombinasi",
    description:
      "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
    image: "/images/kombinasi.png",
    alt: "Kombinasi",
  },
];

function KataPengantar() {
  return (
    <article className="kp-wrap">
        <p className="kp-badge">📒 Modul Pembelajaran Matematika</p>
        <h2 className="kp-subtitle">Kaidah Pencacahan (Kombinatorika)</h2>
        <p className="kp-tagline">"Menghitung Tanpa Bingung, Berpikir Tanpa Batas"</p>
        <p className="kp-meta">Matematika &nbsp;·&nbsp; Kelas XII SMA &nbsp;·&nbsp; Kurikulum Merdeka</p>


        <blockquote className="kp-quote">
          "Matematika bukan tentang menghafal rumus — melainkan tentang memahami pola, bernalar dengan logika, dan melihat keajaiban angka dalam kehidupan nyata."
        </blockquote>

        <hr className="kp-divider" />

        <p className="kp-section-label">Kata Pengantar</p>
        <h3 className="kp-greeting">Halo, Pelajar Hebat! 👋</h3>

        <p className="kp-body">
          Pernahkah kamu bertanya-tanya: <b>berapa banyak kemungkinan password yang bisa kamu buat?</b> Atau{' '}
          <b>berapa cara berbeda tim sepak bola bisa dibentuk dari sekumpulan pemain?</b> Bahkan pertanyaan
          sederhana seperti <b>"berapa banyak pilihan outfit yang bisa kupakai minggu ini?"</b> ternyata bisa
          dijawab dengan matematika!
        </p>

        <p className="kp-body">
          Modul ini akan mengajakmu menjelajahi dunia <b>Kaidah Pencacahan</b> yaitu sebuah cabang matematika yang
          sangat dekat dengan kehidupanmu sehari-hari. Namun, kita tidak akan belajar dengan cara menghafal
          rumus lalu mengerjakan soal. Kita akan <b>berpikir bersama, menemukan pola, mendiskusikan ide,</b>{' '}
          dan <b>membangun pemahaman yang sesungguhnya.</b>
        </p>

        <p className="kp-body">
          Belajar matematika yang menyenangkan bukan berarti mudah tanpa tantangan tetapi justru tantanganlah yang
          membuat otakmu berkembang. Hadapi setiap pertanyaan dalam modul ini dengan <b>rasa ingin tahu</b>,
          bukan rasa takut.
        </p>

        <p className="kp-body">Selamat belajar, dan nikmati prosesnya! 🎉</p>

        <p className="kp-sign">— Penyusun</p>
        <hr className="kp-divider" />
      </article>
  );
}

const TOC_DATA = [
  { no: 1,  bagian: "Kata Pengantar" },
  { no: 2,  bagian: "Daftar Isi" },
  { no: 3,  bagian: "Petunjuk Penggunaan Modul" },
  { no: 4,  bagian: "Peta Konsep" },
  { no: 5,  bagian: "Capaian dan Tujuan Pembelajaran" },
  { no: 6,  bagian: "Asesmen Diagnostik" },
  { no: 7,  bagian: "Apersepsi dan Pemantik" },
  { no: 8,  bagian: "Materi 1: Kaidah Penjumlahan" },
  { no: 9,  bagian: "Materi 2: Kaidah Perkalian" },
  { no: 10, bagian: "Materi 3: Faktorial" },
  { no: 11, bagian: "Materi 4: Permutasi" },
  { no: null, bagian: "↳ Permutasi r Unsur dari n Unsur" },
  { no: null, bagian: "↳ Permutasi Beberapa Unsur yang Sama" },
  { no: null, bagian: "↳ Permutasi Siklis" },
  { no: 12, bagian: "Materi 5: Kombinasi" },
  { no: 13, bagian: "Aktivitas Siswa" },
  { no: 14, bagian: "Latihan Pemahaman" },
  { no: 15, bagian: "Tantangan Deep Thinking" },
  { no: 16, bagian: "Asesmen Diri Siswa" },
  { no: 17, bagian: "Rangkuman Konsep" },
  { no: 18, bagian: "Glosarium" },
  { no: 19, bagian: "Kunci Jawaban" },
];

function DaftarIsi() {
  return (
    <article className="kp-wrap">
      <h2 className="kp-subtitle text-center">Daftar Isi</h2>

      {/* header */}
      <div className="kp-toc-header">
        <span className="kp-toc-no">No.</span>
        <span className="kp-toc-bagian">Bagian</span>
        <span className="kp-toc-halaman">Hal.</span>
      </div>

      {/* rows */}
      {TOC_DATA.map((item, i) => (
        <div key={i} className="kp-toc-row">
          <span className="kp-toc-no">{item.no != null ? `${item.no}.` : ""}</span>
          <span className="kp-toc-bagian">
            <span className="kp-toc-label">{item.bagian}</span>
          </span>
          <span className="kp-toc-halaman"></span>
        </div>
      ))}
    </article>
  );
}

const PETUNJUK_SISWA = [
  "Bacalah setiap bagian modul secara berurutan karena setiap konsep dibangun di atas konsep sebelumnya.",
  "Untuk bisa lanjut ke bagian berikutnya, kamu harus menjawab dengan benar setiap pertanyaan yang ada di bagian modul.",
  "Jawablah setiap ada pertanyaan di bagian modul menurut sepengetahuanmu.",
  "Jika jawabanmu salah, maka akan ada umpan balik yang akan membantumu menjawab dengan benar.",
  "Ketika menemukan bagian yang sulit, diskusikan dengan teman atau guru atau kamu juga dapat berdiskusi dengan fitur AI yang ada di dalam modul.",
  "Setelah selesai mengerjakan materi, bukalah fitur Lembar Kerja Siswa dan kerjakan sesuai dengan materi yang kamu selesaikan.",
  "Jawablah sesuai pengetahuanmu dan jika ada jawaban yang salah silahkan diskusikan dengan AI untuk menunjukkan di mana kesalahanmu dan bagaimana seharusnya penyelesaiannya.",
  "Kerjakan setiap Aktivitas dan Refleksi Mini dengan sungguh-sungguh karena ini bukan formalitas, melainkan inti dari belajar.",
  "Untuk mengukur ketercapaian tujuan pembelajaran, silahkan kerjakan soal yang ada di fitur asesmen formatif dan lihat pencapaianmu. Jika pencapaianmu masih kurang silahkan pelajari lagi materinya dan cobalah lagi latihan soalnya.",
  "Setelah menyelesaikan setiap submateri, isi Asesmen Diri dengan jujur.",
  "Kunci jawaban ada di bagian akhir, gunakan untuk mengecek pemahamanmu, bukan untuk menyalin.",
];

const PETUNJUK_GURU = [
  "Modul ini dirancang untuk pembelajaran berpusat pada siswa. Peran guru adalah fasilitator dan pemantik berpikir, bukan sumber informasi tunggal.",
  "Aktivitas eksplorasi sebaiknya dilakukan sebelum penjelasan konsep formal.",
  "Pertanyaan \"Mengapa?\" harus didiskusikan, bukan hanya dibaca.",
  "Latihan Soal dapat digunakan sebagai asesmen formatif maupun tugas mandiri.",
  "Tantangan Deep Thinking cocok untuk pengayaan atau diskusi kelas.",
];

const CARA_BELAJAR_MANDIRI = [
  "Ikuti semua tahapan pada modul.",
  "Gunakan umpan balik yang tertera untuk menyusun kembali jawaban yang benar.",
  "Gunakan fitur AI jika masih kesulitan dalam memahami materi maupun soal.",
  "Jadikan AI sebagai teman belajar dan diskusi, tidak hanya sebagai tempat untuk mencari jawaban soal.",
  "Perhatikan pencapaianmu untuk mengetahui seberapa besar kepahamanmu.",
];

function PetunjukPenggunaan() {
  return (
    <article className="kp-wrap">
      <h2 className="kp-subtitle text-center">Petunjuk Penggunaan Modul</h2>

      <h3 className="kp-greeting">🎓 Untuk Siswa</h3>
      <ol className="kp-list">
        {PETUNJUK_SISWA.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>

      <h3 className="kp-greeting">👩‍🏫 Untuk Guru</h3>
      <ol className="kp-list">
        {PETUNJUK_GURU.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>

      <h3 className="kp-greeting">📖 Cara Belajar Mandiri</h3>
      <ul className="kp-list">
        {CARA_BELAJAR_MANDIRI.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <h3 className="kp-greeting">🔣 Simbol dalam Modul</h3>
      <table className="kp-table">
        <thead>
          <tr>
            <th>Simbol</th>
            <th>Makna</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>💡</td>
            <td>Catatan Penting</td>
          </tr>
          <tr>
            <td>🤔</td>
            <td>Pertanyaan untuk Dipikirkan</td>
          </tr>
          <tr>
            <td>🔍</td>
            <td>Aktivitas Eksplorasi</td>
          </tr>
          <tr>
            <td>📝</td>
            <td>Latihan / Soal</td>
          </tr>
          <tr>
            <td>⚠️</td>
            <td>Peringatan Miskonsepsi Umum</td>
          </tr>
          <tr>
            <td>🌍</td>
            <td>Koneksi Kehidupan Nyata</td>
          </tr>
          <tr>
            <td>🔗</td>
            <td>Hubungan Antar Konsep</td>
          </tr>
          <tr>
            <td>✅</td>
            <td>Refleksi Diri</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

export default function SiswaDashboardPage() {
  return (
    <>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">

      {/* Row 1: Kata Pengantar + Aktivitas (2 kolom) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        {/* === Kolom Kiri: Konten Modul === */}
        <div className="flex flex-col gap-1">
          <ScrollReveal variant="fade-up" delay={0}>
            <KataPengantar />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={120}>
            <DaftarIsi />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={240}>
            <PetunjukPenggunaan />
          </ScrollReveal>
        </div>

        {/* === Kolom Kanan: Aktivitas === */}
        <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
          {/* Aktivitas Kelas */}
          <article className="flex min-h-[270px] flex-col rounded-[28px] border-2 border-brand-600 bg-white p-4 md:h-[270px]">
            <h3
              className="m-0 font-semibold text-brand-600"
              style={{
                fontSize: "var(--right-card-title-size)",
                transition: "font-size var(--right-card-transition-duration) var(--right-card-transition-ease)",
              }}
            >
              Aktivitas Kelas
            </h3>

            <div
              className="mt-2 flex flex-1 flex-col items-center justify-center"
              style={{
                gap: "var(--right-card-activity-gap)",
                transition: "gap var(--right-card-transition-duration) var(--right-card-transition-ease)",
              }}
            >
              <Image
                src="/images/class activity.png"
                alt="Class Activity"
                width={617}
                height={522}
                style={{
                  width: "var(--right-card-activity-image-size)",
                  height: "auto",
                  transition: "width var(--right-card-transition-duration) var(--right-card-transition-ease)",
                }}
              />
              <p
                className="m-0 text-center"
                style={{
                  fontSize: "var(--right-card-text-size)",
                  transition: "font-size var(--right-card-transition-duration) var(--right-card-transition-ease)",
                }}
              >
                Belum ada yang mulai minggu ini
              </p>
              <h3
                className="m-0 whitespace-nowrap text-center font-semibold text-brand-600"
                style={{
                  fontSize: "var(--right-card-highlight-size)",
                  transition: "font-size var(--right-card-transition-duration) var(--right-card-transition-ease)",
                  marginTop: "-4px",
                }}
              >
                Jadilah yang Pertama!
              </h3>
            </div>
          </article>

          {/* Aktivitas Kamu */}
          <article className="relative flex min-h-[270px] flex-col overflow-hidden rounded-[28px] border-2 border-brand-600 bg-white p-4 md:h-[270px]">
            <div className="absolute bottom-0 right-0">
              <Image
                src="/images/my aktivitas.png"
                alt="My Aktivitas"
                width={140}
                height={160}
                className="h-auto w-[120px] sm:w-[140px]"
              />
            </div>

            <div className="relative z-[1] flex h-full w-full flex-col justify-between">
              <div>
                <Image src="/images/book.png" alt="Book" width={64} height={64} />
                <h3
                  className="mb-1 mt-2 font-bold text-brand-600"
                  style={{ fontSize: "var(--right-card-subtitle-size)" }}
                >
                  Aktivitas Kamu
                </h3>
                <p
                  className="m-0 max-w-[220px] leading-relaxed text-zinc-700"
                  style={{ fontSize: "var(--right-card-text-size)" }}
                >
                  Belum ada aktivitas yang kamu lakukan
                </p>
              </div>

              <div className="w-[60px] border-t-[3px] border-brand-600" />

              <Link href="/siswa/materi/kaidah-pencacahan" className="group inline-flex w-fit items-center no-underline">
                <Image
                  src="/icons/green arrow.png"
                  alt="Arrow"
                  width={50}
                  height={50}
                  style={{
                    width: "var(--right-card-arrow-size)",
                    height: "var(--right-card-arrow-size)",
                    transition: "transform 0.3s ease, width var(--right-card-transition-duration) var(--right-card-transition-ease), height var(--right-card-transition-duration) var(--right-card-transition-ease)",
                    marginBottom: "4px",
                  }}
                  className="translate-x-[var(--right-card-arrow-shift)] group-hover:translate-x-[5px] group-hover:scale-105"
                />
                <span
                  className="overflow-hidden whitespace-nowrap font-semibold leading-tight text-brand-600 transition-transform duration-200 group-hover:scale-105 sm:text-xl"
                  style={{
                    fontSize: "var(--right-card-link-size)",
                    opacity: "var(--right-card-link-opacity)",
                    maxWidth: "var(--right-card-link-max-width)",
                    marginLeft: "var(--right-card-link-gap)",
                    transition: "max-width 0.22s ease, margin-left 0.22s ease",
                    marginBottom: "4px",
                  }}
                >
                  Ayo mulai belajar sekarang!
                </span>
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* Row 2: Materi Cards (full width) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materiCards.map((materi) => (
          <Link
            key={materi.id}
            href={materi.href}
            className="flex min-h-[270px] flex-col rounded-[28px] bg-[#DBFFD5] pb-5 pl-6 pr-6 pt-5 md:h-[270px]"
          >
            {/* Header: icon + Materi X */}
            <div className="flex items-center gap-3">
              <Image src="/icons/green materi.png" alt="Materi" width={20} height={20} />
              <h3 className="m-0 text-base font-semibold text-brand-600 sm:text-lg">Materi {materi.id}</h3>
            </div>

            {/* Title */}
            <h2
              className="mt-6 m-0 text-left text-xl font-semibold leading-tight text-brand-600 sm:text-2xl lg:text-3xl"
              style={{ fontSize: "var(--dashboard-heading-size)" }}
            >
              {materi.title}
            </h2>

            {/* Image centered */}
            <div className="mt-3 flex flex-1 items-center justify-center">
              <Image
                src={materi.image}
                alt={materi.alt}
                width={120}
                height={120}
                className="h-auto w-[80px] sm:w-[90px]"
              />
            </div>

            {/* CTA */}
            <div className="group mt-auto inline-flex w-full items-center justify-start gap-3 pt-3 text-right">
              <span className="text-base font-semibold text-brand-600 transition-transform duration-200 group-hover:scale-105 sm:text-lg">
                Ayo, mulai belajar!
              </span>
              <Image
                src="/icons/green arrow.png"
                alt="Mulai"
                width={36}
                height={36}
                className="h-9 w-9 transition-transform duration-200 group-hover:translate-x-1"
              />
            </div>
          </Link>
        ))}
      </section>

    </div>
    </>
  );
}
