export type PokemonAffinity = {
  position: number
  dex_id: number
  name: string
  types: string[]
  affinity_percentage: number
  popularity_rank: number
}

type PokemonAffinitiesProps = {
  affinities?: PokemonAffinity[]
  compact?: boolean
}

export default function PokemonAffinities({
  affinities = [],
  compact = false,
}: PokemonAffinitiesProps) {
  if (affinities.length === 0) return null

  return (
    <section className={`pokemon-affinities ${compact ? 'is-compact' : ''}`} aria-labelledby={compact ? undefined : 'pokemon-affinities-title'}>
      <div className="pokemon-affinities-heading">
        <p className="eyebrow">Affinités Pokémon</p>
        <h2 id={compact ? undefined : 'pokemon-affinities-title'}>Les 3 Pokémon les plus proches de votre profil</h2>
      </div>

      <ol className="pokemon-affinity-list">
        {affinities.map((pokemon) => (
          <li className={pokemon.position === 1 ? 'is-primary' : ''} key={pokemon.dex_id}>
            <div className="pokemon-affinity-position" aria-label={`Position ${pokemon.position}`}>
              {pokemon.position}
            </div>
            <div className="pokemon-affinity-identity">
              <small>{pokemon.position === 1 ? 'Pokémon avec le plus d’affinité' : `${pokemon.position}e affinité`}</small>
              <strong>{pokemon.name}</strong>
              <span>{pokemon.types.join(' / ')}</span>
            </div>
            <div className="pokemon-affinity-score">
              <strong>{pokemon.affinity_percentage.toLocaleString('fr-FR')} %</strong>
              <span>affinité</span>
            </div>
          </li>
        ))}
      </ol>

      {!compact && (
        <p className="pokemon-affinity-note">
          Ce classement créatif est calculé automatiquement à partir de vos résultats au questionnaire.
        </p>
      )}
    </section>
  )
}
