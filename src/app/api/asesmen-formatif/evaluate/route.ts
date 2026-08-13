/**
 * Asesmen Formatif — Evaluate API
 *
 * POST /api/asesmen-formatif/evaluate
 *   → Triggers AI evaluation for a submission. Evaluates all answers
 *     per-question using the AsesmenFormatif rubrik prompt.
 *   → Body: { submission_id: number, module_slug: string }
 *   → Response: { success: true, total_score: number, per_question: [...], ai_feedback: string }
 *
 * GET /api/asesmen-formatif/evaluate?submission_id=...
 *   → Returns evaluation results for a specific submission.
 *   → Response: { evaluated: boolean, total_score?: number, per_question?: [...], ai_feedback?: string }
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { AsesmenFormatifEvaluatePrompt } from "@/lib/ai/client";

// ─── Ground truth & soal data — keyed by module_slug ────────────────────────────

type SoalItem = {
  question_number: number;
  level: "mudah" | "menengah" | "hots";
  question: string;
  answer: string;
  /** Ground-truth langkah pengerjaan (kunci jawaban untuk AI evaluation). */
  cara: string;
};

// ─── Kaidah Pencacahan (default) ────────────────────────────────────────────────
const SOAL_KAIDAH_PENCACAHAN: SoalItem[] = [
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
const SOAL_FAKTORIAL: SoalItem[] = [
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
    question: "Manakah pernyataan berikut yang benar? Beri tanda ✅ atau ❌, lalu jelaskan alasanmu!\na. 0! = 0\nb. 5! / 3! = 2!\nc. 5! = 5 × 4!\nd. n! / (n-1)! = n",
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
const SOAL_PERMUTASI: SoalItem[] = [
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
const SOAL_KOMBINASI: SoalItem[] = [
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

function getSoalData(moduleSlug: string): SoalItem[] {
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
const LEVEL_MAP: Record<string, string> = {
  mudah: "dasar",
  menengah: "menengah",
  hots: "HOTS",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the LAST number found in a string. Returns null if none. */
function extractLastNumber(s: string): string | null {
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
function perPartLastNumberMatch(jawaban: string, gt: string): boolean {
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

async function getStudentId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!student) return { error: NextResponse.json({ error: "Student not found" }, { status: 404 }) };

  return { studentId: student.id };
}

// ─── POST — trigger evaluation ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const body = await req.json().catch(() => null);
    if (!body || typeof body.submission_id !== "number" || typeof body.module_slug !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Required: submission_id (number), module_slug (string)" },
        { status: 400 }
      );
    }

    const { submission_id, module_slug } = body;

    // Verify submission belongs to this student
    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: submission_id },
      select: { id: true, studentId: true, answers: true, evaluatedAt: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already evaluated, return existing results
    if (submission.evaluatedAt) {
      const existing = await prisma.asesmenFormatifSubmission.findUnique({
        where: { id: submission_id },
        select: { totalScore: true, perQuestionResults: true, aiFeedback: true, evaluatedAt: true },
      });
      return NextResponse.json({
        success: true,
        already_evaluated: true,
        total_score: existing?.totalScore,
        per_question: existing?.perQuestionResults,
        ai_feedback: existing?.aiFeedback,
      });
    }

    // Parse answers
    const answers = submission.answers as unknown as Array<{
      question_number: number;
      cara_mengerjakan: string;
      jawaban_akhir: string;
    }>;

    // ── Select SOAL_DATA based on module_slug ──────────────────
    const soalData = getSoalData(module_slug);

    // Evaluate each question
    const perQuestionResults: Record<string, unknown>[] = [];
    let totalScoreSum = 0;

    for (const answer of answers) {
      const soalRef = soalData.find((s) => s.question_number === answer.question_number);
      if (!soalRef) continue;

      const caraHitungRaw = answer.cara_mengerjakan?.trim() ?? "";
      const jawabanAkhirRaw = answer.jawaban_akhir?.trim() ?? "";

      // ── Unanswered question: skip AI, langsung skor 0 ────────────────
      const isUnanswered = caraHitungRaw.length === 0 && jawabanAkhirRaw.length === 0;

      if (isUnanswered) {
        perQuestionResults.push({
          question_number: answer.question_number,
          step_by_step: {
            identifikasi_kondisi: { score: 0, reasoning: "Tidak dijawab" },
            pemilihan_rumus: { score: 0, reasoning: "Tidak dijawab" },
            eksekusi_perhitungan: { score: 0, reasoning: "Tidak dijawab" },
            justifikasi: { score: 0, reasoning: "Tidak dijawab" },
          },
          process_raw_score: 0,
          process_scaled_score: 0,
          final_answer_score: 0,
          total_score: 0,
          guardrail_applied: null,
          mistake_category: "tidak_diisi",
          mistake_detail: "Siswa tidak mengisi jawaban untuk soal ini.",
          feedback: "Kamu tidak mengisi jawaban untuk soal ini. Coba lagi di attempt berikutnya ya!",
        });
        // totalScoreSum stays 0 for this question
        continue;
      }

      // ── Compute isJawabanAkhirTrue early (before cara_hitung check) ─
      const jawabanAkhirClean = jawabanAkhirRaw || "(tidak diisi)";
      const normalizedJawaban = jawabanAkhirClean.replace(/[.,\s]/g, "");
      const normalizedGT = String(soalRef.answer).replace(/[.,\s]/g, "");

      // Exact match after normalization (handles dots, commas, spaces)
      let isJawabanAkhirTrue =
        normalizedJawaban === normalizedGT ||
        jawabanAkhirClean === String(soalRef.answer);

      // Fallback 1: per-part comparison for multi-line answers (e.g. faktorial).
      // Siswa menulis "a) 120\nb) 30\nc) 12\nd) 4" sedangkan kunci memuat
      // langkah hitung "a) 5! = 120\nb) 3!+4! = 6+24 = 30\n...".
      // Bandingkan angka TERAKHIR di tiap baris kunci dengan jawaban siswa.
      if (!isJawabanAkhirTrue) {
        if (perPartLastNumberMatch(jawabanAkhirClean, String(soalRef.answer))) {
          isJawabanAkhirTrue = true;
        }
      }

      // Fallback 2: pure numeric comparison (strips ALL non-digit chars)
      // Catches cases like "325 cara" vs "325" — siswa menambahkan teks
      // setelah angka yang sebenarnya sudah benar.
      if (!isJawabanAkhirTrue) {
        const extractDigits = (s: string) => s.replace(/\D/g, "");
        const jawabanDigits = extractDigits(jawabanAkhirClean);
        const gtDigits = extractDigits(String(soalRef.answer));
        if (jawabanDigits.length > 0 && jawabanDigits === gtDigits) {
          isJawabanAkhirTrue = true;
        }
      }

      // ── Cara hitung terlalu singkat (< 7 karakter) ────────────────
      // Hanya cek cara_hitung (proses), BUKAN jawaban_akhir.
      // Jawaban akhir pendek seperti "120" atau "56" itu normal.
      const caraLength = caraHitungRaw.length;

      if (caraLength < 7) {
        if (isJawabanAkhirTrue) {
          // Jawaban akhir benar tapi proses terlalu singkat → 7/10
          perQuestionResults.push({
            question_number: answer.question_number,
            step_by_step: {
              identifikasi_kondisi: { score: 0, reasoning: "Cara hitung terlalu singkat — tidak bisa dinilai." },
              pemilihan_rumus: { score: 0, reasoning: "Cara hitung terlalu singkat." },
              eksekusi_perhitungan: { score: 0, reasoning: "Cara hitung terlalu singkat." },
              justifikasi: { score: 0, reasoning: "Cara hitung terlalu singkat." },
            },
            process_raw_score: 0,
            process_scaled_score: 0,
            final_answer_score: 7,
            total_score: 7,
            guardrail_applied: null,
            mistake_category: null,
            mistake_detail: "Jawaban akhir benar, tetapi cara hitung terlalu singkat untuk dinilai prosesnya.",
            feedback: "Jawaban akhirmu benar, tapi cara hitungnya terlalu singkat. Lain kali tuliskan langkah-langkah pengerjaan yang lengkap ya biar Kombi bisa nilai proses berpikirmu juga! 😊",
          });
          totalScoreSum += 7;
        } else {
          // Jawaban salah & proses singkat → 0
          perQuestionResults.push({
            question_number: answer.question_number,
            step_by_step: {
              identifikasi_kondisi: { score: 0, reasoning: "Cara hitung terlalu singkat untuk dinilai" },
              pemilihan_rumus: { score: 0, reasoning: "Cara hitung terlalu singkat" },
              eksekusi_perhitungan: { score: 0, reasoning: "Cara hitung terlalu singkat" },
              justifikasi: { score: 0, reasoning: "Cara hitung terlalu singkat" },
            },
            process_raw_score: 0,
            process_scaled_score: 0,
            final_answer_score: 0,
            total_score: 0,
            guardrail_applied: null,
            mistake_category: "tidak_memadai",
            mistake_detail: "Cara hitung terlalu singkat untuk dievaluasi.",
            feedback: "Cara hitungmu terlalu singkat untuk bisa dinilai. Coba tuliskan langkah-langkah pengerjaan yang lebih lengkap ya!",
          });
        }
        continue;
      }

      const caraHitung = caraHitungRaw || "(tidak diisi)";
      const jawabanAkhir = jawabanAkhirClean;

      // ── Jawaban akhir benar + cara cukup → tetap kirim ke AI ─
      // AI akan menilai proses secara detail. Prompt sudah dijamin:
      // jika is_jawaban_akhir_true = TRUE → final_answer_score HARUS skor penuh,
      // dan jika proses juga sesuai ground truth → total_score WAJIB 10/10.
      // Jadi tidak ada fast-path skip — biar AI yang memutuskan.

      const levelLabel = LEVEL_MAP[soalRef.level] ?? soalRef.level;

      const result = await AsesmenFormatifEvaluatePrompt(
        soalRef.question,
        levelLabel,
        caraHitung,
        jawabanAkhir,
        isJawabanAkhirTrue,
        soalRef.cara
      );

      perQuestionResults.push({
        question_number: answer.question_number,
        ...result,
      });

      // Clamp per-question total_score to 0-10 (safety net)
      totalScoreSum += Math.min(10, Math.max(0, result.total_score));
    }

    // Compute overall score (average, scaled to 100), clamped to 0-100
    const overallScore = perQuestionResults.length > 0
      ? Math.min(100, Math.max(0, Math.round((totalScoreSum / (perQuestionResults.length * 10)) * 100)))
      : 0;

    // Generate overall AI feedback
    const aiFeedback = generateOverallFeedback(perQuestionResults, overallScore, module_slug);

    // Save to database
    await prisma.asesmenFormatifSubmission.update({
      where: { id: submission_id },
      data: {
        totalScore: overallScore,
        perQuestionResults: perQuestionResults as unknown as object,
        aiFeedback,
        evaluatedAt: new Date(),
        aiModel: "gpt-4o",
      },
    });

    return NextResponse.json({
      success: true,
      total_score: overallScore,
      per_question: perQuestionResults,
      ai_feedback: aiFeedback,
    });
  } catch (err) {
    console.error("[POST /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengevaluasi jawaban. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// ─── GET — retrieve evaluation results ─────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const authResult = await getStudentId();
    if ("error" in authResult) return authResult.error;
    const { studentId } = authResult;

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submission_id");

    if (!submissionId) {
      return NextResponse.json({ error: "submission_id is required" }, { status: 400 });
    }

    const submission = await prisma.asesmenFormatifSubmission.findUnique({
      where: { id: parseInt(submissionId) },
      select: {
        id: true,
        studentId: true,
        totalScore: true,
        perQuestionResults: true,
        aiFeedback: true,
        evaluatedAt: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.studentId !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      evaluated: submission.evaluatedAt !== null,
      total_score: submission.totalScore,
      per_question: submission.perQuestionResults,
      ai_feedback: submission.aiFeedback,
      evaluated_at: submission.evaluatedAt,
    });
  } catch (err) {
    console.error("[GET /api/asesmen-formatif/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil hasil evaluasi." },
      { status: 500 }
    );
  }
}

// ─── Helper: generate overall AI feedback ──────────────────────────────────────

/** Mapping module_slug → nama materi untuk feedback */
const MATERI_FEEDBACK_LABEL: Record<string, string> = {
  "kaidah-pencacahan": "Kaidah Pencacahan",
  faktorial: "Faktorial",
  permutasi: "Permutasi",
  kombinasi: "Kombinasi",
};

function generateOverallFeedback(
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
