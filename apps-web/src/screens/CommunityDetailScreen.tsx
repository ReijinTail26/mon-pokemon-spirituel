import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import PokedexSheetSwitcher from '../components/PokedexSheetSwitcher'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type CommunityItem = {
  id: string
  username: string
  animal_name: string | null
  type_1_name: string | null
  type_2_name: string | null
  published_at: string
  final_sheet_uploaded_at: string | null
  final_sheet_url: string
  evolution_sheet_url: string | null
  like_count: number
  liked_by_me: boolean
}

export default function CommunityDetailScreen({ assessmentId }: { assessmentId: string }) {
  const { loading: authLoading, user } = useAuth()
  const [item, setItem] = useState<CommunityItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/v1/public/community/${assessmentId}`, { credentials: 'include' })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error?.message ?? 'Création introuvable.')
        if (!cancelled) setItem(data.item)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Création introuvable.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [assessmentId])

  async function toggleLike() {
    if (!item || !user || liking) return
    setLiking(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/v1/public/community/${item.id}/like`, {
        method: item.liked_by_me ? 'DELETE' : 'POST',
        credentials: 'include',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error?.message ?? 'Impossible de modifier le like.')
      setItem(current => current ? { ...current, like_count: data.like_count, liked_by_me: data.liked_by_me } : current)
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : 'Impossible de modifier le like.')
    } finally {
      setLiking(false)
    }
  }

  if (loading) return <main className="page community-detail-page"><section className="panel"><p>Chargement…</p></section></main>
  if (!item) return <main className="page community-detail-page"><section className="panel"><p>{error || 'Création introuvable.'}</p><a className="button button-secondary" href="/community">Retour à la communauté</a></section></main>

  const types = [item.type_1_name, item.type_2_name].filter(Boolean).join(' / ') || 'À déterminer'

  return <main className="page community-detail-page">
    <div className="community-detail-navigation"><a className="button button-secondary" href="/community">← Communauté</a><a className="button button-secondary" href="/">Accueil</a></div>
    <article className="panel community-detail-card">
      <div className="community-detail-heading">
        <div><p className="eyebrow">Résultat communautaire</p><h1>{item.animal_name ?? 'Pokémon personnalisé'}</h1><p>Publié par <strong>@{item.username}</strong></p></div>
        <div className="community-detail-meta"><span><small>Animal</small><strong>{item.animal_name ?? 'À déterminer'}</strong></span><span><small>Type</small><strong>{types}</strong></span><span><small>Publication</small><strong>{new Date(item.published_at).toLocaleDateString('fr-FR')}</strong></span></div>
      </div>

      <PokedexSheetSwitcher
        baseSrc={`${API_URL}${item.final_sheet_url}`}
        evolutionSrc={item.evolution_sheet_url ? `${API_URL}${item.evolution_sheet_url}` : null}
        baseAlt={`Fiche Pokédex de base publiée par ${item.username}`}
        evolutionAlt={`Fiche Pokédex Évolution publiée par ${item.username}`}
        className="community-detail-sheet-switcher"
        imageClassName="community-detail-image"
      />

      <div className="community-like-zone">
        <button className={`pokeball-like-button ${item.liked_by_me ? 'is-liked' : ''}`} type="button" disabled={!user || liking || authLoading} onClick={toggleLike} aria-pressed={item.liked_by_me}>
          <span className="pokeball-icon" aria-hidden="true" />
          <span><strong>{item.like_count}</strong><small>{item.liked_by_me ? 'Pokéball déposée' : 'Déposer une Pokéball'}</small></span>
        </button>
        {!authLoading && !user && <p>Connecte-toi pour déposer ta Pokéball. <a href="/account">Se connecter</a></p>}
        <p className="community-no-interaction">Aucun commentaire ni messagerie : cette page sert uniquement à présenter le résultat.</p>
      </div>
      {error && <p className="account-message" role="status">{error}</p>}
    </article>
  </main>
}
