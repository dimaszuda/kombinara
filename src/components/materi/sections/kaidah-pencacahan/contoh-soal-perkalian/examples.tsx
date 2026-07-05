// ============================================================================
// Contoh Soal — Kaidah Perkalian (Example Components)
// ============================================================================

import { Blank } from "../contoh-soal-bertahap/primitive";
import LicensePlateExplorer from "../LicensePlateExplorer";
import PinCodeExplorer from "../PinCodeExplorer";
import LineupWithConstraintExplorer from "../LineupWithConstraintExplorer";
import RestaurantMenuExplorer from "../RestaurantMenuExplorer";

// ============================================================================
// Types & Helpers
// ============================================================================

export type Feedback = "idle" | "correct" | "incorrect";
export type Results = Record<string, "correct" | "incorrect"> | null;

export function statusOf(results: Results, id: string): "idle" | "correct" | "incorrect" {
  return results?.[id] ?? "idle";
}

export function b(
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
// Contoh 1 — Mudah: Pelat Nomor Kendaraan
// ============================================================================

export const EXPECTED_PLAT = {
  kotak: "6",
  h1: "26",
  h2: "26",
  a1: "10",
  a2: "10",
  a3: "10",
  a4: "10",
  total: "6760000",
};

export function ExamplePlat({
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

      <LicensePlateExplorer />

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
// Contoh 2 — Sedang: Kode PIN 4 Digit Tanpa Pengulangan
// ============================================================================

export const EXPECTED_PIN = {
  k1: "10",
  k2: "9",
  k3: "8",
  k4: "7",
  total: "5040",
};

export function ExamplePIN({
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

      <PinCodeExplorer />

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
// Contoh 3 — Sedang: Foto Berjajar dengan Syarat Berdampingan
// ============================================================================

export const EXPECTED_FOTO = {
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

export function ExampleFoto({
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
        Ada 7 orang bersahabat terdiri dari 4 laki-laki dan 3 perempuan. Mereka bertujuh akan
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

      <LineupWithConstraintExplorer />

      <p className="text-sm italic text-[#34673999]">
        Sekarang visualisasikan dalam pengisian tempat!
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
// Contoh 4 — HOTS: Menu Restoran
// ============================================================================

export const EXPECTED_MENU = {
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

export function ExampleMenu({
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

      <RestaurantMenuExplorer />

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
// Contoh 5 — HOTS: Bilangan Ganjil 3 Digit &lt; 600
// ============================================================================

export const EXPECTED_BILANGAN = {
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

export function ExampleBilangan({
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
