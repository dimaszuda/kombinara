"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "E-Modul Kombinatorika";

/**
 * Expiry duration for the signed URL in seconds.
 * 300 detik (5 menit) cukup untuk:
 * - User mengklik tombol download
 * - Browser memulai download
 * - Tidak terlalu lama sehingga URL expired sebelum digunakan
 * - Tidak terlalu pendek sehingga user dengan koneksi lambat masih bisa download
 *
 * Setiap kali tombol diklik, signed URL baru digenerate.
 * URL lama otomatis expired setelah 5 menit.
 */
const SIGNED_URL_EXPIRY_SECONDS = 300;

/** File paths untuk masing-masing modul yang bisa di-download. */
export const DOWNLOADABLE_FILES = {
  pendahuluan: "Pendahuluan Modul.pdf",
  "kaidah-pencacahan": "Kaidah Pencacahan.pdf",
  faktorial: "Faktorial.pdf",
  permutasi: "Permutasi.pdf",
  kombinasi: "Kombinasi.pdf",
  "bagian-akhir": "Bagian Akhir Modul.pdf",
} as const;

export type DownloadableFileKey = keyof typeof DOWNLOADABLE_FILES;

/**
 * Generate signed URL untuk download file modul PDF dari Supabase Storage bucket private.
 *
 * @param fileKey - Key file yang akan di-download (lihat {@link DOWNLOADABLE_FILES}).
 * @returns Signed URL string yang valid selama SIGNED_URL_EXPIRY_SECONDS detik.
 * @throws Error jika gagal generate signed URL (misal: user belum login, bucket tidak ditemukan, RLS bermasalah).
 */
export async function getModulDownloadUrl(fileKey: DownloadableFileKey): Promise<string> {
  const filePath = DOWNLOADABLE_FILES[fileKey];
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    throw new Error(
      `Gagal generate signed URL: ${error.message}`
    );
  }

  if (!data?.signedUrl) {
    throw new Error("Signed URL tidak tersedia dalam response Supabase.");
  }

  return data.signedUrl;
}
