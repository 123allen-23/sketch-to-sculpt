"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadStageImage } from "@/lib/stageUpload";

type Stage = "original" | "refined" | "render" | "sculpt";

type MaterialKey =
  | "stainless"
  | "black_titanium"
  | "bronze"
  | "raw_clay"
  | "resin"
  | "polished_chrome"
  | "weathered_iron";

const MATERIALS: { key: MaterialKey; label: string; prompt: string }[] = [
  { key: "stainless", label: "Stainless steel", prompt: "realistic stainless steel sculpture, subtle brushed metal" },
  { key: "black_titanium", label: "Black titanium", prompt: "black titanium sculpture, sleek satin finish" },
  { key: "bronze", label: "Bronze", prompt: "bronze sculpture, warm metal tones, slight patina" },
  { key: "raw_clay", label: "Raw clay", prompt: "clay maquette sculpture, hand-formed texture, matte" },
  { key: "resin", label: "Resin", prompt: "resin sculpture, smooth surface, semi-matte" },
  { key: "polished_chrome", label: "Polished chrome", prompt: "highly polished chrome sculpture, strong reflections" },
  { key: "weathered_iron", label: "Weathered iron", prompt: "weathered iron sculpture, industrial texture, light rust" },
];

const CAMERA = [
  "front view",
  "3/4 view",
  "side view",
  "top-down angled",
  "dramatic low angle",
];

const LIGHTING = [
  "soft studio lighting",
  "hard rim light",
  "dramatic spotlight",
  "even showroom lighting",
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

export default function RenderControls({
  artworkId,
  onUpdated,
}: {
  artworkId: string;
  onUpdated?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [material, setMaterial] = useState<MaterialKey>("stainless");
  const [detail, setDetail] = useState(70);
  const [camera, setCamera] = useState(CAMERA[1]);
  const [lighting, setLighting] = useState(LIGHTING[0]);
  const [base, setBase] = useState(true);
  const [notes, setNotes] = useState("");

  const [refinedUrl, setRefinedUrl] = useState<string | null>(null);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);

  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [compare, setCompare] = useState(false);

  const computedPrompt = useMemo(() => {
    const mat = MATERIALS.find((m) => m.key === material)?.prompt ?? "realistic metal sculpture";
    const detailLine =
      detail < 34
        ? "simplified forms, lower micro-detail, clean surfaces"
        : detail > 66
        ? "high micro-detail, crisp edges, enhanced surface definition"
        : "medium detail, clean edges";

    return [
      "Create a high-quality 3D render preview of this design as a physical sculpture.",
      "Preserve the exact silhouette and key internal shapes. Do not add new objects.",
      `Material: ${mat}.`,
      `Camera: ${camera}.`,
      `Lighting: ${lighting}.`,
      `Detail level: ${detailLine}.`,
      base ? "Include a simple clean pedestal base (minimal, not distracting)." : "No base.",
      "Clean neutral background.",
      notes?.trim() ? `Artist notes: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [material, detail, camera, lighting, base, notes]);

  async function refreshUrls() {
    const r = await getCurrentStageUrl(artworkId, "refined");
    const p = await getCurrentStageUrl(artworkId, "render");
    setRefinedUrl(r.url ?? null);
    setRenderUrl(p.url ?? null);
  }

  useEffect(() => {
    refreshUrls().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  async function generateRender() {
    setBusy(true);
    setMsg(null);

    try {
      const r = await getCurrentStageUrl(artworkId, "refined");
      if (!r.url) throw new Error("No current Refined found. Generate Refined first.");

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: r.url, prompt: computedPrompt }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error ?? "Render API failed");

      const renderFile = b64ToFile(j.b64, `render-${Date.now()}.png`, j.outputType || "image/png");

      await uploadStageImage({
        artworkId,
        stage: "render" as any,
        file: renderFile,
      });

      await supabase
        .from("artwork_stages")
        .update({
          meta: {
            material,
            detail,
            camera,
            lighting,
            base,
            notes,
            prompt: computedPrompt,
          },
        })
        .eq("artwork_id", artworkId)
        .eq("stage", "render")
        .eq("is_current", true);

      setMsg("3D Render generated.");
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
      const rows = await listStageVersions(artworkId, "render");
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
        .eq("stage", "render")
        .eq("is_current", true);

      const { error } = await supabase
        .from("artwork_stages")
        .update({ is_current: true })
        .eq("artwork_id", artworkId)
        .eq("stage", "render")
        .eq("version", version);

      if (error) throw new Error(error.message);

      setMsg(`Set render v${version} as current`);
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
        <div className="font-semibold">3D Render Tools</div>
        <div className="flex gap-2">
          <button className="border rounded px-2 py-1" disabled={busy} onClick={() => setCompare((v) => !v)}>
            {compare ? "Hide Compare" : "Compare"}
          </button>
          <button className="border rounded px-2 py-1" disabled={busy} onClick={openVersions}>
            Versions
          </button>
          {renderUrl && (
            <a className="border rounded px-2 py-1 inline-block" href={renderUrl} target="_blank" rel="noreferrer">
              Download
            </a>
          )}
        </div>
      </div>

      {compare && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs opacity-70 mb-1">Refined</div>
            {refinedUrl ? <img src={refinedUrl} className="w-full rounded border" /> : <div className="text-sm">None</div>}
          </div>
          <div>
            <div className="text-xs opacity-70 mb-1">3D Render (current)</div>
            {renderUrl ? <img src={renderUrl} className="w-full rounded border" /> : <div className="text-sm">None</div>}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Material</label>
          <select className="border rounded px-2 py-1 w-full" value={material} onChange={(e) => setMaterial(e.target.value as MaterialKey)} disabled={busy}>
            {MATERIALS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>

          <label className="text-sm font-medium">Detail ({detail})</label>
          <input type="range" min={0} max={100} value={detail} disabled={busy} onChange={(e) => setDetail(parseInt(e.target.value, 10))} className="w-full" />

          <label className="text-sm font-medium">Camera</label>
          <select className="border rounded px-2 py-1 w-full" value={camera} onChange={(e) => setCamera(e.target.value)} disabled={busy}>
            {CAMERA.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="text-sm font-medium">Lighting</label>
          <select className="border rounded px-2 py-1 w-full" value={lighting} onChange={(e) => setLighting(e.target.value)} disabled={busy}>
            {LIGHTING.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={base} onChange={(e) => setBase(e.target.checked)} disabled={busy} />
            Include pedestal base
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea className="border rounded p-2 w-full" rows={6} value={notes} disabled={busy} onChange={(e) => setNotes(e.target.value)} placeholder="Example: make the base wider and keep sharp edges on the fins." />
        </div>
      </div>

      <div className="text-xs opacity-70">
        Prompt preview:
        <pre className="border rounded p-2 mt-1 whitespace-pre-wrap">{computedPrompt}</pre>
      </div>

      <div className="flex gap-2">
        <button className="border rounded px-3 py-2" disabled={busy} onClick={generateRender}>
          {busy ? "Working..." : "Generate / Regenerate 3D Render"}
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
            <div className="font-medium">3D Render Versions</div>
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
            {!versions.length && <div className="text-sm opacity-70">No render versions yet.</div>}
          </div>
        </div>
      )}

      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
