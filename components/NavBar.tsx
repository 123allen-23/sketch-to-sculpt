"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavBar() {
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthed(!!data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const linkStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #333",
    textDecoration: "none",
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(0,0,0,0.65)",
        borderBottom: "1px solid #222",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 900, letterSpacing: 0.3 }}>
          <Link href="/" style={{ textDecoration: "none" }}>Sketch→Sculpt</Link>
        </div>

<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 12 }}>
  <Link href="/" style={linkStyle}>Home</Link>
  <Link href="/gallery" style={linkStyle}>Gallery</Link>
  <Link href="/settings" style={linkStyle}>Settings</Link>
  <Link href="/policies" style={linkStyle}>Policies</Link>
</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!authed ? (
            <Link href="/login" style={linkStyle}>Login</Link>
          ) : (
            <button onClick={logout} style={{ ...linkStyle, cursor: "pointer", background: "transparent", color: "inherit" }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
