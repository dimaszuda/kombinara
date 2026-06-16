"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RichText } from "@/components/shared/RichText";

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
      <hr className="kp-divider" />
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

const TUJUAN_PEMBELAJARAN = [
  "Melalui eksplorasi kontekstual, siswa mampu <b>menjelaskan perbedaan konseptual</b> antara aturan penjumlahan dan aturan perkalian beserta alasan penggunaannya dengan menggunakan representasi verbal maupun visual secara tepat.",
  "Melalui eksplorasi pola perkalian beruntun, siswa mampu <b>menjelaskan faktorial</b> sebagai notasi matematis yang muncul secara alami dari aturan perkalian, menghitung nilainya secara efisien termasuk $0! = 1$, dan memposisikannya sebagai alat matematis penunjang permutasi dan kombinasi bukan sebagai kaidah pencacahan tersendiri.",
  "Melalui investigasi daftar susunan dan latihan bertingkat, siswa mampu <b>membangun konsep permutasi</b> secara mandiri sebagai generalisasi urutan perkalian, menerapkan rumus permutasi untuk menyelesaikan masalah kontekstual, serta menjelaskan mengapa urutan diperhatikan dalam permutasi menggunakan argumen yang logis.",
  "Melalui eksplorasi dan analisis perhitungan ganda, siswa mampu <b>membangun konsep kombinasi</b> sebagai koreksi atas permutasi yang tidak memperhatikan urutan, menerapkan rumus kombinasi untuk menyelesaikan masalah kontekstual, serta menjelaskan mengapa kombinasi membagi dengan $r!$ secara bermakna.",
  "Melalui analisis kritis berbagai situasi kontekstual, siswa mampu <b>membedakan penggunaan permutasi dan kombinasi</b> berdasarkan peran urutan dalam konteks soal bukan berdasarkan pengenalan kata tertentu dan membuktikan hubungan matematis antara kombinasi dan permutasi secara konseptual maupun aljabar.",
  "Melalui pemecahan masalah berlapis, siswa mampu mengintegrasikan lebih dari satu konsep kaidah pencacahan secara tepat, memilih strategi penyelesaian yang paling efisien (langsung atau komplemen), dan memvalidasi kebenaran solusinya melalui cara alternatif atau pengecekan kontekstual.",
  "Melalui diskusi dan presentasi kelompok, siswa mampu mengomunikasikan pemahaman konseptualnya termasuk makna konsep, alasan pemilihan metode, dan justifikasi solusi secara lisan maupun tulisan menggunakan bahasa dan notasi matematis yang tepat."
]

const PEMAHAMAN_MAKNA = [
  "Siswa dapat menjelaskan dengan kata-katanya sendiri bahwa <b>aturan penjumlahan</b> digunakan ketika hanya satu pilihan yang diambil dari beberapa kelompok yang saling lepas, dan <b>aturan perkalian</b> digunakan ketika semua tahap keputusan harus dilalui secara berurutan.",
  "Siswa dapat menjelaskan bahwa <b>faktorial</b> bukan kaidah pencacahan, melainkan notasi matematis yang meringkas perkalian berurutan dan menjelaskan mengapa ia muncul secara alami dari aturan perkalian.",
  "Siswa dapat menjelaskan mengapa $0! = 1$ menggunakan argumen dari sifat rekursif $n! = n \\times (n-1)!$, bukan sekadar menyebut \"itu memang aturannya\".",
  "Siswa dapat menjelaskan mengapa urutan diperhatikan dalam <b>permutasi</b> menggunakan argumen kontekstual yang nyata, bukan sekadar menyebut definisi.",
  "Siswa dapat menjelaskan mengapa urutan tidak diperhatikan dalam <b>kombinasi</b> dan mengapa perbedaan ini mengharuskan pembagian dengan $r!$ bukan melalui manipulasi aljabar, melainkan melalui penjelasan tentang penghitungan ganda yang dikoreksi."
]

const PEMAHAMAN_RELASI = [
  "Siswa dapat menjelaskan bahwa <b>permutasi</b> adalah generalisasi formal dari aturan perkalian yaitu permutasi muncul ketika aturan perkalian diterapkan pada pemilihan tanpa pengulangan secara berurutan.",
  "Siswa dapat menjelaskan <b>hubungan</b> $C(n,r) = \\frac{P(n,r)}{r!}$ secara bermakna: kombinasi diperoleh dari permutasi dengan menghilangkan pengaruh urutan, sehingga setiap kelompok yang sama tidak dihitung berulang.",
  "Siswa dapat menggambarkan alur logis <b>keterhubungan lima konsep</b> dalam kombinatorika: aturan perkalian &rarr; faktorial &rarr; permutasi &rarr; kombinasi, dan menjelaskan mengapa urutan belajar tersebut bukan kebetulan.",
  "Siswa dapat menjelaskan sifat $C(n,r) = C(n, n-r)$ secara intuitif: memilih $r$ dari $n$ objek secara otomatis berarti menyisakan $n-r$ objek, sehingga jumlah caranya sama.",
  "Siswa dapat menjelaskan hubungan linear bahwa $(n-1)! = \\frac{n!}{n}$ karena setiap susunan melingkar unik dihitung $n$ kali dalam permutasi linear akibat rotasi."
]

const PEMAHAMAN_KONDISI = [
  "Siswa dapat mengidentifikasi dari konteks soal apakah suatu situasi memerlukan <b>aturan penjumlahan atau perkalian</b>, berdasarkan pertanyaan kunci: \"apakah semua pilihan harus diambil, atau hanya satu?\".",
  "Siswa dapat menentukan apakah suatu masalah memerlukan <b>permutasi atau kombinasi</b> berdasarkan analisis peran urutan dalam konteks bukan berdasarkan kata tertentu dalam soal dan memberikan justifikasi logis atas pilihannya.",
  "Siswa dapat mengenali kapan <b>permutasi</b> unsur yang sama harus digunakan, yaitu ketika ada objek yang identik sehingga sebagian susunan menghasilkan hasil yang tidak berbeda secara visual.",
  "Siswa dapat <b>menentukan kapan strategi komplemen</b> (total dikurangi pengecualian) lebih efisien daripada menghitung langsung, dan menjelaskan alasannya."
]

const FLEKSIBILITAS_REPRESENTASI = [
  "Siswa dapat merepresentasikan masalah <b>aturan perkalian</b> dalam bentuk diagram pohon dan menunjukkan bahwa hasil perkalian jumlah cabang di tiap tingkat sesuai dengan total pilihan akhir.",
  "Siswa dapat merepresentasikan masalah pencacahan bertahap dalam bentuk <b>visualisasi kotak pengisian tempat</b>, mengisi banyaknya pilihan di setiap kotak, dan menggunakannya sebagai jembatan menuju penulisan formal.",
  "Siswa dapat menyajikan <b>masalah kombinasi</b> dengan syarat dalam bentuk tabel kasus yang terstruktur, dan menjelaskan mengapa setiap baris tabel mewakili kasus yang berbeda.",
  "Siswa dapat berpindah secara fleksibel antara <b>representasi verbal</b> (konteks soal), diagram/tabel (visualisasi), dan simbolik (rumus), serta menjelaskan apa yang diwakili oleh setiap representasi."
]

const GENERALISASI = [
  "Siswa dapat membangun <b>rumus faktorial</b> secara mandiri dari pola tabel perkalian berurutan ($1 \\times 1$, $2 \\times 1$, $3 \\times 2 \\times 1$, ...), bukan sekadar menerima rumus dari guru.",
  "Siswa dapat membangun rumus permutasi linear $\\frac{n!}{(n-r)!}$, <b>rumus permutasi</b> siklis $(n-1)!$, dan rumus permutasi dari generalisasi aturan perkalian bertahap tanpa pengulangan, dan memverifikasi bahwa hasilnya setara.",
  "Siswa dapat membangun <b>rumus kombinasi</b> dari eksplorasi daftar kelompok, menemukan sendiri bahwa setiap kelompok dihitung sebanyak $r!$ kali dalam permutasi, dan menyimpulkan rumus $C(n,r) = \\frac{P(n,r)}{r!}$.",
  "Siswa dapat membuat konjektur berdasarkan pola yang diamati misalnya \"nilai kombinasi tidak pernah melebihi permutasi untuk nilai $n$ dan $r$ yang sama\" dan memverifikasinya secara matematis."
]

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
      <h3 className="kp-greeting text-bold">1. Pemahaman Makna Konsep</h3>
      <p className="kp-body">Siswa memahami apa yang diwakili oleh suatu konsep dan mengapa konsep itu ada, bukan sekadar mengetahui rumusnya.</p>
      <ol className="kp-list">
        {PEMAHAMAN_MAKNA.map((item, i) => (
          <li key={`1.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">2. Pemahaman Relasi Antar Konsep</h3>
      <p className="kp-body">Siswa mengenali keterkaitan antar konsep dalam kombinatorika dan memahami alur logis yang menghubungkannya.</p>
      <ol className="kp-list">
        {PEMAHAMAN_RELASI.map((item, i) => (
          <li key={`2.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">3. Pemahaman Kondisi Penggunaan</h3>
      <p className="kp-body">Siswa mengetahui kapan suatu konsep tepat digunakan dan dapat memberikan justifikasi atas pilihannya.</p>
      <ol className="kp-list">
        {PEMAHAMAN_KONDISI.map((item, i) => (
          <li key={`3.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">4. Fleksibilitas Representasi</h3>
      <p className="kp-body">Siswa dapat menyajikan konsep kombinatorika dalam berbagai bentuk representasi dan berpindah di antara representasi tersebut secara fleksibel.</p>
      <ol className="kp-list">
        {FLEKSIBILITAS_REPRESENTASI.map((item, i) => (
          <li key={`4.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
      <h3 className="kp-greeting text-bold">5. Generalisasi</h3>
      <p className="kp-body">Siswa mampu membangun pemahaman umum dari pola yang ditemukan dalam kasus-kasus konkret.</p>
      <ol className="kp-list">
        {GENERALISASI.map((item, i) => (
          <li key={`5.${i}`}><RichText>{item}</RichText></li>
        ))}
      </ol>
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
