import Link from "next/link";

const MATERI = [
  {
    id: "kaidah-pencacahan",
    nomor: "01",
    judul: "Kaidah Pencacahan",
    deskripsi: "Aturan penjumlahan & perkalian",
    durasi: "120 menit",
    soal: "10 soal",
    accent: "#346739",
    badge: "#DBFFD5",
    badgeText: "#346739",
  },
  {
    id: "faktorial",
    nomor: "02",
    judul: "Faktorial",
    deskripsi: "Operasi n! dan sifat-sifatnya",
    durasi: "120 menit",
    soal: "10 soal",
    accent: "#663362",
    badge: "#f3e8f2",
    badgeText: "#663362",
  },
  {
    id: "permutasi",
    nomor: "03",
    judul: "Permutasi",
    deskripsi: "Susunan urutan dari sekumpulan objek",
    durasi: "120 menit",
    soal: "10 soal",
    accent: "#346739",
    badge: "#DBFFD5",
    badgeText: "#346739",
  },
  {
    id: "kombinasi",
    nomor: "04",
    judul: "Kombinasi",
    deskripsi: "Pemilihan tanpa memperhatikan urutan",
    durasi: "120 menit",
    soal: "10 soal",
    accent: "#663362",
    badge: "#f3e8f2",
    badgeText: "#663362",
  },
];

export default function UlanganListPage() {
  return (
    <div style={{ padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#346739",
            margin: "0 0 6px 0",
            opacity: 0.7,
          }}
        >
          Asesmen Formatif
        </p>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#1a3d1c",
            margin: "0",
            lineHeight: "1.3",
          }}
        >
          Pilih Materi Asesmen
        </h1>
      </div>

      {/* Grid 4 kolom */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {MATERI.map((m) => (
          <Link
            key={m.id}
            href={`/siswa/ulangan/${m.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1.5px solid #e2ede2",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                height: "100%",
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  height: "6px",
                  backgroundColor: m.accent,
                  flexShrink: 0,
                }}
              />

              {/* Card body */}
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  flex: 1,
                }}
              >
                {/* Nomor & badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: "800",
                      color: m.accent,
                      lineHeight: "1",
                      opacity: 0.18,
                    }}
                  >
                    {m.nomor}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      backgroundColor: m.badge,
                      color: m.badgeText,
                      padding: "3px 9px",
                      borderRadius: "99px",
                    }}
                  >
                    Asesmen Formatif
                  </span>
                </div>

                {/* Judul & deskripsi */}
                <div>
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1a3d1c",
                      margin: "0 0 4px 0",
                      lineHeight: "1.3",
                    }}
                  >
                    {m.judul}
                  </h2>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b8f6d",
                      margin: "0",
                      lineHeight: "1.5",
                    }}
                  >
                    {m.deskripsi}
                  </p>
                </div>

                {/* Info durasi & soal */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#5a7d5c",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {m.durasi}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    {m.soal}
                  </span>
                </div>

                {/* Tombol */}
                <div style={{ marginTop: "auto" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 0",
                      backgroundColor: m.accent,
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Mulai Asesmen
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
