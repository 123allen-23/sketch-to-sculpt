export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

function extFromContentType(ct = '') {
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  return 'jpg';
}

export async function POST(req) {
  try {
    const { galleryId } = await req.json();
    if (!galleryId) return jsonError('Missing galleryId');

    const supabase = supabaseAdmin();

    // 1) Load gallery row (to get artist_id)
    const { data: gallery, error: gErr } = await supabase
      .from('art_gallery')
      .select('id, artist_id, title')
      .eq('id', galleryId)
      .single();

    if (gErr || !gallery) return jsonError('Gallery not found', 404, { details: gErr?.message });

    // 2) Find original asset for this gallery row
    const { data: original, error: oErr } = await supabase
      .from('art_gallery_assets')
      .select('id, url')
      .eq('gallery_id', galleryId)
      .eq('kind', 'original')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (oErr || !original?.url) {
      return jsonError('Original asset not found for this galleryId', 404, { details: oErr?.message });
    }

    // 3) Download original image
    const imgRes = await fetch(original.url);
    if (!imgRes.ok) return jsonError('Failed to fetch original image URL', 400, { url: original.url });

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const bytes = Buffer.from(await imgRes.arrayBuffer());
    const ext = extFromContentType(contentType);

    // 4) PIPELINE PROOF MODE:
    //    For now, we simply copy the original bytes into the refined bucket.
    //    (Once this works end-to-end, we swap this block to real OpenAI refine.)
    const filePath = `${gallery.artist_id}/${galleryId}/${Date.now()}_refined.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('refined')
      .upload(filePath, bytes, { contentType, upsert: true });

    if (upErr) return jsonError('Upload to refined bucket failed', 500, { details: upErr.message });

    const { data: pub } = supabase.storage.from('refined').getPublicUrl(filePath);
    const refinedUrl = pub?.publicUrl;

    if (!refinedUrl) return jsonError('Could not create public URL for refined upload', 500);

    // 5) Insert refined asset row
    const { data: inserted, error: insErr } = await supabase
      .from('art_gallery_assets')
      .insert({
        gallery_id: galleryId,
        artist_id: gallery.artist_id,
        kind: 'refined',
        url: refinedUrl,
        status: 'ready',
      })
      .select('*')
      .single();

    if (insErr) return jsonError('Insert refined asset failed', 500, { details: insErr.message });

    return NextResponse.json({ ok: true, asset: inserted });
  } catch (e) {
    return jsonError('Server error', 500, { details: String(e?.message || e) });
  }
}
