'use client'

import { useEffect, useMemo, useState } from 'react'
import supabase from '../../lib/supabaseClient'

export default function GalleryPage() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  // Change this if your table name is different
  const TABLE = 'artworks'

  // The columns we *try* to display.
  // If some don’t exist in your table, it won’t crash — it just shows a placeholder box.
  const columns = useMemo(
    () => [
      { key: 'original_url', label: 'Original' },
      { key: 'refined_url', label: 'Refined' },
      { key: 'render_url', label: '3D Render' },
    ],
    []
  )

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setErr(null)

      try {
        // pull a broad set — adjust to your real schema later
        const { data, error } = await supabase
          .from(TABLE)
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!alive) return

        setArtworks(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!alive) return
        setErr(e?.message || 'Failed to load gallery')
        setArtworks([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  function safeUrl(value) {
    if (!value) return ''
    if (typeof value !== 'string') return ''
    return value.trim()
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Gallery</h1>
        <p>Loading…</p>
      </div>
    )
  }

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Gallery</h1>
        <p style={{ color: 'tomato' }}>Error: {err}</p>
        <p>
          Quick checks:
          <br />• Is your table really named <b>{TABLE}</b>?
          <br />• Do you have RLS policies that allow <b>select</b>?
          <br />• Are you logged in (if your policies require auth)?
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gallery</h1>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            Each row is one drawing. Columns are the pipeline stages.
          </p>
        </div>

        <div style={{ opacity: 0.8, fontSize: 14 }}>
          {artworks.length} item{artworks.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 16,
          padding: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          fontWeight: 600,
        }}
      >
        {columns.map((c) => (
          <div key={c.key}>{c.label}</div>
        ))}
        <div>Actions</div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {artworks.map((art) => {
          const id = art?.id ?? art?.uuid ?? Math.random().toString(36).slice(2)

          return (
            <div
              key={id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                padding: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.15)',
                alignItems: 'center',
              }}
            >
              {columns.map((c) => {
                const url = safeUrl(art?.[c.key])

                return (
                  <div
                    key={c.key}
                    style={{
                      width: '100%',
                      minHeight: 140,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={url || '(empty)'}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`${c.label}`}
                        style={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span style={{ opacity: 0.6, fontSize: 13 }}>No {c.label}</span>
                    )}
                  </div>
                )
              })}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    alert(`Upgrade clicked for item: ${id}`)
                  }}
                >
                  Upgrade
                </button>

                <button
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.85,
                  }}
                  onClick={() => {
                    console.log('ARTWORK:', art)
                    alert('Logged this item to console')
                  }}
                >
                  Debug row
                </button>
              </div>
            </div>
          )
        })}

        {artworks.length === 0 && (
          <div style={{ padding: 16, opacity: 0.8 }}>
            No artworks found. Either the table is empty, or your RLS policies are blocking selects.
          </div>
        )}
      </div>
    </div>
  )
}
