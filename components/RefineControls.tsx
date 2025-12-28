"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadStageImage } from "@/lib/stageUpload";

type Stage = "original" | "refined" | "render" | "sculpt";

type PresetKey =
  | "clean_contrast"
  | "remove_noise"
  | "ink_outline"
  | "graphite_detail"
  | "tattoo_stencil"
  | "comic"
  | "blueprint"
  | "metal_etch"
  | "soft_pencil";

const PRESETS: { key: PresetKey; label: string; prompt: string }[] = [
  {
    key: "clean_contrast",
    label: "Clean lines + Boost contrast",
    prompt:
      "Clean up the drawing. Sharpen and clarify linework, increase contrast, remove smudges and background noise, preserve the original design exactly.",
  },
  {
    key: "remove_noise",
    label: "Remove background noise",
    prompt:
      "Remove paper texture, dust, and smudges. Keep only the original pencil/ink marks. Preserve the exact shapes and proportions.",
  },
  {
    key: "ink_outline",
    label: "Inked outline",
    prompt:
      "Convert to crisp ink linework with clean outlines. Minimal shading. Preserve original silhouette and details. No new objects.",
  },
  {
    key: "graphite_detail",
    label: "High-detail graphite",
    prompt:
      "Enhance graphite shading and depth while keeping the exact composition. Improve gradient smoothness, preserve pencil texture, remove random noise.",
  },
  {
    key: "tattoo_stencil",
    label: "Tattoo stencil",
    prompt:
      "Create a tattoo-ready stencil: bold clean lines, simplified shading, strong readability, pure white background. Preserve original structure.",
  },
  {
    key: "comic",
    label: "Comic style",
    prompt:
      "Stylize into clean comic line art with controlled shading. Keep the design intact. No new elements. High readability.",
  },
  {
    key: "blueprint",
    label: "Blueprint / technical",
    prompt:
      "Transform into a technical blueprint-style illustration: clean lines, consistent geometry, minimal shading, high clarity. Preserve original design.",
  },
  {
    key: "metal_etch",
    label: "Metal etched look",
    prompt:
      "Create a metal-etched engraving look: crisp etched lines, controlled crosshatching, strong contrast. Preserve original silhouette and details.",
  },
  {
    key: "soft_pencil",
    label: "Soft pencil refinement",
    prompt:
      "Keep it pencil. Smooth the shading, reduce harsh smudges, improve line clarity, preserve the original feel and design exactly.",
  },
];

const CHIPS = [
  "sharpen edges",
  "remove smudges",
  "increase contrast",
  "reduce background texture",
  "clean outlines",
  "tighten symmetry",
  "preserve silhouette",
  "no new objects",
  "pure white background",
  "keep pencil texture",
];

function b64ToFile(b64: string, filename: string, mime: string) {
  const byteChars = atob(b64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNums);
  return new File([byteArray], filename, { type: mime });
}

async function getCurrentStageUrl(artworkId: string, stage: Stage) {
  const { data, error } = await supabase
    .from("artwork_stages")
    .select("image_url, version")
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .eq("is_current", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { url: data?.image_url as string | undefined, version: data?.version as number | undefined };
}

async function listStageVersions(artworkId: string, stage: Stage) {
  const { data, error } = await supabase
    .from("artwork_stages")
    .select("id, version, image_url, created_at, is_current, meta")
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .order("version", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function RefineControls({
  artworkId,
  onUpdated,
}: {
  artworkId: string;
  onUpdated?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [preset, setPreset] = useState<PresetKey>("clean_contrast");
  const [strength, setStrength] = useState(55);
  const [chips, setChips] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [notes, setNotes] = useState("");

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [refinedUrl, setRefinedUrl] = useState<string | null>(null);

  const [compare, setCompare] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  const computedPrompt = useMemo(() => {
    const base = PRESETS.find((p) => p.key === preset)?.prompt ?? "";
    const chipLine = chips.length ? `\nExtra adjustments: ${chips.join(", ")}.` : "";
    const strengthLine =
      strength < 34
        ? "\nApply subtle refinement. Keep very close to the original."
        : strength > 66
        ? "\nApply strong refinement while preserving the design."
        : "\nApply medium refinement while preserving the design.";
    const user = customPrompt.trim() ? `\nUser request: ${customPrompt.trim()}` : "";
    return `${base}${strengthLine}${chipLine}${user}`.trim();
  }, [preset, strength, chips, customPrompt]);

  async function refreshUrls() {
    const o = await getCurrentStageUrl(artworkId, "original");
    const r = await getCurrentStageUrl(artworkId, "refined");
    setOriginalUrl(o.url ?? null);
    setRefinedUrl(r.url ?? null);
  }

  useEffect(() => {
    refreshUrls().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  function toggleChip(c: string) {
    setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function generateRefined() {
    setBusy(true);
    setMsg(null);

    try {
      const o = await getCurrentStageUrl(artworkId, "original");
      if (!o.url) throw new Error("No current Original found. Upload Original first.");

      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: o.url, prompt: computedPrompt }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error ?? "Refine API failed");

      const refinedFile = b64ToFile(j.b64, `refined-${Date.now()}.png`, j.outputType || "image/png");

      await uploadStageImage({
        artworkId,
        stage: "refined" as any,
        file: refinedFile,
      });

      // Save meta/notes to the current refined row (optional but nice)
      await supabase
        .from("artwork_stages")
        .update({
          meta: {
            preset,
            strength,
            chips,
            customPrompt,
            notes,
            prompt: computedPrompt,
          },
        })
        .eq("artwork_id", artworkId)
        .eq("stage", "refined")
        .eq("is_current", true);

      setMsg("Refined generated.");
      await refreshUrls();
      onUpdated?.();
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function openVersions() {
    setVersionsOpen(true);
    setBusy(true);
    setMsg(null);
    try {
      const rows = await listStageVersions(artworkId, "refined");
      setVersions(rows);
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function setAsCurrent(version: number) {
    setBusy(true);
    setMsg(null);
    try {
      await supabase
        .from("artwork_stages")
        .update({ is_current: false })
        .eq("artwork_id", artworkId)
        .eq("stage", "refined")
        .eq("is_current", true);

      const { error } = await supabase
        .from("artwork_stages")
        .update({ is_current: true })
        .eq("artwork_id", artworkId)
        .eq("stage", "refined")
        .eq("version", version);

      if (error) throw new Error(error.message);

      setMsg(`Set refined v${version} as current`);
      await refreshUrls();
      onUpdated?.();
      await openVersions();
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Refined Tools</div>
        <div className="flex gap-2">
          <button className="border rounded px-2 py-1" disabled={busy} onClick={() => setCompare((v) => !v)}>
            {compare ? "Hide Compare" : "Compare"}
          </button>
          <button className="border rounded px-2 py-1" disabled={busy} onClick={openVersions}>
            Versions
          </button>
          {refinedUrl && (
            <a className="border rounded px-2 py-1 inline-block" href={refinedUrl} target="_blank" rel="noreferrer">
              Download
            </a>
          )}
        </div>
      </div>

      {compare && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs opacity-70 mb-1">Original</div>
            {originalUrl ? <img src={originalUrl} className="w-full rounded border" /> : <div className="text-sm">None</div>}
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">Refined (current)</div>
            {refinedUrl ? <img src={refinedUrl} className="w-full rounded border" /> : <div className="text-sm">None</div>}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preset</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetKey)}
            disabled={busy}
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium">Strength ({strength})</label>
          <input
            type="range"
            min={0}
            max={100}
            value={strength}
            disabled={busy}
            onChange={(e) => setStrength(parseInt(e.target.value, 10))}
            className="w-full"
          />

          <label className="text-sm font-medium">Quick tweaks</label>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => {
              const active = chips.includes(c);
              return (
                <button
                  key={c}
                  className={`border rounded px-2 py-1 text-xs ${active ? "bg-black text-white" : ""}`}
                  disabled={busy}
                  onClick={() => toggleChip(c)}
                  type="button"
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom request</label>
          <textarea
            className="border rounded p-2 w-full"
            rows={3}
            value={customPrompt}
            disabled={busy}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Example: Make it look like etched steel, but keep the exact silhouette."
          />

          <label className="text-sm font-medium">Notes</label>
          <textarea
            className="border rounded p-2 w-full"
            rows={3}
            value={notes}
            disabled={busy}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Artist notes for this refined version..."
          />
        </div>
      </div>

      <div className="text-xs opacity-70">
        Prompt preview:
        <pre className="border rounded p-2 mt-1 whitespace-pre-wrap">{computedPrompt}</pre>
      </div>

      <div className="flex gap-2">
        <button className="border rounded px-3 py-2" disabled={busy} onClick={generateRefined}>
          {busy ? "Working..." : "Generate / Regenerate"}
        </button>
        <button
          className="border rounded px-3 py-2"
          disabled={busy}
          onClick={async () => {
            setMsg(null);
            try {
              await refreshUrls();
              setMsg("Refreshed.");
              onUpdated?.();
            } catch (e: any) {
              setMsg(e?.message ?? String(e));
            }
          }}
        >
          Refresh
        </button>
      </div>

      {versionsOpen && (
        <div className="border rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Refined Versions</div>
            <button className="border rounded px-2 py-1" disabled={busy} onClick={() => setVersionsOpen(false)}>
              Close
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-auto">
            {versions.map((v) => (
              <div key={v.id} className="border rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    v{v.version} {v.is_current ? "(current)" : ""}
                  </div>
                  <div className="flex gap-2">
                    <button className="border rounded px-2 py-1 text-xs" disabled={busy} onClick={() => setAsCurrent(v.version)}>
                      Set current
                    </button>
                    {v.image_url && (
                      <a className="border rounded px-2 py-1 text-xs inline-block" href={v.image_url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    )}
                  </div>
                </div>
                {v.image_url && <img src={v.image_url} className="w-full rounded border mt-2" />}
              </div>
            ))}
            {!versions.length && <div className="text-sm opacity-70">No refined versions yet.</div>}
          </div>
        </div>
      )}

      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
