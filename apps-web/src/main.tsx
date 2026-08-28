import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginScreen from './screens/LoginScreen'
import AccountScreen from './screens/AccountScreen'
import CommunityScreen from './screens/CommunityScreen'
import CommunityDetailScreen from './screens/CommunityDetailScreen'
import LegalScreen from './screens/LegalScreen'
import LegalFooter from './components/LegalFooter'
import AppShell from './components/AppShell'
import { getPageSessionBackground } from './config/backgrounds'

function Root() {
  const { loading, user } = useAuth()
  const path = window.location.pathname
  const communityDetailMatch = path.match(/^\/community\/([0-9a-f-]+)$/i)
  let content
  if (path === '/community' || path === '/gallery') content = <CommunityScreen />
  else if (communityDetailMatch) content = <CommunityDetailScreen assessmentId={communityDetailMatch[1]} />
  else if (path === '/legal') content = <LegalScreen kind="legal" />
  else if (path === '/privacy') content = <LegalScreen kind="privacy" />
  else if (loading) content = <main className="auth-page"><section className="panel auth-card">Chargement…</section></main>
  else if (!user) content = <LoginScreen />
  else if (path === '/account') content = <AccountScreen />
  else content = <App />
  if (content.type === App) return <>{content}<LegalFooter /></>
  return <AppShell background={getPageSessionBackground()}>{content}<LegalFooter /></AppShell>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><AuthProvider><Root /></AuthProvider></StrictMode>,
)
