import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 p-4 w-full lg:w-1/2 h-24"
        style={{ background: "linear-gradient(to bottom, white 0%, white 60%, transparent 100%)" }}
      >
        <Image
          src="/images/icon kombinara.png"
          alt="Kombinara"
          width={80}
          height={89}
          className="w-auto h-10"
        />
      </div>
      <main className="min-h-screen flex items-start lg:items-center justify-center pt-16 lg:pt-0">
        {children}
      </main>
    </>
  );
}
