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

export const PemantikPrompt = async (
  soal: string,
  jawaban: string,
  alasan: string,
  caraHitung?: string
): Promise<string> => {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: PROMPTS.PemantikPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.PemantikPrompt.user(soal, jawaban, alasan, caraHitung),
      },
    ],
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ??
    "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!"
  );
};