import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type Profile } from './lib'

type Ctx = { loading: boolean; userId: string | null; profile: Profile | null; signOut: () => Promise<void>; refresh: () => Promise<void> }
const AuthCtx = createContext<Ctx>({ loading: true, userId: null, profile: null, signOut: async () => {}, refresh: async () => {} })
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  async function loadProfile(id: string | null) {
    if (!id) { setProfile(null); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile((data as Profile) ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id ?? null
      setUserId(id)
      await loadProfile(id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const id = session?.user.id ?? null
      setUserId(id)
      await loadProfile(id)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthCtx.Provider value={{
      loading, userId, profile,
      signOut: async () => { await supabase.auth.signOut() },
      refresh: () => loadProfile(userId),
    }}>
      {children}
    </AuthCtx.Provider>
  )
}
