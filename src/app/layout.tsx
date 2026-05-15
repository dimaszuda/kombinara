import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kombinara",
  description: "E-Modul Interaktif Kombinatorika SMA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.className}>
      <body>
        <div
          className="fixed top-0 left-0 z-50 w-1/2 p-4"
          style={{ background: "linear-gradient(to bottom, white 50%, transparent)" }}
        >
          <Image
            src="/images/icon kombinara.png"
            alt="Kombinara"
            width={80}
            height={89}
            className="w-auto h-10"
          />
        </div>
        {children}
      </body>
    </html>
  );
}
