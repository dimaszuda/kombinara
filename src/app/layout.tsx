import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Overlock } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const overlock = Overlock({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overlock",
});

export const metadata: Metadata = {
  title: "Kombinara",
  description: "E-Modul Interaktif Kombinatorika SMA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} ${overlock.variable}`}>
      <body>{children}</body>
    </html>
  );
}
