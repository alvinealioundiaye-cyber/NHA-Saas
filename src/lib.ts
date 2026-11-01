import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url && key)
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing')

export type Role = 'pending' | 'admin' | 'teacher' | 'student' | 'seller'
export type Profile = { id: string; email: string | null; full_name: string | null; role: Role }
