import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import PokedexSheetSwitcher from '../components/PokedexSheetSwitcher'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC'
type Item = {
  id: string; status: string; visibility: Visibility; created_at: string;
  animal_name: string | null; type_1_name: string | null; type_2_name: string | null;
  generation_status: string | null; share_url: string | null;
  has_final_sheet: boolean; final_sheet_url: string | null; final_sheet_uploaded_at: string | null;
  evolution_slot_unlocked: boolean; evolution_slot_unlocked_at: string | null;
  has_evolution_sheet: boolean; evolution_sheet_url: string | null; evolution_sheet_uploaded_at: string | null;
  community_published_at: string | null;
  deliverables: { dossier_pdf: string; prompt_txt: string; evolution_seed_pdf: string | null } | null;
}

export default function AccountScreen() {
  const { user, refresh, logout } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [username, setUsername] = useState(user?.username ?? '')
  const [savingUsername, setSavingUsername] = useState(false)

  async function load() {
    const response = await fetch(`${API_URL}/api/v1/account/assessments`, { credentials: 'include' })
    const data = await response.json()
    const assessments: Item[] = data.assessments ?? []
    setItems(assessments)
    setSelectedItemId(current => assessments.some(item => item.id === current) ? current : (assessments[0]?.id ?? ''))
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setUsername(user?.username ?? '') }, [user?.username])

  async function saveUsername() {
    setSavingUsername(true); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/profile/username`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      await refresh()
      setMessage(`Pseudo public enregistré : @${data.username}`)
    } else setMessage(data.error?.message ?? 'Impossible de modifier le pseudo.')
    setSavingUsername(false)
  }

  async function setVisibility(id: string, visibility: 'PRIVATE' | 'UNLISTED') {
    setBusyId(id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${id}/visibility`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, visibility, share_url: data.share_url ?? null, community_published_at: null } : item))
    } else setMessage(data.error?.message ?? 'Impossible de modifier la visibilité.')
    setBusyId(null)
  }

  async function uploadFinalSheet(item: Item, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusyId(item.id); setMessage('')
    const form = new FormData()
    form.append('final_sheet', file)
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/final-sheet`, {
      method: 'POST', credentials: 'include', body: form,
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? {
        ...current,
        has_final_sheet: true,
        final_sheet_url: `${data.final_sheet_url}?v=${Date.now()}`,
        visibility: 'PRIVATE',
        share_url: null,
        community_published_at: null,
      } : current))
      setMessage('Fiche Pokédex importée. Tu peux maintenant la publier dans la communauté.')
    } else setMessage(data.error?.message ?? 'Impossible d’importer la fiche.')
    setBusyId(null)
  }

  async function deleteFinalSheet(item: Item) {
    if (!window.confirm('Supprimer la fiche Pokédex de base ? Son Évolution éventuelle sera également supprimée et la création sera retirée de la communauté.')) return
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/final-sheet`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, has_final_sheet: false, final_sheet_url: null, has_evolution_sheet: false, evolution_sheet_url: null, visibility: 'PRIVATE', community_published_at: null } : current))
      setMessage('Fiche de base et Évolution éventuelle supprimées.')
    } else setMessage('Impossible de supprimer la fiche.')
    setBusyId(null)
  }

  async function uploadEvolutionSheet(item: Item, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusyId(item.id); setMessage('')
    const form = new FormData()
    form.append('evolution_sheet', file)
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/evolution-sheet`, {
      method: 'POST', credentials: 'include', body: form,
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? {
        ...current,
        has_evolution_sheet: true,
        evolution_sheet_url: `${data.evolution_sheet_url}?v=${Date.now()}`,
        visibility: 'PRIVATE',
        share_url: null,
        community_published_at: null,
      } : current))
      setMessage('Fiche Évolution importée. Vérifie le basculement avant de republier la création.')
    } else setMessage(data.error?.message ?? 'Impossible d’importer la fiche Évolution.')
    setBusyId(null)
  }

  async function deleteEvolutionSheet(item: Item) {
    if (!window.confirm('Supprimer la fiche Évolution ? La création sera retirée de la communauté.')) return
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/evolution-sheet`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, has_evolution_sheet: false, evolution_sheet_url: null, visibility: 'PRIVATE', community_published_at: null } : current))
      setMessage('Fiche Évolution supprimée.')
    } else setMessage('Impossible de supprimer la fiche Évolution.')
    setBusyId(null)
  }

  async function publish(item: Item) {
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/publish`, { method: 'POST', credentials: 'include' })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, visibility: 'PUBLIC', share_url: null, community_published_at: data.community_published_at } : current))
      setMessage('Fiche publiée dans la communauté.')
    } else setMessage(data.error?.message ?? 'Impossible de publier.')
    setBusyId(null)
  }

  async function unpublish(item: Item) {
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/unpublish`, { method: 'POST', credentials: 'include' })
    if (response.ok) {
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, visibility: 'PRIVATE', community_published_at: null } : current))
      setMessage('Création retirée de la communauté.')
    } else setMessage('Impossible de retirer la création.')
    setBusyId(null)
  }

  async function copyShareLink(item: Item) {
    if (!item.share_url) return
    const url = `${window.location.origin}${item.share_url}`
    await navigator.clipboard.writeText(url)
    setMessage('Lien non listé copié.')
  }

  async function refreshShareLink(item: Item) {
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}/refresh-share-link`, { method: 'POST', credentials: 'include' })
    if (response.ok) {
      const data = await response.json()
      setItems(prev => prev.map(current => current.id === item.id ? { ...current, share_url: data.share_url } : current))
      setMessage('Ancien lien invalidé. Nouveau lien créé.')
    } else setMessage('Impossible de renouveler le lien.')
    setBusyId(null)
  }

  async function deleteCreation(item: Item) {
    const label = item.animal_name ?? 'cette création'
    if (!window.confirm(`Supprimer définitivement ${label}, son package et sa fiche importée ?`)) return
    setBusyId(item.id); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/assessments/${item.id}`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) {
      setItems(prev => prev.filter(current => current.id !== item.id))
      setMessage('Création supprimée.')
    } else setMessage('Impossible de supprimer cette création.')
    setBusyId(null)
  }

  async function deleteAccount() {
    if (!window.confirm('Supprimer votre compte et toutes vos créations ?')) return
    if (window.prompt('Pour confirmer, écrivez exactement SUPPRIMER') !== 'SUPPRIMER') return
    setDeletingAccount(true); setMessage('')
    const response = await fetch(`${API_URL}/api/v1/account/me`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) window.location.href = '/'
    else { setMessage('Impossible de supprimer le compte.'); setDeletingAccount(false) }
  }

  const counts = useMemo(() => ({
    total: items.length,
    privateCount: items.filter(i => i.visibility === 'PRIVATE').length,
    sharedCount: items.filter(i => i.visibility === 'UNLISTED').length,
    publicCount: items.filter(i => i.visibility === 'PUBLIC').length,
  }), [items])

  const selectedItem = useMemo(
    () => items.find(item => item.id === selectedItemId) ?? items[0] ?? null,
    [items, selectedItemId],
  )

  function formatCreationDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  }

  function creationTypes(item: Item) {
    return [item.type_1_name, item.type_2_name].filter(Boolean).join(' / ') || 'Types à déterminer'
  }

  return <main className="account-page page">
    <section className="panel account-hero">
      <div className="account-profile"><div className="account-avatar fallback">✦</div><div><p className="eyebrow">Mon espace</p><h1>{user?.username ? `@${user.username}` : 'Choisis ton pseudo'}</h1><p>Ton compte Google reste privé. Seul ton pseudo sera affiché publiquement.</p></div></div>
      <div className="account-actions"><a className="button button-secondary" href="/">Accueil</a><a className="button button-secondary" href="/community">Communauté</a><button className="button button-secondary" onClick={logout}>Déconnexion</button></div>
    </section>

    <section className="panel username-panel">
      <div><p className="eyebrow">Identité publique</p><h2>Pseudo</h2><p>3 à 24 caractères. Lettres, chiffres, tiret et underscore. Ton nom Google et ton e-mail ne sont jamais affichés dans la communauté.</p></div>
      <div className="username-editor"><input value={username} maxLength={24} onChange={e => setUsername(e.target.value)} placeholder="TonPseudo" /><button className="button button-primary" disabled={savingUsername} onClick={saveUsername}>{savingUsername ? 'Enregistrement…' : 'Enregistrer le pseudo'}</button></div>
    </section>

    <section className="account-summary-grid">
      <div className="panel account-stat"><strong>{counts.total}</strong><span>créations</span></div><div className="panel account-stat"><strong>{counts.privateCount}</strong><span>privées</span></div><div className="panel account-stat"><strong>{counts.sharedCount}</strong><span>non listées</span></div><div className="panel account-stat"><strong>{counts.publicCount}</strong><span>communauté</span></div>
    </section>

    {message && <div className="account-message" role="status">{message}</div>}

    <section className="panel account-list-panel">
      <div className="account-section-heading"><div><p className="eyebrow">Bibliothèque personnelle</p><h2>Mes créations</h2></div><a className="button button-primary" href="/">Créer un nouveau Pokémon</a></div>
      {loading ? <p>Chargement…</p> : items.length === 0 ? <p>Aucune création pour le moment.</p> : selectedItem && <div className="creation-library">
        <label className="creation-picker">
          <span>Choisir une ancienne création</span>
          <select value={selectedItem.id} onChange={event => setSelectedItemId(event.target.value)}>
            {items.map(item => <option value={item.id} key={item.id}>
              {item.animal_name ?? 'Questionnaire en cours'} — {creationTypes(item)} — {formatCreationDate(item.created_at)}
            </option>)}
          </select>
          <small>{items.length} création{items.length > 1 ? 's' : ''} dans ta bibliothèque</small>
        </label>

        <article className="creation-card" key={selectedItem.id}>
          <div className="creation-card-heading">
            <div className="creation-title-row">
              <div><p className="eyebrow">Création sélectionnée</p><h3>{selectedItem.animal_name ?? 'Questionnaire en cours'}</h3></div>
              {selectedItem.evolution_slot_unlocked && (
                <div className="evolution-potential-badge">✨ Peut évoluer</div>
              )}
            </div>
            <div className="creation-key-points">
              <span><small>Animal</small><strong>{selectedItem.animal_name ?? 'À déterminer'}</strong></span>
              <span><small>Type</small><strong>{creationTypes(selectedItem)}</strong></span>
              <span><small>Date</small><strong>{formatCreationDate(selectedItem.created_at)}</strong></span>
            </div>
          </div>

        {selectedItem.status === 'COMPLETED' && selectedItem.generation_status !== 'READY' && (
          <div className="creation-continuation">
            <div>
              <strong>Questionnaire terminé</strong>
              <p>Cette création n’a pas encore reçu son dossier créatif. Reviens à la validation pour lancer ou reprendre sa préparation.</p>
            </div>
            <a className="button button-primary" href={`/?finaliser=${encodeURIComponent(selectedItem.id)}`}>
              Finaliser cette création
            </a>
          </div>
        )}

        {selectedItem.deliverables && <div className="creation-links"><a href={`${API_URL}${selectedItem.deliverables.dossier_pdf}`} target="_blank" rel="noreferrer">Dossier créatif PDF</a><a href={`${API_URL}${selectedItem.deliverables.prompt_txt}`} target="_blank" rel="noreferrer">Prompt final</a>{selectedItem.deliverables.evolution_seed_pdf && <a href={`${API_URL}${selectedItem.deliverables.evolution_seed_pdf}`} target="_blank" rel="noreferrer">Seed évolutif PDF</a>}</div>}

        <div className="final-sheet-zone">
          <strong>Fiche Pokédex finale</strong>
          {!selectedItem.has_final_sheet ? <>
            <p>Après avoir généré ta fiche avec l’IA de ton choix, importe-la ici. Cette étape est obligatoire pour publier dans la communauté.</p>
            <label className={`button button-secondary upload-button ${selectedItem.generation_status !== 'READY' ? 'disabled' : ''}`}>Importer ma fiche<input type="file" hidden disabled={selectedItem.generation_status !== 'READY' || busyId === selectedItem.id} accept="image/png,image/jpeg,image/webp" onChange={e => uploadFinalSheet(selectedItem, e)} /></label>
          </> : <>
            {selectedItem.final_sheet_url && <PokedexSheetSwitcher
              baseSrc={`${API_URL}${selectedItem.final_sheet_url}`}
              evolutionSrc={selectedItem.evolution_sheet_url ? `${API_URL}${selectedItem.evolution_sheet_url}` : null}
              baseAlt="Fiche Pokédex de base importée"
              evolutionAlt="Fiche Pokédex Évolution importée"
              className="account-sheet-switcher"
              imageClassName="final-sheet-preview"
            />}
            <div className="share-actions"><label className="button button-secondary upload-button">Remplacer la base<input type="file" hidden disabled={busyId === selectedItem.id} accept="image/png,image/jpeg,image/webp" onChange={e => uploadFinalSheet(selectedItem, e)} /></label><button className="button button-secondary" disabled={busyId === selectedItem.id} onClick={() => deleteFinalSheet(selectedItem)}>Supprimer la base</button></div>

            <div className={`evolution-management ${selectedItem.evolution_slot_unlocked ? 'is-unlocked' : 'is-locked'}`}>
              <div><strong>Évolution</strong><p>Une seconde fiche optionnelle, accessible depuis l’icône placée en haut à droite.</p></div>
              {!selectedItem.evolution_slot_unlocked ? <div className="evolution-lock-badge">Évolution verrouillée</div> : !selectedItem.has_evolution_sheet ?
                <label className="button button-secondary upload-button">Importer l’Évolution<input type="file" hidden disabled={busyId === selectedItem.id} accept="image/png,image/jpeg,image/webp" onChange={e => uploadEvolutionSheet(selectedItem, e)} /></label> :
                <div className="share-actions"><label className="button button-secondary upload-button">Remplacer l’Évolution<input type="file" hidden disabled={busyId === selectedItem.id} accept="image/png,image/jpeg,image/webp" onChange={e => uploadEvolutionSheet(selectedItem, e)} /></label><button className="button button-secondary" disabled={busyId === selectedItem.id} onClick={() => deleteEvolutionSheet(selectedItem)}>Supprimer l’Évolution</button></div>}
            </div>
          </>}
        </div>

        {selectedItem.visibility !== 'PUBLIC' && <label>Partage privé
          <select disabled={busyId === selectedItem.id} value={selectedItem.visibility === 'UNLISTED' ? 'UNLISTED' : 'PRIVATE'} onChange={e => setVisibility(selectedItem.id, e.target.value as 'PRIVATE' | 'UNLISTED')}>
            <option value="PRIVATE">Privé — moi uniquement</option><option value="UNLISTED">Non listé — lien secret</option>
          </select>
        </label>}

        {selectedItem.visibility === 'UNLISTED' && selectedItem.share_url && <div className="share-actions"><button className="button button-secondary" onClick={() => copyShareLink(selectedItem)}>Copier le lien</button><button className="button button-secondary" disabled={busyId === selectedItem.id} onClick={() => refreshShareLink(selectedItem)}>Renouveler</button></div>}

        <div className="community-publish-zone">
          {selectedItem.visibility === 'PUBLIC' ? <><div className="published-badge">Publié dans la communauté</div><button className="button button-secondary" disabled={busyId === selectedItem.id} onClick={() => unpublish(selectedItem)}>Retirer de la communauté</button></> : <button className="button button-primary" disabled={busyId === selectedItem.id || !selectedItem.has_final_sheet || !user?.username || selectedItem.generation_status !== 'READY'} onClick={() => publish(selectedItem)}>Publier dans la communauté</button>}
          {!user?.username && <small>Choisis ton pseudo avant de publier.</small>}
          {!selectedItem.has_final_sheet && <small>Importe d’abord ta fiche Pokédex finale.</small>}
        </div>

        <div className="danger-row"><button className="danger-link" disabled={busyId === selectedItem.id} onClick={() => deleteCreation(selectedItem)}>Supprimer la création</button></div>
      </article>
      </div>}
    </section>

    <section className="panel danger-zone"><div><p className="eyebrow">Compte</p><h2>Zone sensible</h2><p>La suppression retire tes créations de la communauté, supprime les fiches importées et les fichiers générés associés.</p></div><button className="button danger-button" disabled={deletingAccount} onClick={deleteAccount}>{deletingAccount ? 'Suppression…' : 'Supprimer mon compte'}</button></section>
  </main>
}
