// Domain types untuk Kombinara

export type UserRole = "guru" | "siswa";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nama: string;
  kelasId?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string | null;
  className: string | null;
  gender?: string | null;
}

// Materi — corresponding to Prisma Materi model
export interface Materi {
  id: number;
  slug: string;
  judul: string;
  konten: TipTapJSON; // TipTap JSON format (Prisma Json → JsonValue at runtime)
  urutan: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TipTapJSON = Record<string, unknown>;

// Quiz
export type TipeSoal = "mcq" | "isian" | "handwritten";

export interface Soal {
  id: string;
  quizId: string;
  tipe: TipeSoal;
  pertanyaan: string;
  opsi?: string[];         // hanya untuk MCQ
  jawabanBenar?: string;   // null untuk handwritten (dinilai AI)
  rubrik?: string;         // untuk handwritten
  bobot: number;
  urutan: number;
}

export interface Quiz {
  id: string;
  materiId: string;
  judul: string;
  soal: Soal[];
}

// Ulangan
export interface Ulangan {
  id: string;
  judul: string;
  durasiMenit: number;
  soal: Soal[];
  mulaiAt: Date;
  selesaiAt: Date;
}

// AI
export interface HandwrittenFeedback {
  ocr_result: string;
  is_correct: boolean;
  score: number;
  feedback: string;
  correction: string | null;
}

export interface DepthScoreResult {
  score: 1 | 2 | 3 | 4 | 5;
  category: "clarification" | "conceptual" | "application" | "critical";
  reasoning: string;
}

// Activity
export interface ActivityBreakdown {
  siswaId: string;
  readingEngagement: number;
  questionFrequency: number;
  questionDepth: number;
  quizScore: number;
  totalScore: number;
  updatedAt: Date;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  siswaId: string;
  nama: string;
  activityScore: number;
  completionRate: number;
}
