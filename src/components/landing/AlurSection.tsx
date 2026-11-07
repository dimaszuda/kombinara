import { ScrollReveal } from "@/components/ui/ScrollReveal";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    title: "Asesmen Diagnostik",
    description: "Cek kesiapan materi prasyarat dulu, supaya kamu mulai dari pijakan yang tepat.",
  },
  {
    title: "Apersepsi & Pemantik",
    description: "Pertanyaan pemanasan yang memancing rasa ingin tahu sebelum masuk ke materi.",
  },
  {
    title: "Materi Bertahap",
    description:
      "Eksplorasi kontekstual, aktivitas deep learning, penjelasan konsep, contoh soal bertahap, dan refleksi. Bagian berikutnya terbuka setelah bagian sebelumnya selesai.",
  },
  {
    title: "Aktivitas & Latihan",
    description:
      "Aktivitas individu dan kelompok, lalu latihan pemahaman yang menilai cara berpikir sekaligus jawaban akhirmu.",
  },
  {
    title: "Halaman Penutup",
    description: "Soal tantangan, asesmen diri, dan refleksi mendalam untuk menutup perjalanan belajarmu.",
  },
];

export default function AlurSection() {
  return (
    <section id="alur" className="scroll-mt-20 bg-[#F5F5F0] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Alur Belajar"
            title="Belajar selangkah demi selangkah"
            description="Kombinara menyusun pengalaman belajar seperti modul yang dipandu guru, dari mengenali kesiapanmu sampai merefleksikan apa yang sudah kamu pahami."
          />
        </ScrollReveal>

        <ol className="mt-12 grid gap-6 lg:grid-cols-5 lg:gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              {/* Garis penghubung ke langkah berikutnya (desktop) */}
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-9 top-[17px] hidden h-0.5 w-[calc(100%-1.25rem)] bg-[#34673933] lg:block"
                />
              )}
              <ScrollReveal delay={index * 100} className="flex gap-4 lg:flex-col lg:gap-0">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#346739] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div className="lg:mt-4 lg:pr-4">
                  <h3 className="text-base font-bold text-[#2C2C2A]">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B66]">{step.description}</p>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
