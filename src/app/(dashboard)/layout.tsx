"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";

interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string | null;
  className: string | null;
  gender?: string | null;
}

// Protect route via middleware — jangan rely on client-side check
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const mainStyle: React.CSSProperties = {
    // Make dashboard pages react to sidebar width without extra prop drilling.
    ["--right-card-transition-duration" as string]: "0.35s",
    ["--right-card-transition-ease" as string]: "cubic-bezier(0.22, 1, 0.36, 1)",
    ["--right-card-highlight-size" as string]: expanded ? "18px" : "30px",
    ["--right-card-title-size" as string]: expanded ? "20px" : "24px",
    ["--right-card-subtitle-size" as string]: expanded ? "20px" : "24px",
    ["--right-card-text-size" as string]: expanded ? "12px" : "14px",
    ["--right-card-link-size" as string]: expanded ? "12px" : "15px",
    ["--right-card-sum-size" as string]: expanded ? "11px" : "16px",
    ["--right-card-activity-image-size" as string]: expanded ? "120px" : "150px",
    ["--right-card-activity-gap" as string]: expanded ? "0px" : "2px",
    ["--right-card-link-opacity" as string]: expanded ? 0 : 1,
    ["--right-card-link-max-width" as string]: expanded ? "0px" : "230px",
    ["--right-card-link-gap" as string]: expanded ? "0px" : "16px",
    ["--right-card-arrow-size" as string]: expanded ? "50px" : "28px",
    ["--right-card-arrow-shift" as string]: expanded ? "8px" : "4px",
  };

  useEffect(() => {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UserProfile | null) => {
        if (data) setProfile(data);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const closeMobileSidebar = () => setMobileSidebarOpen(false);
    window.addEventListener("resize", closeMobileSidebar);
    return () => window.removeEventListener("resize", closeMobileSidebar);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-20 border-b border-brand-600 bg-white px-4 md:hidden">
        <div className="mx-auto flex h-full w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-600 bg-brand-50 md:hidden"
              aria-label="Buka menu navigasi"
            >
              <Image src="/icons/expand side bar.png" alt="Menu" width={18} height={18} />
            </button>

            <Link href="/siswa" aria-label="Ke dashboard siswa" className="inline-flex items-center">
              <Image
                src="/images/icon kombinara.png"
                alt="Kombinara"
                width={150}
                height={170}
                className="h-auto w-[110px] sm:w-[130px] md:w-[150px]"
              />
            </Link>
          </div>

          <Link
            href="/siswa/profile"
            className="flex items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-brand-50"
            aria-label="Ke halaman profil"
          >
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <Image
                src={
                  profile?.gender === "Perempuan"
                    ? "/icons/girl.png"
                    : profile?.gender === "Laki-laki"
                      ? "/icons/boy.png"
                      : "/icons/profile picture.png"
                }
                alt="Profile"
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            )}

            {profile && (
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="whitespace-nowrap text-sm font-semibold text-zinc-900">{profile.name}</span>
                <span className="whitespace-nowrap text-xs text-zinc-600">
                  {profile.className ? `Kelas ${profile.className}` : "Guru"}
                </span>
              </div>
            )}
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] md:hidden">
        <Sidebar
          expanded={expanded}
          onToggle={setExpanded}
          mobileOpen={mobileSidebarOpen}
          onMobileToggle={setMobileSidebarOpen}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4" style={mainStyle}>
          {children}
        </main>
      </div>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", flexDirection: "row" }} className="hidden md:flex">
        <div style={{ position: "relative", flexShrink: 0, height: "100vh", width: "auto" }}>
          <Link
            href="/siswa"
            style={{
              position: "absolute",
              top: 15,
              left: "10%",
              transform: "translateX(50%)",
              zIndex: 10,
              width: 150,
              height: "auto",
              marginTop: "8px",
              opacity: expanded ? 0 : 1,
              transition: expanded
                ? "opacity 0.15s ease"
                : "opacity 0.2s ease 0.2s",
              pointerEvents: expanded ? "none" : "auto",
            }}
            aria-label="Ke dashboard siswa"
          >
            <Image
              src="/images/icon kombinara.png"
              alt="Kombinara"
              width={150}
              height={170}
              style={{
                width: 150,
                height: "auto",
                maxWidth: "none",
              }}
            />
          </Link>

          <Sidebar
            expanded={expanded}
            onToggle={setExpanded}
            mobileOpen={mobileSidebarOpen}
            onMobileToggle={setMobileSidebarOpen}
          />
        </div>

        <Link
          href="/siswa/profile"
          style={{
            position: "absolute",
            top: 15,
            right: 30,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "auto",
            marginTop: "8px",
            textDecoration: "none",
            cursor: "pointer",
          }}
          aria-label="Ke halaman profil"
        >
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt="Profile"
              width={48}
              height={48}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <Image
              src={
                profile?.gender === "Perempuan"
                  ? "/icons/girl.png"
                  : profile?.gender === "Laki-laki"
                    ? "/icons/boy.png"
                    : "/icons/profile picture.png"
              }
              alt="Profile"
              width={48}
              height={48}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          )}
          {profile && (
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#555",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.className ? `Kelas ${profile.className}` : "Guru"}
              </span>
            </div>
          )}
        </Link>

        <main style={{ ...mainStyle, flex: 1, overflowY: "auto", height: "100vh" }}>
          <div style={{ position: "sticky", top: 0, height: "80px", background: "white", zIndex: 9, borderBottom: "1px solid #346739" }} />
          <div style={{ paddingTop: "14px", paddingLeft: "12px", paddingRight: "12px", paddingBottom: "20px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
