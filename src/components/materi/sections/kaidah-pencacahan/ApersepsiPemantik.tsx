"use client";

import React from "react";
import { useState } from "react";
import { VehicleIcons, ClothesIcons, BadgeIcons, CheckIcon, LightbulbIcon } from "@/components/ui/IconButton";
import VehicleChoicePicker from "./VehicleChoicePicker";
import OutfitComboPicker from "./OutfitComboPicker";
import CommitteePicker from "./CommitteePicker";
import PasswordCounterPemantik from "./PasswordCounterPemantik";
import TeamSelectionComparator from "./TeamSelectionComparator";
import CourierRouteExplorer from "./CourierRouteExplorer";

// components/materi/ApersepsiSection.tsx

type ApersepsiItem = {
  id: string;
  timeRange: string;
  question: string;
  icon: "vehicles" | "clothes" | "badges";
};

const APERSEPSI_DATA: ApersepsiItem[] = [
  {
    id: "transportasi",
    timeRange: "06.00",
    question:
      "Kamu punya 3 sepeda, 2 motor, dan 1 mobil. Ayah membolehkanmu pakai salah satu buat belajar kelompok. Kira-kira ada berapa kemungkinan kendaraan yang bisa kamu pilih?",
    icon: "vehicles",
  },
  {
    id: "outfit",
    timeRange: "12.00",
    question:
      "Kamu punya 4 baju dan 3 celana. Kira-kira ada berapa kombinasi outfit berbeda yang bisa kamu pakai buat pergi?",
    icon: "clothes",
  },
  {
    id: "pengurus",
    timeRange: "16.00",
    question:
      "Ada 3 kandidat pengurus karang taruna. Dari situ akan dipilih 1 ketua dan 1 sekretaris. Kira-kira ada berapa susunan pengurus yang mungkin terbentuk?",
    icon: "badges",
  },
];

type AnswerState = Record<string, { perkiraan: string; caraHitung: string }>;

// Section Pemantik
type ToggleValue = "yes" | "no" | null;

function TeamGroups() {
  const rolesA = ["Ketua", "Wakil", "Notulen"];

  return (
    <div className="my-3 flex flex-wrap gap-4">
      <div className="min-w-[180px] flex-1 rounded-lg bg-white p-3">
        <p className="mb-2 text-xs font-medium text-[#663362]">Aturan A · jabatan beda</p>
        <div className="flex gap-1.5">
          {rolesA.map((role) => (
            <div
              key={role}
              className="flex h-7 w-20 items-center justify-center rounded-full border-2 text-xs font-medium"
              style={{ borderColor: "#663362", color: "#663362" }}
            >
              {role}
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-[180px] flex-1 rounded-lg bg-white p-3">
        <p className="mb-2 text-xs font-medium text-[#346739]">Aturan B · tanpa jabatan</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-7 w-7 rounded-full bg-[#346739]" />
          ))}
        </div>
      </div>
    </div>
  );
}

const ApersepsiFeedback: string[] = [
  "Bagus, kamu telah menjawab pertanyaan ini. Tapi apakah jawaban kamu benar atau salah? Mari kita bahas di materi selanjutnya, ya!",
  "Menarik cara kamu hitung jawaban akhirnya. Nanti pas kita sudah masuk materi, kita akan tahu apakah cara hitung kamu benar ataupun salah.",
  "Catatan caramu udah tersimpan. Nanti kita cek lagi setelah masuk ke materi.",
  "Perkiraan dan cara hitungmu sudah tersimpan. Lanjut ke tantangan berikutnya.",
  "Tersimpan. Cara berpikirmu ini akan jadi pembanding yang menarik nanti.",
  "Oke, sudah tercatat. Yuk lanjut, ada beberapa hal menarik lagi yang akan kita bahas",
  "Caramu sudah disimpan. Simpan juga di kepala, nanti kita bahas lagi."
]

const PemantikFeedbackPool: string[] = [
  "Pilihan dan alasanmu sudah tersimpan. Lanjut ke tantangan selanjutnya.",
  "Apakah jawaban dan alasanmu benar? kita akan tahu setelah membahas lebih dalam materi ini nanti",
  "Jawabanmu sudah kesimpan. Tiap tantangan punya situasinya sendiri, jangan buru-buru disamakan caranya.",
  "Oke, lanjut ke tantangan berikutnya. Bandingkan sendiri, apakah caramu masih sama atau mulai berubah.",
  "Tersimpan. Perhatikan baik-baik, situasi tiap tantangan sengaja dibuat tidak identik.",
];


const refleksiSebelumMulaiFeedback: string[] = [
  "Refleksimu sudah tersimpan. Ayo kita lanjut lagi",
  "Tercatat. Yuk lanjut ke materi, nanti kita lihat lagi apakah jawabanmu ini berubah.",
  "Jawabanmu sudah kesimpan. Materi nanti akan menjawab beberapa hal yang kamu pikirkan.",
  "Tersimpan. Pertanyaan yang kamu tulis ini bagus buat dibawa ke materi selanjutnya.",
  "Oke, sudah tercatat. Kamu akan lihat cara yang lebih sistematis di materi berikutnya.",
];

export default function ApersepsiSection({ pool = ApersepsiFeedback }: { pool?: string[] }) {
  // stub state, ganti ke logic simpan-ke-DB pas wiring backend
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showResult, setShowResult] = useState(false);
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

    const allComplete = APERSEPSI_DATA.every((item) => {
      const ans = answers[item.id];
      return ans?.perkiraan && ans?.caraHitung;
    });

    for (const item of APERSEPSI_DATA) {
      const ans = answers[item.id];
      if (!ans?.perkiraan || !ans?.caraHitung) {
        newFeedback[item.id] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor[item.id] = "text-red-500";
      } else if (allComplete) {
        newFeedback[item.id] = pool[Math.floor(Math.random() * pool.length)];
        newColor[item.id] = "text-[#2C2C2A]";
      }
    }

    setFeedback(newFeedback);
    setTextColor(newColor);
    if (allComplete) setApersepsiSubmitted(true);
    setIsChecking(false);
  }

  async function handlePemantikSubmit() {
    setIsCheckingPemantik(true);
    setPemantikFeedback({});
    setPemantikTextColor({});

    const items = [
      {
        id: "password",
        jawaban: passwordGuess,
        alasan: passwordReasoning,
      },
      {
        id: "team",
        jawaban:
          teamChoice === "yes"
            ? "Sama"
            : teamChoice === "no"
              ? "Beda"
              : "",
        alasan: teamReasoning,
      },
      {
        id: "courier",
        jawaban:
          courierChoice === "yes"
            ? "Perlu"
            : courierChoice === "no"
              ? "Nggak perlu"
              : "",
        alasan: courierReasoning,
      },
    ];

    const allComplete = items.every((item) => item.jawaban && item.alasan);

    const newFeedback: Record<string, string | null> = {};
    const newColor: Record<string, string | null> = {};

    for (const item of items) {
      if (!item.jawaban || !item.alasan) {
        newFeedback[item.id] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor[item.id] = "text-red-500";
      } else if (allComplete) {
        newFeedback[item.id] = PemantikFeedbackPool[Math.floor(Math.random() * PemantikFeedbackPool.length)];
        newColor[item.id] = "text-[#2C2C2A]";
      }
    }

    setPemantikFeedback(newFeedback);
    setPemantikTextColor(newColor);
    if (allComplete) setPemantikSubmitted(true);
    setIsCheckingPemantik(false);
  }

  async function handleRefleksiSubmit() {
    setIsCheckingRefleksi(true);
    setRefleksiFeedback({});
    setRefleksiTextColor({});

    const items = [
      { id: "methodSufficient", jawaban: methodSufficient },
      { id: "whatToLearn", jawaban: whatToLearn },
    ];

    const allComplete = items.every((item) => item.jawaban);

    const newFeedback: Record<string, string | null> = {};
    const newColor: Record<string, string | null> = {};

    for (const item of items) {
      if (!item.jawaban) {
        newFeedback[item.id] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor[item.id] = "text-red-500";
      } else if (allComplete) {
        newFeedback[item.id] = refleksiSebelumMulaiFeedback[Math.floor(Math.random() * refleksiSebelumMulaiFeedback.length)];
        newColor[item.id] = "text-[#2C2C2A]";
      }
    }

    setRefleksiFeedback(newFeedback);
    setRefleksiTextColor(newColor);
    if (allComplete) setRefleksiSubmitted(true);
    setIsCheckingRefleksi(false);
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
