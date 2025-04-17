'use client'

import { ReactNode, useState, useEffect, createContext, useContext } from 'react'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface SupabaseContext {
  session: Session | null
}
const Context = createContext<SupabaseContext>({ session: null })

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // On initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) upsertProfile(session.user.id, session.user.email)
    })

    // On any auth change (signup, login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session) => {
        setSession(session)
        if (session?.user) upsertProfile(session.user.id, session.user.email)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return <Context.Provider value={{ session }}>{children}</Context.Provider>
}

// Helper: insert or update the custom users table
async function upsertProfile(id: string, email: string) {
  await supabase.from('users').upsert({
    id,
    email,
    created_at: new Date().toISOString(),
  })
}

export const useSupabase = () => useContext(Context)

