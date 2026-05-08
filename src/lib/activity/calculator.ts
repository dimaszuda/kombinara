// Activity score calculator
// Formula: (reading * w1) + (freq * w2) + (depth * w3) + (quiz * w4)
// Bobot diambil dari class_settings

export interface ActivityComponents {
  readingEngagement: number; // 0-100
  questionFrequency: number; // normalized: questions / study_time_minutes
  questionDepth: number;     // rata-rata depth score 1-5, dinormalisasi ke 0-100
  quizScore: number;         // 0-100
}

export interface ActivityWeights {
  reading: number;   // default 0.25
  frequency: number; // default 0.25
  depth: number;     // default 0.30
  quiz: number;      // default 0.20
}

export const DEFAULT_WEIGHTS: ActivityWeights = {
  reading: 0.25,
  frequency: 0.25,
  depth: 0.30,
  quiz: 0.20,
};

export function calculateActivityScore(
  components: ActivityComponents,
  weights: ActivityWeights = DEFAULT_WEIGHTS
): number {
  const normalizedDepth = ((components.questionDepth - 1) / 4) * 100;
  const normalizedFrequency = Math.min(components.questionFrequency * 10, 100);

  return (
    components.readingEngagement * weights.reading +
    normalizedFrequency * weights.frequency +
    normalizedDepth * weights.depth +
    components.quizScore * weights.quiz
  ) * 100;
}
