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
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: expanded ? 220 : 56,
        height: "calc(100vh - 16px)",
        backgroundColor: "#346739",
        display: "flex",
        flexDirection: "column",
        alignItems: expanded ? "stretch" : "center",
        padding: "25px 0",
        transition: "width 0.35s ease",
        flexShrink: 0,
        marginLeft: "4px",
        marginTop: "8px",
        marginBottom: "8px",
        borderRadius: "30px 30px 30px 30px",
        overflow: "hidden",
      }}
    >
      {/* Top section */}
      {!expanded ? (
        // Collapsed: just the expand button (icon is rendered outside aside in layout)
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 16,
            width: "100%",
          }}
        >
          <button
            onClick={() => onToggle(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Expand sidebar"
          >
            <Image
              src="/icons/expand side bar.png"
              alt="Expand"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </button>
        </div>
      ) : (
        // Expanded: kombinara putih (left) + collapse button (right)
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px 16px 12px",
            width: "100%",
          }}
        >
          <Image
            src="/icons/icon kombinara putih.png"
            alt="Kombinara"
            width={100}
            height={32}
            style={{ objectFit: "contain" }}
          />
          <button
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
            <Image
              src="/icons/collapse side bar.png"
              alt="Collapse"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, marginTop: "44px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: expanded ? 10 : 0,
                justifyContent: expanded ? "flex-start" : "center",
                padding: expanded ? "10px 16px" : "10px 0",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                borderRadius: 8,
                margin: "0 8px",
                marginBottom: "16px",
                textDecoration: "none",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "transparent";
              }}
              
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={28}
                height={28}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
              {expanded && (
                <span
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    marginLeft: "1vh"
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
