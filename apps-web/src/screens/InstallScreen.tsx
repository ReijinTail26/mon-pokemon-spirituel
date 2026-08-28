import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
}

export default function InstallScreen() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())
  const ios = isIos()

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }

    function onInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return <main className="install-page page-container">
    <section className="panel install-card">
      <div className="install-app-icon" aria-hidden="true"><span>✦</span></div>
      <p className="eyebrow">APPLICATION MOBILE</p>
      <h1>Installer Mon Pokémon spirituel</h1>
      <p className="install-lead">Ajoutez l’application à votre écran d’accueil et retrouvez votre espace personnel comme une application classique.</p>

      {installed ? <div className="install-status install-status-success"><strong>Application installée</strong><span>Vous pouvez maintenant l’ouvrir depuis votre écran d’accueil.</span></div> : null}

      {!installed && installPrompt ? <button type="button" className="button button-primary install-primary-button" onClick={install}>Installer l’application</button> : null}

      {!installed && ios ? <div className="install-instructions">
        <h2>Sur iPhone ou iPad</h2>
        <ol>
          <li>Ouvrez cette page dans <strong>Safari</strong>.</li>
          <li>Appuyez sur le bouton <strong>Partager</strong>.</li>
          <li>Choisissez <strong>Sur l’écran d’accueil</strong>.</li>
          <li>Confirmez avec <strong>Ajouter</strong>.</li>
        </ol>
      </div> : null}

      {!installed && !ios && !installPrompt ? <div className="install-instructions">
        <h2>Installation</h2>
        <p>Dans le menu de votre navigateur, choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>. Sur Android, utilisez de préférence Chrome.</p>
      </div> : null}

      <div className="install-notes">
        <span>✓ Aucun store nécessaire</span>
        <span>✓ Connexion Google conservée</span>
        <span>✓ Mises à jour automatiques</span>
      </div>
      <a className="button button-secondary" href="/">Retour à l’accueil</a>
    </section>
  </main>
}
