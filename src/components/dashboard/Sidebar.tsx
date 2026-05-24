"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/siswa",
    icon: "/icons/dashboard icon.png",
  },
  {
    label: "Materi",
    href: "/siswa/materi",
    icon: "/icons/materi.png",
  },
  {
    label: "Ulangan Harian",
    href: "/siswa/ulangan",
    icon: "/icons/test.png",
  },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: (val: boolean) => void;
  mobileOpen: boolean;
  onMobileToggle: (val: boolean) => void;
}

export default function Sidebar({ expanded, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
  const pathname = usePathname();

  const navList = (isMobile: boolean) => (
    <nav style={isMobile ? { width: "100%", marginTop: 24 } : { width: "100%", display: "flex", flexDirection: "column", gap: 4, marginTop: "44px" }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={`${isMobile ? "mobile" : "desktop"}-${item.href}`}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "flex-start",
              padding: "10px 8px",
              transition: "background-color 0.2s ease",
              backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              borderRadius: 8,
              margin: isMobile ? "0 8px 12px" : "0 0 16px 0",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
            }}
            onClick={() => {
              if (isMobile) onMobileToggle(false);
            }}
          >
            <Image
              src={item.icon}
              alt={item.label}
              width={24}
              height={24}
              style={{
                objectFit: "contain",
                flexShrink: 0,
                transform: isMobile || expanded ? "translateX(0px)" : "translateX(4px)",
                transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <span
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: isMobile || expanded ? 160 : 0,
                opacity: isMobile || expanded ? 1 : 0,
                transition: isMobile || expanded
                  ? "max-width 0.3s ease, opacity 0.2s ease 0.15s"
                  : "opacity 0s, max-width 0.3s ease",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className="hidden md:flex"
        style={{
          width: expanded ? 208 : 48,
          height: "calc(100vh - 16px)",
          backgroundColor: "#346739",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "25px 0",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
          marginLeft: "4px",
          marginTop: "8px",
          marginBottom: "8px",
          borderRadius: "30px 30px 30px 30px",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", padding: expanded ? "0 12px" : undefined }}>
          {!expanded ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 16, width: "100%" }}>
              <button
                type="button"
                onClick={() => onToggle(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "-4px",
                }}
                aria-label="Expand sidebar"
              >
                <Image src="/icons/expand side bar.png" alt="Expand" width={24} height={24} style={{ objectFit: "contain" }} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0 16px 0", width: "100%" }}>
              <Image
                src="/icons/icon kombinara putih.png"
                alt="Kombinara"
                width={100}
                height={32}
                style={{ objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => onToggle(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Collapse sidebar"
              >
                <Image src="/icons/collapse side bar.png" alt="Collapse" width={28} height={28} style={{ objectFit: "contain" }} />
              </button>
            </div>
          )}

          {navList(false)}
        </div>
      </aside>

      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => onMobileToggle(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-64 overflow-y-auto bg-brand-600 p-4 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Image src="/icons/icon kombinara putih.png" alt="Kombinara" width={100} height={32} className="object-contain" />
            <button
              type="button"
              onClick={() => onMobileToggle(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              aria-label="Tutup sidebar"
            >
              <Image src="/icons/collapse side bar.png" alt="Close" width={20} height={20} className="object-contain" />
            </button>
          </div>

          {navList(true)}
        </aside>
      </div>
    </>
  );
}