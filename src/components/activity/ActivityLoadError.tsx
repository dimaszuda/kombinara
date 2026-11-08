"use client";

/** Pesan saat jawaban aktivitas gagal disimpan (koneksi putus atau server error). */
export const SAVE_FAILED_TEXT = "⚠️ Jawabanmu gagal disimpan. Periksa koneksi internetmu, lalu simpan lagi.";

/**
 * Ditampilkan bila jawaban aktivitas yang sudah tersimpan gagal dimuat. Tanpa ini halaman tampil kosong
 * seolah belum pernah dikerjakan, dan siswa mengulang dari awal tanpa tahu.
 */
export default function ActivityLoadError() {
  return (
    <div role="alert" className="my-6 rounded-xl border border-danger-200 bg-danger-50 p-4">
      <p className="text-sm font-semibold text-danger-strong">Jawabanmu yang sudah tersimpan gagal dimuat.</p>
      <p className="mt-1 text-sm text-ink">
        Muat ulang halaman ini sebelum lanjut, supaya kamu tidak mengerjakan ulang dari awal.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
      >
        Muat ulang
      </button>
    </div>
  );
}
