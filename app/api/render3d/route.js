import { NextResponse } from 'next/server'
import { requireCredits } from '../../../lib/server/credits'
import { createClient } from '@supabase/supabase-js'

function supaAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function latestAssetByKind(supabase, gallery_id, kind) {
  const { data, error } = await supabase
    .from('art_gallery_assets')
    .select('id, kind, url, created_at')
    .eq('gallery_id', gallery_id)
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function POST(req) {
  try {
    const { gallery_id } = await req.json()
    if (!gallery_id) return NextResponse.json({ error: 'Missing gallery_id' }, { status: 400 })

    const supabase = supaAdmin()

    // Get gallery so we can set artist_id (avoids your NOT NULL crash)
    const { data: gallery, error: gErr } = await supabase
      .from('art_gallery')
      .select('id, artist_id')
      .eq('id', gallery_id)
      .maybeSingle()

    if (gErr) throw gErr
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    if (!gallery.artist_id) return NextResponse.json({ error: 'Gallery missing artist_id' }, { status: 400 })

    // render3d requires refined
    const refined = await latestAssetByKind(supabase, gallery_id, 'refined')
    if (!refined?.url) {
      return NextResponse.json({ error: 'No refined asset found for this gallery_id' }, { status: 400 })
    }

    // SAFE MODE: reuse refined url, add cache-buster so it counts as a “new” asset visually if needed
    const outUrl = refined.url.includes('?')
      ? `${refined.url}&v=${Date.now()}`
      : `${refined.url}?v=${Date.now()}`

    const { data: inserted, error: iErr } = await supabase
      .from('art_gallery_assets')
      .insert({
        gallery_id,
        artist_id: gallery.artist_id,
        kind: 'render3d',
        url: outUrl,
        source: 'ai',
        status: 'ready',
        is_primary: false,
      })
      .select('id, kind, url, created_at')
      .single()

    if (iErr) throw iErr

    return NextResponse.json({ ok: true, asset: inserted })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'render3d failed' }, { status: 500 })
  }
}
