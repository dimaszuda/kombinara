import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#materi", label: "Materi" },
  { href: "#alur", label: "Alur Belajar" },
  { href: "#fitur", label: "Fitur" },
  { href: "#guru", label: "Untuk Guru" },
];

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#34673926] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Kombinara — beranda" className="inline-flex items-center">
          <Image
            src="/images/icon kombinara.png"
            alt="Kombinara"
            width={1742}
            height={448}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#2C2C2A] transition-colors hover:text-[#346739]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-[#346739] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2C5830] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#663362] focus-visible:ring-offset-2"
        >
          Masuk
        </Link>
      </div>
    </header>
  );
}
