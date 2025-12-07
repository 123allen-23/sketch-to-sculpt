"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";import { supabase } from "../lib/supabaseClient";

export default function DrawingLabPage() {
  const params = useSearchParams();
  const idParam = params.get("id");

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("none");

  // Load the drawing from Supabase
  useEffect(() => {
    if (!idParam) {
      setError("No drawing ID provided in the URL.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("art_gallery")
        .select("*")
        .eq("id", idParam)
        .single();

      if (error) {
        console.error("Error loading drawing:", error);
        setError("Unexpected error loading drawing.");
      } else {
        setArtwork(data);
      }

      setLoading(false);
    }

    load();
  }, [idParam]);

  // Simple CSS filter presets for pencil art
  const filterCssMap = {
    none: "none",
    graphite: "grayscale(1) contrast(1.1)",
    soft: "grayscale(0.85) contrast(1.02) brightness(1.03)",
    crisp: "grayscale(1) contrast(1.25) brightness(0.96)",
  };

  const filterCss = filterCssMap[activeFilter] || filterCssMap.none;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <p className="text-xs uppercase tracking-[0.25em] text-sky-400 mb-1">
          Sketch → Sculpt
        </p>
        <h1 className="text-3xl font-bold mb-2">Drawing Lab</h1>
        <p className="text-sm text-slate-400 mb-6">
          Refine, enhance, and prep this sketch for the pipeline. Mock mode is
          active — no real AI charges.
        </p>

        <p className="text-xs text-slate-500 mb-4">ID: {idParam}</p>

        {/* States */}
        {loading && (
          <p className="text-sm text-slate-400">Loading drawing…</p>
        )}

        {!loading && error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}

        {!loading && !error && artwork && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
            {/* LEFT: Image */}
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">{artwork.title}</h2>
                <p className="text-xs text-slate-400">
                  {artwork.category} • uploaded{" "}
                  {artwork.created_at
                    ? new Date(artwork.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center max-h-[75vh]">
                {artwork.image_url ? (
<img
  ref={imageRef}
  src={artwork.image_url}
  alt={artwork.title || "Artwork"}
  className="max-h-[70vh] mx-auto rounded-xl border border-slate-700 bg-slate-900 object-contain"
/>                ) : (
                  <p className="text-sm text-slate-500 p-6">
                    No image URL saved for this drawing.
                  </p>
                )}
              </div>
            </section>

            {/* RIGHT: Filters + Story */}
            <section className="space-y-6">
              {/* Filters */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                  Pencil Art Filters
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "none", label: "Original" },
                    { id: "graphite", label: "Deep Graphite" },
                    { id: "soft", label: "Soft Shade" },
                    { id: "crisp", label: "Crisp Lines" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        activeFilter === f.id
                          ? "bg-sky-500/20 border-sky-400 text-sky-100"
                          : "border-slate-600 text-slate-300 hover:border-sky-400 hover:text-sky-100"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story */}
              {artwork.story && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                    Story
                  </p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {artwork.story}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
                <p>Mock mode only — no AI charges yet.</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
