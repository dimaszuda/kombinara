"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
    label: "Aktivitas Siswa",
    href: "/siswa/activity",
    icon: "/icons/activity.png"
  },
  {
    label: "Assesmen Formatif",
    href: "/siswa/ulangan",
    icon: "/icons/test.png",
  },
  {
    label: "Download Modul",
    href: "/siswa/aktivitas",
    icon: "/icons/download.png"
  }
];

interface SidebarProps {
  expanded: boolean;
  onToggle: (val: boolean) => void;
  mobileOpen: boolean;
  onMobileToggle: (val: boolean) => void;
}

function PortalTooltip({ label, anchorRef, offset = 10 }: { 
  label: string; 
  anchorRef: React.RefObject<HTMLElement | null>;
  offset?: number;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + offset, // pakai offset
      });
    }
  }, [anchorRef, offset]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        backgroundColor: "rgba(30, 30, 30, 0.92)",
        color: "white",
        fontSize: 13,
        fontWeight: 500,
        padding: "5px 10px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </div>,
    document.body
  );
}

interface NavItemProps {
  item: { label: string; href: string; icon: string };
  isActive: boolean;
  expanded: boolean;
}

function NavItem({ item, isActive, expanded }: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 16 }}>
      <Link
        ref={ref}
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          transition: "background-color 0.2s ease",
          backgroundColor: isActive
            ? "rgba(255,255,255,0.15)"
            : hovered
            ? "rgba(255,255,255,0.08)"
            : "transparent",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        <Image
          src={item.icon}
          alt={item.label}
          width={16}
          height={16}
          style={{
            objectFit: "contain",
            flexShrink: 0,
            transform: expanded ? "translateX(0px)" : "translateX(8px)",
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
            maxWidth: expanded ? 160 : 0,
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? "max-width 0.3s ease, opacity 0.2s ease 0.15s"
              : "opacity 0s, max-width 0.3s ease",
          }}
        >
          {item.label}
        </span>
      </Link>

      {!expanded && hovered && <PortalTooltip label={item.label} anchorRef={ref} />}
    </div>
  );
}

function ExpandButton({ onToggle }: { onToggle: (val: boolean) => void }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingBottom: 16, width: "100%" }}>
      <button
        ref={ref}
        type="button"
        onClick={() => onToggle(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
        <Image src="/icons/expand side bar.png" alt="Expand" width={20} height={20} style={{ objectFit: "contain" }} />
      </button>

      {hovered && <PortalTooltip label="Expand" anchorRef={ref} offset={20} />}
    </div>
  );
}

interface LogoutButtonProps {
  expanded: boolean;
  onClick?: () => void;
}

function LogoutButton({ expanded, onClick }: LogoutButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to login page
        window.location.href = "/login";
      } else {
        const data = await response.json();
        alert(data.error || "Logout gagal");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Terjadi kesalahan saat logout");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        ref={ref}
        type="button"
        onClick={onClick || handleLogout}
        disabled={isLoading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          background: "none",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          width: "100%",
          borderRadius: 8,
          transition: "background-color 0.2s ease",
          backgroundColor: hovered && !isLoading ? "rgba(255,255,255,0.08)" : "transparent",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <Image
          src="/icons/logout.png"
          alt="Logout"
          width={20}
          height={20}
          style={{
            objectFit: "contain",
            flexShrink: 0,
            transform: expanded ? "translateX(0px)" : "translateX(8px)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: expanded ? 160 : 0,
            opacity: expanded ? 1 : 0,
            transition: expanded
              ? "max-width 0.3s ease, opacity 0.2s ease 0.15s"
              : "opacity 0s, max-width 0.3s ease",
          }}
        >
          Logout
        </span>
      </button>

      {!expanded && hovered && <PortalTooltip label="Logout" anchorRef={ref} />}
    </div>
  );
}

export default function Sidebar({ expanded, onToggle, mobileOpen, onMobileToggle }: SidebarProps) {
  const pathname = usePathname();

  const desktopNav = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Nav items — di atas */}
      <div style={{ marginTop: "24px" }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}
      </div>

      {/* Logout — push ke paling bawah */}
      <div style={{ marginTop: "auto" }}>
        <LogoutButton expanded={expanded} />
      </div>
    </div>
  );

  const mobileNav = (
    <nav style={{ width: "100%", marginTop: 24, display: "flex", flexDirection: "column", flex: 1 }}>
      <div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "10px 8px",
                transition: "background-color 0.2s ease",
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                borderRadius: 8,
                margin: "0 8px 12px",
                textDecoration: "none",
              }}
              onClick={() => onMobileToggle(false)}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
              <span style={{ color: "white", fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "0 8px 8px" }}>
        <Link
          href="/logout"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 8px",
            borderRadius: 8,
            textDecoration: "none",
          }}
          onClick={() => onMobileToggle(false)}
        >
          <Image src="/icons/logout.png" alt="Logout" width={24} height={24} style={{ objectFit: "contain" }} />
          <span style={{ color: "white", fontSize: 14 }}>Logout</span>
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
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
          borderRadius: "30px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: expanded ? "0 12px" : undefined,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header: toggle button */}
          {!expanded ? (
            <ExpandButton onToggle={onToggle} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, width: "100%" }}>
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

          {desktopNav}
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-[1100] md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => onMobileToggle(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-52 overflow-y-auto bg-brand-600 p-4 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ display: "flex", flexDirection: "column" }}
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
          {mobileNav}
        </aside>
      </div>
    </>
  );
}