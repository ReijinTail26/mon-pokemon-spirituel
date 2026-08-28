import { useState } from 'react'

type DeliverablesScreenProps = {
  dossierUrl: string | null
  promptUrl: string | null
  evolutionSeedUrl: string | null
  onHome: () => void
}

const EVOLUTION_PROMPT = "Applique une transformation visuelle au Pokémon pour te rapprocher a 50% de la référence. Interdiction de transformer le background d'origine"

function downloadUrl(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}download=1`
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('CLIPBOARD_UNAVAILABLE')
}

function DeliverablesScreen({ dossierUrl, promptUrl, evolutionSeedUrl, onHome }: DeliverablesScreenProps) {
  const [actionsVisible, setActionsVisible] = useState(false)
  const [notification, setNotification] = useState('')
  const [copyingPrompt, setCopyingPrompt] = useState(false)

  function notify(message: string) {
    setNotification(message)
    window.setTimeout(() => setNotification(''), 2600)
  }

  async function copyMainPrompt() {
    if (!promptUrl || copyingPrompt) return
    setCopyingPrompt(true)

    try {
      const response = await fetch(promptUrl, { credentials: 'include' })
      if (!response.ok) throw new Error('PROMPT_READ_FAILED')
      await writeClipboard(await response.text())
      notify('Prompt copié')
    } catch (error) {
      console.error(error)
      notify('Impossible de copier le prompt')
    } finally {
      setCopyingPrompt(false)
    }
  }

  async function copyEvolutionPrompt() {
    try {
      await writeClipboard(EVOLUTION_PROMPT)
      notify('Prompt Évolution copié')
    } catch (error) {
      console.error(error)
      notify('Impossible de copier le prompt Évolution')
    }
  }

  return (
    <main className="page deliverables-page">
      <section className="panel deliverables-guide">
        <p className="eyebrow">Étape de génération</p>
        <h1 className="page-title">Votre Pokémon n’est pas encore terminé</h1>

        <div className="deliverables-warning" role="alert">
          <span aria-hidden="true">!</span>
          <div>
            <strong>Le dossier créatif n’est pas le résultat final.</strong>
            <p>Vous devez encore demander à une IA de générer la fiche Pokédex illustrée, puis l’importer dans votre espace personnel.</p>
          </div>
        </div>

        <section className="deliverables-instructions" aria-labelledby="base-generation-title">
          <div className="deliverables-section-heading">
            <span>1</span>
            <div>
              <p className="eyebrow">Création principale</p>
              <h2 id="base-generation-title">Générez votre première fiche Pokédex</h2>
            </div>
          </div>

          <ol className="deliverables-steps">
            <li><span>1</span><p><strong>Téléchargez le dossier créatif PDF.</strong> Il contient toutes les informations canoniques de votre Pokémon.</p></li>
            <li><span>2</span><p><strong>Copiez le prompt complet</strong> grâce au bouton prévu à cet effet. Une notification « Prompt copié » confirmera la copie.</p></li>
            <li><span>3</span><p><strong>Ouvrez une nouvelle discussion sur ChatGPT</strong> et activez le mode <strong>Analyse</strong> pour obtenir un résultat plus pertinent.</p></li>
            <li><span>4</span><p><strong>Ajoutez le dossier créatif PDF en pièce jointe</strong> dans la nouvelle discussion.</p></li>
            <li><span>5</span><p><strong>Collez ensuite le prompt complet.</strong> Si ChatGPT le réduit ou le présente comme un fichier texte joint, choisissez « Afficher en entier » avant de continuer.</p></li>
            <li><span>6</span><p><strong>Laissez ChatGPT générer la fiche finale</strong>, téléchargez l’image obtenue, puis importez-la depuis votre espace personnel sur l’application ou le site web <strong>« Mon Pokémon spirituel »</strong>.</p></li>
          </ol>
        </section>

        {evolutionSeedUrl && (
          <section className="deliverables-instructions evolution-deliverable-guide" aria-labelledby="evolution-generation-title">
            <div className="deliverables-section-heading">
              <span>2</span>
              <div>
                <p className="eyebrow">Évolution débloquée</p>
                <h2 id="evolution-generation-title">Créez ensuite la forme évoluée</h2>
              </div>
            </div>

            <p className="evolution-guide-intro">Effectuez cette seconde opération seulement après avoir obtenu la première fiche Pokédex.</p>

            <ol className="deliverables-steps">
              <li><span>1</span><p>Dans la discussion qui contient votre première fiche, <strong>ajoutez le PDF « Seed évolutif » en pièce jointe</strong>.</p></li>
              <li><span>2</span><p><strong>Copiez puis collez le second prompt</strong> avec le bouton « Copier le prompt Évolution ».</p></li>
              <li><span>3</span><p>Vérifiez que ChatGPT conserve exactement le background d’origine et applique uniquement la transformation visuelle demandée au Pokémon.</p></li>
              <li><span>4</span><p>Téléchargez la nouvelle fiche, puis importez-la comme <strong>Évolution</strong> depuis votre espace personnel.</p></li>
            </ol>
          </section>
        )}

        {!actionsVisible ? (
          <div className="deliverables-reveal-zone">
            <p>Lisez toutes les étapes ci-dessus avant d’accéder aux fichiers.</p>
            <button className="button button-primary deliverables-reveal-button" type="button" aria-expanded="false" onClick={() => setActionsVisible(true)}>
              J’ai compris — révéler les liens
            </button>
          </div>
        ) : (
          <section className="deliverables-actions" aria-live="polite">
            <div className="deliverables-section-heading">
              <span>✓</span>
              <div><p className="eyebrow">Prêt à commencer</p><h2>Vos fichiers et actions</h2></div>
            </div>

            {notification && <div className="copy-notification" role="status">✓ {notification}</div>}

            <div className="deliverable-action-group">
              <h3>Première fiche Pokédex</h3>
              <div className="deliverable-action-buttons">
                {dossierUrl && <a className="button button-primary" href={downloadUrl(dossierUrl)}>Télécharger le dossier créatif</a>}
                {promptUrl && <button className="button button-secondary" type="button" disabled={copyingPrompt} onClick={copyMainPrompt}>{copyingPrompt ? 'Copie…' : 'Copier le prompt complet'}</button>}
                <a className="button chatgpt-button" href="https://chatgpt.com/" target="_blank" rel="noreferrer">Ouvrir ChatGPT dans un nouvel onglet</a>
              </div>
              <small>Sur mobile, ce lien s’ouvrira dans votre navigateur ou dans l’application associée, selon les réglages de votre appareil.</small>
            </div>

            {evolutionSeedUrl && (
              <div className="deliverable-action-group evolution-action-group">
                <h3>Après la première fiche : Évolution</h3>
                <div className="deliverable-action-buttons">
                  <a className="button button-evolution" href={downloadUrl(evolutionSeedUrl)}>Télécharger le Seed évolutif</a>
                  <button className="button button-secondary" type="button" onClick={copyEvolutionPrompt}>Copier le prompt Évolution</button>
                </div>
                <blockquote>{EVOLUTION_PROMPT}</blockquote>
              </div>
            )}

            <div className="deliverables-final-reminder">
              <strong>Dernière étape obligatoire</strong>
              <p>Une fois la fiche générée, revenez dans votre espace personnel sur l’application ou le site web « Mon Pokémon spirituel » pour importer l’image Pokédex obtenue.</p>
            </div>
          </section>
        )}

        <div className="center-actions deliverables-home-action">
          <button className="button button-secondary" type="button" onClick={onHome}>Retour à l’accueil</button>
        </div>
      </section>
    </main>
  )
}

export default DeliverablesScreen
