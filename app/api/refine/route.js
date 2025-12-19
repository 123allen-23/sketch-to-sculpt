import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Node runtime helps with fetch/buffers if needed later
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const gallery_id = Number(body.gallery_id)

    if (!gallery_id || Number.isNaN(gallery_id)) {
      return NextResponse.json({ error: 'Missing gallery_id' }, { status: 400 })
    }

    const supabase = admin()

    // 1) Find the ORIGINAL asset (latest)
    const { data: orig, error: origErr } = await supabase
      .from('art_gallery_assets')
      .select('id, artist_id, gallery_id, kind, url, created_at')
      .eq('gallery_id', gallery_id)
      .eq('kind', 'original')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (origErr) {
      return NextResponse.json({ error: origErr.message }, { status: 500 })
    }
    if (!orig?.url) {
      return NextResponse.json({ error: 'Original artwork not found for this gallery_id' }, { status: 404 })
    }

    // 2) (SAFE MODE) For now: do NOT burn credits.
    // We create a "refined" asset using the same URL (placeholder),
    // proving the pipeline works end-to-end.
    //
    // Later we swap this block to call OpenAI and upload output into `refined` bucket.
    const refined_url = orig.url

    // 3) Insert refined asset row
    const { data: inserted, error: insErr } = await supabase
      .from('art_gallery_assets')
      .insert({
        artist_id: orig.artist_id,
        gallery_id: gallery_id,
        kind: 'refined',
        url: refined_url,
        status: 'ready',
        source: 'ai',
        is_primary: false,
      })
      .select('id, kind, url, created_at')
      .single()

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      gallery_id,
      refined: inserted,
      note: 'Safe mode: refined created without burning credits (URL copied from original).',
    })
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
