"use client";

import { useState } from "react";
import { uploadStageImage, Stage } from "@/lib/stageUpload";

export default function StageUploader({ artworkId }: { artworkId: string }) {
  const [stage, setStage] = useState<Stage>("original");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function doUpload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await uploadStageImage({ artworkId, stage, file });
      setMsg(`Uploaded ${stage} v${res.nextVersion}`);
      setFile(null);
      // optional: force refresh by reloading page or calling your fetchAll()
      // window.location.reload();
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 10, padding: 12, border: "1px solid #333", borderRadius: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Stage:&nbsp;
          <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
            <option value="original">Original</option>
            <option value="refined">Refined</option>
            <option value="render">3D Render</option>
            <option value="sculpt">Sculpt</option>
          </select>
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={doUpload}
          disabled={!file || busy}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #333", cursor: "pointer" }}
        >
          {busy ? "Uploading..." : "Upload new version"}
        </button>
      </div>

      {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
}
