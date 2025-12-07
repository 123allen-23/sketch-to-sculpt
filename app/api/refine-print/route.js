import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { artworkId } = await request.json();

    if (!artworkId) {
      return NextResponse.json(
        { error: 'Missing artworkId' },
        { status: 400 }
      );
    }

    // 1) Get the original artwork
    const { data: original, error } = await supabaseAdmin
      .from('art_gallery')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (error || !original) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Take all fields except id / created_at
    const { id, created_at, ...rest } = original;

    // 2) Insert a new row as the "Refined Print"
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('art_gallery')
      .insert({
        ...rest,
        title: `${original.title} – Refined Print`,
        category: 'Refined Print',
        created_at: new Date().toISOString(),
        practice: original.practice ?? false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create refined print' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, artwork: inserted });
  } catch (err) {
    console.error('Route error:', err);
    return NextResponse.json(
      { error: 'Server error in refine-print' },
      { status: 500 }
    );
  }
}
