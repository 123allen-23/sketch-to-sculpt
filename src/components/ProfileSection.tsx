'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'

type Status = 'idle' | 'loading' | 'authed' | 'guest' | 'error'

export default function ProfileSection() {
  const [status, setStatus] = useState<Status>('idle')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      setStatus('loading')
      setError(null)

      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return

        const u = data.user ?? null
        setUser(u)
        setStatus(u ? 'authed' : 'guest')
      } catch (err) {
        if (!mounted) return
        setStatus('error')
        setError('Failed to load user')
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [])

  if (status === 'loading') return <p>Loading…</p>
  if (status === 'error') return <p>{error}</p>
  if (status === 'guest') return <p>Not signed in</p>

  return (
    <div>
      <h2>Profile</h2>
      <p>{user?.email}</p>
    </div>
  )
}
