"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RichText } from "@/components/shared/RichText";
import {
  MATERI_CARDS,
  TOC_DATA,
  PETUNJUK_SISWA,
  PETUNJUK_GURU,
  CARA_BELAJAR_MANDIRI,
  TUJUAN_PEMBELAJARAN,
  KAIDAH_PENJUMLAHAN_PERKALIAN,
  FAKTORIAL,
  PERMUTASI,
  KOMBINASI,
  MEMBEDAKAN_PERMUTASI_DAN_KOMBINASI,
  PEMECAHAN_MASALAH_BERLAPIS,
  KOMUNIKASI,
  INDIKATOR_PEMAHAMAN_KONSEP
} from "@/lib/data/siswa-dashboard";

function KataPengantar() {
  return (
    <article className="kp-wrap">
        <p className="kp-badge">📒 Modul Pembelajaran Matematika</p>
        <h2 className="kp-subtitle">Kaidah Pencacahan (Kombinatorika)</h2>
        <p className="kp-tagline">&ldquo;Menghitung Tanpa Bingung, Berpikir Tanpa Batas&rdquo;</p>
        <p className="kp-meta">Matematika &nbsp;·&nbsp; Kelas XII SMA &nbsp;·&nbsp; Kurikulum Merdeka</p>


        <blockquote className="kp-quote">
          &ldquo;Matematika bukan tentang menghafal rumus — melainkan tentang memahami pola, bernalar dengan logika, dan melihat keajaiban angka dalam kehidupan nyata.&rdquo;
        </blockquote>

        <hr className="kp-divider" />

        <p className="kp-section-label">Kata Pengantar</p>
        <h3 className="kp-greeting">Halo, Pelajar Hebat! 👋</h3>

        <p className="kp-body">
          Pernahkah kamu bertanya-tanya: <b>berapa banyak kemungkinan password yang bisa kamu buat?</b> Atau{' '}
          <b>berapa cara berbeda tim sepak bola bisa dibentuk dari sekumpulan pemain?</b> Bahkan pertanyaan
          sederhana seperti <b>&ldquo;berapa banyak pilihan outfit yang bisa kupakai minggu ini?&rdquo;</b> ternyata bisa
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
      <hr className="kp-divider" />
    </article>
  );
}

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
      <hr className="kp-divider" />
    </article>
  );
}

function PetaKonsep() {
  return (
    <article className="kp-wrap">
      <h2 className="kp-subtitle text-center">Peta Konsep</h2>
      <Image
        src="/images/peta-konsep.svg"
        alt="Peta Konsep"
        width={673}
        height={712}
        className="mt-8"
      />
      <blockquote className="kp-quote text-justify">
        🔗 <b>Koneksi Kunci</b>: Faktorial bukan kaidah pencacahan — ia adalah <b>alat matematis</b> yang mempersingkat penulisan perkalian berurutan. Tanpa faktorial, rumus permutasi dan kombinasi tidak bisa ditulis secara ringkas. Itulah mengapa ia dipelajari sebagai <b>jembatan</b>, bukan sebagai aturan pencacahan tersendiri.
      </blockquote>
      <hr className="kp-divider" />
    </article>
  )
}

function TujuanPembelajaran() {
  return (
    <article className="kp-wrap">
      <h2 className="kp-subtitle text-center">Capaian dan Tujuan Pembelajaran</h2>
      <h3 className="kp-greeting">Capaian Pembelajaran (CP)</h3>
      <p className="kp-body">
        <b>Pada akhir fase F, siswa memiliki kemampuan</b> melakukan proses penyelidikan statistika untuk mengidentifikasi dan menjelaskan asosiasi antara dua variabel kategorikal (kualitatif) dan antara dua variabel numerik (kuantitatif); memperkirakan model linear terbaik (best fit linear) pada data numerik (kuantitatif); membedakan sebab-akibat; hubungan menjelaskan asosiasi peluang dan dan menentukan frekuensi harapan dari kejadian majemuk; menyelidiki konsep dari kejadian saling bebas dan saling lepas, dan menentukan peluangnya; serta memahami konsep peluang bersyarat dan kejadian yang saling bebas <b>menggunakan konsep permutasi dan kombinasi.</b>
      </p>
      <h3 className="kp-greeting">Tujuan Pembelajaran (TP)</h3>
      <p className="kp-body">Setelah mempelajari modul ini, diharapkan:</p>
      <ol className="kp-list">
        {TUJUAN_PEMBELAJARAN.map((item, i) => (
          <li key={i}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting">Indikator Keberhasilan</h3>
      <h3 className="kp-greeting text-bold">1. Kaidah Penjumlahan dan Perkalian</h3>
      <ol className="kp-list">
        {KAIDAH_PENJUMLAHAN_PERKALIAN.map((item, i) => (
          <li key={`1.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">2. Faktorial</h3>
      <ol className="kp-list">
        {FAKTORIAL.map((item, i) => (
          <li key={`2.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">3. Permutasi</h3>
      <ol className="kp-list">
        {PERMUTASI.map((item, i) => (
          <li key={`3.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">4. Kombinasi</h3>
      <ol className="kp-list">
        {KOMBINASI.map((item, i) => (
          <li key={`4.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">5. Membedakan Permutasi dan Kombinasi</h3>
      <ol className="kp-list">
        {MEMBEDAKAN_PERMUTASI_DAN_KOMBINASI.map((item, i) => (
          <li key={`5.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">6. Pemecahan Masalah Berlapis</h3>
      <ol className="kp-list">
        {PEMECAHAN_MASALAH_BERLAPIS.map((item, i) => (
          <li key={`5.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">7. Komunikasi</h3>
      <ol className="kp-list">
        {KOMUNIKASI.map((item, i) => (
          <li key={`5.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>

      {/* Tabel Indikator Pemahaman Konsep */}
      <h3 className="kp-greeting" style={{marginTop: '2rem'}}>Kode Indikator Pemahaman Konsep</h3>
      <table className="kp-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Indikator Pemahaman Konsep</th>
            <th>Tujuan Pembelajaran</th>
          </tr>
        </thead>
        <tbody>
          {INDIKATOR_PEMAHAMAN_KONSEP.map((item) => (
            <tr key={item.kode}>
              <td><strong>{item.kode}</strong></td>
              <td>{item.indikator}</td>
              <td>{item.tp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="kp-divider" />
    </article>
  )
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
          <ScrollReveal variant="fade-up" delay={360}>
            <PetaKonsep/>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={480}>
            <TujuanPembelajaran/>
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
        {MATERI_CARDS.map((materi) => (
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
