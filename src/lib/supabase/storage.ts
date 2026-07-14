"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "E-Modul Kombinatorika";
const FILE_PATH = "MODUL PEMBELAJARAN MATEMATIKA.pdf";

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

/**
 * Generate signed URL untuk download file modul PDF dari Supabase Storage bucket private.
 *
 * @returns Signed URL string yang valid selama SIGNED_URL_EXPIRY_SECONDS detik.
 * @throws Error jika gagal generate signed URL (misal: user belum login, bucket tidak ditemukan, RLS bermasalah).
 */
export async function getModulDownloadUrl(): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(FILE_PATH, SIGNED_URL_EXPIRY_SECONDS);

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
