"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [message, setMessage] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage("");

    // 1. Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      setMessage("Error getting session.");
      setLoading(false);
      return;
    }

    const user = session?.user;
    if (!user) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    // 2. Load profile row
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Load profile error:", error);
      setMessage("Error loading profile.");
      setLoading(false);
      return;
    }

    setDisplayName(
      data?.full_name || data?.display_name || data?.name || ""
    );

    setBio(
      data?.bio ||
        data?.about ||
        "I turn pencil sketches into gallery-ready pieces."
    );

    setAvatarUrl(data?.avatar_url || data?.avatar || "");

    setLoading(false);
  }

  async function uploadAvatar(file, userId) {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to the **avatars** bucket (lowercase)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setMessage("Error uploading avatar.");
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // Grab user again (simple + safe)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setMessage("You must be logged in to save your profile.");
      setSaving(false);
      return;
    }

    const user = session.user;
    let newAvatarUrl = avatarUrl;

    // If a new file is picked, upload it
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar(avatarFile, user.id);
      if (uploadedUrl) {
        newAvatarUrl = uploadedUrl;
        setAvatarUrl(uploadedUrl);
      }
    }

    // Upsert into profiles table
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: displayName,
        bio: bio,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Save profile error:", error);
      setMessage("Error saving profile.");
      setSaving(false);
      return;
    }

    setMessage("Profile saved.");
    setSaving(false);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
  }

  // ───────────────── UI ─────────────────

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading profile…</p>
      </main>
    );
  }

  if (notLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="mb-6 text-slate-300">
          You&apos;re not logged in. Log in and reload this page.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-slate-900/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border border-slate-600 bg-slate-800 flex items-center justify-center">
{avatarUrl ? (
  <Image
    src={avatarUrl}
    alt="Avatar"
    width={112}   // 28 * 4
    height={112}
    className="rounded-full object-cover"
  />
) : (
  <span className="text-slate-400 text-sm text-center px-2">
    No avatar yet
  </span>
)}          </div>
          <label className="mt-4 inline-flex items-center px-3 py-2 rounded-full border border-slate-600 text-sm cursor-pointer hover:bg-slate-800">
            Choose avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Display name */}
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input
              type="text"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Capn, SketchSmith, etc."
            />
          </div>

          {/* “What I create” / bio */}
          <div>
            <label className="block text-sm mb-1">
              What I create (bio)
            </label>
            <textarea
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500 min-h-[90px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I turn pencil sketches into sculptures, prints, and gallery-ready art."
            />
          </div>

          {/* Status message */}
          {message && message !== "Profile saved." && (
            <p className="text-xs text-red-400 mt-1">{message}</p>
          )}
          {message === "Profile saved." && (
            <p className="text-xs text-emerald-400 mt-1">
              Profile saved successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
