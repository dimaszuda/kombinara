# Asesmen Formatif — PRD Overview (Generic Template)

> **Product**: KOMBINARA — Platform Pembelajaran Matematika Interaktif  
> **Fitur**: Latihan Pemahaman (Asesmen Formatif) — Generic / Reusable  
> **Target User**: Siswa SMA (Kelas XI)  
> **Last Updated**: 2026-08-06

> 📋 **Konvensi Template**: Dokumen ini menggunakan placeholder `{{...}}` untuk nilai yang berbeda tiap modul.
> Lihat [§9 — Contoh Instansiasi](#9-contoh-instansiasi-kaidah-pencacahan) untuk mapping konkret pada modul **Kaidah Pencacahan**.

---

## 1. Deskripsi Produk

**Asesmen Formatif** (`{{MODULE_NAME}}`) adalah asesmen berbasis uraian (_essay_) yang menguji pemahaman siswa terhadap materi **{{CONCEPT_NAMES}}**. Siswa mengerjakan **{{QUESTION_COUNT}} soal uraian** dengan menuliskan **cara hitung** (langkah-langkah) dan **jawaban akhir** pada setiap soal. Jawaban kemudian dievaluasi otomatis oleh **AI (GPT-4o)** menggunakan rubrik penilaian terstruktur.

Berbeda dari quiz biasa, asesmen ini:
- **Tidak menampilkan kunci jawaban instan** — siswa harus menunggu evaluasi AI.
- **Menerapkan access gate** — siswa harus menyelesaikan semua section materi terlebih dahulu.
- **Dilengkapi integrity monitoring** — mencatat aktivitas mencurigakan (fullscreen exit, tab switch, paste).
- **Mendukung multi-attempt** dengan cooldown 5 menit antar percobaan.
- **Menyimpan draft otomatis** — jawaban tidak hilang saat refresh/close browser.

---

## 2. Fitur Utama

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | **Access Gate** | Siswa HARUS menyelesaikan **{{TOTAL_SECTIONS}} section** prasyarat (terdefinisi per modul) sebelum bisa masuk |
| 2 | **Intro Screen** | Menampilkan petunjuk, aturan (boleh/tidak boleh), info durasi & jumlah soal |
| 3 | **Timer {{DURASI_MENIT}} Menit** | Countdown real-time dengan perubahan warna (hijau → kuning → merah) |
| 4 | **Soal Uraian {{QUESTION_COUNT}} Butir** | Multi-level: Mudah, Menengah, HOTS (distribusi per modul) |
| 5 | **Dua Kolom Jawaban** | "Cara Hitung" (textarea) + "Jawaban Akhir" (input) per soal |
| 6 | **Navigasi Soal** | Quick-jump navigator, indikator soal terjawab, label level |
| 7 | **Auto-Save Draft** | Debounce 3 detik + interval fallback 60 detik; restore saat page load |
| 8 | **Integrity Monitoring** | Mencatat: fullscreen enter/exit, tab visibility, paste events, resize |
| 9 | **Integrity Toast** | Notifikasi non-blocking saat fullscreen exit / tab switch > 5 detik |
| 10 | **Integrity Blocking Modal** | Modal overlay saat paste terdeteksi, harus dismiss manual |
| 11 | **Konfirmasi Submit** | Dialog konfirmasi 2-step (klik submit → konfirmasi → kirim) |
| 12 | **AI Evaluation** | GPT-4o menilai per soal dengan rubrik 4 aspek + feedback personal |
| 13 | **Hasil & Feedback** | Skor total (0–100), detail per soal, feedback AI per soal, kategori kesalahan |
| 14 | **Multi-Attempt + Cooldown** | 5 menit jeda antar attempt; attempt history tersimpan |
| 15 | **Auto-Submit on Timeout** | Timer habis → jawaban otomatis tersubmit |
| 16 | **Fullscreen Mode** | Request fullscreen saat mulai (graceful fallback jika ditolak) |

---

## 3. User Flow

```mermaid
flowchart TD
    A[Siswa buka /siswa/ulangan/{{MODULE_SLUG}}] --> B{Access Gate}
    B -->|❌ Belum selesai semua section| C[Locked Screen]
    C --> D[Tampilkan progress bar + daftar section belum selesai]
    D --> E[CTA: Kembali ke Materi]
    
    B -->|✅ Semua section completed| F[Intro Screen]
    F --> G[Tampilkan petunjuk, aturan, durasi, jumlah soal]
    G --> H{Klik "Siap, Mulai"}
    
    H -->|Cooldown aktif| I[Tampilkan error + countdown cooldown]
    I --> H
    
    H -->|OK| J[POST /start-attempt → buat attempt record]
    J --> K[Request Fullscreen]
    K --> L[Active Screen — Timer mulai]
    
    L --> M[Siswa mengerjakan soal]
    M --> N{Auto-save draft setiap 3 detik}
    M --> O{Integrity monitor aktif}
    O -->|Fullscreen exit > 5s| P[Integrity Toast]
    O -->|Paste terdeteksi| Q[Blocking Modal]
    O -->|Tab switch| R[Catat visibility event]
    
    M --> S{Siswa klik Submit / Timer habis}
    S --> T[Konfirmasi Submit]
    T -->|Batal| M
    T -->|Ya| U[POST /submit → simpan jawaban]
    U --> V[PUT /start-attempt → update status attempt]
    V --> W[Evaluating Screen — loading spinner]
    W --> X[POST /evaluate → AI evaluasi per soal]
    X -->|Sukses| Y[Results Screen — skor + feedback]
    X -->|Gagal| Z[Submitted Screen — fallback, jawaban tersimpan]
    
    Y --> AA[Lihat detail per soal + AI feedback]
    AA --> AB{Kembali ke daftar latihan / Coba lagi}
    AB -->|Tunggu 5 menit| H
```

### Phase State Machine

```
intro → active → evaluating → results
                  ↘ submitted (fallback jika evaluasi gagal)
```

| Phase | Deskripsi | Timer | UI |
|-------|-----------|-------|----|
| `intro` | Layar petunjuk sebelum mulai | Belum jalan | Petunjuk, aturan, tombol mulai |
| `active` | Mengerjakan soal | Jalan ({{DURASI_MENIT}} menit) | Soal, textarea, input, navigator, timer sticky |
| `evaluating` | AI sedang menilai jawaban | Sudah berhenti | Spinner animasi, "Kombi sedang memeriksa..." |
| `results` | Hasil evaluasi ditampilkan | Sudah berhenti | Skor total, detail per soal, feedback AI |
| `submitted` | Fallback: jawaban terkirim tapi evaluasi gagal | Sudah berhenti | Ringkasan jawaban, status "sedang dikoreksi" |

---

## 4. Access Gate (Gerbang Akses)

### Konsep
Sebelum dapat mengerjakan **Asesmen Formatif `{{MODULE_NAME}}`**, siswa **WAJIB** menyelesaikan **semua section** di `{{CONCEPT_COUNT}}` concept pembelajaran yang terkait. Daftar section prasyarat didefinisikan di `REQUIRED_SECTIONS` pada endpoint `check-access`.

### Mekanisme Pengecekan
- **Endpoint**: `GET /api/asesmen-formatif/check-access?module_slug={{MODULE_SLUG}}`
- **Query**: Satu query ke `student_section_status` untuk `concept_id` yang relevan
- **Response**: `{ allowed: boolean, missingSections: [...], summary: { totalRequired, completed, missing } }`

### Locked Screen UI
Jika akses ditolak, siswa melihat:
- 🔒 Icon gembok + "Akses Terkunci"
- Judul: "Selesaikan Materi Terlebih Dahulu"
- Progress bar: X/{{TOTAL_SECTIONS}} selesai
- Daftar section yang belum selesai, dikelompokkan per concept
- CTA button: "Kembali ke Materi" → `/siswa/materi/{{MODULE_SLUG}}`

---

## 5. Aturan Bisnis (Business Rules)

### 5.1 Durasi & Timer
- **Durasi maksimal**: `{{DURASI_MENIT}}` menit (`{{DURASI_DETIK}}` detik) — dikonfigurasi per modul
- **Timer auto-submit**: Jika timer habis, jawaban otomatis disubmit dengan status `timed_out`
- **Warna timer**:
  - Hijau (`#346739`): > 10 menit tersisa
  - Kuning (`#d97706`): 3–10 menit tersisa
  - Merah (`#b91c1c`): < 3 menit tersisa

### 5.2 Multi-Attempt & Cooldown
- **Cooldown**: 5 menit sejak attempt terakhir selesai (`completedAt`)
- **Status attempt**: `in_progress` → `submitted` / `timed_out`
- Jika ada attempt `in_progress` yang belum selesai (page refresh), reuse attempt tersebut
- Cooldown dihitung dari `completedAt` attempt terakhir dengan status `submitted` atau `timed_out`

### 5.3 Draft Auto-Save
- **Debounce**: 3 detik setelah berhenti mengetik
- **Interval fallback**: Setiap 60 detik, simpan semua jawaban
- **Restore**: Saat mount, ambil draft dari DB dan isi state answers
- **Cleanup**: Draft dihapus saat submit; draft kosong otomatis di-delete

### 5.4 Aturan Pengerjaan
**Diperbolehkan**:
- Menggunakan coretan / kertas buram
- Menghitung secara manual

**Tidak Diperbolehkan**:
- Membuka tab atau aplikasi lain
- Bekerja sama dengan teman
- Menggunakan kalkulator

### 5.5 Pencegahan Double Submit
- Flag `hasSubmittedRef` mencegah submit ganda
- Timer clear saat submit dimulai
- `isSubmitting` state untuk disable UI

---

## 6. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | Supabase Auth |
| AI Evaluation | OpenAI GPT-4o (via `@openai/responses`) |
| Styling | Inline styles + Tailwind CSS utility classes |
| State Management | React `useState` + `useRef` + Context (AssesmentLock) |
| Validation | Zod (AI response parsing) |

---

## 7. Struktur File Terkait

```
src/
├── app/
│   ├── (dashboard)/siswa/ulangan/
│   │   ├── page.tsx                          # Daftar ulangan (list)
│   │   ├── [id]/page.tsx                     # Placeholder "sedang disiapkan"
│   │   └── {{MODULE_SLUG}}/page.tsx          # ⭐ MAIN FILE — seluruh fitur
│   └── api/asesmen-formatif/
│       ├── check-access/route.ts             # GET — cek kelengkapan section
│       ├── start-attempt/route.ts            # POST/PUT — mulai & update attempt
│       ├── draft/route.ts                    # POST/GET — simpan & ambil draft
│       ├── submit/route.ts                   # POST/GET — kirim jawaban
│       ├── evaluate/route.ts                 # POST/GET — AI evaluasi
│       └── integrity-events/route.ts         # POST — batch insert integrity events
├── components/
│   ├── materi/sections/{{MODULE_SLUG}}/
│   │   └── .../latihan.tsx                   # SOAL_DATA, LEVEL_META, SoalKepahaman
│   ├── dashboard/assesment-lock-context.tsx  # Lock state saat asesmen aktif
│   └── activity/
│       ├── IntegrityToast.tsx                 # Toast non-blocking
│       └── IntegrityBlockingModal.tsx         # Modal overlay paste
├── hooks/
│   ├── useDraftSaver.ts                      # Auto-save draft hook
│   └── useIntegrityMonitor.ts                # Integrity monitoring hook
└── lib/
    ├── ai/client.ts                          # Prompt AI & evaluation logic
    └── device.ts                             # Device type detection
```

---

## 8. Relasi dengan Modul Lain

| Modul | Hubungan |
|-------|----------|
| **Materi `{{MODULE_NAME}}`** (`/siswa/materi/{{MODULE_SLUG}}`) | Prasyarat — semua section harus completed |
| **Activity `{{MODULE_NAME}}`** (`/siswa/activity/{{MODULE_SLUG}}`) | Parallel — aktivitas interaktif per section |
| **Dashboard Siswa** (`/siswa`) | Menampilkan link ke materi & ulangan |
| **Daftar Ulangan** (`/siswa/ulangan`) | List semua modul ulangan yang tersedia |
| **Download Materi** (`/api/download/status`) | Cek kelayakan download PDF setelah selesai section + asesmen |

---

## 9. Contoh Instansiasi: Kaidah Pencacahan

| Placeholder | Nilai |
|-------------|-------|
| `{{MODULE_NAME}}` | Kaidah Pencacahan |
| `{{MODULE_SLUG}}` | `kaidah-pencacahan` |
| `{{CONCEPT_NAMES}}` | Kaidah Penjumlahan & Kaidah Perkalian |
| `{{CONCEPT_COUNT}}` | 2 (`kaidah_penjumlahan`, `kaidah_perkalian`) |
| `{{TOTAL_SECTIONS}}` | 13 (Kaidah Penjumlahan: 8, Kaidah Perkalian: 5) |
| `{{QUESTION_COUNT}}` | 10 |
| `{{DURASI_MENIT}}` | 120 |
| `{{DURASI_DETIK}}` | 7200 |
| `{{COOLDOWN_MENIT}}` | 5 |

**Daftar Section Prasyarat**:

| Concept | Sections |
|---------|----------|
| `kaidah_penjumlahan` (8) | apersepsi, pemantik, refleksi_sebelum_mulai, eksplorasi_kontekstual, aktivitas_deep_learning, penjelasan_konsep, contoh_soal, refleksi_mini |
| `kaidah_perkalian` (5) | eksplorasi_kontekstual, aktivitas_deep_learning, penjelasan_konsep, contoh_soal, refleksi_mini |

**Level Distribusi Soal**: Mudah (3), Menengah (4), HOTS (3)
