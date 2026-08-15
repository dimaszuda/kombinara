/**
 * Shared ground truth + deterministic matchers untuk evaluasi Asesmen Formatif.
 *
 * Dipakai oleh:
 * - `src/app/api/asesmen-formatif/evaluate/route.ts` (evaluasi live)
 * - `scripts/re-grade-faktorial.ts` (re-grading jawaban lama)
 *
 * Perhatian: data di sini adalah SATU-SATUNYA sumber kebenaran kunci jawaban.
 */

export type SoalItem = {
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk AI evaluation). */
  cara: string;
};

// ─── Kaidah Pencacahan (default) ────────────────────────────────────────────────
export const SOAL_KAIDAH_PENCACAHAN: SoalItem[] = [
  {
    question_number: 1, level: "mudah",
    question: "Dari kota A ke kota B tersedia transportasi 5 bus, 10 mobil travel, 4 kereta, dan 2 pesawat terbang. Berapa banyak cara Anda dapat bepergian dari kota A ke kota B?",
    answer: "21",
    cara: "Kaidah Penjumlahan: tersedia 5 bus + 10 mobil travel + 4 kereta + 2 pesawat = 5 + 10 + 4 + 2 = 21 cara.",
  },
  {
    question_number: 2, level: "mudah",
    question: "Di kelas XI terdapat 40 siswa, 15 siswa diantaranya perempuan. Berapa banyak cara untuk memilih seorang perempuan dan seorang laki–laki sebagai wakil dari kelas XI?",
    answer: "375",
    cara: "Kaidah Perkalian: memilih 1 perempuan dari 15 × memilih 1 laki-laki dari (40 − 15 = 25) → 15 × 25 = 375 cara.",
  },
  {
    question_number: 3, level: "mudah",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil?",
    answer: "20",
    cara: "Kaidah Perkalian: A → B ada 4 jalur, B → C ada 5 jalur → 4 × 5 = 20 rute.",
  },
  {
    question_number: 4, level: "menengah",
    question: "Suatu kelas ada 10 siswa yang dijadikan kandidat pengurus kelas sebagai ketua, sekretaris, dan bendahara kelas. Jika tidak boleh ada jabatan yang dirangkap, berapa banyak cara yang bisa dilakukan dalam pemilihan tersebut?",
    answer: "720",
    cara: "Kaidah Perkalian (pengisian tempat / permutasi): ketua 10 pilihan, sekretaris 9 pilihan, bendahara 8 pilihan → 10 × 9 × 8 = 720 cara.",
  },
  {
    question_number: 5, level: "menengah",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur. Ani melakukan perjalanan dari kota A ke kota C melalui kota B lalu kembali lagi ke kota A juga melalui kota B. Berapa banyak rute perjalanan yang bisa Ani ambil jika tidak boleh melalui jalur yang sama?",
    answer: "240",
    cara: "Kaidah Perkalian: Pergi A → B → C = 4 × 5 = 20 rute. Pulang C → B → A (tidak boleh jalur sama dengan pergi) = 3 × 4 = 12 rute. Total = 20 × 12 = 240 rute.",
  },
  {
    question_number: 6, level: "menengah",
    question: "Disediakan angka 0, 3, 5, 6, 8, 9. Berapa banyak bilangan ganjil terdiri dari 3 angka yang dapat dibuat dengan syarat tidak ada angka yang berulang? (0 tidak boleh sebagai ratusan)",
    answer: "48",
    cara: "Kaidah Perkalian (aturan pengisian tempat): satuan harus ganjil → {3, 5, 9} = 3 pilihan. Ratusan ≠ 0 dan ≠ satuan → 6 − 2 = 4 pilihan. Puluhan sisa → 4 pilihan. Total = 3 × 4 × 4 = 48 bilangan.",
  },
  {
    question_number: 7, level: "menengah",
    question: "Terdapat angka 3, 4, 5, 6, dan 7. Berapa banyak bilangan 3 angka berbeda yang dapat dibuat, jika bilangan tersebut lebih dari 540?",
    answer: "33",
    cara: "Kaidah Perkalian (kasus): Kasus 1 — ratusan = 5, puluhan ∈ {4, 6, 7} → 3 pilihan, satuan sisa 3 → 3 × 3 = 9. Kasus 2 — ratusan ∈ {6, 7} → 2 pilihan, puluhan 4 sisa, satuan 3 sisa → 2 × 4 × 3 = 24. Total = 9 + 24 = 33 bilangan.",
  },
  {
    question_number: 8, level: "hots",
    question: "Dari kota A ke kota B ada 4 jalur, dari kota B ke kota C ada 5 jalur, dari kota A ke kota C ada 3 jalur. Bowo melakukan perjalanan dari kota A ke kota C dan kembali lagi ke kota A. Jika berangkatnya harus melalui kota B, berapa banyak rute perjalanan yang bisa Bowo ambil jika tidak boleh melalui jalur yang sama?",
    answer: "300",
    cara: "Kaidah Perkalian + Penjumlahan: Berangkat A → B → C = 4 × 5 = 20 rute. Pulang: (a) C → A langsung = 3 jalur → 20 × 3 = 60 rute; (b) C → B → A tanpa jalur sama dengan berangkat = 4 × 3 = 12 → 20 × 12 = 240 rute. Total = 60 + 240 = 300 rute.",
  },
  {
    question_number: 9, level: "hots",
    question: "Disediakan angka 1, 2, 3, 4, dan 5. Berapa banyak bilangan genap terdiri dari 3 angka yang dapat dibuat, jika bilangan tersebut lebih dari 300 dan tidak ada angka yang berulang?",
    answer: "15",
    cara: "Kaidah Perkalian (kasus): satuan genap → {2, 4}. Kasus 1 — ratusan = 4, satuan {2} (1 pilihan), puluhan sisa 3 → 1 × 3 = 3. Kasus 2 — ratusan ∈ {3, 5} → 2 pilihan, satuan {2, 4} (2 pilihan), puluhan sisa 3 → 2 × 2 × 3 = 12. Total = 3 + 12 = 15 bilangan.",
  },
  {
    question_number: 10, level: "hots",
    question: "Seorang fotografer sedang mengatur foto keluarga. Keluarga tersebut terdiri dari ayah, ibu, 3 anak laki–laki dan 2 anak perempuan. Mereka akan duduk berjajar di depan rumah dengan syarat ayah dan ibu selalu duduk berdampingan. Berapa banyak susunan foto yang mungkin terjadi?",
    answer: "1440",
    cara: "Kaidah Perkalian + Permutasi: Blok (ayah, ibu) dihitung 1 entitas + 5 lainnya = 6 entitas → 6! = 720. Ayah dan ibu bisa tukar posisi dalam blok → 2! = 2. Total = 720 × 2 = 1.440 susunan.",
  },
];

// ─── Faktorial (7 soal — sesuai Ground Truth) ───────────────────────────────────
export const SOAL_FAKTORIAL: SoalItem[] = [
  {
    question_number: 1, level: "mudah",
    question: "Hitunglah nilai faktorial berikut!\na. 5! = ...\nb. 3! + 4! = ...\nc. 3! × 2! = ...\nd. 0! + 1! + 2! = ...",
    answer: "a) 5! = 120\nb) 3!+4! = 6+24 = 30\nc) 3!×2! = 6×2 = 12\nd) 0!+1!+2! = 1+1+2 = 4",
    cara: "a) 5! = 5 × 4 × 3 × 2 × 1 = 120\nb) 3! = 6, 4! = 24 → 6 + 24 = 30\nc) 3! = 6, 2! = 2 → 6 × 2 = 12\nd) 0! = 1, 1! = 1, 2! = 2 → 1 + 1 + 2 = 4",
  },
  {
    question_number: 2, level: "mudah",
    question: "Sederhanakan ekspresi berikut tanpa menghitung nilai faktorial secara penuh!\na. 7! / 5! = ...\nb. 9! / 7! = ...\nc. 6! / (4! · 2!) = ...",
    answer: "a) 7!/5! = 42\nb) 9!/7! = 72\nc) 6!/(4!·2!) = 15",
    cara: "a) 7!/5! = (7 × 6 × 5!) / 5! = 7 × 6 = 42\nb) 9!/7! = (9 × 8 × 7!) / 7! = 9 × 8 = 72\nc) 6!/(4!·2!) = (6 × 5 × 4!) / (4! × 2 × 1) = (6 × 5) / 2 = 15",
  },
  {
    question_number: 3, level: "mudah",
    question: "Tentukan nilai n yang memenuhi persamaan berikut!\na. n! = 24 → n = ...\nb. n! = 720 → n = ...\nc. (n+1)! = 120 → n = ...",
    answer: "a) n! = 24 → n = 4\nb) n! = 720 → n = 6\nc) (n+1)! = 120 → n+1=5 → n = 4",
    cara: "a) 4! = 4 × 3 × 2 × 1 = 24, jadi n = 4\nb) 6! = 6 × 5 × 4 × 3 × 2 × 1 = 720, jadi n = 6\nc) (n+1)! = 120 → 5! = 120 → n+1 = 5 → n = 4",
  },
  {
    question_number: 4, level: "menengah",
    question: "Manakah pernyataan berikut yang benar? Pilih ✅ jika pernyataan benar atau ❌ jika salah!\na. 0! = 0\nb. 5! / 3! = 2!\nc. 5! = 5 × 4!\nd. n! / (n-1)! = n",
    answer: "a) Salah — 0! = 1, bukan 0\nb) Salah — 5!/3! = 20, bukan 2! (=2)\nc) Benar — sesuai sifat rekursif n!=n×(n-1)!\nd) Benar — n!/(n-1)! = n",
    cara: "a) Salah. Berdasarkan definisi, 0! = 1.\nb) Salah. 5!/3! = (5×4×3!)/3! = 20, bukan 2! (= 2).\nc) Benar. 5! = 5×4×3×2×1 = 5×(4×3×2×1) = 5×4!.\nd) Benar. n!/(n-1)! = n×(n-1)!/(n-1)! = n, untuk n ≥ 1.",
  },
  {
    question_number: 5, level: "menengah",
    question: "Sederhanakan ekspresi berikut:\na. (n+2)! / n! = ...\nb. (n+1)! / (n-1)! = ...\nc. n! / ((n-3)! · 3!) = ...",
    answer: "a) (n+2)(n+1)\nb) (n+1)n\nc) C(n,3), bentuk umum",
    cara: "a) (n+2)!/n! = (n+2)(n+1)n!/n! = (n+2)(n+1)\nb) (n+1)!/(n-1)! = (n+1)n(n-1)!/(n-1)! = (n+1)n\nc) n!/((n-3)!·3!) = n(n-1)(n-2)(n-3)!/((n-3)!·6) = n(n-1)(n-2)/6 = C(n,3)",
  },
  {
    question_number: 6, level: "menengah",
    question: "Tentukan nilai n yang memenuhi:\na. n! / (n-2)! = 30\nb. (n+1)! / (n-1)! = 56",
    answer: "a) n!/(n-2)! = 30 → n(n-1)=30 → n = 6\nb) (n+1)!/(n-1)! = 56 → (n+1)n=56 → n = 7",
    cara: "a) n!/(n-2)! = n(n-1)(n-2)!/(n-2)! = n(n-1)\nn(n-1) = 30 → n² - n - 30 = 0 → (n-6)(n+5) = 0\nn = 6 atau n = -5\nKarena n ≥ 2, maka n = 6.\n\nb) (n+1)!/(n-1)! = (n+1)n(n-1)!/(n-1)! = (n+1)n\n(n+1)n = 56 → n² + n - 56 = 0 → (n-7)(n+8) = 0\nn = 7 atau n = -8\nKarena n ≥ 1, maka n = 7.",
  },
  {
    question_number: 7, level: "menengah",
    question: "Lima siswa (Aldi, Bella, Citra, Dani, Eka) akan berfoto berjajar untuk kenang-kenangan.\n\na. Berapa banyak cara mereka bisa berjajar? Tuliskan dalam bentuk faktorial dan hitung nilainya.\n\nb. Jika Aldi sudah pasti berada di posisi paling kiri, berapa banyak cara tersisa untuk menyusun keempat orang lainnya?\n\nc. Berapakah perbandingan antara jawaban a. dan b.? Apa artinya?",
    answer: "a) 5! = 120 cara\nb) 4! = 24 cara (Aldi tetap di kiri)\nc) Perbandingan a:b = 120:24 = 5:1. Artinya hanya 1/5 dari seluruh kemungkinan yang memenuhi syarat Aldi di posisi kiri — masuk akal karena Aldi hanya menempati 1 dari 5 posisi yang mungkin.",
    cara: "a) Menyusun 5 orang berjajar = permutasi 5 objek = 5!\n5! = 5 × 4 × 3 × 2 × 1 = 120\nJadi, ada 120 cara mereka bisa berjajar.\n\nb) Aldi tetap di posisi paling kiri, maka 4 orang tersisa disusun bebas.\nBanyak cara = 4! = 4 × 3 × 2 × 1 = 24\nJadi, ada 24 cara menyusun keempat orang lainnya.\n\nc) Perbandingan = 120 : 24 = 5 : 1\nArtinya: Dari 120 kemungkinan susunan, hanya 24 di antaranya Aldi berada di posisi paling kiri.\nAtau: Peluang Aldi di posisi paling kiri = 24/120 = 1/5.\nSecara intuitif, karena ada 5 posisi yang equally likely untuk Aldi, peluangnya memang 1/5.",
  },
];

// ─── Permutasi (10 soal — sesuai Ground Truth) ──────────────────────────────────
export const SOAL_PERMUTASI: SoalItem[] = [
  {
    question_number: 1, level: "mudah",
    question: "Dalam suatu final perlombaan Literasi-Numerasi yang diikuti oleh 8 orang, akan diambil 3 orang sebagai juara yaitu juara I, juara II, dan juara III. Berapa banyak kemungkinan susunan juara yang terjadi?",
    answer: "336",
    cara: "Permutasi 3 dari 8 (urutan penting: juara I ≠ juara II ≠ juara III).\nP(8,3) = 8! / (8-3)! = 8! / 5!\n= 8 × 7 × 6 × 5! / 5!\n= 8 × 7 × 6\n= 336 susunan juara.",
  },
  {
    question_number: 2, level: "mudah",
    question: "Berapa banyak kemungkinan susunan huruf-huruf yang terdiri dari 4 huruf dari kata \"PERMUTASI\"?",
    answer: "3024",
    cara: "Kata \"PERMUTASI\" memiliki 9 huruf berbeda (P,E,R,M,U,T,A,S,I).\nMenyusun 4 huruf dari 9 huruf berbeda (urutan penting):\nP(9,4) = 9! / (9-4)! = 9! / 5!\n= 9 × 8 × 7 × 6 × 5! / 5!\n= 9 × 8 × 7 × 6\n= 3.024 susunan.",
  },
  {
    question_number: 3, level: "mudah",
    question: "Tentukan banyak susunan huruf berbeda yang dapat dibentuk dari kata \"PENCACAHAN\"?",
    answer: "151200",
    cara: "Kata \"PENCACAHAN\": 10 huruf dengan pengulangan:\nP = 1, E = 1, N = 2, C = 2, A = 3, H = 1\nPermutasi dengan unsur sama:\n= 10! / (2! × 2! × 3!)\n= 3.628.800 / (2 × 2 × 6)\n= 3.628.800 / 24\n= 151.200 susunan.",
  },
  {
    question_number: 4, level: "menengah",
    question: "Ada 7 orang yang akan duduk mengelilingi meja untuk belajar bersama. Tentukan banyak cara mereka duduk mengelilingi meja tersebut!",
    answer: "720",
    cara: "Permutasi siklis untuk n orang:\nP_siklis = (n-1)!\n= (7-1)!\n= 6!\n= 6 × 5 × 4 × 3 × 2 × 1\n= 720 cara.",
  },
  {
    question_number: 5, level: "menengah",
    question: "Ada 6 pemuda dan 3 pemudi akan duduk berjajar pada sebuah bangku. Berapa macam posisi duduk yang mungkin jika yang menempati bagian pinggir hanya pemuda saja?",
    answer: "151200",
    cara: "Total 9 orang (6 pemuda, 3 pemudi) duduk berjajar.\nPosisi pinggir (posisi 1 dan 9) hanya boleh ditempati pemuda:\n- Pilih 2 pemuda untuk posisi pinggir: P(6,2) = 6 × 5 = 30\n- Sisa 7 orang (4 pemuda + 3 pemudi) bebas di 7 posisi tengah: 7! = 5.040\nTotal = 30 × 5.040 = 151.200 posisi duduk.",
  },
  {
    question_number: 6, level: "menengah",
    question: "Diketahui kata \"MIAMMI\". Jika huruf-huruf pada kata tersebut dipertukarkan dan huruf yang terletak di pinggir adalah huruf \"M\", tentukan banyaknya kata yang dapat dibuat!",
    answer: "12",
    cara: "Kata \"MIAMMI\": 6 huruf, M = 3, I = 2, A = 1.\nSyarat: huruf pinggir (posisi 1 dan 6) harus M.\n- Karena M identik, cara menempatkan 2 M di 2 posisi pinggir = 1 cara.\n- Sisa 4 posisi tengah diisi oleh 4 huruf {1 M, 2 I, 1 A}:\n  Permutasi dengan unsur sama = 4! / 2! = 24 / 2 = 12.\nTotal = 1 × 12 = 12 kata.",
  },
  {
    question_number: 7, level: "menengah",
    question: "Terdapat 9 orang yang terdiri atas 2 orang dari partai Singa, 3 orang dari partai Harimau, dan 4 orang dari partai Macan akan melakukan perundingan duduk melingkar. Berapa macam posisi duduk mereka jika setiap anggota dari satu partai harus saling berdekatan?",
    answer: "576",
    cara: "Setiap partai dianggap 1 blok: 3 blok duduk melingkar.\n- Susunan 3 blok melingkar: (3-1)! = 2! = 2 cara\n- Dalam blok Singa (2 orang): 2! = 2 cara\n- Dalam blok Harimau (3 orang): 3! = 6 cara\n- Dalam blok Macan (4 orang): 4! = 24 cara\nTotal = 2 × 2 × 6 × 24 = 576 posisi duduk.",
  },
  {
    question_number: 8, level: "hots",
    question: "Suatu babak final kompetisi matematika diikuti oleh 8 orang peserta yang berasal dari beberapa provinsi. Jika 6 orang dari provinsi A dan 2 orang dari Provinsi B, berapa banyak susunan peserta berdasarkan provinsi yang dapat terjadi?",
    answer: "28",
    cara: "Total 8 peserta: 6 dari A, 2 dari B.\nSusunan berdasarkan provinsi = permutasi dengan unsur sama:\n= 8! / (6! × 2!)\n= (8 × 7 × 6!) / (6! × 2 × 1)\n= (8 × 7) / 2\n= 56 / 2\n= 28 susunan.\n\nAlternatif: pilih 2 posisi dari 8 untuk provinsi B → C(8,2) = 28.",
  },
  {
    question_number: 9, level: "hots",
    question: "Sebuah keluarga lengkap yang memiliki 2 anak laki-laki dan 3 anak perempuan akan makan bersama pada sebuah meja bundar. Tentukan banyak cara mereka duduk pada meja tersebut dimana anak laki-laki duduk bersama anak laki-laki dan anak perempuan bersama anak perempuan serta ayah dan ibu duduk berdekatan!",
    answer: "48",
    cara: "Anggota keluarga: Ayah, Ibu, 2 anak laki-laki, 3 anak perempuan = 7 orang.\nBlok-blok:\n- Blok L: 2 anak laki-laki\n- Blok P: 3 anak perempuan\n- Blok O: Ayah & Ibu (berdekatan)\n\n3 blok duduk melingkar: (3-1)! = 2! = 2 cara\n- Dalam blok L: 2! = 2 cara\n- Dalam blok P: 3! = 6 cara\n- Dalam blok O: 2! = 2 cara (ayah-ibu bisa bertukar)\n\nTotal = 2 × 2 × 6 × 2 = 48 cara.",
  },
  {
    question_number: 10, level: "hots",
    question: "Dalam sebuah seleksi tim sepak bola terdapat 15 pemain yang akan memperebutkan 11 posisi yang berbeda. Jika 3 pemain memperebutkan 1 posisi kiper, 6 pemain memperebutkan 4 posisi pemain belakang, 4 pemain memperebutkan 4 posisi pemain tengah, dan 2 pemain memperebutkan 2 posisi pemain depan, berapa banyak susunan yang dapat terjadi?",
    answer: "51840",
    cara: "Setiap kelompok pemain hanya bisa mengisi posisi sesuai kelompoknya:\n\n- Kiper: 3 pemain → 1 posisi = P(3,1) = 3\n- Belakang: 6 pemain → 4 posisi = P(6,4) = 6 × 5 × 4 × 3 = 360\n- Tengah: 4 pemain → 4 posisi = P(4,4) = 4! = 24\n- Depan: 2 pemain → 2 posisi = P(2,2) = 2! = 2\n\nTotal = 3 × 360 × 24 × 2 = 51.840 susunan.",
  },
];

// ─── Kombinasi (10 soal — sesuai Ground Truth) ──────────────────────────────────
export const SOAL_KOMBINASI: SoalItem[] = [
  {
    question_number: 1, level: "mudah",
    question: "Dari 8 pelajar akan dipilih 5 pelajar untuk mengikuti Jambore Pramuka. Tentukan banyak cara memilih kelima pelajar tersebut!",
    answer: "56",
    cara: "Memilih 5 dari 8 tanpa memperhatikan urutan → kombinasi.\nC(8,5) = 8! / (5! × 3!)\n= (8 × 7 × 6 × 5!) / (5! × 3 × 2 × 1)\n= (8 × 7 × 6) / 6\n= 8 × 7\n= 56 cara.",
  },
  {
    question_number: 2, level: "mudah",
    question: "Tentukan banyaknya segitiga yang berbeda yang dapat dibentuk dari segi sepuluh!",
    answer: "120",
    cara: "Segitiga dibentuk dari 3 titik sudut segi-10.\nMemilih 3 titik dari 10 titik sudut:\nC(10,3) = 10! / (3! × 7!)\n= (10 × 9 × 8 × 7!) / (6 × 7!)\n= (10 × 9 × 8) / 6\n= 720 / 6\n= 120 segitiga.",
  },
  {
    question_number: 3, level: "mudah",
    question: "Ada 7 siswa putra dan 4 siswa putri, akan dibentuk tim yang terdiri dari 5 orang. Tentukan banyaknya cara membentuk tim jika harus 3 putra dan 2 putri!",
    answer: "210",
    cara: "Memilih 3 putra dari 7 dan 2 putri dari 4 (kombinasi independen):\nC(7,3) × C(4,2)\n= [7!/(3!×4!)] × [4!/(2!×2!)]\n= [(7×6×5)/6] × [(4×3)/2]\n= 35 × 6\n= 210 cara.",
  },
  {
    question_number: 4, level: "menengah",
    question: "Dalam suatu ulangan seorang siswa harus menjawab 8 soal dari 10 soal yang diberikan dengan 5 soal diantaranya wajib dikerjakan. Tentukan banyaknya cara memilih soal-soal tersebut!",
    answer: "10",
    cara: "5 soal wajib → sudah pasti dipilih.\nSisa: harus memilih 3 soal dari 5 soal yang tidak wajib.\nC(5,3) = 5! / (3! × 2!)\n= (5 × 4) / 2\n= 10 cara.",
  },
  {
    question_number: 5, level: "menengah",
    question: "Dari 12 orang yang terdiri dari 8 putra dan 4 putri akan dibentuk tim yang beranggotakan 5 orang. Jika disyaratkan anggota tim tersebut paling banyak 2 orang putri, berapa banyak cara membentuk tim tersebut?",
    answer: "672",
    cara: "Paling banyak 2 putri → 3 kasus:\n\nKasus 1: 0 putri, 5 putra\n= C(4,0) × C(8,5) = 1 × 56 = 56\n\nKasus 2: 1 putri, 4 putra\n= C(4,1) × C(8,4) = 4 × 70 = 280\n\nKasus 3: 2 putri, 3 putra\n= C(4,2) × C(8,3) = 6 × 56 = 336\n\nTotal = 56 + 280 + 336 = 672 cara.",
  },
  {
    question_number: 6, level: "menengah",
    question: "Dalam sebuah kotak terdapat 12 bola yang terdiri dari 5 bola putih, 2 bola merah, 4 bola hijau, dan 1 bola biru akan diambil 4 bola secara acak. Berapa banyak cara pengambilan paling sedikit 1 bola merah?",
    answer: "285",
    cara: "Paling sedikit 1 bola merah = total pengambilan − tanpa bola merah.\n\nTotal pengambilan 4 dari 12:\nC(12,4) = 12!/(4!×8!) = (12×11×10×9)/(4×3×2×1) = 495\n\nTanpa bola merah (10 bola non-merah):\nC(10,4) = 10!/(4!×6!) = (10×9×8×7)/(4×3×2×1) = 210\n\nPaling sedikit 1 merah = 495 − 210 = 285 cara.",
  },
  {
    question_number: 7, level: "menengah",
    question: "Empat buah huruf diambil dari huruf-huruf P, E, L, U, A, N, G. Jika urutan huruf tidak diperhatikan, berapa banyak cara memilih keempat huruf tersebut?",
    answer: "35",
    cara: "7 huruf berbeda (P,E,L,U,A,N,G), dipilih 4 tanpa memperhatikan urutan.\nC(7,4) = 7! / (4! × 3!)\n= (7 × 6 × 5 × 4!) / (4! × 6)\n= (7 × 6 × 5) / 6\n= 7 × 5\n= 35 cara.",
  },
  {
    question_number: 8, level: "hots",
    question: "Seorang siswa diminta untuk mengerjakan 5 butir soal dari n butir soal yang tersedia. Soal nomor 1 dan 2 wajib dikerjakan. Jika banyak pilihan soal yang dapat ia lakukan ada 20, tentukan nilai n!",
    answer: "n = 8",
    cara: "Soal 1 dan 2 wajib → sudah pasti dipilih (2 soal).\nSisa: memilih 3 soal dari (n-2) soal lainnya.\nC(n-2, 3) = 20\n\n(n-2)(n-3)(n-4) / 6 = 20\n(n-2)(n-3)(n-4) = 120\n\nCoba: n-2 = 6 → n = 8\n6 × 5 × 4 = 120 ✓\n\nJadi, n = 8.",
  },
  {
    question_number: 9, level: "hots",
    question: "Dari 10 finalis pemilihan Putri Indonesia akan dipilih 3 orang. Berapa banyak cara memilih ketiga finalis jika 1 finalis selalu dipilih dan 2 finalis selalu dikeluarkan?",
    answer: "21",
    cara: "1 finalis selalu dipilih (pasti masuk) → 1 slot terisi.\n2 finalis selalu dikeluarkan (pasti tidak dipilih).\n\nTersisa: 10 - 1 - 2 = 7 kandidat.\nPerlu memilih 2 lagi dari 7:\nC(7,2) = 7! / (2! × 5!)\n= (7 × 6) / 2\n= 21 cara.",
  },
  {
    question_number: 10, level: "hots",
    question: "Delegasi Olimpiade Sains suatu SMA yang beranggotakan 9 orang, akan dibagi menjadi 2 kelompok I dan II, masing-masing terdiri dari 5 orang dan 4 orang. Dari tiap kelompok akan dipilih dua orang untuk menjadi ketua dan wakil. Jika Firdaus adalah anggota delegasi itu dan dia tidak bersedia menjadi ketua kelompok, ada berapa cara membentuk kelompok beserta pengurusnya?",
    answer: "23520",
    cara: "Total 9 orang, dibagi: kelompok I (5) & II (4).\nFirdaus tidak boleh jadi ketua kelompok manapun.\n\nKasus 1: Firdaus di kelompok I\n- Pilih 4 teman Firdaus dari 8: C(8,4) = 70\n- Ketua I: pilih dari 4 (bukan Firdaus) = 4\n- Wakil I: pilih dari 4 sisa = 4 → 4×4 = 16\n- Ketua & wakil II: P(4,2) = 4×3 = 12\n- Subtotal = 70 × 16 × 12 = 13.440\n\nKasus 2: Firdaus di kelompok II\n- Pilih 5 untuk kelompok I dari 8: C(8,5) = 56\n- Ketua & wakil I: P(5,2) = 5×4 = 20\n- Kelompok II: 4 orang termasuk Firdaus.\n  Ketua II: pilih dari 3 (bukan Firdaus) = 3\n  Wakil II: pilih dari 3 sisa = 3 → 3×3 = 9\n- Subtotal = 56 × 20 × 9 = 10.080\n\nTotal = 13.440 + 10.080 = 23.520 cara.",
  },
];

// ─── Dynamic lookup ─────────────────────────────────────────────────────────────

export function getSoalData(moduleSlug: string): SoalItem[] {
  switch (moduleSlug) {
    case "faktorial":
      return SOAL_FAKTORIAL;
    case "permutasi":
      return SOAL_PERMUTASI;
    case "kombinasi":
      return SOAL_KOMBINASI;
    default:
      return SOAL_KAIDAH_PENCACAHAN;
  }
}

// Map level to Indonesian for AI prompt
export const LEVEL_MAP: Record<string, string> = {
  mudah: "dasar",
  menengah: "menengah",
  hots: "HOTS",
};

// Bobot deterministik sesuai rubrik (proses vs jawaban akhir), skala total 10.
export const SCORE_WEIGHTS: Record<string, { process: number; final: number }> = {
  dasar: { process: 6, final: 4 },
  menengah: { process: 7, final: 3 },
  HOTS: { process: 8, final: 2 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the LAST number found in a string. Returns null if none. */
export function extractLastNumber(s: string): string | null {
  const matches = s.match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1];
}

/**
 * Per-part comparison for multi-line answers (e.g. faktorial "a) ...\nb) ...").
 *
 * Ground truth lines seperti "a) 5! = 120" diakhiri oleh ANGKA hasil akhir
 * bagian tersebut. Mode ini hanya aktif jika SETIAP baris ground truth
 * diakhiri angka (agar tidak salah cocok untuk soal teks/aljabar seperti
 * faktorial soal 4, 5, 7) dan jumlah baris jawaban siswa sama.
 */
export function perPartLastNumberMatch(jawaban: string, gt: string): boolean {
  const jawabanLines = jawaban.split("\n").map((l) => l.trim()).filter(Boolean);
  const gtLines = gt.split("\n").map((l) => l.trim()).filter(Boolean);
  if (jawabanLines.length === 0 || jawabanLines.length !== gtLines.length) {
    return false;
  }
  for (let i = 0; i < gtLines.length; i++) {
    // GT line must clearly end with the numeric answer.
    if (!/\d\s*$/.test(gtLines[i])) return false;
    const gtNum = extractLastNumber(gtLines[i]);
    const jawabanNum = extractLastNumber(jawabanLines[i]);
    if (gtNum === null || jawabanNum === null) return false;
    if (gtNum !== jawabanNum) return false;
  }
  return true;
}

/**
 * Per-part mark comparison untuk soal benar/salah (contoh: faktorial soal 4).
 * Setiap baris kunci harus memuat kata "Benar" atau "Salah" dan setiap baris
 * jawaban siswa harus memuat tanda ✅ atau ❌. Bandingkan per baris:
 * ✅ ↔ Benar, ❌ ↔ Salah. Semua cocok → jawaban benar.
 */
export function perPartMarkMatch(jawaban: string, gt: string): boolean {
  const jawabanLines = jawaban.split("\n").map((l) => l.trim()).filter(Boolean);
  const gtLines = gt.split("\n").map((l) => l.trim()).filter(Boolean);
  if (jawabanLines.length === 0 || jawabanLines.length !== gtLines.length) {
    return false;
  }
  for (let i = 0; i < gtLines.length; i++) {
    const gtBenar = /\bbenar\b/i.test(gtLines[i]);
    const gtSalah = /\bsalah\b/i.test(gtLines[i]);
    // Kunci harus tegas: tepat salah satu dari Benar/Salah.
    if (gtBenar === gtSalah) return false;
    const mark = jawabanLines[i].match(/[✅❌]/);
    if (!mark) return false;
    if ((mark[0] === "✅") !== gtBenar) return false;
  }
  return true;
}

/** Normalisasi ekspresi aljabar sederhana untuk perbandingan simbolik. */
export function normalizeAlgebraic(s: string): string {
  return s
    .toLowerCase()
    .replace(/^[a-z][).:]\s*/, "") // buang prefix "a)" / "a." / "a:"
    .replace(/[×·*]/g, "*")
    .replace(/x/g, "*") // huruf x sebagai perkalian
    .replace(/\s+/g, "")
    .replace(/([a-z0-9])\(/g, "$1*(") // perkalian implisit: n( → n*(
    .replace(/\)([a-z0-9(])/g, ")*$1") // )n atau )( → )*n / )*(
    .replace(/3!/g, "6")
    .replace(/2!/g, "2")
    .replace(/1!/g, "1");
}

/** Perkalian komutatif: urutkan faktor top-level "*". */
export function commutativeEq(a: string, b: string): boolean {
  if (a.includes("/") || b.includes("/")) return false;
  const sortFactors = (s: string) => s.split("*").sort().join("*");
  return sortFactors(a) === sortFactors(b);
}

/** Ekuivalen C(n,3) — menerima bentuk umum kombinasi dan penjabarannya. */
export function isC3Equivalent(studentNorm: string): boolean {
  // normalisasi mengubah "C(n,3)" menjadi "c*(n,3)"
  if (studentNorm === "c*(n,3)" || studentNorm.startsWith("c*(n,3),")) return true;
  const m = studentNorm.match(/^([^/]+)\/6$/);
  if (!m) return false;
  const parts = m[1].split("*").sort();
  return (
    parts.length === 3 &&
    parts[0] === "(n-1)" &&
    parts[1] === "(n-2)" &&
    parts[2] === "n"
  );
}

/**
 * Per-part symbolic comparison untuk jawaban aljabar (contoh: faktorial soal 5).
 * Bandingkan per baris setelah normalisasi notasi (x/×/· → *, perkalian
 * implisit, faktorial kecil), menerima urutan faktor komutatif dan bentuk
 * ekuivalen C(n,3).
 */
export function perPartSymbolicMatch(jawaban: string, gt: string): boolean {
  const jawabanLines = jawaban.split("\n").map((l) => l.trim()).filter(Boolean);
  const gtLines = gt.split("\n").map((l) => l.trim()).filter(Boolean);
  if (jawabanLines.length === 0 || jawabanLines.length !== gtLines.length) {
    return false;
  }
  for (let i = 0; i < gtLines.length; i++) {
    const jn = normalizeAlgebraic(jawabanLines[i]);
    const gn = normalizeAlgebraic(gtLines[i]);
    if (!jn || !gn) return false;
    if (jn === gn) continue;
    if (commutativeEq(jn, gn)) continue;
    if (/c\*?\(n,3\)/.test(gn) && isC3Equivalent(jn)) continue;
    return false;
  }
  return true;
}

// ─── Faktorial soal 5: verifikasi jawaban BERTAHAP (multi-baris) ───────────────

/** Penanda awal bagian: "a." / "a)" / "a:" (huruf a–d, opsional spasi). */
const PART_MARKER_RE = /^([a-d])[).:]\s*(.*)$/;

/**
 * Pecah teks menjadi bagian per huruf. Baris yang tidak diawali penanda
 * huruf (mis. baris "= ..." langkah pengerjaan) dianggap lanjutan bagian
 * sebelumnya. Urutan huruf dipertahankan.
 */
function splitByParts(text: string): Array<{ letter: string; lines: string[] }> {
  const parts: Array<{ letter: string; lines: string[] }> = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(PART_MARKER_RE);
    if (m) {
      parts.push({ letter: m[1].toLowerCase(), lines: m[2] ? [m[2]] : [] });
    } else if (parts.length > 0) {
      parts[parts.length - 1].lines.push(line);
    }
  }
  return parts.filter((p) => p.lines.length > 0);
}

/**
 * Ambil HASIL AKHIR sebuah bagian dari jawaban bertahap. Baris terakhir
 * bagian itulah hasil akhirnya. Bila baris itu masih berbentuk "= hasil",
 * yang diambil adalah ruas kanan "=" TERAKHIR — tanda "=" di langkah
 * sebelumnya tidak berpengaruh karena hanya baris terakhir yang dilihat.
 */
function partFinalValue(lines: string[]): string {
  const last = lines[lines.length - 1];
  const eq = last.lastIndexOf("=");
  return normalizeAlgebraic(eq === -1 ? last : last.slice(eq + 1));
}

/** Bandingkan hasil akhir satu bagian siswa dengan kunci. */
function partValueMatches(student: string, gt: string): boolean {
  if (!student || !gt) return false;
  // Kunci boleh memuat keterangan tambahan (", bentuk umum").
  const gnBase = gt.replace(/,bentukumum$/, "");
  if (!gnBase) return false;
  if (student === gt || student === gnBase) return true;
  if (commutativeEq(student, gnBase)) return true;
  if (/c\*?\(n,3\)/.test(gnBase) && isC3Equivalent(student)) return true;
  return false;
}

/**
 * Verifikasi jawaban akhir soal 5 faktorial dalam format bertahap, mis.:
 *
 *   a. (n+2)! / n!
 *   = (n+2)(n+1)n! / n!
 *   = (n+2)(n+1)
 *   b. (n+1)! / (n-1)!
 *   = (n+1)n(n-1)! / (n-1)!
 *   = n(n+1)
 *   c. n! / ((n-3)! · 3!)
 *   = n(n-1)(n-2)(n-3)! / ((n-3)! · 3!)
 *   = n(n-1)(n-2) / 6
 *
 * Yang dinilai deterministik adalah HASIL AKHIR tiap bagian:
 *   a. (n+2)(n+1)   b. (n+1)n (≡ n(n+1))   c. C(n,3) (≡ n(n-1)(n-2)/6)
 * Format satu-baris ("a) (n+2)(n+1)") juga tetap diterima.
 */
export function faktorialSoal5Match(jawaban: string): boolean {
  const gtItem = SOAL_FAKTORIAL.find((s) => s.question_number === 5);
  if (!gtItem) return false;

  const studentParts = splitByParts(jawaban);
  const gtParts = splitByParts(gtItem.answer);
  if (studentParts.length === 0 || studentParts.length !== gtParts.length) {
    return false;
  }

  for (let i = 0; i < gtParts.length; i++) {
    if (studentParts[i].letter !== gtParts[i].letter) return false;
    if (!partValueMatches(partFinalValue(studentParts[i].lines), partFinalValue(gtParts[i].lines))) {
      return false;
    }
  }
  return true;
}

// ─── Faktorial: verifikasi numerik multi-bentuk ────────────────────────────────

/**
 * Nilai akhir yang BENAR per sub-bagian soal hitung faktorial.
 * Soal 5 (aljabar) & 7 (teks) tidak ada di sini — keduanya tetap dinilai AI
 * (soal 5 lewat perPartSymbolicMatch sebagai fast-path).
 */
export const FAKTORIAL_NUMERIC_ANSWERS: Record<number, number[]> = {
  1: [120, 30, 12, 4],
  2: [42, 72, 15],
  3: [4, 6, 4],
  6: [6, 7],
};

/** Kunci benar/salah soal 4 faktorial: a ❌, b ❌, c ✅, d ✅. */
export const FAKTORIAL_SOAL4_KEY: Array<"✅" | "❌"> = ["❌", "❌", "✅", "✅"];

/**
 * Parser ekspresi matematika AMAN (tanpa eval) — mendukung + - * / ( )
 * dan faktorial postfix (!). Variabel tak dikenal (n, dll.) → return null.
 *
 * Dipakai untuk memverifikasi bentuk jawaban setara, mis. "42", "7×6",
 * atau "7×6×5!/5!" — semuanya secara matematis benar untuk 7!/5!.
 */
export function safeEvaluate(expr: string): number | null {
  if (!expr) return null;
  let s = expr
    .toLowerCase()
    .replace(/[×·•]/g, "*")
    .replace(/[−–—]/g, "-")
    .replace(/x/g, "*") // huruf x sebagai perkalian
    .replace(/÷/g, "/")
    .replace(/\s+/g, "");
  if (s.length === 0 || s.length > 200) return null;

  // Ambil bagian setelah tanda "=" terakhir ("5! = 120" → "120").
  const eq = s.lastIndexOf("=");
  if (eq !== -1) s = s.slice(eq + 1);

  let pos = 0;
  const peek = (): string => s[pos] ?? "";

  function parseNumber(): number {
    const start = pos;
    while (pos < s.length && /[0-9.]/.test(s[pos])) pos++;
    const text = s.slice(start, pos);
    if (!text || text.split(".").length > 2) throw new Error("bad number");
    const n = Number(text);
    if (!Number.isFinite(n)) throw new Error("bad number");
    return n;
  }

  function parseExpr(): number {
    let v = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = s[pos++];
      const rhs = parseTerm();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  function parseTerm(): number {
    let v = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = s[pos++];
      const rhs = parseFactor();
      v = op === "*" ? v * rhs : v / rhs;
    }
    return v;
  }

  function parseFactor(): number {
    let v = parsePrimary();
    while (peek() === "!") {
      pos++;
      if (v < 0 || v > 170 || !Number.isInteger(v)) throw new Error("bad factorial");
      let f = 1;
      for (let i = 2; i <= v; i++) f *= i;
      v = f;
    }
    return v;
  }

  function parsePrimary(): number {
    if (/[0-9.]/.test(peek())) return parseNumber();
    if (peek() === "(") {
      pos++;
      const v = parseExpr();
      if (s[pos] !== ")") throw new Error("missing )");
      pos++;
      return v;
    }
    throw new Error("unsupported token");
  }

  try {
    const result = parseExpr();
    if (pos !== s.length) return null; // sisa token (mis. "120 cara")
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Verifikasi jawaban akhir faktorial per sub-bagian berdasarkan NILAI.
 * Setiap baris "a) <jawaban>" dievaluasi lalu dibandingkan dengan kunci —
 * menerima semua bentuk penulisan yang bernilai sama.
 */
export function faktorialNumericMatch(jawaban: string, questionNumber: number): boolean {
  const expected = FAKTORIAL_NUMERIC_ANSWERS[questionNumber];
  if (!expected) return false;

  const lines = jawaban.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length !== expected.length) return false;

  for (let i = 0; i < lines.length; i++) {
    let val = lines[i].replace(/^[a-d][).:]\s*/i, "").trim();
    if (!val) return false;
    const num = safeEvaluate(val);
    if (num === null || Math.abs(num - expected[i]) > 1e-9) return false;
  }
  return true;
}

// ─── Overall feedback ───────────────────────────────────────────────────────────

/** Mapping module_slug → nama materi untuk feedback */
export const MATERI_FEEDBACK_LABEL: Record<string, string> = {
  "kaidah-pencacahan": "Kaidah Pencacahan",
  faktorial: "Faktorial",
  permutasi: "Permutasi",
  kombinasi: "Kombinasi",
};

export function generateOverallFeedback(
  perQuestion: Record<string, unknown>[],
  overallScore: number,
  moduleSlug?: string
): string {
  const correctCount = perQuestion.filter(
    (q) => (q as { mistake_category?: string | null }).mistake_category === null
  ).length;
  const unansweredCount = perQuestion.filter(
    (q) => (q as { mistake_category?: string | null }).mistake_category === "tidak_diisi"
  ).length;
  const totalQuestions = perQuestion.length;

  const materiLabel = MATERI_FEEDBACK_LABEL[moduleSlug ?? ""] ?? "Kaidah Pencacahan";

  let feedback = `Skor keseluruhan: ${overallScore}/100. `;

  if (unansweredCount > 0) {
    feedback += `${unansweredCount} soal tidak diisi (skor 0). `;
  }

  if (overallScore >= 90) {
    feedback += `Kamu menguasai materi ${materiLabel} dengan sangat baik! ${correctCount}/${totalQuestions} soal kamu jawab dengan tepat. Pertahankan pemahamanmu dan terus latihan untuk menjaga konsistensi.`;
  } else if (overallScore >= 75) {
    feedback += `Pemahamanmu tentang ${materiLabel} sudah baik. ${correctCount}/${totalQuestions} soal terjawab dengan benar. Fokuslah memperbaiki kesalahan pada soal yang masih kurang tepat, terutama pastikan kamu bisa membedakan kapan menggunakan aturan penjumlahan vs perkalian.`;
  } else if (overallScore >= 50) {
    feedback += `Kamu sudah memahami dasar-dasarnya, tapi masih perlu banyak latihan. ${correctCount}/${totalQuestions} soal berhasil kamu jawab dengan benar. Coba perhatikan lagi konsep permutasi vs kombinasi, dan kapan urutan diperhatikan.`;
  } else {
    feedback += `Sepertinya kamu masih kesulitan dengan materi ${materiLabel}. Hanya ${correctCount}/${totalQuestions} soal yang terjawab benar. Jangan berkecil hati! Mulailah dari konsep paling dasar: pahami dulu perbedaan aturan penjumlahan (ATAU) dan aturan perkalian (DAN).`;
  }

  return feedback;
}
