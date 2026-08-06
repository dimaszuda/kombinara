# Asesmen Formatif — UI/UX & Design System (Generic Template)

> **Related**: [00-overview.md](./00-overview.md) — baca dulu untuk gambaran umum.
>
> 📋 **Konvensi Template**: Placeholder `{{...}}` diganti per modul. Lihat [§8 — Contoh Instansiasi](#8-contoh-instansiasi-kaidah-pencacahan).

---

## 1. Color Palette

### 1.1 Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--green-900` | `#1a3d1c` | Judul utama, teks heading gelap |
| `--green-700` | `#346739` | Primary actions, tombol utama, border aktif, ikon, teks aksen |
| `--green-500` | `#5a7d5c` | Teks body, teks sekunder |
| `--green-300` | `#6b8f6d` | Teks muted, placeholder info |
| `--green-100` | `#9aada0` | Teks disabled, hint text |
| `--green-50` | `#DBFFD5` | Badge sukses, background info card, level "Mudah" |
| `--green-bg` | `#f8fdf8` | Background card, section highlight |
| `--green-border` | `#d4e8d4` / `#e2ede2` | Border default, separator |
| `--green-light` | `#f0faf0` | Background "Diperbolehkan" |

### 1.2 Accent Colors (Purple)

| Token | Hex | Usage |
|-------|-----|-------|
| `--purple-900` | `#663362` | Aksen sekunder, badge, ikon, label "Jawaban Akhir" |
| `--purple-bg` | `#f3e8f2` | Badge level "HOTS", background info card alternatif |
| `--purple-border` | `#e8d4e8` | Border input "Jawaban Akhir" |
| `--purple-input-bg` | `#fdf8fd` | Background input "Jawaban Akhir" |

### 1.3 Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--warning-700` | `#92400e` / `#b45309` | Akses terkunci, cooldown notice text |
| `--warning-500` | `#d97706` | Timer kuning, progress bar warning |
| `--warning-bg` | `#fff5f0` / `#fffbeb` | Background locked screen, cooldown notice |
| `--warning-border` | `#fde68a` | Border warning |
| `--warning-badge` | `#FFF3CD` | Badge level "Menengah" |
| `--danger-700` | `#b91c1c` | Timer merah, teks error, icon danger |
| `--danger-bg` | `#fff5f5` | Background error, "Tidak Diperbolehkan" |
| `--danger-border` | `#fecaca` | Border error, border "Tidak Diperbolehkan" |
| `--neutral-700` | `#2C2C2A` | Teks soal, teks konten utama |
| `--neutral-500` | `#6b7280` | Teks konfirmasi, teks muted |
| `--neutral-border` | `#d1d5db` | Border tombol batal |

### 1.4 Timer Color Semantics

| Kondisi | Warna | Hex |
|---------|-------|-----|
| > 10 menit | Hijau | `#346739` |
| 3–10 menit | Kuning | `#d97706` |
| < 3 menit | Merah | `#b91c1c` |

---

## 2. Typography

| Usage | Size | Weight | Color |
|-------|------|--------|-------|
| Page Title (H1) | 22–26px | 700 | `#1a3d1c` |
| Section Label (overline) | 11px | 600 | `#346739` (opacity 0.7) |
| Body Text | 13–15px | 400–500 | `#2C2C2A` / `#5a7d5c` |
| Question Text | 15px | 500 | `#2C2C2A` |
| Timer Display | 20px | 700 | Dynamic (green/yellow/red) |
| Score (large) | 36px | 800 | Dynamic (green/yellow/red) |
| Button Text | 14–15px | 600–700 | `#fff` (on green) |
| Badge Level | 10–11px | 600–700 | Per level |
| Hint/Helper Text | 12px | 400 | `#9aada0` |
| Feedback AI | 13px | 400 (italic) | `#3b5e3d` |

**Font Family**: System font stack (inherit from Tailwind)

---

## 3. Spacing & Layout

| Element | Value |
|---------|-------|
| Page max-width | 700px (intro/active), 720px (results) |
| Page horizontal padding | 24px |
| Card border-radius | 10–14px |
| Card padding | 14–20px |
| Question gap | 20px |
| Button border-radius | 10–12px |
| Button padding | 12–14px vertical, 28–40px horizontal |
| Section margin-bottom | 24–32px |

---

## 4. Component Breakdown

### 4.1 Locked Screen (`LockedScreen`)

**Kondisi tampil**: `accessAllowed === false`

**Layout**:
```
┌──────────────────────────────────────┐
│         🔒 (icon gembok)             │
│       AKSES TERKUNCI (label)         │
│  Selesaikan Materi Terlebih Dahulu   │
│  (deskripsi penjelasan)              │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Progress Materi   11/13 sls  │   │
│  │ ████████████░░░░░ 85%       │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ SECTION YANG BELUM SELESAI   │   │
│  │                              │   │
│  │ {{CONCEPT_1_LABEL}}          │   │
│  │ ● {{SECTION_NAME_1}}         │   │
│  │                              │   │
│  │ {{CONCEPT_2_LABEL}}          │   │
│  │ ● {{SECTION_NAME_2}}         │   │
│  └──────────────────────────────┘   │
│                                      │
│    [← Kembali ke Materi] (CTA)      │
│  (hint: selesaikan section di atas) │
└──────────────────────────────────────┘
```

**Warna**:
- Background ikon: `#fff5f0` (warm)
- Ikon gembok: `#b45309`
- Label: `#b45309`
- Judul: `#7c2d12`
- Progress bar fill: `#d97706`
- Progress bar bg: `#fde68a`
- Card section: `#fffbeb` background, `#fde68a` border
- List bullet: `#d97706` (bulat)

---

### 4.2 Intro Screen (`IntroScreen`)

**Layout**:
```
┌──────────────────────────────────────┐
│ LATIHAN PEMAHAMAN (ASESMEN)          │
│ {{MODULE_NAME}} (H1)                 │
│                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │ ⏱    │ │ 📄   │ │ ✍️   │ │ 🔒   ││
│ │DURASI│ │JML   │ │JENIS │ │PENGER││
│ │120mnt│ │10 Soa│ │Uraian│ │Dapat ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│ ┌──────────────────────────────┐   │
│ │ PETUNJUK PENGERJAAN          │   │
│ │ 1. Baca setiap soal...       │   │
│ │ 2. Tuliskan langkah...       │   │
│ │ 3. Tuliskan hasil akhir...   │   │
│ │ 4. Pastikan semua...         │   │
│ │ 5. Latihan ini dapat...      │   │
│ └──────────────────────────────┘   │
│                                      │
│ ┌────────────┐ ┌────────────┐      │
│ │ ✓ DIPERBO- │ │ ✕ TIDAK    │      │
│ │   LEHKAN   │ │   DIPERBO- │      │
│ │            │ │   LEHKAN   │      │
│ │ • Coretan  │ │ • Buka tab │      │
│ │ • Hitung   │ │ • Kerjasama│      │
│ │   manual   │ │ • Kalkulatr│      │
│ └────────────┘ └────────────┘      │
│                                      │
│   [Siap, Mulai Latihan →] (CTA)     │
│   (Timer akan mulai setelah klik)   │
└──────────────────────────────────────┘
```

**Info Cards**: Grid 4 kolom, masing-masing:
- Background: `#DBFFD5` (hijau) atau `#f3e8f2` (ungu)
- Border-radius: 12px
- Icon: 22px
- Label: 10px, uppercase, color mengikuti tema
- Value: 15px, bold

**Rule Boxes**:
- **Allowed**: bg `#f0faf0`, border `#c3e6c3`, teks `#346739`
- **Forbidden**: bg `#fff5f5`, border `#fecaca`, teks `#b91c1c`

**CTA Button**:
- Background: `#346739`
- Border-radius: 12px
- Padding: 14px 40px
- Disabled state: `#9aada0` + `cursor: not-allowed`

---

### 4.3 Active Screen (`ActiveScreen`)

**Sticky Timer Bar** (position: sticky, top: 0):
```
┌──────────────────────────────────────┐
│ Latihan Pemahaman — {{MODULE_NAME}}  │
│ 7/{{QUESTION_COUNT}} soal terjawab   │  ⏱ 87:32  │
│ ████████████████░░░░ 73%            │
└──────────────────────────────────────┘
```
- Background: `#fff`
- Border bottom: `#e2ede2`
- Timer box: dynamic background color (18% opacity) + border (30% opacity)
- Progress bar: 3px height, dynamic color, `border-radius: 99px`

**Question Navigator**:
```
┌──────────────────────────────────────┐
│ NAVIGASI SOAL                        │
│ [1][2][3]...[{{QUESTION_COUNT}}]     │
│ Mudah  Menengah  HOTS               │
└──────────────────────────────────────┘
```
- Background: `#f8fdf8`
- Answered state: bg `#346739`, text `#fff`
- Unanswered state: bg `#fff`, border `#d4e8d4`, text `#346739`
- Level badges: pill shape, warna per level

**Question Card**:
```
┌──────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ (4px top bar)
│ ① MUDAH                    ✓ Terjawab│
│                                      │
│ Dari kota A ke kota B tersedia...    │
│                                      │
│ CARA HITUNG                          │
│ ┌──────────────────────────────────┐ │
│ │ Tuliskan langkah-langkah...      │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ JAWABAN AKHIR                        │
│ ┌──────────────────────────────────┐ │
│ │ Tulis jawaban akhirmu...         │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```
- Border: `2px solid` — hijau jika terjawab, abu-abu jika belum
- Top bar: 4px, hijau jika terjawab
- Cara Hitung textarea: border `#d4e8d4`, bg `#fafffe`, focus ring `#346739`/30
- Jawaban Akhir input: border `#e8d4e8`, bg `#fdf8fd`, focus ring `#663362`/25
- Nomor soal: circle `#346739`, 30×30px
- Level badge: pill, warna per level

**Submit Section**:
```
┌──────────────────────────────────────┐
│ Sudah yakin dengan jawabanmu?...     │
│                                      │
│   [✓ Submit Jawaban] (primary CTA)   │
└──────────────────────────────────────┘
```
↓ setelah klik Submit (2-step confirmation):
```
┌──────────────────────────────────────┐
│      Konfirmasi Submit               │
│ Kamu telah menjawab 7 dari 10 soal.  │
│ Setelah di-submit, jawaban tidak     │
│ dapat diubah.                        │
│                                      │
│   [Batal]    [Ya, Submit Sekarang]   │
└──────────────────────────────────────┘
```
- Konfirmasi: bg `#fff5f5`, border `#fecaca`
- Tombol batal: bg `#fff`, border `#d1d5db`, text `#6b7280`
- Tombol submit: bg `#b91c1c`, text `#fff`

---

### 4.4 Submitted Screen (`SubmittedScreen`)

```
┌──────────────────────────────────────┐
│         ✓ (icon centang hijau)       │
│      Jawaban Terkirim!               │
│ Kamu menjawab 7 dari 10 soal...      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ✓ Jawaban sudah tersimpan       │ │
│ │ Jawabanmu sedang dilakukan       │ │
│ │ proses koreksi. Kembali lagi...  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ RINGKASAN JAWABAN                    │
│ (tampilan readonly semua soal)      │
│                                      │
│   [← Kembali ke Daftar Latihan]     │
└──────────────────────────────────────┘
```

---

### 4.5 Evaluating Screen (`EvaluatingScreen`)

```
┌──────────────────────────────────────┐
│         ⟳ (spinner animasi)          │
│    Mengevaluasi Jawaban              │
│ Kombi sedang memeriksa jawabanmu     │
│ menggunakan AI...                    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ⏱ AI Evaluation in progress     │ │
│ │ Setiap jawaban dinilai berdasar- │ │
│ │ kan rubrik: proses pengerjaan... │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Mohon jangan menutup halaman ini.    │
└──────────────────────────────────────┘
```
- Spinner: `#663362`, animasi CSS `spin 1.5s linear infinite`
- Background spinner: `#f3e8f2`
- Judul: `#1a3d1c`
- Info card: bg `#f8fdf8`, border `#d4e8d4`

---

### 4.6 Results Screen (`ResultsScreen`)

```
┌──────────────────────────────────────┐
│         ╭─────────────╮              │
│         │     78      │  (score ring)│
│         │   dari 100  │              │
│         ╰─────────────╯              │
│      Kerja Bagus! 👏                  │
│ (AI overall feedback text...)        │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ⏳ Kamu dapat memulai latihan    │ │
│ │ kembali dalam 5 menit...         │ │
│ └──────────────────────────────────┘ │
│                                      │
│ DETAIL PER SOAL                      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ① Skor: 10.0/10         MUDAH   │ │
│ │ Jawabanmu: 21                    │ │
│ │ 💬 Bagus! Kamu sudah tepat...    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ② Skor: 7.5/10        MENENGAH  │ │
│ │ Jawabanmu: 350                   │ │
│ │ 💬 Hampir tepat! Perhatikan...   │ │
│ │ ⚠️ Kesalahan: Perhitungan        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ⑤ Skor: 0.0/10         MUDAH    │ │
│ │ 💬 Kamu tidak mengisi jawaban... │ │
│ │ ⚠️ Tidak diisi — skor otomatis 0 │ │
│ └──────────────────────────────────┘ │
│                                      │
│   [← Kembali ke Daftar Latihan]     │
└──────────────────────────────────────┘
```

**Score Ring Color**:
- ≥ 75: hijau (`#346739`), bg `#DBFFD5`, border `#c3e6c3`
- ≥ 50: kuning (`#d97706`), bg `#FFF3CD`, border `#fde68a`
- < 50: merah (`#b91c1c`), bg `#fff5f5`, border `#fecaca`

**Per-Question Card Color**:
- Jawaban benar (no mistake): bg `#f0faf0`, border `#c3e6c3`, text `#346739`
- Ada kesalahan: bg `#fff5f5`, border `#fecaca`, text `#b91c1c`
- Tidak diisi: bg `#fff5f0`, border `#fde68a`, text `#d97706`

**Mistake Categories**:
| Category | Label | 
|----------|-------|
| `konsep` | Konsep |
| `formula` | Formula/Rumus |
| `perhitungan` | Perhitungan |
| `lainnya` | Lainnya |
| `tidak_diisi` | Tidak diisi |

---

### 4.7 Integrity Toast (`IntegrityToast`)

```
┌──────────────────────────────────────┐
│ 📋 Aktivitas meninggalkan halaman   │
│    ujian tercatat.                   │
└──────────────────────────────────────┘
```
- Position: fixed, top-right (20px from top, 20px from right)
- Z-index: 9999
- Max-width: 340px
- Background: `#2d2d2d` (dark)
- Text: `#f0ede8` (light)
- Border: `#4a4a4a`
- Auto-dismiss: 4.5 detik
- Animasi: fade-in + slide-down (300ms ease)

### 4.8 Integrity Blocking Modal (`IntegrityBlockingModal`)

```
┌──────────────────────────────────────┐
│ (overlay semi-transparan fullscreen) │
│                                      │
│   ┌────────────────────────────┐    │
│   │       📋 (icon paste)      │    │
│   │   Aktivitas Tercatat       │    │
│   │                            │    │
│   │ Aktivitas menempel (paste) │    │
│   │ terdeteksi dan telah       │    │
│   │ dicatat.                   │    │
│   │                            │    │
│   │   [Saya Mengerti] (CTA)    │    │
│   └────────────────────────────┘    │
│                                      │
└──────────────────────────────────────┘
```
- Overlay: `rgba(0,0,0,0.55)` + `backdrop-filter: blur(3px)`
- Z-index: 9998
- Modal card: bg `#fff`, border-radius 16px, max-width 420px
- Icon circle: bg `#f3e8f2`, stroke `#663362`
- Title: `#1a3d1c`, 18px, 700
- Body text: 14px, `#5a7d5c`
- CTA button: bg `#346739`, text `#fff`

---

## 5. Level Badge System

| Level | Jumlah Soal | Background | Text Color | Label |
|-------|-------------|------------|------------|-------|
| Mudah | 3 (soal 1–3) | `#DBFFD5` | `#346739` | Mudah |
| Menengah | 4 (soal 4–7) | `#FFF3CD` | `#92600A` | Menengah |
| HOTS | 3 (soal 8–10) | `#F3E8FF` | `#663362` | HOTS |

---

## 6. Responsive & Mobile Considerations

| Aspek | Implementasi |
|-------|-------------|
| Layout | Max-width 700–720px, centered |
| Info Cards | Grid 4 kolom → wrap pada mobile |
| Rule Boxes | Grid 2 kolom → stack pada mobile |
| Navigator | Wrap flex, 36×36px buttons |
| Textarea | `resize-y`, min rows 4 |
| Timer | Sticky top, full-width |
| Toast | Fixed top-right, max-width 340px |
| Modal | Full viewport overlay, centered card |
| Fullscreen | `requestFullscreen()` saat start, graceful fallback |
| Device detection | `getDeviceType()` → dikirim ke API sebagai `device_type` |

---

## 7. State Transitions Visual

```
                    ┌──────────┐
                    │  LOADING │  (accessAllowed === null)
                    │ "Memeriksa│
                    │  akses..."│
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  ACCESS? │
                    └────┬─────┘
          ┌──────────────┼──────────────┐
          │❌                           │✅
    ┌─────▼─────┐                 ┌────▼─────┐
    │  LOCKED   │                 │  INTRO   │
    │ (gate)    │                 │ (petunjuk│
    └───────────┘                 │ + aturan)│
                                  └────┬─────┘
                                       │ Klik "Siap, Mulai"
                                  ┌────▼─────┐
                                  │  ACTIVE  │ ◄── Timer 120 menit
                                  │ (soal +  │ ──► Integrity Monitor
                                  │  jawaban)│ ──► Auto-save Draft
                                  └────┬─────┘
                                       │ Submit / Timeout
                                  ┌────▼─────┐
                                  │EVALUATING│ (spinner)
                                  └────┬─────┘
                              ┌────────┼────────┐
                              │✅               │❌
                        ┌─────▼─────┐    ┌─────▼─────┐
                        │  RESULTS  │    │ SUBMITTED │
                        │(skor +    │    │ (fallback)│
                        │ feedback) │    └───────────┘
                        └───────────┘
```

---

## 8. Contoh Instansiasi: Kaidah Pencacahan

| Placeholder | Nilai |
|-------------|-------|
| `{{MODULE_NAME}}` | Kaidah Pencacahan |
| `{{QUESTION_COUNT}}` | 10 |
| `{{CONCEPT_1_LABEL}}` | KAIDAH PENJUMLAHAN |
| `{{CONCEPT_2_LABEL}}` | KAIDAH PERKALIAN |
| `{{SECTION_NAME_1}}` | Refleksi Mini |
| `{{SECTION_NAME_2}}` | Contoh Soal |

**Catatan**: Nama concept dan section label di Locked Screen bersumber dari `CONCEPT_LABELS` dan `SECTION_LABELS` yang didefinisikan di halaman page.tsx masing-masing modul. Untuk modul selain Kaidah Pencacahan, mapping ini perlu disesuaikan.
