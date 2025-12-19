'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'
export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    setMsg('');
    if (!file) return setMsg('Pick a file first.');

    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('Not logged in.');

      // 1) Create gallery row
      const { data: gallery, error: gErr } = await supabase
        .from('art_gallery')
        .insert({
          artist_id: user.id,
          title: title?.trim() || 'Untitled',
        })
        .select('*')
        .single();

      if (gErr) throw new Error(gErr.message);

      // 2) Upload file to originals bucket
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `${user.id}/${gallery.id}/${Date.now()}_original.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('originals')
        .upload(filePath, file, { upsert: true });

      if (upErr) throw new Error(upErr.message);

      // 3) Get public url
      const { data: pub } = supabase.storage.from('originals').getPublicUrl(filePath);
      const url = pub?.publicUrl;
      if (!url) throw new Error('Could not get public URL.');

      // 4) Insert asset row
      const { error: aErr } = await supabase.from('art_gallery_assets').insert({
        gallery_id: gallery.id,
        artist_id: user.id,
        kind: 'original',
        url,
        status: 'ready',
      });

      if (aErr) throw new Error(aErr.message);

      setMsg(`Uploaded ✅ Gallery ID: ${gallery.id}`);
      setTitle('');
      setFile(null);
    } catch (err) {
      setMsg(`❌ ${err.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Upload a New Original</h1>

      <form onSubmit={handleUpload} style={{ display: 'grid', gap: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{ padding: 10, borderRadius: 10 }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button disabled={busy} style={{ padding: 12, borderRadius: 12 }}>
          {busy ? 'Uploading…' : 'Upload Original'}
        </button>

        {msg && <div style={{ opacity: 0.9 }}>{msg}</div>}
      </form>
    </div>
  );
}
