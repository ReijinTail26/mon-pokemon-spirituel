import { useAuth } from '../auth/AuthContext'

export default function LegalFooter() {
  const { user, logout } = useAuth()

  return <footer className="legal-footer">
    <div className="legal-footer-links"><a href="/install">Installer l’application</a><a href="/legal">Mentions légales</a><a href="/privacy">Confidentialité</a></div>
    {user ? <button className="footer-logout-button" type="button" onClick={logout}>Déconnexion</button> : null}
  </footer>
}
