"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PendingItem = {
  id: string;
  artwork_id: string;
  stage: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  submitted_at: string;
  artist_user_id: string;
};

export default function ModerationPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function checkAdmin() {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return false;
    return !!data?.is_admin;
  }

  async function loadPending() {
    setLoading(true);
    setErr(null);
    setMsg(null);

    // NOTE: pending isn't readable by anon RLS, but admins can still read their own via RLS
    // For simplicity, we'll fetch pending using the service-role API route too.
    const res = await fetch("/api/public-gallery/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list_pending" }),
    });

    const json = await res.json();
    if (!res.ok) {
      setErr(json?.error || "Failed to load pending items");
      setItems([]);
    } else {
      setItems(json.items || []);
    }

    setLoading(false);
  }

  async function act(id: string, action: "approve" | "reject") {
    setMsg(null);
    setErr(null);

    const res = await fetch("/api/public-gallery/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });

    const json = await res.json();
    if (!res.ok) {
      setErr(json?.error || "Action failed");
    } else {
      setMsg(action === "approve" ? "Approved." : "Rejected.");
      await loadPending();
    }
  }

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      setIsAdmin(ok);
      if (ok) await loadPending();
      else setLoading(false);
    })();
  }, []);

  if (!isAdmin) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 34 }}>Moderation</h1>
        <div style={{ marginTop: 12, opacity: 0.8 }}>
          You are not an admin.
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34 }}>Moderation Queue</h1>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Pending submissions. Approve or reject.
      </div>

      {msg && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
          <b>Error:</b> {err}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: 16, opacity: 0.8 }}>No pending submissions.</div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 12,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                {it.stage.toUpperCase()} • {new Date(it.submitted_at).toLocaleString()}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image_url}
                alt={it.title ?? "pending"}
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12 }}
              />

              <div style={{ marginTop: 10, fontWeight: 900 }}>
                {it.title ?? "Untitled"}
              </div>
              {it.caption && (
                <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13, lineHeight: 1.45 }}>
                  {it.caption}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => act(it.id, "approve")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(80,200,120,0.15)",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => act(it.id, "reject")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,80,80,0.10)",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
