import React from "react";
import Image from "next/image";

export default function SiswaDashboardPage() {
  const cardStyle: React.CSSProperties = {
    backgroundColor: "#DBFFD5",
    borderRadius: "30px",
    width: "min(630px, 100%)",
    height: "270px",
    flexShrink: 0,
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "24px",
      boxSizing: "border-box",
    }}>
      <div style={cardStyle}>
        <div
          style={{
            marginTop: "10px",
            marginLeft: "20px",
          }}
        >
          {/* Baris atas */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/icons/green materi.png"
              alt="Materi"
              width={20}
              height={20}
            />

            <h3
              style={{
                color: "#346739",
                marginLeft: "20px",
                fontWeight: 600,
                fontSize: 24,
                marginTop: 0,
                marginBottom: 0,
              }}
            >
              Materi 1
            </h3>
          </div>

          {/* Baris bawah */}
          <h2
            style={{
              color: "#346739",
              fontWeight: 600,
              fontSize: 36,
              marginTop: "1px",
              marginBottom: 0,
            }}
          >
            Kaidah Pencacahan
          </h2>
          <p style={{ marginTop: "-4px"}}>
            Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.
          </p>
        </div>
      </div>
      <div style={cardStyle} />
      <div style={cardStyle} />
    </div>
  );
}