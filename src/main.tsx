import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './auth'
import { configured } from './lib'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {configured ? (
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    ) : (
      <div className="center">
        <div className="panel">
          <h1>Configuration manquante</h1>
          <p>Ajoutez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans le fichier .env (en local) ou dans les secrets GitHub (en ligne).</p>
        </div>
      </div>
    )}
  </StrictMode>,
)
