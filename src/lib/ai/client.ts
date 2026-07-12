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

export const EskplorasiPrompt = async (
  soal: string,
  jawaban: string,
  alasan: string
): Promise<string> => {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: PROMPTS.EskplorasiPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.EskplorasiPrompt.user(soal, jawaban, alasan),
      },
    ],
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ??
    "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!"
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
        content: PROMPTS.AnswerClassification.user(soal, jawaban),
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
// Chat — Panel chatbot (dengan / tanpa konteks seleksi teks)
// Sliding window: history 5 percakapan terakhir untuk menjaga konteks.
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const ChatPrompt = async (
  question: string,
  selectedText?: string,
  contextBefore?: string,
  contextAfter?: string,
  history?: ChatMessage[]
): Promise<string> => {
  const hasContext = selectedText && (contextBefore || contextAfter);

  const userMessage = hasContext
    ? PROMPTS.chat.user(selectedText!, contextBefore ?? "", contextAfter ?? "", question)
    : `Pertanyaan siswa: ${question}`;

  // Bangun messages array: system prompt + history + current question
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: PROMPTS.chat.system },
  ];

  // Sliding window: masukkan history percakapan sebelumnya (maks 5 pasang)
  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Pertanyaan terbaru
  messages.push({ role: "user", content: userMessage });

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