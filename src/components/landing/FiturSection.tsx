import SectionHeading from "./SectionHeading";

const KOMBI_STEPS = [
  "Blok kalimat di materi yang belum kamu pahami.",
  "Pilih Tanya AI.",
  "Baca petunjuk dari Kombi, lalu coba lagi.",
];

// "Terbuka bertahap" sudah dijelaskan di Alur; "Di HP maupun laptop" ditahan sampai aktivitas drag di Permutasi bisa dikerjakan dengan sentuhan.
const OTHER_FEATURES = [
  {
    title: "Umpan balik langsung",
    description: "Jawabanmu, termasuk alasan dan penjelasan yang kamu tulis, langsung mendapat masukan.",
  },
  {
    title: "Lihat lagi jawabanmu",
    description: "Bagian yang sudah selesai bisa dibuka ulang lengkap dengan jawaban dan umpan balik yang kamu terima.",
  },
  {
    title: "Unduh modul PDF",
    description: "Modul versi PDF bisa diunduh setelah kamu menyelesaikan bagian yang dipersyaratkan.",
  },
];

export default function FiturSection() {
  return (
    <section id="fitur" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading title="Yang kamu dapat di setiap materi" />

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <article className="rounded-[28px] bg-[#DBFFD5] p-6 sm:p-8">
            <h3 className="text-xl font-bold leading-tight text-[#346739] sm:text-2xl">
              Tanya Kombi saat bingung
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#2C2C2A]">
              Kombi memberi petunjuk supaya kamu menemukan jawabannya sendiri.
            </p>
            <ol className="mt-6 space-y-3">
              {KOMBI_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#2C2C2A] sm:text-base">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#346739] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </article>

          <ul className="divide-y divide-[#34673926] border-y border-[#34673926]">
            {OTHER_FEATURES.map((feature) => (
              <li key={feature.title} className="py-5">
                <h3 className="text-lg font-bold text-[#2C2C2A]">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B66]">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
