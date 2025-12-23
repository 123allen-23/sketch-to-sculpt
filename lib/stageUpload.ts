import { supabase } from "@/lib/supabaseClient";

export async function uploadStageImage(opts: {
  artworkId: string;
  stage: "original" | "refined" | "render" | "sculpt";
  file: File;
}) {
  const { artworkId, stage, file } = opts;

  // 1) Must be logged in
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const uid = authData.user?.id;
  if (!uid) throw new Error("Not logged in.");

  // 2) Figure out next version number (DB source of truth)
  const { data: latest, error: latestErr } = await supabase
    .from("artwork_stages")
    .select("version")
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .order("version", { ascending: false })
    .limit(1);

  if (latestErr) throw latestErr;

  const nextVersion = ((latest?.[0]?.version as number | null) ?? 0) + 1;

  // 3) Upload to Storage
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";

  const path = `portfolio/${uid}/${artworkId}/${stage}/${Date.now()}-v${nextVersion}.${safeExt}`;

  const { error: upErr } = await supabase.storage
    .from("art-images")
    .upload(path, file, { upsert: false });

  if (upErr) throw upErr;

  // 4) Public URL
  const { data: pub } = supabase.storage.from("art-images").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  // 5) Flip current -> false (for this stage), then insert new row as current
  const { error: flipErr } = await supabase
    .from("artwork_stages")
    .update({ is_current: false })
    .eq("artwork_id", artworkId)
    .eq("stage", stage)
    .eq("is_current", true);

  if (flipErr) throw flipErr;

  const { error: insErr } = await supabase.from("artwork_stages").insert({
    artwork_id: artworkId,
    stage,
    image_url: publicUrl,
    version: nextVersion,
    is_current: true,
  });

  if (insErr) throw insErr;

  return { publicUrl, nextVersion, path };
}
