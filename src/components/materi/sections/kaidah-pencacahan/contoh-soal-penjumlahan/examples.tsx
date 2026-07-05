"use client";
// ============================================================================
// Contoh Soal — Kaidah Penjumlahan (Example Components)
// ============================================================================

import { useState } from "react";
import { Blank } from "../contoh-soal-bertahap/primitive";

// ============================================================================
// Types & Helpers
// ============================================================================

export type Feedback = "idle" | "correct" | "incorrect";
export type Results = Record<string, "correct" | "incorrect"> | null;

export function statusOf(results: Results, id: string): "idle" | "correct" | "incorrect" {
  return results?.[id] ?? "idle";
}

// ============================================================================
// Picker: Minuman (Contoh 1)
// ============================================================================

const DRINK_GROUPS = [
  {
    key: "panas",
    label: "4 Minuman Panas",
    emoji: "☕",
    items: [
      { id: "teh-panas", label: "Teh Panas" },
      { id: "kopi-panas", label: "Kopi Panas" },
      { id: "susu-panas", label: "Susu Panas" },
      { id: "cokelat-panas", label: "Cokelat" },
    ],
  },
  {
    key: "dingin",
    label: "6 Minuman Dingin",
    emoji: "🧊",
    items: [
      { id: "es-teh", label: "Es Teh" },
      { id: "es-jeruk", label: "Es Jeruk" },
      { id: "es-susu", label: "Es Susu" },
      { id: "jus-mangga", label: "Jus Mangga" },
      { id: "soda", label: "Soda" },
      { id: "air-mineral", label: "Air Mineral" },
    ],
  },
];

function DrinkChoicePicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickCount, setPickCount] = useState(0);
  const revealed = pickCount >= 3;

  const selectedItem = DRINK_GROUPS
    .flatMap((g) => g.items.map((item) => ({ ...item, emoji: g.emoji })))
    .find((item) => item.id === selectedId);

  function handlePick(id: string) {
    if (revealed || id === selectedId) return;
    setSelectedId(id);
    setPickCount((c) => c + 1);
  }

  function handleReset() {
    setSelectedId(null);
    setPickCount(0);
  }

  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">
      <p className="mb-3 text-sm font-medium text-[#2C2C2A]">👇 Pilih minuman yang ingin kamu pesan</p>
      <div className="flex flex-wrap justify-center gap-5">
        {DRINK_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-medium text-[#663362]">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => handlePick(item.id)}
                    className={[
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-200",
                      isSelected
                        ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
                        : revealed
                          ? "border-[#34673933] opacity-40 cursor-default"
                          : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
                    ].join(" ")}
                  >
                    <span className="text-2xl">{group.emoji}</span>
                    <span className="max-w-[56px] text-center text-[11px] font-medium text-[#2C2C2A]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && !revealed && (
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Kamu memilih{" "}
          <span className="font-semibold text-[#346739]">{selectedItem.label}</span>.
          {pickCount < 3 && (
            <> Coba pilih minuman lain juga!{" "}
              <span className="text-[#663362]">({3 - pickCount} pilihan lagi)</span>
            </>
          )}
        </p>
      )}

      {revealed && (
        <div className="mt-3 rounded-lg border border-[#34673940] bg-[#DBFFD5]/60 p-3">
          <p className="text-sm font-semibold text-[#346739]">💡 Coba deh pikirkan</p>
          <p className="mt-1 text-sm leading-relaxed text-[#2C2C2A]">
            Setiap kali pesan, kamu hanya bisa pilih <b>satu</b> minuman saja kan? Tidak bisa
            memesan minuman panas <b>dan</b> dingin sekaligus. Jadi, dari{" "}
            <b>4 minuman panas</b> ditambah <b>6 minuman dingin</b>, kira-kira ada berapa
            total pilihan minuman yang tersedia?
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-white active:scale-95"
          >
            Mulai ulang dari awal
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Picker: Buku (Contoh 2)
// ============================================================================

const BOOK_GROUPS = [
  {
    key: "novel",
    label: "12 Novel",
    emoji: "📖",
    items: [
      { id: "novel-1", label: "Laskar Pelangi" },
      { id: "novel-2", label: "Bumi Manusia" },
      { id: "novel-3", label: "Dilan" },
      { id: "novel-4", label: "Sang Pemimpi" },
      { id: "novel-5", label: "Sirkus Pohon" },
      { id: "novel-6", label: "Negeri 5 Menara" },
      { id: "novel-7", label: "Perahu Kertas" },
      { id: "novel-8", label: "Supernova" },
      { id: "novel-9", label: "Ayat-Ayat Cinta" },
      { id: "novel-10", label: "Edensor" },
      { id: "novel-11", label: "Maryamah Karpov" },
      { id: "novel-12", label: "Bidadari Surga" },
    ],
  },
  {
    key: "sains",
    label: "8 Buku Sains",
    emoji: "🔬",
    items: [
      { id: "sains-1", label: "Fisika Dasar" },
      { id: "sains-2", label: "Kimia Organik" },
      { id: "sains-3", label: "Biologi Sel" },
      { id: "sains-4", label: "Matematika" },
      { id: "sains-5", label: "Astronomi" },
      { id: "sains-6", label: "Geologi" },
      { id: "sains-7", label: "Ekologi" },
      { id: "sains-8", label: "Genetika" },
    ],
  },
  {
    key: "komik",
    label: "5 Komik",
    emoji: "🎭",
    items: [
      { id: "komik-1", label: "Naruto" },
      { id: "komik-2", label: "One Piece" },
      { id: "komik-3", label: "Dragon Ball" },
      { id: "komik-4", label: "Detective Conan" },
      { id: "komik-5", label: "Doraemon" },
    ],
  },
];

function BookChoicePicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickCount, setPickCount] = useState(0);
  const revealed = pickCount >= 3;

  const selectedItem = BOOK_GROUPS
    .flatMap((g) => g.items.map((item) => ({ ...item, emoji: g.emoji })))
    .find((item) => item.id === selectedId);

  function handlePick(id: string) {
    if (revealed || id === selectedId) return;
    setSelectedId(id);
    setPickCount((c) => c + 1);
  }

  function handleReset() {
    setSelectedId(null);
    setPickCount(0);
  }

  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">
      <p className="mb-3 text-sm font-medium text-[#2C2C2A]">👇 Pilih 1 buku yang ingin kamu pinjam</p>
      <div className="flex flex-col gap-4">
        {BOOK_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-medium text-[#663362]">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => handlePick(item.id)}
                    className={[
                      "flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 transition-all duration-200",
                      isSelected
                        ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
                        : revealed
                          ? "border-[#34673933] opacity-40 cursor-default"
                          : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
                    ].join(" ")}
                  >
                    <span className="text-base">{group.emoji}</span>
                    <span className="text-[11px] font-medium text-[#2C2C2A]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && !revealed && (
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Kamu memilih{" "}
          <span className="font-semibold text-[#346739]">
            {selectedItem.emoji} {selectedItem.label}
          </span>.
          {pickCount < 3 && (
            <> Coba pilih buku lain juga!{" "}
              <span className="text-[#663362]">({3 - pickCount} pilihan lagi)</span>
            </>
          )}
        </p>
      )}

      {revealed && (
        <div className="mt-3 rounded-lg border border-[#34673940] bg-[#DBFFD5]/60 p-3">
          <p className="text-sm font-semibold text-[#346739]">💡 Coba deh pikirkan</p>
          <p className="mt-1 text-sm leading-relaxed text-[#2C2C2A]">
            Setiap kunjungan, kamu hanya boleh pinjam <b>satu buku</b> saja kan? Tidak bisa
            ambil novel <b>dan</b> buku sains <b>dan</b> komik sekaligus. Jadi, dari{" "}
            <b>12 novel</b>, <b>8 buku sains</b>, dan <b>5 komik</b>, kira-kira ada berapa
            total buku yang bisa kamu pilih untuk dipinjam?
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-white active:scale-95"
          >
            Mulai ulang dari awal
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Picker: Rute ke Sekolah (Contoh 3)
// ============================================================================

const ROUTE_GROUPS = [
  {
    key: "jalan-kaki",
    label: "2 Rute Jalan Kaki",
    emoji: "🚶",
    items: [
      { id: "jalan-kaki-1", label: "Rute Depan" },
      { id: "jalan-kaki-2", label: "Rute Belakang" },
    ],
  },
  {
    key: "ojek",
    label: "3 Ojek Online",
    emoji: "🛵",
    items: [
      { id: "ojek-1", label: "Gojek" },
      { id: "ojek-2", label: "Grab" },
      { id: "ojek-3", label: "inDrive" },
    ],
  },
  {
    key: "angkot",
    label: "4 Trayek Angkot",
    emoji: "🚌",
    items: [
      { id: "angkot-1", label: "Trayek A" },
      { id: "angkot-2", label: "Trayek B" },
      { id: "angkot-3", label: "Trayek C" },
      { id: "angkot-4", label: "Trayek D" },
    ],
  },
];

function TransportChoicePicker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickCount, setPickCount] = useState(0);
  const revealed = pickCount >= 3;

  const selectedItem = ROUTE_GROUPS
    .flatMap((g) => g.items.map((item) => ({ ...item, emoji: g.emoji })))
    .find((item) => item.id === selectedId);

  function handlePick(id: string) {
    if (revealed || id === selectedId) return;
    setSelectedId(id);
    setPickCount((c) => c + 1);
  }

  function handleReset() {
    setSelectedId(null);
    setPickCount(0);
  }

  return (
    <div className="rounded-xl border border-[#34673933] bg-white p-4">
      <p className="mb-3 text-sm font-medium text-[#2C2C2A]">👇 Pilih cara Andi berangkat ke sekolah</p>
      <div className="flex flex-wrap justify-center gap-5">
        {ROUTE_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-medium text-[#663362]">{group.label}</p>
            <div className="flex gap-2">
              {group.items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => handlePick(item.id)}
                    className={[
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-200",
                      isSelected
                        ? "border-[#346739] bg-[#DBFFD5] scale-105 shadow-sm"
                        : revealed
                          ? "border-[#34673933] opacity-40 cursor-default"
                          : "border-[#34673933] hover:border-[#346739] hover:bg-[#DBFFD540] cursor-pointer",
                    ].join(" ")}
                  >
                    <span className="text-2xl">{group.emoji}</span>
                    <span className="text-[11px] font-medium text-[#2C2C2A]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && !revealed && (
        <p className="mt-3 text-sm leading-relaxed text-[#2C2C2A]">
          Andi memilih{" "}
          <span className="font-semibold text-[#346739]">
            {selectedItem.emoji} {selectedItem.label}
          </span>.
          {pickCount < 3 && (
            <> Coba pilih cara lain juga!{" "}
              <span className="text-[#663362]">({3 - pickCount} pilihan lagi)</span>
            </>
          )}
        </p>
      )}

      {revealed && (
        <div className="mt-3 rounded-lg border border-[#34673940] bg-[#DBFFD5]/60 p-3">
          <p className="text-sm font-semibold text-[#346739]">💡 Coba deh pikirkan</p>
          <p className="mt-1 text-sm leading-relaxed text-[#2C2C2A]">
            Andi hanya bisa pakai <b>satu cara</b> berangkat ke sekolah kan? Tidak bisa
            jalan kaki <b>dan</b> naik ojek <b>dan</b> naik angkot sekaligus. Jadi, dari{" "}
            <b>2 rute jalan kaki</b>, <b>3 ojek online</b>, dan <b>4 trayek angkot</b>,
            kira-kira ada berapa total cara Andi bisa berangkat ke sekolah?
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 rounded-full border border-[#346739] px-4 py-1.5 text-sm font-medium text-[#346739] transition-colors hover:bg-white active:scale-95"
          >
            Mulai ulang dari awal
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Contoh 1: Minuman
// ============================================================================

export const EXPECTED_DRINKS = { jawab: "tidak", total: "10", final: "10" };

export function ExampleDrinks({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  results: Results;
}) {
  return (
    <>
      <p className="text-justify leading-relaxed">
        Di kantin sekolah tersedia 4 jenis minuman panas dan 6 jenis minuman dingin. Berapa
        banyak pilihan minuman yang tersedia jika seseorang hanya memilih satu minuman?
      </p>

      <DrinkChoicePicker />

      <div className="rounded-lg bg-white p-4">
        <p className="mb-2 text-sm font-medium">
          Apakah seseorang memilih minuman panas DAN dingin sekaligus?
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Jawab:</span>
          <Blank
            value={values.jawab ?? ""}
            onChange={(v) => onChange("jawab", v)}
            status={statusOf(results, "jawab")}
          />
          <span className="text-sm">Alasan:</span>
          <input
            type="text"
            value={values.alasan ?? ""}
            onChange={(e) => onChange("alasan", e.target.value)}
            placeholder="Tulis alasanmu..."
            className="min-w-[160px] flex-1 rounded-md border border-[#34673933] px-3 py-1.5 text-sm placeholder:text-[#34673966]"
          />
        </div>
      </div>

      <p className="text-sm italic text-[#34673999]">
        Ini berarti kejadian saling lepas maka gunakan kaidah penjumlahan.
      </p>

      <p className="leading-relaxed">
        Total = 4 + 6 ={" "}
        <Blank value={values.total ?? ""} onChange={(v) => onChange("total", v)} status={statusOf(results, "total")} />{" "}
        pilihan minuman
      </p>
      <p className="leading-relaxed">
        Jadi ada{" "}
        <Blank value={values.final ?? ""} onChange={(v) => onChange("final", v)} status={statusOf(results, "final")} />{" "}
        pilihan minuman yang dapat dipilih/dipesan.
      </p>
    </>
  );
}

// ============================================================================
// Contoh 2: Buku
// ============================================================================

export const EXPECTED_BOOKS = { b2: "8", b3: "5", total: "25", final: "25" };

export function ExampleBooks({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  results: Results;
}) {
  return (
    <>
      <p className="text-justify leading-relaxed">
        Perpustakaan memiliki 12 novel, 8 buku sains, dan 5 komik. Seorang siswa ingin meminjam
        tepat 1 buku. Berapa banyak pilihan yang tersedia?
      </p>

      <BookChoicePicker />

      <p className="text-sm italic text-[#34673999]">
        Siswa memilih novel ATAU buku sains ATAU komik &rarr; tiga kejadian saling lepas.
      </p>

      <p className="leading-relaxed">
        Total = 12 +{" "}
        <Blank value={values.b2 ?? ""} onChange={(v) => onChange("b2", v)} status={statusOf(results, "b2")} />{" "}
        +{" "}
        <Blank value={values.b3 ?? ""} onChange={(v) => onChange("b3", v)} status={statusOf(results, "b3")} />{" "}
        ={" "}
        <Blank value={values.total ?? ""} onChange={(v) => onChange("total", v)} status={statusOf(results, "total")} />{" "}
        pilihan
      </p>
      <p className="leading-relaxed">
        Jadi ada{" "}
        <Blank value={values.final ?? ""} onChange={(v) => onChange("final", v)} status={statusOf(results, "final")} />{" "}
        pilihan buku yang dapat dipilih/dipinjam.
      </p>
    </>
  );
}

// ============================================================================
// Contoh 3: Rute Andi
// ============================================================================

export const EXPECTED_TRANSPORT = {
  t1Jalan: "2",
  t1Ojek: "3",
  t1Angkot: "4",
  t1Total: "9",
  t1Final: "9",
  t2Prev: "9",
  t2Minus: "9",
  t2JalanKaki: "2",
  t2CalcTotal: "9",
  t2CalcJalanKaki: "2",
  t2Result: "7",
  t2Final: "7",
};

export function ExampleTransport({
  values,
  onChange,
  results,
}: {
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  results: Results;
}) {
  const b = (id: string) => (
    <Blank
      value={values[id] ?? ""}
      onChange={(v) => onChange(id, v)}
      status={statusOf(results, id)}
    />
  );

  return (
    <>
      <p className="text-justify leading-relaxed">
        Andi akan pergi dari rumah ke sekolah. Ia bisa memilih salah satu dari tiga moda
        transportasi: jalan kaki (2 rute berbeda), naik ojek online (3 pilihan aplikasi), atau
        naik angkot (4 trayek yang melewati sekolahnya).
      </p>

      <TransportChoicePicker />

      <div className="rounded-lg bg-white p-4">
        <p className="mb-2 font-medium">1. Berapa banyak cara Andi bisa pergi ke sekolah?</p>
        <p className="text-sm italic text-[#34673999]">
          Andi memilih jalan kaki atau naik ojek online atau naik angkot &rarr; 3 kejadian
          saling lepas.
        </p>
        <p className="leading-relaxed">
          Total: {b("t1Jalan")} + {b("t1Ojek")} + {b("t1Angkot")} = {b("t1Total")}
        </p>
        <p className="leading-relaxed">Jadi ada {b("t1Final")} cara Andi pergi ke sekolah.</p>
      </div>

      <div className="rounded-lg bg-white p-4">
        <p className="mb-2 font-medium">
          2. Ternyata hari ini hujan deras. Andi memutuskan tidak jalan kaki. Berapa cara yang
          tersisa?
        </p>
        <p className="leading-relaxed">
          Banyak cara Andi berangkat ke sekolah sebelumnya total {b("t2Prev")} cara
        </p>
        <p className="leading-relaxed">
          Karena Andi tidak jalan kaki maka total {b("t2Minus")} dikurangi banyak cara Andi
          jalan kaki yaitu {b("t2JalanKaki")} cara
        </p>
        <p className="leading-relaxed">
          Banyak cara Andi berangkat ke sekolah naik ojek online atau naik angkot adalah total
          &ndash; jalan kaki = {b("t2CalcTotal")} - {b("t2CalcJalanKaki")} = {b("t2Result")}
        </p>
        <p className="leading-relaxed">Jadi ada {b("t2Final")} cara Andi berangkat sekolah.</p>
      </div>
    </>
  );
}
