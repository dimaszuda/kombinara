import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/login", label: "Masuk" },
  { href: "/join", label: "Gabung dengan Kode Kelas" },
  { href: "/daftar-guru", label: "Daftar sebagai Guru" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#34673926] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Image src="/images/icon kombinara.png" alt="Kombinara" width={1742} height={448} className="h-7 w-auto" />
          <p className="mt-2 text-sm text-[#6B6B66]">E-Modul Interaktif Kombinatorika SMA</p>
        </div>

        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[#2C2C2A] hover:text-[#346739]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-[#34673914] py-4 text-center text-xs text-[#8A8A8A]">
        © {new Date().getFullYear()} Kombinara
      </p>
    </footer>
  );
}
