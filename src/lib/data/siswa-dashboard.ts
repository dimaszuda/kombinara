export const MATERI_CARDS = [
  {
    id: "1",
    title: "Kaidah Pencacahan",
    href: "/siswa/activity/kaidah-pencacahan",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
    image: "/images/Kaidah pencacahan.png",
    alt: "Kaidah Pencacahan",
  },
  {
    id: "2",
    title: "Permutasi",
    href: "/siswa/activity/permutasi",
    description:
      "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
    image: "/images/permutasi.png",
    alt: "Permutasi",
  },
  {
    id: "3",
    title: "Kombinasi",
    href: "/siswa/activity/kombinasi",
    description:
      "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
    image: "/images/kombinasi.png",
    alt: "Kombinasi",
  },
];

export const TOC_DATA = [
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

export const PETUNJUK_SISWA = [
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

export const PETUNJUK_GURU = [
  "Modul ini dirancang untuk pembelajaran berpusat pada siswa. Peran guru adalah fasilitator dan pemantik berpikir, bukan sumber informasi tunggal.",
  "Aktivitas eksplorasi sebaiknya dilakukan sebelum penjelasan konsep formal.",
  "Pertanyaan \"Mengapa?\" harus didiskusikan, bukan hanya dibaca.",
  "Latihan Soal dapat digunakan sebagai asesmen formatif maupun tugas mandiri.",
  "Tantangan Deep Thinking cocok untuk pengayaan atau diskusi kelas.",
];

export const CARA_BELAJAR_MANDIRI = [
  "Ikuti semua tahapan pada modul.",
  "Gunakan umpan balik yang tertera untuk menyusun kembali jawaban yang benar.",
  "Gunakan fitur AI jika masih kesulitan dalam memahami materi maupun soal.",
  "Jadikan AI sebagai teman belajar dan diskusi, tidak hanya sebagai tempat untuk mencari jawaban soal.",
  "Perhatikan pencapaianmu untuk mengetahui seberapa besar kepahamanmu.",
];

export const TUJUAN_PEMBELAJARAN = [
  "Melalui eksplorasi kontekstual, siswa mampu <b>menjelaskan perbedaan konseptual</b> antara aturan penjumlahan dan aturan perkalian beserta alasan penggunaannya dengan menggunakan representasi verbal maupun visual secara tepat.",
  "Melalui eksplorasi pola perkalian beruntun, siswa mampu <b>menjelaskan faktorial</b> sebagai notasi matematis yang muncul secara alami dari aturan perkalian, menghitung nilainya secara efisien termasuk $0! = 1$, dan memposisikannya sebagai alat matematis penunjang permutasi dan kombinasi bukan sebagai kaidah pencacahan tersendiri.",
  "Melalui investigasi daftar susunan dan latihan bertingkat, siswa mampu <b>membangun konsep permutasi</b> secara mandiri sebagai generalisasi urutan perkalian, menerapkan rumus permutasi untuk menyelesaikan masalah kontekstual, serta menjelaskan mengapa urutan diperhatikan dalam permutasi menggunakan argumen yang logis.",
  "Melalui eksplorasi dan analisis perhitungan ganda, siswa mampu <b>membangun konsep kombinasi</b> sebagai koreksi atas permutasi yang tidak memperhatikan urutan, menerapkan rumus kombinasi untuk menyelesaikan masalah kontekstual, serta menjelaskan mengapa kombinasi membagi dengan $r!$ secara bermakna.",
  "Melalui analisis kritis berbagai situasi kontekstual, siswa mampu <b>membedakan penggunaan permutasi dan kombinasi</b> berdasarkan peran urutan dalam konteks soal bukan berdasarkan pengenalan kata tertentu dan membuktikan hubungan matematis antara kombinasi dan permutasi secara konseptual maupun aljabar.",
  "Melalui pemecahan masalah berlapis, siswa mampu mengintegrasikan lebih dari satu konsep kaidah pencacahan secara tepat, memilih strategi penyelesaian yang paling efisien (langsung atau komplemen), dan memvalidasi kebenaran solusinya melalui cara alternatif atau pengecekan kontekstual.",
  "Melalui diskusi dan presentasi kelompok, siswa mampu mengomunikasikan pemahaman konseptualnya termasuk makna konsep, alasan pemilihan metode, dan justifikasi solusi secara lisan maupun tulisan menggunakan bahasa dan notasi matematis yang tepat."
];

export const PEMAHAMAN_MAKNA = [
  "Siswa dapat menjelaskan dengan kata-katanya sendiri bahwa <b>aturan penjumlahan</b> digunakan ketika hanya satu pilihan yang diambil dari beberapa kelompok yang saling lepas, dan <b>aturan perkalian</b> digunakan ketika semua tahap keputusan harus dilalui secara berurutan.",
  "Siswa dapat menjelaskan bahwa <b>faktorial</b> bukan kaidah pencacahan, melainkan notasi matematis yang meringkas perkalian berurutan dan menjelaskan mengapa ia muncul secara alami dari aturan perkalian.",
  "Siswa dapat menjelaskan mengapa $0! = 1$ menggunakan argumen dari sifat rekursif $n! = n \\times (n-1)!$, bukan sekadar menyebut \"itu memang aturannya\".",
  "Siswa dapat menjelaskan mengapa urutan diperhatikan dalam <b>permutasi</b> menggunakan argumen kontekstual yang nyata, bukan sekadar menyebut definisi.",
  "Siswa dapat menjelaskan mengapa urutan tidak diperhatikan dalam <b>kombinasi</b> dan mengapa perbedaan ini mengharuskan pembagian dengan $r!$ bukan melalui manipulasi aljabar, melainkan melalui penjelasan tentang penghitungan ganda yang dikoreksi."
];

export const PEMAHAMAN_RELASI = [
  "Siswa dapat menjelaskan bahwa <b>permutasi</b> adalah generalisasi formal dari aturan perkalian yaitu permutasi muncul ketika aturan perkalian diterapkan pada pemilihan tanpa pengulangan secara berurutan.",
  "Siswa dapat menjelaskan <b>hubungan</b> $C(n,r) = \\frac{P(n,r)}{r!}$ secara bermakna: kombinasi diperoleh dari permutasi dengan menghilangkan pengaruh urutan, sehingga setiap kelompok yang sama tidak dihitung berulang.",
  "Siswa dapat menggambarkan alur logis <b>keterhubungan lima konsep</b> dalam kombinatorika: aturan perkalian &rarr; faktorial &rarr; permutasi &rarr; kombinasi, dan menjelaskan mengapa urutan belajar tersebut bukan kebetulan.",
  "Siswa dapat menjelaskan sifat $C(n,r) = C(n, n-r)$ secara intuitif: memilih $r$ dari $n$ objek secara otomatis berarti menyisakan $n-r$ objek, sehingga jumlah caranya sama.",
  "Siswa dapat menjelaskan hubungan linear bahwa $(n-1)! = \\frac{n!}{n}$ karena setiap susunan melingkar unik dihitung $n$ kali dalam permutasi linear akibat rotasi."
];

export const PEMAHAMAN_KONDISI = [
  "Siswa dapat mengidentifikasi dari konteks soal apakah suatu situasi memerlukan <b>aturan penjumlahan atau perkalian</b>, berdasarkan pertanyaan kunci: \"apakah semua pilihan harus diambil, atau hanya satu?\".",
  "Siswa dapat menentukan apakah suatu masalah memerlukan <b>permutasi atau kombinasi</b> berdasarkan analisis peran urutan dalam konteks bukan berdasarkan kata tertentu dalam soal dan memberikan justifikasi logis atas pilihannya.",
  "Siswa dapat mengenali kapan <b>permutasi</b> unsur yang sama harus digunakan, yaitu ketika ada objek yang identik sehingga sebagian susunan menghasilkan hasil yang tidak berbeda secara visual.",
  "Siswa dapat <b>menentukan kapan strategi komplemen</b> (total dikurangi pengecualian) lebih efisien daripada menghitung langsung, dan menjelaskan alasannya."
];

export const FLEKSIBILITAS_REPRESENTASI = [
  "Siswa dapat merepresentasikan masalah <b>aturan perkalian</b> dalam bentuk diagram pohon dan menunjukkan bahwa hasil perkalian jumlah cabang di tiap tingkat sesuai dengan total pilihan akhir.",
  "Siswa dapat merepresentasikan masalah pencacahan bertahap dalam bentuk <b>visualisasi kotak pengisian tempat</b>, mengisi banyaknya pilihan di setiap kotak, dan menggunakannya sebagai jembatan menuju penulisan formal.",
  "Siswa dapat menyajikan <b>masalah kombinasi</b> dengan syarat dalam bentuk tabel kasus yang terstruktur, dan menjelaskan mengapa setiap baris tabel mewakili kasus yang berbeda.",
  "Siswa dapat berpindah secara fleksibel antara <b>representasi verbal</b> (konteks soal), diagram/tabel (visualisasi), dan simbolik (rumus), serta menjelaskan apa yang diwakili oleh setiap representasi."
];

export const GENERALISASI = [
  "Siswa dapat membangun <b>rumus faktorial</b> secara mandiri dari pola tabel perkalian berurutan ($1 \\times 1$, $2 \\times 1$, $3 \\times 2 \\times 1$, ...), bukan sekadar menerima rumus dari guru.",
  "Siswa dapat membangun rumus permutasi linear $\\frac{n!}{(n-r)!}$, <b>rumus permutasi</b> siklis $(n-1)!$, dan rumus permutasi dari generalisasi aturan perkalian bertahap tanpa pengulangan, dan memverifikasi bahwa hasilnya setara.",
  "Siswa dapat membangun <b>rumus kombinasi</b> dari eksplorasi daftar kelompok, menemukan sendiri bahwa setiap kelompok dihitung sebanyak $r!$ kali dalam permutasi, dan menyimpulkan rumus $C(n,r) = \\frac{P(n,r)}{r!}$.",
  "Siswa dapat membuat konjektur berdasarkan pola yang diamati misalnya \"nilai kombinasi tidak pernah melebihi permutasi untuk nilai $n$ dan $r$ yang sama\" dan memverifikasinya secara matematis."
];
