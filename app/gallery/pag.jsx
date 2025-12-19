'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const KINDS = ['original', 'refined', 'render', 'sculpt'];

function groupAssetsByKind(rows = []) {
  const map = {};
  for (const a of rows) {
    if (!map[a.gallery_id]) map[a.gallery_id] = {};
    // newest wins
    if (!map[a.gallery_id][a.kind]) map[a.gallery_id][a.kind] = a;
  }
  return map;
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [galleries, setGalleries] = useState([]);
  const [assets, setAssets] = useState([]);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('Not logged in.');

      const { data: g, error: gErr } = await supabase
        .from('art_gallery')
        .select('id, title, created_at')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (gErr) throw new Error(gErr.message);

      const ids = (g || []).map((x) => x.id);
      if (!ids.length) {
        setGalleries([]);
        setAssets([]);
        return;
      }

      const { data: a, error: aErr } = await supabase
        .from('art_gallery_assets')
        .select('id, gallery_id, kind, url, status, created_at')
        .in('gallery_id', ids)
        .order('created_at', { ascending: false });

      if (aErr) throw new Error(aErr.message);

      setGalleries(g || []);
      setAssets(a || []);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const assetsByGallery = useMemo(() => groupAssetsByKind(assets), [assets]);

  async function refine(galleryId) {
    setErr('');
    try {
      const res = await fetch('/api/refine-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || 'Refine failed');

      // refresh so the refined tile fills
      await load();
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '30px auto', padding: 16 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Gallery</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        Each row is one drawing — pipeline stages go left → right.
      </div>

      {err && (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#3a0f0f' }}>
          ❌ {err}
        </div>
      )}

      {!galleries.length && <div>No art yet. Go upload one.</div>}

      <div style={{ display: 'grid', gap: 18 }}>
        {galleries.map((g) => {
          const row = assetsByGallery[g.id] || {};
          return (
            <div
              key={g.id}
              style={{
                borderRadius: 16,
                padding: 14,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{g.title}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    {new Date(g.created_at).toLocaleString()}
                  </div>
                </div>

                <button onClick={() => refine(g.id)} style={{ padding: '10px 14px', borderRadius: 12 }}>
                  Refine
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
                {KINDS.map((kind) => {
                  const a = row[kind];
                  return (
                    <div key={kind} style={{ borderRadius: 14, padding: 10, border: '1px solid rgba(255,255,255,0.10)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, textTransform: 'capitalize' }}>{kind}</div>

                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          borderRadius: 12,
                          border: '1px dashed rgba(255,255,255,0.25)',
                          display: 'grid',
                          placeItems: 'center',
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {a?.url ? (
                          <img src={a.url} alt={kind} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ opacity: 0.6 }}>Empty</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        {a?.url ? (
                          <a href={a.url} target="_blank" rel="noreferrer" style={{ opacity: 0.9 }}>
                            Open
                          </a>
                        ) : (
                          <span style={{ opacity: 0.35 }}>Open</span>
                        )}
                        <span style={{ opacity: 0.55 }}>{a?.status || 'empty'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
