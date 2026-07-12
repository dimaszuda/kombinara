import Image from "next/image";
import Link from "next/link";

export default function KombinasiPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Label atas */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#346739",
            margin: "0 0 20px 0",
            opacity: 0.7,
          }}
        >
          Kombinasi
        </p>

        {/* Gambar */}
        <div
          style={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1.5px solid #d4e8d4",
          }}
        >
          <Image
            src="/images/waiting.png"
            alt="Materi sedang disiapkan"
            width={1000}
            height={571}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>

        {/* Teks utama */}
        <div
          style={{
            marginTop: "28px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1a3d1c",
              margin: "0 0 8px 0",
              lineHeight: "1.3",
            }}
          >
            Materi lagi disiapkan
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#5a7d5c",
              margin: "0",
              lineHeight: "1.6",
            }}
          >
            Sabar ya, bentar lagi bisa dipelajari di sini.
          </p>
        </div>

        {/* Tombol kembali */}
        <Link
          href="/siswa"
          style={{
            marginTop: "28px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            backgroundColor: "#346739",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
