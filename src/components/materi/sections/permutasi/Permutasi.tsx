"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/ui/Materi";
import { RichText } from "@/components/shared/RichText";
import { CheckIcon } from "@/components/ui/IconButton";

// ============================================================================
// Shared: Simpan Jawaban Button
// ============================================================================

function SaveButton({
  onClick,
  disabled = false,
  loading = false,
  saved = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  saved?: boolean;
}) {
  if (saved) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-4 border-t border-[#34673926] pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="flex items-center gap-2 rounded-full bg-[#346739] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
            </svg>
            Menyimpan...
          </>
        ) : (
          <>
            <CheckIcon />
            Simpan Jawaban
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// Shared: Inline Input Blank
// ============================================================================

function InputBlank({
  value,
  onChange,
  placeholder = "...",
  className = "",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`inline-block rounded-md border-2 border-[#34673933] bg-white px-2 py-0.5 text-center text-sm font-medium text-[#663362] placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66] ${className}`}
      style={{ minWidth: "44px", maxWidth: "80px" }}
    />
  );
}

// ============================================================================
// Shared: TextArea for longer answers
// ============================================================================

function AnswerTextArea({
  value,
  onChange,
  placeholder = "Tulis jawabanmu...",
  rows = 3,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full rounded-xl border border-[#34673933] px-4 py-3 text-sm resize-y placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66] disabled:resize-none"
    />
  );
}

// ============================================================================
// Shared: Yes/No Toggle
// ============================================================================

function YesNoToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {[
        { key: "yes" as const, label: "Ya" },
        { key: "no" as const, label: "Tidak" },
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => !disabled && onChange(opt.key)}
          disabled={disabled}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === opt.key
              ? "bg-[#346739] text-white"
              : "bg-[#34673915] text-[#346739] hover:bg-[#34673926]"
          } disabled:opacity-50 disabled:cursor-default`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Shared: Sub-section wrapper for soal cards
// ============================================================================

function SoalCard({
  number,
  title,
  children,
  onSave,
  saved = false,
  loading = false,
}: {
  number?: string;
  title?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saved?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#34673926] bg-[#DBFFD5]/20 p-4">
      {(number || title) && (
        <p className="text-sm font-medium text-[#346739] mb-3">
          {number && `${number}. `}{title}
        </p>
      )}
      {children}
      {onSave && <SaveButton onClick={onSave} saved={saved} loading={loading} />}
    </div>
  );
}

// ============================================================================
// PART 1: PERMUTASI r UNSUR DARI n UNSUR
// ============================================================================

// ── 1A. Eksplorasi Kontekstual ─────────────────────────────────────

function EksplorasiKontekstual1() {
  const [toggle, setToggle] = useState<"yes" | "no" | null>(null);
  const [alasan, setAlasan] = useState("");
  const [langkah, setLangkah] = useState("");
  const [saved1, setSaved1] = useState(false); // soal: ABC vs BAC
  const [saved2, setSaved2] = useState(false); // soal: hitung perolehan medali

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Dalam sebuah lomba lari, terdapat <b>8 peserta</b>. Tiga posisi teratas (Juara 1, 2, dan 3)
          akan mendapat medali yang berbeda (emas, perak, perunggu). Berapa banyak kemungkinan
          perolehan medali yang bisa terjadi?
        </p>

        {/* Placeholder image for podium */}
        <div className="mb-5 rounded-xl border border-[#34673926] overflow-hidden">
          <Image
            src="/images/permutasi-podium.png"
            alt="Ilustrasi podium lomba lari"
            width={800}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Soal 1: ABC vs BAC */}
        <SoalCard
          number="1"
          title={`Apakah "Juara 1: Ari, Juara 2: Budi, Juara 3: Cici" sama dengan "Juara 1: Budi, Juara 2: Ari, Juara 3: Cici"?`}
          onSave={() => setSaved1(true)}
          saved={saved1}
        >
          <p className="text-sm text-[#2C2C2A] mb-3">
            ABC apakah sama dengan BAC?
          </p>
          <YesNoToggle value={toggle} onChange={setToggle} disabled={saved1} />
          <div className="mt-3">
            <p className="text-sm text-[#2C2C2A] mb-1">Berikan alasanmu:</p>
            <AnswerTextArea
              value={alasan}
              onChange={setAlasan}
              rows={2}
              disabled={saved1}
              placeholder="Tulis alasanmu..."
            />
          </div>
        </SoalCard>

        {/* Soal 2: Hitung perolehan medali */}
        <div className="mt-4">
          <SoalCard
            number="2"
            title="Coba kamu hitung berapa banyak perolehan medali yang bisa terjadi!"
            onSave={() => setSaved2(true)}
            saved={saved2}
          >
            <p className="text-sm text-[#2C2C2A] mb-2">Langkah perhitungan:</p>
            <AnswerTextArea
              value={langkah}
              onChange={setLangkah}
              rows={4}
              disabled={saved2}
              placeholder="Tulis langkah perhitunganmu..."
            />
          </SoalCard>
        </div>

        <div className="mt-4 rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
          <p className="text-sm font-medium text-[#346739]">
            💡 Inilah inti dari permutasi: <b>urutan sangat penting.</b>
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 1B. Aktivitas Deep Learning ────────────────────────────────────

function AktivitasDeepLearning1() {
  // Aktivitas 1: Tabel ADI
  const [adiR4H2, setAdiR4H2] = useState(""); // Row 4: Huruf 2 = I
  const [adiR4Sus, setAdiR4Sus] = useState(""); // Row 4: Susunan = DI
  const [adiR5H1, setAdiR5H1] = useState(""); // Row 5: Huruf 1 = I
  const [adiR5H2, setAdiR5H2] = useState(""); // Row 5: Huruf 2 = A
  const [adiR5Sus, setAdiR5Sus] = useState(""); // Row 5: Susunan = IA
  const [adiR6H1, setAdiR6H1] = useState(""); // Row 6: Huruf 1 = I
  const [adiR6H2, setAdiR6H2] = useState(""); // Row 6: Huruf 2 = D
  const [adiR6Sus, setAdiR6Sus] = useState(""); // Row 6: Susunan = ID
  const [totalSusunan, setTotalSusunan] = useState("");
  const [kaidahPerkalian, setKaidahPerkalian] = useState("");
  const [kedudukan, setKedudukan] = useState("");
  const [jumlahKotak, setJumlahKotak] = useState("");
  const [kemungkinan1, setKemungkinan1] = useState("");
  const [kemungkinan2, setKemungkinan2] = useState("");
  const [alasanHuruf2, setAlasanHuruf2] = useState("");
  const [totalCara, setTotalCara] = useState("");
  const [hubunganFaktorial, setHubunganFaktorial] = useState("");
  const [kesimpulan1, setKesimpulan1] = useState("");
  const [savedA1Table, setSavedA1Table] = useState(false);
  const [savedA1Questions, setSavedA1Questions] = useState(false);

  // Aktivitas 2: Tabel Pola
  const [pola5_3, setPola5_3] = useState(""); // 5! / ...!
  const [pola5_3_val, setPola5_3_val] = useState(""); // nilai
  const [pola6_2, setPola6_2] = useState(""); // 6×5
  const [pola6_2_denom, setPola6_2_denom] = useState(""); // 6! / ...!
  const [pola6_2_val, setPola6_2_val] = useState(""); // nilai
  const [pola6_3, setPola6_3] = useState(""); // 6×5×4
  const [pola6_3_fak, setPola6_3_fak] = useState(""); // rumus faktorial
  const [pola6_3_val, setPola6_3_val] = useState(""); // nilai
  const [pola_n_r, setPola_n_r] = useState(""); // n × (n-1) × ... × (n-r+1)
  const [pola_n_r_fak, setPola_n_r_fak] = useState(""); // n!/(n-r)!
  const [pola_n_r_val, setPola_n_r_val] = useState(""); // rumus P(n,r)
  const [rumusUmum, setRumusUmum] = useState("");
  const [savedA2, setSavedA2] = useState(false);

  // Aktivitas 3: Diskusi
  const [diskusiA, setDiskusiA] = useState("");
  const [diskusiB, setDiskusiB] = useState("");
  const [podiumCalc, setPodiumCalc] = useState("");
  const [savedA3a, setSavedA3a] = useState(false);
  const [savedA3b, setSavedA3b] = useState(false);
  const [savedA3c, setSavedA3c] = useState(false);

  // Aktivitas B4: Simpulan
  const [simpulan1, setSimpulan1] = useState("");
  const [simpulan2, setSimpulan2] = useState("");
  const [savedA4a, setSavedA4a] = useState(false);
  const [savedA4b, setSavedA4b] = useState(false);

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Urutan Itu Penting!
        </h3>

        {/* Aktivitas 1: Tabel ADI */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Dari 3 huruf {"{A, D, I}"}, buat semua susunan 2 huruf yang mungkin (tanpa pengulangan):
          </h4>

          {/* Tabel */}
          <SoalCard
            title="Lengkapi tabel berikut:"
            onSave={() => setSavedA1Table(true)}
            saved={savedA1Table}
          >
            <div className="overflow-x-auto rounded-xl border border-[#34673926]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#B8E6BC]">
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan Ke-</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Huruf 1</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Huruf 2</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34673915]">
                  {[
                    { no: 1, h1: "A", h2: "D", susunan: "AD", ro: true },
                    { no: 2, h1: "A", h2: "I", susunan: "AI", ro: true },
                    { no: 3, h1: "D", h2: "A", susunan: "DA", ro: true },
                    { no: 4, h1: "D", h2: "I", susunan: "DI", ro: false, h2v: adiR4H2, h2s: setAdiR4H2, susv: adiR4Sus, suss: setAdiR4Sus },
                    { no: 5, h1: "I", h2: "A", susunan: "IA", ro: false, h1v: adiR5H1, h1s: setAdiR5H1, h2v: adiR5H2, h2s: setAdiR5H2, susv: adiR5Sus, suss: setAdiR5Sus },
                    { no: 6, h1: "I", h2: "D", susunan: "ID", ro: false, h1v: adiR6H1, h1s: setAdiR6H1, h2v: adiR6H2, h2s: setAdiR6H2, susv: adiR6Sus, suss: setAdiR6Sus },
                  ].map((row: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                        <td className="px-4 py-3 text-center font-medium text-[#346739]">{row.no}</td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.ro ? row.h1 : (
                            <InputBlank value={row.h1v} onChange={row.h1s} disabled={savedA1Table} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.ro ? row.h2 : (
                            <InputBlank value={row.h2v} onChange={row.h2s} disabled={savedA1Table} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-[#2C2C2A]">
                          {row.ro ? row.susunan : (
                            <InputBlank value={row.susv} onChange={row.suss} disabled={savedA1Table} />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </SoalCard>

          {/* Pertanyaan lanjutan */}
          <SoalCard
            title="Jawab pertanyaan berikut berdasarkan tabel di atas:"
            onSave={() => setSavedA1Questions(true)}
            saved={savedA1Questions}
          >
            <div className="space-y-3">
              <p className="text-sm text-[#2C2C2A]">
                Berapa total susunan?{" "}
                <InputBlank value={totalSusunan} onChange={setTotalSusunan} disabled={savedA1Questions} />
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Verifikasi dengan Kaidah Perkalian: 3 ×{" "}
                <InputBlank value={kaidahPerkalian} onChange={setKaidahPerkalian} disabled={savedA1Questions} className="w-14" />
                {" "}= ...
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Coba menggunakan representasi yang lain (kotak pengisian):
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Ada berapa tempat atau kedudukan?{" "}
                <InputBlank value={kedudukan} onChange={setKedudukan} disabled={savedA1Questions} />
                {" "}Kedudukan apa saja? Sebutkan!{" "}
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Berarti kamu butuh berapa kotak pengisian?{" "}
                <InputBlank value={jumlahKotak} onChange={setJumlahKotak} disabled={savedA1Questions} />
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Huruf 1 berapa kemungkinan yang bisa menduduki?{" "}
                <InputBlank value={kemungkinan1} onChange={setKemungkinan1} disabled={savedA1Questions} />
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Huruf 2 berapa kemungkinan yang bisa menduduki?{" "}
                <InputBlank value={kemungkinan2} onChange={setKemungkinan2} disabled={savedA1Questions} />
              </p>
              <div>
                <p className="text-sm text-[#2C2C2A] mb-1">Berikan alasannya!</p>
                <AnswerTextArea value={alasanHuruf2} onChange={setAlasanHuruf2} rows={2} disabled={savedA1Questions} />
              </div>
              <p className="text-sm text-[#2C2C2A]">
                Jadi total susunan huruf yang bisa dibuat adalah sebanyak{" "}
                <InputBlank value={totalCara} onChange={setTotalCara} disabled={savedA1Questions} />
                {" "}cara.
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Hubungkan dengan faktorial: <RichText>{"$\\frac{3!}{3-2!} = $ "}</RichText>
                <InputBlank value={hubunganFaktorial} onChange={setHubunganFaktorial} disabled={savedA1Questions} />
              </p>
              <div>
                <p className="text-sm text-[#2C2C2A] mb-1">
                  Apakah ketiga cara di atas menghasilkan jawaban yang sama? Mengapa?
                </p>
                <AnswerTextArea value={kesimpulan1} onChange={setKesimpulan1} rows={2} disabled={savedA1Questions} />
              </div>
            </div>
          </SoalCard>
        </div>

        {/* Aktivitas 2: Nalar - Temukan Pola */}
        <SoalCard
          number="Aktivitas 2 — Nalar"
          title="Temukan Polanya: Lengkapi tabel berikut menggunakan cara yang sama:"
          onSave={() => setSavedA2(true)}
          saved={savedA2}
        >
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">r</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Cara (Kaidah Perkalian)</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Dalam bentuk faktorial</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { n: 4, r: 2, cara: "4×3", fak: "4!/2!", val: "12", ro: true },
                  { n: 5, r: 2, cara: "5×4", fak: "5!/3!", val: "20", ro: true },
                  { n: 5, r: 3, cara: "5×4×3", fak: null, val: null, ro: false },
                  { n: 6, r: 2, cara: null, fak: null, val: null, ro: false },
                  { n: 6, r: 3, cara: null, fak: null, val: null, ro: false },
                  { n: "n", r: "r", cara: null, fak: null, val: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-center font-semibold text-[#346739]">{row.n}</td>
                    <td className="px-4 py-3 text-center text-[#2C2C2A]">{row.r}</td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.cara}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3 : i === 3 ? pola6_2 : i === 4 ? pola6_3 : pola_n_r}
                          onChange={(e) => {
                            if (i === 2) setPola5_3(e.target.value);
                            else if (i === 3) setPola6_2(e.target.value);
                            else if (i === 4) setPola6_3(e.target.value);
                            else setPola_n_r(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-28 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.fak}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3 : i === 3 ? pola6_2_denom : i === 4 ? pola6_3_fak : pola_n_r_fak}
                          onChange={(e) => {
                            if (i === 2) setPola5_3(e.target.value);
                            else if (i === 3) setPola6_2_denom(e.target.value);
                            else if (i === 4) setPola6_3_fak(e.target.value);
                            else setPola_n_r_fak(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-28 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.val}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? pola5_3_val : i === 3 ? pola6_2_val : i === 4 ? pola6_3_val : pola_n_r_val}
                          onChange={(e) => {
                            if (i === 2) setPola5_3_val(e.target.value);
                            else if (i === 3) setPola6_2_val(e.target.value);
                            else if (i === 4) setPola6_3_val(e.target.value);
                            else setPola_n_r_val(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari baris terakhir, tuliskan rumus umum yang kamu temukan:
          </p>
          <p className="text-sm text-[#2C2C2A] mt-1">
            P(n,r) ={" "}
            <input
              type="text"
              value={rumusUmum}
              onChange={(e) => setRumusUmum(e.target.value)}
              placeholder="..."
              disabled={savedA2}
              className="inline-block rounded-md border-2 border-[#34673933] bg-white px-3 py-1 text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
              style={{ minWidth: "160px" }}
            />
          </p>
        </SoalCard>

        {/* Aktivitas 3: Diskusikan */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">Aktivitas 3 — Diskusikan: Uji Pemahamanmu (diskusi dengan teman sebangku)</h4>

          <SoalCard
            title="(a) Mengapa penyebut rumusmu adalah (n-r)! dan bukan r!?"
            onSave={() => setSavedA3a(true)}
            saved={savedA3a}
          >
            <AnswerTextArea value={diskusiA} onChange={setDiskusiA} rows={3} disabled={savedA3a} />
          </SoalCard>

          <SoalCard
            title="(b) Apa yang terjadi jika r=n? Berapa nilai P(n,n)? Mengapa hasilnya n!?"
            onSave={() => setSavedA3b(true)}
            saved={savedA3b}
          >
            <AnswerTextArea value={diskusiB} onChange={setDiskusiB} rows={3} disabled={savedA3b} />
          </SoalCard>

          <SoalCard
            title="(c) Kembali ke soal podium awal — 8 pelari, 3 posisi. Hitung dengan rumus yang kamu temukan!"
            onSave={() => setSavedA3c(true)}
            saved={savedA3c}
          >
            <p className="text-sm text-[#2C2C2A]">
              P(8,3) = <InputBlank value={podiumCalc} onChange={setPodiumCalc} disabled={savedA3c} className="w-20" />
            </p>
          </SoalCard>
        </div>

        {/* Aktivitas B4: Simpulkan */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">Aktivitas B4 — Simpulkan: Tuliskan dengan kalimatmu sendiri</h4>

          <SoalCard
            title='"Permutasi P(n,r) digunakan ketika..."'
            onSave={() => setSavedA4a(true)}
            saved={savedA4a}
          >
            <AnswerTextArea value={simpulan1} onChange={setSimpulan1} rows={3} disabled={savedA4a} />
          </SoalCard>

          <SoalCard
            title='"Rumus P(n,r)=n!/(n-r)! terbentuk karena..."'
            onSave={() => setSavedA4b(true)}
            saved={savedA4b}
          >
            <AnswerTextArea value={simpulan2} onChange={setSimpulan2} rows={3} disabled={savedA4b} />
          </SoalCard>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 1C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep1() {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          <b>Definisi</b>: Permutasi adalah susunan objek-objek yang diambil dari sekelompok objek
          dengan <b>memperhatikan urutan</b>.
        </p>

        <div className="mb-4 rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
          <RichText>
            {"$P(n,r) = \\frac{n!}{(n-r)!} = n \\times (n-1) \\times (n-2) \\times \\dots \\times (n-r+1)$"}
          </RichText>
        </div>

        <div className="space-y-2 text-sm leading-relaxed text-[#2C2C2A]">
          <p><b>Di mana</b>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>n</b> = banyak objek yang tersedia</li>
            <li><b>r</b> = banyak objek yang diambil/disusun</li>
            <li>r ≤ n</li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-3">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">🤔 Apa yang terjadi jika r &gt; n?</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Coba jelaskan pendapatmu! Tidak mungkin mengambil lebih banyak objek daripada yang tersedia.
          </p>
        </div>

        <div className="mt-5">
          <h4 className="mb-2 text-base font-semibold text-[#346739]">💡 Intuisi Rumus</h4>
          <div className="space-y-1 text-sm leading-relaxed text-[#2C2C2A]">
            <p>Posisi ke-1: ada <b>n</b> pilihan</p>
            <p>Posisi ke-2: ada <b>(n – 1)</b> pilihan</p>
            <p>⋮</p>
            <p>Posisi ke-r: ada <b>n – r + 1</b> pilihan</p>
          </div>
          <div className="mt-3 rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center">
            <RichText>
              {"$\\text{Total} = n(n-1)(n-2)\\dots(n-r+1) = \\frac{n!}{(n-r)!}$"}
            </RichText>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[#66336226] bg-[#66336208] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">⭐ Kasus Khusus</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            <b>Permutasi Semua Objek:</b> P(n,n) = n!
          </p>
          <p className="mt-1 text-sm text-[#6B6B66]">
            Karena semua objek diambil dan disusun, sehingga (n-n)! = 0! = 1 pada penyebut.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// PART 2: PERMUTASI DENGAN UNSUR YANG SAMA
// ============================================================================

// ── 2A. Eksplorasi Kontekstual ─────────────────────────────────────

function EksplorasiKontekstual2() {
  const [siapaBenar, setSiapaBenar] = useState("");
  const [alasan, setAlasan] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata: Password Wifi</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Abdi dan Gian ingin menggunakan wifi sekolah untuk mengerjakan tugas. Admin sekolah hanya
          memberitahu kalau password wifi sekolah berasal dari kata <b>"ADA"</b> yang hurufnya
          di bolak-balik dan belakangnya ditambahi pagar (#). Mereka berdua ingin tahu berapa
          banyak percobaan memasukkan password sehingga mereka dapat menggunakan wifi tersebut.
        </p>

        {/* Placeholder image for wifi password */}
        <div className="mb-5 rounded-xl border border-[#34673926] overflow-hidden">
          <Image
            src="/images/permutasi-wifi.png"
            alt="Ilustrasi memasukkan password wifi"
            width={800}
            height={350}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="rounded-lg bg-[#DBFFD5]/30 px-4 py-3 mb-4">
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Abdi berkata: <i>"Gampang itu, hurufnya kan ada 3 berarti <b>3! = 6 kali percobaan</b>."</i>
          </p>
          <p className="text-sm leading-relaxed text-[#2C2C2A] mt-1">
            Gian menyela: <i>"Tunggu dulu, ada dua huruf A yang sama lho. <b>Apakah susunan A₁A₂D dan A₂A₁D benar-benar berbeda?</b>"</i>
          </p>
        </div>

        <SoalCard
          title="Menurutmu siapa yang benar? Mengapa?"
          onSave={() => setSaved(true)}
          saved={saved}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Siapa yang benar?</p>
              <input
                type="text"
                value={siapaBenar}
                onChange={(e) => setSiapaBenar(e.target.value)}
                placeholder="Abdi / Gian / ..."
                disabled={saved}
                className="w-full rounded-xl border border-[#34673933] px-4 py-2.5 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0] disabled:text-[#6B6B66]"
              />
            </div>
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Jelaskan alasanmu!</p>
              <AnswerTextArea value={alasan} onChange={setAlasan} rows={3} disabled={saved} />
            </div>
          </div>
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 2B. Aktivitas Deep Learning ────────────────────────────────────

function AktivitasDeepLearning2() {
  // Aktivitas 1: Visualisasi ADA
  const [adaR4Tanpa, setAdaR4Tanpa] = useState(""); // Row 4 tanpa label
  const [adaR6Tanpa, setAdaR6Tanpa] = useState(""); // Row 6 tanpa label
  const [savedA1Table, setSavedA1Table] = useState(false);
  const [totalBerbeda, setTotalBerbeda] = useState("");
  const [munculKali, setMunculKali] = useState("");
  const [faktorialSama, setFaktorialSama] = useState("");
  const [savedA1Langkah2, setSavedA1Langkah2] = useState(false);
  const [susunanBerbedaHitung, setSusunanBerbedaHitung] = useState("");
  const [cocokManual, setCocokManual] = useState("");
  const [savedA1Langkah3, setSavedA1Langkah3] = useState(false);

  // Aktivitas 2: Nalar tabel
  const [nalar1, setNalar1] = useState(""); // A,A,A,B value
  const [nalar2_rumus, setNalar2_rumus] = useState(""); // M,A,T,A rumus
  const [nalar2_val, setNalar2_val] = useState(""); // M,A,T,A value
  const [nalar3_rumus, setNalar3_rumus] = useState(""); // B,E,B,A,S rumus
  const [nalar3_val, setNalar3_val] = useState(""); // B,E,B,A,S value
  const [pilihanHuruf, setPilihanHuruf] = useState("");
  const [pilihanN, setPilihanN] = useState("");
  const [pilihanRumus, setPilihanRumus] = useState("");
  const [pilihanVal, setPilihanVal] = useState("");
  const [rumusSama, setRumusSama] = useState("");
  const [savedA2, setSavedA2] = useState(false);

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Permutasi dengan Unsur yang Sama
        </h3>

        {/* Aktivitas 1: Amati */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Amati: Dari kata "ADA", berapa susunan kata yang bisa dibentuk? (dua huruf A identik)
          </h4>

          {/* Tabel ADA */}
          <SoalCard
            title="Langkah 1: Beri label dulu — anggap dua A berbeda: A₁ dan A₂."
            onSave={() => setSavedA1Table(true)}
            saved={savedA1Table}
          >
            <div className="overflow-x-auto rounded-xl border border-[#34673926]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#B8E6BC]">
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan (dengan label)</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan (tanpa label)</th>
                    <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34673915]">
                  {[
                    { label: "A₁A₂D", tanpa: "ADA", ket: "—", ro: true },
                    { label: "A₂A₁D", tanpa: "ADA", ket: "Sama dengan baris 1", ro: true },
                    { label: "A₁DA₂", tanpa: "ADA", ket: "—", ro: true },
                    { label: "A₂DA₁", tanpa: null, ket: "Sama dengan baris 3", ro: false, val: adaR4Tanpa, set: setAdaR4Tanpa },
                    { label: "DA₁A₂", tanpa: "DAA", ket: "—", ro: true },
                    { label: "DA₂A₁", tanpa: null, ket: "Sama dengan baris 5", ro: false, val: adaR6Tanpa, set: setAdaR6Tanpa },
                  ].map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                      <td className="px-4 py-3 text-center font-mono text-[#663362]">{row.label}</td>
                      <td className="px-4 py-3 text-center">
                        {row.ro ? (
                          <span className="font-semibold text-[#2C2C2A]">{row.tanpa}</span>
                        ) : (
                          <InputBlank value={row.val} onChange={row.set} disabled={savedA1Table} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#6B6B66]">{row.ket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SoalCard>

          {/* Langkah 2: Analisis */}
          <SoalCard
            title="Langkah 2: Analisis"
            onSave={() => setSavedA1Langkah2(true)}
            saved={savedA1Langkah2}
          >
            <div className="space-y-3">
              <p className="text-sm text-[#2C2C2A]">
                Tanpa label, berapa susunan yang <b>benar-benar berbeda</b>?{" "}
                <InputBlank value={totalBerbeda} onChange={setTotalBerbeda} disabled={savedA1Langkah2} />
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Dari 3! = 6 susunan, setiap susunan unik muncul sebanyak{" "}
                <InputBlank value={munculKali} onChange={setMunculKali} disabled={savedA1Langkah2} />
                {" "}kali.
              </p>
              <p className="text-sm text-[#2C2C2A]">
                Angka itu sama dengan{" "}
                <InputBlank value={faktorialSama} onChange={setFaktorialSama} disabled={savedA1Langkah2} />
                {" "}! (faktorial dari banyaknya huruf yang sama)
              </p>
            </div>
          </SoalCard>

          {/* Langkah 3: Hitung */}
          <SoalCard
            title="Langkah 3: Hitung"
            onSave={() => setSavedA1Langkah3(true)}
            saved={savedA1Langkah3}
          >
            <div className="space-y-3">
              <p className="text-sm text-[#2C2C2A]">
                Susunan berbeda = 3!/2! = 6/2 ={" "}
                <InputBlank value={susunanBerbedaHitung} onChange={setSusunanBerbedaHitung} disabled={savedA1Langkah3} />
              </p>
              <div>
                <p className="text-sm text-[#2C2C2A] mb-1">Cocok dengan daftar manual?</p>
                <AnswerTextArea value={cocokManual} onChange={setCocokManual} rows={1} disabled={savedA1Langkah3} />
              </div>
            </div>
          </SoalCard>
        </div>

        {/* Aktivitas 2: Nalar */}
        <SoalCard
          number="Aktivitas 2 — Nalar"
          title="Temukan Pola: Perluasan pola — lengkapi tabel:"
          onSave={() => setSavedA2(true)}
          saved={savedA2}
        >
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-left font-semibold text-white">Huruf</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-left font-semibold text-white">Huruf berulang</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Rumus</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { huruf: "A, A, B", n: 3, ulang: "A=2", rumus: "3!/2!", hasil: "3", ro: true },
                  { huruf: "A, A, B, B", n: 4, ulang: "A=2, B=2", rumus: "4!/(2!·2!)", hasil: "6", ro: true },
                  { huruf: "A, A, A, B", n: 4, ulang: "A=3", rumus: "4!/3!", hasil: null, ro: false },
                  { huruf: "M, A, T, A", n: 4, ulang: "A=2", rumus: null, hasil: null, ro: false },
                  { huruf: "B, E, B, A, S", n: 5, ulang: "B=2", rumus: null, hasil: null, ro: false },
                  { huruf: null, n: null, ulang: null, rumus: null, hasil: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-[#2C2C2A]">
                      {row.huruf ?? (
                        <input
                          type="text"
                          value={pilihanHuruf}
                          onChange={(e) => setPilihanHuruf(e.target.value)}
                          placeholder="Huruf pilihanmu..."
                          disabled={savedA2}
                          className="w-32 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-[#2C2C2A]">
                      {row.n ?? (
                        <InputBlank value={pilihanN} onChange={setPilihanN} disabled={savedA2} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#2C2C2A]">
                      {row.ulang ?? (i === 5 ? (
                        <input
                          type="text"
                          value={pilihanRumus}
                          onChange={(e) => setPilihanRumus(e.target.value)}
                          placeholder="..."
                          disabled={savedA2}
                          className="w-28 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      ) : null)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.rumus}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 3 ? nalar2_rumus : i === 4 ? nalar3_rumus : i === 5 ? pilihanRumus : ""}
                          onChange={(e) => {
                            if (i === 3) setNalar2_rumus(e.target.value);
                            else if (i === 4) setNalar3_rumus(e.target.value);
                            else if (i === 5) setPilihanRumus(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-32 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.hasil}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? nalar1 : i === 3 ? nalar2_val : i === 4 ? nalar3_val : i === 5 ? pilihanVal : ""}
                          onChange={(e) => {
                            if (i === 2) setNalar1(e.target.value);
                            else if (i === 3) setNalar2_val(e.target.value);
                            else if (i === 4) setNalar3_val(e.target.value);
                            else if (i === 5) setPilihanVal(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari tabel, tuliskan rumus umum:
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-[#2C2C2A]">P(sama) =</span>
            <input
              type="text"
              value={rumusSama}
              onChange={(e) => setRumusSama(e.target.value)}
              placeholder="..."
              disabled={savedA2}
              className="inline-block rounded-md border-2 border-[#34673933] bg-white px-3 py-1 text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
              style={{ minWidth: "200px" }}
            />
          </div>
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 2C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep2() {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi dengan Unsur yang Sama</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Jika dari <b>n</b> objek terdapat objek-objek yang sama (misal: k₁ objek sama jenis 1,
          k₂ objek sama jenis 2, dst.), maka:
        </p>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center mb-4">
          <RichText>
            {"$P = \\frac{n!}{k_1! \\cdot k_2! \\cdot k_3! \\cdot \\dots}$"}
          </RichText>
        </div>

        <div className="rounded-lg border border-[#66336226] bg-[#66336208] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">🤔 Mengapa dibagi faktorial?</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Karena susunan objek-objek yang sama satu sama lain <b>tidak menghasilkan susunan yang berbeda</b>.
            Pembagian dengan k₁! menghilangkan pengulangan yang disebabkan oleh objek-objek identik.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// PART 3: PERMUTASI SIKLIS
// ============================================================================

// ── 3A. Eksplorasi Kontekstual ─────────────────────────────────────

function EksplorasiKontekstual3() {
  const [toggle, setToggle] = useState<"yes" | "no" | null>(null);
  const [berapaSusunan, setBerapaSusunan] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <article>
      <SectionBadge>Eksplorasi Kontekstual</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#2C2C2A]">Situasi Nyata</h3>
        <p className="mb-4 text-justify leading-relaxed text-[#2C2C2A]">
          Pengurus OSIS terdiri dari <b>4 orang</b> (Ari, Budi, Cici, Dani) akan mengadakan rapat
          duduk <b>melingkari meja bundar</b>. Sekretaris mencatat semua kemungkinan tempat duduk.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
          Ia mulai dengan cara biasa: <i>"4 orang berjajar = 4! = 24 cara."</i>
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[#2C2C2A]">
          Tapi ketua OSIS mengoreksi: <i>"Kita duduk melingkar, bukan berjajar. Coba perhatikan ini..."</i>
        </p>

        {/* Placeholder image for circular arrangement */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#34673926] overflow-hidden">
            <Image
              src="/images/permutasi-siklis-1.png"
              alt="Ilustrasi susunan melingkar 1"
              width={400}
              height={250}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="rounded-xl border border-[#34673926] overflow-hidden">
            <Image
              src="/images/permutasi-siklis-2.png"
              alt="Ilustrasi susunan melingkar 2"
              width={400}
              height={250}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <p className="mb-3 text-sm text-[#2C2C2A]">
          Semua gambar di atas menunjukkan susunan yang sama di meja bundar — hanya diputar!
        </p>

        <SoalCard
          title="Menurutmu, apakah penjelasan ketua OSIS benar? Jika ya, berapa susunan yang benar-benar berbeda?"
          onSave={() => setSaved(true)}
          saved={saved}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">Penjelasan ketua OSIS benar?</p>
              <YesNoToggle value={toggle} onChange={setToggle} disabled={saved} />
            </div>
            <div>
              <p className="text-sm text-[#2C2C2A] mb-1">
                Jika ya, berapa susunan yang benar-benar berbeda menurutmu?
              </p>
              <InputBlank
                value={berapaSusunan}
                onChange={setBerapaSusunan}
                disabled={saved}
              />
            </div>
          </div>
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 3B. Aktivitas Deep Learning ────────────────────────────────────

function AktivitasDeepLearning3() {
  // Aktivitas 1: 3 orang melingkar
  const [susunanUnik3, setSusunanUnik3] = useState("");
  const [munculKali, setMunculKali] = useState("");
  const [angkaSama, setAngkaSama] = useState("");
  const [psiklis3, setPsiklis3] = useState("");
  const [savedA1a, setSavedA1a] = useState(false);
  const [savedA1b, setSavedA1b] = useState(false);
  const [savedA1c, setSavedA1c] = useState(false);
  const [savedA1d, setSavedA1d] = useState(false);

  // Aktivitas B2: Tabel n
  const [n4Muncul, setN4Muncul] = useState("");
  const [n4Unik, setN4Unik] = useState("");
  const [n5Linear, setN5Linear] = useState("");
  const [n5Muncul, setN5Muncul] = useState("");
  const [n5Unik, setN5Unik] = useState("");
  const [n6Linear, setN6Linear] = useState("");
  const [n6Muncul, setN6Muncul] = useState("");
  const [n6Unik, setN6Unik] = useState("");
  const [nMuncul, setNMuncul] = useState("");
  const [nUnik, setNUnik] = useState("");
  const [rumusSiklis, setRumusSiklis] = useState("");
  const [savedA2, setSavedA2] = useState(false);

  return (
    <article>
      <SectionBadge>Aktivitas Deep Learning</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-6">
        <h3 className="text-lg font-bold text-[#346739]">
          🔍 Eksplorasi: Permutasi Siklis
        </h3>

        {/* Aktivitas 1: Amati 3 orang */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-[#346739]">
            Aktivitas 1 — Amati (Selidiki Rotasi): Dari 3 orang (A, B, C) duduk melingkar
          </h4>

          <p className="text-sm font-medium text-[#346739]">Langkah 1: Daftar semua permutasi linear (duduk berjajar)</p>
          <p className="text-sm text-[#2C2C2A] mb-2">
            3! = 6 susunan: ABC, ACB, BAC, BCA, CAB, CBA
          </p>

          <p className="text-sm font-medium text-[#346739] mb-2">Langkah 2: Kelompokkan yang merupakan rotasi satu sama lain:</p>
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#B8E6BC]">
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Kelompok</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan yang Sama (Rotasi)</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#2C2C2A]">Susunan Melingkar Unik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                <tr className="bg-white">
                  <td className="px-4 py-3 text-center font-medium text-[#346739]">1</td>
                  <td className="px-4 py-3 text-center font-mono text-[#2C2C2A]">ABC → BCA → CAB</td>
                  <td className="px-4 py-3 text-center text-[#2C2C2A]">{"{A, B, C}"} searah jarum jam</td>
                </tr>
                <tr className="bg-[#DBFFD5]/30">
                  <td className="px-4 py-3 text-center font-medium text-[#346739]">2</td>
                  <td className="px-4 py-3 text-center font-mono text-[#2C2C2A]">ACB → CBA → BAC</td>
                  <td className="px-4 py-3 text-center text-[#2C2C2A]">{"{A, C, B}"} searah jarum jam</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SoalCard
            title="Dari 3! = 6 susunan linear, hanya ada berapa susunan melingkar yang unik?"
            onSave={() => setSavedA1a(true)}
            saved={savedA1a}
          >
            <InputBlank value={susunanUnik3} onChange={setSusunanUnik3} disabled={savedA1a} />
          </SoalCard>

          <SoalCard
            title="Setiap susunan melingkar muncul berapa kali dalam daftar permutasi linear?"
            onSave={() => setSavedA1b(true)}
            saved={savedA1b}
          >
            <InputBlank value={munculKali} onChange={setMunculKali} disabled={savedA1b} />
          </SoalCard>

          <SoalCard
            title="Angka itu sama dengan berapa? (banyaknya orang yang duduk melingkar)"
            onSave={() => setSavedA1c(true)}
            saved={savedA1c}
          >
            <InputBlank value={angkaSama} onChange={setAngkaSama} disabled={savedA1c} />
          </SoalCard>

          <SoalCard
            title="Langkah 3: Hitung — P(siklis 3) = 3!/3 = 6/3 = ..."
            onSave={() => setSavedA1d(true)}
            saved={savedA1d}
          >
            <InputBlank value={psiklis3} onChange={setPsiklis3} disabled={savedA1d} />
          </SoalCard>
        </div>

        {/* Aktivitas B2: Nalar tabel n */}
        <SoalCard
          number="Aktivitas B2 — Nalar"
          title="Temukan Pola: Lakukan hal yang sama untuk berbagai nilai n:"
          onSave={() => setSavedA2(true)}
          saved={savedA2}
        >
          <div className="overflow-x-auto rounded-xl border border-[#34673926] mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#663362]">
                  <th className="px-4 py-3 text-center font-semibold text-white">n</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Susunan Linear (n!)</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Setiap susunan melingkar unik muncul berapa kali?</th>
                  <th className="px-4 py-3 text-center font-semibold text-white">Susunan Melingkar Unik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34673915]">
                {[
                  { n: 3, linear: "3! = 6", muncul: "3 kali", unik: "6/3 = 2", ro: true },
                  { n: 4, linear: "4! = 24", muncul: null, unik: null, ro: false },
                  { n: 5, linear: null, muncul: null, unik: null, ro: false },
                  { n: 6, linear: null, muncul: null, unik: null, ro: false },
                  { n: "n", linear: "n!", muncul: null, unik: null, ro: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#DBFFD5]/30"}>
                    <td className="px-4 py-3 text-center font-semibold text-[#346739]">{row.n}</td>
                    <td className="px-4 py-3 text-center">
                      {row.ro && i === 0 ? (
                        <span className="font-mono text-[#2C2C2A]">{row.linear}</span>
                      ) : row.ro ? (
                        <span className="font-mono text-[#2C2C2A]">{row.linear}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 2 ? n5Linear : i === 3 ? n6Linear : ""}
                          onChange={(e) => {
                            if (i === 2) setN5Linear(e.target.value);
                            else if (i === 3) setN6Linear(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-24 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-mono placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="text-[#2C2C2A]">{row.muncul}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 1 ? n4Muncul : i === 2 ? n5Muncul : i === 3 ? n6Muncul : i === 4 ? nMuncul : ""}
                          onChange={(e) => {
                            if (i === 1) setN4Muncul(e.target.value);
                            else if (i === 2) setN5Muncul(e.target.value);
                            else if (i === 3) setN6Muncul(e.target.value);
                            else if (i === 4) setNMuncul(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-20 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.ro ? (
                        <span className="font-semibold text-[#2C2C2A]">{row.unik}</span>
                      ) : (
                        <input
                          type="text"
                          value={i === 1 ? n4Unik : i === 2 ? n5Unik : i === 3 ? n6Unik : i === 4 ? nUnik : ""}
                          onChange={(e) => {
                            if (i === 1) setN4Unik(e.target.value);
                            else if (i === 2) setN5Unik(e.target.value);
                            else if (i === 3) setN6Unik(e.target.value);
                            else if (i === 4) setNUnik(e.target.value);
                          }}
                          placeholder="…"
                          disabled={savedA2}
                          className="w-24 rounded-md border-2 border-[#34673933] bg-white px-2 py-1 text-center text-sm font-semibold placeholder:text-[#34673966] focus:outline-none focus:ring-2 focus:ring-[#34673933] disabled:cursor-default disabled:bg-[#F5F5F0]"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-medium text-[#346739]">
            Dari baris terakhir:
          </p>
          <p className="text-sm text-[#2C2C2A] mt-1">
            P(siklis n) = n!/n ={" "}
            <InputBlank value={rumusSiklis} onChange={setRumusSiklis} disabled={savedA2} className="w-24" />
          </p>
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── 3C. Penjelasan Konsep (Read-only) ──────────────────────────────

function PenjelasanKonsep3() {
  return (
    <article>
      <SectionBadge>Penjelasan Konsep</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">📖 Permutasi Siklis</h3>
        <p className="mb-3 leading-relaxed text-[#2C2C2A]">
          Permutasi Siklis adalah susunan objek-objek yang membentuk lingkaran tertutup, di mana
          rotasi dari susunan yang sama dianggap identik.
        </p>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3 text-center mb-4">
          <RichText>
            {"$P_{\\text{siklis}}(n) = (n-1)!$"}
          </RichText>
        </div>

        <div className="rounded-lg border border-[#66336226] bg-[#66336208] p-4 mb-4">
          <h4 className="mb-2 text-base font-semibold text-[#663362]">🤔 Mengapa (n−1)!?</h4>
          <ul className="space-y-1 text-sm leading-relaxed text-[#2C2C2A] list-disc pl-5">
            <li>Dalam susunan linear, ada n! cara.</li>
            <li>Dalam susunan melingkar, setiap kelompok susunan yang sama dihitung n kali (sebanyak rotasi yang mungkin).</li>
            <li>Maka: n!/n = (n−1)!</li>
          </ul>
        </div>

        <div className="rounded-lg bg-[#DBFFD5]/50 px-4 py-3">
          <h4 className="mb-2 text-base font-semibold text-[#346739]">💡 Cara mudah memahaminya:</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            "Kunci" satu orang di satu posisi sebagai titik referensi. Susun sisa (n−1) orang di
            posisi yang lain → (n−1)! cara.
          </p>
        </div>

        <div className="mt-5 rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-4">
          <h4 className="mb-2 text-base font-semibold text-[#C44F4F]">⚠ Permutasi Siklis Khusus: Objek dengan dua sisi</h4>
          <p className="text-sm leading-relaxed text-[#2C2C2A] mb-2">
            Untuk benda seperti <b>kalung, gelang, atau cincin</b> — membaliknya menghasilkan
            susunan yang dianggap sama (karena kalung bisa dipakai di kedua sisi).
          </p>
          <div className="rounded-lg bg-white px-4 py-3 text-center">
            <RichText>
              {"$P_{\\text{kalung}}(n) = \\frac{(n-1)!}{2}$"}
            </RichText>
          </div>
          <p className="mt-2 text-sm text-[#2C2C2A]">
            💡 <b>Dibagi 2 karena setiap susunan dan bayangannya (hasil membalik) dianggap identik.</b>
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// PART 4: CONTOH SOAL BERTAHAP
// ============================================================================

function ContohSoalBertahap() {
  return (
    <article>
      <SectionBadge>Contoh Soal Bertahap</SectionBadge>

      <div className="flex flex-col gap-5">
        <Contoh1 />
        <Contoh2 />
        <Contoh3 />
        <Contoh4 />
        <Contoh5 />
        <Contoh6 />
        <Contoh7 />
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ── Contoh 1 (Mudah) ──────────────────────────────────────────────

function Contoh1() {
  const [langkah, setLangkah] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 1 (Mudah)"
      title="Dari 6 calon pengurus OSIS, akan dipilih Ketua, Sekretaris, dan Bendahara. Berapa banyak susunan pengurus yang mungkin?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-3">
        <b>Langkah Berpikir:</b> Ini permutasi karena jabatan berbeda → urutan penting. n = 6, r = 3.
      </p>
      <p className="text-sm text-[#2C2C2A] mb-2">
        P(6,3) = 6!/(6-3)! = 6!/3!
      </p>
      <p className="text-sm text-[#2C2C2A] mb-3">
        = ... × ... × ... = ...
      </p>
      <AnswerTextArea
        value={langkah}
        onChange={setLangkah}
        rows={3}
        disabled={saved}
        placeholder="Lengkapi langkah perhitungan dan tulis jawaban akhir..."
      />
    </SoalCard>
  );
}

// ── Contoh 2 (Mudah) ──────────────────────────────────────────────

function Contoh2() {
  const [jawaban, setJawaban] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 2 (Mudah)"
      title="Enam orang pengurus OSIS akan duduk mengelilingi meja bundar untuk rapat. Berapa banyak susunan tempat duduk yang berbeda?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-3">
        <b>Langkah Berpikir:</b>
      </p>
      <ul className="list-disc pl-5 text-sm text-[#2C2C2A] mb-3 space-y-1">
        <li>Apakah ada "kursi nomor 1" di meja bundar? → <b>Tidak</b> — tidak ada titik referensi.</li>
        <li>Susunan melingkar → <b>gunakan permutasi siklis</b>.</li>
      </ul>
      <p className="text-sm text-[#2C2C2A] mb-2">
        P(siklis 6) = (6-1)! = ...! = ...
      </p>
      <AnswerTextArea
        value={jawaban}
        onChange={setJawaban}
        rows={3}
        disabled={saved}
        placeholder="Lengkapi perhitungan dan tulis jawaban akhir..."
      />
    </SoalCard>
  );
}

// ── Contoh 3 (Sedang) ─────────────────────────────────────────────

function Contoh3() {
  const [kasus1, setKasus1] = useState("");
  const [kasus2, setKasus2] = useState("");
  const [total, setTotal] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 3 (Sedang)"
      title="Pengurus OSIS terdiri dari 10 siswa. Akan dipilih Ketua, Wakil Ketua, Sekretaris, dan Bendahara. Jika Rafi hanya bersedia menjadi Ketua atau tidak ikut sama sekali, berapa banyak susunan pengurus yang mungkin?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-2">
        <b>Langkah Berpikir:</b> Ada syarat khusus untuk Rafi → soal harus <b>dipilah menjadi kasus</b>.
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-[#346739]">Kasus 1: Rafi menjadi Ketua</p>
          <p className="text-sm text-[#2C2C2A]">
            Posisi Ketua → hanya Rafi: <b>1 cara</b>. Wakil, Sekretaris, Bendahara → diisi 9 siswa tersisa: P(9,3) = 9×8×7 = ...
          </p>
          <AnswerTextArea value={kasus1} onChange={setKasus1} rows={2} disabled={saved} placeholder="Hitung subtotal Kasus 1..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Kasus 2: Rafi tidak ikut</p>
          <p className="text-sm text-[#2C2C2A]">
            Tersisa 9 siswa untuk 4 posisi: P(9,4) = 9×8×7×6 = ...
          </p>
          <AnswerTextArea value={kasus2} onChange={setKasus2} rows={2} disabled={saved} placeholder="Hitung subtotal Kasus 2..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Gabungkan (Kaidah Penjumlahan):</p>
          <AnswerTextArea value={total} onChange={setTotal} rows={2} disabled={saved} placeholder="Total = Kasus 1 + Kasus 2 = ..." />
        </div>
      </div>
    </SoalCard>
  );
}

// ── Contoh 4 (Sedang) ─────────────────────────────────────────────

function Contoh4() {
  const [jawaban, setJawaban] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 4 (Sedang)"
      title='Berapa banyak cara menyusun huruf-huruf dari kata "MATEMATIKA"?'
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-2">
        <b>Langkah Berpikir:</b> Kata "MATEMATIKA" memiliki 10 huruf: M(2), A(3), T(2), E(1), I(1), K(1).
      </p>
      <p className="text-sm text-[#2C2C2A] mb-2">
        Karena ada huruf yang sama, <b>gunakan permutasi dengan pengulangan</b>.
      </p>
      <p className="text-sm text-[#2C2C2A] mb-3">
        P = 10!/(2!·3!·2!·1!·1!·1!) = 3.628.800/(2·6·2) = 3.628.800/24 = ...
      </p>
      <AnswerTextArea
        value={jawaban}
        onChange={setJawaban}
        rows={2}
        disabled={saved}
        placeholder="Tulis jawaban akhir..."
      />
    </SoalCard>
  );
}

// ── Contoh 5 (Sedang) ─────────────────────────────────────────────

function Contoh5() {
  const [siklis5, setSiklis5] = useState("");
  const [dalamBlok, setDalamBlok] = useState("");
  const [total, setTotal] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 5 (Sedang)"
      title="Lima pasang suami-istri akan duduk mengelilingi meja bundar. Berapa banyak susunan yang mungkin jika setiap suami harus duduk di sebelah istrinya?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-3">
        <b>Langkah Berpikir:</b> Gabungkan tiap pasang menjadi satu blok → 5 blok disusun melingkar.
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-[#2C2C2A]">
            P(siklis 5) = (...−...)! = ...! = ...
          </p>
          <AnswerTextArea value={siklis5} onChange={setSiklis5} rows={1} disabled={saved} placeholder="Hitung susunan melingkar 5 blok..." />
        </div>
        <div>
          <p className="text-sm text-[#2C2C2A]">
            Dalam setiap blok, suami dan istri bisa bertukar posisi: 2! = 2 cara per pasang.
          </p>
          <AnswerTextArea value={dalamBlok} onChange={setDalamBlok} rows={1} disabled={saved} placeholder="Hitung susunan dalam blok..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Total:</p>
          <AnswerTextArea value={total} onChange={setTotal} rows={1} disabled={saved} placeholder="Total = P(siklis 5) × 2^5 = ..." />
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-[#DBFFD5]/30 px-3 py-2">
        <p className="text-xs text-[#346739]">
          💡 Strategi blok: ketika ada syarat "harus berdampingan", gabungkan objek tersebut menjadi satu unit terlebih dahulu.
        </p>
      </div>
    </SoalCard>
  );
}

// ── Contoh 6 (HOTS) ───────────────────────────────────────────────

function Contoh6() {
  const [kasus1, setKasus1] = useState("");
  const [kasus2, setKasus2] = useState("");
  const [total, setTotal] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 6 (HOTS)"
      title="Berapa banyak bilangan yang terdiri dari angka-angka {1, 1, 2, 2, 3} yang dapat dibentuk jika nilainya lebih dari 20.000?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-2">
        <b>Langkah Berpikir:</b> 5 digit, angka berulang: 1(2×), 2(2×). Syarat: nilai &gt; 20.000 → digit pertama ≥ 2.
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-[#346739]">Kasus 1: Digit pertama = 2</p>
          <p className="text-sm text-[#2C2C2A]">
            Sisa 4 angka: {"{1, 1, 2, 3}"} (angka 2 tersisa 1). P = 4!/2! = 24/2 = ...
          </p>
          <AnswerTextArea value={kasus1} onChange={setKasus1} rows={1} disabled={saved} placeholder="Hitung Kasus 1..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Kasus 2: Digit pertama = 3</p>
          <p className="text-sm text-[#2C2C2A]">
            Sisa 4 angka: {"{1, 1, 2, 2}"}. P = 4!/(...!·...!) = 24/... = ...
          </p>
          <AnswerTextArea value={kasus2} onChange={setKasus2} rows={1} disabled={saved} placeholder="Hitung Kasus 2..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Total:</p>
          <AnswerTextArea value={total} onChange={setTotal} rows={1} disabled={saved} placeholder="Total = Kasus 1 + Kasus 2 = ..." />
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-[#DBFFD5]/30 px-3 py-2">
        <p className="text-xs text-[#346739]">
          💡 Perhatikan: di setiap kasus, sisa angka yang tersusun berbeda komposisinya — sehingga rumus penyebutnya pun berbeda.
        </p>
      </div>
    </SoalCard>
  );
}

// ── Contoh 7 (HOTS) ───────────────────────────────────────────────

function Contoh7() {
  const [totalSemua, setTotalSemua] = useState("");
  const [berdekatan, setBerdekatan] = useState("");
  const [totalAkhir, setTotalAkhir] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <SoalCard
      number="📝 Contoh 7 (HOTS)"
      title="Delapan siswa akan duduk mengelilingi meja bundar. Di antara mereka, Ari dan Budi berseteru dan tidak mau duduk berdekatan. Berapa banyak susunan tempat duduk yang mungkin?"
      onSave={() => setSaved(true)}
      saved={saved}
    >
      <p className="text-sm text-[#2C2C2A] mb-2">
        <b>Langkah Berpikir:</b> Gunakan <b>strategi komplemen</b>: Ari-Budi tidak berdekatan = Total semua − Ari-Budi berdekatan.
      </p>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-[#346739]">Total semua susunan:</p>
          <p className="text-sm text-[#2C2C2A]">
            P(siklis 8) = (8-1)! = 7! = ...
          </p>
          <AnswerTextArea value={totalSemua} onChange={setTotalSemua} rows={1} disabled={saved} placeholder="Hitung total..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Ari dan Budi berdekatan:</p>
          <p className="text-sm text-[#2C2C2A]">
            Gabung sebagai 1 blok → 7 objek disusun melingkar: P(siklis 7) = 6! = 720. Dalam blok: 2! = 2 cara.
          </p>
          <AnswerTextArea value={berdekatan} onChange={setBerdekatan} rows={1} disabled={saved} placeholder="Hitung susunan berdekatan..." />
        </div>
        <div>
          <p className="text-sm font-medium text-[#346739]">Komplemen:</p>
          <AnswerTextArea value={totalAkhir} onChange={setTotalAkhir} rows={1} disabled={saved} placeholder="Total = Total semua − Berdekatan = ..." />
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-[#DBFFD5]/30 px-3 py-2">
        <p className="text-xs text-[#346739]">
          💡 Strategi komplemen sangat efisien ketika syarat "tidak boleh" lebih mudah dihitung daripada syarat "harus".
        </p>
      </div>
    </SoalCard>
  );
}

// ============================================================================
// PART 5: MENGAPA? CORNER
// ============================================================================

function MengapaCorner() {
  return (
    <article>
      <SectionBadge>Mengapa? Corner</SectionBadge>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-3 text-lg font-bold text-[#346739]">💡 Mengapa urutan penting dalam permutasi?</h3>
        <p className="mb-4 leading-relaxed text-[#2C2C2A]">
          Pikirkan password "1234" vs "4321" — meski menggunakan angka yang sama, kedua password
          ini berbeda dan tidak saling membuka kunci. Dalam permutasi, <b>konteks menentukan apakah
          urutan bermakna</b>. Jabatan Ketua dan Sekretaris berbeda meski orangnya sama — itulah
          permutasi dalam kehidupan nyata.
        </p>

        <div className="rounded-lg border-2 border-[#C44F4F33] bg-[#C44F4F08] p-4">
          <p className="text-sm font-semibold text-[#C44F4F] mb-1">⚡ Tes cepat:</p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Tanya dirimu sendiri, <i>"Apakah urutan A-B dan B-A menghasilkan hasil yang berbeda?"</i>
            Jika YA → Permutasi. Jika TIDAK → bukan Permutasi.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// PART 6: REFLEKSI MINI
// ============================================================================

function RefleksiMini() {
  const [ref1, setRef1] = useState("");
  const [ref2, setRef2] = useState("");
  const [ref3, setRef3] = useState("");
  const [ref4, setRef4] = useState("");
  const [saved1, setSaved1] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [saved3, setSaved3] = useState(false);
  const [saved4, setSaved4] = useState(false);

  return (
    <article>
      <SectionBadge>Refleksi Mini</SectionBadge>

      <div className="rounded-xl bg-white p-5 space-y-4">
        <h3 className="text-lg font-bold text-[#346739]">✅ Pikirkan dan jawab:</h3>

        <SoalCard
          number="1"
          title="Apa yang membedakan permutasi dari sekadar menggunakan Kaidah Perkalian?"
          onSave={() => setSaved1(true)}
          saved={saved1}
        >
          <AnswerTextArea value={ref1} onChange={setRef1} rows={3} disabled={saved1} />
        </SoalCard>

        <SoalCard
          number="2"
          title="Kapan kita menggunakan rumus permutasi dengan unsur yang sama?"
          onSave={() => setSaved2(true)}
          saved={saved2}
        >
          <AnswerTextArea value={ref2} onChange={setRef2} rows={3} disabled={saved2} />
        </SoalCard>

        <SoalCard
          number="3"
          title="Kapan kita menggunakan rumus permutasi siklis?"
          onSave={() => setSaved3(true)}
          saved={saved3}
        >
          <AnswerTextArea value={ref3} onChange={setRef3} rows={3} disabled={saved3} />
        </SoalCard>

        <SoalCard
          number="4"
          title="Mengapa P(n,n) = n! ? Jelaskan secara intuitif."
          onSave={() => setSaved4(true)}
          saved={saved4}
        >
          <AnswerTextArea value={ref4} onChange={setRef4} rows={3} disabled={saved4} />
        </SoalCard>
      </div>

      <div className="border-b-2 border-[#34673966] mt-4" />
    </article>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export default function PermutasiContent() {
  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="mb-2">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#346739] opacity-70">
          Materi 4
        </p>
        <h1 className="text-2xl font-bold text-[#1a3d1c]">Permutasi</h1>
        <p className="mt-1 text-sm leading-relaxed text-[#5a7d5c]">
          Pelajari cara menghitung banyaknya susunan objek ketika urutan diperhatikan — dari
          permutasi dasar, permutasi dengan unsur sama, hingga permutasi siklis.
        </p>
      </div>

      {/* ── PART 1: Permutasi r dari n ───────────────────────────── */}
      <div className="mt-2 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
        <p className="text-sm font-semibold text-[#663362]">
          Bagian 1 — Permutasi r Unsur dari n Unsur
        </p>
      </div>
      <EksplorasiKontekstual1 />
      <AktivitasDeepLearning1 />
      <PenjelasanKonsep1 />

      {/* ── PART 2: Permutasi dengan Unsur yang Sama ─────────────── */}
      <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
        <p className="text-sm font-semibold text-[#663362]">
          Bagian 2 — Permutasi dengan Unsur yang Sama
        </p>
      </div>
      <EksplorasiKontekstual2 />
      <AktivitasDeepLearning2 />
      <PenjelasanKonsep2 />

      {/* ── PART 3: Permutasi Siklis ─────────────────────────────── */}
      <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
        <p className="text-sm font-semibold text-[#663362]">
          Bagian 3 — Permutasi Siklis
        </p>
      </div>
      <EksplorasiKontekstual3 />
      <AktivitasDeepLearning3 />
      <PenjelasanKonsep3 />

      {/* ── PART 4: Contoh Soal, Mengapa Corner, Refleksi ────────── */}
      <div className="mt-6 mb-4 rounded-lg bg-[#663362]/10 px-4 py-3">
        <p className="text-sm font-semibold text-[#663362]">
          Bagian 4 — Latihan & Refleksi
        </p>
      </div>
      <ContohSoalBertahap />
      <MengapaCorner />
      <RefleksiMini />

      {/* Selesai Banner */}
      <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-[#DBFFD5]/60 p-6 border border-[#34673926]">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="text-lg font-semibold text-[#1a3d1c]">
            Kamu sudah mempelajari seluruh materi Permutasi!
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#5a7d5c]">
            Lanjutkan mengerjakan Asesmen Formatif Materi Permutasi untuk menguji pemahamanmu.
          </p>
        </div>
      </div>
    </div>
  );
}

// Named exports for potential reuse
export {
  EksplorasiKontekstual1,
  AktivitasDeepLearning1,
  PenjelasanKonsep1,
  EksplorasiKontekstual2,
  AktivitasDeepLearning2,
  PenjelasanKonsep2,
  EksplorasiKontekstual3,
  AktivitasDeepLearning3,
  PenjelasanKonsep3,
  ContohSoalBertahap,
  MengapaCorner,
  RefleksiMini,
};
