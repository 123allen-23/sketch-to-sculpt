'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Auth form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarMsg, setAvatarMsg] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)

  // Debug: tells us if Vercel is missing NEXT_PUBLIC keys
  const debug = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    return {
      urlPresent: !!url,
      anonPresent: !!anon,
      urlPreview: url ? `${url.slice(0, 28)}…` : '(missing)',
      anonPreview: anon ? `${anon.slice(0, 8)}…` : '(missing)',
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) console.warn('getSession error:', error)
      setSession(data?.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  async function onLogin(e) {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setMsg('Logged in.')
      router.refresh?.()
    } catch (err) {
      setMsg(`${err?.name || 'Error'}: ${err?.message || 'Login failed'}`)
    } finally {
      setBusy(false)
    }
  }

  async function onSignup() {
    setMsg('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      setMsg('Account created. If email confirmation is enabled, check your inbox.')
    } catch (err) {
      setMsg(`${err?.name || 'Error'}: ${err?.message || 'Signup failed'}`)
    } finally {
      setBusy(false)
    }
  }

  async function onLogout() {
    setMsg('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setMsg('Logged out.')
    } catch (err) {
      setMsg(`${err?.name || 'Error'}: ${err?.message || 'Logout failed'}`)
    } finally {
      setBusy(false)
    }
  }

  async function uploadAvatar() {
    setAvatarMsg('')
    if (!avatarFile) return setAvatarMsg('Pick an image first.')
    if (!session?.user) return setAvatarMsg('You must be logged in.')

    setAvatarBusy(true)
    try {
      // Storage bucket name (change if yours is different)
      const BUCKET = 'avatars'

      const ext = avatarFile.name.split('.').pop() || 'png'
      const filePath = `${session.user.id}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type })

      if (upErr) throw upErr

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
      setAvatarMsg(`Uploaded. Public URL: ${data?.publicUrl || '(no url)'}`)
    } catch (err) {
      setAvatarMsg(`${err?.name || 'Error'}: ${err?.message || 'Avatar upload failed'}`)
    } finally {
      setAvatarBusy(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 16 }}>Loading…</div>
  }

  // ---------- Logged OUT ----------
  if (!session) {
    return (
      <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Profile</h1>
        <p style={{ marginBottom: 16 }}>Log in or create an account to set your avatar.</p>

        {/* Debug Banner */}
        <div
          style={{
            border: '1px solid #999',
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          <div><b>Debug (prod env)</b></div>
          <div>Supabase URL present: <b>{String(debug.urlPresent)}</b> ({debug.urlPreview})</div>
          <div>Anon key present: <b>{String(debug.anonPresent)}</b> ({debug.anonPreview})</div>
          {!debug.urlPresent || !debug.anonPresent ? (
            <div style={{ marginTop: 8, color: 'crimson' }}>
              If either says <b>false</b>, your Vercel Production env vars are missing or not applied (redeploy).
            </div>
          ) : null}
        </div>

        <form onSubmit={onLogin} style={{ display: 'grid', gap: 12 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            inputMode="email"
            required
            style={{ padding: 10 }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            required
            style={{ padding: 10 }}
          />

          <button disabled={busy} style={{ padding: 10 }}>
            {busy ? 'Working…' : 'Login'}
          </button>

          <button type="button" disabled={busy} onClick={onSignup} style={{ padding: 10 }}>
            Create account
          </button>

          {msg ? <div style={{ color: msg.includes('created') || msg.includes('Logged') ? 'green' : 'crimson' }}>{msg}</div> : null}
        </form>
      </div>
    )
  }

  // ---------- Logged IN ----------
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Profile</h1>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Logged in as: <b>{session.user.email}</b>
          </div>
        </div>
        <button onClick={onLogout} disabled={busy} style={{ padding: 10 }}>
          {busy ? 'Working…' : 'Logout'}
        </button>
      </div>

      {/* Avatar Creation / Upload */}
      <div style={{ border: '1px solid #999', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Avatar</h2>
        <p style={{ marginTop: 0, opacity: 0.9 }}>
          Pick an image and upload it. (Bucket name assumed: <b>avatars</b>)
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
          <button onClick={uploadAvatar} disabled={avatarBusy} style={{ padding: 10 }}>
            {avatarBusy ? 'Uploading…' : 'Upload Avatar'}
          </button>
        </div>

        {avatarMsg ? <div style={{ marginTop: 10, color: avatarMsg.startsWith('Uploaded') ? 'green' : 'crimson' }}>{avatarMsg}</div> : null}
      </div>
    </div>
  )
}
