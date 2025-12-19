import { createClient } from '@supabase/supabase-js'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function requireCredits({ user_id, gallery_id, action, cost }) {
  const supabase = admin()

  // Read current credits
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user_id)
    .single()

  if (pErr) throw new Error(pErr.message)
  if ((profile?.credits ?? 0) < cost) {
    const have = profile?.credits ?? 0
    throw new Error(`Not enough credits. Need ${cost}, have ${have}.`)
  }

  // Deduct (atomic-ish using update filter)
  const { data: updated, error: uErr } = await supabase
    .from('profiles')
    .update({ credits: (profile.credits - cost), updated_at: new Date().toISOString() })
    .eq('id', user_id)
    .select('credits')
    .single()

  if (uErr) throw new Error(uErr.message)

  // Ledger
  await supabase.from('credit_ledger').insert({
    user_id,
    gallery_id,
    action,
    delta: -cost,
  })

  return { remaining: updated.credits }
}
