import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MATERI_CARDS } from "@/lib/data/siswa-dashboard";
import SectionHeading from "./SectionHeading";

export default function MateriSection() {
  return (
    <section id="materi" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Materi"
            title="Empat materi, satu alur belajar yang utuh"
            description="Setiap materi dibangun bertahap: berangkat dari situasi nyata, menemukan polanya sendiri, lalu memahami rumusnya."
          />
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MATERI_CARDS.map((materi, index) => (
            <ScrollReveal key={materi.id} delay={index * 100}>
              <article className="flex h-full flex-col rounded-[28px] bg-[#DBFFD5] p-6">
                <span className="text-sm font-semibold text-[#346739]">Materi {materi.id}</span>
                <h3 className="mt-2 text-xl font-bold leading-tight text-[#346739]">{materi.title}</h3>
                <div className="my-5 flex flex-1 items-center justify-center">
                  <Image src={materi.image} alt="" width={120} height={120} className="h-auto w-[88px]" />
                </div>
                <p className="text-sm leading-relaxed text-[#2C2C2A]">{materi.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
