"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Original");
  const [story, setStory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();

    if (!imageFile) {
      setError("Please choose an image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Upload image to Supabase Storage
      const fileName = `drawing_${Date.now()}.jpg`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("art-images") // make sure your bucket is named this
        .upload(fileName, imageFile);

      if (storageError) throw storageError;

      const imageUrl =
        supabase.storage.from("art-images").getPublicUrl(fileName).data.publicUrl;

      // 2. Insert DB record
      const { data, error: dbError } = await supabase
        .from("art_gallery")
        .insert([
          {
            title,
            category,
            story,
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Redirect to drawing page
      router.push(`/drawing?id=${data.id}`);

    } catch (err) {
      console.error(err);
      setError("Upload failed. " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Upload Drawing</h1>

        <form onSubmit={handleUpload} className="space-y-4">

          <div>
            <label className="text-sm">Title</label>
            <input
              type="text"
              className="w-full mt-1 rounded bg-slate-900 border border-slate-700 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Category</label>
            <select
              className="w-full mt-1 rounded bg-slate-900 border border-slate-700 px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Original</option>
              <option>Refined</option>
              <option>Concept</option>
              <option>3D Sculpt</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Story (optional)</label>
            <textarea
              rows={3}
              className="w-full mt-1 rounded bg-slate-900 border border-slate-700 px-3 py-2"
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Image File</label>
            <input
              type="file"
              accept="image/*"
              className="w-full mt-1 text-slate-300"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Drawing"}
          </button>
        </form>
      </div>
    </main>
  );
}
