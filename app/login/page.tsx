"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const card: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.10)",
  background:
    "radial-gradient(900px 450px at 15% 0%, rgba(120,180,255,0.16), rgba(0,0,0,0) 55%), rgba(255,255,255,0.02)",
  boxShadow: "0 10px 60px rgba(0,0,0,0.55)",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.35)",
  color: "inherit",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.10)",
  cursor: "pointer",
  fontWeight: 900,
};

const btnGhost: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "transparent",
  cursor: "pointer",
};

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If already signed in, bounce to Gallery
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/gallery";
    });
  }, []);

  async function signIn() {
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/gallery";
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    setBusy(true);
    setMsg(null);
    try {
      const redirectTo = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${redirectTo}/login` },
      });
      if (error) throw error;
      setMsg("Account created. Check your email to confirm (then come back and sign in).");
      setMode("signin");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    setBusy(true);
    setMsg(null);
    try {
      const redirectTo = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${redirectTo}/gallery` },
      });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Email link login";

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px 60px" }}>
      <section style={{ ...card, padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 18 }}>
          {/* Left: story */}
          <div style={{ padding: 10 }}>
            <div style={{ opacity: 0.85, fontWeight: 900, letterSpacing: 0.3 }}>Sketch→Sculpt</div>

            <h1 style={{ fontSize: 46, lineHeight: 1.05, margin: "14px 0 10px" }}>
              Turn sketches into{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, rgba(160,220,255,1), rgba(255,170,220,1))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                refined art & 3D previews
              </span>
              .
            </h1>

            <p style={{ fontSize: 16, opacity: 0.8, margin: 0, maxWidth: 620, lineHeight: 1.5 }}>
              Upload your drawing. Refine it with AI tools. Generate a 3D render preview. Save versions. This is a
              controlled beta and your feedback helps shape the product.
            </p>

            <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap", opacity: 0.78, fontSize: 13 }}>
              <span>✅ Versioned stages</span>
              <span>✅ Artist controls</span>
              <span>✅ Built for makers</span>
            </div>

            <div style={{ marginTop: 18, opacity: 0.7, fontSize: 13, lineHeight: 1.5 }}>
              By continuing, you agree to our{" "}
              <Link href="/policies/terms">Terms</Link> and{" "}
              <Link href="/policies/privacy">Privacy Policy</Link>.
            </div>

            <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
              Not ready? <Link href="/">Go back home</Link>.
            </div>
          </div>

          {/* Right: auth box */}
          <div
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.45)",
              padding: 16,
              alignSelf: "start",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
            <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
              {mode === "signin" && "Welcome back. Let’s make something real."}
              {mode === "signup" && "Create an account to start running art through the pipeline."}
              {mode === "magic" && "We’ll email you a one-click sign-in link."}
            </div>

            {msg && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                {msg}
              </div>
            )}

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Email</div>
                <input
                  style={input}
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>

              {mode !== "magic" && (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Password</div>
                  <input
                    style={input}
                    type="password"
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                  />
                </div>
              )}

              {mode === "signin" && (
                <button style={btnPrimary} disabled={busy || !email || !password} onClick={signIn}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              )}

              {mode === "signup" && (
                <button style={btnPrimary} disabled={busy || !email || !password} onClick={signUp}>
                  {busy ? "Creating…" : "Create account"}
                </button>
              )}

              {mode === "magic" && (
                <button style={btnPrimary} disabled={busy || !email} onClick={sendMagicLink}>
                  {busy ? "Sending…" : "Send magic link"}
                </button>
              )}

              <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                <button
                  style={btnGhost}
                  disabled={busy}
                  onClick={() => {
                    setMsg(null);
                    setMode(mode === "signin" ? "signup" : "signin");
                  }}
                >
                  {mode === "signin" ? "Create an account instead" : "I already have an account"}
                </button>

                <button
                  style={btnGhost}
                  disabled={busy}
                  onClick={() => {
                    setMsg(null);
                    setMode(mode === "magic" ? "signin" : "magic");
                  }}
                >
                  {mode === "magic" ? "Use password instead" : "Use magic link instead"}
                </button>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
                Beta note: don’t upload anything you wouldn’t share with a trusted tester yet. You still own your work.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
