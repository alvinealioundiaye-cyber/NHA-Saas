import { useEffect, useState } from 'react'
import { supabase } from '../lib'
import { useAuth } from '../auth'

type Course = { id: string; title: string; description: string | null; price_fcfa: number; published: boolean }

export default function Academie() {
  const { profile } = useAuth()
  const canEdit = profile?.role === 'admin' || profile?.role === 'teacher'
  const [courses, setCourses] = useState<Course[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [err, setErr] = useState('')

  async function load() {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (error) setErr(error.message); else setCourses(data as Course[])
  }
  useEffect(() => { load() }, [])

  async function add() {
    setErr('')
    const { error } = await supabase.from('courses').insert({ title, description, price_fcfa: price, published: true })
    if (error) { setErr(error.message); return }
    setTitle(''); setDescription(''); setPrice(0)
    load()
  }

  async function remove(id: string) {
    await supabase.from('courses').delete().eq('id', id)
    load()
  }

  return (
    <>
      <h2>Académie</h2>
      {canEdit && (
        <div className="card form">
          <input placeholder="Titre du cours" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input placeholder="Prix en FCFA" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
          <button onClick={add} disabled={!title}>Ajouter le cours</button>
        </div>
      )}
      {err && <p className="msg">{err}</p>}
      {courses.length === 0 && <p className="muted">Aucun cours pour le moment.</p>}
      <div className="list">
        {courses.map(c => (
          <div className="card" key={c.id}>
            <strong>{c.title}</strong>
            <p className="muted">{c.description}</p>
            <div className="row">
              <span>{c.price_fcfa > 0 ? `${c.price_fcfa.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}</span>
              {canEdit && <button className="ghost" onClick={() => remove(c.id)}>Supprimer</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
