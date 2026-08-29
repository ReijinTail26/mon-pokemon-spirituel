import { useAuth } from '../auth/AuthContext'

export default function LoginScreen() {
  const { loginWithGoogle, refresh, serviceUnavailable } = useAuth()
  const failed = new URLSearchParams(window.location.search).get('auth') === 'failed'

  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="brand-mark auth-logo">✦</div>
        <p className="eyebrow">Mon Pokémon spirituel</p>
        <h1 className="page-title">Votre espace créatif</h1>
        <p className="page-subtitle">
          Connectez-vous avec Google pour sauvegarder vos questionnaires, retrouver vos dossiers créatifs et choisir lesquels partager.
        </p>
        {failed && <p className="auth-error">La connexion Google a échoué. Réessayez.</p>}
        {serviceUnavailable && (
          <p className="auth-error">
            Le serveur est momentanément indisponible. Votre session n'a pas été supprimée.
          </p>
        )}
        <button
          className="button button-primary google-login-button"
          onClick={loginWithGoogle}
          type="button"
          disabled={serviceUnavailable}
        >
          Continuer avec Google
        </button>
        {serviceUnavailable && (
          <button className="button button-secondary" onClick={() => refresh()} type="button">
            Réessayer la connexion au serveur
          </button>
        )}
        <p className="auth-privacy-note">
          Le site demande uniquement votre identité Google de base (nom, e-mail et photo). Vos réponses et scores restent privés.
        </p>
        <a className="auth-gallery-link" href="/gallery">Voir la galerie publique</a>
      </section>
    </main>
  )
}
