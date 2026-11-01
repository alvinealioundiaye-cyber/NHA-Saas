import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib'
import { useAuth } from '../auth'

type Post = {
  id: string
  author: string
  author_name: string | null
  body: string | null
  media_url: string | null
  media_type: string | null
  is_short: boolean
  created_at: string
  likes: string[]
  commentCount: number
}
type Comment = { id: string; author_name: string | null; body: string; created_at: string }

const when = (d: string) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

const css = `
.soc-tabs{display:flex;gap:8px;margin-bottom:16px}
.soc-tabs button{background:#fff;color:#17365D;border:1px solid #D9E0EA}
.soc-tabs button.on{background:#17365D;color:#fff;border-color:#17365D}
.soc-compose{display:grid;gap:10px;margin-bottom:16px}
.soc-compose textarea{width:100%;min-height:80px;padding:10px 12px;border:1px solid #D9E0EA;border-radius:8px;font:inherit;resize:vertical}
.soc-opts{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:.9rem}
.soc-feed{display:grid;gap:14px}
.soc-post{background:#fff;border:1px solid #D9E0EA;border-radius:10px;overflow:hidden}
.soc-head{display:flex;justify-content:space-between;align-items:baseline;padding:12px 14px 0;gap:8px}
.soc-head small{color:#5E6B7C}
.soc-body{padding:8px 14px 12px;white-space:pre-wrap;overflow-wrap:anywhere}
.soc-media{width:100%;max-height:520px;object-fit:contain;background:#0E1A2B;display:block}
.soc-actions{display:flex;gap:8px;padding:8px 14px 12px;flex-wrap:wrap}
.soc-actions button{background:transparent;color:#1F4E78;border:1px solid #D9E0EA;padding:6px 12px}
.soc-actions button.liked{background:#1F4E78;color:#fff;border-color:#1F4E78}
.soc-comments{border-top:1px solid #D9E0EA;padding:10px 14px;display:grid;gap:8px}
.soc-comments p{margin:0;overflow-wrap:anywhere}
.soc-comments small{color:#5E6B7C}
.soc-crow{display:flex;gap:8px}
.soc-shorts{height:calc(100vh - 150px);min-height:420px;overflow-y:auto;scroll-snap-type:y mandatory;display:grid;gap:12px}
.soc-short{position:relative;height:calc(100vh - 150px);min-height:420px;scroll-snap-align:start;background:#0E1A2B;border-radius:10px;overflow:hidden}
.soc-short video{width:100%;height:100%;object-fit:contain}
.soc-short-info{position:absolute;left:0;right:0;bottom:0;padding:40px 14px 14px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.7));pointer-events:none}
.soc-short-info button{pointer-events:auto;margin-top:8px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4)}
.soc-short-info button.liked{background:#fff;color:#17365D}
`

export default function Social() {
  const { userId, profile } = useAuth()
  const [tab, setTab] = useState<'fil' | 'shorts'>('fil')
  const [posts, setPosts] = useState<Post[]>([])
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [short, setShort] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const res = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50)
    if (res.error) { setErr('Chargement : ' + res.error.message); return }
    const rows = (res.data ?? []) as Omit<Post, 'likes' | 'commentCount'>[]
    if (rows.length === 0) { setPosts([]); return }
    const ids = rows.map(r => r.id)
    const likesRes = await supabase.from('post_likes').select('post_id, user_id').in('post_id', ids)
    const comRes = await supabase.from('post_comments').select('post_id').in('post_id', ids)
    const likes = (likesRes.data ?? []) as { post_id: string; user_id: string }[]
    const coms = (comRes.data ?? []) as { post_id: string }[]
    setPosts(rows.map(r => ({
      ...r,
      likes: likes.filter(l => l.post_id === r.id).map(l => l.user_id),
      commentCount: coms.filter(c => c.post_id === r.id).length,
    })))
  }, [])

  useEffect(() => { load() }, [load])

  async function publish() {
    if (!body.trim() && !file) return
    setBusy(true)
    setErr('')
    let mediaUrl: string | null = null
    let mediaType: string | null = null
    if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = userId + '/' + Date.now() + '-' + safe
      const up = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
      if (up.error) { setErr('Envoi du fichier : ' + up.error.message); setBusy(false); return }
      mediaUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
      mediaType = file.type.startsWith('video') ? 'video' : 'image'
    }
    const ins = await supabase.from('posts').insert({
      body: body.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
      is_short: short && mediaType === 'video',
    })
    if (ins.error) setErr('Publication : ' + ins.error.message)
    else { setBody(''); setFile(null); setShort(false) }
    setBusy(false)
    load()
  }

  async function toggleLike(p: Post) {
    if (!userId) return
    const liked = p.likes.includes(userId)
    const r = liked
      ? await supabase.from('post_likes').delete().eq('post_id', p.id).eq('user_id', userId)
      : await supabase.from('post_likes').insert({ post_id: p.id })
    if (r.error) setErr('J\'aime : ' + r.error.message)
    load()
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer cette publication ?')) return
    const r = await supabase.from('posts').delete().eq('id', id)
    if (r.error) setErr('Suppression : ' + r.error.message)
    load()
  }

  const shorts = posts.filter(p => p.is_short && p.media_type === 'video' && p.media_url)
  const isVideo = file !== null && file.type.startsWith('video')

  return (
    <>
      <style>{css}</style>
      <h2>Social et shorts</h2>
      <div className="soc-tabs">
        <button className={tab === 'fil' ? 'on' : ''} onClick={() => setTab('fil')}>Fil d'actualité</button>
        <button className={tab === 'shorts' ? 'on' : ''} onClick={() => setTab('shorts')}>Shorts</button>
      </div>
      {err && <p className="msg">{err}</p>}

      {tab === 'fil' && (
        <>
          <div className="card soc-compose">
            <textarea placeholder="Partagez quelque chose…" value={body} onChange={e => setBody(e.target.value)} />
            <div className="soc-opts">
              <input type="file" accept="image/*,video/*" onChange={e => { setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); setShort(false) }} />
              {isVideo && (
                <label>
                  <input type="checkbox" checked={short} onChange={e => setShort(e.target.checked)} style={{ width: 'auto' }} /> Publier aussi comme short
                </label>
              )}
            </div>
            <button onClick={publish} disabled={busy || (!body.trim() && !file)}>{busy ? 'Envoi en cours…' : 'Publier'}</button>
          </div>
          {posts.length === 0 && <p className="muted">Aucune publication pour le moment.</p>}
          <div className="soc-feed">
            {posts.map(p => (
              <article className="soc-post" key={p.id}>
                <div className="soc-head">
                  <strong>{p.author_name || 'Membre'}</strong>
                  <small>{when(p.created_at)}</small>
                </div>
                {p.body && <div className="soc-body">{p.body}</div>}
                {p.media_url && p.media_type === 'image' && <img className="soc-media" src={p.media_url} alt="" loading="lazy" />}
                {p.media_url && p.media_type === 'video' && <video className="soc-media" src={p.media_url} controls playsInline preload="metadata" />}
                <PostActions
                  post={p}
                  userId={userId}
                  onLike={() => toggleLike(p)}
                  onDelete={profile && (profile.role === 'admin' || p.author === userId) ? () => remove(p.id) : null}
                  onChanged={load}
                />
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'shorts' && (
        shorts.length === 0 ? (
          <p className="muted">Aucun short pour le moment. Publiez une vidéo en cochant « Publier aussi comme short ».</p>
        ) : (
          <div className="soc-shorts">
            {shorts.map(p => (
              <div className="soc-short" key={p.id}>
                <video src={p.media_url ?? ''} controls loop playsInline preload="metadata" />
                <div className="soc-short-info">
                  <strong>{p.author_name || 'Membre'}</strong>
                  {p.body && <div>{p.body}</div>}
                  <button className={userId && p.likes.includes(userId) ? 'liked' : ''} onClick={() => toggleLike(p)}>
                    J'aime ({p.likes.length})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  )
}

function PostActions(props: {
  post: Post
  userId: string | null
  onLike: () => void
  onDelete: (() => void) | null
  onChanged: () => void
}) {
  const { post, userId, onLike, onDelete, onChanged } = props
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const liked = userId !== null && post.likes.includes(userId)

  async function loadComments() {
    const r = await supabase.from('post_comments').select('id, author_name, body, created_at')
      .eq('post_id', post.id).order('created_at', { ascending: true })
    setComments((r.data ?? []) as Comment[])
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) loadComments()
  }

  async function send() {
    if (!text.trim()) return
    await supabase.from('post_comments').insert({ post_id: post.id, body: text.trim() })
    setText('')
    loadComments()
    onChanged()
  }

  return (
    <>
      <div className="soc-actions">
        <button className={liked ? 'liked' : ''} onClick={onLike}>J'aime ({post.likes.length})</button>
        <button onClick={toggle}>Commentaires ({post.commentCount})</button>
        {onDelete && <button onClick={onDelete}>Supprimer</button>}
      </div>
      {open && (
        <div className="soc-comments">
          {comments.map(c => (
            <div key={c.id}>
              <small>{(c.author_name || 'Membre') + ' · ' + when(c.created_at)}</small>
              <p>{c.body}</p>
            </div>
          ))}
          <div className="soc-crow">
            <input placeholder="Écrire un commentaire" value={text} onChange={e => setText(e.target.value)} />
            <button onClick={send} disabled={!text.trim()}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  )
}
