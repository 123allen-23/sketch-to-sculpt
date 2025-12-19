'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// ---- CONFIG ----
const STAGES = [
  { key: 'original', label: 'Original', requires: null },
  { key: 'refined', label: 'Refined', requires: 'original' },
  { key: 'render3d', label: '3D Render', requires: 'refined' },
  { key: 'sculpt', label: 'Sculpt', requires: 'render3d' },
]

const ACTION_LABEL = {
  refine: 'Refine (AI)',
  render3d: 'Create (AI)',
  sculpt: 'Create',
  redo_refine: 'Redo',
  redo_render3d: 'Redo',
  redo_sculpt: 'Redo',
}

// Tool “modes” based on what exists for the piece
function getToolMode(byKind = {}) {
  if (byKind?.render3d?.url) return 'post_render'
  if (byKind?.refined?.url) return 'post_refine'
  return 'pre_refine'
}

// What tools to show, depending on mode
function toolsForMode(mode) {
  if (mode === 'pre_refine') {
    return [
      { key: 'crop', label: 'Crop' },
      { key: 'straighten', label: 'Straighten' },
      { key: 'light', label: 'Fix lighting' },
      { key: 'bg', label: 'Clean background' },
    ]
  }
  if (mode === 'post_refine') {
    return [
      { key: 'tweak', label: 'Style tweak' },
      { key: 'detail', label: 'Add detail' },
      { key: 'variants', label: 'Make variants' },
      { key: 'export', label: 'Export PNG' },
    ]
  }
  // post_render
  return [
    { key: 'viewer', label: '3D Preview' },
    { key: 'scale', label: 'Scale check' },
    { key: 'back', label: 'Back-side planning' },
    { key: 'export3d', label: 'Export STL/GLB' },
  ]
}

// ---- HELPERS ----
function pickLatestByKind(assets = []) {
  const map = {}
  for (const a of assets) {
    if (!a?.kind) continue
    if (!map[a.kind]) {
      map[a.kind] = a
      continue
    }
    const prev = new Date(map[a.kind]?.created_at || 0).getTime()
    const next = new Date(a?.created_at || 0).getTime()
    if (next > prev) map[a.kind] = a
  }
  return map
}

function pill(text, tone = 'neutral') {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    opacity: 0.95,
  }
  const tones = {
    neutral: {},
    ok: { border: '1px solid rgba(0,255,160,0.25)', background: 'rgba(0,255,160,0.08)' },
    warn: { border: '1px solid rgba(255,200,0,0.25)', background: 'rgba(255,200,0,0.08)' },
    bad: { border: '1px solid rgba(255,0,80,0.25)', background: 'rgba(255,0,80,0.08)' },
    busy: { border: '1px solid rgba(12049,130,246,0.25)', background: 'rgba(49,130,246,0.10)' },
  }
  return <span style={{ ...base, ...(tones[tone] || {}) }}>{text}</span>
}

function canRunAction(action, byKind) {
  if (action === 'refine' || action === 'redo_refine') return !!byKind?.original?.url
  if (action === 'render3d' || action === 'redo_render3d') return !!byKind?.refined?.url
  if (action === 'sculpt' || action === 'redo_sculpt') return !!byKind?.render3d?.url
  return true
}

function stageStatus(stageKey, byKind, busyStage) {
  const has = !!byKind?.[stageKey]?.url
  if (busyStage) return { text: 'Working', tone: 'busy' }
  if (has) return { text: 'Ready', tone: 'ok' }
  if (stageKey === 'original') return { text: 'Missing', tone: 'bad' }
  return { text: 'Empty', tone: 'warn' }
}

// ---- UI COMPONENTS ----
function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1000px, 96vw)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(10,10,14,0.96)',
          padding: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function StageCard({
  stageLabel,
  stageKey,
  asset,
  status,
  onOpen,
  footer,
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 12,
        background: 'rgba(0,0,0,0.20)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
        <div style={{ fontWeight: 800 }}>{stageLabel}</div>
        {pill(status.text, status.tone)}
      </div>

      <button
        onClick={onOpen}
        disabled={!asset?.url}
        title={asset?.url ? 'Open preview' : 'No image yet'}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 12,
          border: '1px dashed rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.03)',
          overflow: 'hidden',
          cursor: asset?.url ? 'pointer' : 'not-allowed',
          padding: 0,
          opacity: asset?.url ? 1 : 0.7,
        }}
      >
        {asset?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={stageLabel}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ opacity: 0.65, fontSize: 13 }}>Empty</div>
        )}
      </button>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => asset?.url && window.open(asset.url, '_blank')}
          disabled={!asset?.url}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'white',
            cursor: asset?.url ? 'pointer' : 'not-allowed',
            opacity: asset?.url ? 1 : 0.45,
          }}
        >
          Open
        </button>

        {footer}
      </div>

      {asset?.created_at ? (
        <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>
          {new Date(asset.created_at).toLocaleString()}
        </div>
      ) : null}
    </div>
  )
}

// ---- PAGE ----
export default function GalleryPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState({}) // { [galleryId]: { refine:true } }

  const [preview, setPreview] = useState({ open: false, title: '', url: '' })
  const [compare, setCompare] = useState({ open: false, title: '', left: '', right: '' })
  const [toolsOpen, setToolsOpen] = useState({ open: false, title: '', tools: [], note: '' })

  async function load() {
    setLoading(true)
    setErr('')

    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      setErr(userErr.message)
      setLoading(false)
      return
    }
    const user = userRes?.user
    if (!user) {
      setErr('Not logged in. Go to /login first.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('art_gallery')
      .select(`
        id,
        title,
        created_at,
        artist_id,
        art_gallery_assets (
          id,
          kind,
          url,
          created_at,
          status,
          is_primary
        )
      `)
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }

    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const uiRows = useMemo(() => {
    return (rows || []).map((g) => {
      const byKind = pickLatestByKind(g.art_gallery_assets || [])
      const mode = getToolMode(byKind)
      return { ...g, byKind, mode }
    })
  }, [rows])

  async function runAction(galleryId, action) {
    setErr('')
    setBusy((b) => ({ ...b, [galleryId]: { ...(b[galleryId] || {}), [action]: true } }))

    try {
      const res = await fetch(`/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery_id: galleryId }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `API failed: ${action}`)

      await load()
    } catch (e) {
      setErr(e?.message || `API failed: ${action}`)
    } finally {
      setBusy((b) => ({ ...b, [galleryId]: { ...(b[galleryId] || {}), [action]: false } }))
    }
  }

  function openToolsForRow(row) {
    const tools = toolsForMode(row.mode)
    let note = ''
    if (row.mode === 'pre_refine') note = 'Fix lighting + cleanup BEFORE you burn credits.'
    if (row.mode === 'post_refine') note = 'Now you’re editing the refined art — great time for variants.'
    if (row.mode === 'post_render') note = '3D planning stage — rotate/scale/back-side planning happens here.'
    setToolsOpen({
      open: true,
      title: `${row.title || 'Untitled'} — Tools`,
      tools,
      note,
    })
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Artist Panel</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        One piece per row — pipeline stages left → right. Tools unlock as you move forward.
      </div>

      {err ? (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 14,
            background: 'rgba(255,0,80,0.12)',
            border: '1px solid rgba(255,0,80,0.25)',
          }}
        >
          {err}
        </div>
      ) : null}

      {uiRows.length === 0 ? (
        <div style={{ opacity: 0.8 }}>No pieces yet. Upload an original first.</div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {uiRows.map((g) => {
          const byKind = g.byKind || {}
          const original = byKind.original
          const refined = byKind.refined
          const render3d = byKind.render3d
          const sculpt = byKind.sculpt

          const refineBusy = !!busy?.[g.id]?.refine
          const renderBusy = !!busy?.[g.id]?.render3d
          const sculptBusy = !!busy?.[g.id]?.sculpt

          const mode = g.mode

          return (
            <div
              key={g.id}
              style={{
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 16,
                background: 'rgba(0,0,0,0.18)',
              }}
            >
              {/* Row header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {g.title || 'Untitled'}
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    {g.created_at ? new Date(g.created_at).toLocaleString() : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {pill(
                    mode === 'pre_refine' ? 'Prep' : mode === 'post_refine' ? 'Refined' : '3D Ready',
                    mode === 'pre_refine' ? 'warn' : mode === 'post_refine' ? 'ok' : 'ok'
                  )}

                  <button
                    onClick={() => openToolsForRow(g)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Tools
                  </button>

                  {/* Compare only when refined exists */}
                  <button
                    onClick={() =>
                      setCompare({
                        open: true,
                        title: `${g.title || 'Untitled'} — Original vs Refined`,
                        left: original?.url || '',
                        right: refined?.url || '',
                      })
                    }
                    disabled={!original?.url || !refined?.url}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      cursor: original?.url && refined?.url ? 'pointer' : 'not-allowed',
                      opacity: original?.url && refined?.url ? 1 : 0.45,
                      fontWeight: 700,
                    }}
                  >
                    Compare
                  </button>
                </div>
              </div>

              {/* Stage cards */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StageCard
                  stageLabel="Original"
                  stageKey="original"
                  asset={original}
                  status={stageStatus('original', byKind, false)}
                  onOpen={() =>
                    setPreview({ open: true, title: `${g.title || 'Untitled'} — Original`, url: original?.url })
                  }
                  footer={
                    <button
                      disabled
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'white',
                        opacity: 0.45,
                      }}
                      title="Original is created on the Upload page"
                    >
                      Upload
                    </button>
                  }
                />

                <StageCard
                  stageLabel="Refined"
                  stageKey="refined"
                  asset={refined}
                  status={stageStatus('refined', byKind, refineBusy)}
                  onOpen={() =>
                    refined?.url &&
                    setPreview({ open: true, title: `${g.title || 'Untitled'} — Refined`, url: refined?.url })
                  }
                  footer={
                    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                      <button
                        onClick={() => runAction(g.id, 'refine')}
                        disabled={!canRunAction('refine', byKind) || refineBusy}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.12)',
                          color: 'white',
                          cursor: !canRunAction('refine', byKind) || refineBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('refine', byKind) || refineBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                      >
                        {refineBusy ? 'Refining…' : ACTION_LABEL.refine}
                      </button>

                      <button
                        onClick={() => runAction(g.id, 'redo_refine')}
                        disabled={!canRunAction('redo_refine', byKind) || refineBusy}
                        style={{
                          width: 76,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'white',
                          cursor: !canRunAction('redo_refine', byKind) || refineBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('redo_refine', byKind) || refineBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                        title="Redo refine (burns credits later)"
                      >
                        Redo
                      </button>
                    </div>
                  }
                />

                <StageCard
                  stageLabel="3D Render"
                  stageKey="render3d"
                  asset={render3d}
                  status={stageStatus('render3d', byKind, renderBusy)}
                  onOpen={() =>
                    render3d?.url &&
                    setPreview({ open: true, title: `${g.title || 'Untitled'} — 3D Render`, url: render3d?.url })
                  }
                  footer={
                    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                      <button
                        onClick={() => runAction(g.id, 'render3d')}
                        disabled={!canRunAction('render3d', byKind) || renderBusy}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.12)',
                          color: 'white',
                          cursor: !canRunAction('render3d', byKind) || renderBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('render3d', byKind) || renderBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                      >
                        {renderBusy ? 'Rendering…' : ACTION_LABEL.render3d}
                      </button>

                      <button
                        onClick={() => runAction(g.id, 'redo_render3d')}
                        disabled={!canRunAction('redo_render3d', byKind) || renderBusy}
                        style={{
                          width: 76,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'white',
                          cursor: !canRunAction('redo_render3d', byKind) || renderBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('redo_render3d', byKind) || renderBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                        title="Redo 3D (burns credits later)"
                      >
                        Redo
                      </button>
                    </div>
                  }
                />

                <StageCard
                  stageLabel="Sculpt"
                  stageKey="sculpt"
                  asset={sculpt}
                  status={stageStatus('sculpt', byKind, sculptBusy)}
                  onOpen={() =>
                    sculpt?.url &&
                    setPreview({ open: true, title: `${g.title || 'Untitled'} — Sculpt`, url: sculpt?.url })
                  }
                  footer={
                    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                      <button
                        onClick={() => runAction(g.id, 'sculpt')}
                        disabled={!canRunAction('sculpt', byKind) || sculptBusy}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.12)',
                          color: 'white',
                          cursor: !canRunAction('sculpt', byKind) || sculptBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('sculpt', byKind) || sculptBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                      >
                        {sculptBusy ? 'Building…' : ACTION_LABEL.sculpt}
                      </button>

                      <button
                        onClick={() => runAction(g.id, 'redo_sculpt')}
                        disabled={!canRunAction('redo_sculpt', byKind) || sculptBusy}
                        style={{
                          width: 76,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'white',
                          cursor: !canRunAction('redo_sculpt', byKind) || sculptBusy ? 'not-allowed' : 'pointer',
                          opacity: !canRunAction('redo_sculpt', byKind) || sculptBusy ? 0.45 : 1,
                          fontWeight: 800,
                        }}
                        title="Redo sculpt (burns credits later)"
                      >
                        Redo
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview modal */}
      <Modal
        open={preview.open}
        title={preview.title}
        onClose={() => setPreview({ open: false, title: '', url: '' })}
      >
        <div style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(0,0,0,0.35)' }}
          />
        </div>
      </Modal>

      {/* Compare modal */}
      <Modal
        open={compare.open}
        title={compare.title}
        onClose={() => setCompare({ open: false, title: '', left: '', right: '' })}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Original</div>
            <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={compare.left}
                alt="original"
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(0,0,0,0.35)' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Refined</div>
            <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={compare.right}
                alt="refined"
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(0,0,0,0.35)' }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Tools modal */}
      <Modal
        open={toolsOpen.open}
        title={toolsOpen.title}
        onClose={() => setToolsOpen({ open: false, title: '', tools: [], note: '' })}
      >
        <div style={{ opacity: 0.85, marginBottom: 10 }}>{toolsOpen.note}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {(toolsOpen.tools || []).map((t) => (
            <button
              key={t.key}
              onClick={() => alert(`Tool clicked: ${t.label}\n\n(Next step: wire tools to real editor routes.)`)}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
