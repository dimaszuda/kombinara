"use client";

import React, { useState } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { IconCheck, IconLightbulb, IconHelpCircle, IconTable, IconGrid, IconBranch } from "@/components/ui/IconButton";
import { Blank, ExampleShell, type ExampleStatus } from "./contoh-soal-bertahap/primitive";
import { gradeBlanks } from "./contoh-soal-bertahap/grading";

// ============================================================================
// Shared types (ContohSoal)
// ============================================================================
type Feedback = "idle" | "correct" | "incorrect";
type Results = Record<string, "correct" | "incorrect"> | null;

function statusOf(results: Results, id: string): "idle" | "correct" | "incorrect" {
  return results?.[id] ?? "idle";
}

function b(
  id: string,
  values: Record<string, string>,
  onChange: (id: string, v: string) => void,
  results: Results,
  width?: string
) {
  return (
    <Blank
      value={values[id] ?? ""}
      onChange={(v) => onChange(id, v)}
      status={statusOf(results, id)}
      width={width}
    />
  );
}

// ============================================================================

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 inline-block rounded-full bg-[#663362] px-3 py-1 text-xs font-medium text-white">
      {children}
    </span>
  );
}


type ToggleValue = "yes" | "no" | null;

function EksplorasiKontekstual() {
    const [choice1, setChoice1] = useState<ToggleValue>(null);
    const [reasoning1, setReasoning1] = useState("");
    const [choice2, setChoice2] = useState<ToggleValue>(null);
    const [reasoning2, setReasoning2] = useState("");
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
        </article>
    )
}

function DeepLearning() {
    return (
        <article>
            <SectionBadge>Aktivitas Deep Learning</SectionBadge>

            <p className="mb-4 text-xl font-semibold text-[#346739]">
                🔍 Eksplorasi: Temukan Polanya
            </p>
            <p className="leading-relaxed text-[#2C2C2A]">
                Sebelum masuk ke prinsip umumnya, mari kita "lihat" <b>kaidah perkalian</b>secara konkret. Bayangkan setiap tahap keputusan sebagai sebuah kotak tempat yang harus diisi satu per satu. 
            </p>
            <p className="leading-relaxed text-[#2C2C2A]">
                Sebelum masuk ke prinsip umumnya, mari kita "lihat" <b>kaidah perkalian</b>secara konkret. Bayangkan setiap tahap keputusan sebagai sebuah kotak tempat yang harus diisi satu per satu. 
            </p>
        </article>
    )
}


const C = {
  green: "#346739",
  greenLight: "#DBFFD5",
  white: "#ffffff",
  purple: "#663362",
  wrong: "#b91c1c",
};
 
function InputBlank({ answer, width = 56 }: { answer: string | number; width?: number }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const isCorrect = value.trim() === String(answer);
 
  return (
    <span className="inline-flex items-center gap-1.5 align-middle mx-1">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setChecked(false);
        }}
        placeholder="..."
        style={{
          width,
          borderColor: checked ? (isCorrect ? C.green : C.wrong) : "#94a3b8",
          color: C.green,
        }}
        className="border-2 rounded-md px-2 py-0.5 text-center font-semibold text-sm focus:outline-none"
      />
      <button
        onClick={() => setChecked(true)}
        style={{ backgroundColor: C.green }}
        className="rounded-md p-1 hover:opacity-90 transition"
        aria-label="Cek jawaban"
      >
        <IconCheck/>
      </button>
      {checked && !isCorrect && (
        <span className="text-xs font-medium" style={{ color: C.wrong }}>
          Jawaban: {answer}
        </span>
      )}
    </span>
  );
}
 
function ChoiceToggle({ options, correct }: { options: string[]; correct: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-wrap gap-2 mx-1 align-middle">
      {options.map((opt: string) => {
        const isSelected = selected === opt;
        const isCorrect = isSelected && opt === correct;
        return (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            style={{
              backgroundColor: isSelected ? (isCorrect ? C.green : C.wrong) : C.greenLight,
              color: isSelected ? C.white : C.green,
              borderColor: isSelected ? (isCorrect ? C.green : C.wrong) : C.green,
            }}
            className="rounded-full border-2 px-3 py-1 text-sm font-medium transition"
          >
            {opt}
          </button>
        );
      })}
    </span>
  );
}
 
function KotakPengisian({ values, labels }: { values: string[]; labels: string[] }) {
  const total = values.reduce((a: number, b: string) => a * (Number(b) || 0), 1);
  const allFilled = values.every((v: string) => v !== "" && !isNaN(Number(v)));

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-5">
      {values.map((v: string, i: number) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              style={{ backgroundColor: C.greenLight, borderColor: C.green }}
              className="w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold"
            >
              <span style={{ color: C.green }}>{v === "" ? "?" : v}</span>
            </div>
            <span className="text-xs font-medium text-center" style={{ color: C.green }}>
              {labels[i]}
            </span>
          </div>
          {i < values.length - 1 && (
            <span className="text-2xl font-bold pb-5" style={{ color: C.purple }}>
              ×
            </span>
          )}
        </React.Fragment>
      ))}
      <span className="text-2xl font-bold pb-5" style={{ color: C.purple }}>
        =
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <div
          style={{ backgroundColor: C.green }}
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
        >
          <span style={{ color: C.white }}>{allFilled ? total : "?"}</span>
        </div>
        <span className="text-xs font-medium" style={{ color: C.green }}>
          Total PIN
        </span>
      </div>
    </div>
  );
}
 
function PohonKeputusan() {
  const minuman = ["Es Teh", "Es Jeruk", "Es Buah"];
  const makanan = [
    { label: "Soto", x: 180 },
    { label: "Sop", x: 520 },
  ];
 
  return (
    <svg viewBox="0 0 700 250" className="w-full h-auto">
      {/* lines: root to level 1 */}
      {makanan.map((m) => (
        <line key={m.label} x1="350" y1="40" x2={m.x} y2="110" stroke={C.purple} strokeWidth="2" />
      ))}
 
      {/* lines: level 1 to level 2 */}
      {makanan.map((m) =>
        minuman.map((_, j) => {
          const leafX = m.x - 90 + j * 90;
          return (
            <line
              key={`${m.label}-${j}`}
              x1={m.x}
              y1="120"
              x2={leafX}
              y2="190"
              stroke={C.green}
              strokeWidth="2"
            />
          );
        })
      )}
 
      {/* root node */}
      <circle cx="350" cy="30" r="20" fill={C.green} />
      <text x="350" y="35" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.white}>
        Mulai
      </text>
 
      {/* level 1 nodes */}
      {makanan.map((m) => (
        <g key={m.label}>
          <rect x={m.x - 32} y="100" width="64" height="28" rx="8" fill={C.purple} />
          <text x={m.x} y="118" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.white}>
            {m.label}
          </text>
        </g>
      ))}
 
      {/* level 2 leaves */}
      {makanan.map((m) =>
        minuman.map((label, j) => {
          const leafX = m.x - 90 + j * 90;
          return (
            <g key={`${m.label}-leaf-${j}`}>
              <rect
                x={leafX - 38}
                y="190"
                width="76"
                height="28"
                rx="8"
                fill={C.greenLight}
                stroke={C.green}
                strokeWidth="1.5"
              />
              <text x={leafX} y="208" textAnchor="middle" fontSize="11" fontWeight="500" fill={C.green}>
                {label}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
 
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2"
      style={{ color: C.green }}
    >
      {children}
    </h2>
  );
}
 
function MateriKaidahPerkalian() {
  const [kotak, setKotak] = useState(["", "", ""]);
 
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: C.white }}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ============ SECTION 1: PENGISIAN TEMPAT ============ */}
        <section className="bg-white rounded-2xl border-2 p-5 sm:p-7" style={{ borderColor: C.greenLight }}>
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
                onChange={(e) => setKotak([e.target.value, kotak[1], kotak[2]])}
                placeholder="..."
                style={{ borderColor: "#94a3b8", color: C.green }}
                className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
              />
            </p>
            <p className="text-slate-700">
              Kotak ke-2 = Digit ke-2, ada berapa kemungkinan angka yang bisa dipakai?
              <input
                type="text"
                value={kotak[1]}
                onChange={(e) => setKotak([kotak[0], e.target.value, kotak[2]])}
                placeholder="..."
                style={{ borderColor: "#94a3b8", color: C.green }}
                className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
              />
              <span className="text-slate-500"> (Ingat: satu angka sudah dipakai)</span>
            </p>
            <p className="text-slate-700">
              Kotak ke-3 = Digit ke-3, ada berapa kemungkinan angka yang bisa dipakai?
              <input
                type="text"
                value={kotak[2]}
                onChange={(e) => setKotak([kotak[0], kotak[1], e.target.value])}
                placeholder="..."
                style={{ borderColor: "#94a3b8", color: C.green }}
                className="border-2 rounded-md px-2 py-0.5 w-14 text-center font-semibold text-sm mx-1 focus:outline-none"
              />
              <span className="text-slate-500"> (Ingat: 2 angka sudah dipakai)</span>
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
        </section>
 
        {/* ============ SECTION 2: DIAGRAM POHON ============ */}
        <section className="bg-white rounded-2xl border-2 p-5 sm:p-7" style={{ borderColor: C.greenLight }}>
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
              <InputBlank answer={2} width={44} /> (makanan) ×
              <InputBlank answer={3} width={44} /> (minuman) =
              <InputBlank answer={6} width={44} />
            </p>
            <p className="text-slate-500 text-sm italic">Sebutkan!</p>
          </div>
 
          <div
            className="mt-5 rounded-xl border-2 p-4 flex gap-3"
            style={{ backgroundColor: C.white, borderColor: C.purple }}
          >
            <IconHelpCircle/>
            <div className="text-sm">
              <p className="font-bold mb-1" style={{ color: C.purple }}>
                Apa yang kamu simpulkan?
              </p>
              <p className="text-slate-700">Apakah ini sama dengan aturan penjumlahan?</p>
              <textarea
                placeholder="Tulis jawabanmu di sini..."
                rows={2}
                style={{ borderColor: C.purple, color: C.green }}
                className="mt-2 w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              />
            </div>
          </div>
        </section>
 
        {/* ============ SECTION 3: KESIMPULAN ============ */}
        <section className="rounded-2xl p-5 sm:p-7" style={{ backgroundColor: C.green }}>
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
      </div>
    </div>
  );
}

export function PenjelasanKonsep() {
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
    </article>
  );
}

// ============================================================================
// Contoh Soal 1 – Mudah: Pelat Nomor Kendaraan
// ============================================================================

const EXPECTED_PLAT = {
  kotak: "6",
  h1: "26",
  h2: "26",
  a1: "10",
  a2: "10",
  a3: "10",
  a4: "10",
  total: "67600000",
};

function ExamplePlat({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  results: Results;
}) {
  const bl = (id: string, width?: string) => b(id, values, onChange, results, width);
  return (
    <>
      <p className="text-justify leading-relaxed">
        Sebuah pelat nomor kendaraan terdiri dari 2 huruf diikuti 4 angka. Jika semua huruf
        (26) dan angka (0–9) boleh diulang, berapa banyak pelat nomor yang mungkin?
      </p>

      <div className="rounded-lg bg-white p-4 space-y-1.5">
        <p className="font-medium text-[#346739]">Langkah Berpikir:</p>
        <ul className="space-y-1 text-sm pl-1">
          <li>Tahap 1: Huruf ke-1 &rarr; 26 pilihan</li>
          <li>Tahap 2: Huruf ke-2 &rarr; 26 pilihan</li>
          <li>Tahap 3: Angka ke-1 &rarr; 10 pilihan</li>
          <li>Tahap 4–6: Angka ke-2, ke-3, ke-4 &rarr; masing-masing 10 pilihan</li>
          <li className="font-semibold">
            Total = 26 × 26 × 10 × 10 × 10 × 10 = 67.600.000 pelat nomor
          </li>
        </ul>
      </div>

      <p className="text-sm italic text-[#34673999]">
        Sekarang visualisasikan dalam pengisian tempat!
      </p>

      <p className="leading-relaxed">
        Ada berapa kotak/tempat yang kamu butuhkan?{" "}
        {bl("kotak", "w-10")}
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#34673926] bg-white">
        <table className="w-full border-collapse text-sm text-center">
          <thead>
            <tr className="bg-[#DBFFD5]">
              <th className="px-3 py-2 font-semibold text-[#346739]">Huruf ke-1</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Huruf ke-2</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Angka ke-1</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Angka ke-2</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Angka ke-3</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Angka ke-4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {[
                ["h1", "26 pilihan"],
                ["h2", "26 pilihan"],
                ["a1", "10 pilihan"],
                ["a2", "10 pilihan"],
                ["a3", "10 pilihan"],
                ["a4", "10 pilihan"],
              ].map(([id, placeholder]) => (
                <td key={id} className="px-3 py-3 border-t border-[#34673915]">
                  {bl(id, "w-14")}
                  <p className="mt-1 text-xs text-[#34673999]">{placeholder}</p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="leading-relaxed">
        Total = {bl("h1", "w-14")} × {bl("h2", "w-14")} × {bl("a1", "w-14")} × {bl("a2", "w-14")} × {bl("a3", "w-14")} × {bl("a4", "w-14")} ={" "}
        {bl("total", "w-24")} pelat nomor
      </p>
    </>
  );
}

// ============================================================================
// Contoh Soal 2 – Sedang: Kode PIN 4 Digit Tanpa Pengulangan
// ============================================================================

const EXPECTED_PIN = {
  d3: "8",
  d4: "7",
  k1: "10",
  k2: "9",
  k3: "8",
  k4: "7",
  total: "5040",
};

function ExamplePIN({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  results: Results;
}) {
  const bl = (id: string, width?: string) => b(id, values, onChange, results, width);
  return (
    <>
      <p className="text-justify leading-relaxed">
        Kode PIN terdiri dari 4 digit angka (0–9) tanpa pengulangan. Berapa banyak PIN yang
        mungkin?
      </p>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Langkah Berpikir:</p>
        <p className="leading-relaxed">
          Digit ke-1: 10 pilihan (0–9)
        </p>
        <p className="leading-relaxed">
          Digit ke-2: 9 pilihan (sudah dipakai 1)
        </p>
        <p className="leading-relaxed">
          Digit ke-3: {bl("d3", "w-10")} pilihan (sudah dipakai 2)
        </p>
        <p className="leading-relaxed">
          Digit ke-4: {bl("d4", "w-10")} pilihan (sudah dipakai 3)
        </p>
      </div>

      <div
        className="rounded-lg border border-[#663362]/30 bg-[#663362]/5 p-3 text-sm leading-relaxed text-[#663362]"
      >
        ⚠️ <span className="font-semibold">Perhatikan perbedaan!</span> Ketika ada pengulangan,
        setiap tahap tetap memiliki pilihan penuh. Ketika tidak ada pengulangan, pilihan berkurang
        di setiap tahap.
      </div>

      <p className="text-sm italic text-[#34673999]">
        Sekarang visualisasikan dalam pengisian tempat!
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#34673926] bg-white">
        <table className="w-full border-collapse text-sm text-center">
          <thead>
            <tr className="bg-[#DBFFD5]">
              {["Digit ke-1", "Digit ke-2", "Digit ke-3", "Digit ke-4"].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold text-[#346739]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {(["k1", "k2", "k3", "k4"] as const).map((id) => (
                <td key={id} className="px-3 py-3 border-t border-[#34673915]">
                  {bl(id, "w-14")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="leading-relaxed">
        Total = {bl("k1", "w-10")} × {bl("k2", "w-10")} × {bl("k3", "w-10")} × {bl("k4", "w-10")} ={" "}
        {bl("total", "w-16")} PIN
      </p>
    </>
  );
}

// ============================================================================
// Contoh Soal 3 – Sukar: Foto Berjajar dengan Syarat Berdampingan
// ============================================================================

const EXPECTED_FOTO = {
  totalTempat: "7",
  tempat_setelah: "5",
  l1_k3: "3",
  l1_k4: "2",
  l1_k5: "1",
  l2_k2: "2",
  l2_k3: "1",
  kaidah: "perkalian",
  final: "720",
};

function ExampleFoto({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  results: Results;
}) {
  const bl = (id: string, width?: string) => b(id, values, onChange, results, width);
  return (
    <>
      <p className="text-justify leading-relaxed">
        Ada 5 orang bersahabat terdiri dari 4 laki-laki dan 3 perempuan. Mereka berlima akan
        foto berjajar dengan syarat perempuan harus berdampingan. Berapa banyak posisi berfoto
        yang bisa dibuat?
      </p>

      <p className="leading-relaxed">
        Ada berapa tempat yang harus dibuat? {bl("totalTempat", "w-10")}
      </p>
      <p className="leading-relaxed">
        Ada syarat bahwa perempuan harus duduk berdampingan. Maka 3 orang perempuan itu
        dianggap 1. Berarti ada berapa tempat jadinya? {bl("tempat_setelah", "w-10")}
      </p>

      <div className="rounded-lg bg-white p-4 space-y-3">
        <p className="font-medium text-[#346739]">
          Langkah 1: Perempuan dianggap 1 tempat
        </p>
        <p className="text-sm italic text-[#34673999]">
          Visualisasikan dalam pengisian tempat:
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr className="bg-[#DBFFD5]">
                {["Urutan ke-1", "Urutan ke-2", "Urutan ke-3", "Urutan ke-4", "Urutan ke-5"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold text-[#346739]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-t border-[#34673915] font-semibold text-[#346739]">5</td>
                <td className="px-3 py-2 border-t border-[#34673915] font-semibold text-[#346739]">4</td>
                <td className="px-3 py-2 border-t border-[#34673915]">{bl("l1_k3", "w-10")}</td>
                <td className="px-3 py-2 border-t border-[#34673915]">{bl("l1_k4", "w-10")}</td>
                <td className="px-3 py-2 border-t border-[#34673915]">{bl("l1_k5", "w-10")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#2C2C2A] leading-relaxed">
          Urutan ke-1: <span className="font-semibold">5</span> pilihan (4 laki-laki dan 1 unit perempuan)
          <br />
          Urutan ke-2: <span className="font-semibold">4</span> pilihan (sudah duduk 1 orang)
          <br />
          Urutan ke-3: {bl("l1_k3", "w-10")} pilihan (sudah duduk 2 orang)
          <br />
          Urutan ke-4: {bl("l1_k4", "w-10")} pilihan (sudah duduk 3 orang)
          <br />
          Urutan ke-5: {bl("l1_k5", "w-10")} pilihan (sudah duduk 4 orang)
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 space-y-3">
        <p className="font-medium text-[#346739]">
          Langkah 2: Perubahan posisi perempuan
        </p>
        <p className="text-sm text-[#2C2C2A] leading-relaxed">
          Perhatikan 3 perempuan yang harus duduk berdampingan. Bisakah berpindah posisi?{" "}
          <span className="font-semibold">Ya</span>
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr className="bg-[#DBFFD5]">
                {["Urutan ke-1", "Urutan ke-2", "Urutan ke-3"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold text-[#346739]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border-t border-[#34673915] font-semibold text-[#346739]">3</td>
                <td className="px-3 py-2 border-t border-[#34673915]">{bl("l2_k2", "w-10")}</td>
                <td className="px-3 py-2 border-t border-[#34673915]">{bl("l2_k3", "w-10")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#2C2C2A] leading-relaxed">
          Urutan ke-1: <span className="font-semibold">3</span> pilihan (3 perempuan)
          <br />
          Urutan ke-2: {bl("l2_k2", "w-10")} pilihan (sudah duduk 1 orang)
          <br />
          Urutan ke-3: {bl("l2_k3", "w-10")} pilihan (sudah duduk 2 orang)
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Langkah 3:</p>
        <p className="leading-relaxed text-sm">
          Kedua langkah merupakan 2 kejadian yang terjadi secara berurutan/bersamaan, bukan
          saling lepas. Maka kaidah yang dipakai adalah kaidah{" "}
          {bl("kaidah", "w-28")}
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr className="bg-[#663362]">
                <th className="px-4 py-2 font-semibold text-white">Kejadian 1</th>
                <th className="px-4 py-2 font-semibold text-white">Kejadian 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-t border-[#34673915] text-sm text-[#2C2C2A]">
                  Urutan 5 entitas (4 laki + 1 unit perempuan)
                </td>
                <td className="px-4 py-3 border-t border-[#34673915] text-sm text-[#2C2C2A]">
                  Urutan internal 3 perempuan
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="leading-relaxed font-semibold">
          Jadi banyaknya posisi berfoto yang bisa dibuat adalah {bl("final", "w-14")}
        </p>
      </div>
    </>
  );
}

// ============================================================================
// Contoh Soal 4 – HOTS: Menu Restoran
// ============================================================================

const EXPECTED_MENU = {
  makanan: "4",
  minuman_base: "3",
  minuman_total: "4",
  dessert_base: "2",
  dessert_total: "3",
  t1: "4",
  t2: "4",
  t3: "3",
  total: "48",
  kotak: "3",
};

function ExampleMenu({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  results: Results;
}) {
  const bl = (id: string, width?: string) => b(id, values, onChange, results, width);
  return (
    <>
      <p className="text-justify leading-relaxed">
        Sebuah menu restoran memiliki 4 pilihan makanan utama, 3 pilihan minuman, dan 2 pilihan
        dessert (makanan penutup). Jika seorang pelanggan <strong>wajib</strong> memilih makanan
        utama, <strong>boleh memilih atau tidak memilih</strong> minuman, dan{" "}
        <strong>boleh memilih atau tidak memilih</strong> dessert. Berapa banyak kemungkinan
        pesanan?
      </p>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Langkah Berpikir:</p>
        <p className="leading-relaxed">
          Makanan utama: {bl("makanan", "w-10")} pilihan/kemungkinan (wajib pilih satu)
        </p>
        <p className="leading-relaxed">
          Minuman: {bl("minuman_base", "w-10")} + 1 = {bl("minuman_total", "w-10")}{" "}
          pilihan/kemungkinan (3 jenis + pilihan &ldquo;tidak pesan&rdquo;)
        </p>
        <p className="leading-relaxed">
          Dessert: {bl("dessert_base", "w-10")} + 1 = {bl("dessert_total", "w-10")}{" "}
          pilihan/kemungkinan (2 jenis + pilihan &ldquo;tidak pesan&rdquo;)
        </p>
      </div>

      <p className="text-sm italic text-[#34673999]">
        Sekarang visualisasikan dalam pengisian tempat!
      </p>

      <p className="leading-relaxed">
        Ada berapa kotak/tempat yang kamu butuhkan? {bl("kotak", "w-10")}
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#34673926] bg-white">
        <table className="w-full border-collapse text-sm text-center">
          <thead>
            <tr className="bg-[#DBFFD5]">
              <th className="px-3 py-2 font-semibold text-[#346739]">Makanan Utama</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Minuman</th>
              <th className="px-3 py-2 font-semibold text-[#346739]">Dessert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-3 border-t border-[#34673915]">
                {bl("t1", "w-14")}
                <p className="mt-1 text-xs text-[#34673999]">A, B, C, D</p>
              </td>
              <td className="px-3 py-3 border-t border-[#34673915]">
                {bl("t2", "w-14")}
                <p className="mt-1 text-xs text-[#34673999]">E, F, G, tdk pesan</p>
              </td>
              <td className="px-3 py-3 border-t border-[#34673915]">
                {bl("t3", "w-14")}
                <p className="mt-1 text-xs text-[#34673999]">H, I, tdk pesan</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="leading-relaxed">
        Total = {bl("t1", "w-10")} × {bl("t2", "w-10")} × {bl("t3", "w-10")} ={" "}
        {bl("total", "w-14")} kemungkinan pesanan
      </p>
    </>
  );
}

// ============================================================================
// Contoh Soal 5 – HOTS: Bilangan Ganjil 3 Digit < 600
// ============================================================================

const EXPECTED_BILANGAN = {
  tumpang1: "3",
  tumpang2: "5",
  only_ratusan: "2",
  only_satuan1: "7",
  only_satuan2: "9",
  k1_satuan: "4",
  k1_puluhan: "4",
  k1_subtotal: "16",
  k2_puluhan: "4",
  k2_satuan: "3",
  k2_subtotal: "24",
  sum1: "16",
  sum2: "24",
  grand_total: "40",
};

function ExampleBilangan({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
  results: Results;
}) {
  const bl = (id: string, width?: string) => b(id, values, onChange, results, width);
  return (
    <>
      <p className="text-justify leading-relaxed">
        Diberikan angka 2, 3, 5, 7, 8, 9. Berapa banyak bilangan ganjil terdiri dari 3 angka
        yang dapat dibuat, jika bilangan tersebut kurang dari 600 dan tidak ada angka yang
        berulang?
      </p>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Analisis soal terlebih dahulu:</p>
        <p className="text-sm text-[#2C2C2A]">
          Sebelum menulis langkah, identifikasi dua syarat sekaligus yang mengikat posisi
          tertentu:
        </p>
        <ul className="space-y-1 text-sm pl-2">
          <li>
            Bilangan ganjil &rarr; angka satuan harus ganjil:{" "}
            <span className="font-mono font-semibold text-[#346739]">{"{3, 5, 7, 9}"}</span>
          </li>
          <li>
            Bilangan kurang dari 600 &rarr; angka ratusan harus kurang dari 6:{" "}
            <span className="font-mono font-semibold text-[#346739]">{"{2, 3, 5}"}</span>
          </li>
        </ul>
      </div>

      <div
        className="rounded-lg border border-[#663362]/30 bg-[#663362]/5 p-3 text-sm leading-relaxed text-[#663362]"
      >
        ⚠️ <span className="font-semibold">Masalahnya:</span> Angka 3 dan 5 masuk ke dua syarat
        sekaligus sehingga bisa jadi dapat berada di angka ratusan maupun angka satuan. Jika 3
        dipakai di ratusan, ia tidak bisa dipakai lagi di satuan. Inilah yang menyebabkan soal
        ini tidak bisa diselesaikan dalam satu langkah maka{" "}
        <span className="font-semibold">harus dipilah menjadi kasus</span>.
      </div>

      <div className="rounded-lg bg-white p-4 space-y-3">
        <p className="font-medium text-[#346739]">Langkah 1: Identifikasi posisi yang punya dua syarat</p>
        <div className="overflow-x-auto rounded-xl border border-[#34673926]">
          <table className="w-full border-collapse text-sm text-center">
            <thead>
              <tr className="bg-[#DBFFD5]">
                <th className="px-3 py-2 font-semibold text-[#346739]">Ratusan</th>
                <th className="px-3 py-2 font-semibold text-[#346739]">Puluhan</th>
                <th className="px-3 py-2 font-semibold text-[#346739]">Satuan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#DBFFD5]/40 text-xs text-[#346739] font-medium">
                <td className="px-3 py-1.5">{"< 6"}</td>
                <td className="px-3 py-1.5">—</td>
                <td className="px-3 py-1.5">ganjil</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border-t border-[#34673915] font-mono text-[#346739] font-semibold">{"{2,3,5}"}</td>
                <td className="px-3 py-2 border-t border-[#34673915] text-[#34673999]">bebas</td>
                <td className="px-3 py-2 border-t border-[#34673915] font-mono text-[#346739] font-semibold">{"{3,5,7,9}"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Langkah 2: Temukan yang tumpang tindih</p>
        <p className="leading-relaxed text-sm">
          Angka yang masuk ke <strong>kedua</strong> syarat sekaligus yaitu{" "}
          {bl("tumpang1", "w-10")} dan {bl("tumpang2", "w-10")}
        </p>
        <p className="leading-relaxed text-sm">
          Angka yang hanya masuk syarat ratusan: {bl("only_ratusan", "w-10")}
        </p>
        <p className="leading-relaxed text-sm">
          Angka yang hanya masuk syarat satuan: {bl("only_satuan1", "w-10")} dan{" "}
          {bl("only_satuan2", "w-10")}
        </p>
        <p className="text-sm italic text-[#34673999]">
          Karena ada yang tumpang tindih maka pilah menjadi dua kasus berdasarkan ratusan.
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 space-y-4">
        <p className="font-medium text-[#346739]">Langkah 3: Selesaikan kasus per kasus</p>
        <div
          className="rounded-lg border border-[#346739]/30 bg-[#DBFFD5]/40 p-3 text-sm leading-relaxed text-[#346739]"
        >
          💡 <span className="font-semibold">Strategi:</span> isi posisi yang punya syarat dulu
          (ratusan dan satuan), baru isi puluhan.
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-sm text-[#663362]">Kasus 1: Jika Ratusan angka 2</p>
          <div className="overflow-x-auto rounded-xl border border-[#34673926]">
            <table className="w-full border-collapse text-sm text-center">
              <thead>
                <tr className="bg-[#DBFFD5]">
                  <th className="px-3 py-2 font-semibold text-[#346739]">Ratusan</th>
                  <th className="px-3 py-2 font-semibold text-[#346739]">Puluhan</th>
                  <th className="px-3 py-2 font-semibold text-[#346739]">Satuan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-3 border-t border-[#34673915] font-semibold text-[#346739]">1</td>
                  <td className="px-3 py-3 border-t border-[#34673915]">{bl("k1_puluhan", "w-10")}</td>
                  <td className="px-3 py-3 border-t border-[#34673915]">{bl("k1_satuan", "w-10")}</td>
                </tr>
                <tr className="text-xs text-[#34673999]">
                  <td className="px-3 py-1.5">{"{2}"}</td>
                  <td className="px-3 py-1.5">ganjil</td>
                  <td className="px-3 py-1.5">{"{3,5,7,9}"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed">
            Ratusan: <strong>1</strong> kemungkinan {"{2}"}
            <br />
            Satuan: {bl("k1_satuan", "w-10")} kemungkinan {"{3, 5, 7, 9}"}
            <br />
            Puluhan: {bl("k1_puluhan", "w-10")} kemungkinan (sudah dipakai 2 angka)
            <br />
            Subtotal kasus 1: 1 × {bl("k1_puluhan", "w-10")} × {bl("k1_satuan", "w-10")} ={" "}
            {bl("k1_subtotal", "w-14")}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-sm text-[#663362]">Kasus 2: Jika Ratusan angka 3 atau 5</p>
          <div className="overflow-x-auto rounded-xl border border-[#34673926]">
            <table className="w-full border-collapse text-sm text-center">
              <thead>
                <tr className="bg-[#DBFFD5]">
                  <th className="px-3 py-2 font-semibold text-[#346739]">Ratusan</th>
                  <th className="px-3 py-2 font-semibold text-[#346739]">Puluhan</th>
                  <th className="px-3 py-2 font-semibold text-[#346739]">Satuan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-3 border-t border-[#34673915] font-semibold text-[#346739]">2</td>
                  <td className="px-3 py-3 border-t border-[#34673915]">{bl("k2_puluhan", "w-10")}</td>
                  <td className="px-3 py-3 border-t border-[#34673915]">{bl("k2_satuan", "w-10")}</td>
                </tr>
                <tr className="text-xs text-[#34673999]">
                  <td className="px-3 py-1.5">{"{3,5}"}</td>
                  <td className="px-3 py-1.5">ganjil</td>
                  <td className="px-3 py-1.5">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed">
            Jika ratusannya 3 maka satuannya bisa 5, 7, atau 9 (3 kemungkinan)
            <br />
            Jika ratusannya 5 maka satuannya bisa 3, 7, atau 9 (3 kemungkinan)
            <br />
            Satuan: {bl("k2_satuan", "w-10")} kemungkinan
            <br />
            Puluhan: {bl("k2_puluhan", "w-10")} kemungkinan (sudah dipakai 2 angka)
            <br />
            Subtotal kasus 2: 2 × {bl("k2_puluhan", "w-10")} × {bl("k2_satuan", "w-10")} ={" "}
            {bl("k2_subtotal", "w-14")}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 space-y-2">
        <p className="font-medium text-[#346739]">Langkah 4: Gabungkan semua kasus</p>
        <p className="text-sm text-[#2C2C2A] leading-relaxed">
          Kedua kasus saling lepas (tidak mungkin terjadi bersamaan) maka aturan yang dipakai
          adalah aturan penjumlahan.
        </p>
        <p className="leading-relaxed font-semibold">
          Total = {bl("sum1", "w-14")} + {bl("sum2", "w-14")} ={" "}
          {bl("grand_total", "w-14")} bilangan
        </p>
      </div>

      <div className="rounded-lg border border-[#346739]/30 bg-[#DBFFD5]/40 p-4 space-y-2">
        <p className="font-semibold text-[#346739]">🤔 Berpikir Kritis</p>
        <p className="text-sm leading-relaxed text-[#2C2C2A]">
          Bisa tidak jika pemilihan kasusnya berdasarkan satuan? Coba selesaikan! Apakah
          hasilnya sama?
        </p>
        <textarea
          placeholder="Tulis jawabanmu di sini..."
          rows={3}
          className="w-full resize-y rounded-xl border border-[#34673933] bg-white px-4 py-3 text-sm placeholder:text-[#34673966] focus:outline-none"
        />
      </div>

      <div className="rounded-lg border border-[#663362]/30 bg-[#663362]/5 p-4 space-y-2">
        <p className="font-semibold text-[#663362]">Poin Refleksi</p>
        <p className="text-sm font-semibold text-[#663362]">
          🤔 Mengapa tidak langsung dihitung 3 × 4 × 4?
        </p>
        <p className="text-sm leading-relaxed text-[#2C2C2A]">
          Karena syarat ratusan dan satuan <strong>beririsan</strong> yaitu angka 3 dan 5 bisa
          memenuhi keduanya. Jika langsung dikalikan tanpa memilah kasus, kita akan salah
          menghitung banyaknya pilihan satuan ketika ratusan terisi angka ganjil.
        </p>
        <p className="text-sm leading-relaxed text-[#2C2C2A]">
          <strong>Kesimpulan:</strong> Soal ini menggabungkan{" "}
          <span className="font-semibold text-[#346739]">aturan perkalian</span> (mengisi tiga
          posisi sekaligus) dengan{" "}
          <span className="font-semibold text-[#663362]">aturan penjumlahan</span> (menjumlahkan
          hasil tiap kasus). Ini adalah pola yang sangat sering muncul di soal pencacahan
          berlapis.
        </p>
      </div>
    </>
  );
}

// ============================================================================
// ContohSoal — orchestrator with unlock mechanism
// ============================================================================

export function ContohSoal() {
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
          illustrationSrc="/illustrations/kaidah-perkalian/plat-nomor.svg"
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