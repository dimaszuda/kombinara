/**
 * Ground Truth — jawaban benar untuk setiap soal.
 *
 * Hanya berisi JAWABAN AKHIR / PERKIRAAN (nilai, kesimpulan, atau pernyataan
 * benar/salah), BUKAN cara menghitung. Digunakan sebagai referensi agar AI
 * bisa menentukan salah/benar jawaban siswa secara objektif.
 */

/** Apersepsi · Pemantik · Refleksi — keyed by question_key */
export const APERSEPSI_PEMANTIK_GROUND_TRUTH: Record<string, string> = {
  // ── Apersepsi ──────────────────────────────────────────────────
  kendaraan:
    "6 (3 sepeda + 2 motor + 1 mobil, aturan penjumlahan karena pilihan saling lepas)",
  outfit:
    "12 (4 baju × 3 celana, aturan perkalian karena memilih baju DAN celana sekaligus)",
  pengurus:
    "6 (3 × 2, permutasi 2 dari 3 karena jabatan ketua dan sekretaris berbeda, urutan diperhatikan)",

  // ── Pemantik ───────────────────────────────────────────────────
  password_kapasitas:
    "1.679.616 (36^4 = 36 × 36 × 36 × 36, karena 10 digit + 26 huruf = 36 karakter, 4 posisi, boleh berulang)",
  tim_sama_beda:
    "Tidak sama. Aturan A (dengan jabatan): 720 cara (10×9×8). Aturan B (tanpa jabatan): 120 cara (10C3). Jadi jumlah cara berbeda.",
  rute_kurir:
    "Ya, perlu dihitung terpisah. Pergi: 5×4=20 rute. Pulang: 4×3=12 rute (tidak boleh lewat jalan yang sama, jadi pilihan berkurang).",

  // ── Refleksi ───────────────────────────────────────────────────
  refleksi_sebelum_mulai:
    "Jawaban reflektif — siswa diharapkan menyadari bahwa cara menghitung apersepsi (penjumlahan & perkalian sederhana) belum cukup untuk menjawab situasi pemantik yang lebih kompleks (kombinasi, permutasi, pengulangan).",
  refleksi_sebelum_mulai_1:
    "Jawaban reflektif — siswa diharapkan menyadari bahwa cara menghitung apersepsi (penjumlahan & perkalian sederhana) belum cukup untuk menjawab situasi pemantik yang lebih kompleks (kombinasi, permutasi, pengulangan).",
  refleksi_sebelum_mulai_2:
    "Jawaban reflektif — siswa diharapkan menyebut perlu mempelajari aturan pencacahan lanjutan seperti permutasi, kombinasi, atau aturan pengisian tempat.",

  // ── Refleksi Mini — Kaidah Penjumlahan ─────────────────────────
  refleksi_penjumlahan_1:
    "Aturan penjumlahan digunakan ketika memilih salah satu dari beberapa pilihan yang saling lepas (tidak bisa dipilih bersamaan). Contoh: memilih kendaraan (cuma bisa pakai satu).",
  refleksi_penjumlahan_2:
    "Total pilihan = jumlah semua pilihan di tiap kelompok. Kalau ada 3 sepeda, 2 motor, 1 mobil → total = 3+2+1 = 6 pilihan kendaraan.",
  refleksi_penjumlahan_3:
    "Contoh sehari-hari: memilih menu makan siang (cuma bisa pilih satu: nasi goreng ATAU mie ayam ATAU soto), memilih rute berangkat sekolah (cuma bisa lewat satu jalan).",

  // ── Refleksi Mini — Kaidah Perkalian ───────────────────────────
  refleksi_perkalian_1:
    "Aturan perkalian digunakan ketika ada beberapa tahap keputusan yang dilakukan berurutan dan setiap tahap punya beberapa pilihan independen.",
  refleksi_perkalian_2:
    "Total cara = hasil kali jumlah pilihan di setiap tahap. Kalau 4 baju dan 3 celana → total = 4×3 = 12 outfit berbeda.",
  refleksi_perkalian_3:
    "Contoh sehari-hari: menyusun outfit (baju DAN celana DAN sepatu), membuat password (digit 1 DAN digit 2 DAN digit 3), memilih menu lengkap (makanan DAN minuman DAN dessert).",
};

/** Deep Learning — keyed by concept_id */
export const DEEP_LEARNING_GROUND_TRUTH: Record<string, string> = {
  kaidah_penjumlahan:
    "Untuk setiap situasi, pilihan bersifat saling lepas (tidak bisa memilih keduanya sekaligus). Boleh keduanya: Tidak. Total pilihan = jumlah pilihan A + pilihan B (3+2=5, 4+2=6, 6+8=14). Ada pola konsisten: Ya, operasi matematika yang digunakan adalah penjumlahan.",

  kaidah_perkalian:
    "Pengisian tempat: kotak 1=5, kotak 2=4, kotak 3=3 (karena tanpa pengulangan, setiap digit yang sudah dipakai tidak bisa dipakai lagi). Total PIN yang mungkin = 5×4×3 = 60. Diagram pohon: 2 makanan × 3 minuman = 6 kombinasi menu. Simpulan: kaidah perkalian digunakan untuk kejadian bertahap/berurutan, berbeda dengan penjumlahan yang digunakan untuk pilihan alternatif/saling lepas.",
};

/**
 * Eksplorasi Kontekstual — ground truth untuk soal-soal faktual sederhana.
 * Key = teks soal (exact match). Hanya soal yang jawabannya pasti & tidak
 * bersifat eksploratif yang perlu dimasukkan ke sini.
 */
export const EKSPLORASI_GROUND_TRUTH: Record<string, string> = {
  // Kaidah Penjumlahan — sub-step 3: operasi matematika
  "Jadi, operasi matematika apa yang paling tepat digunakan?":
    "Penjumlahan (karena setiap situasi hanya bisa memilih salah satu dari dua kelompok yang saling lepas, jadi total = jumlah pilihan di kelompok A + jumlah pilihan di kelompok B)",
};
