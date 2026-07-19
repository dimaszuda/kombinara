"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import SelectionToolbar from "@/components/materi/SelectionToolbar";
import ChatbotShell from "@/components/materi/ChatbotShell";
import AsesmenDiagnostik from "@/components/materi/sections/kaidah-pencacahan/AsesmenDiagnostik";
import ApersepsiSection from "@/components/materi/sections/kaidah-pencacahan/ApersepsiPemantik";
import KaidahPenjumlahan from "@/components/materi/sections/kaidah-pencacahan/KaidahPenjumlahan";
import KaidahPerkalian from "@/components/materi/sections/kaidah-pencacahan/KaidahPerkalian";

interface MateriItem {
  title: string;
  icon: string;
  description: string;
}

const materiData: Record<string, MateriItem> = {
  "kaidah-pencacahan": {
    title: "Kaidah Pencacahan",
    icon: "/images/kaidah pencacahan.png",
    description:
      "Materi kaidah pencacahan membahas tentang cara menghitung banyaknya kemungkinan suatu kejadian tanpa harus menuliskan semua kemungkinan satu per satu.",
  },
  "faktorial": {
    title: "Faktorial",
    icon: "/images/faktorial.png",
    description:
      "Konsep perkalian bilangan berurutan menurun hingga 1, dasar penting untuk memahami permutasi dan kombinasi.",
  },
  "permutasi": {
    title: "Permutasi",
    icon: "/images/permutasi.png",
    description:
      "Materi permutasi membahas tentang cara menghitung banyaknya susunan objek ketika urutan diperhatikan.",
  },
  "kombinasi": {
    title: "Kombinasi",
    icon: "/images/kombinasi.png",
    description:
      "Materi kombinasi membahas tentang cara menghitung banyaknya pilihan objek ketika urutan tidak diperhatikan.",
  },
};

/** Status respons dari /api/asesmen-diagnostik/status */
interface DiagnosticStatusResponse {
  status: "none" | "in_progress" | "passed" | "failed";
  lastScore: number | null;
  lastCorrectCount: number | null;
  lastTotalQuestions: number | null;
}

/** Status respons dari /api/apersepsi-pemantik/status (REFACTORED) */
interface ApersepsiStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
}

/** Status respons dari /api/kaidah-penjumlahan/status (REFACTORED) */
interface PenjumlahanStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
}

/** Status respons dari /api/kaidah-perkalian/status (REFACTORED) */
interface PerkalianStatusResponse {
  sections: Record<string, "locked" | "unlocked" | "completed">;
  aktivitasSiswa: {
    completedCount: number;
    totalCount: number;
    allCompleted: boolean;
  };
}

export default function MateriDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const materi = materiData[params.slug];
  const [passAssesmen, setPassAssesment] = useState(false);
  const [passApersepsi, setPassApersepsi] = useState(false);
  const [passKaidahPenjumlahan, setPassKaidahPenjumlahan] = useState(false);
  const [passKaidahPerkalian, setPassKaidahPerkalian] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  // Granular completion data dari backend
  const [apersepsiCompletedSteps, setApersepsiCompletedSteps] =
    useState<Record<number, boolean>>({});
  const [penjumlahanCompletedSections, setPenjumlahanCompletedSections] =
    useState<Record<number, boolean>>({});
  const [perkalianCompletedSections, setPerkalianCompletedSections] =
    useState<Record<number, boolean>>({});
  // aktivitas_siswa aggregate for kaidah_perkalian
  const [aktivitasSiswaStatus, setAktivitasSiswaStatus] = useState<{
    completedCount: number;
    totalCount: number;
    allCompleted: boolean;
  }>({ completedCount: 0, totalCount: 0, allCompleted: false });
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Cek semua status saat mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function checkAllStatus() {
      try {
        // ── Seeding: pastikan student_section_status rows exist ──
        // Idempotent -- safe to call every mount; no-op if already seeded.
        // Only applicable for kaidah-pencacahan; other slugs silently skip.
        await fetch(`/api/materi/${params.slug}/seed`).catch(() => {
          // Seeding is best-effort; don't block the page if it fails.
        });

        if (cancelled) return;

        // Fetch semua status secara paralel (3 sumber: diagnostic, student_section_status, aktivitas_siswa)
        const [diagRes, apersepsiRes, penjumlahanRes, perkalianRes] =
          await Promise.allSettled([
            fetch("/api/asesmen-diagnostik/status"),
            fetch("/api/apersepsi-pemantik/status"),
            fetch("/api/kaidah-penjumlahan/status"),
            fetch("/api/kaidah-perkalian/status"),
          ]);

        if (cancelled) return;

        // ── Diagnostik ──────────────────────────────────────────
        if (
          diagRes.status === "fulfilled" &&
          diagRes.value.ok
        ) {
          const data: DiagnosticStatusResponse = await diagRes.value.json();
          if (data.status === "passed") {
            setPassAssesment(true);
          }
        }

        // ── Apersepsi & Pemantik (REFACTORED: sections map, not completedSteps+savedData) ─
        if (
          apersepsiRes.status === "fulfilled" &&
          apersepsiRes.value.ok
        ) {
          const data: ApersepsiStatusResponse = await apersepsiRes.value.json();

          // Convert section-name-based status to step-index-based for compatibility
          // Step index mapping (ApersepsiPemantik component uses 0-7):
          //   0-2 = apersepsi (kendaraan, outfit, pengurus)
          //   3-5 = pemantik (password_kapasitas, tim_sama_beda, rute_kurir)
          //   6-7 = refleksi_sebelum_mulai (refleksi_sebelum_mulai_1, refleksi_sebelum_mulai_2)
          const cs: Record<number, boolean> = {};
          if (data.sections["apersepsi"] === "completed") {
            cs[0] = true; cs[1] = true; cs[2] = true;
          }
          if (data.sections["pemantik"] === "completed") {
            cs[3] = true; cs[4] = true; cs[5] = true;
          }
          if (data.sections["refleksi_sebelum_mulai"] === "completed") {
            cs[6] = true; cs[7] = true;
          }

          setApersepsiCompletedSteps(cs);

          // Jika semua 3 section selesai → semua 8 step complete
          const allDone =
            data.sections["apersepsi"] === "completed" &&
            data.sections["pemantik"] === "completed" &&
            data.sections["refleksi_sebelum_mulai"] === "completed";
          if (allDone) setPassApersepsi(true);
        }

        // ── Kaidah Penjumlahan (REFACTORED: sections map, not completedSections+savedData) ─
        if (
          penjumlahanRes.status === "fulfilled" &&
          penjumlahanRes.value.ok
        ) {
          const data: PenjumlahanStatusResponse = await penjumlahanRes.value.json();
          console.log("[materi-page] kaidah-penjumlahan sections:", JSON.stringify(data.sections));

          // Convert section-name-based status to index-based for compatibility
          // Section index mapping (KaidahPenjumlahan component uses 0-5):
          //   0 = eksplorasi_kontekstual
          //   1 = aktivitas_deep_learning
          //   3 = contoh_soal
          //   5 = refleksi_mini
          const cs: Record<number, boolean> = {};
          if (data.sections["eksplorasi_kontekstual"] === "completed") cs[0] = true;
          if (data.sections["aktivitas_deep_learning"] === "completed") cs[1] = true;
          if (data.sections["contoh_soal"] === "completed") cs[3] = true;
          if (data.sections["refleksi_mini"] === "completed") cs[5] = true;

          setPenjumlahanCompletedSections(cs);
          if (data.sections["refleksi_mini"] === "completed") setPassKaidahPenjumlahan(true);
        } else {
          console.warn("[materi-page] kaidah-penjumlahan status fetch failed:", penjumlahanRes);
        }

        // ── Kaidah Perkalian (REFACTORED: sections map + aktivitasSiswa aggregate) ─
        if (
          perkalianRes.status === "fulfilled" &&
          perkalianRes.value.ok
        ) {
          const data: PerkalianStatusResponse = await perkalianRes.value.json();
          console.log("[materi-page] kaidah-perkalian sections:", JSON.stringify(data.sections));

          // Convert section-name-based status to index-based for compatibility
          // Section index mapping (KaidahPerkalian component uses 0-7):
          //   0 = eksplorasi_kontekstual
          //   1 = aktivitas_deep_learning
          //   3 = contoh_soal
          //   7 = refleksi_mini
          const cs: Record<number, boolean> = {};
          if (data.sections["eksplorasi_kontekstual"] === "completed") cs[0] = true;
          if (data.sections["aktivitas_deep_learning"] === "completed") cs[1] = true;
          if (data.sections["contoh_soal"] === "completed") cs[3] = true;
          if (data.sections["refleksi_mini"] === "completed") cs[7] = true;

          setPerkalianCompletedSections(cs);
          setAktivitasSiswaStatus(data.aktivitasSiswa ?? { completedCount: 0, totalCount: 0, allCompleted: false });
          if (data.sections["refleksi_mini"] === "completed") setPassKaidahPerkalian(true);
        } else {
          console.warn("[materi-page] kaidah-perkalian status fetch failed:", perkalianRes);
        }
      } catch (err) {
        console.error("[materi-page] checkAllStatus error:", err);
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    }
    checkAllStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Compute completedKeys & activeKey untuk TableContent ──────────
  const { completedKeys, activeKey } = useMemo(() => {
    const keys = new Set<string>();

    // Asesmen Diagnostik
    if (passAssesmen) keys.add("asesmen");

    // Apersepsi & Pemantik
    const steps = apersepsiCompletedSteps;
    const apersepsiSubDone = [0, 1, 2].every((i) => steps[i]);
    const pemantikSubDone = [3, 4, 5].every((i) => steps[i]);
    const refleksiSubDone = [6, 7].every((i) => steps[i]);
    if (apersepsiSubDone) keys.add("apersepsi-sub");
    if (pemantikSubDone) keys.add("pemantik-sub");
    if (refleksiSubDone) keys.add("refleksi-sub");
    if (passApersepsi) keys.add("apersepsi");

    // Kaidah Penjumlahan
    const pj = penjumlahanCompletedSections;
    if (pj[0]) keys.add("penjumlahan-1");
    if (pj[1]) { keys.add("penjumlahan-2"); keys.add("penjumlahan-3"); }
    if (pj[3]) { keys.add("penjumlahan-4"); keys.add("penjumlahan-5"); }
    if (pj[5]) keys.add("penjumlahan-6");
    if (passKaidahPenjumlahan) keys.add("penjumlahan");

    // Kaidah Perkalian
    const pk = perkalianCompletedSections;
    if (pk[0]) keys.add("perkalian-1");
    if (pk[1]) { keys.add("perkalian-2"); keys.add("perkalian-3"); }
    if (pk[3]) { keys.add("perkalian-4"); keys.add("perkalian-5"); }
    if (pk[7]) { keys.add("perkalian-6"); keys.add("perkalian-7"); keys.add("perkalian-8"); }
    if (passKaidahPerkalian) keys.add("perkalian");

    // Tentukan activeKey: section pertama yang unlocked tapi belum complete
    let active: string | null = null;
    if (!passAssesmen) {
      active = "asesmen";
    } else if (!passApersepsi) {
      active = "apersepsi";
    } else if (!passKaidahPenjumlahan) {
      active = "penjumlahan";
    } else if (!passKaidahPerkalian) {
      active = "perkalian";
    }
    // else: semua complete, active = null

    return { completedKeys: keys, activeKey: active };
  }, [
    passAssesmen, passApersepsi, passKaidahPenjumlahan, passKaidahPerkalian,
    apersepsiCompletedSteps, penjumlahanCompletedSections, perkalianCompletedSections,
  ]);

  if (!materi) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>Materi tidak ditemukan</h1>
        <Link href="/siswa">
          <button style={{ padding: "10px 20px", marginTop: "16px", cursor: "pointer" }}>
            Kembali
          </button>
        </Link>
      </div>
    );
  }

  // ── Konten halaman (tanpa AI features) ─────────────────────────────
  const pageContent = (
    <div ref={contentRef} style={{ padding: "32px 12px 80px", margin: "0 auto" }}>
      {/* SelectionToolbar hanya aktif kalau sudah lulus asesmen */}
      {passAssesmen && <SelectionToolbar contentRef={contentRef} />}
      {/* Back to Dashboard */}
      <Link href="/siswa">
        <button
          style={{
            background: "none",
            border: "none",
            color: "#346739",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "20px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Kembali ke Dashboard
        </button>
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "36px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "#346739", fontSize: "var(--materi-heading-size)", fontWeight: 700, marginTop: 0, marginBottom: "8px" }}>
            {materi.title}
          </h1>
          <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6", marginBottom: 0 }}>
            {materi.description}
          </p>
        </div>
        {materi.icon && (
          <div style={{ flexShrink: 0 }}>
            <Image src={materi.icon} alt={materi.title} width={120} height={120} />
          </div>
        )}
      </div>
      
      {/* Asesmen Diagnostik section */}
      <div id="asesmen-diagnostik" key="Asesmen Diagnostik" style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", fontFamily: "monospace", letterSpacing: "0.5px" }}>
          Asesmen Diagnostik
        </p>
        <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" }}>
          <div
            style={{
              height: "100%",
              width: "25%",
              background: "#346739",
              borderRadius: "4px",
            }}
          />
        </div>
        {isCheckingStatus ? (
          <div style={{ textAlign: "center", padding: "24px", color: "#888", fontSize: "14px" }}>
            Memeriksa status asesmen...
          </div>
        ) : (
          <AsesmenDiagnostik onPass={setPassAssesment} />
        )}
      </div>

      {/* Section terkunci: Apersepsi dan Pemantik */}
      <LockableSection
        id="apersepsi-pemantik"
        unlocked={passAssesmen}
        label="Apersepsi dan Pemantik"
        progressWidth="50%"
      >
        <ApersepsiSection
          initialCompletedSteps={apersepsiCompletedSteps}
          onComplete={() => setPassApersepsi(true)}
        />
      </LockableSection>

      {/* Section terkunci: MATERI 1 */}
      <LockableSection
        id="kaidah-penjumlahan"
        unlocked={passApersepsi}
        label="MATERI 1 : KAIDAH PENJUMLAHAN"
        progressWidth="75%"
      >
        <KaidahPenjumlahan
          initialCompletedSections={penjumlahanCompletedSections}
          onComplete={() => setPassKaidahPenjumlahan(true)}
        />
      </LockableSection>

      {/* Section terkunci: MATERI 2 */}
      <LockableSection
        id="kaidah-perkalian"
        unlocked={passKaidahPenjumlahan}
        label="MATERI 2 : KAIDAH PERKALIAN"
        progressWidth="100%"
      >
        <KaidahPerkalian
          initialCompletedSections={perkalianCompletedSections}
          onComplete={() => setPassKaidahPerkalian(true)}
        />
      </LockableSection>
    </div>
  );

  // ── Bungkus dengan ChatbotShell hanya kalau sudah lulus asesmen ──────
  return passAssesmen ? (
    <ChatbotShell activeKey={activeKey} completedKeys={completedKeys}>{pageContent}</ChatbotShell>
  ) : (
    pageContent
  );
}

/**
 * Wrapper section yang terkunci sampai siswa lulus asesmen diagnostik.
 */
function LockableSection({
  id,
  unlocked,
  label,
  progressWidth,
  children,
}: {
  id?: string;
  unlocked: boolean;
  label: string;
  progressWidth: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: "40px" }}>
      <p
        style={{
          fontSize: "12px",
          color: "#888",
          marginBottom: "6px",
          fontFamily: "monospace",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>
      <div
        style={{
          height: "4px",
          background: "#e0e0e0",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: unlocked ? progressWidth : "0%",
            background: unlocked ? "#346739" : "#e0e0e0",
            borderRadius: "4px",
            transition: "width 0.5s ease, background 0.5s ease",
          }}
        />
      </div>
      {unlocked ? (
        children
      ) : (
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "16px",
            padding: "40px 32px",
            border: "2px dashed #d1d5db",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#6b7280",
              margin: "0 0 8px",
            }}
          >
            Selesaikan Asesmen Diagnostik Terlebih Dahulu
          </p>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
            Kamu harus lulus asesmen diagnostik di atas untuk membuka section ini.
          </p>
        </div>
      )}
    </div>
  );
}