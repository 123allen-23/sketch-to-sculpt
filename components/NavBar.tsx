"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #2a2a2a",
  background: active ? "rgba(255,255,255,0.08)" : "transparent",
  fontWeight: 800,
  textDecoration: "none",
  color: "inherit",
});

export default function NavBar() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/public-gallery", label: "Public" },
    { href: "/settings", label: "Settings" },
    { href: "/policies", label: "Policies" },
    { href: "/login", label: "Login" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #222",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href="/" style={{ fontWeight: 900, letterSpacing: 0.2, textDecoration: "none", color: "inherit" }}>
          Sketch→Sculpt
        </Link>

        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link key={it.href} href={it.href} style={linkStyle(active)}>
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
