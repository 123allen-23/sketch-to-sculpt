'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function DrawingPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Example: read params safely
  const drawingId = searchParams.get('id') || ''
  const mode = searchParams.get('mode') || 'view' // view | edit, etc.

  // Example: derived value (optional)
  const title = useMemo(() => {
    if (!drawingId) return 'Drawing'
    return `Drawing: ${drawingId}`
  }, [drawingId])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h1>

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        <div><b>mode</b>: {mode}</div>
        <div><b>id</b>: {drawingId || '(none)'}</div>
      </div>

      <hr style={{ margin: '16px 0' }} />

      {/* ✅ Put your real drawing UI here */}
      {/* Example buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push(`/drawing?mode=edit&id=${encodeURIComponent(drawingId || 'new')}`)}
        >
          Edit
        </button>

        <button onClick={() => router.push('/gallery')}>
          Back to Gallery
        </button>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: '1px solid #333', borderRadius: 8 }}>
        <p style={{ margin: 0 }}>
          Drop your canvas / upload / refine controls here.
        </p>
      </div>
    </div>
  )
}

export default function DrawingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading drawing…</div>}>
      <DrawingPageInner />
    </Suspense>
  )
}
