"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, bounce to gallery
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/gallery");
    });
  }, [router]);

  async function sendLink() {
    setMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/gallery`,
        },
      });
      if (error) throw error;
      setMsg("Check your email for the login link.");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMsg("Signed out.");
  }

  return (
    <main style={{ padding: 32, maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Login</h1>
      <p style={{ marginTop: 10 }}>
        This is required because your database has RLS on (good). No login = no writes.
      </p>

      <div style={{ marginTop: 18 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            background: "transparent",
          }}
        />
        <button
          onClick={sendLink}
          disabled={loading || !email.trim()}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>

        <button
          onClick={signOut}
          style={{
            marginTop: 12,
            marginLeft: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>

        {msg && <p style={{ marginTop: 14 }}>{msg}</p>}
      </div>
    </main>
  );
}
