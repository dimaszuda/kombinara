**MATERI 5: KOMBINASI**

1. **Eksplorasi Kontekstual**

**Situasi Nyata**: Tim basket membutuhkan 5 pemain dari 10 kandidat yang ada. Tidak ada perbedaan posisi — semua pemain memiliki peran setara. Berapa banyak tim berbeda yang bisa dibentuk?

Diskusikan: 

1. Apakah tim {Ari, Budi, Cici, Deni, Eka} berbeda dengan tim {Eka, Deni, Cici, Budi, Ari}? *Ya/Tidak*  
2. **Tidak**\! Kedua kelompok itu tim yang sama, hanya urutan penyebutannya berbeda.  
3. Jadi, dalam konteks ini, **urutan tidak penting**  
     
2. **Aktivitas Deep Learning**

**🔍 Eksplorasi**: Hilangkan Urutan yang Berlebihan\!   
Dari 4 orang {A, B, C, D}, buat semua kelompok 2 orang:   
Langkah 1: Daftar semua permutasi 2 dari 4 orang: 

| Susunan Ke- | Anggota | Anggota | Susunan |
| :---: | :---: | :---: | :---: |
| 1 | A | B | AB |
| 2 | A | C | AC |
| 3 | A | D | AD |
| 4 | B | A | BA |
| 5 | B | C | BC |
| 6 | B | D | BD |
| 7 | C | A | CA |
| 8 | C | B | … |
| 9 | C | … | … |
| 10 | … | … | … |
| 11 | … | … | … |
| 12 | … | … | … |

AB, AC, AD, BA, BC, BD, CA, CB, CD, DA, DB, DC → 12 susunan 

Geser lalu tempelkan pada kotak yang memiliki anggota yang sama\!

Langkah 2: Kelompokkan susunan yang membentuk tim yang sama:   
{AB, BA} → Tim AB \= Tim BA   
{AC, CA} → Tim AC \= Tim CA   
{AD, DA} → ...   
{…, …} → ...  
{…, …} → ...  
{…, …} → ...  
Langkah 3: Hitung total kelompok yang benar-benar berbeda: \_\_\_\_   
Verifikasi: 12 susunan2\! \= \_\_\_\_ (karena setiap kelompok 2 orang dihitung 2\! \= 2 kali)   
🔗 Apakah kamu melihat hubungannya? **Kombinasi \=** Permutasi Faktorial urutan

3. **Penjelasan Konsep**

**Kombinasi**

**Definisi**: Kombinasi adalah pemilihan objek-objek dari sekelompok objek tanpa memperhatikan urutan.

Rumus Kombinasi r dari n objek:

Cn,r=n r \=n\!r\!n-r\!=P(n,r)r\!

**Intuisi Rumus**:

1. Mulai dari semua permutasi Pn,r=n\!n-r\!  
   2. Karena urutan tidak penting, **bagi dengan banyaknya cara menyusun r objek yang dipilih**: r\!  
   3. Hasilnya: Cn,r=n\!r\!n-r\!

**Sifat – Sifat Kombinasi**:

| Sifat | Rumus | Makna |
| :---- | :---- | :---- |
| Simetri | Cn,r=C(n, n-r)  | Memilih r sama dengan memilih n-r |
| Ujung | Cn,0=Cn, n=1  | Ada 1 cara memilih semua atau tidak ada |
| Pascal | Cn,r=Cn-1, r-1+C(n-1,r)  | Segitiga Pascal |

4. **Contoh Soal Bertahap**

📝 **Contoh 1 (Mudah)**   
Soal: Dari 8 siswa, akan dipilih 3 orang sebagai perwakilan kelas. Berapa banyak pilihan yang mungkin?   
Langkah Berpikir: 

* Tidak ada perbedaan antar perwakilan → urutan tidak penting → **Kombinasi**   
    
* C8,3=8\!3\!8-3\!

  \=8×7×63×2×1 

  \=3366  

  \=… 

Jasi ada 56 pilihan yang mungkin.  
📝 **Contoh 2 (Sedang)**   
Soal: Dalam sebuah rapat dihadiri 10 orang. Jika setiap orang bersalaman dengan semua orang lainnya tepat sekali, berapa total jabat tangan yang terjadi?   
Langkah Berpikir: 

* Jabat tangan melibatkan 2 orang → pilih 2 dari 10\.   
* Urutan tidak penting (A-B \= B-A dalam jabat tangan).   
* C10,2=10\!2\!8\!

  \=… ×… 

  \=…   

Jadi total jabat tangan ada 45\.

📝 **Contoh 3 (HOTS)**   
Soal: Dari 5 siswa laki-laki dan 4 siswa perempuan, akan dibentuk tim beranggotakan 4 orang yang terdiri atas minimal 2 perempuan. Berapa banyak tim yang mungkin?   
Langkah Berpikir:   
**Kasus yang memenuhi "minimal 2 perempuan":** 

| Sifat | Perempuan | Laki \- Laki | Perhitungan | Hasil |
| ----- | ----- | ----- | ----- | ----- |
| Tepat 2 perempuan | 2 dari 4 | 2 dari 5 | C(4,2)×C5,2   | …  … \= … |
| Tepat 3 perempuan | 3 dari 4 | 1 dari 5 | C(4,2)×C(5,2)  |  …  … \= … |
| Tepat 4 perempuan | 4 dari 4 | 0 dari 5 | C(4,2)×C(5,2)  | …  … \= … |

Total tim yaitu …  …  … \= … tim  
Kenapa dikali? Bukan ditambah? Tuliskan pendapatmu dikotak berikut\!

5. **“Mengapa?” Corner** 

💡 **Mengapa kombinasi membagi dengan** r\!**?**   
Bayangkan kamu sudah menghitung semua permutasi dari r objek terpilih. Tapi karena urutan tidak penting, setiap "tim" yang sama terhitung r\! kali (sebanyak cara menyusun r anggota). Untuk mendapat jumlah tim yang **benar-benar berbeda**, kita bagi dengan r\!  
Analogi: Jika kamu punya 6 foto yang semuanya adalah foto yang sama tapi dari sudut berbeda, jumlah foto **unik**\-nya adalah 6 : 6 \= 1\. Kombinasi bekerja persis seperti ini\!

1. **Permutasi vs Kombinasi: Panduan Definitif**

| Pertanyaan | Permutasi | Kombinasi |
| :---- | :---- | ----- |
| Apakah urutan berpengaruh? | Ya | Tidak  |
| Contoh Nyata | Juara 1, 2, 3 | Anggota Tim |
| Rumus | n\!n-r\! | n\!r\!n-r\! |
| Kata Kunci Soal | Susunan, urutan, kode, jabatan | Kelompok, tim, memilih, komite |
| Apakah AB  BA | Berbeda | Sama |

**⚠ Miskonsepsi Terbesar**: Banyak siswa menggunakan kombinasi untuk semua soal "memilih". Ingat: kalau ada jabatan/posisi/urutan, itu permutasi\!

2. **Refleksi mini**

✅ Pikirkan dan jawab: 

1. Jelaskan hubungan matematis antara C(n,r) dan P(n,r). Mengapa C(n,r)=C(n,n-r)?

 

2. Berikan satu contoh nyata yang membutuhkan kombinasi dan satu yang membutuhkan permutasi. Jelaskan alasannya\! 

 


   3. Dalam soal apa kamu perlu menggabungkan beberapa kombinasi? (Petunjuk: lihat Contoh 3 di atas)

   

   

   

   4. Sekarang kamu sudah mempelajari kelima konsep: Kaidah Perkalian → Faktorial → Permutasi → Kombinasi. Gambarkan atau jelaskan dengan kalimatmu sendiri alur keterhubungan kelima konsep tersebut. Mengapa urutan belajarnya seperti ini, bukan urutan yang lain (misalnya kombinasi diajarkan duluan)?

   

