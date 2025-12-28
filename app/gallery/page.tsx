"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StageUploader from "@/components/StageUploader";
import RefineControls from "@/components/RefineControls";
import RenderControls from "@/components/RenderControls";

type Artwork = {
  id: string;
  title: string | null;
  status: string | null; // draft | published
  created_at: string | null;
  user_id: string | null;
  deleted_at: string | null;
};

type StageRow = {
  id: string;
  artwork_id: string;
  stage: "original" | "refined" | "render" | "sculpt" | string;
  image_url: string | null;
  version: number | null;
  is_current: boolean | null;
  created_at: string | null;
  deleted_at: string | null;
};

const STAGES = ["original", "refined", "render", "sculpt"] as const;

function fmtDate(s?: string | null) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return String(s);
  }
}

function stageLabel(stage: string) {
  switch (stage) {
    case "original":
      return "Original";
    case "refined":
      return "Refined";
    case "render":
      return "3D Render";
    case "sculpt":
      return "Sculpt";
    default:
      return stage;
  }
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [showTrash, setShowTrash] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [stages, setStages] = useState<StageRow[]>([]);

  // ✅ hooks live ABOVE return, always
  const stagesByArtwork = useMemo(() => {
    const map = new Map<string, Partial<Record<(typeof STAGES)[number], StageRow>>>();

    for (const row of stages) {
      if (!row.artwork_id) continue;
      const key = row.stage as (typeof STAGES)[number];
      if (!STAGES.includes(key)) continue;

      if (!map.has(row.artwork_id)) map.set(row.artwork_id, {});
      const bucket = map.get(row.artwork_id)!;

      // prefer current row; otherwise keep first seen
      if (!bucket[key] || row.is_current) bucket[key] = row;
    }

    return map;
  }, [stages]);

  async function fetchAll() {
    setLoading(true);
    setErr(null);

    try {
      // 1) artworks
      let aq = supabase
        .schema("public")
        .from("artworks")
        .select("id,title,status,created_at,user_id,deleted_at")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: artworkData, error: artworkError } = showTrash
        ? await aq.not("deleted_at", "is", null)
        : await aq.is("deleted_at", null);

      if (artworkError) throw artworkError;

      const arts = (artworkData as Artwork[]) ?? [];
      setArtworks(arts);

      const ids = arts.map((a) => a.id).filter(Boolean);

      if (ids.length === 0) {
        setStages([]);
        return;
      }

      // 2) stages (only current + not deleted when not trash)
      let sq = supabase
        .schema("public")
        .from("artwork_stages")
        .select("id,artwork_id,stage,image_url,version,is_current,created_at,deleted_at")
        .in("artwork_id", ids)
        .order("created_at", { ascending: false });

      const { data: stageData, error: stageError } = showTrash
        ? await sq
        : await sq.is("deleted_at", null);

      if (stageError) throw stageError;

      setStages((stageData as StageRow[]) ?? []);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrash]);

  async function createArtwork() {
    setErr(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) throw new Error("You must be logged in to create artwork.");

      const title = prompt("Artwork title?", "Untitled");
      if (title === null) return;

      const { error } = await supabase
        .schema("public")
        .from("artworks")
        .insert({
          title: title.trim() || "Untitled",
          status: "draft",
          user_id: uid,
        });

      if (error) throw error;

      await fetchAll();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function togglePublish(a: Artwork) {
    setErr(null);
    try {
      const next = a.status === "published" ? "draft" : "published";

      const { error } = await supabase
        .schema("public")
        .from("artworks")
        .update({ status: next })
        .eq("id", a.id);

      if (error) throw error;

      await fetchAll();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function softDeleteArtwork(a: Artwork) {
    setErr(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id ?? null;

      const now = new Date().toISOString();

      const { error: e1 } = await supabase
        .schema("public")
        .from("artworks")
        .update({ deleted_at: now, deleted_by: uid })
        .eq("id", a.id);

      if (e1) throw e1;

      const { error: e2 } = await supabase
        .schema("public")
        .from("artwork_stages")
        .update({ deleted_at: now, deleted_by: uid })
        .eq("artwork_id", a.id);

      if (e2) throw e2;

      await fetchAll();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function restoreArtwork(a: Artwork) {
    setErr(null);
    try {
      const { error: e1 } = await supabase
        .schema("public")
        .from("artworks")
        .update({ deleted_at: null, deleted_by: null })
        .eq("id", a.id);

      if (e1) throw e1;

      const { error: e2 } = await supabase
        .schema("public")
        .from("artwork_stages")
        .update({ deleted_at: null, deleted_by: null })
        .eq("artwork_id", a.id);

      if (e2) throw e2;

      await fetchAll();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Gallery</h1>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            {showTrash ? "Trash view" : "Active artworks"} • {loading ? "Loading…" : `${artworks.length} items`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowTrash((v) => !v)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
          >
            {showTrash ? "Back to Gallery" : "View Trash"}
          </button>

          {!showTrash && (
            <button
              onClick={createArtwork}
              style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
            >
              Create Artwork
            </button>
          )}

          <button
            onClick={fetchAll}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #333" }}>
          <b>Error:</b> {err}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading…</div>
      ) : artworks.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          {showTrash ? "Trash is empty." : "No artworks yet. Click Create Artwork."}
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
          {artworks.map((a) => {
            const stageBucket = stagesByArtwork.get(a.id) || {};
            const completed = STAGES.filter((s) => stageBucket[s]).length;

            return (
              <div
                key={a.id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>
                      {a.title || "Untitled"}{" "}
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        ({completed}/{STAGES.length})
                      </span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                      {a.status || "draft"} • {fmtDate(a.created_at)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!showTrash ? (
                      <>
                        <button
                          onClick={() => togglePublish(a)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
                        >
                          {a.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => softDeleteArtwork(a)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
                        >
                          Trash
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => restoreArtwork(a)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #333", background: "transparent", cursor: "pointer" }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>

{/* ===== PIPELINE CONTROLS ===== */}
{!showTrash && (
  <div style={{ marginTop: 12 }}>
    {/* Upload / stage selector */}
    <StageUploader artworkId={a.id} />

    {/* Refined stage tools */}
    <div style={{ marginTop: 12 }}>
      <RefineControls
        artworkId={a.id}
        onUpdated={() => window.location.reload()}
      />
    </div>

    {/* 3D Render stage tools */}
    <div style={{ marginTop: 12 }}>
      <RenderControls
        artworkId={a.id}
        onUpdated={() => window.location.reload()}
      />
    </div>
  </div>
)}               
                   <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {STAGES.map((s) => {
                    const row = stageBucket[s];
                    return (
                      <div key={s} style={{ border: "1px solid #333", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: 10, fontWeight: 700 }}>{stageLabel(s)}</div>
                        {row?.image_url ? (
                          <img
                            src={row.image_url}
                            alt={`${a.title || "Artwork"} ${s}`}
                            style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <div style={{ padding: 10, fontSize: 12, opacity: 0.7 }}>No image yet.</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
