'use client'

import { useState } from 'react'

const STAGES = ['original', 'refined', 'render3d', 'sculpt']

export default function ArtistControlRoom({ piece, assets, onAction }) {
  const [stage, setStage] = useState('original')

  const currentAsset = assets[stage]

  function primaryAction() {
    onAction(stage)
  }

  return (
    <div style={styles.shell}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2>{piece.title || 'Untitled'}</h2>
          <small>
            Created {new Date(piece.created_at).toLocaleDateString()} •
            Versions {piece.version_count}
          </small>
        </div>
        <div style={styles.credits}>
          Credits: <strong>{piece.credits}</strong>
        </div>
      </div>

      {/* STAGE TABS */}
      <div style={styles.tabs}>
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => setStage(s)}
            style={{
              ...styles.tab,
              ...(stage === s ? styles.tabActive : {})
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PREVIEW */}
      <div style={styles.preview}>
        {currentAsset ? (
          <img
            src={currentAsset.url}
            alt={stage}
            style={styles.image}
          />
        ) : (
          <div style={styles.placeholder}>
            No asset yet
          </div>
        )}
      </div>

      {/* TOOLS */}
      <div style={styles.tools}>
        <StageTools stage={stage} />
      </div>

      {/* PRIMARY ACTION */}
      <button
        onClick={primaryAction}
        style={styles.primary}
        disabled={!currentAsset && stage !== 'original'}
      >
        {primaryLabel(stage)}
      </button>
    </div>
  )
}

function StageTools({ stage }) {
  const map = {
    original: ['Rotate', 'Crop', 'Lighting', 'Notes'],
    refined: ['Line Weight', 'Style Bias', 'Detail', 'Redo'],
    render3d: ['Orbit', 'Depth', 'Backside', 'Solid/Hollow'],
    sculpt: ['Thickness', 'Material', 'Weight', 'Mount']
  }

  return (
    <div style={styles.toolGrid}>
      {map[stage].map(t => (
        <div key={t} style={styles.tool}>
          {t}
        </div>
      ))}
    </div>
  )
}

function primaryLabel(stage) {
  switch (stage) {
    case 'original': return 'Refine (AI)'
    case 'refined': return 'Create 3D Render'
    case 'render3d': return 'Prep Sculpt'
    case 'sculpt': return 'Finalize Sculpt'
    default: return 'Continue'
  }
}

const styles = {
  shell: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: 24,
    background: '#0b1020',
    color: '#e5e7eb',
    borderRadius: 12
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  credits: {
    fontSize: 14,
    opacity: 0.8
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16
  },
  tab: {
    padding: '6px 12px',
    background: '#111827',
    border: '1px solid #1f2933',
    cursor: 'pointer'
  },
  tabActive: {
    background: '#1f2937',
    borderColor: '#38bdf8'
  },
  preview: {
    height: 360,
    background: '#020617',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%'
  },
  placeholder: {
    opacity: 0.5
  },
  tools: {
    marginBottom: 16
  },
  toolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8
  },
  tool: {
    background: '#020617',
    padding: 10,
    textAlign: 'center',
    fontSize: 13
  },
  primary: {
    width: '100%',
    padding: 14,
    background: '#38bdf8',
    color: '#020617',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
  }
}
