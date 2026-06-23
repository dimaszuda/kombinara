"use client";

import React, { useState } from "react";
import { ToggleButton } from "@/components/ui/IconButton";
import { RichText } from "@/components/shared/RichText";
import { gradeBlanks } from "./contoh-soal-bertahap/grading";
import { ExampleShell, type ExampleStatus } from "./contoh-soal-bertahap/primitive";
import { SectionBadge } from "@/components/ui/Materi";
import {
  type Feedback,
  type Results,
  EXPECTED_DRINKS,
  ExampleDrinks,
  EXPECTED_BOOKS,
  ExampleBooks,
  EXPECTED_TRANSPORT,
  ExampleTransport,
} from "./contoh-soal-penjumlahan/examples";

// ============================================================================
// Shared types
// ============================================================================

type ToggleValue = "yes" | "no" | null;

// ============================================================================
// Eksplorasi Kontekstual
// ============================================================================

export function EksplorasiKontekstual() {
  const [choice1, setChoice1] = useState<ToggleValue>(null);
  const [reasoning1, setReasoning1] = useState("");
  const [choice2, setChoice2] = useState<ToggleValue>(null);
  const [reasoning2, setReasoning2] = useState("");

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      {/* --- Situasi 1 --- */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata 1</h3>
        <p className="mb-3 text-justify leading-relaxed text-[#2C2C2A]">
          Kamu memiliki 4 baju batik berbeda motif dan 3 baju polos berbeda warna. Kamu ingin
          pergi bersama kedua orang tuamu untuk menghadiri pernikahan saudara. Berapa banyak
          pilihan baju yang bisa kamu pakai?
        </p>
        <p className="mb-3 text-sm font-medium text-[#2C2C2A]">
          Apakah kamu bisa memakai baju batik dan baju polos sekaligus? Atau bersamaan?
        </p>
        <div className="mb-3 flex gap-2">
          <ToggleButton label="Bisa" active={choice1 === "yes"} onClick={() => setChoice1("yes")} />
          <ToggleButton label="Tidak" active={choice1 === "no"} onClick={() => setChoice1("no")} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#663362]">
            Ceritakan Alasanmu!
          </label>
          <textarea
            placeholder="Ceritakan alasanmu..."
            value={reasoning1}
            onChange={(e) => setReasoning1(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966]"
          />
        </div>
      </div>

      {/* --- Situasi 2 --- */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata 2</h3>
        <p className="mb-2 text-justify leading-relaxed text-[#2C2C2A]">
          Kamu ingin pergi dari Jakarta ke Bali. Ada 3 penerbangan langsung dan 2 rute jalur
          laut yang tersedia. Berapa total pilihan cara kamu bisa pergi ke Bali?
        </p>
        <p className="mb-1 text-sm italic text-[#34673999]">
          Sebelum membaca penjelasan, diskusikan dengan temanmu!
        </p>
        <p className="mb-3 text-sm font-medium text-[#2C2C2A]">
          Apakah kamu bisa mengambil penerbangan dan jalur laut sekaligus dalam satu perjalanan?
        </p>
        <div className="mb-3 flex gap-2">
          <ToggleButton label="Bisa" active={choice2 === "yes"} onClick={() => setChoice2("yes")} />
          <ToggleButton label="Tidak" active={choice2 === "no"} onClick={() => setChoice2("no")} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#663362]">
            Ceritakan Alasanmu!
          </label>
          <textarea
            placeholder="Ceritakan alasanmu..."
            value={reasoning2}
            onChange={(e) => setReasoning2(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966]"
          />
        </div>
      </div>

      {/* --- Kesimpulan --- */}
      <div className="mt-5 rounded-xl border border-[#34673926] bg-[#DBFFD5]/50 p-5">
        <label className="mb-2 block text-base font-semibold text-[#346739]">
          Jadi, operasi matematika apa yang paling tepat digunakan?
        </label>
        <input
          type="text"
          placeholder="Tulis jawabanmu..."
          className="w-full rounded-lg border border-[#34673933] bg-white px-4 py-2.5 text-sm placeholder:text-[#34673966]"
        />
      </div>
    </article>
  );
}

// ============================================================================
// Deep Learning
// ============================================================================

export function DeepLearning() {
  const situations = [
    {
      situation: "Pilih transportasi (pesawat atau kapal)",
      optionA: "3 jenis pesawat",
      optionB: "2 jenis kapal",
    },
    {
      situation: "Pilih baju (batik atau polos)",
      optionA: "4 batik beda motif",
      optionB: "2 baju polos beda warna",
    },
    {
      situation: "Pilih jurusan (IPA atau IPS)",
      optionA: "6 jurusan IPA",
      optionB: "8 jurusan IPS",
    },
  ];

  const [foundPattern, setFoundPattern] = useState<ToggleValue>(null);

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <p className="mb-4 text-xl font-semibold text-[#346739]">
        🔍 Eksplorasi: Temukan Polanya
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#34673926]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#663362]">
              <th className="px-4 py-3 text-left font-semibold text-white">Situasi</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Pilihan A</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Pilihan B</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Boleh Keduanya?</th>
              <th className="px-4 py-3 text-center font-semibold text-white">Total Pilihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#34673915]">
            {situations.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                <td className="px-4 py-3 text-[#2C2C2A]">{item.situation}</td>
                <td className="px-4 py-3 text-center text-[#2C2C2A]">{item.optionA}</td>
                <td className="px-4 py-3 text-center text-[#2C2C2A]">{item.optionB}</td>
                <td className="px-4 py-3 text-center">
                  <select
                    name={`q7-both-${i}`}
                    className="rounded-md border border-[#34673933] px-2 py-1.5 text-xs text-[#2C2C2A]"
                  >
                    <option value="">Ya/Tidak</option>
                    <option value="yes">Ya</option>
                    <option value="no">Tidak</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="text"
                    name={`q7-total-${i}`}
                    placeholder="..."
                    className="w-20 rounded-md border border-[#34673933] px-2 py-1.5 text-center text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-base font-medium text-[#2C2C2A]">
        Pertanyaan: Apa yang kamu perhatikan dari kolom &ldquo;Boleh keduanya?&rdquo; dan
        &ldquo;Total Pilihan&rdquo;?
      </p>

      <p className="mt-4 text-lg font-semibold text-[#346739]">🤔 Apakah ada pola?</p>
      <div className="mt-2.5 flex gap-2">
        <ToggleButton label="Ya" active={foundPattern === "yes"} onClick={() => setFoundPattern("yes")} />
        <ToggleButton label="Tidak" active={foundPattern === "no"} onClick={() => setFoundPattern("no")} />
      </div>

      <p className="mt-4 text-lg font-semibold text-[#346739]">
        Operasi matematika apa yang selalu muncul?
      </p>
      <input
        type="text"
        placeholder="Tulis jawabanmu..."
        className="mt-2 w-full rounded-lg border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966]"
      />
    </article>
  );
}

// ============================================================================
// Penjelasan Konsep
// ============================================================================

export function PenjelasanKonsep() {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      {/* Konsep Dasar */}
      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Konsep Dasar</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika suatu kejadian dapat dilakukan dengan cara A <b>atau</b> cara B (tidak keduanya
          sekaligus), maka total cara melakukan kejadian tersebut adalah:
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total  = $n(A) + n(B)$"}</RichText>
        </div>
        <p className="mt-3 text-sm text-[#34673999]">Dimana:</p>
        <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-2">
          <RichText>
            {"$n(A)$ = banyaknya cara kejadian A"}
          </RichText>
          <br/>
          <RichText>
            {"$n(B)$ = banyaknya cara kejadian B"}
          </RichText>
        </div>
      </div>

      {/* Kata Kunci */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-2 text-lg font-bold text-[#346739]">Kata Kunci</h3>
        <p className="text-2xl font-bold text-[#663362]">
          &ldquo;ATAU&rdquo;{" "}
          <span className="text-base font-normal text-[#2C2C2A]">&rarr; Penjumlahan</span>
        </p>
      </div>

      {/* Mengapa penjumlahan? */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Mengapa penjumlahan?</h3>
        <p className="leading-relaxed text-[#2C2C2A]">
          Bayangkan kamu punya kotak A berisi 3 bola merah dan kotak B berisi 4 bola biru. Kamu
          hanya boleh mengambil dari <b>satu kotak saja</b>. Berapa pilihan yang ada? Tentu 3 +
          4 = 7. Kamu tidak mengalikan karena kamu tidak memilih dari kedua kotak secara
          bersamaan.
        </p>
        <p className="mt-3 leading-relaxed text-[#2C2C2A]">
          <b>Syarat penting</b>: Kejadian A dan B{" "}
          <b>bersifat saling lepas (mutually exclusive)</b> artinya tidak bisa terjadi
          bersamaan.
        </p>
      </div>

      {/* Generalisasi */}
      <div className="mt-5 rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">Generalisasi</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika ada <b>k kejadian saling lepas</b> dengan masing-masing{" "}
          <RichText>{"$n_1, n_2, n_3, ... , n_k$"}</RichText> cara:
        </p>
        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>{"Total = $n_1 + n_2 + n_3 + ... + n_k$"}</RichText>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Contoh Soal
// ============================================================================

export function ContohSoal() {
  const [passedCount, setPassedCount] = useState(0);

  const [valuesDrinks, setValuesDrinks] = useState<Record<string, string>>({});
  const [resultsDrinks, setResultsDrinks] = useState<Results>(null);
  const [feedbackDrinks, setFeedbackDrinks] = useState<Feedback>("idle");

  const [valuesBooks, setValuesBooks] = useState<Record<string, string>>({});
  const [resultsBooks, setResultsBooks] = useState<Results>(null);
  const [feedbackBooks, setFeedbackBooks] = useState<Feedback>("idle");

  const [valuesTransport, setValuesTransport] = useState<Record<string, string>>({});
  const [resultsTransport, setResultsTransport] = useState<Results>(null);
  const [feedbackTransport, setFeedbackTransport] = useState<Feedback>("idle");

  function statusFor(index: number): ExampleStatus {
    if (index < passedCount) return "completed";
    if (index === passedCount) return "active";
    return "locked";
  }

  function checkDrinks() {
    const { results, allCorrect } = gradeBlanks(EXPECTED_DRINKS, valuesDrinks);
    setResultsDrinks(results);
    setFeedbackDrinks(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 1));
  }

  function checkBooks() {
    const { results, allCorrect } = gradeBlanks(EXPECTED_BOOKS, valuesBooks);
    setResultsBooks(results);
    setFeedbackBooks(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 2));
  }

  function checkTransport() {
    const { results, allCorrect } = gradeBlanks(EXPECTED_TRANSPORT, valuesTransport);
    setResultsTransport(results);
    setFeedbackTransport(allCorrect ? "correct" : "incorrect");
    if (allCorrect) setPassedCount((p) => Math.max(p, 3));
  }

  return (
    <section>
      {/* Progress bar */}
      <div className="mb-6 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < passedCount ? "#346739" : "#34673926" }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <ExampleShell
          status={statusFor(0)}
          level="mudah"
          title="Contoh 1: Minuman Kantin"
          illustrationSrc="/illustrations/minuman.svg"
          illustrationAlt="Ilustrasi minuman panas dan dingin"
          lockedHint="Contoh 1: Minuman Kantin"
          onCheck={checkDrinks}
          feedback={feedbackDrinks}
        >
          <ExampleDrinks
            values={valuesDrinks}
            results={resultsDrinks}
            onChange={(id, v) => setValuesDrinks((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        <ExampleShell
          status={statusFor(1)}
          level="sedang"
          title="Contoh 2: Buku Perpustakaan"
          illustrationSrc="/illustrations/buku.svg"
          illustrationAlt="Ilustrasi rak buku perpustakaan"
          lockedHint="Contoh 2: Buku Perpustakaan — selesaikan Contoh 1 dulu"
          onCheck={checkBooks}
          feedback={feedbackBooks}
        >
          <ExampleBooks
            values={valuesBooks}
            results={resultsBooks}
            onChange={(id, v) => setValuesBooks((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>

        <ExampleShell
          status={statusFor(2)}
          level="hots"
          title="Contoh 3: Rute Andi ke Sekolah"
          illustrationSrc="/illustrations/transportasi.svg"
          illustrationAlt="Ilustrasi pilihan transportasi ke sekolah"
          lockedHint="Contoh 3: Rute Andi ke Sekolah — selesaikan Contoh 2 dulu"
          onCheck={checkTransport}
          feedback={feedbackTransport}
        >
          <ExampleTransport
            values={valuesTransport}
            results={resultsTransport}
            onChange={(id, v) => setValuesTransport((prev) => ({ ...prev, [id]: v }))}
          />
        </ExampleShell>
      </div>
    </section>
  );
}

// ============================================================================
// Mengapa? Corner
// ============================================================================

export function MengapaCorner() {
  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>
      <blockquote className="kp-quote text-justify">
        💡 Mengapa kita menjumlahkan, bukan mengalikan? Aturan penjumlahan berlaku ketika kita
        memilih satu dari beberapa kelompok. Kuncinya adalah kata{" "}
        <b>&ldquo;ATAU&rdquo;</b>. Jika kamu memilih mie ATAU nasi, kamu hanya makan satu
        bukan keduanya. Jadi pilihan total ya sekadar <b>digabungkan (dijumlahkan)</b>, bukan
        dikalikan. Analogi: Jika ada 3 pintu masuk dari sisi kiri dan 4 pintu masuk dari sisi
        kanan, total pintu yang bisa kamu gunakan (hanya satu) adalah 3 + 4 = 7. Kamu tidak
        mengalikan karena tidak melewati semua pintu sekaligus!
      </blockquote>
    </article>
  );
}

// ============================================================================
// Refleksi Mini
// ============================================================================

export function RefleksiMini() {
  return (
    <article>
      <SectionBadge>Refleksi Mini ✅</SectionBadge>

      <div className="flex flex-col gap-4">
        {/* Pertanyaan 1 */}
        <div className="rounded-xl bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-[#663362]">
            1. Dalam situasi apa kamu menggunakan aturan penjumlahan, bukan perkalian?
          </label>
          <input
            type="text"
            placeholder="Tulis jawabanmu..."
            className="w-full rounded-lg border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966]"
          />
        </div>

        {/* Pertanyaan 2 */}
        <div className="rounded-xl bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-[#663362]">
            2. Apa kata kunci dalam soal yang menandakan aturan penjumlahan?
          </label>
          <input
            placeholder="Tulis jawabanmu..."
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966]"
          />
        </div>

        {/* Pertanyaan 3 */}
        <div className="rounded-xl bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-[#663362]">
            3. Berikan satu contoh dari kehidupan nyata di sekitar sekolahmu!
          </label>
          <input
            placeholder="Tulis jawabanmu..."
            className="w-full min-h-[100px] rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966]"
          />
        </div>
      </div>
    </article>
  );
}