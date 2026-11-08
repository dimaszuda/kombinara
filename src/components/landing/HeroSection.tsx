import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "./icons";

export default function HeroSection() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-[#2C2C2A] sm:text-5xl">
            Pahami kombinatorika,{" "}
            <span className="text-[#346739]">bukan sekadar menghafal rumus.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6B6B66] sm:text-lg">
            Kombinara adalah e-modul interaktif untuk SMA. Kamu belajar Kaidah Pencacahan, Faktorial, Permutasi, dan
            Kombinasi lewat soal dari situasi sehari-hari, ditemani Kombi, asisten AI di setiap materi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/join"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              Gabung dengan Kode Kelas
              <IconArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#346739] bg-white px-8 py-3 text-base font-medium text-[#346739] transition-colors hover:bg-[#F3FFF1] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
            >
              Masuk
            </Link>
          </div>
          <p className="mt-3 text-sm text-[#6B6B66]">Belum punya kode kelas? Minta ke guru matematikamu.</p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[440px]">
            <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] bg-[#DBFFD5]" />
            {/* Potong sisi kanan poster (x 560-1188, y 390-1230): hanya adegan meja bundar, tanpa wordmark, tagline, dan badge yang tertanam di poster. */}
            <div className="relative aspect-[628/840] overflow-hidden rounded-[28px]">
              <Image
                src="/images/kombinara-banner.png"
                alt="Ilustrasi siswa duduk mengelilingi meja bundar bertanda n, 1, 2, dan n-1, gambaran permutasi siklis"
                width={1188}
                height={1324}
                priority
                sizes="(min-width: 1024px) 832px, 189vw"
                className="absolute left-[-89.17%] top-[-46.43%] h-auto w-[189.17%] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
