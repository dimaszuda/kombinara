"use client";

import React from "react";
import { useState } from "react";
import { CheckIcon, LightbulbIcon } from "@/components/ui/IconButton";
import VehicleChoicePicker from "./VehicleChoicePicker";
import OutfitComboPicker from "./OutfitComboPicker";
import CommitteePicker from "./CommitteePicker";
import PasswordCounterPemantik from "./PasswordCounterPemantik";
import TeamSelectionComparator from "./TeamSelectionComparator";
import CourierRouteExplorer from "./CourierRouteExplorer";

// components/materi/ApersepsiSection.tsx

type ApersepsiItem = {
  id: string;
  questionKey: string;
  timeRange: string;
  question: string;
  icon: "vehicles" | "clothes" | "badges";
};

const APERSEPSI_DATA: ApersepsiItem[] = [
  {
    id: "transportasi",
    questionKey: "kendaraan",
    timeRange: "06.00",
    question:
      "Kamu punya 3 sepeda, 2 motor, dan 1 mobil. Ayah membolehkanmu pakai salah satu buat belajar kelompok. Kira-kira ada berapa kemungkinan kendaraan yang bisa kamu pilih?",
    icon: "vehicles",
  },
  {
    id: "outfit",
    questionKey: "outfit",
    timeRange: "12.00",
    question:
      "Kamu punya 4 baju dan 3 celana. Kira-kira ada berapa kombinasi outfit berbeda yang bisa kamu pakai buat pergi?",
    icon: "clothes",
  },
  {
    id: "pengurus",
    questionKey: "pengurus",
    timeRange: "16.00",
    question:
      "Ada 3 kandidat pengurus karang taruna. Dari situ akan dipilih 1 ketua dan 1 sekretaris. Kira-kira ada berapa susunan pengurus yang mungkin terbentuk?",
    icon: "badges",
  },
];

const PEMANTIK_SOAL = {
  password:
    "Setiap pengguna wajib bikin password 4 karakter dari angka 0–9 dan huruf A–Z, boleh berulang. Kira-kira sistemmu bisa menampung berapa pelanggan kalau setiap password harus unik?",
  team: "Dari 10 teman, kamu mau pilih 3 orang buat tim lomba. Aturan A: ada jabatan (ketua, wakil, notulen). Aturan B: tanpa jabatan. Apakah jumlah cara membentuk timnya sama?",
  courier:
    "Dari kota A ke B ada 5 jalan, dari B ke C ada 4 jalan. Kamu antar paket A → C lalu balik C → A, tapi nggak boleh lewat jalan yang sama. Apakah kamu perlu menghitung rute pergi dan pulang secara terpisah?",
} as const;

type AnswerState = Record<string, { perkiraan: string; caraHitung: string }>;

// Section Pemantik
type ToggleValue = "yes" | "no" | null;


export default function ApersepsiSection() {
  // stub state, ganti ke logic simpan-ke-DB pas wiring backend
  const [answers, setAnswers] = useState<AnswerState>({});
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string | null>>({});
  const [textColor, setTextColor] = useState<Record<string, string | null>>({});
  const [apersepsiSubmitted, setApersepsiSubmitted] = useState(false);

  function updateAnswer(id: string, field: "perkiraan" | "caraHitung", value: string) {
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleApersepsiSubmit() {
    setIsChecking(true);
    setFeedback({});

    const newFeedback: Record<string, string | null> = {};
    const newColor: Record<string, string | null> = {};

    // Client-side validation
    let allComplete = true;
    for (const item of APERSEPSI_DATA) {
      const ans = answers[item.id];
      if (!ans?.perkiraan || !ans?.caraHitung) {
        newFeedback[item.id] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor[item.id] = "text-red-500";
        allComplete = false;
      }
    }

    if (!allComplete) {
      setFeedback(newFeedback);
      setTextColor(newColor);
      setIsChecking(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/apersepsi-pemantik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "apersepsi",
          responses: APERSEPSI_DATA.map((item) => ({
            question_key: item.questionKey,
            soal: item.question,
            response_data: {
              estimated_answer: answers[item.id].perkiraan,
              reasoning: answers[item.id].caraHitung,
            },
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      for (const item of APERSEPSI_DATA) {
        const itemResult = data.feedback?.[item.questionKey];
        newFeedback[item.id] = itemResult?.feedback ?? "Jawaban tersimpan.";
        newColor[item.id] = "text-[#2C2C2A]";
      }
      setFeedback(newFeedback);
      setTextColor(newColor);
      setApersepsiSubmitted(true);
    } catch {
      for (const item of APERSEPSI_DATA) {
        newFeedback[item.id] = "Maaf, ada kendala. Coba lagi ya!";
        newColor[item.id] = "text-red-500";
      }
      setFeedback(newFeedback);
      setTextColor(newColor);
    } finally {
      setIsChecking(false);
    }
  }

  async function handlePemantikSubmit() {
    setIsCheckingPemantik(true);
    setPemantikFeedback({});
    setPemantikTextColor({});

    const items = [
      {
        id: "password",
        question_key: "password_kapasitas",
        soal: PEMANTIK_SOAL.password,
        jawaban: passwordGuess,
        alasan: passwordReasoning,
        response_data: { estimated_answer: passwordGuess, reasoning: passwordReasoning },
      },
      {
        id: "team",
        question_key: "tim_sama_beda",
        soal: PEMANTIK_SOAL.team,
        jawaban: teamChoice === "yes" ? "Sama" : teamChoice === "no" ? "Beda" : "",
        alasan: teamReasoning,
        response_data: {
          choice: teamChoice === "yes" ? "sama" : teamChoice === "no" ? "beda" : "",
          reasoning: teamReasoning,
        },
      },
      {
        id: "courier",
        question_key: "rute_kurir",
        soal: PEMANTIK_SOAL.courier,
        jawaban: courierChoice === "yes" ? "Perlu" : courierChoice === "no" ? "Nggak perlu" : "",
        alasan: courierReasoning,
        response_data: {
          choice: courierChoice === "yes" ? "perlu" : courierChoice === "no" ? "nggak_perlu" : "",
          reasoning: courierReasoning,
          calculation: courierCalc,
        },
      },
    ];

    const newFeedback: Record<string, string | null> = {};
    const newColor: Record<string, string | null> = {};

    // Client-side validation
    let allComplete = true;
    for (const item of items) {
      if (!item.jawaban || !item.alasan) {
        newFeedback[item.id] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor[item.id] = "text-red-500";
        allComplete = false;
      }
    }

    if (!allComplete) {
      setPemantikFeedback(newFeedback);
      setPemantikTextColor(newColor);
      setIsCheckingPemantik(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/apersepsi-pemantik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "pemantik",
          responses: items.map((item) => ({
            question_key: item.question_key,
            soal: item.soal,
            response_data: item.response_data,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      for (const item of items) {
        const itemResult = data.feedback?.[item.question_key];
        newFeedback[item.id] = itemResult?.feedback ?? "Jawaban tersimpan.";
        newColor[item.id] = "text-[#2C2C2A]";
      }
      setPemantikFeedback(newFeedback);
      setPemantikTextColor(newColor);
      setPemantikSubmitted(true);
    } catch {
      for (const item of items) {
        newFeedback[item.id] = "Maaf, ada kendala. Coba lagi ya!";
        newColor[item.id] = "text-red-500";
      }
      setPemantikFeedback(newFeedback);
      setPemantikTextColor(newColor);
    } finally {
      setIsCheckingPemantik(false);
    }
  }

  async function handleRefleksiSubmit() {
    setIsCheckingRefleksi(true);
    setRefleksiFeedback({});
    setRefleksiTextColor({});

    const newFeedback: Record<string, string | null> = {};
    const newColor: Record<string, string | null> = {};

    // Client-side validation
    let allComplete = true;
    if (!methodSufficient) {
      newFeedback["methodSufficient"] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
      newColor["methodSufficient"] = "text-red-500";
      allComplete = false;
    }
    if (!whatToLearn) {
      newFeedback["whatToLearn"] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
      newColor["whatToLearn"] = "text-red-500";
      allComplete = false;
    }

    if (!allComplete) {
      setRefleksiFeedback(newFeedback);
      setRefleksiTextColor(newColor);
      setIsCheckingRefleksi(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/apersepsi-pemantik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "refleksi",
          responses: [
            {
              question_key: "refleksi_sebelum_mulai",
              soal: "Refleksi sebelum mulai: (1) Apakah cara menghitung yang kamu gunakan di Apersepsi tadi cukup untuk menjawab ketiga situasi Pemantik? (2) Apa yang menurutmu perlu kamu pelajari untuk bisa menjawabnya?",
              response_data: {
                cukup_atau_tidak: methodSufficient,
                yang_perlu_dipelajari: whatToLearn,
              },
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const itemResult = data.feedback?.["refleksi_sebelum_mulai"];
      const feedbackText = itemResult?.feedback ?? "Jawaban tersimpan.";

      // Show LLM feedback under both fields so it's visible regardless of scroll
      newFeedback["methodSufficient"] = feedbackText;
      newColor["methodSufficient"] = "text-[#2C2C2A]";

      setRefleksiFeedback(newFeedback);
      setRefleksiTextColor(newColor);
      setRefleksiSubmitted(true);
    } catch {
      newFeedback["methodSufficient"] = "Maaf, ada kendala. Coba lagi ya!";
      newColor["methodSufficient"] = "text-red-500";
      setRefleksiFeedback(newFeedback);
      setRefleksiTextColor(newColor);
    } finally {
      setIsCheckingRefleksi(false);
    }
  }

  // Section Pemantik
  const [passwordGuess, setPasswordGuess] = useState("");
  const [passwordReasoning, setPasswordReasoning] = useState("");

  const [teamChoice, setTeamChoice] = useState<ToggleValue>(null);
  const [teamReasoning, setTeamReasoning] = useState("");

  const [courierChoice, setCourierChoice] = useState<ToggleValue>(null);
  const [courierReasoning, setCourierReasoning] = useState("");
  const [courierCalc, setCourierCalc] = useState("");

  const [isCheckingPemantik, setIsCheckingPemantik] = useState(false);
  const [pemantikFeedback, setPemantikFeedback] = useState<Record<string, string | null>>({});
  const [pemantikTextColor, setPemantikTextColor] = useState<Record<string, string | null>>({});
  const [pemantikSubmitted, setPemantikSubmitted] = useState(false);

  // section refleksi
  const [methodSufficient, setMethodSufficient] = useState("");
  const [whatToLearn, setWhatToLearn] = useState("");

  const [isCheckingRefleksi, setIsCheckingRefleksi] = useState(false);
  const [refleksiFeedback, setRefleksiFeedback] = useState<Record<string, string | null>>({});
  const [refleksiTextColor, setRefleksiTextColor] = useState<Record<string, string | null>>({});
  const [refleksiSubmitted, setRefleksiSubmitted] = useState(false);

  return (
    <section className="rounded-xl border border-[#346739] p-7">
      <h2 className="kp-subtitle" style={{ color: "#346739" }}>
          Apersepsi dan Pemantik
      </h2>
      <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white mt-8">
        Apersepsi
      </span>
      <p className="mt-4 text-sm">
        🌍 <b>Tujuan</b>: Mengaktifkan pengetahuan dan pengalaman yang sudah kamu miliki sebagai jembatan menuju materi baru.
      </p>

      <p className="mt-4 text-xl font-medium text-[#346739]">
        Sebelum masuk materi, coba bayangkan satu harimu
      </p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#346739]">
        Tiga keputusan kecil di bawah ini sebenarnya soal matematika yang sama. Tulis aja
        dugaanmu, nggak ada yang salah di sini.
      </p>

      <div className="relative mt-7 space-y-4 pl-8">
        <div
          aria-hidden
          className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-[repeating-linear-gradient(to_bottom,#346739_0_5px,transparent_5px_10px)]"
        />

        {APERSEPSI_DATA.map((item) => {
          const dotColor = item.icon === "clothes" ? "#663362" : "#346739";
          const current = answers[item.id] ?? { perkiraan: "", caraHitung: "" };

          return (
            <div key={item.id} className="relative">
              <div
                aria-hidden
                className="absolute -left-[30px] top-1 h-[18px] w-[18px] rounded-full border-[3px] border-[#DBFFD5]"
                style={{ backgroundColor: dotColor }}
              />

              <div className="rounded-xl bg-white p-4 pb-4">
                {item.icon === "vehicles" ? (
                  <div className="mt-3">
                    <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{item.question}</p>
                    <VehicleChoicePicker />
                  </div>
                ) : item.icon === "clothes" ? (
                  <div className="mt-3">
                    <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{item.question}</p>
                    <OutfitComboPicker />
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="mb-3 text-sm leading-relaxed text-[#2C2C2A]">{item.question}</p>
                    <CommitteePicker />
                  </div>
                )}

                <div className="mt-3 grid grid-rows gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#663362]">
                      Perkiraanmu
                    </label>
                    <input
                      type="text"
                      placeholder="tulis dugaan jumlahnya"
                      value={current.perkiraan}
                      onChange={(e) => updateAnswer(item.id, "perkiraan", e.target.value)}
                      className="w-full rounded-md border border-[#34673933] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#663362]">
                      Cara hitungnya
                    </label>
                    <textarea
                      placeholder="ceritain logikamu"
                      value={current.caraHitung}
                      onChange={(e) => updateAnswer(item.id, "caraHitung", e.target.value)}
                      className="w-full h-[calc(100%-20px)] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
                    />
                  </div>
                </div>

                {/* AI Feedback per item */}
                {feedback[item.id] && (
                  <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
                    <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
                    <p className={`text-sm leading-relaxed ${textColor[item.id] || "text-[#2C2C2A]"}`}>
                      {feedback[item.id]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* ═══════════════ Submit & Feedback ═══════════════ */}
      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
        <button
          type="button"
          onClick={handleApersepsiSubmit}
          disabled={isChecking || apersepsiSubmitted}
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          {isChecking ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Mengecek...
            </>
          ) : apersepsiSubmitted ? (
            <>
              <CheckIcon />
              Tersimpan
            </>
          ) : (
            <>
              <CheckIcon />
              Simpan Jawaban
            </>
          )}
        </button>
      </div>

      {/* Section Pemantik */}
      <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white mt-8">
        Pemantik
      </span>

      <p className="mt-4 text-xl font-medium text-[#346739]">
        Coba pikir lagi, caramu biasanya cukup nggak?
      </p>
      <p className="mt-1 text-[13px] leading-relaxed">
        🟡 <b>Tujuan</b>: Membangun rasa ingin tahu dan menyadarkan bahwa cara berpikir biasa belum cukup untuk menjawab pertanyaan-pertanyaan ini.
      </p>

      <div className="mt-5 flex flex-col gap-3.5">
        {/* Tantangan 1 */}
        <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
            Tantangan 1 · Kapasitas password
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
            Setiap pengguna wajib bikin password 4 karakter, boleh angka 0–9 dan huruf A–Z, dan
            boleh berulang.
          </p>

          <PasswordCounterPemantik />

          <p className="mt-4 text-sm font-medium leading-relaxed text-[#2C2C2A]">
            Kira-kira sistemmu bisa menampung berapa pelanggan kalau setiap password harus beda?
          </p>

          <div className="mt-3 grid grid-rows-[1fr_4fr] gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#663362]">
                Perkiraanmu
              </label>
              <input
                type="text"
                placeholder="tulis dugaan jumlahnya"
                value={passwordGuess}
                onChange={(e) => setPasswordGuess(e.target.value)}
                className="w-full rounded-md border border-[#34673933] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#663362]">
                Cara hitungmu
              </label>
              <textarea
                placeholder="ceritain logikamu"
                value={passwordReasoning}
                onChange={(e) => setPasswordReasoning(e.target.value)}
                className="w-full h-[calc(100%-20px)] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-none"
              />
            </div>
          </div>

          {/* AI Feedback */}
          {pemantikFeedback["password"] && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
              <p className={`text-sm leading-relaxed ${pemantikTextColor["password"] || "text-[#2C2C2A]"}`}>
                {pemantikFeedback["password"]}
              </p>
            </div>
          )}
        </div>

        {/* Tantangan 2 */}
        <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
            Tantangan 2 · Sama atau beda?
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
            Dari 10 teman, kamu mau pilih 3 orang buat tim lomba, dengan dua aturan berbeda.
          </p>

          <TeamSelectionComparator
            choice={teamChoice}
            onChoiceChange={setTeamChoice}
            reasoning={teamReasoning}
            onReasoningChange={setTeamReasoning}
          />

          {/* AI Feedback */}
          {pemantikFeedback["team"] && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
              <p className={`text-sm leading-relaxed ${pemantikTextColor["team"] || "text-[#2C2C2A]"}`}>
                {pemantikFeedback["team"]}
              </p>
            </div>
          )}
        </div>

        {/* Tantangan 3 */}
        <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
            Tantangan 3 · Rute kurir
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
            Dari kota A ke B ada 5 jalan, dari B ke C ada 4 jalan. Kamu antar paket A → C lalu
            balik lagi C → A, tapi nggak boleh lewat jalan yang sama.
          </p>

          <CourierRouteExplorer
            choice={courierChoice}
            onChoiceChange={setCourierChoice}
            reasoning={courierReasoning}
            onReasoningChange={setCourierReasoning}
            calcMethod={courierCalc}
            onCalcMethodChange={setCourierCalc}
          />

          {/* AI Feedback */}
          {pemantikFeedback["courier"] && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
              <p className={`text-sm leading-relaxed ${pemantikTextColor["courier"] || "text-[#2C2C2A]"}`}>
                {pemantikFeedback["courier"]}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
        <button
          type="button"
          onClick={handlePemantikSubmit}
          disabled={isCheckingPemantik || pemantikSubmitted}
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          {isCheckingPemantik ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Mengecek...
            </>
          ) : pemantikSubmitted ? (
            <>
              <CheckIcon />
              Tersimpan
            </>
          ) : (
            <>
              <CheckIcon />
              Simpan Jawaban
            </>
          )}
        </button>
      </div>

      {/* section refleksi */}
      <span className="inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white mt-8">
        Refleksi
      </span>

      <p className="mt-4 text-xl font-medium text-[#346739]">Refleksi Sebelum Mulai</p>
      <p className="mt-2.5 text-sm leading-relaxed text-[#2C2C2A]">
        Setelah membaca ketiga situasi di atas, jawab pertanyaan ini:
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium leading-relaxed text-[#2C2C2A]">
            Apakah cara menghitung yang kamu gunakan di Apersepsi tadi cukup untuk menjawab
            ketiga situasi di atas? Mengapa?
          </p>
          <textarea
            rows={3}
            placeholder="tulis jawabanmu di sini"
            value={methodSufficient}
            onChange={(e) => setMethodSufficient(e.target.value)}
            className="w-full resize-y rounded-md border border-[#34673933] px-3 py-2 text-sm"
          />
          {refleksiFeedback["methodSufficient"] && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
              <p className={`text-sm leading-relaxed ${refleksiTextColor["methodSufficient"] || "text-[#2C2C2A]"}`}>
                {refleksiFeedback["methodSufficient"]}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium leading-relaxed text-[#2C2C2A]">
            Apa yang menurutmu perlu kamu pelajari untuk bisa menjawabnya?
          </p>
          <textarea
            rows={3}
            placeholder="tulis jawabanmu di sini"
            value={whatToLearn}
            onChange={(e) => setWhatToLearn(e.target.value)}
            className="w-full resize-y rounded-md border border-[#34673933] px-3 py-2 text-sm"
          />
          {refleksiFeedback["whatToLearn"] && (
            <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
              <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
              <p className={`text-sm leading-relaxed ${refleksiTextColor["whatToLearn"] || "text-[#2C2C2A]"}`}>
                {refleksiFeedback["whatToLearn"]}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#663362] p-5">
        <LightbulbIcon />
        <p className="text-[15px] leading-relaxed text-white">
          Itulah mengapa kita mempelajari Kaidah Pencacahan. Bukan untuk menghafal rumus,
          melainkan untuk membangun cara berpikir yang sistematis dalam menghitung kemungkinan
          sehingga pertanyaan-pertanyaan di atas bisa dijawab dengan tepat dan efisien.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
        <button
          type="button"
          onClick={handleRefleksiSubmit}
          disabled={isCheckingRefleksi || refleksiSubmitted}
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          {isCheckingRefleksi ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Mengecek...
            </>
          ) : refleksiSubmitted ? (
            <>
              <CheckIcon />
              Tersimpan
            </>
          ) : (
            <>
              <CheckIcon />
              Simpan Jawaban
            </>
          )}
        </button>
      </div>
    </section>
  );
}
