import { supabase } from "@/lib/supabaseClient";

export type Stage = "original" | "refined" | "render" | "sculpt";

type UploadStageArgs = {
  artworkId: string;
  stage: Stage;
  file: File;
};

export async function uploadStageImage({
  artworkId,
  stage,
  file,
}: UploadStageArgs) {
  if (!artworkId) throw new Error("missing artworkId");
  if (!stage) throw new Error("missing stage");
  if (!file) throw new Error("missing file");

  // 1) get next version number
  const { data: last, error: lastErr } = await supabase
    .from("artwork_stages")
    .select("version")
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) throw new Error(`version lookup failed: ${lastErr.message}`);

  const nextVersion = (last?.version ?? 0) + 1;

  // 2) upload to storage (unique path, never collides)
  const ext = file.name.split(".").pop() || "png";
  const path = `artworks/${artworkId}/${stage}/v${nextVersion}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("art-images")
    .upload(path, file, {
      upsert: false,
      contentType: file.type || "image/png",
    });

  if (uploadErr) throw new Error(`storage upload failed: ${uploadErr.message}`);

  // 3) get public URL
  const { data: pub } = supabase.storage
    .from("art-images")
    .getPublicUrl(path);

  const imageUrl = pub?.publicUrl;
  if (!imageUrl) throw new Error("failed to get public URL");

  // 4) clear previous current row for this artwork + stage
  const { error: clearErr } = await supabase
    .from("artwork_stages")
    .update({ is_current: false })
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .eq("is_current", true);

  if (clearErr) throw new Error(`failed to clear current: ${clearErr.message}`);

  // 5) insert new stage row as current
  const { error: insertErr } = await supabase
    .from("artwork_stages")
    .insert({
      artwork_id: artworkId,
      stage,
      version: nextVersion,
      image_url: imageUrl,
      is_current: true,
    });

  if (insertErr) throw new Error(`stage insert failed: ${insertErr.message}`);

  return {
    artworkId,
    stage,
    version: nextVersion,
    imageUrl,
    storagePath: path,
  };
}
