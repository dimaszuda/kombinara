"use client";

import React from "react";
import { useState } from "react";
import { VehicleIcons, ClothesIcons, BadgeIcons, ToggleButton, CheckIcon, LightbulbIcon } from "@/components/ui/IconButton";

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

function ScenarioIcon({ icon }: { icon: ApersepsiItem["icon"] }) {
  if (icon === "vehicles") return <VehicleIcons />;
  if (icon === "clothes") return <ClothesIcons />;
  return <BadgeIcons />;
}

type AnswerState = Record<string, { perkiraan: string; caraHitung: string }>;

// Section Pemantik
type ToggleValue = "yes" | "no" | null;

function PasswordSlots() {
  return (
    <div className="my-3 flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-[#34673966] text-sm text-[#34673999]">
            ?
          </div>
          {i < 3 && <span className="text-sm font-medium text-[#34673966]">×</span>}
        </div>
      ))}
      <span className="ml-2 text-xs text-[#34673999]">36 pilihan tiap slot</span>
    </div>
  );
}

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

function RouteDiagram() {
  return (
    <svg width="320" height="100" viewBox="0 0 200 60" className="my-3" aria-hidden="true">
      <circle cx="15" cy="30" r="11" fill="#ffffff" stroke="#346739" strokeWidth={2} />
      <text x="15" y="34" textAnchor="middle" fontSize="11" fill="#346739" fontWeight={500}>A</text>
      <circle cx="100" cy="30" r="11" fill="#ffffff" stroke="#346739" strokeWidth={2} />
      <text x="100" y="34" textAnchor="middle" fontSize="11" fill="#346739" fontWeight={500}>B</text>
      <circle cx="185" cy="30" r="11" fill="#ffffff" stroke="#663362" strokeWidth={2} />
      <text x="185" y="34" textAnchor="middle" fontSize="11" fill="#663362" fontWeight={500}>C</text>
      {[22, 26, 30, 34, 38].map((y) => (
        <line key={y} x1={27} y1={y} x2={88} y2={y} stroke="#346739" strokeWidth={1.2} />
      ))}
      {[24, 28, 32, 36].map((y) => (
        <line key={y} x1={112} y1={y} x2={173} y2={y} stroke="#663362" strokeWidth={1.2} />
      ))}
    </svg>
  );
}


export default function ApersepsiSection() {
  // stub state, ganti ke logic simpan-ke-DB pas wiring backend
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showResult, setShowResult] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string | null>>({});

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

    for (const item of APERSEPSI_DATA) {
      const ans = answers[item.id];
      if (!ans?.perkiraan || !ans?.caraHitung) continue;

      try {
        const res = await fetch("/api/ai/apersepsi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soal: item.question,
            jawaban: ans.perkiraan,
            cara_menghitung: ans.caraHitung,
          }),
        });

        if (!res.ok) {
          console.error(`[apersepsi] API error for ${item.id}:`, res.status);
          newFeedback[item.id] = null;
          continue;
        }

        const data = await res.json();
        newFeedback[item.id] = data.feedback ?? null;
      } catch (err) {
        console.error(`[apersepsi] fetch error for ${item.id}:`, err);
        newFeedback[item.id] = null;
      }
    }

    setFeedback(newFeedback);
    setIsChecking(false);
  }

  // Section Pemantik
  const [passwordGuess, setPasswordGuess] = useState("");
  const [passwordReasoning, setPasswordReasoning] = useState("");

  const [teamChoice, setTeamChoice] = useState<ToggleValue>(null);
  const [teamReasoning, setTeamReasoning] = useState("");

  const [courierChoice, setCourierChoice] = useState<ToggleValue>(null);
  const [courierReasoning, setCourierReasoning] = useState("");
  const [courierCalc, setCourierCalc] = useState("");

  // section refleksi
  const [methodSufficient, setMethodSufficient] = useState("");
  const [whatToLearn, setWhatToLearn] = useState("");

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
                <div className="mt-3 flex items-start gap-4">
                  <ScenarioIcon icon={item.icon} />
                  <p className="text-sm leading-relaxed text-[#2C2C2A]">{item.question}</p>
                </div>

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
                    <p className="text-sm leading-relaxed text-[#2C2C2A]">
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
          disabled={isChecking}
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

          <PasswordSlots />

          <p className="text-sm font-medium leading-relaxed text-[#2C2C2A]">
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
        </div>

        {/* Tantangan 2 */}
        <div className="rounded-xl bg-[#DBFFD5] p-4 pb-4">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#663362]">
            Tantangan 2 · Sama atau beda?
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
            Dari 10 teman, kamu mau pilih 3 orang buat tim lomba, dengan dua aturan berbeda.
          </p>

          <TeamGroups />

          <p className="text-sm font-medium leading-relaxed text-[#2C2C2A]">
            Menurutmu, dua aturan ini menghasilkan jumlah susunan yang sama atau beda?
          </p>
          <p className="text-sm leading-relaxed">
            Pilih salah satu
          </p>
          <div className="mt-2.5 flex gap-2">
            <ToggleButton label="Sama" active={teamChoice === "yes"} onClick={() => setTeamChoice("yes")} />
            <ToggleButton label="Beda" active={teamChoice === "no"} onClick={() => setTeamChoice("no")} />
          </div>
          <div className="mt-2.5">
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Jelaskan alasanmu
            </label>
            <textarea
                placeholder="ceritain logikamu"
                value={teamReasoning}
                onChange={(e) => setTeamReasoning(e.target.value)}
                className="w-full min-h-[120px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
              />
          </div>
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

          <RouteDiagram />
          <p className="mb-2 text-[11px] text-[#34673999]">5 jalan A–B, 4 jalan B–C</p>

          <p className="text-sm font-medium leading-relaxed text-[#2C2C2A]">
            Perlu nggak aturan kayak gitu buat kurir?
          </p>
          <div className="mt-2 flex gap-2">
            <ToggleButton
              label="Perlu"
              active={courierChoice === "yes"}
              onClick={() => setCourierChoice("yes")}
            />
            <ToggleButton
              label="Nggak perlu"
              active={courierChoice === "no"}
              onClick={() => setCourierChoice("no")}
            />
          </div>
          <div className="mt-2.5">
            <label className="mb-1 block text-xs font-medium text-[#663362]">Alasanmu</label>
            <textarea
              placeholder="kenapa menurutmu begitu"
              value={courierReasoning}
              onChange={(e) => setCourierReasoning(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
            />
          </div>
          <div className="mt-2.5">
            <label className="mb-1 block text-xs font-medium text-[#663362]">
              Cara hitung total rutenya
            </label>
            <textarea
              placeholder="ceritain logikamu"
              value={courierCalc}
              onChange={(e) => setCourierCalc(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-3 py-3 text-sm resize-y"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
        <button
          type="submit"
          // disabled={isChecking} // ganti sesuai logic validasi form kamu
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          <CheckIcon />
          Simpan Jawaban
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
          type="submit"
          // disabled={isChecking} // ganti sesuai logic validasi form kamu
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          <CheckIcon />
          Simpan Jawaban
        </button>
      </div>
    </section>
  );
}
