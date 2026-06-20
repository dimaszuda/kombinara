"use client";

import React, { useState } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { IconCheck, IconLightbulb, IconHelpCircle, IconTable, IconGrid, IconBranch } from "@/components/ui/IconButton";

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