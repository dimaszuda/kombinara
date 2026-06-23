// ============================================================================
// Contoh Soal — Kaidah Penjumlahan (Example Components)
// ============================================================================

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
