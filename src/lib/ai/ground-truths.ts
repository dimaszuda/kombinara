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
    "Aturan penjumlahan digunakan ketika memilih salah satu dari beberapa pilihan yang saling lepas (tidak bisa dipilih bersamaan). Intinya: hanya bisa pilih SATU, bukan kombinasi.",
  refleksi_penjumlahan_2:
    "Kata kunci: 'ATAU', 'pilih salah satu', 'alternatif', 'saling lepas', 'cuma bisa satu'. BUKAN kata kunci seperti 'DAN', 'sekaligus', atau 'bersamaan' (itu ciri perkalian).",
  refleksi_penjumlahan_3:
    "Contoh di sekolah: memilih menu kantin (nasi goreng ATAU mie ayam), memilih ekskul (basket ATAU futsal ATAU pramuka), memilih rute berangkat (jalan A ATAU jalan B). Semua situasi di mana kamu hanya bisa mengambil SATU pilihan.",

  // ── Refleksi Mini — Kaidah Perkalian ───────────────────────────
  refleksi_perkalian_1:
    "Aturan perkalian digunakan ketika ada beberapa tahap keputusan yang dilakukan berurutan dan setiap tahap punya beberapa pilihan independen. Intinya: memilih kombinasi dari beberapa kelompok secara bersamaan.",
  refleksi_perkalian_2:
    "Kata kunci: 'DAN', 'sekaligus', 'bersamaan', 'berurutan', 'tahap demi tahap', 'kombinasi'. BUKAN kata kunci seperti 'ATAU' atau 'pilih salah satu' (itu ciri penjumlahan).",
  refleksi_perkalian_3:
    "Contoh sehari-hari: menyusun outfit (baju DAN celana DAN sepatu), membuat password (digit 1 DAN digit 2 DAN digit 3), memilih menu lengkap (makanan DAN minuman DAN dessert). Semua situasi di mana kamu memilih dari BEBERAPA kelompok sekaligus.",

  // ── Refleksi Mini — Faktorial ─────────────────────────────────
  refleksi_faktorial_1:
    "Faktorial adalah notasi matematika untuk perkalian bilangan bulat positif menurun hingga 1. Contoh: 5! = 5×4×3×2×1 = 120. Faktorial digunakan untuk menghitung banyaknya susunan/urutan dari sejumlah objek.",
  refleksi_faktorial_2:
    "Faktorial diperlukan karena kaidah perkalian menghasilkan bentuk perkalian menurun seperti 4×3×2×1 yang bisa ditulis ringkas sebagai 4!. Jadi faktorial adalah cara singkat menuliskan hasil kaidah perkalian untuk kasus penyusunan semua objek.",
  refleksi_faktorial_3:
    "Cara menyederhanakan n!/(n-2)! adalah dengan menjabarkan n! = n×(n-1)×(n-2)!, lalu coret (n-2)! di pembilang dan penyebut, sehingga tersisa n×(n-1). Tidak perlu menghitung nilai faktorial secara penuh.",
  refleksi_faktorial_4:
    "Jawaban bersifat dugaan — siswa diharapkan menyadari bahwa faktorial muncul dalam rumus permutasi dan kombinasi karena kedua rumus tersebut melibatkan perkalian menurun (seperti 5×4×3) yang merupakan bentuk faktorial yang disederhanakan. Contoh: P(n,r) = n!/(n-r)! menggunakan faktorial untuk menghitung banyaknya susunan.",

  // ── Refleksi Mini — Permutasi ─────────────────────────────────
  refleksi_permutasi_1:
    "Permutasi adalah kaidah perkalian yang sudah 'diformulakan' untuk kasus di mana urutan penting. Bedanya: kaidah perkalian menghitung langkah demi langkah secara eksplisit (kotak 1 × kotak 2 × ...), sedangkan rumus permutasi P(n,r) = n!/(n-r)! langsung memberikan hasil tanpa perlu membuat kotak satu per satu. Intinya: permutasi adalah shortcut dari kaidah perkalian.",
  refleksi_permutasi_2:
    "Rumus permutasi dengan unsur yang sama digunakan ketika ada objek yang identik (kembar) dalam susunan. Contoh: menyusun huruf MATEMATIKA (M ada 2, A ada 3, T ada 2). Jika tidak ada unsur yang sama, gunakan permutasi biasa P(n,r) atau n!.",
  refleksi_permutasi_3:
    "Permutasi siklis digunakan untuk susunan MELINGKAR di mana tidak ada titik awal yang tetap (tidak ada 'posisi nomor 1'). Contoh: orang duduk mengelilingi meja bundar, gelang, kalung. Rumusnya P(siklis n) = (n−1)!, karena satu orang dijadikan patokan dan sisanya disusun linear.",
  refleksi_permutasi_4:
    "P(n,n) = n! karena jika kita menyusun SEMUA n objek yang berbeda dengan urutan diperhatikan, sama saja dengan menyusun n objek dalam satu baris penuh. Jumlah caranya persis n! (n × (n-1) × ... × 1). Secara intuitif: saat r = n, tidak ada objek yang 'tersisa' atau 'tidak terpakai', sehingga penyebut (n-r)! menjadi 0! = 1 dan rumus P(n,n) = n!/0! = n!.",
};

/**
 * Kombinasi — ground truth khusus untuk soal kombinasi.
 * Key = question_key (unik dalam konteks kombinasi).
 */
export const KOMBINASI_AI_GROUND_TRUTH: Record<string, string> = {
  // Mengapa Corner
  mengapa_dikali_ditambah:
    "Di dalam satu kasus (misalnya tepat 2 perempuan), pemilihan perempuan DAN pemilihan laki-laki terjadi bersamaan dalam satu tim yang sama — karena keduanya dibutuhkan sekaligus dalam tim itu, maka digunakan aturan perkalian (×). Antar kasus (tepat 2, tepat 3, tepat 4), kasus-kasus tersebut saling lepas (sebuah tim tidak mungkin sekaligus tepat 2 DAN tepat 3 perempuan), sehingga total tim adalah jumlah dari hasil setiap kasus — digunakan aturan penjumlahan (+).",

  // Contoh Soal c3_reason
  c3_reason:
    "Di dalam satu kasus (misalnya tepat 2 perempuan), pemilihan perempuan DAN pemilihan laki-laki terjadi bersamaan dalam satu tim yang sama — karena keduanya dibutuhkan sekaligus dalam tim itu, maka digunakan aturan perkalian (×). Antar kasus (tepat 2, tepat 3, tepat 4), kasus-kasus tersebut saling lepas (sebuah tim tidak mungkin sekaligus tepat 2 DAN tepat 3 perempuan), sehingga total tim adalah jumlah dari hasil setiap kasus — digunakan aturan penjumlahan (+).",

  // Refleksi Mini
  refleksi_1:
    "C(n,r) = P(n,r) / r! — kombinasi adalah permutasi yang dibagi dengan faktorial banyaknya cara menyusun r objek yang dipilih. C(n,r) = C(n, n−r) karena memilih r objek dari n sama dengan memilih n−r objek yang tidak dipilih. Secara intuitif: menentukan siapa yang masuk tim sama dengan menentukan siapa yang tidak masuk tim.",
  refleksi_2:
    "Kombinasi: memilih 3 perwakilan kelas dari 8 siswa (urutan tidak penting, tidak ada jabatan). Permutasi: memilih ketua, wakil, dan sekretaris dari 8 siswa (urutan penting, jabatan berbeda). Perbedaan kuncinya: kombinasi untuk pemilihan tanpa urutan/jabatan, permutasi untuk penyusunan dengan urutan/jabatan.",
  refleksi_3:
    "Kombinasi perlu digabungkan (dijumlahkan) ketika soal memiliki syarat seperti 'minimal' atau 'maksimal'. Contoh: minimal 2 perempuan berarti menjumlahkan kasus tepat 2 + tepat 3 + tepat 4 perempuan. Setiap kasus dihitung dengan aturan perkalian (memilih perempuan DAN laki-laki), lalu hasil tiap kasus dijumlahkan karena kasus-kasusnya saling lepas.",
  refleksi_4:
    "Urutan belajar: Kaidah Perkalian (dasar: memilih bertahap) → Faktorial (notasi ringkas perkalian menurun) → Permutasi (susunan dengan urutan) → Kombinasi (pemilihan tanpa urutan). Urutan ini masuk akal karena setiap konsep dibangun di atas konsep sebelumnya: faktorial adalah alat tulis untuk kaidah perkalian, permutasi = kaidah perkalian yang diformulakan dengan faktorial, kombinasi = permutasi yang dibagi faktorial untuk menghilangkan urutan. Jika kombinasi diajarkan duluan, siswa tidak akan punya fondasi untuk memahami dari mana rumus C(n,r) berasal.",
};

/** Deep Learning — keyed by concept_id */
export const DEEP_LEARNING_GROUND_TRUTH: Record<string, string> = {
  kaidah_penjumlahan:
    "Untuk setiap situasi, pilihan bersifat saling lepas (tidak bisa memilih keduanya sekaligus). Boleh keduanya: Tidak. Total pilihan = jumlah pilihan A + pilihan B (3+2=5, 4+2=6, 6+8=14). Ada pola konsisten: Ya, operasi matematika yang digunakan adalah penjumlahan.",

  kaidah_perkalian:
    "Pengisian tempat: kotak 1=5, kotak 2=4, kotak 3=3 (karena tanpa pengulangan, setiap digit yang sudah dipakai tidak bisa dipakai lagi). Total PIN yang mungkin = 5×4×3 = 60. Diagram pohon: 2 makanan × 3 minuman = 6 kombinasi menu. Simpulan: kaidah perkalian digunakan untuk kejadian bertahap/berurutan, berbeda dengan penjumlahan yang digunakan untuk pilihan alternatif/saling lepas.",

  faktorial:
    "Tabel faktorial: 5!=120, 6!=720, 7!=5040, 8!=40320, 9!=362880, 10!=3628800. Pola rekursif: n!=n×(n-1)!. 0!=1 (bukan 0). Sifat rekursif n!=n×(n-1)! selalu berlaku untuk n≥1. Faktorial digunakan untuk menghitung banyaknya cara menyusun n objek berbeda dalam urutan.",
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
