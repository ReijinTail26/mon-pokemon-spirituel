import { useAuth } from '../auth/AuthContext'

type AppHeaderProps = { onHome?: () => void }
function AppHeader({ onHome }: AppHeaderProps) {
  const { user, logout } = useAuth()
  return <header className="app-header">
    <button className="brand brand-button" onClick={onHome ?? (() => { window.location.href = '/' })} type="button"><div className="brand-mark">✦</div><span className="brand-text">Mon Pokémon spirituel</span></button>
    <nav className="main-navigation" aria-label="Navigation principale"><a href="/">Accueil</a><a href="/community">Communauté</a><a href="/account">Mon espace</a></nav>
    <div className="header-user">
      <span>{user?.username ? `@${user.username}` : 'Pseudo à choisir'}</span>
      <button type="button" onClick={logout}>Déconnexion</button>
    </div>
  </header>
}
export default AppHeader
