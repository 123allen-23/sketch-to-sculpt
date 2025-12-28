"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AvatarUploader from "@/components/AvatarUploader";

const card: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.02)",
  padding: 16,
  boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  cursor: "pointer",
};

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setMsg(error.message);
        return;
      }
      setEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    setBusy(true);
    setMsg(null);
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset() {
    setBusy(true);
    setMsg(null);

    try {
      const { data: u } = await supabase.auth.getUser();
      const userEmail = u.user?.email;
      if (!userEmail) throw new Error("No user email found. Please log in first.");

      // IMPORTANT: change this to your deployed domain later
      const redirectTo =
        process.env.NEXT_PUBLIC_APP_URL?.toString() || "http://localhost:3000";

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${redirectTo}/login`,
      });

      if (error) throw error;
      setMsg("Password reset email sent. Check your inbox (and spam).");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, marginTop: 10 }}>Settings</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Account controls, safety links, and app preferences.
      </p>

      {msg && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        {/* Account */}
        <section style={card}>
<section style={card}>
  <div style={{ fontWeight: 900, fontSize: 18 }}>Avatar</div>
  <div style={{ opacity: 0.75, marginTop: 6 }}>
    Upload a photo to use as your profile avatar.
  </div>
  <div style={{ marginTop: 12 }}>
    <AvatarUploader />
  </div>
</section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Account</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>
                {email ? (
                  <>
                    Signed in as <b>{email}</b>
                  </>
                ) : (
                  <>
                    Not signed in. Go to <Link href="/login">Login</Link>.
                  </>
                )}
              </div>
              {userId && (
                <div style={{ opacity: 0.55, fontSize: 12, marginTop: 6 }}>
                  User ID: {userId}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={btn} disabled={busy || !email} onClick={sendPasswordReset}>
                Reset password
              </button>
              <button style={btn} disabled={busy || !email} onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Preferences (safe placeholders for now) */}
        <section style={card}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Preferences</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            These will get real once you decide what defaults you want.
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 800 }}>Default refine preset</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>Coming soon: choose your starting preset.</div>
              </div>
              <div style={{ opacity: 0.65 }}>🔒</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 800 }}>Default 3D material</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>Coming soon: metal, clay, resin, etc.</div>
              </div>
              <div style={{ opacity: 0.65 }}>🔒</div>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section style={card}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Legal & Policies</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            The stuff you need so nobody can say you run a shady operation.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link href="/policies" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
              Policies hub
            </Link>
            <Link href="/policies/terms" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
              Terms
            </Link>
            <Link href="/policies/privacy" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
              Privacy
            </Link>
            <Link href="/policies/dmca" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
              DMCA
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
