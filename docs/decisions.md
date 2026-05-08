# Decisions & Trade-offs

Catatan keputusan teknis penting selama development. Update ini setiap ada keputusan signifikan.

---

## AI Model Routing

**Keputusan:** Hybrid model — Haiku untuk Q&A casual, Sonnet 4 untuk high-stakes.

**Alasan:** Haiku jauh lebih murah dan cepat, cukup untuk menjawab pertanyaan kontekstual sederhana. Sonnet 4 dipakai hanya saat output-nya berdampak langsung ke nilai siswa (handwritten grading, depth scoring) karena reasoning-nya lebih akurat untuk matematika.

**Trade-off:** Complexity routing, tapi cost savings signifikan di scale.

---

## Semantic Caching via Upstash Redis

**Keputusan:** Cache AI response dengan TTL 24 jam, key dari hash content pertanyaan.

**Alasan:** Banyak siswa akan tanya hal serupa dari materi yang sama. Cache mengurangi latency dan biaya API drastis.

**Trade-off:** MVP menggunakan exact-match hash (bukan embedding similarity). Semantic similarity caching (pakai vector distance) bisa ditambahkan di Phase 5 kalau budget memungkinkan.

---

## Edge Runtime untuk AI Endpoints

**Keputusan:** Semua `/api/ai/*` menggunakan Edge Runtime.

**Alasan:** TTFT (Time to First Token) lebih rendah karena request tidak perlu cold start Node.js container. Kritis untuk streaming Q&A.

**Trade-off:** Edge Runtime tidak support semua Node.js API. Prisma tidak bisa dipakai di Edge — simpan hasil ke DB via API Route terpisah yang Node.js runtime, atau pakai Supabase JS client langsung.

---

## Incremental Answer Submission

**Keputusan:** Setiap jawaban soal dikirim ke backend saat siswa submit per soal, bukan batch di akhir.

**Alasan:** Anti-cheat — kalau browser crash atau tab ditutup paksa, jawaban yang sudah disubmit tidak hilang. Juga mempersulit manipulasi jawaban setelah waktu habis.

**Trade-off:** Lebih banyak request ke backend, tapi payload kecil jadi tidak masalah.

---

## Intersection Observer untuk Reading Engagement

**Keputusan:** Track time-on-section per heading section, bukan scroll percentage.

**Alasan:** Scroll percentage tidak akurat — siswa bisa scroll cepat tanpa baca. Intersection Observer mengukur berapa lama section visible di viewport, jauh lebih representatif.

**Trade-off:** Implementasi lebih kompleks, perlu section ID yang konsisten di TipTap JSON.

---

## Materialized View untuk Leaderboard

**Keputusan:** Leaderboard query dari PostgreSQL materialized view, bukan query live.

**Alasan:** Query agregasi activity score + completion rate dari banyak tabel akan lambat jika real-time, terutama saat banyak siswa aktif bersamaan.

**Trade-off:** Data leaderboard tidak real-time — ada delay refresh. Acceptable karena leaderboard bukan fitur mission-critical yang butuh instant update.

---

## TipTap JSON sebagai Format Materi

**Keputusan:** Konten materi disimpan sebagai TipTap JSON di kolom `Json` Prisma.

**Alasan:** Fleksibel, extensible, dan native ke TipTap editor/renderer. Tidak perlu parsing Markdown.

**Trade-off:** Tidak human-readable di DB, harder to query isi konten langsung via SQL. Acceptable karena konten dibaca via aplikasi, bukan langsung via DB.
