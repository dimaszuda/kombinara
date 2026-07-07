"use client";

import { useEffect, useRef, useState } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { IconLightbulb, IconHelpCircle, IconTable, IconGrid, IconBranch } from "@/components/ui/IconButton";
import { ExampleShell, type ExampleStatus } from "./contoh-soal-bertahap/primitive";
import { gradeBlanks } from "./contoh-soal-bertahap/grading";
import { SectionBadge } from "@/components/ui/Materi";
import {
  C,
  InputBlank,
  ChoiceToggle,
  KotakPengisian,
  PohonKeputusan,
  SectionLabel,
} from "./contoh-soal-perkalian/internals";
import {
  type Feedback,
  type Results,
  statusOf,
  EXPECTED_PLAT,
  ExamplePlat,
  EXPECTED_PIN,
  ExamplePIN,
  EXPECTED_FOTO,
  ExampleFoto,
  EXPECTED_MENU,
  ExampleMenu,
  EXPECTED_BILANGAN,
  ExampleBilangan,
} from "./contoh-soal-perkalian/examples";
import {
  LEVEL_META,
  SOAL_DATA,
  SoalKepahaman,
} from "./contoh-soal-perkalian/latihan";
import { CheckIcon } from "@/components/ui/IconButton";
// ============================================================================
// Shared types
// ============================================================================

type ToggleValue = "yes" | "no" | null;

const SOAL_EKSPLORASI_PERKALIAN = `Seragam sekolah tersedia dalam 3 pilihan warna kemeja (putih, biru, abu abu) dan 2 pilihan warna celana/rok (hitam, navy). Berapa banyak kombinasi seragam yang berbeda bisa dikenakan? Apakah hasilnya 3x2?`;

function EksplorasiKontekstual() {
    const [choice1, setChoice1] = useState<ToggleValue>(null);
    const [reasoning1, setReasoning1] = useState("");
    const [choice2, setChoice2] = useState<ToggleValue>(null);
    const [reasoning2, setReasoning2] = useState("");

    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<Record<string, string | null>>({});
    const [textColor, setTextColor] = useState<Record<string, string | null>>({});
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit() {
      setIsChecking(true);
      setFeedback({});
      setTextColor({});

      const jawaban = choice2 === "yes" ? "Bisa" : choice2 === "no" ? "Tidak" : "";
      const alasan = reasoning1;

      // Validasi: cek apakah sudah dijawab
      const newFeedback: Record<string, string | null> = {};
      const newColor: Record<string, string | null> = {};

      if (!jawaban || !alasan.trim()) {
        newFeedback["situasi1"] = "Jawaban belum terisi, harap jawab dulu pertanyaan ini!";
        newColor["situasi1"] = "text-red-500";
        setFeedback(newFeedback);
        setTextColor(newColor);
        setIsChecking(false);
        return;
      }

      // Semua lengkap → panggil API
      try {
        const res = await fetch("/api/ai/eksplorasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soal: SOAL_EKSPLORASI_PERKALIAN,
            jawaban,
            alasan,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        newFeedback["situasi1"] = data.feedback as string;
        newColor["situasi1"] = "text-[#2C2C2A]";
      } catch {
        newFeedback["situasi1"] = "Maaf, ada kendala saat memberikan feedback. Coba lagi ya!";
        newColor["situasi1"] = "text-[#2C2C2A]";
      }

      setFeedback(newFeedback);
      setTextColor(newColor);
      setSubmitted(true);
      setIsChecking(false);

      // Simpan ke database (fire-and-forget)
      fetch("/api/eksplorasi-kontekstual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_id: "kaidah_pencacahan",
          answer: {
            topic: "kaidah_perkalian",
            jawaban,
            alasan,
          },
          feedback: newFeedback["situasi1"] ?? null,
        }),
      }).catch((err) => console.error("[eksplorasi-kontekstual] DB save error:", err));
    }

    return (
        <article>
            <SectionBadge>Eksplorasi Kontekstual</SectionBadge>
            <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
            <p className="mb-3 text-justify leading-relaxed text-[#2C2C2A]">
                Seragam sekolah tersedia dalam 3 pilihan warna kemeja (putih, biru, abu abu) 
                dan 2 pilihan warna celana/rok (hitam, navy). 
                Berapa banyak kombinasi seragam yang berbeda bisa dikenakan?
            </p>
            <p className="mb-1 text-sm italic text-[#34673999]">
                Sebelum lanjur, buat tabel pasangan di bawah ini:
            </p>
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-[#B8E6BC] border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-3/5">
                            Kemeja
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600 w-1/5">
                            Celana/Rok
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600 w-1/5">
                            Kombinasi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Putih</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Hitam</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">(Putih, Hitam)</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Putih</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Navy</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">(Putih, Navy)</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Biru</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Hitam</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="kombinasi 3"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">Biru</td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="Celana/Rok 4"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="kombinasi 4"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="Kemeja 5"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="Celana/Rok 5"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="kombinasi 5"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="Kemeja 6"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="Celana/Rok 6"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-t border-gray-100">
                            <input
                                type="text"
                                name="kombinasi 6"
                                placeholder="..."
                                className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <p>Hitung manual: Berapa total baris yang kamu isi? </p>
            <p><b>Apakah hasilnya</b> 3x2? </p>
            <div className="mb-3 flex gap-2">
                <ToggleButton label="Bisa" active={choice2 === "yes"} onClick={() => setChoice2("yes")} />
                <ToggleButton label="Tidak" active={choice2 === "no"} onClick={() => setChoice2("no")} />
            </div>
            <div>
                <label className="mb-1.5 block text-xs font-medium text-[#663362]">
                    Mengapa bisa begitu? Jelaskan!
                </label>
                <textarea
                    placeholder="Ceritakan alasanmu..."
                    value={reasoning1}
                    onChange={(e) => setReasoning1(e.target.value)}
                    className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966]"
                />
            </div>

            {/* AI Feedback */}
            {feedback["situasi1"] && (
              <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
                <p className="mb-1 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
                <p className={`text-sm leading-relaxed ${textColor["situasi1"] || "text-[#2C2C2A]"}`}>
                  {feedback["situasi1"]}
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isChecking || submitted}
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
                ) : submitted ? (
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
            <div className="border-b-2 border-[#34673966] mt-4" />
        </article>
    )
}


// ============================================================================
// Deep Learning
// ============================================================================

function DeepLearning() {
  const [kotak, setKotak] = useState(["", "", ""]);
  const [kotakChecked, setKotakChecked] = useState([false, false, false]);
  const [simpulanText, setSimpulanText] = useState("");
  const [simpulanSubmitted, setSimpulanSubmitted] = useState(false);
  const expectedKotak = ["5", "4", "3"];

  function checkKotak(i: number) {
    setKotakChecked((prev) => prev.map((c, idx) => (idx === i ? true : c)));
  }

  function handleSimpanSimpulan() {
    if (simpulanText.trim()) {
      setSimpulanSubmitted(true);
    }
  }
 
  return (
    <article>
      <SectionBadge>Deep Learning</SectionBadge>
      {/* ============ SECTION 1: PENGISIAN TEMPAT ============ */}
      <SectionLabel>🔍 Visualisasi: Aturan Pengisian Tempat</SectionLabel>

      <p className="text-slate-700 leading-relaxed mb-3">
        Sebelum masuk ke prinsip umumnya, mari kita "lihat" kaidah perkalian secara konkret.
        Bayangkan setiap tahap keputusan sebagai sebuah kotak tempat yang harus diisi satu per satu.
      </p>

      <p className="font-semibold mb-1" style={{ color: C.purple }}>
        Contoh: Kode PIN 3 digit dari angka 1–5 tanpa pengulangan.
      </p>
      <p className="text-slate-700 mb-3">Perhatikan ilustrasi berikut!</p>

      <ul className="space-y-2.5 mb-4 pl-1">
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-1 ada angka 1, 2, 3, 4, 5 yang bisa digunakan, misal kamu pilih angka 5 untuk
          digit ke-1, sisa angka ada berapa?
          <InputBlank answer={4} />
        </li>
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-2 berarti masih ada 4 angka yaitu 1, 2, 3, 4 yang bisa digunakan, misal kamu
          pilih angka 1, sisa angka ada berapa?
          <InputBlank answer={3} />
        </li>
        <li className="text-slate-700 leading-relaxed">
          <span style={{ color: C.green }} className="font-bold mr-1">•</span>
          Digit ke-3 berarti tinggal 3 angka yang bisa dipilih yaitu 2, 3, 4.
        </li>
      </ul>

      <p className="text-slate-700 mb-2">
        Coba masukkan ilustrasi ke kerangka perhitungan berupa pengisian tempat berikut!
      </p>

      <div className="space-y-2 mb-2">
        <p className="text-slate-700">
          Kotak ke-1 = Digit ke-1, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[0]}
            onChange={(e) => {
              setKotak([e.target.value, kotak[1], kotak[2]]);
              setKotakChecked([false, kotakChecked[1], kotakChecked[2]]);
            }}
            onBlur={() => checkKotak(0)}
            placeholder="..."
            style={{
              borderColor: kotakChecked[0]
                ? (kotak[0].trim() === expectedKotak[0] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          {kotakChecked[0] && kotak[0].trim() === expectedKotak[0] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[0] && kotak[0].trim() !== expectedKotak[0] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[0]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Kotak ke-2 = Digit ke-2, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[1]}
            onChange={(e) => {
              setKotak([kotak[0], e.target.value, kotak[2]]);
              setKotakChecked([kotakChecked[0], false, kotakChecked[2]]);
            }}
            onBlur={() => checkKotak(1)}
            placeholder="..."
            style={{
              borderColor: kotakChecked[1]
                ? (kotak[1].trim() === expectedKotak[1] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          <span className="text-slate-500"> (Ingat: satu angka sudah dipakai)</span>
          {kotakChecked[1] && kotak[1].trim() === expectedKotak[1] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[1] && kotak[1].trim() !== expectedKotak[1] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[1]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Kotak ke-3 = Digit ke-3, ada berapa kemungkinan angka yang bisa dipakai?
          <input
            type="text"
            value={kotak[2]}
            onChange={(e) => {
              setKotak([kotak[0], kotak[1], e.target.value]);
              setKotakChecked([kotakChecked[0], kotakChecked[1], false]);
            }}
            onBlur={() => checkKotak(2)}
            placeholder="..."
            style={{
              borderColor: kotakChecked[2]
                ? (kotak[2].trim() === expectedKotak[2] ? C.green : C.wrong)
                : "#94a3b8",
              color: C.green,
            }}
            className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
          />
          <span className="text-slate-500"> (Ingat: 2 angka sudah dipakai)</span>
          {kotakChecked[2] && kotak[2].trim() === expectedKotak[2] && (
            <span className="text-xs font-semibold ml-1" style={{ color: C.green }}>Kerja bagus!</span>
          )}
          {kotakChecked[2] && kotak[2].trim() !== expectedKotak[2] && (
            <span className="text-xs font-medium ml-1" style={{ color: C.wrong }}>Jawaban: {expectedKotak[2]}</span>
          )}
        </p>
        <p className="text-slate-700">
          Jadi berapa kemungkinan PIN yang bisa dibentuk?
          <InputBlank answer={60} width={64} />
        </p>
      </div>

      <KotakPengisian values={kotak} labels={["Kotak ke-1", "Kotak ke-2", "Kotak ke-3"]} />

      <p className="text-slate-700 leading-relaxed">
        Inilah cara paling mudah "melihat" kaidah perkalian secara visual. Kamu cukup menggambar
        kotak sejumlah tahap, lalu isi banyaknya pilihan di tiap kotak, kemudian kalikan semuanya.
      </p>

      <div
        className="mt-4 rounded-xl border-2 p-4 flex gap-3"
        style={{ backgroundColor: C.greenLight, borderColor: C.green }}
      >
        <IconLightbulb/>
        <p className="text-sm leading-relaxed" style={{ color: C.green }}>
          <span className="font-bold">Catatan Penting:</span> Aturan pengisian tempat dan kaidah
          perkalian adalah hal yang sama, yang satu adalah gambaran visualnya, yang lain adalah
          prinsip matematisnya. Setelah kamu terbiasa berpikir bertahap, kamu tidak perlu lagi
          menggambar kotak dan bisa langsung menggunakan kaidah perkalian secara langsung.
        </p>
      </div>
 
      {/* ============ SECTION 2: DIAGRAM POHON ============ */}
      <section className="bg-white rounded-2xl border-2 p-5 sm:p-7 mt-8" style={{ borderColor: C.greenLight }}>
        <SectionLabel>🔍 Eksplorasi: Diagram Pohon Keputusan</SectionLabel>
 
        <p className="text-slate-700 leading-relaxed mb-4">
          Di kantin sekolahmu tersedia 2 menu makanan yaitu soto dan sop serta 3 menu minuman yaitu
          es teh, es jeruk, es buah. Kamu ingin memesan menu paketan di kantin. Berapa macam menu
          paketan yang bisa kamu pesan?
        </p>
 
        <PohonKeputusan />
 
        <div className="space-y-3 mt-4">
          <p className="text-slate-700">
            Hitung cabang paling ujung: ada berapa?
            <InputBlank answer={6} />
          </p>
 
          <p className="text-slate-700 leading-relaxed">
            Coba perhatikan! Ketika kamu memesan menu paketan, kamu memesan
            <ChoiceToggle
              options={["makanan dan minuman", "makanan atau minuman"]}
              correct="makanan dan minuman"
            />
          </p>
 
          <p className="text-slate-700">
            Kata kunci yang kamu pegang apa?
            <ChoiceToggle options={["dan", "atau"]} correct="dan" />
          </p>
 
          <p className="text-slate-700">
            Jadi ada berapa menu paketan yang bisa kamu pesan?
            <input
              type="text"
              placeholder="..."
              style={{ color: C.green, borderColor: "#94a3b8" }}
              className="border-2 rounded-md px-2 py-0.5 w-11 text-center font-semibold text-sm mx-1 focus:outline-none"
            /> (makanan) ×
            <input
              type="text"
              placeholder="..."
              style={{ color: C.green, borderColor: "#94a3b8" }}
              className="border-2 rounded-md px-2 py-0.5 w-11 text-center font-semibold text-sm mx-1 focus:outline-none"
            /> (minuman) =
            <InputBlank answer={6} width={44} />
          </p>
          <p className="text-slate-500 text-sm italic">Sebutkan!</p>
        </div>
 
        <div
          className="mt-5 rounded-xl border-2 p-4 flex gap-3"
          style={{ backgroundColor: C.white, borderColor: C.purple }}
        >
          <IconHelpCircle/>
          <div className="text-sm flex-1 min-w-0">
            <p className="font-bold mb-1" style={{ color: C.purple }}>
              Apa yang kamu simpulkan?
            </p>
            <p className="text-slate-700">Apakah ini sama dengan aturan penjumlahan?</p>
            <div className="mt-2 flex items-center gap-4 border-t border-[#34673926] pt-4">
              <textarea
                placeholder="Tulis jawabanmu di sini..."
                rows={3}
                value={simpulanText}
                onChange={(e) => {
                  setSimpulanText(e.target.value);
                  setSimpulanSubmitted(false);
                }}
                style={{ borderColor: C.purple, color: C.green }}
                className="flex-1 border-2 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={handleSimpanSimpulan}
                disabled={simpulanSubmitted || !simpulanText.trim()}
                className="flex shrink-0 items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
              >
                <CheckIcon />
                {simpulanSubmitted ? "Tersimpan" : "Simpan Jawaban"}
              </button>
            </div>

            {simpulanSubmitted && (
              <div className="mt-3 rounded-lg border border-[#66336233] bg-[#66336208] p-3">
                <p className="mb-1 text-xs font-medium text-[#663362]">Feedback Kombi</p>
                <p className="text-sm leading-relaxed text-[#2C2C2A]">
                  Jawabanmu sudah tersimpan. Yuk lanjut ke materi berikutnya untuk melihat apakah pola yang kamu temukan sudah tepat!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
 
      {/* ============ SECTION 3: KESIMPULAN ============ */}
      <section className="rounded-2xl p-5 sm:p-7 mt-4" style={{ backgroundColor: C.green }}>
        <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-white">
          ✅ Tiga Cara Merepresentasikan Kaidah Perkalian
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: C.greenLight }}>
          Dari bagian ekplorasi kontekstual dan aktivitas deep learning, ada 3 cara untuk
          merepresentasikan kaidah perkalian yaitu:
        </p>
 
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: IconTable, label: "Tabel" },
            { icon: IconGrid, label: "Pengisian Tempat" },
            { icon: IconBranch, label: "Diagram Pohon" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              style={{ backgroundColor: C.greenLight }}
            >
              <Icon/>
              <span className="font-semibold text-sm" style={{ color: C.green }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function PenjelasanKonsep() {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      {/* Konsep Dasar */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Konsep Dasar</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika suatu kejadian terdiri dari tahap 1 dan tahap 2 dan seterusnya yang dilakukan secara <b>berurutan/bersamaan</b>, 
          maka total cara melakukan kejadian tersebut adalah: 
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total  = $n_1 \\times n_2 \\times n_3 \\times ... \\times n_k$"}</RichText>
        </div>
      </div>

      {/* Kata Kunci */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-bold text-[#346739]">Kata Kunci</h3>
        <p className="text-2xl font-bold text-[#663362]">
          &ldquo;DAN&rdquo;{" "}
          <span className="text-base font-normal text-[#2C2C2A]">&rarr; Perkalian (tahap-tahap yang harus dilalui semua) </span>
        </p>
      </div>

      {/* Mengapa penjumlahan? */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Mengapa perkalian?</h3>
        <RichText>
          {"Setiap pilihan di tahap 1 dapat dipasangkan dengan setiap pilihan di tahap 2. \
          Jadi untuk setiap 1 pilihan di tahap 1, ada $n_2$ kemungkinan di tahap 2. \
          Karena ada $n_1$ pilihan di tahap 1, totalnya adalah $n_1 \\times n_2$. "}
        </RichText>
        <p className="mt-3 leading-relaxed text-[#2C2C2A]">
          <b>Ingat</b>Diagram pohon selalu menghasilkan perkalian jumlah cabang di setiap tingkat!
        </p>
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// ContohSoal — orchestrator with unlock mechanism
// ============================================================================

function ContohSoal() {
  const [passedCount, setPassedCount] = useState(0);

  // Contoh 1
  const [values1, setValues1] = useState<Record<string, string>>({});
  const [results1, setResults1] = useState<Results>(null);
  const [feedback1, setFeedback1] = useState<Feedback>("idle");

  // Contoh 2
  const [values2, setValues2] = useState<Record<string, string>>({});
  const [results2, setResults2] = useState<Results>(null);
  const [feedback2, setFeedback2] = useState<Feedback>("idle");

  // Contoh 3
  const [values3, setValues3] = useState<Record<string, string>>({});
  const [results3, setResults3] = useState<Results>(null);
  const [feedback3, setFeedback3] = useState<Feedback>("idle");

  // Contoh 4
  const [values4, setValues4] = useState<Record<string, string>>({});
  const [results4, setResults4] = useState<Results>(null);
  const [feedback4, setFeedback4] = useState<Feedback>("idle");

  // Contoh 5
  const [values5, setValues5] = useState<Record<string, string>>({});
  const [results5, setResults5] = useState<Results>(null);
  const [feedback5, setFeedback5] = useState<Feedback>("idle");

  function statusFor(index: number): ExampleStatus {
    if (index < passedCount) return "completed";
    if (index === passedCount) return "active";
    return "locked";
  }

  function check(
    index: number,
    expected: Record<string, string>,
    values: Record<string, string>,
    setResults: React.Dispatch<React.SetStateAction<Results>>,
    setFeedback: React.Dispatch<React.SetStateAction<Feedback>>
  ) {
    const { results, allCorrect } = gradeBlanks(expected, values);
    setResults(results);
    setFeedback(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, index + 1));
  }

  const TOTAL = 5;

  return (
    <section>
      {/* Progress bar */}
      <div className="mb-6 flex gap-2" aria-label="Progress contoh soal">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < passedCount ? "#346739" : "#34673926" }}
          />
        ))}
      </div>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>

      {passedCount === TOTAL && (
        <div className="mb-6 rounded-xl bg-[#346739] px-5 py-4 text-center text-white font-semibold text-base">
          🎉 Semua contoh soal selesai! Kamu sudah menguasai Kaidah Perkalian.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* ---- Contoh 1 ---- */}
        <ExampleShell
          status={statusFor(0)}
          level="mudah"
          title="Contoh 1: Pelat Nomor Kendaraan 📝"
          illustrationSrc="/images/plat.png"
          illustrationAlt="Ilustrasi pelat nomor kendaraan"
          lockedHint="Contoh 1: Pelat Nomor Kendaraan — selesaikan contoh sebelumnya dulu"
          onCheck={() => check(0, EXPECTED_PLAT, values1, setResults1, setFeedback1)}
          feedback={feedback1}
        >
          <ExamplePlat
            values={values1}
            results={results1}
            onChange={(id, v) => setValues1((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 2 ---- */}
        <ExampleShell
          status={statusFor(1)}
          level="sedang"
          title="Contoh 2: Kode PIN 4 Digit 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/pin.svg"
          illustrationAlt="Ilustrasi kode PIN 4 digit"
          lockedHint="Contoh 2: Kode PIN 4 Digit — selesaikan Contoh 1 dulu"
          onCheck={() => check(1, EXPECTED_PIN, values2, setResults2, setFeedback2)}
          feedback={feedback2}
        >
          <ExamplePIN
            values={values2}
            results={results2}
            onChange={(id, v) => setValues2((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 3 ---- */}
        <ExampleShell
          status={statusFor(2)}
          level="sedang"
          title="Contoh 3: Foto Berjajar dengan Syarat 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/foto-berjajar.svg"
          illustrationAlt="Ilustrasi orang berjajar untuk foto"
          lockedHint="Contoh 3: Foto Berjajar — selesaikan Contoh 2 dulu"
          onCheck={() => check(2, EXPECTED_FOTO, values3, setResults3, setFeedback3)}
          feedback={feedback3}
        >
          <ExampleFoto
            values={values3}
            results={results3}
            onChange={(id, v) => setValues3((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 4 ---- */}
        <ExampleShell
          status={statusFor(3)}
          level="hots"
          title="Contoh 4: Menu Restoran 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/menu-restoran.svg"
          illustrationAlt="Ilustrasi pilihan menu restoran"
          lockedHint="Contoh 4: Menu Restoran — selesaikan Contoh 3 dulu"
          onCheck={() => check(3, EXPECTED_MENU, values4, setResults4, setFeedback4)}
          feedback={feedback4}
        >
          <ExampleMenu
            values={values4}
            results={results4}
            onChange={(id, v) => setValues4((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        {/* ---- Contoh 5 ---- */}
        <ExampleShell
          status={statusFor(4)}
          level="hots"
          title="Contoh 5: Bilangan Ganjil 3 Digit < 600 📝"
          illustrationSrc="/illustrations/kaidah-perkalian/bilangan-ganjil.svg"
          illustrationAlt="Ilustrasi bilangan tiga digit"
          lockedHint="Contoh 5: Bilangan Ganjil 3 Digit — selesaikan Contoh 4 dulu"
          onCheck={() => check(4, EXPECTED_BILANGAN, values5, setResults5, setFeedback5)}
          feedback={feedback5}
        >
          <ExampleBilangan
            values={values5}
            results={results5}
            onChange={(id, v) => setValues5((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>
      </div>
    </section>
  );
}

function MengapaCorner() {
  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>
      <blockquote className="kp-quote text-justify">
        💡 <b>Mengapa kita mengalikan? </b> 
        Bayangkan membuat keputusan secara bertahap. 
        Di setiap tahap, kamu "membuka" seluruh pilihan yang ada. Untuk setiap satu pilihan yang sudah dibuat di tahap sebelumnya, ada sejumlah pilihan baru yang terbuka. Ini seperti pohon yang terus bercabang dan total daun (pilihan akhir) adalah hasil perkalian semua jumlah cabang di setiap tingkat. 
      </blockquote>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

function AktivitasSiswa() {
  return (
    <article>
      <SectionBadge>Aktivitas Siswa</SectionBadge>
      <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#663362] p-5">
        <p className="text-xl leading-relaxed text-white">
          🧾 JANGAN LUPA kerjakan aktivitas kamu di halaman Aktivitas yang ada di panel sebelah kiri ya! 
        </p>
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  )
}

type ScoreTheme = {
  label: string;
  color: string;
  bg: string;
  badgeColor: string;
};

function getScoreTheme(score: number): ScoreTheme {
  if (score >= 80) {
    return { label: "Luar Biasa!", color: "#346739", bg: "#DBFFD5", badgeColor: "#346739" };
  }
  if (score >= 60) {
    return { label: "Cukup Baik!", color: "#92600A", bg: "#FFF3CD", badgeColor: "#92600A" };
  }
  return { label: "Tetap Semangat!", color: "#b91c1c", bg: "#FEE2E2", badgeColor: "#b91c1c" };
}

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function LatihanKepahaman() {
  const totalSoal = SOAL_DATA.length;
  const [answers, setAnswers] = useState<string[]>(Array(totalSoal).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const correctCount = results.filter(Boolean).length;
  const score = submitted ? Math.round((correctCount / totalSoal) * 100) : 0;

  const theme = getScoreTheme(score);

  // ── Animation state: dipisah dari `score` biar bisa di-reset ke 0
  // setiap kali user submit ulang, bukan loncat dari nilai lama ──
  const [animatedScore, setAnimatedScore] = useState(0);
  const [ringProgress, setRingProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  function handleSubmit() {
    const newResults = SOAL_DATA.map((soal, i) => answers[i].trim() === String(soal.answer));
    setResults(newResults);
    setSubmitted(true);
  }

  useEffect(() => {
    if (!submitted) {
      setAnimatedScore(0);
      setRingProgress(0);
      return;
    }

    // Reset dulu ke 0 sebelum animasi jalan, supaya submit ulang
    // (misal user ubah jawaban lalu submit lagi) terasa sebagai
    // animasi baru, bukan loncatan dari posisi lama
    setRingProgress(0);
    setAnimatedScore(0);

    const raf1 = requestAnimationFrame(() => {
      const duration = 800;
      const start = performance.now();

      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(eased * score));
        setRingProgress(eased * score);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, score]);

  const dashOffset = CIRCUMFERENCE - (ringProgress / 100) * CIRCUMFERENCE;

  return (
    <article>
      <SectionBadge>Latihan Kepahaman</SectionBadge>
      <p className="mt-1 mb-4 text-sm text-[#34673999]">Kerjakan soal–soal berikut!</p>

      <div className="space-y-4">
        {SOAL_DATA.map((soal, i) => (
          <SoalKepahaman
            key={soal.question_number}
            question_number={soal.question_number}
            level={soal.level}
            question={soal.question}
            answer={soal.answer}
            hideCheckButton
            value={answers[i]}
            onChange={(v) => {
              setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)));
              if (submitted) setSubmitted(false);
            }}
            checked={submitted}
          />
        ))}
      </div>

      {/* ── Score Visualization (only after submit) ── */}
      {submitted && (
        <div
          className="mt-6 rounded-2xl border-2 p-6 transition-colors duration-300"
          style={{ borderColor: theme.color, backgroundColor: theme.bg }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular progress */}
            <div className="relative shrink-0">
              <svg viewBox="0 0 120 120" className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  fill="none"
                  stroke={theme.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: theme.color }}>
                  {animatedScore}
                </span>
                <span className="text-[10px] text-[#6B7280]">dari 100</span>
              </div>
            </div>

            {/* Text summary */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-lg font-bold" style={{ color: theme.color }}>
                {theme.label}
              </p>
              <p className="text-sm text-[#2C2C2A] mt-1">
                Kamu menjawab{" "}
                <span className="font-bold" style={{ color: theme.color }}>
                  {correctCount}
                </span>{" "}
                dari <span className="font-bold">{totalSoal}</span> soal dengan benar
              </p>

              {/* Horizontal bar */}
              <div className="mt-3 h-3 w-full rounded-full bg-[#00000012] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${score}%`, backgroundColor: theme.color }}
                />
              </div>

              {/* Per-question breakdown */}
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                {results.map((ok, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-transform"
                    style={{
                      backgroundColor: ok ? "#346739" : "#b91c1c",
                      color: "#fff",
                      animation: `resultPop 0.3s ease ${i * 0.06}s backwards`,
                    }}
                    title={`Soal ${i + 1}: ${ok ? "Benar" : "Salah"}`}
                  >
                    <ResultIcon ok={ok} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit button ── */}
      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4 mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted}
          className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          <CheckIcon />
          {submitted ? "Tersimpan" : "Simpan Jawaban"}
        </button>
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />

      <style jsx>{`
        @keyframes resultPop {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </article>
  );
}

// Icon check/x pakai SVG murni, bukan emoji atau lucide-react, biar
// nggak nambah dependency kalau project ini belum pakai lucide
function ResultIcon({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
  


const PANDUAN_ROWS = [
  { kunci: "Pilihan dilakukan secara berurutan/bertahap", gunakan: "Perkalian" },
  { kunci: "Pilihan hanya satu dari beberapa kelompok yang dipilih", gunakan: "Penjumlahan" },
  { kunci: 'Ada kata "DAN" antara tahap\u2013tahap', gunakan: "Perkalian" },
  { kunci: 'Ada kata "ATAU" antara pilihan', gunakan: "Penjumlahan" },
  { kunci: "Dua kejadian terjadi bersamaan", gunakan: "Perkalian" },
  { kunci: "Dua kejadian tidak bersamaan / saling lepas", gunakan: "Penjumlahan" },
];

function PanduanCepat() {
  return (
    <article>
      <SectionBadge>Panduan Cepat</SectionBadge>
      <h3 className="mb-1 text-lg font-semibold text-[#2C2C2A]">
        Aturan Penjumlahan vs Perkalian
      </h3>
      <p className="mb-4 text-sm text-[#2C2C2A99]">
        Gunakan tabel ini untuk menentukan aturan mana yang tepat dipakai.
      </p>

      <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl border border-[#34673920]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_128px] bg-[#346739]">
          <div className="px-4 py-2.5 text-sm font-semibold text-[#DBFFD5]">
            Pertanyaan Kunci
          </div>
          <div className="px-4 py-2.5 text-center text-sm font-semibold text-[#DBFFD5]">
            Gunakan
          </div>
        </div>

        {/* Rows */}
        {PANDUAN_ROWS.map((row, i) => {
          const isEven = i % 2 === 0;
          const isPerkalian = row.gunakan === "Perkalian";
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_128px] items-center"
              style={{ backgroundColor: isEven ? "#DBFFD5" : "#ffffff" }}
            >
              <div className="px-4 py-3 text-sm leading-snug text-[#2C2C2A]">
                {row.kunci}
              </div>
              <div className="flex justify-center px-4 py-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={
                    isPerkalian
                      ? { backgroundColor: "#346739", color: "#DBFFD5" }
                      : { backgroundColor: "#663362", color: "#ffffff" }
                  }
                >
                  {row.gunakan}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

const REFLEKSI_QUESTIONS = [
  "Apa perbedaan mendasar antara aturan penjumlahan dan perkalian?",
  'Mengapa kata "DAN" identik dengan perkalian?',
  "Buatlah contoh soal dari kehidupan sehari-hari yang menggunakan KEDUA aturan sekaligus.",
];

type RefleksiItemFeedback = { valid: boolean; feedback: string };
type RefleksiFeedback = { q1: RefleksiItemFeedback; q2: RefleksiItemFeedback; q3: RefleksiItemFeedback };

function RefleksiMini() {
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [isChecking, setIsChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<RefleksiFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (i: number, value: string) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  };

  async function handleSubmit() {
    // Validasi: semua harus terisi
    if (!answers[0].trim() || !answers[1].trim() || !answers[2].trim()) {
      setError("Semua pertanyaan harus diisi dulu ya! 📝");
      return;
    }

    setIsChecking(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/ai/refleksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jawabanQ1: answers[0],
          jawabanQ2: answers[1],
          jawabanQ3: answers[2],
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: RefleksiFeedback = await res.json();
      setFeedback(data);
      setSubmitted(true);
    } catch {
      setError("Maaf, ada kendala saat memberikan feedback. Coba lagi ya!");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <article>
      <SectionBadge>Refleksi Mini</SectionBadge>
      <h3 className="mb-1 text-lg font-semibold text-[#2C2C2A]">Pikirkan dan Jawab</h3>
      <p className="mb-5 text-sm text-[#2C2C2A99]">
        Luangkan waktu untuk merefleksikan pemahamanmu sebelum melanjutkan.
      </p>

      <div className="flex flex-col gap-5">
        {REFLEKSI_QUESTIONS.map((question, i) => (
          <div key={i} className="rounded-2xl border border-[#34673920] bg-[#DBFFD5] p-4">
            <label className="mb-2 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#346739] text-[10px] font-bold text-[#DBFFD5]">
                {i + 1}
              </span>
              <span className="text-sm font-medium leading-snug text-[#2C2C2A]">
                {question}
              </span>
            </label>
            <textarea
              value={answers[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="Tuliskan jawabanmu di sini..."
              rows={3}
              className="w-full resize-y rounded-xl border border-[#34673930] bg-white px-4 py-3 text-sm leading-relaxed text-[#2C2C2A] placeholder:text-[#34673966] focus:border-[#346739] focus:outline-none focus:ring-2 focus:ring-[#34673920]"
            />
            {feedback && (
              <div className="mt-2 rounded-lg border border-[#66336233] bg-[#66336208] p-2.5">
                <p className="mb-0.5 text-xs font-medium text-[#663362]">💬 Feedback Kombi</p>
                <p className="text-sm leading-relaxed text-[#2C2C2A]">
                  {i === 0 ? feedback.q1.feedback : i === 1 ? feedback.q2.feedback : feedback.q3.feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation error */}
      {error && (
        <div className="mt-4 w-full rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isChecking || submitted}
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
          ) : submitted ? (
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
    </article>
  );
}

export default function KaidahPerkalian() {
  return (
    <section className="rounded-xl border border-[#346739] p-7 flex flex-col gap-8">
      <h2 className="kp-subtitle" style={{ color: "#346739" }}>
          Kaidah Perkalian
      </h2>
      <EksplorasiKontekstual/>
      <DeepLearning/>
      <PenjelasanKonsep/>
      <ContohSoal/>
      <MengapaCorner/>
      <AktivitasSiswa/>
      <LatihanKepahaman/>
      <PanduanCepat/>
      <RefleksiMini/>
    </section>
  )
}