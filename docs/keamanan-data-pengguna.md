# 🔐 Keamanan Data Pengguna — Kombinara

> Rangkuman non-teknis untuk Tester & Validator  
> Agustus 2026

---

## 1. Login & Perlindungan Akun

**Yang sudah ada:**

- **Login wajib.** Semua halaman di Kombinara tidak bisa diakses tanpa login. Jika ada yang mencoba membuka halaman lewat URL langsung tanpa login, otomatis diarahkan ke halaman login.
- **Pemisahan peran.** Ada dua jenis pengguna: **Siswa** dan **Guru**. Siswa tidak bisa mengakses halaman Guru, dan sebaliknya. Setiap pengguna hanya bisa melihat data miliknya sendiri atau milik kelasnya (untuk Guru).
- **Login dengan Google.** Selain email & password biasa, siswa juga bisa login pakai akun Google.
- **Lupa password.** Tersedia halaman reset password yang aman.

**Apa artinya buat pengguna?**

> Tidak ada orang luar yang bisa masuk ke akunmu. Data belajarmu hanya bisa kamu lihat sendiri (dan gurumu untuk keperluan penilaian).

---

## 2. Perlindungan Password

**Yang sudah ada:**

- Password **tidak pernah disimpan apa adanya**. Kombinara menggunakan teknologi enkripsi `bcrypt` — password diacak menjadi kode yang tidak bisa dibalikkan. Bahkan developer pun tidak tahu password asli pengguna.
- Email pengguna **disamarkan** di semua catatan sistem. Contoh: `din***@gmail.com`.

**Apa artinya buat pengguna?**

> Kalau terjadi kebocoran data sekalipun, password-mu tetap aman karena sudah diacak.

---

## 3. Keamanan Ujian Online

**Yang sudah ada:**

- **Ujian diawasi otomatis.** Saat siswa mengerjakan asesmen formatif, sistem mencatat:
  - Apakah siswa **keluar dari mode layar penuh** (fullscreen)
  - Apakah siswa **pindah tab browser**
  - Apakah siswa melakukan **copy-paste** (tempel teks)
- **Sistem memberi tahu siswa** lewat notifikasi jika terdeteksi keluar dari mode ujian, dan menampilkan peringatan agar kembali fokus.
- **Tidak ada hukuman otomatis.** Sistem hanya mencatat kejadian — guru yang akan menilai secara manual.

**Apa artinya buat pengguna?**

> Ujian online di Kombinara punya pengawasan yang adil dan transparan. Siswa tahu apa yang dipantau. Tidak ada pemblokiran tiba-tiba tanpa pemberitahuan.

---

## 4. Upload File yang Aman

**Yang sudah ada:**

- Avatar/foto profil siswa **hanya boleh gambar** (JPG, PNG, dll.), bukan file program atau dokumen.
- Ukuran file **maksimal 5 MB** — tidak bisa upload file raksasa.
- File avatar disimpan di storage Supabase yang terproteksi.

**Apa artinya buat pengguna?**

> Tidak bisa upload file berbahaya (virus, program, dokumen asing) ke server Kombinara.

---

## 5. Download Modul yang Terkontrol

**Yang sudah ada:**

- PDF modul hanya bisa di-download oleh **siswa yang sudah menyelesaikan materi prasyaratnya**. Misalnya: modul Permutasi baru bisa di-download setelah materi Kaidah Pencacahan selesai.
- Link download **kedaluwarsa dalam 5 menit** — tidak bisa dibagikan ke orang lain.
- Hanya 6 file PDF resmi yang bisa di-download. Tidak bisa download file lain.

**Apa artinya buat pengguna?**

> Modul tidak bisa disebarkan sembarangan. Sistem memastikan siswa belajar secara berurutan sesuai alur pembelajaran.

---

## 6. Keamanan Data di Database

**Yang sudah ada:**

- **Data unik tidak bisa ganda:** Nomor absen siswa dijamin unik per kelas. Tidak mungkin ada dua siswa dengan nomor absen yang sama.
- **Penghapusan data berantai:** Kalau seorang siswa dihapus, semua data terkait (jawaban, progress, nilai) ikut terhapus rapi — tidak ada sampah data.
- **Query database aman:** Semua akses ke database menggunakan teknik yang mencegah serangan injeksi (SQL injection).

**Apa artinya buat pengguna?**

> Data rapi, konsisten, dan tidak bisa dimanipulasi oleh pihak luar lewat celah teknis.

---

## 7. Pemantauan & Notifikasi Error

**Yang sudah ada:**

- Jika terjadi error serius (misal: gagal daftar, error tak terduga), sistem **otomatis mengirim notifikasi** ke tim pengembang lewat Discord/Slack.
- Data sensitif **TIDAK dikirim** dalam notifikasi — hanya info teknis secukupnya.
- Semua aktivitas error tercatat di log sistem untuk investigasi.

**Apa artinya buat pengguna?**

> Kalau ada masalah, tim pengembang langsung tahu dan bisa segera memperbaiki — tanpa mengorbankan privasi data pengguna.

---

## 8. Penyimpanan Data Sementara (Cache)

**Yang sudah ada:**

- Data yang sering diakses (profil, materi, leaderboard) disimpan di cache Redis untuk mempercepat akses.
- Cache **otomatis dihapus** setiap kali data asli berubah — jadi data yang ditampilkan selalu data terbaru.
- Cache AI (chatbot) di-hash agar tidak bisa dibaca orang lain.

**Apa artinya buat pengguna?**

> Aplikasi terasa cepat, tapi data yang ditampilkan selalu akurat dan tidak basi.

---

## 📋 Ringkasan Singkat

| Aspek Keamanan | Status | Keterangan Singkat |
|---|---|---|
| Login wajib | ✅ | Semua halaman diproteksi |
| Peran pengguna (Siswa vs Guru) | ✅ | Tidak bisa akses halaman orang lain |
| Enkripsi password | ✅ | bcrypt — tidak bisa dibalikkan |
| Pengawasan ujian | ✅ | Fullscreen, tab, & paste terpantau |
| Upload file aman | ✅ | Hanya gambar, max 5MB |
| Download modul terkontrol | ✅ | Harus selesaikan prasyarat, link 5 menit |
| Data unik & konsisten | ✅ | Tidak ada duplikasi data |
| Notifikasi error real-time | ✅ | Tim langsung tahu jika ada masalah |
| Cache aman & selalu segar | ✅ | Data ditampilkan selalu terbaru |

---

## 🧪 Catatan untuk Tester & Validator

Saat menguji, perhatikan skenario berikut yang berkaitan dengan keamanan:

1. **Coba buka halaman tanpa login** → harus diarahkan ke `/login`
2. **Login sebagai Siswa, lalu coba akses `/guru`** → harus ditolak
3. **Upload avatar dengan file `.exe` atau `.pdf`** → harus ditolak
4. **Upload avatar dengan gambar > 5MB** → harus ditolak
5. **Coba download modul yang prasyaratnya belum selesai** → harus ditolak
6. **Kerjakan ujian, lalu keluar dari fullscreen** → harus muncul toast peringatan
7. **Saat ujian, pindah tab browser** → harus tercatat di sistem
8. **Lakukan copy-paste saat ujian** → harus tercatat di sistem
9. **Reset password** → pastikan email reset diterima dan prosesnya lancar

---

*Dokumen ini dibuat untuk keperluan pengujian dan validasi. Jika ada pertanyaan atau temuan, hubungi tim pengembang.*
