import { useState } from 'react'

type Props = {
  baseSrc: string
  evolutionSrc?: string | null
  baseAlt: string
  evolutionAlt?: string
  className?: string
  imageClassName?: string
  linkHref?: string
  lazy?: boolean
}

export default function PokedexSheetSwitcher({
  baseSrc,
  evolutionSrc,
  baseAlt,
  evolutionAlt = 'Fiche Pokédex Évolution',
  className = '',
  imageClassName = '',
  linkHref,
  lazy = false,
}: Props) {
  const [showEvolution, setShowEvolution] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const evolutionAvailable = Boolean(evolutionSrc)
  const showingEvolution = showEvolution && evolutionAvailable
  const activeSrc = showingEvolution && evolutionSrc ? evolutionSrc : baseSrc
  const activeAlt = showingEvolution ? evolutionAlt : baseAlt

  function switchSheet() {
    if (!evolutionAvailable) return
    setShowEvolution(current => !current)
    setAnimationKey(current => current + 1)
  }

  const image = <img
    key={animationKey}
    className={`pokedex-sheet-image ${imageClassName}`.trim()}
    src={activeSrc}
    alt={activeAlt}
    loading={lazy ? 'lazy' : undefined}
  />

  return <div className={`pokedex-sheet-switcher ${showingEvolution ? 'is-evolution' : 'is-base'} ${className}`.trim()}>
    {linkHref ? <a className="pokedex-sheet-link" href={linkHref}>{image}</a> : image}
    {evolutionAvailable && <>
      <button
        className="evolution-switch-button"
        type="button"
        onClick={switchSheet}
        aria-label={showingEvolution ? 'Afficher la fiche de base' : 'Afficher la fiche Évolution'}
        title={showingEvolution ? 'Revenir à la fiche de base' : 'Voir l’Évolution'}
      >
        <span className="evolution-switch-icon" aria-hidden="true">✦</span>
      </button>
      <span className="evolution-sheet-label">{showingEvolution ? 'Évolution' : 'Forme de base'}</span>
    </>}
  </div>
}
