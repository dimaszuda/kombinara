/**
 * dashboard-excel.ts — Generate file Excel multi-sheet untuk dashboard guru.
 *
 * Dipakai client-side (dynamic import dari page guru/dashboard) sehingga tidak
 * boleh menyentuh Node API. Data yang diterima sudah dalam bentuk
 * "display-ready" (label & status sudah di-map ke bahasa Indonesia).
 */

import ExcelJS from "exceljs";

// ═══════════════════════════════════════════════════════════════
// Types — data display-ready dari halaman dashboard
// ═══════════════════════════════════════════════════════════════

export interface DashboardExportData {
  filename?: string;
  /** Info filter & tanggal export (ditampilkan di sheet Ringkasan) */
  info: { label: string; value: string }[];
  ringkasan: { metrik: string; nilai: number }[];
  gender: { gender: string; jumlah: number }[];
  distribusiKelas: { kelas: string; jumlah: number }[];
  daftarSiswa: { nama: string; kelas: string; tanggalJoin: string }[];
  progress: { nama: string; kelas: string; selesai: number; total: number; persen: number }[];
  diagNilai: { nilai: string; jumlahSiswa: number }[];
  diagStats: { mean: number; median: number; std: number; n: number } | null;
  diagDurasi: { nama: string; kelas: string; durasiMenit: number; nilai: number; status: string }[];
  diagPercobaan: { percobaan: string; jumlahSiswa: number }[];
  diagDetail: {
    nama: string;
    kelas: string;
    nilai: number;
    percobaan: number;
    durasiMenit: number;
    status: string;
    tanggalSubmit: string;
  }[];
  journeyPendahuluan: { nama: string; apersepsi: string; pemantik: string; refleksi: string }[];
  journeyMateri: {
    nama: string;
    konsep: string;
    eksplorasi: string;
    deepLearning: string;
    penjelasan: string;
    contohSoal: string;
    aktivitas: string;
    refleksi: string;
  }[];
  formNilai: { range: string; jumlahSiswa: number }[];
  formStats: { mean: number; median: number; std: number; n: number } | null;
  formDurasi: { nama: string; kelas: string; durasiMenit: number; nilai: number }[];
  formPercobaan: { percobaan: string; jumlah: number }[];
  formDetail: {
    nama: string;
    kelas: string;
    materi: string;
    nilai: number;
    percobaan: number;
    durasiMenit: number;
    status: string;
  }[];
  integritas: { nama: string; kelas: string; materi: string; jenisKejadian: string; jumlah: number }[];
}

interface SheetSpec {
  name: string;
  headers: string[];
  rows: (string | number)[][];
  /** Baris statistik opsional di bawah tabel (Mean, Median, dst.) */
  stats?: { label: string; value: string | number }[];
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const HEADER_FILL = "FF346739"; // COLORS.green
const HEADER_FONT = "FFFFFFFF";

const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;

function statsRows(stats: { mean: number; median: number; std: number; n: number } | null): { label: string; value: string | number }[] {
  if (!stats || stats.n === 0) return [];
  return [
    { label: "Mean", value: round2(stats.mean) },
    { label: "Median", value: round2(stats.median) },
    { label: "Std Deviasi", value: round2(stats.std) },
    { label: "Jumlah Siswa", value: stats.n },
  ];
}

function addTableSheet(wb: ExcelJS.Workbook, spec: SheetSpec): void {
  const sheet = wb.addWorksheet(spec.name);
  sheet.addRow(spec.headers);
  spec.rows.forEach((r) => sheet.addRow(r));
  if (spec.stats && spec.stats.length > 0) {
    sheet.addRow([]);
    spec.stats.forEach((s) => sheet.addRow([s.label, s.value]));
  }

  // ── Style header row ──
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: HEADER_FONT } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  header.height = 22;

  // ── Freeze header + auto filter ──
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: spec.headers.length },
  };

  // ── Auto column width ──
  const colCount = spec.headers.length;
  const widths: number[] = new Array<number>(colCount).fill(0);
  sheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const len = cell.value == null ? 0 : String(cell.value).length;
      widths[colNumber - 1] = Math.max(widths[colNumber - 1], len);
    });
  });
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = Math.min(42, Math.max(12, w + 3));
  });
}

// ═══════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════

export async function downloadDashboardExcel(data: DashboardExportData): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Kombinara";
  wb.created = new Date();

  // 1. Ringkasan (filter info + metrik)
  addTableSheet(wb, {
    name: "Ringkasan",
    headers: ["Item", "Nilai"],
    rows: [
      ...data.info.map((i): [string, string] => [i.label, i.value]),
      ...data.ringkasan.map((r): [string, number] => [r.metrik, r.nilai]),
    ],
  });

  // 2. Jenis kelamin
  addTableSheet(wb, {
    name: "Jenis Kelamin",
    headers: ["Jenis Kelamin", "Jumlah Siswa"],
    rows: data.gender.map((g): [string, number] => [g.gender, g.jumlah]),
  });

  // 3. Distribusi kelas
  addTableSheet(wb, {
    name: "Distribusi Kelas",
    headers: ["Kelas", "Jumlah Siswa"],
    rows: data.distribusiKelas.map((d): [string, number] => [d.kelas, d.jumlah]),
  });

  // 4. Daftar siswa
  addTableSheet(wb, {
    name: "Daftar Siswa",
    headers: ["Nama", "Kelas", "Tanggal Join"],
    rows: data.daftarSiswa.map((s): [string, string, string] => [s.nama, s.kelas, s.tanggalJoin]),
  });

  // 5. Progress belajar
  addTableSheet(wb, {
    name: "Progress Belajar",
    headers: ["Nama", "Kelas", "Selesai", "Total Bagian", "Progress (%)"],
    rows: data.progress.map((p): [string, string, number, number, number] => [p.nama, p.kelas, p.selesai, p.total, p.persen]),
  });

  // 6. Diagnostik — nilai
  addTableSheet(wb, {
    name: "Diag Nilai",
    headers: ["Nilai", "Jumlah Siswa"],
    rows: data.diagNilai.map((b): [string, number] => [b.nilai, b.jumlahSiswa]),
    stats: statsRows(data.diagStats),
  });

  // 7. Diagnostik — durasi vs nilai
  addTableSheet(wb, {
    name: "Diag Durasi",
    headers: ["Nama", "Kelas", "Durasi (menit)", "Nilai", "Status"],
    rows: data.diagDurasi.map((d): [string, string, number, number, string] => [
      d.nama,
      d.kelas,
      round1(d.durasiMenit),
      d.nilai,
      d.status,
    ]),
  });

  // 8. Diagnostik — distribusi percobaan
  addTableSheet(wb, {
    name: "Diag Percobaan",
    headers: ["Percobaan", "Jumlah Siswa"],
    rows: data.diagPercobaan.map((a): [string, number] => [a.percobaan, a.jumlahSiswa]),
  });

  // 9. Diagnostik — detail per siswa
  addTableSheet(wb, {
    name: "Diag Detail",
    headers: ["Nama", "Kelas", "Nilai", "Percobaan", "Durasi (menit)", "Status", "Tanggal Submit"],
    rows: data.diagDetail.map((d): [string, string, number, number, number, string, string] => [
      d.nama,
      d.kelas,
      d.nilai,
      d.percobaan,
      round1(d.durasiMenit),
      d.status,
      d.tanggalSubmit,
    ]),
  });

  // 10. Journey pendahuluan
  addTableSheet(wb, {
    name: "Journey Pendahuluan",
    headers: ["Nama", "Apersepsi", "Pemantik", "Refleksi"],
    rows: data.journeyPendahuluan.map((j): [string, string, string, string] => [j.nama, j.apersepsi, j.pemantik, j.refleksi]),
  });

  // 11. Journey materi
  addTableSheet(wb, {
    name: "Journey Materi",
    headers: ["Nama", "Konsep", "Eksplorasi", "Deep Learning", "Penjelasan Konsep", "Contoh Soal", "Aktivitas", "Refleksi Mini"],
    rows: data.journeyMateri.map((j): [string, string, string, string, string, string, string, string] => [
      j.nama,
      j.konsep,
      j.eksplorasi,
      j.deepLearning,
      j.penjelasan,
      j.contohSoal,
      j.aktivitas,
      j.refleksi,
    ]),
  });

  // 12. Formatif — nilai
  addTableSheet(wb, {
    name: "Formatif Nilai",
    headers: ["Range Nilai", "Jumlah Siswa"],
    rows: data.formNilai.map((b): [string, number] => [b.range, b.jumlahSiswa]),
    stats: statsRows(data.formStats),
  });

  // 13. Formatif — durasi vs nilai
  addTableSheet(wb, {
    name: "Formatif Durasi",
    headers: ["Nama", "Kelas", "Durasi (menit)", "Nilai"],
    rows: data.formDurasi.map((d): [string, string, number, number] => [d.nama, d.kelas, round1(d.durasiMenit), d.nilai]),
  });

  // 14. Formatif — distribusi percobaan
  addTableSheet(wb, {
    name: "Formatif Percobaan",
    headers: ["Percobaan", "Jumlah Siswa"],
    rows: data.formPercobaan.map((a): [string, number] => [a.percobaan, a.jumlah]),
  });

  // 15. Formatif — detail per siswa
  addTableSheet(wb, {
    name: "Formatif Detail",
    headers: ["Nama", "Kelas", "Materi", "Nilai", "Percobaan", "Durasi (menit)", "Status"],
    rows: data.formDetail.map((d): [string, string, string, number, number, number, string] => [
      d.nama,
      d.kelas,
      d.materi,
      d.nilai,
      d.percobaan,
      round1(d.durasiMenit),
      d.status,
    ]),
  });

  // 16. Integritas
  addTableSheet(wb, {
    name: "Integritas",
    headers: ["Nama", "Kelas", "Materi", "Jenis Kejadian", "Jumlah"],
    rows: data.integritas.map((i): [string, string, string, string, number] => [
      i.nama,
      i.kelas,
      i.materi,
      i.jenisKejadian,
      i.jumlah,
    ]),
  });

  // ── Generate & trigger download di browser ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = data.filename ?? "dashboard-guru.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
