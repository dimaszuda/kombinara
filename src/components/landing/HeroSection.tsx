import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { IconArrowRight } from "./icons";

const HIGHLIGHTS = [
  { value: "4", label: "materi" },
  { value: "7", label: "konsep" },
  { value: "1", label: "alur bertahap" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Aksen latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#DBFFD5] opacity-60 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <ScrollReveal variant="fade-up">
          <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
            E-Modul Interaktif Kombinatorika SMA
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-[#2C2C2A] sm:text-5xl">
            Pahami kombinatorika,{" "}
            <span className="text-[#346739]">bukan sekadar menghafal rumus.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6B6B66] sm:text-lg">
            Kombinara memandu kamu belajar Kaidah Pencacahan, Faktorial, Permutasi, dan Kombinasi lewat
            situasi sehari-hari, aktivitas interaktif, dan umpan balik langsung, ditemani Kombi, teman belajar
            berbasis AI.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              Masuk
              <IconArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#346739] bg-white px-8 py-3 text-base font-medium text-[#346739] transition-colors hover:bg-[#F3FFF1] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              Gabung dengan Kode Kelas
            </Link>
          </div>
          <p className="mt-3 text-sm text-[#8A8A8A]">Belum punya kode kelas? Minta ke guru matematikamu.</p>

          <dl className="mt-10 flex gap-8">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-3xl font-bold text-[#346739]">{item.value}</dd>
                <dd className="text-sm text-[#6B6B66]">{item.label}</dd>
              </div>
            ))}
          </dl>
        </ScrollReveal>

        <ScrollReveal variant="fade-left" delay={150} className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[440px]">
            <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] bg-[#DBFFD5]" />
            <Image
              src="/images/kombinara-banner.png"
              alt="Ilustrasi Kombinara: siswa belajar kombinatorika bersama di meja bundar"
              width={1188}
              height={1324}
              priority
              sizes="(min-width: 1024px) 440px, 90vw"
              className="relative h-auto w-full rounded-[28px] shadow-xl"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
