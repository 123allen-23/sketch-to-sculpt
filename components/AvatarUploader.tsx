"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

function extFromName(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "png";
}

export default function AvatarUploader() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    setAvatarUrl(data?.avatar_url ?? null);
  }

  async function uploadAvatar(file: File) {
    setBusy(true);
    setMsg(null);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error("Not signed in");

      const ext = extFromName(file.name);
      const path = `${user.id}/avatar.${ext}`;

      // 1) upload to storage (replace allowed)
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type || undefined,
        });

      if (uploadErr) throw uploadErr;

      // 2) get public URL
      const { data: pub } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("Avatar public URL missing");

      // 3) save to profile
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profErr) throw profErr;

      setAvatarUrl(publicUrl);
      setMsg("Avatar updated");
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 12,
          }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadAvatar(f);
        }}
      />

      {msg && (
        <div style={{ marginTop: 8, opacity: 0.8 }}>
          {msg}
        </div>
      )}
    </div>
  );
}
