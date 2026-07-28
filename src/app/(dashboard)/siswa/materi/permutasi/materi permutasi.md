**MATERI 4: PERMUTASI**

* **Permutasi r Unsur dari n Unsur**  
1. **Eksplorasi Kontekstual**

**Situasi Nyata**: Dalam sebuah lomba lari, terdapat 8 peserta. Tiga posisi teratas (Juara 1, 2, dan 3\) akan mendapat medali yang berbeda (emas, perak, perunggu). Berapa banyak kemungkinan perolehan medali yang bisa terjadi? (Instruksi ke AI \- buat gambar real yang maju ke podium ya, kasih placeholder src nya aja gpp)

Pikirkan dulu:  
Apakah “Juara 1: Ari, Juara 2: Budi, Juara 3: Cici sama dengan “Juara 1: Budi, Juara 2: Ari, Juara 3: Cici? ABC apakah sama dengan BAC? Ya/Tidak  
Berikan alasanmu?

Coba kamu hitung berapa banyak perolehan medali yang bisa terjadi\!  
Langkah perhitungan:

Inilah inti dari permutasi: **urutan sangat penting.**

2. **Aktivitas Deep Learning**

🔍 **Eksplorasi: Urutan Itu Penting\!**   
**Aktivitas 1**  
Dari 3 huruf {A, D, I}, buat semua susunan 2 huruf yang mungkin (**tanpa pengulangan**): Lengkapi tabel berikut:

| Susunan Ke- | Huruf 1 | Huruf 2 | Susunan |
| :---: | :---: | :---: | :---: |
| 1 | A | D | AD |
| 2 | A | I | AI |
| 3 | D | A | DA |
| 4 | D | … | … |
| 5 | … | … | … |
| 6 | … | … | … |

Berapa total susunan? \_\_\_\_   
Verifikasi dengan Kaidah Perkalian: 3 × … \= \_\_\_\_   
Coba menggunakan representasi yang lain (kotak pengisian)  
Ada berapa tempat atau kedudukan? \_\_\_ Kedudukan apa saja? Sebutkan\! \_\_\_\_\_\_  
Berarti kamu butuh berapa kotak pengisian? \_\_\_

Huruf 1 berapa kemungkinan yang bisa menduduki? \_\_\_  
Huruf 2 berapa kemungkinan yang bisa menduduki? \_\_\_ berikan alasannya\!

Jadi total susunan huruf yang bisa dibuat adalah sebanyak \_\_\_\_ cara.

Hubungkan dengan faktorial: 3\!3-2\! \= \_\_\_\_

Apakah ketiga cara di atas menghasilkan jawaban yang sama? Mengapa?

**Aktivitas 2 — Nalar: Temukan Polanya**

Lengkapi tabel berikut menggunakan cara yang sama:

| Banyak huruf (n) | Susunan huruf (r) | Cara (Kaidah Perkalian) | Dalam bentuk faktorial | Nilai |
| :---: | :---: | :---: | :---: | :---: |
| 4 | 2 | 4×3 | 4\!2\! | 12 |
| 5 | 2 | 5×4 | 5\!3\! | 20 |
| 5 | 3 | 5×4×3 | 5\!\_\_\_\! | \_\_\_ |
| 6 | 2 | \_\_\_\_\_\_\_ | 6\!\_\_\_\! | \_\_\_ |
| 6 | 3 | \_\_\_\_\_\_\_ | \_\_\_\_\_\_\_ | \_\_\_ |
| n | r | \_\_\_\_\_\_\_ | \_\_\_\_\_\_\_ | \_\_\_ |

**Dari baris terakhir, tuliskan rumus umum yang kamu temukan:**

Pn,r=…

**Aktivitas 3 — Diskusikan: Uji Pemahamanmu**

Diskusikan dengan teman sebangku:

**(a)** Mengapa penyebut rumusmu adalah (n-r)\! dan bukan r\!?

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**(b)** Apa yang terjadi jika r=n? Berapa nilai P(n,n)? Mengapa hasilnya n\!?

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**(c)** Kembali ke soal podium awal — 8 pelari, 3 posisi. Sekarang hitung dengan rumus yang kamu temukan\!

P(8,3)=\_\_\_\!(\_\_\_-\_\_\_)\!=\_\_\_\!\_\_\_\!=\_\_\_\_

**Aktivitas B4 — Simpulkan**

Sebelum melihat penjelasan resmi, tuliskan dengan kalimatmu sendiri:

\*"Permutasi P(n,r) digunakan ketika..."\*

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*"Rumus P(n,r)=n\!(n-r)\! terbentuk karena..."\*

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3. **Penjelasan Konsep**

**Permutasi**   
**Definisi**: Permutasi adalah susunan objek-objek yang diambil dari sekelompok objek dengan **memperhatikan urutan**.   
Rumus Permutasi r dari n Objek:  
Pn,r=n\!n-r\!=n×n-1n-2×…×n-r+1

**Di mana**:   
*n* \= banyak objek yang tersedia  
*r* \= banyak objek yang diambil/disusun   
r≤n   
Apa yang terjadi jika r\>n? Coba jelaskan pendapatmu\!

**Intuisi Rumus**:   
Posisi ke-1: ada n pilihan   
Posisi ke-2: ada (n – 1\) pilihan

Posisi ke- r: ada n – r \+ 1 pilihan   
Total \= n(n \-1)(n-2)(n-r+1) \= n\!(n-r)\!  
**Kasus Khusus — Permutasi Semua Objek:**  
P(n,n) \= n\! 

* **Permutasi dengan Unsur yang Sama**  
1. **Eksplorasi Kontekstual**

**Situasi Nyata**: **“Password Wifi”**  
Abdi dan Gian ingin menggunakan wifi sekolah untuk mengerjakan tugas. Admin sekolah hanya memberitau kalau password wifi sekolah berasal dari kata “ADA” yang hurufnya di bolak – balik dan belakangnya ditambahi pagar. Mereke berdua ingin tahu berapa banyak percobaan memasukkan password sehingga mereka dapat menggunakan wifi tersebut. (Instruksi ke AI \- Beri gambar seperti masukkan password wifi itu ya, biar seolah \- olah siswa benar \- benar memasukkan password )

Abdi berkata: ‘Gampang itu, hurufnya kan ada 3 berarti **3\! \= 6 kali percobaan’**. Gian menyela: “Tunggu dulu, ada dua huruf E yang sama lho. **Apakah susunan A1A2D dan A2A1D benar – benar berbeda**?”  
Menurutmu siapa yang benar? \_\_\_\_\_  
Mengapa? Jelaskan alasanmu\!

2. **Aktivitas Deep Learning**

**Aktivitas 1: Amati (Visualisasi Masalah)**

Dari kata ADA, berapa susunan kata yang bIsa dibentuk? (dua huruf A identik)

*Langkah 1*: **Beri label dulu:** Anggap dua A berbeda: A₁ dan A₂.

Daftar SEMUA susunan:

| Susunan (dengan label) | Susunan (tanpa label) | Keterangan |
| :---: | :---: | :---: |
| A1A2D | AAB | \- |
| A2A1B | AAB | Sama dengan baris 1 |
| A1BA2 | ABA | \- |
| A2BA1 | … | Sama dengan baris 3 |
| A1BA2 | … | \- |
| A2BA1 | … | Sama dengan baris 5 |

*Langkah 2*: Analisis

Tanpa label, berapa susunan yang **benar-benar berbeda**? \_\_\_\_

Dari 3\!=6 susunan, setiap susunan unik muncul sebanyak \_\_\_ kali.

Angka itu sama dengan \_\_\_\_\! (faktorial dari banyaknya huruf yang sama)

*Langkah 3*: Hitung  
Susunan berbeda \= 3\!2\!=62=\_\_\_\_\_

Cocok dengan daftar manual? \_\_\_\_\_\_

**Aktivitas 2: Nalar (Temukan Pola)**

Perluasan pola — lengkapi tabel:

| Huruf | Total huruf (n) | Huruf berulang | Rumus | Hasil |
| :---- | :---: | ----- | :---: | :---: |
| A, A, B | 3 | A=2 | 3\!2\! | 3 |
| A, A, B, B | 4 | A=2, B=2 | 4\!2\!⋅2\! | 6 |
| A, A, A, B | 4 | A=3 | 4\!3\! | \_\_\_\_ |
| M, A, T, A | 4 | A=2 | \_\_\_\_\_\_\_ | \_\_\_\_ |
| B, E, B, A, S | 5 | B=2 | \_\_\_\_\_\_\_ | \_\_\_\_ |
| Huruf pilihanmu: \_\_\_\_ | \_\_\_ | \_\_\_\_\_ | \_\_\_\_\_\_\_ | \_\_\_\_ |

**Dari tabel, tuliskan rumus umum:**

Psama\=n\!\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3. **Penjelasan Konsep**

Jika dari *n* objek terdapat objek-objek yang sama (misal: k1 objek sama jenis 1, k2 objek sama jenis 2, dst.), maka:  
P=n\!k1\!k2\!k3\!…

**Mengapa dibagi faktorial**? Karena susunan objek-objek yang sama satu sama lain tidak menghasilkan susunan yang berbeda.

* **Permutasi Siklis**  
1. **Eksplorasi Kontekstual**

**Situasi Nyata**: Pengurus OSIS terdiri dari **4 orang** (Ari, Budi, Cici, Dani) akan mengadakan rapat duduk **melingkari meja bundar**. Sekretaris mencatat semua kemungkinan tempat duduk.  
Ia mulai dengan cara biasa: \*"4 orang berjajar \= 4\!=24cara."\*  
Tapi ketua OSIS mengoreksi: *"Kita duduk melingkar, bukan berjajar. Coba perhatikan ini..."*  
![][image1]  
![][image2]  
Semua gambar di atas menunjukkan susunan yang sama di meja bundar — hanya diputar\!   
Menurutmu, apakah penjelasan ketua OSIS benar? Ya / Tidak  
Jika ya, berapa susunan yang benar – benar berbeda menurutmu? \_\_\_\_

2. **Aktivitas Deep Learning**

**Aktivitas 1: Amati (Selidiki Rotasi)**

Dari **3 orang** (A, B, C) duduk melingkar — mulai dari yang paling sederhana.

**Langkah 1: Daftar semua permutasi linear: (duduk berjajar)**

3\!=6 susunan: ABC, ACB, BAC, BCA, CAB, CBA

**Langkah 2: Kelompokkan yang merupakan rotasi satu sama lain:**

| Kelompok | Susunan yang Sama (Rotasi) | Susunan Melingkar Unik |
| :---- | :---- | :---- |
| 1 | ABC → BCA → CAB | {A, B, C} searah jarum jam |
| 2 | ACB → CBA → BAC | {A, C, B} searah jarum jam |

Dari 3\!=6 susunan linear, hanya ada \_\_\_ susunan melingkar yang unik.

Setiap susunan melingkar muncul \_\_\_\_ kali dalam daftar permutasi linear.

Angka itu sama dengan \_\_\_\_ (banyaknya orang yang duduk melingkar).

**Langkah 3: Hitung**

Psiklis(3)=3\!3=63=\_\_\_\_

**Aktivitas B2 — Nalar: Temukan Pola**

Lakukan hal yang sama untuk berbagai nilai n:

| n | Susunan Linear (n\!) | Setiap susunan melingkar unik muncul berapa kali? | Susunan Melingkar Unik |
| :---: | :---: | :---: | :---: |
| 3 | 3\!=6 | 3 kali | 63=2 |
| 4 | 4\!=24 | \_\_\_ kali | 244=\_\_\_ |
| 5 | 5\!=\_\_\_ | \_\_\_ kali | \_\_\_ : \_\_\_= \_\_\_ |
| 6 | 6\!=\_\_\_ | \_\_\_ kali | \_\_\_ |
| n | n\! | \_\_\_ kali | \_\_\_ |

**Dari baris terakhir:**

Psiklis(n)=n\!n=\_\_\_\_\_

3. **Penjelasan Konsep**

**Permutasi Siklis**

Permutasi Siklis adalah susunan objek-objek yang membentuk lingkaran tertutup, di mana rotasi dari susunan yang sama dianggap identik.  
Psiklis((n)=n-1\!

Mengapa (n −1)\!?

* Dalam susunan linear, ada n\! cara.  
* Dalam susunan melingkar, setiap kelompok susunan yang sama dihitung *n* kali (sebanyak rotasi yang mungkin).   
* Maka: n\!n=n-1\! 

**Cara mudah memahaminya**:"Kunci" satu orang di satu posisi sebagai titik referensi. Susun sisa (n-1) orang di posisi yang lain → (n-1)\! cara.

**Permutasi Siklis Khusus: Objek dengan dua sisi**  
Untuk benda seperti **kalung, gelang, atau cincin** — membaliknya menghasilkan susunan yang dianggap sama (karena kalung bisa dipakai di kedua sisi).  
Pkalung(n)=n-1\!2

💡 **Dibagi 2 karena setiap susunan dan bayangannya (hasil membalik) dianggap identik.**

4. **Contoh Soal Bertahap**

📝 **Contoh 1 (Mudah)**   
Soal: Dari 6 calon pengurus OSIS, akan dipilih Ketua, Sekretaris, dan Bendahara. Berapa banyak susunan pengurus yang mungkin?   
**Langkah Berpiki**r:

* Ini permutasi karena jabatan berbeda → urutan penting.   
* n \=6, r=3   
* P6,3= 6\!6 \-3\! 

\=6\!3\!

	\=… × … × … × …  
\=…×…×…

	\=…

**📝 Contoh 2 (Mudah)**  
**Soal:** Enam orang pengurus OSIS akan duduk mengelilingi meja bundar untuk rapat. Berapa banyak susunan tempat duduk yang berbeda?   
**Langkah Berpikir:**  
**Langkah 1 — Identifikasi situasi:** Apakah ada "kursi nomor 1" di meja bundar? → **Tidak** — tidak ada titik referensi yang membedakan posisi. → Susunan melingkar → **gunakan permutasi siklis**.  
**Langkah 2 — Terapkan rumus:**

Psiklis(6)=(6-1)\!=\_\_\_\!=  \_\_\_\_\_\_\_

**Langkah 3 — Masuk akal?** Jika duduk berjajar: 6\!=720 susunan. Melingkar lebih sedikit karena rotasi dianggap sama: 720÷6=120. ✓

📝 **Contoh 3 (Sedang)**  
**Soal:** Pengurus OSIS terdiri dari 10 siswa. Akan dipilih Ketua, Wakil Ketua, Sekretaris, dan Bendahara. Jika Rafi hanya bersedia menjadi Ketua atau tidak ikut sama sekali, berapa banyak susunan pengurus yang mungkin?  
**Langkah Berpikir:**  
**Langkah 1 — Identifikasi syarat:** Ada syarat khusus untuk Rafi → soal harus **dipilah menjadi kasus**.  
**Langkah 2 — Pilah kasus:**  
*Kasus 1: Rafi menjadi Ketua*

* Posisi Ketua → hanya Rafi: **1 cara**  
* Posisi Wakil, Sekretaris, Bendahara → diisi 9 siswa tersisa secara berurutan:  
  P9,3= 9\!9-3\!

\=…×…×…

\=…

* Subtotal Kasus 1 \= 1×504=504

*Kasus 2: Rafi tidak ikut*  
Rafi dikeluarkan → tersisa 9 siswa untuk 4 posisi:  
P(9,4)=9×8×7×6=\_\_\_\_\_

* Subtotal Kasus 2 \= 3.024

**Langkah 3 — Gabungkan:** Kedua kasus saling lepas → **Kaidah Penjumlahan**:   
Total\=504+3.024=\_\_\_\_\_\_\_\_susunan

💡 ***Strategi: Selalu dahulukan posisi atau orang yang memiliki syarat khusus — baru isi posisi lainnya.***

📝 **Contoh 4 (Sedang)**  
Soal: Berapa banyak cara menyusun huruf-huruf dari kata "MATEMATIKA"?  
**Langkah Berpikir**: 

* Kata "MATEMATIKA" memiliki 9 huruf: M-A-T-E-M-A-T-I-K-A → tunggu, mari hitung: M(2), A(3), T(2), E(1), I(1), K(1) → total 10 huruf.   
* Karena ada huruf yang sama, **gunakan permutasi dengan pengulangan** atau permutasi beberapa unsur yang sama:

P    \=10\!2\!.3\!.2\!.1\!.1\!.1\!

\=36288002.6.2

\=362880024

\=151.200

**📝 Contoh 5 (Sedang)**  
**Soal:** Lima pasang suami-istri akan duduk mengelilingi meja bundar. Berapa banyak susunan yang mungkin jika setiap suami harus duduk di sebelah istrinya? 

**Langkah Berpikir:**  
**Langkah 1 — Strategi: gabungkan tiap pasang menjadi satu blok:** Karena suami dan istri harus berdampingan, anggap setiap pasang sebagai **satu blok**. → Ada 5 blok yang disusun melingkar.  
**Langkah 2 — Hitung susunan melingkar 5 blok:**  
Psiklis5=…-…\!…\!=\_\_\_\_\_

**Langkah 3 — Hitung susunan dalam setiap blok:** Dalam setiap pasang, suami dan istri bisa bertukar posisi (suami di kiri atau di kanan istri):   
2\!=2 cara per pasang

**Langkah 4 — Kalikan:**  
Total\=24×25=24×\_\_\_\_=\_\_\_\_\_\_\_ susunan

💡 *Strategi blok: ketika ada syarat "harus berdampingan", gabungkan objek tersebut menjadi satu unit terlebih dahulu — baru hitung susunan antar blok, lalu kalikan dengan susunan di dalam blok.*

📝 **Contoh 6 (HOTS)**   
**Soal:** Berapa banyak bilangan yang terdiri dari angka-angka {1, 1, 2, 2, 3} yang dapat dibentuk jika nilainya **lebih dari 20.000**?  
---

**Langkah Berpikir:**  
**Langkah 1 — Identifikasi situasi:**

* Total angka: 5 digit → bilangan 5 digit  
* Ada angka berulang: 1 muncul 2 kali, 2 muncul 2 kali  
* Ada syarat tambahan: nilai \> 20.000 → **digit pertama (puluhan ribu) ≥ 2** → Pilah kasus berdasarkan digit pertama.  
  **Langkah 2 — Tentukan digit pertama yang memenuhi syarat \> 20.000:** Digit pertama bisa: **2** atau **3**

*Kasus 1: Digit pertama \= 2*

* Sisa 4 angka yang disusun: {1, 1, 2, 3} (angka 2 tersisa 1\)

P=4\!2\!=242=\_\_\_

*Kasus 2: Digit pertama \= 3*

* Sisa 4 angka yang disusun: {1, 1, 2, 2}

P=4\!\_\_\_\!⋅\_\_\_\!=24\_\_\_=\_\_\_\_\_

**Langkah 3 — Gabungkan:**  
Total\=\_\_\_\_+\_\_\_\_=\_\_\_\_\_\_bilangan

💡 ***Perhatikan: di setiap kasus, sisa angka yang tersusun berbeda komposisinya — sehingga rumus penyebutnya pun berbeda. Teliti dalam mengidentifikasi angka yang tersisa\!***

**📝 Contoh 7 (HOTS)**  
**Soal:** Delapan siswa akan duduk mengelilingi meja bundar. Di antara mereka, Ari dan Budi berseteru dan tidak mau duduk berdekatan. Berapa banyak susunan tempat duduk yang mungkin? (buatkan simulasinya jika memungkinkan ya mas)  
---

**Langkah Berpikir:**  
**Langkah 1 — Pilih strategi:** Menghitung langsung (Ari dan Budi tidak berdekatan) lebih rumit. → Gunakan **strategi komplemen**:  
Ari-Budi tidak berdekatan \= Total semua susunan – (Ari-Budi berdekatan)

**Langkah 2 — Hitung total semua susunan:**  
Psiklis(8)=(8-1)\!=7\!=\_\_\_\_\_\_\_

**Langkah 3 — Hitung susunan di mana Ari dan Budi berdekatan:**  
Gabungkan Ari dan Budi sebagai satu blok → ada 7 "objek" yang disusun melingkar:  
Psiklis(7)=(7-1)\!=6\!=\_\_\_\_\_\_

Dalam blok, Ari dan Budi bisa bertukar posisi:  
2\!=\_\_\_\_ cara

* Susunan Ari-Budi berdekatan \= 720×\_\_\_\_=\_\_\_\_\_\_\_

**Langkah 4 — Hitung komplemen:**  
Total\=\_\_\_\_\_\_-\_\_\_\_\_\_\_=\_\_\_\_\_\_\_\_\_\_ susunan

💡 ***Strategi komplemen sangat efisien ketika syarat "tidak boleh" lebih mudah dihitung daripada syarat "harus". Selalu pertimbangkan dua strategi sebelum memutuskan mana yang lebih mudah.***

5. **“Mengapa?” Corner**

💡 **Mengapa urutan penting dalam permutasi?**   
Pikirkan password "1234" vs "4321" — meski menggunakan angka yang sama, kedua password ini berbeda dan tidak saling membuka kunci. Dalam permutasi, **konteks menentukan apakah urutan bermakna**. Jabatan Ketua dan Sekretaris berbeda meski orangnya sama — itulah permutasi dalam kehidupan nyata.   
**Tes cepat**: Tanya dirimu sendiri, "Apakah urutan A-B dan B-A menghasilkan hasil yang berbeda?" Jika YA → Permutasi. Jika TIDAK → bukan Permutasi.

6. **Refleksi mini**

✅ Pikirkan dan jawab: 

1. Apa yang membedakan permutasi dari sekadar menggunakan Kaidah Perkalian?

2. Kapan kita menggunakan rumus permutasi dengan unsur yang sama?

3. Kapan kita menggunakan rumus permutasi siklis?

4. Mengapa Pn,n=n\! ? Jelaskan secara intuitif.

   

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>