import { useAuth } from '../auth'

export default function Pending() {
  const { profile, refresh, signOut } = useAuth()
  return (
    <div className="center">
      <div className="panel">
        <h1>Compte en attente</h1>
        <p>Votre compte ({profile?.email}) doit être validé par un administrateur avant d'accéder à la plateforme.</p>
        <button onClick={refresh}>Vérifier à nouveau</button>
        <button className="ghost" onClick={signOut}>Se déconnecter</button>
      </div>
    </div>
  )
}
