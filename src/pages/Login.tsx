import { useState } from 'react'
import { supabase } from '../lib'

export default function Login() {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true); setMsg('')
    const { error } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) setMsg(error.message)
    else if (mode === 'up') setMsg('Compte créé. Si Supabase demande une confirmation, vérifiez votre e-mail.')
    setBusy(false)
  }

  return (
    <div className="center">
      <div className="panel">
        <h1>NHA Digital Cloud</h1>
        <p className="muted">{mode === 'in' ? 'Connectez-vous à votre espace.' : 'Créez votre compte.'}</p>
        {mode === 'up' && <input placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} />}
        <input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={submit} disabled={busy || !email || !password}>{mode === 'in' ? 'Se connecter' : 'Créer le compte'}</button>
        {msg && <p className="msg">{msg}</p>}
        <button className="ghost" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  )
}
