/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Palet inti app (agents/DESIGN.md §1). Hex yang sama juga ditulis langsung di banyak file lama.
      colors: {
        brand: {
          50: "#F3FFF1", // latar halus, hover ringan
          100: "#DBFFD5", // kartu materi, highlight, jawaban benar
          200: "#D4E8D4", // border dan latar hijau sekunder
          500: "#5D7C5F", // teks hijau redup (4.65:1 di putih)
          600: "#346739", // warna utama
          700: "#2C5830", // hover tombol primer
          900: "#1A3D1C", // teks di atas hijau muda
        },
        plum: {
          50: "#F3E8F2",
          600: "#663362", // aksen, focus ring
        },
        ink: "#2C2C2A", // teks utama
        muted: "#6B6B66", // teks sekunder (5.36:1 di putih)
        surface: "#F5F5F0", // latar netral / read-only
        line: {
          DEFAULT: "#E5E5E0",
          strong: "#C5C5C0",
        },
        danger: {
          DEFAULT: "#C24949", // jawaban salah, error
          strong: "#B91C1C", // pesan error form, peringatan kuat
          50: "#FFF5F5",
          200: "#FECACA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
