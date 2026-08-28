import { useEffect, useMemo, useState } from 'react'
import PokedexSheetSwitcher from '../components/PokedexSheetSwitcher'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type Item = {
  id: string
  username: string
  animal_name: string | null
  type_1_name: string | null
  type_2_name: string | null
  published_at: string
  final_sheet_url: string
  evolution_sheet_url: string | null
  like_count: number
}

type FilterData = { animals: string[]; types: string[] }

export default function CommunityScreen() {
  const [items, setItems] = useState<Item[]>([])
  const [filters, setFilters] = useState<FilterData>({ animals: [], types: [] })
  const [q, setQ] = useState('')
  const [animal, setAnimal] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(true)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (animal) params.set('animal', animal)
    if (type) params.set('type', type)
    params.set('sort', sort)
    return params.toString()
  }, [q, animal, type, sort])

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/v1/public/community?${query}`)
        const data = await response.json()
        setItems(data.items ?? [])
        setFilters(data.filters ?? { animals: [], types: [] })
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => window.clearTimeout(timer)
  }, [query])

  return <main className="page community-page">
    <section className="panel community-hero">
      <div className="gallery-heading">
        <div><p className="eyebrow">Communauté</p><h1 className="page-title">Créations des utilisateurs</h1><p className="page-subtitle">Seules les fiches Pokédex finales volontairement importées et publiées apparaissent ici. L’identité publique affichée est uniquement le pseudo.</p></div>
        <div className="center-actions"><a className="button button-secondary" href="/">Accueil</a><a className="button button-primary" href="/account">Mon espace</a></div>
      </div>

      <div className="community-filters">
        <label>Rechercher un pseudo<input value={q} onChange={e => setQ(e.target.value)} placeholder="Ex. LunaFox" /></label>
        <label>Animal<select value={animal} onChange={e => setAnimal(e.target.value)}><option value="">Tous</option>{filters.animals.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label>Type<select value={type} onChange={e => setType(e.target.value)}><option value="">Tous</option>{filters.types.map(v => <option key={v} value={v}>{v}</option>)}</select></label>
        <label>Tri<select value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')}><option value="newest">Plus récents</option><option value="oldest">Plus anciens</option></select></label>
      </div>
    </section>

    {loading ? <section className="panel"><p>Chargement…</p></section> : items.length === 0 ? <section className="panel"><p>Aucune fiche ne correspond à ces filtres.</p></section> : (
      <section className="community-grid">
        {items.map(item => <article className="community-card" key={item.id}>
          <PokedexSheetSwitcher
            baseSrc={`${API_URL}${item.final_sheet_url}`}
            evolutionSrc={item.evolution_sheet_url ? `${API_URL}${item.evolution_sheet_url}` : null}
            baseAlt={`Fiche de base publiée par ${item.username}`}
            evolutionAlt={`Évolution publiée par ${item.username}`}
            linkHref={`/community/${item.id}`}
            className="community-sheet-switcher"
            imageClassName="community-card-sheet-image"
            lazy
          />
          <div className="community-card-body">
            <div className="community-card-title"><strong>@{item.username}</strong><span className="community-like-count"><span className="pokeball-icon pokeball-icon-small" aria-hidden="true" />{item.like_count ?? 0}</span></div>
            <p>{item.animal_name ?? 'Pokémon'} · {[item.type_1_name, item.type_2_name].filter(Boolean).join(' / ')}</p>
            <div className="community-card-footer"><span>{new Date(item.published_at).toLocaleDateString('fr-FR')}</span><a href={`/community/${item.id}`}>Voir le résultat</a></div>
          </div>
        </article>)}
      </section>
    )}
  </main>
}
