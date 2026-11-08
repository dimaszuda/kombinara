import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import MateriSection from "@/components/landing/MateriSection";
import AlurSection from "@/components/landing/AlurSection";
import FiturSection from "@/components/landing/FiturSection";
import GuruSection from "@/components/landing/GuruSection";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Kombinara: E-Modul Interaktif Kombinatorika SMA",
  description:
    "Belajar Kaidah Pencacahan, Faktorial, Permutasi, dan Kombinasi secara bertahap lewat soal dari situasi sehari-hari, ditemani Kombi, asisten AI di setiap materi.",
};

// Landing page publik. User yang sudah login diarahkan ke dashboard oleh middleware.
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#2C2C2A]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <MateriSection />
        <AlurSection />
        <FiturSection />
        <GuruSection />
      </main>
      <LandingFooter />
    </div>
  );
}
