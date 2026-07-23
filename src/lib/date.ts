/**
 * GMT+7 (Asia/Jakarta) timestamp utilities.
 *
 * Semua timestamp yang disimpan ke database HARUS menggunakan GMT+7
 * agar akurat merepresentasikan waktu siswa mengirim jawaban.
 *
 * Kenapa tidak bisa mengandalkan new Date() atau NOW()?
 * - new Date().toISOString() selalu mengembalikan UTC (Zulu time)
 * - PostgreSQL NOW() mengikuti timezone server (biasanya UTC)
 * - Kolom TIMESTAMP WITHOUT TIME ZONE menyimpan nilai apa adanya
 *
 * Dengan menambahkan offset +7 jam, timestamp yang tersimpan
 * akan sesuai dengan waktu WIB (GMT+7).
 */

const GMT7_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 jam dalam milidetik

/**
 * Mengembalikan Date object yang sudah di-offset ke GMT+7.
 * Gunakan ini untuk Prisma create/update calls.
 *
 * @example
 * await prisma.aktivitasSiswaEntry.create({
 *   data: { ..., submittedAt: gmt7Now() }
 * });
 */
export function gmt7Now(): Date {
  return new Date(Date.now() + GMT7_OFFSET_MS);
}

/**
 * Mengembalikan ISO 8601 string dengan offset GMT+7.
 * Gunakan ini untuk Supabase client calls (insert/update raw).
 *
 * Format: "2026-07-16T15:30:00.000+07:00"
 *
 * @param timestampMs — optional epoch milliseconds (default: Date.now())
 *
 * @example
 * const { error } = await supabase.from("diagnostic_attempts").update({
 *   submitted_at: toGMT7ISO()
 * });
 */
export function toGMT7ISO(timestampMs?: number): string {
  const gmt7Time = new Date((timestampMs ?? Date.now()) + GMT7_OFFSET_MS);
  const year = gmt7Time.getUTCFullYear();
  const month = String(gmt7Time.getUTCMonth() + 1).padStart(2, "0");
  const day = String(gmt7Time.getUTCDate()).padStart(2, "0");
  const hours = String(gmt7Time.getUTCHours()).padStart(2, "0");
  const minutes = String(gmt7Time.getUTCMinutes()).padStart(2, "0");
  const seconds = String(gmt7Time.getUTCSeconds()).padStart(2, "0");
  const ms = String(gmt7Time.getUTCMilliseconds()).padStart(3, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}+07:00`;
}

/**
 * Mengembalikan timestamp SQL literal untuk GMT+7 saat ini.
 * Gunakan ini untuk raw SQL INSERT/UPDATE via Prisma $executeRaw.
 *
 * Format: "2026-07-16 15:30:00.000+07:00"
 *
 * @example
 * await prisma.$executeRaw`
 *   INSERT INTO contoh_soal_bertahap_attempts (..., submitted_at)
 *   VALUES (..., ${toGMT7SQL()}::timestamptz)
 * `;
 */
export function toGMT7SQL(): string {
  const now = new Date();
  const gmt7Time = new Date(now.getTime() + GMT7_OFFSET_MS);
  const year = gmt7Time.getUTCFullYear();
  const month = String(gmt7Time.getUTCMonth() + 1).padStart(2, "0");
  const day = String(gmt7Time.getUTCDate()).padStart(2, "0");
  const hours = String(gmt7Time.getUTCHours()).padStart(2, "0");
  const minutes = String(gmt7Time.getUTCMinutes()).padStart(2, "0");
  const seconds = String(gmt7Time.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+07:00`;
}

/**
 * Format Date ke "DD Month YYYY" (Bahasa Indonesia).
 * Mirip dengan PostgreSQL TO_CHAR(date, 'DD FMMonth YYYY').
 *
 * @example formatTanggal(new Date("2026-07-15")) → "15 Juli 2026"
 */
export function formatTanggal(date: Date): string {
  const MONTHS_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
