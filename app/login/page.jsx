'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function onLogin(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMsg(error.message)
    router.push('/drawing')
  }

  async function onSignup() {
    setMsg('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return setMsg(error.message)
    setMsg('Signup OK. Check email if confirmations are enabled.')
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Login</h1>

      <form onSubmit={onLogin} style={{ display: 'grid', gap: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />

        <button disabled={loading}>{loading ? 'Working…' : 'Login'}</button>
        <button type="button" disabled={loading} onClick={onSignup}>Create account</button>

        {msg ? <div style={{ color: msg.includes('OK') ? 'green' : 'crimson' }}>{msg}</div> : null}
      </form>
    </div>
  )
}
