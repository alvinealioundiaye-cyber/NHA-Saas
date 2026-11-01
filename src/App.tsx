import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
import Pending from './pages/Pending'
import Academie from './pages/Academie'
import Users from './pages/Users'
import Soon from './pages/Soon'

const modules = [
  { to: '/academie', label: 'Académie' },
  { to: '/reunions', label: 'Réunions en direct' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/social', label: 'Social et shorts' },
  { to: '/ia', label: 'Assistant IA' },
]

export default function App() {
  const { loading, userId, profile, signOut } = useAuth()

  if (loading) return <div className="center">Chargement…</div>
  if (!userId) return <Login />
  if (!profile || profile.role === 'pending') return <Pending />

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">NHA <span>Digital Cloud</span></div>
        <nav>
          {modules.map(m => <NavLink key={m.to} to={m.to}>{m.label}</NavLink>)}
          {profile.role === 'admin' && <NavLink to="/utilisateurs">Utilisateurs</NavLink>}
        </nav>
        <div className="me">
          <div>{profile.full_name || profile.email}</div>
          <small>{profile.role}</small>
          <button className="ghost" onClick={signOut}>Se déconnecter</button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/academie" replace />} />
          <Route path="/academie" element={<Academie />} />
          <Route path="/reunions" element={<Soon title="Réunions en direct" text="Salles de visioconférence pour les cours et les rendez-vous." />} />
          <Route path="/boutique" element={<Soon title="Boutique" text="Produits numériques et paiement Orange Money / Moov Africa." />} />
          <Route path="/social" element={<Soon title="Social et shorts" text="Fil d'actualité et vidéos courtes en format mobile." />} />
          <Route path="/ia" element={<Soon title="Assistant IA" text="Aide à la création de cours et de contenus." />} />
          {profile.role === 'admin' && <Route path="/utilisateurs" element={<Users />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
