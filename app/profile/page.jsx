'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// If you already have a ProfileSection component, we’ll use it when logged in:
import ProfileSection from '../../src/components/ProfileSection'

export default function ProfilePage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
  }

  async function onSignup() {
    setMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Signup OK. Check email if confirmations are on.')
  }

  async function onLogout() {
    await supabase.auth.signOut()
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>

  // NOT LOGGED IN: show login + signup right on profile page
  if (!session) {
    return (
      <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Profile</h1>
        <p style={{ marginBottom: 18 }}>Log in to create your avatar and manage your profile.</p>

        <form onSubmit={onLogin} style={{ display: 'grid', gap: 12 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
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

          <button style={{ padding: 10 }}>Login</button>

          <button type="button" onClick={onSignup} style={{ padding: 10 }}>
            Create account
          </button>

          {msg ? <div style={{ color: msg.includes('OK') ? 'green' : 'crimson' }}>{msg}</div> : null}
        </form>
      </div>
    )
  }

  // LOGGED IN: show avatar/profile tools
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 26 }}>Profile</h1>
        <button onClick={onLogout} style={{ padding: 10 }}>Logout</button>
      </div>

      {/* This is your avatar creation / profile section */}
      <ProfileSection />
    </div>
  )
}
