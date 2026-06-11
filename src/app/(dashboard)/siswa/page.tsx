"use client";

import Image from "next/image";
import Link from "next/link";

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

export default function SiswaDashboardPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,730px)_minmax(300px,1fr)]">
      <section className="flex flex-col gap-4">
        {materiCards.map((materi) => (
          <Link
            href={materi.id}
            className="flex min-h-[270px] flex-col rounded-[28px] bg-[#DBFFD5] pb-5 pl-6 pr-4 pt-5 sm:pl-7 sm:pr-5 md:h-[270px]"
          >
            <div className="flex items-center gap-3">
              <Image src="/icons/green materi.png" alt="Materi" width={20} height={20} />
              <h3 className="m-0 text-lg font-semibold text-brand-600 sm:text-xl">Materi {materi.id}</h3>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-2xl font-semibold leading-tight text-brand-600 sm:text-3xl lg:text-4xl">{materi.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-800 sm:text-[15px]">{materi.description}</p>
              </div>
              <div className="mx-auto self-center sm:mx-0 sm:self-start">
                <Image src={materi.image} alt={materi.alt} width={120} height={120} className="h-auto w-[96px] sm:w-[110px]" />
              </div>
            </div>

            <Link href={materi.href} className="group mt-auto inline-flex w-full items-center justify-end gap-3 pt-3 text-right no-underline">
              <span className="text-lg font-semibold text-brand-600 transition-transform duration-200 group-hover:scale-105 sm:text-xl">
                Ayo, mulai belajar!
              </span>
              <Image
                src="/icons/green arrow.png"
                alt="Mulai"
                width={36}
                height={36}
                className="h-9 w-9 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-4">
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
      </section>
    </div>
  );
}
