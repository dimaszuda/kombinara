import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { PROMPTS } from "./prompts";

const client = new OpenAI();

const AsesmenDiagnostikSchema = z.object({
  isCorrect: z.boolean(),
});

export const AsesmenDiagnostikPrompt = async (
  soal: string,
  opsi: string,
  jawaban: string
) => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: PROMPTS.AsesmenDiagnostikPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.AsesmenDiagnostikPrompt.user(soal, opsi, jawaban),
      },
    ],
    text: {
      format: zodTextFormat(AsesmenDiagnostikSchema, "asesmen_diagnostik"),
    },
  });

  return response.output_parsed ?? { isCorrect: false };
};

const EskplorasiSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string(),
});

export type EskplorasiResult = z.infer<typeof EskplorasiSchema>;

export const EskplorasiPrompt = async (
  soal: string,
  jawaban: string,
  alasan: string
): Promise<EskplorasiResult> => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: PROMPTS.EskplorasiPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.EskplorasiPrompt.user(soal, jawaban, alasan),
      },
    ],
    text: {
      format: zodTextFormat(EskplorasiSchema, "eskplorasi_kontekstual"),
    },
  });

  return (
    response.output_parsed ?? {
      isCorrect: false,
      feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!",
    }
  );
};

// ---------------------------------------------------------------------------
// Refleksi Mini
// ---------------------------------------------------------------------------

const RefleksiItemSchema = z.object({
  valid: z.boolean(),
  feedback: z.string(),
});

const RefleksiSchema = z.object({
  q1: RefleksiItemSchema,
  q2: RefleksiItemSchema,
  q3: RefleksiItemSchema,
});

export type RefleksiResult = z.infer<typeof RefleksiSchema>;

export const RefleksiPrompt = async (
  jawabanQ1: string,
  jawabanQ2: string,
  jawabanQ3: string
): Promise<RefleksiResult> => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: PROMPTS.RefleksiPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.RefleksiPrompt.user(jawabanQ1, jawabanQ2, jawabanQ3),
      },
    ],
    text: {
      format: zodTextFormat(RefleksiSchema, "refleksi_mini"),
    },
  });

  return (
    response.output_parsed ?? {
      q1: { valid: false, feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!" },
      q2: { valid: false, feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!" },
      q3: { valid: false, feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!" },
    }
  );
};

// ---------------------------------------------------------------------------
// Answer Classification (Apersepsi · Pemantik · Refleksi)
// ---------------------------------------------------------------------------

const AnswerClassificationSchema = z.object({
  isCorrect: z.boolean(),
  misconceptionType: z.string().nullable(),
  feedback: z.string(),
});

export type AnswerClassificationResult = z.infer<typeof AnswerClassificationSchema>;

export const AnswerClassificationPrompt = async (
  soal: string,
  groundTruth: string,
  jawaban: string
): Promise<AnswerClassificationResult> => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: PROMPTS.AnswerClassification.system,
      },
      {
        role: "user",
        content: PROMPTS.AnswerClassification.user(soal, groundTruth, jawaban),
      },
    ],
    text: {
      format: zodTextFormat(AnswerClassificationSchema, "answer_classification"),
    },
  });

  return (
    response.output_parsed ?? {
      isCorrect: false,
      misconceptionType: null,
      feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!",
    }
  );
};

// ---------------------------------------------------------------------------
// Tantangan (Penutup Modul) — per-question feedback
// ---------------------------------------------------------------------------

const TantanganSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string(),
});

export type TantanganResult = z.infer<typeof TantanganSchema>;

export const TantanganPrompt = async (
  soal: string,
  jawaban: string
): Promise<TantanganResult> => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content: PROMPTS.Tantangan.system,
      },
      {
        role: "user",
        content: PROMPTS.Tantangan.user(soal, jawaban),
      },
    ],
    text: {
      format: zodTextFormat(TantanganSchema, "tantangan"),
    },
  });

  return (
    response.output_parsed ?? {
      isCorrect: false,
      feedback: "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!",
    }
  );
};

// ---------------------------------------------------------------------------
// Asesmen Formatif — per-question evaluation
// ---------------------------------------------------------------------------

const StepByStepItemSchema = z.object({
  score: z.number().min(0).max(3),
  reasoning: z.string(),
});

const AsesmenFormatifItemSchema = z.object({
  step_by_step: z.object({
    identifikasi_kondisi: StepByStepItemSchema,
    pemilihan_rumus: StepByStepItemSchema,
    eksekusi_perhitungan: StepByStepItemSchema,
    justifikasi: StepByStepItemSchema,
  }),
  process_raw_score: z.number(),
  process_scaled_score: z.number(),
  final_answer_score: z.number(),
  total_score: z.number(),
  guardrail_applied: z.string().nullable(),
  mistake_category: z
    .enum(["konsep", "formula", "perhitungan", "lainnya"])
    .nullable(),
  mistake_detail: z.string().nullable(),
  feedback: z.string(),
});

export type AsesmenFormatifItemResult = z.infer<typeof AsesmenFormatifItemSchema>;

export const AsesmenFormatifEvaluatePrompt = async (
  soal: string,
  levelSoal: string,
  caraHitung: string,
  jawabanAkhir: string,
  isJawabanAkhirTrue: boolean
): Promise<AsesmenFormatifItemResult> => {
  const response = await client.responses.parse({
    model: "gpt-4o",
    input: [
      { role: "system", content: PROMPTS.AsesmenFormatif.system },
      {
        role: "user",
        content: PROMPTS.AsesmenFormatif.user(
          soal,
          levelSoal,
          caraHitung,
          jawabanAkhir,
          isJawabanAkhirTrue
        ),
      },
    ],
    text: {
      format: zodTextFormat(AsesmenFormatifItemSchema, "asesmen_formatif_eval"),
    },
  });

  return (
    response.output_parsed ?? {
      step_by_step: {
        identifikasi_kondisi: { score: 0, reasoning: "Evaluasi gagal" },
        pemilihan_rumus: { score: 0, reasoning: "Evaluasi gagal" },
        eksekusi_perhitungan: { score: 0, reasoning: "Evaluasi gagal" },
        justifikasi: { score: 0, reasoning: "Evaluasi gagal" },
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
  );
};

// ---------------------------------------------------------------------------
// Chat — Panel chatbot (dengan / tanpa konteks seleksi teks)
// Sliding window: history 5 percakapan terakhir untuk menjaga konteks.
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Mapping section key → label yang mudah dibaca AI (hanya section MATERI) */
const SECTION_LABELS: Record<string, string> = {
  penjumlahan: "Kaidah Penjumlahan (Aturan Penjumlahan)",
  "penjumlahan-1": "Eksplorasi Kontekstual — Penjumlahan",
  "penjumlahan-2": "Aktivitas Deep Learning — Penjumlahan",
  "penjumlahan-3": "Penjelasan Konsep — Penjumlahan",
  "penjumlahan-4": "Contoh Soal Bertahap — Penjumlahan",
  "penjumlahan-5": "Mengapa? Corner — Penjumlahan",
  "penjumlahan-6": "Refleksi Mini — Penjumlahan",
  perkalian: "Kaidah Perkalian (Aturan Perkalian)",
  "perkalian-1": "Eksplorasi Kontekstual — Perkalian",
  "perkalian-2": "Aktivitas Deep Learning — Perkalian",
  "perkalian-3": "Penjelasan Konsep — Perkalian",
  "perkalian-4": "Contoh Soal Bertahap — Perkalian",
  "perkalian-5": "Mengapa? Corner — Perkalian",
  "perkalian-6": "Aktivitas Siswa — Perkalian",
  "perkalian-7": "Panduan Cepat — Perkalian",
  "perkalian-8": "Refleksi Mini — Perkalian",
  faktorial: "Faktorial",
  "faktorial-1": "Eksplorasi Kontekstual — Faktorial",
  "faktorial-2": "Aktivitas Deep Learning — Faktorial",
  "faktorial-3": "Penjelasan Konsep — Faktorial",
  "faktorial-4": "Contoh Soal Bertahap — Faktorial",
  "faktorial-5": "Mengapa? Corner — Faktorial",
  "faktorial-6": "Aktivitas Siswa — Faktorial",
  "faktorial-7": "Refleksi Mini — Faktorial",
  permutasi: "Permutasi",
  "permutasi-1": "Eksplorasi Kontekstual — Permutasi",
  "permutasi-2": "Aktivitas Deep Learning — Permutasi",
  "permutasi-3": "Penjelasan Konsep — Permutasi",
  "permutasi-4": "Contoh Soal Bertahap — Permutasi",
  "permutasi-5": "Mengapa? Corner — Permutasi",
  "permutasi-6": "Aktivitas Siswa — Permutasi",
  "permutasi-7": "Refleksi Mini — Permutasi",
  kombinasi: "Kombinasi",
  "kombinasi-1": "Eksplorasi Kontekstual — Kombinasi",
  "kombinasi-2": "Aktivitas Deep Learning — Kombinasi",
  "kombinasi-3": "Penjelasan Konsep — Kombinasi",
  "kombinasi-4": "Contoh Soal Bertahap — Kombinasi",
  "kombinasi-5": "Mengapa? Corner — Kombinasi",
  "kombinasi-6": "Aktivitas Siswa — Kombinasi",
  "kombinasi-7": "Refleksi Mini — Kombinasi",
};

/** Mapping materiSlug → nama materi yang mudah dibaca AI */
const MATERI_LABELS: Record<string, string> = {
  "kaidah-pencacahan": "Kaidah Pencacahan (Aturan Penjumlahan + Aturan Perkalian)",
  faktorial: "Faktorial",
  permutasi: "Permutasi",
  kombinasi: "Kombinasi",
};

/**
 * Urutan section MATERI per halaman (flat, sesuai tampilan ke siswa).
 * TIDAK termasuk section pre-materi seperti asesmen diagnostik,
 * apersepsi, pemantik, dan refleksi sebelum mulai.
 */
const MATERI_SECTION_ORDER: Record<string, string[]> = {
  "kaidah-pencacahan": [
    "penjumlahan-1", "penjumlahan-2", "penjumlahan-3",
    "penjumlahan-4", "penjumlahan-5", "penjumlahan-6",
    "perkalian-1", "perkalian-2", "perkalian-3",
    "perkalian-4", "perkalian-5", "perkalian-6",
    "perkalian-7", "perkalian-8",
  ],
  faktorial: [
    "faktorial-1", "faktorial-2", "faktorial-3",
    "faktorial-4", "faktorial-5", "faktorial-6", "faktorial-7",
  ],
  permutasi: [
    "permutasi-1", "permutasi-2", "permutasi-3",
    "permutasi-4", "permutasi-5", "permutasi-6", "permutasi-7",
  ],
  kombinasi: [
    "kombinasi-1", "kombinasi-2", "kombinasi-3",
    "kombinasi-4", "kombinasi-5", "kombinasi-6", "kombinasi-7",
  ],
};

/**
 * Section key yang BUKAN materi inti — selalu di-exclude dari konteks AI.
 * Hanya relevan di halaman kaidah-pencacahan.
 */
const PRE_MATERI_KEYS = new Set([
  "asesmen", "apersepsi", "apersepsi-sub", "pemantik-sub", "refleksi-sub",
]);

function buildSectionContext(
  activeSection?: string,
  completedSections?: string[],
  materiSlug?: string
): string | null {
  const order = materiSlug ? (MATERI_SECTION_ORDER[materiSlug] ?? []) : [];

  // ── Filter: hanya section materi yang relevan ──
  const materiCompleted = (completedSections ?? []).filter(
    (key) => !PRE_MATERI_KEYS.has(key) && order.includes(key)
  );
  const completedSet = new Set(materiCompleted);

  // Jika activeSection adalah pre-materi (asesmen, apersepsi), anggap belum
  // ada section materi yang aktif — siswa masih di tahap awal.
  const isActivePreMateri = !!activeSection && PRE_MATERI_KEYS.has(activeSection);
  const effectiveActive = isActivePreMateri ? null : activeSection;

  // ── 1. Tentukan batas "section terjauh yang bisa diakses" ──
  let scopeEndIndex = order.length - 1;

  if (effectiveActive && order.length > 0) {
    const activeIdx = order.indexOf(effectiveActive);
    if (activeIdx !== -1) {
      scopeEndIndex = activeIdx;
    } else {
      // effectiveActive mungkin parent key (e.g., "penjumlahan"), cari child terakhir
      for (let i = 0; i < order.length; i++) {
        if (order[i].startsWith(effectiveActive + "-")) {
          for (let j = i; j < order.length; j++) {
            if (!order[j].startsWith(effectiveActive + "-")) break;
            scopeEndIndex = j;
          }
          break;
        }
      }
    }
  }

  // ── 2. Tentukan activeKey yang sebenarnya (child pertama yg belum completed) ──
  let activeKey: string | null = null;
  if (effectiveActive && order.length > 0) {
    const exactIdx = order.indexOf(effectiveActive);
    if (exactIdx !== -1) {
      activeKey = effectiveActive;
    } else {
      // Cari child pertama yang belum completed
      for (const key of order) {
        if (key.startsWith(effectiveActive + "-")) {
          if (!completedSet.has(key)) { activeKey = key; break; }
        }
      }
      if (!activeKey) {
        for (const key of order) {
          if (key.startsWith(effectiveActive + "-")) { activeKey = key; break; }
        }
      }
    }
  }

  // ── 3. Bangun daftar section in-scope dengan status ──
  const scopeSections: string[] = [];
  for (let i = 0; i <= scopeEndIndex && i < order.length; i++) {
    const key = order[i];
    const label = SECTION_LABELS[key] ?? key;
    if (activeKey && key === activeKey) {
      scopeSections.push(`  ▶ ${label} ← SEDANG DIKERJAKAN`);
    } else if (completedSet.has(key)) {
      scopeSections.push(`  ✓ ${label} (selesai)`);
    } else {
      scopeSections.push(`  ○ ${label} (belum selesai)`);
    }
  }

  // ── 4. Bangun output ──
  const parts: string[] = [];

  if (materiSlug) {
    const materiLabel = MATERI_LABELS[materiSlug] ?? materiSlug;
    parts.push(`Materi yang sedang dipelajari: ${materiLabel}`);
  }

  if (isActivePreMateri) {
    parts.push("Siswa masih di tahap awal (asesmen / apersepsi) — belum masuk ke materi inti.");
  } else if (scopeSections.length > 0) {
    parts.push(`Urutan section materi (dari awal sampai section aktif):\n${scopeSections.join("\n")}`);
  } else if (effectiveActive) {
    // Fallback: ordered list kosong / tidak cocok
    const activeLabel = SECTION_LABELS[effectiveActive] ?? effectiveActive;
    parts.push(`Section yang sedang aktif: ${activeLabel}`);
  }

  if (parts.length === 0) return null;

  return `-- Konteks pembelajaran siswa --
${parts.join("\n")}

Siswa TIDAK menyertakan teks yang dipilih (tidak melakukan highlight/seleksi teks). Gunakan konteks section di atas untuk memahami di mana posisi siswa dalam materi.
- Section dengan tanda ✓ sudah selesai dikerjakan siswa.
- Section dengan tanda ▶ sedang aktif (sedang dikerjakan).
- Section dengan tanda ○ sudah terbuka tapi belum selesai.
- Section yang TIDAK muncul dalam daftar di atas BELUM bisa diakses siswa (masih terkunci).
- Jika siswa meminta rangkuman, rangkum hanya section yang SUDAH SELESAI (✓) saja — jangan membocorkan isi section yang sedang aktif (▶) atau yang belum selesai (○).`;
}

// ─── Shared helper: build messages array ──────────────────────────────────
function buildChatMessages(
  question: string,
  selectedText?: string,
  contextBefore?: string,
  contextAfter?: string,
  history?: ChatMessage[],
  activeSection?: string,
  completedSections?: string[],
  materiSlug?: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const hasSelectionContext = !!(selectedText && (contextBefore || contextAfter));
  const sectionCtx = buildSectionContext(activeSection, completedSections, materiSlug);

  let userMessage: string;

  if (hasSelectionContext) {
    userMessage = PROMPTS.chat.user(selectedText!, contextBefore ?? "", contextAfter ?? "", question);
    if (sectionCtx) {
      userMessage = `${sectionCtx}\n\n${userMessage}`;
    }
  } else if (sectionCtx) {
    userMessage = `${sectionCtx}\n\nPertanyaan siswa: ${question}`;
  } else {
    userMessage = `Pertanyaan siswa: ${question}`;
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: PROMPTS.chat.system },
  ];

  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: userMessage });

  return messages;
}

export const ChatPrompt = async (
  question: string,
  selectedText?: string,
  contextBefore?: string,
  contextAfter?: string,
  history?: ChatMessage[],
  activeSection?: string,
  completedSections?: string[],
  materiSlug?: string
): Promise<string> => {
  const messages = buildChatMessages(
    question, selectedText, contextBefore, contextAfter,
    history, activeSection, completedSections, materiSlug,
  );

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ??
    "Maaf, Kombi lagi ada kendala nih. Coba tanyakan lagi ya!"
  );
};

// ─── Streaming variant for SSE ────────────────────────────────────────────
export async function* ChatPromptStream(
  question: string,
  selectedText?: string,
  contextBefore?: string,
  contextAfter?: string,
  history?: ChatMessage[],
  activeSection?: string,
  completedSections?: string[],
  materiSlug?: string
): AsyncGenerator<string> {
  const messages = buildChatMessages(
    question, selectedText, contextBefore, contextAfter,
    history, activeSection, completedSections, materiSlug,
  );

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}