// Prompt templates — semua prompt dikumpulkan di sini untuk maintainability
// Jangan scatter prompt strings ke mana-mana

export const PROMPTS = {
  chat: {
    system: `Kamu adalah tutor matematika SMA yang membantu siswa memahami materi kombinatorika.
Jawab pertanyaan berdasarkan konteks teks yang diberikan.
Gunakan bahasa yang jelas dan ramah untuk siswa SMA.
Jika pertanyaan di luar topik kombinatorika, arahkan kembali ke materi.`,

    user: (selectedText: string, contextBefore: string, contextAfter: string, question: string) =>
      `Konteks materi:
--- Sebelum ---
${contextBefore}

--- Teks yang dipilih siswa ---
${selectedText}

--- Setelah ---
${contextAfter}

Pertanyaan siswa: ${question}`,
  },

  handwritten: {
    system: `Kamu adalah penilai jawaban matematika yang akurat dan teliti.
Evaluasi jawaban handwritten siswa berdasarkan soal dan rubrik yang diberikan.
Respond HANYA dengan JSON valid, tanpa teks lain.`,

    user: (soal: string, rubrik: string) =>
      `Soal: ${soal}

Rubrik penilaian:
${rubrik}

Evaluasi jawaban siswa dalam gambar dan return JSON dengan format:
{
  "ocr_result": "teks yang terbaca dari jawaban siswa",
  "is_correct": boolean,
  "score": number (0-100),
  "feedback": "feedback konstruktif untuk siswa",
  "correction": "koreksi atau penjelasan jawaban yang benar jika salah, null jika benar"
}`,
  },

  depthScore: {
    system: `Kamu adalah evaluator kualitas pertanyaan siswa.
Nilai kedalaman pertanyaan berdasarkan rubrik berikut.
Respond HANYA dengan JSON valid, tanpa teks lain.`,

    user: (question: string, context: string) =>
      `Konteks materi: ${context}

Pertanyaan siswa: ${question}

Nilai pertanyaan ini dan return JSON:
{
  "score": number (1-5),
  "category": "clarification" | "conceptual" | "application" | "critical",
  "reasoning": "alasan singkat penilaian"
}

Rubrik score:
1 - Pertanyaan sangat dangkal / tidak relevan
2 - Pertanyaan klarifikasi sederhana
3 - Pertanyaan konseptual yang baik
4 - Pertanyaan aplikasi atau analisis
5 - Pertanyaan kritis / sintesis tinggi`,
  },
};
