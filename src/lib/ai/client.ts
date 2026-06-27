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

export const ApersepsiPrompt = async (
  soal: string,
  jawaban: string,
  cara_menghitung: string
): Promise<string> => {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: PROMPTS.ApersepsiPrompt.system,
      },
      {
        role: "user",
        content: PROMPTS.ApersepsiPrompt.user(soal, jawaban, cara_menghitung),
      },
    ],
    temperature: 0.7,
  });

  return (
    response.choices[0]?.message?.content ??
    "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!"
  );
};