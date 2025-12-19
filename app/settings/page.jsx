'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const [user, setUser] = useState(null)

  // Profile fields
  const [displayName, setDisplayName] = useState('')

  // Credits
  const [credits, setCredits] = useState(null)

  async function load() {
    setLoading(true)
    setErr('')
    setMsg('')
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr

      const u = authData?.user || null
      setUser(u)

      if (!u) {
        setCredits(null)
        setDisplayName('')
        setLoading(false)
        return
      }

      // Try to load profile row (safe even if table/columns not perfect yet)
      // Assumes public.profiles has id (uuid) and optional display_name and credits.
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('display_name, credits')
        .eq('id', u.id)
        .maybeSingle()

      // If table exists but row doesn’t, that’s OK. We’ll create on save.
      if (profErr && !String(profErr.message || '').includes('Row not found')) {
        // Don’t hard crash settings page — just show the error.
        console.warn('profiles load error:', profErr)
      }

      setDisplayName(prof?.display_name || '')
      setCredits(typeof prof?.credits === 'number' ? prof.credits : 0)

    } catch (e) {
      setErr(e?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    setErr('')
    setMsg('')
    try {
      const payload = {
        id: user.id,
        display_name: displayName || null,
        // keep existing credits if we already have them; don’t overwrite with null
        credits: typeof credits === 'number' ? credits : 0,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

      if (error) throw error
      setMsg('Saved.')
    } catch (e) {
      setErr(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function signOut() {
    setErr('')
    setMsg('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // refresh state
      await load()
    } catch (e) {
      setErr(e?.message || 'Sign out failed')
    }
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Settings</h1>
        <div style={{ opacity: 0.8 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Settings</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        Manage your profile, credits, and account.
      </div>

      {err && (
        <div style={{
          background: 'rgba(255,0,0,0.12)',
          border: '1px solid rgba(255,0,0,0.25)',
          padding: 12,
          borderRadius: 10,
          marginBottom: 14
        }}>
          {err}
        </div>
      )}

      {msg && (
        <div style={{
          background: 'rgba(0,200,120,0.12)',
          border: '1px solid rgba(0,200,120,0.25)',
          padding: 12,
          borderRadius: 10,
          marginBottom: 14
        }}>
          {msg}
        </div>
      )}

      {!user ? (
        <div style={{
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          padding: 16,
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            You’re not signed in.
          </div>
          <div style={{ opacity: 0.8 }}>
            Go to Upload or Home and sign in, then come back here.
          </div>
        </div>
      ) : (
        <>
          {/* Account card */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            marginBottom: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Account</div>
                <div style={{ opacity: 0.85 }}>
                  <div><b>Email:</b> {user.email}</div>
                  <div><b>User ID:</b> <span style={{ opacity: 0.75 }}>{user.id}</span></div>
                </div>
              </div>

              <button
                onClick={signOut}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  height: 42
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Credits card */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            marginBottom: 14
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Credits</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>
                {typeof credits === 'number' ? credits : '—'}
              </div>
              <div style={{ opacity: 0.75 }}>available</div>
            </div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>
              Credits are used for Refine / 3D / Sculpt actions.
            </div>

            <div style={{ marginTop: 10, opacity: 0.75 }}>
              (Next: add “Buy credits” button wired to Stripe.)
            </div>
          </div>

          {/* Profile card */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            marginBottom: 14
          }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Profile</div>

            <label style={{ display: 'block', opacity: 0.8, marginBottom: 6 }}>
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Capn"
              style={{
                width: '100%',
                maxWidth: 420,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(0,0,0,0.25)',
                color: 'white',
                outline: 'none'
              }}
            />

            <div style={{ marginTop: 12 }}>
              <button
                onClick={saveProfile}
                disabled={saving}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: saving ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* Safety / Preferences placeholder */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 16,
            background: 'rgba(255,255,255,0.03)'
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Preferences</div>
            <div style={{ opacity: 0.75 }}>
              Coming next:
              <ul style={{ marginTop: 8 }}>
                <li>Default quality (Fast / Balanced / Ultra)</li>
                <li>Auto-save pipeline outputs</li>
                <li>Email receipts / notifications</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
