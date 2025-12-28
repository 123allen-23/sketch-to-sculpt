"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadStageImage, Stage } from "@/lib/stageUpload";

export default function StageUploader({
  artworkId,
  onUploaded,
}: {
  artworkId: string;
  onUploaded?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("original");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function b64ToFile(b64: string, filename: string, mime: string) {
    const byteChars = atob(b64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    const byteArray = new Uint8Array(byteNums);
    return new File([byteArray], filename, { type: mime });
  }

  async function getCurrentOriginalUrl(id: string) {
    const { data, error } = await supabase
      .from("artwork_stages")
      .select("image_url")
      .eq("artwork_id", id)
      .eq("stage", "original")
      .eq("is_current", true)
      .maybeSingle();

    if (error) throw new Error(`could not load original: ${error.message}`);
    const url = data?.image_url;
    if (!url) throw new Error("No current original image found for this artwork");
    return url;
  }

  async function doUpload() {
    setBusy(true);
    setMsg(null);

    try {
      // AI refine: does NOT require choosing a file
      if (stage === "refined") {
        const originalUrl = await getCurrentOriginalUrl(artworkId);

        const r = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: originalUrl,
            prompt:
              "Refine this drawing: clean edges, increase contrast, reduce noise, preserve the original shape and intent. Do not add new objects.",
          }),
        });

        const j = await r.json();
        if (!r.ok) throw new Error(j?.error ?? "Refine API failed");

        const refinedFile = b64ToFile(
          j.b64,
          `refined-${Date.now()}.png`,
          j.outputType || "image/png"
        );

        const res = await uploadStageImage({ artworkId, stage: "refined", file: refinedFile });
        setMsg(`Generated refined v${res.version ?? "?"}`);
        onUploaded?.();
        return;
      }

      // Manual upload for other stages
      if (!file) {
        setMsg("Pick a file first");
        return;
      }

      const res = await uploadStageImage({ artworkId, stage, file });
      setMsg(`Uploaded ${stage} v${res.version ?? "?"}`);
      setFile(null);
      onUploaded?.();
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm">Stage:</label>
        <select
          className="border rounded px-2 py-1"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage)}
          disabled={busy}
        >
          <option value="original">Original</option>
          <option value="refined">Refined</option>
          <option value="render">3D Render</option>
          <option value="sculpt">Sculpt</option>
        </select>
      </div>

      {stage !== "refined" && (
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      )}

      <button
        className="border rounded px-3 py-1"
        disabled={busy || (stage !== "refined" && !file)}
        onClick={doUpload}
      >
        {busy ? "Working..." : stage === "refined" ? "Generate Refined" : "Upload"}
      </button>

      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
