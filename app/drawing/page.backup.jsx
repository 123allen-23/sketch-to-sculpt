"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function DrawingLab() {
  const params = useSearchParams();
  const idParam = params.get("id");

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Load artwork from Supabase
  useEffect(() => {
    if (!idParam) {
      setError("No drawing ID provided.");
      setLoading(false);
      return;
    }

    async function loadArtwork() {
      try {
        setLoading(true);
        setError("");
        setStatus("Loading drawing...");

        const { data, error: dbError } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", idParam)
          .single();

        if (dbError) {
          console.error(dbError);
          setError("Could not load drawing.");
        } else {
          setArtwork(data);
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error loading drawing.");
      } finally {
        setLoading(false);
        setStatus("");
      }
    }

    loadArtwork();
  }, [idParam]);

  // Mock AI upgrade
  async function runUpgrade(type) {
    if (!artwork) return;

    setIsRunning(true);
    setStatus(`Sending ${type} job to AI (mock)...`);
    setError("");
    setAiMessage("Working...");

    try {
      const res = await fetch("/api/ai-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: type,
          drawingId: artwork.id,
        }),
      });

      if (!res.ok) {
        setStatus("");
        setAiMessage("AI request failed. [MOCK]");
        setError("Mock AI request failed.");
        return;
      }

      const data = await res.json();

      setStatus("Mock AI job completed.");
      setAiMessage(data.resultText || "AI pipeline complete. [MOCK]");
    } catch (err) {
      console.error(err);
      setStatus("");
      setError("Mock AI error.");
      setAiMessage("AI mock failed. [MOCK]");
    } finally {
      setIsRunning(false);
    }
  }

  // Simple render helpers
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
        <p>Loading drawing...</p>
      </main>
    );
  }

  if (error || !artwork) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
        <h1 className="text-xl font-semibold mb-2">Drawing Lab</h1>
        <p className="text-red-400">{error || "Drawing not found."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <p className="text-xs tracking-wide text-sky-400 uppercase">
            Sketch → Sculpt
          </p>
          <h1 className="text-2xl font-bold mt-1">
            Drawing Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Refine, enhance, and prep this sketch for the pipeline. Mock mode
            is active — no real AI charges.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ID: {artwork.id}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr,1.4fr]">
          {/* Left: Image + story */}
          <div className="space-y-4">
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
              {artwork.image_url ? (
                <Image
                  src={artwork.image_url}
                  alt={artwork.title || "Drawing"}
                  width={900}
                  height={900}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No image URL on this record yet.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                {artwork.title || "Untitled Drawing"}
              </h2>
              {artwork.category && (
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {artwork.category}
                </p>
              )}
              {artwork.story && (
                <p className="text-sm text-slate-200 whitespace-pre-line">
                  {artwork.story}
                </p>
              )}
            </div>
          </div>

          {/* Right: AI tools */}
          <aside className="space-y-4">
            <h3 className="text-base font-semibold">AI Tools (Mock)</h3>
            <p className="text-xs text-slate-400">
              These buttons simulate what the AI pipeline will do once
              connected. No real AI calls, no billing — just status feedback.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => runUpgrade("clean")}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-left text-sm hover:bg-slate-700/70 disabled:opacity-60"
              >
                Clean Sketch
                <p className="mt-1 text-[11px] font-normal text-slate-400">
                  Remove noise, even out tones, prep for refine. [MOCK]
                </p>
              </button>

              <button
                onClick={() => runUpgrade("refined")}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-left text-sm hover:bg-slate-700/70 disabled:opacity-60"
              >
                Refined Print
                <p className="mt-1 text-[11px] font-normal text-slate-400">
                  High-contrast graphite-style print for gallery or sale. [MOCK]
                </p>
              </button>

              <button
                onClick={() => runUpgrade("sculpt_3d")}
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-left text-sm hover:bg-slate-700/70 disabled:opacity-60"
              >
                3D Sculpt Pass
                <p className="mt-1 text-[11px] font-normal text-slate-400">
                  Treat this as a concept for 3D sculpture. [MOCK]
                </p>
              </button>
            </div>

            {/* Mock output */}
            {aiMessage && (
              <p className="mt-3 text-sm text-emerald-300">
                {aiMessage}
              </p>
            )}

            {status && (
              <p className="mt-1 text-xs text-slate-300">
                {status}
              </p>
            )}

            {error && (
              <p className="mt-1 text-xs text-red-400">
                {error}
              </p>
            )}

            {isRunning && (
              <p className="mt-1 text-xs text-sky-300">
                Running mock job…
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
