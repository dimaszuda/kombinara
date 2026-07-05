"use client";

import { useState, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const TARGET_ORDERS = 3;

const MAKANAN = [
  { id: "nasi-goreng", label: "Nasi Goreng", src: "PLACEHOLDER_SRC_MAKANAN_1" },
  { id: "mie-ayam", label: "Mie Ayam", src: "PLACEHOLDER_SRC_MAKANAN_2" },
  { id: "sate-ayam", label: "Sate Ayam", src: "PLACEHOLDER_SRC_MAKANAN_3" },
  { id: "ayam-bakar", label: "Ayam Bakar", src: "PLACEHOLDER_SRC_MAKANAN_4" },
];

const MINUMAN = [
  { id: "es-teh", label: "Es Teh", src: "PLACEHOLDER_SRC_MINUMAN_1" },
  { id: "es-jeruk", label: "Es Jeruk", src: "PLACEHOLDER_SRC_MINUMAN_2" },
  { id: "jus-alpukat", label: "Jus Alpukat", src: "PLACEHOLDER_SRC_MINUMAN_3" },
];

const DESSERT = [
  { id: "puding", label: "Puding Cokelat", src: "PLACEHOLDER_SRC_DESSERT_1" },
  { id: "es-krim", label: "Es Krim Vanilla", src: "PLACEHOLDER_SRC_DESSERT_2" },
];

const SKIP_MINUMAN = { id: "__skip_minum__", label: "Tidak pakai minuman", isSkip: true };
const SKIP_DESSERT = { id: "__skip_desert__", label: "Tidak pakai dessert", isSkip: true };

// ── Helpers ───────────────────────────────────────────────────────────────────
function orderKey(makananId, minumanId, dessertId) {
  return `${makananId}::${minumanId}::${dessertId}`;
}

function orderLabel(makananId, minumanId, dessertId) {
  const m = MAKANAN.find((x) => x.id === makananId);
  const mn = [...MINUMAN, SKIP_MINUMAN].find((x) => x.id === minumanId);
  const ds = [...DESSERT, SKIP_DESSERT].find((x) => x.id === dessertId);
  return {
    makanan: m?.label ?? "?",
    minuman: mn?.label ?? "?",
    dessert: ds?.label ?? "?",
  };
}

// ── MenuCard ──────────────────────────────────────────────────────────────────
// Kartu menu dengan gambar placeholder aspect-square.
// State terpilih di-highlight border hijau + scale.
// Kartu "Tidak pakai..." ditampilkan dengan background netral tanpa gambar,
// tapi ukurannya disamakan dengan kartu bergambar agar sejajar.
function MenuCard({ item, selected, onClick }) {
  const isSkip = item.isSkip;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group flex flex-col overflow-hidden rounded-lg border transition-all duration-200
        ${selected
          ? "border-2 border-[#346739] scale-105 shadow-md"
          : "border border-[#34673933] hover:border-[#346739]/50"
        }
        ${isSkip ? "bg-[#F1EFE8]" : "bg-white"}
      `}
    >
      {/* Gambar / area kosong untuk skip */}
      {isSkip ? (
        <div className="flex aspect-square w-full items-center justify-center">
          <div className="flex flex-col items-center gap-1 px-2 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2C2C2A"
              strokeWidth="1.5"
              className="opacity-30"
            >
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
            <span className="text-xs font-medium leading-tight text-[#2C2C2A]/60">
              {item.label}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* TODO: ganti src */}
          <div className="aspect-square w-full overflow-hidden bg-[#DBFFD5]/30">
            <img
              src={item.src}
              alt={item.label}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="px-2 py-2 text-center">
            <span className="text-sm font-medium text-[#2C2C2A]">{item.label}</span>
          </div>
        </>
      )}
    </button>
  );
}

// ── CategorySection ───────────────────────────────────────────────────────────
function CategorySection({ title, subtitle, items, skipItem, selected, onSelect }) {
  // Gabungkan items biasa + item skip (jika ada)
  const allItems = skipItem ? [...items, skipItem] : items;

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#346739]">{title}</p>
        {subtitle && (
          <p className="text-xs text-[#2C2C2A]/50">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            selected={selected === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── OrderReceipt ──────────────────────────────────────────────────────────────
// Tampilan struk pesanan sederhana — hanya muncul jika makanan sudah dipilih.
function OrderReceipt({ makananId, minumanId, dessertId }) {
  if (!makananId) return null;

  const { makanan, minuman, dessert } = orderLabel(makananId, minumanId, dessertId);

  return (
    <div className="rounded-xl border border-dashed border-[#346739]/40 bg-[#F4FBF4] px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#346739]">
        Pesanan kamu:
      </p>
      <div className="space-y-1.5 text-sm text-[#2C2C2A]">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">🍽</span>
          <span className="font-medium">{makanan}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">🥤</span>
          <span>{minuman}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">🍰</span>
          <span>{dessert}</span>
        </div>
      </div>
      <div className="mt-2 border-t border-[#346739]/15 pt-1.5 text-xs text-[#2C2C2A]/50">
        Klik &ldquo;Pesan lagi&rdquo; buat kombinasi berbeda
      </div>
    </div>
  );
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function RestaurantMenuExplorer() {
  const [makanan, setMakanan] = useState(null);
  const [minuman, setMinuman] = useState(null);
  const [dessert, setDessert] = useState(null);
  const [history, setHistory] = useState([]);
  const [showClosing, setShowClosing] = useState(false);

  const makananReady = makanan !== null;

  const handleSave = useCallback(() => {
    if (!makananReady) return;
    const key = orderKey(makanan, minuman, dessert);
    if (history.includes(key)) return; // duplikat → abaikan diam-diam
    const entry = {
      key,
      makanan,
      minuman,
      dessert,
      label: orderLabel(makanan, minuman, dessert),
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    // Reset pilihan untuk pesanan berikutnya
    setMakanan(null);
    setMinuman(null);
    setDessert(null);
    if (newHistory.length >= TARGET_ORDERS) {
      setShowClosing(true);
    }
  }, [makananReady, makanan, minuman, dessert, history]);

  const handleReset = useCallback(() => {
    setMakanan(null);
    setMinuman(null);
    setDessert(null);
    setHistory([]);
    setShowClosing(false);
  }, []);

  return (
    <div className="rounded-xl bg-white p-4 border border-[#34673933] space-y-5">
      {/* Header */}
      <p className="text-xs font-medium text-[#663362]">
        🍽 Eksplorasi: Rakit Pesanan Restoran
      </p>

      <p className="text-sm leading-relaxed text-[#2C2C2A]">
        Pilih satu makanan utama (wajib), lalu pilih minuman dan dessert — atau pilih
        &ldquo;Tidak pakai...&rdquo; kalau kamu nggak mau. Perhatikan bahwa &ldquo;tidak
        pakai&rdquo; itu juga salah satu pilihan yang sah, lho!
      </p>

      {/* Kategori 1: Makanan Utama */}
      <CategorySection
        title="1. Makanan Utama"
        subtitle="Wajib pilih 1"
        items={MAKANAN}
        selected={makanan}
        onSelect={setMakanan}
      />

      {/* Kategori 2: Minuman */}
      <CategorySection
        title="2. Minuman"
        subtitle="Boleh pilih 1 — atau tidak pilih"
        items={MINUMAN}
        skipItem={SKIP_MINUMAN}
        selected={minuman}
        onSelect={setMinuman}
      />

      {/* Kategori 3: Dessert */}
      <CategorySection
        title="3. Dessert"
        subtitle="Boleh pilih 1 — atau tidak pilih"
        items={DESSERT}
        skipItem={SKIP_DESSERT}
        selected={dessert}
        onSelect={setDessert}
      />

      {/* Struk pesanan (muncul jika makanan sudah dipilih) */}
      {makananReady && (
        <OrderReceipt
          makananId={makanan}
          minumanId={minuman}
          dessertId={dessert}
        />
      )}

      {/* Tombol pesan lagi + simpan */}
      {makananReady && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#346739] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362]"
          >
            Pesan lagi dengan kombinasi lain →
          </button>
        </div>
      )}

      {/* Progress */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#663362]">
            Riwayat pesanan ({history.length}/{TARGET_ORDERS}):
          </p>
          <div className="h-1.5 w-full rounded-full bg-[#34673920]">
            <div
              className="h-1.5 rounded-full bg-[#346739] transition-all duration-500"
              style={{ width: `${(history.length / TARGET_ORDERS) * 100}%` }}
            />
          </div>
          <div className="space-y-1 pt-1">
            {history.map((entry, idx) => (
              <div
                key={entry.key}
                className="flex items-center gap-2 rounded-lg border border-[#346739]/10 bg-[#346739]/5 px-3 py-1.5 text-xs text-[#2C2C2A]"
              >
                <span className="font-medium text-[#2C2C2A]/30">#{idx + 1}</span>
                <span className="font-medium">{entry.label.makanan}</span>
                <span className="text-[#2C2C2A]/30">|</span>
                <span>{entry.label.minuman}</span>
                <span className="text-[#2C2C2A]/30">|</span>
                <span>{entry.label.dessert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teks penutup */}
      {showClosing && (
        <div className="rounded-xl border border-[#34673933] bg-[#F4FBF4] p-4 space-y-3">
          <p className="text-sm font-semibold text-[#346739]">
            Mantap, udah coba {TARGET_ORDERS} pesanan! 🎉
          </p>
          <p className="text-sm leading-relaxed text-[#2C2C2A]">
            Perhatiin — waktu kamu pilih &ldquo;Tidak pakai minuman&rdquo; atau &ldquo;Tidak
            pakai dessert&rdquo;, itu juga salah satu pilihan yang mungkin, lho — bukan berarti
            nggak dihitung. Coba pikirin, ada berapa total &ldquo;opsi&rdquo; sebenarnya di
            kategori minuman dan dessert kalau opsi &ldquo;tidak pakai&rdquo; itu ikut
            dihitung?
          </p>
          <div className="rounded-lg border border-[#663362]/30 bg-[#663362]/05 px-3 py-2 text-xs font-medium text-[#663362]">
            💡 Ingat: &ldquo;tidak memilih&rdquo; bukan berarti &ldquo;tidak dihitung&rdquo;.
            Opsi &ldquo;tidak pilih&rdquo; itu setara seperti pilihan lain di kategori itu.
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[#346739] bg-white px-5 py-2 text-sm font-medium text-[#346739] transition-colors hover:bg-[#346739] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#346739] focus-visible:ring-offset-2"
          >
            Coba lagi dari awal
          </button>
        </div>
      )}
    </div>
  );
}
