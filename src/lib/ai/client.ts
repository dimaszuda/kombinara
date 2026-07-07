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