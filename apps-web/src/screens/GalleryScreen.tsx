import { useEffect, useState } from 'react'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
type Item = { id:string; created_at:string; animal_name:string; type_1_name:string; type_2_name:string|null; dossier_pdf:string }
export default function GalleryScreen() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => { fetch(`${API_URL}/api/v1/public/gallery`).then(r => r.json()).then(d => setItems(d.assessments ?? [])).catch(() => setItems([])) }, [])
  return <main className="page gallery-page"><section className="panel"><div className="gallery-heading"><div><p className="eyebrow">Communauté</p><h1 className="page-title">Galerie publique</h1><p className="page-subtitle">Seules les créations rendues publiques par leur propriétaire apparaissent ici.</p></div><div className="center-actions"><a className="button button-secondary" href="/">Accueil</a><a className="button button-primary" href="/account">Mon espace</a></div></div>
    {items.length === 0 ? <p>Aucune création publique pour le moment.</p> : <div className="account-grid">{items.map(item => <article className="creation-card" key={item.id}><strong>{item.animal_name}</strong><p>{[item.type_1_name,item.type_2_name].filter(Boolean).join(' / ')}</p><p className="creation-date">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p><a href={`${API_URL}${item.dossier_pdf}`} target="_blank" rel="noreferrer">Voir le dossier créatif</a></article>)}</div>}
  </section></main>
}
