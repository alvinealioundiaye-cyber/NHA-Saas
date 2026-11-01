import { useEffect, useState } from 'react'
import { supabase, type Profile, type Role } from '../lib'

const roles: Role[] = ['pending', 'admin', 'teacher', 'student', 'seller']

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([])
  const [err, setErr] = useState('')

  async function load() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) setErr(error.message); else setUsers(data as Profile[])
  }
  useEffect(() => { load() }, [])

  async function setRole(id: string, role: Role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) setErr(error.message)
    load()
  }

  return (
    <>
      <h2>Utilisateurs</h2>
      <p className="muted">Attribuez un rôle pour valider un compte en attente.</p>
      {err && <p className="msg">{err}</p>}
      <div className="list">
        {users.map(u => (
          <div className="card row" key={u.id}>
            <div>
              <strong>{u.full_name || u.email}</strong>
              <div className="muted">{u.email}</div>
            </div>
            <select value={u.role} onChange={e => setRole(u.id, e.target.value as Role)}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>
    </>
  )
}
