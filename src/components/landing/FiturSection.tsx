import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import SectionHeading from "./SectionHeading";
import { IconChat, IconCheck, IconDevices, IconDownload, IconHistory, IconSteps } from "./icons";

const FEATURES: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <IconChat />,
    title: "Tanya Kombi kapan saja",
    description:
      "Blok teks di materi lalu tanyakan ke Kombi. Kombi membantumu berpikir, bukan memberikan jawaban jadi.",
  },
  {
    icon: <IconSteps />,
    title: "Terbuka bertahap",
    description: "Materi terbuka sesuai urutan, sehingga setiap konsep dibangun di atas konsep sebelumnya.",
  },
  {
    icon: <IconCheck />,
    title: "Umpan balik langsung",
    description: "Jawabanmu langsung diperiksa dan diberi masukan, termasuk jawaban berupa alasan atau penjelasan.",
  },
  {
    icon: <IconHistory />,
    title: "Lihat lagi jawabanmu",
    description: "Bagian yang sudah selesai bisa dibuka ulang lengkap dengan jawaban dan umpan balik yang kamu terima.",
  },
  {
    icon: <IconDownload />,
    title: "Unduh modul PDF",
    description: "Modul versi PDF bisa diunduh setelah kamu menyelesaikan bagian yang dipersyaratkan.",
  },
  {
    icon: <IconDevices />,
    title: "Di HP maupun laptop",
    description: "Tampilan menyesuaikan perangkatmu, jadi kamu bisa belajar di kelas maupun di rumah.",
  },
];

export default function FiturSection() {
  return (
    <section id="fitur" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Fitur"
            title="Dirancang supaya kamu benar-benar paham"
            description="Bukan sekadar membaca materi, tapi mencoba, mendapat umpan balik, dan merefleksikan cara berpikirmu."
          />
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={(index % 3) * 100}>
              <article className="h-full rounded-2xl border border-[#34673926] bg-white p-6 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBFFD5] text-[#346739]">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#2C2C2A]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B6B66]">{feature.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
