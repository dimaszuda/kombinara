import Link from "next/link";
import Image from "next/image";
import { MATERI_CARDS } from "@/lib/data/siswa-dashboard"

export default function MateriListPage() {
  return (
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
  )
}
