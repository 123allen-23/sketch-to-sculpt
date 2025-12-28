"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PublicItem = {
  id: string;
  artwork_id: string;
  stage: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  submitted_at: string;
};

export default function PublicGalleryPage() {
  const [items, setItems] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("public_gallery")
      .select("id, artwork_id, stage, image_url, title, caption, submitted_at")
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(60);

    if (error) setErr(error.message);
    setItems((data as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Public Gallery</h1>
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          Curated. Approved submissions only.
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
          <b>Error:</b> {err}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: 16, opacity: 0.8 }}>
          No approved posts yet.
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
                {it.stage.toUpperCase()}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image_url}
                alt={it.title ?? "public item"}
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
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
