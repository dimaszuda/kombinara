# Asesmen Formatif — AI Evaluation & Integrity Monitoring (Generic Template)

> **Related**: [00-overview.md](./00-overview.md) — baca dulu untuk gambaran umum.
>
> 📋 **Konvensi Template**: Placeholder `{{...}}` diganti per modul. Lihat [§6 — Contoh Instansiasi](#6-contoh-instansiasi-kaidah-pencacahan).

---

## 1. AI Evaluation System

### 1.1 Overview

Setiap submission dievaluasi oleh **GPT-4o** menggunakan rubrik penilaian terstruktur. Evaluasi dilakukan **per soal** (bukan per submission), dan hasilnya digabungkan menjadi skor total.

### 1.2 Evaluation Flow

```
Submission diterima
       │
       ▼
┌──────────────────────────────────────┐
│ Untuk setiap soal (1..10):           │
│                                      │
│ 1. Ambil jawaban siswa               │
│ 2. Cocokkan dengan SOAL_DATA (ground │
│    truth: answer + cara)             │
│ 3. Cek: apakah kedua field kosong?   │
│    └─ Ya → skor 0, skip AI, category │
│            "tidak_diisi"             │
│    └─ Tidak → lanjut ke AI           │
│ 4. Kirim ke GPT-4o dengan prompt     │
│    terstruktur                       │
│ 5. Parse response dengan Zod schema  │
│ 6. Akumulasi skor                    │
└──────────────────────────────────────┘
       │
       ▼
Hitung total_score = rata-rata × 10 → skala 0–100
Generate overall AI feedback (rule-based)
UPDATE submission di database
```

### 1.3 Rubrik Penilaian (4 Aspek)

Setiap jawaban dinilai dalam 4 dimensi **process** + 1 dimensi **final answer**:

| # | Aspek | Skor Maks | Deskripsi |
|---|-------|-----------|-----------|
1. **Identifikasi Kondisi** | 3 | Apakah siswa dapat mengidentifikasi kondisi soal dengan benar? (konsep, batasan, syarat) |
| 2 | **Pemilihan Rumus** | 3 | Apakah siswa memilih pendekatan/rumus yang tepat sesuai materi `{{MODULE_NAME}}`? |
| 3 | **Eksekusi Perhitungan** | 3 | Apakah perhitungan dilakukan dengan benar? (aritmatika, perkalian, penjumlahan) |
| 4 | **Justifikasi** | 3 | Apakah siswa memberikan justifikasi/penjelasan yang logis? |
| **Process Subtotal** | **12** | Raw score dari 4 aspek |
| **Process Scaled** | **7** | Process raw × (7/12), dibulatkan 1 desimal |
| 5 | **Final Answer** | **3** | Apakah jawaban akhir numerik benar? |
| **TOTAL** | **10** | Process scaled + Final answer score |

### 1.4 Scoring Detail

```
Process Raw Score (0–12) = Σ(4 aspek, masing-masing 0–3)
Process Scaled (0–7)     = round(Process Raw × 7/12, 1)
Final Answer (0–3)       = jawaban_akhir == ground_truth ? 3 : 0
Total Per Soal (0–10)    = Process Scaled + Final Answer
Total Score (0–100)      = round(Σ(Total Per Soal) / (10 soal × 10) × 100)
```

**Catatan**: Final answer score **tidak** binary murni — AI bisa memberi partial credit jika jawaban mendekati benar.

### 1.5 AI Prompt Structure

**System Prompt** (Bahasa Indonesia):
```
Kamu adalah asisten guru matematika yang mengevaluasi jawaban siswa 
untuk soal {{MODULE_NAME}} ({{CONCEPT_NAMES}}).

Nilai setiap jawaban berdasarkan rubrik 4 aspek:
1. Identifikasi kondisi (0–3)
2. Pemilihan rumus (0–3)
3. Eksekusi perhitungan (0–3)
4. Justifikasi (0–3)

Ditambah penilaian jawaban akhir (0–3).

Kategorikan kesalahan jika ada: konsep, formula, perhitungan, lainnya.
Berikan feedback yang membangun dan spesifik dalam Bahasa Indonesia.
Gaya bahasa: semi-formal, suportif, seperti guru yang sabar.
```

**User Prompt Template**:
```
SOAL:
{question_text}

LEVEL SOAL: {dasar|menengah|HOTS}

CARA HITUNG SISWA:
{cara_hitung}

JAWABAN AKHIR SISWA:
{jawaban_akhir}

APAKAH JAWABAN AKHIR BENAR? {true|false}

KUNCI JAWABAN (CARA):
{cara_ground_truth}

Nilai jawaban di atas dengan rubrik yang diberikan.
```

### 1.6 Response Schema (Zod)

```typescript
const AsesmenFormatifItemSchema = z.object({
  step_by_step: z.object({
    identifikasi_kondisi:  z.object({ score: z.number().min(0).max(3), reasoning: z.string() }),
    pemilihan_rumus:       z.object({ score: z.number().min(0).max(3), reasoning: z.string() }),
    eksekusi_perhitungan:  z.object({ score: z.number().min(0).max(3), reasoning: z.string() }),
    justifikasi:           z.object({ score: z.number().min(0).max(3), reasoning: z.string() }),
  }),
  process_raw_score:    z.number(),
  process_scaled_score: z.number(),
  final_answer_score:   z.number(),
  total_score:          z.number(),
  guardrail_applied:    z.string().nullable(),   // Jika AI menolak menjawab
  mistake_category:     z.enum(["konsep", "formula", "perhitungan", "lainnya"]).nullable(),
  mistake_detail:       z.string().nullable(),
  feedback:             z.string(),              // Feedback personal dalam Bahasa Indonesia
});
```

### 1.7 Unanswered Question Handling

Jika kedua field (`cara_hitung` dan `jawaban_akhir`) **kosong**:
- **Tidak memanggil AI** — langsung return skor 0
- Semua aspek: `score: 0, reasoning: "Tidak dijawab"`
- `mistake_category: "tidak_diisi"`
- `mistake_detail: "Siswa tidak mengisi jawaban untuk soal ini."`
- `feedback: "Kamu tidak mengisi jawaban untuk soal ini. Coba lagi di attempt berikutnya ya!"`

### 1.8 Idempotency

Jika submission sudah memiliki `evaluated_at` (sudah pernah dievaluasi):
- **Tidak memanggil AI lagi** — return existing results
- Response: `{ success: true, already_evaluated: true, ...existing data }`

### 1.9 Overall Feedback (Rule-Based)

Setelah semua soal dievaluasi, sistem generate overall feedback berdasarkan skor total:

| Skor | Feedback Tone |
|------|--------------|
| ≥ 90 | "Luar Biasa! 🎉" — pujian, dorong untuk tantangan lebih tinggi |
| 75–89 | "Kerja Bagus! 👏" — apresiasi, tunjukkan area improvement minor |
| 50–74 | "Lumayan! 💪" — semangat, identifikasi pola kesalahan |
| < 50 | "Tetap Semangat! 📚" — motivasi, sarankan review materi spesifik |

Feedback di-generate dengan mempertimbangkan:
- Pola kesalahan (konsep vs perhitungan)
- Level soal yang sering salah
- Perbandingan process score vs final answer score

### 1.10 Guardrail

AI response memiliki **fallback** jika:
- GPT-4o gagal merespons → return default error object
- Response tidak sesuai Zod schema → tangkap parse error, return fallback
- Timeout → tangkap error, return fallback

**Fallback object**:
```typescript
{
  step_by_step: {
    identifikasi_kondisi:  { score: 0, reasoning: "Evaluasi gagal" },
    pemilihan_rumus:       { score: 0, reasoning: "Evaluasi gagal" },
    eksekusi_perhitungan:  { score: 0, reasoning: "Evaluasi gagal" },
    justifikasi:           { score: 0, reasoning: "Evaluasi gagal" },
  },
  process_raw_score: 0,
  process_scaled_score: 0,
  final_answer_score: 0,
  total_score: 0,
  guardrail_applied: null,
  mistake_category: null,
  mistake_detail: "Gagal mengevaluasi jawaban.",
  feedback: "Maaf, ada kendala saat mengevaluasi jawabanmu. Coba lagi nanti ya!",
}
```

---

## 2. Integrity Monitoring System

### 2.1 Design Philosophy

> **Deterrence-focused, not punishment-focused.**

Sistem integrity monitoring dirancang untuk:
1. **Mencatat** aktivitas siswa — BUKAN otomatis mendiskualifikasi
2. **Memberi kesadaran** — siswa tahu aktivitas mereka dicatat
3. **Mencegah pasif** — toast & modal sebagai pengingat
4. **Transparan ke guru** — semua event tersimpan untuk review guru

**Yang TIDAK dilakukan**:
- ❌ Auto-score reduction
- ❌ Auto-submit/penguncian
- ❌ Klaim "anti-cheat" atau "proctoring"
- ❌ Akses kamera/mikrofon

### 2.2 Event Types

| Event | Trigger | Severity | UI Response |
|-------|---------|----------|-------------|
| `fullscreen_enter` | `document.fullscreenElement` menjadi non-null | Info | Tidak ada |
| `fullscreen_exit` | `document.fullscreenElement` menjadi null | ⚠️ Warning | Toast setelah 5 detik |
| `visibility_hidden` | `document.visibilitychange` → `hidden` | ⚠️ Warning | Toast setelah 5 detik |
| `visibility_visible` | `document.visibilitychange` → `visible` | Info | Tidak ada |
| `paste` | Event `paste` di textarea/input | 🛑 Critical | Blocking modal (harus dismiss) |
| `resize` | Event `resize` pada window | Info | Tidak ada (untuk konteks fullscreen exit) |

### 2.3 Suppression Logic (False Positive Prevention)

#### Fullscreen Exit Suppression
Beberapa browser keluar fullscreen saat viewport resize (misal: keyboard mobile muncul). Untuk mencegah false positive:
- Catat `resize` event
- Jika `fullscreen_exit` terjadi dalam **300ms** setelah `resize` dengan penurunan height > 25% → **suppress** (tidak dianggap sebagai exit yang mencurigakan)
- Event tetap dicatat ke DB dengan metadata konteks

#### Visibility Change
- `visibility_hidden` hanya trigger toast jika berlangsung > **5 detik** (untuk mengabaikan Alt+Tab singkat)
- `visibility_visible` mereset timer

### 2.4 Client-Side Architecture (`useIntegrityMonitor`)

```
┌─────────────────────────────────────────┐
│         useIntegrityMonitor Hook         │
│                                          │
│  Params:                                 │
│   - attemptId: number                    │
│   - moduleSlug: string                   │
│   - deviceType: DeviceType               │
│                                          │
│  Returns:                                │
│   - activeToast: IntegrityToast | null   │
│   - activeBlockingModal: ModalData | null│
│   - dismissBlockingModal: () => void     │
│   - registerPasteTarget: (id, el) => void│
│   - isBlocking: boolean                  │
│                                          │
│  Internal:                               │
│   - bufferRef: QueuedEvent[]             │
│   - Flush: setiap 10 event ATAU 15 detik │
│   - onUnload: sendBeacon() best-effort   │
└─────────────────────────────────────────┘
```

#### Event Buffer & Flush Strategy

```
Client-side buffer (max 10 events)
        │
        ├── Trigger flush setiap 10 event terkumpul
        ├── Trigger flush setiap 15 detik (interval)
        └── Trigger flush saat page unload (sendBeacon)
                │
                ▼
    POST /api/asesmen-formatif/integrity-events
    Body: { attempt_id, module_slug, events: [...] }
```

### 2.5 Paste Detection Detail

**Cara kerja**:
1. `registerPasteTarget(fieldId, element)` dipanggil untuk setiap textarea/input
2. Hook memasang `paste` event listener pada element tersebut
3. Saat paste terdeteksi:
   - Event dicatat ke buffer
   - `activeBlockingModal` di-set (tampil overlay)
   - `isBlocking = true` → area soal di-blur (opacity 0.5, pointer-events none)

**Paste Target Registration** (dari `ActiveScreen`):
```typescript
// Setiap soal punya 2 field:
registerPasteTarget(`cara_hitung_${idx + 1}`, caraEl);
registerPasteTarget(`jawaban_akhir_${idx + 1}`, jawabanEl);
```

### 2.6 Toast Timing

```
fullscreen_exit terdeteksi
        │
        ├── Start 5 detik timer
        │
        ├── Jika fullscreen_enter dalam 5 detik → cancel
        │
        └── Jika 5 detik berlalu → tampilkan toast
                │
                └── Toast auto-dismiss setelah 4.5 detik
```

### 2.7 Server-Side Validation

Saat menerima integrity events:
1. **Auth check**: Verifikasi student owns the attempt
2. **Status check**: Attempt masih `in_progress` (tolak event setelah exam selesai)
3. **Event validation**: `event_type` dan `device_type` harus dalam whitelist
4. **Batch insert**: Semua event di-insert dalam satu query

### 2.8 Data Retention & Privacy

| Aspek | Kebijakan |
|-------|-----------|
| Event retention | Disimpan selama data student ada (CASCADE on delete) |
| Metadata | Hanya data teknis (viewport size, field ID, timestamp) — tidak ada konten jawaban |
| Akses guru | Integrity events bisa diakses via dashboard guru (future feature) |
| Transparency | Siswa tahu aktivitas dicatat (disebutkan di petunjuk & toast/modal) |

---

## 3. Scoring & Attempt Lifecycle

### 3.1 Complete Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    ATTEMPT LIFECYCLE                       │
│                                                          │
│  START                                                    │
│   │                                                      │
│   ▼                                                      │
│  ┌─────────────┐    Timer habis    ┌──────────────┐      │
│  │ in_progress │──────────────────▶│  timed_out   │      │
│  └──────┬──────┘                   └──────┬───────┘      │
│         │ Siswa submit                   │              │
│         ▼                                ▼              │
│  ┌─────────────┐                   ┌──────────────┐      │
│  │  submitted  │                   │ (auto-submit)│      │
│  └──────┬──────┘                   └──────────────┘      │
│         │                                                
│         ▼                                                
│  ┌─────────────┐                                         │
│  │ evaluating  │ (AI evaluation)                         │
│  └──────┬──────┘                                         │
│         │                                                
│    ┌────┴────┐                                           
│    │✅      │❌                                          
│    ▼        ▼                                            
│ results   submitted (fallback)                           
│                                                          │
│  COOLDOWN 5 MENIT → bisa mulai attempt baru              │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Score Storage

| Field | Type | Description |
|-------|------|-------------|
| `total_score` | `FLOAT` | 0–100, null sebelum evaluasi |
| `per_question_results` | `JSONB` | Array {{QUESTION_COUNT}} elemen, masing-masing dengan detail rubrik |
| `ai_feedback` | `TEXT` | Feedback naratif dari AI |
| `evaluated_at` | `TIMESTAMP` | null → belum dievaluasi; terisi → sudah |
| `ai_model` | `VARCHAR` | Model yang digunakan (e.g., `gpt-4o`) |

---

## 4. Error Handling Matrix

### 4.1 API Errors

| Skenario | Response | UX |
|----------|----------|----|
| Unauthorized (no session) | 401 | Redirect ke login |
| Student not found | 404 | "Data siswa tidak ditemukan" |
| Cooldown active | 429 + `cooldown_remaining_seconds` | Error message + countdown timer |
| Invalid body | 400 + detail | Console error (dev), generic error (user) |
| AI evaluation timeout | 500 | "Gagal mengevaluasi" → fallback submitted screen |
| AI parse error (Zod) | Fallback object | Skor 0 untuk soal tersebut, feedback "Evaluasi gagal" |
| Network error (client) | — | "Periksa koneksi internet dan coba lagi" |

### 4.2 Client-Side Error States

| Skenario | Handling |
|----------|----------|
| Fullscreen denied | Graceful fallback — asesmen tetap jalan |
| Draft save failed | `console.warn`, tidak blocking UX |
| Submit gagal | `submitError` state, tombol "Coba Lagi" |
| Double submit | `hasSubmittedRef` guard |
| Page refresh mid-exam | Draft restore + reuse existing `in_progress` attempt |
| AI eval gagal | Fallback ke `submitted` screen (jawaban tetap tersimpan) |

### 4.3 Access Check Errors

| Skenario | Handling |
|----------|----------|
| API check-access gagal (network) | `accessAllowed = false` (deny for safety) |
| API check-access gagal (server error) | `accessAllowed = false` + generic message |
| Tidak ada section status record | Dianggap belum selesai (missing) |

---

## 5. AI Model Configuration

```typescript
// src/lib/ai/client.ts
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Asesmen Formatif Evaluation
model: "gpt-4o"
input: [
  { role: "system", content: PROMPTS.AsesmenFormatif.system },
  { role: "user",   content: PROMPTS.AsesmenFormatif.user(...) }
]
text: { format: zodTextFormat(AsesmenFormatifItemSchema, "asesmen_formatif_eval") }
```

**Mengapa GPT-4o?**
- Kemampuan reasoning matematika yang kuat
- Mendukung structured output (Zod schema)
- Konsistensi evaluasi rubrik
- Bahasa Indonesia yang natural

**Cost consideration**: 10 soal × 10 panggilan AI per submission. Dengan GPT-4o, estimasi ~$0.05–0.15 per submission lengkap (tergantung panjang jawaban).

---

## 6. Security Considerations

| Area | Implementation |
|------|---------------|
| **AI Prompt Injection** | Jawaban siswa di-escape; system prompt fixed |
| **Submission Tampering** | Ownership verification (studentId match) |
| **Replay Attack** | Attempt status guard (hanya `in_progress` yang bisa terima events) |
| **Score Manipulation** | Evaluate endpoint verifikasi submission ownership |
| **Draft Isolation** | Draft diisolasi per `studentId + moduleId` |
| **Rate Limiting** | Cooldown 5 menit mencegah spam |
| **AI Cost Protection** | Idempotency check (`evaluated_at`) mencegah double-charge |

---

## 6. Contoh Instansiasi: Kaidah Pencacahan

| Placeholder | Nilai |
|-------------|-------|
| `{{MODULE_NAME}}` | Kaidah Pencacahan |
| `{{CONCEPT_NAMES}}` | Aturan Penjumlahan & Perkalian |
| `{{QUESTION_COUNT}}` | 10 |

**System Prompt (full)**:
```
Kamu adalah asisten guru matematika yang mengevaluasi jawaban siswa 
untuk soal Kaidah Pencacahan (Aturan Penjumlahan & Perkalian).
```

**Catatan**: System prompt AI perlu disesuaikan per modul agar AI memahami konteks materi yang dievaluasi (misalnya untuk Faktorial: "...untuk soal Faktorial (Operasi n! dan sifat-sifatnya)").
