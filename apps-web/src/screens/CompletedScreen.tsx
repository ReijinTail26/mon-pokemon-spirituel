import PokemonAffinities, { type PokemonAffinity } from '../components/PokemonAffinities'

type CompletedScreenProps = {
  animalName?: string | null
  types?: string[]
  pokemonAffinities?: PokemonAffinity[]
  onGenerate: () => void
}

function CompletedScreen({
  animalName,
  types = [],
  pokemonAffinities = [],
  onGenerate,
}: CompletedScreenProps) {
  return (
    <main className="page">
      <section className="panel resume-card">
        <div className="resume-icon">
          ✓
        </div>

        <p className="eyebrow">
          Questionnaire terminé
        </p>

        <h1 className="page-title">
          Votre profil créatif est prêt
        </h1>

        <p className="page-subtitle">
          Vos 74 réponses ont été enregistrées et interprétées.
          Nous pouvons maintenant construire votre Pokémon et préparer
          les livrables qui serviront à générer sa fiche illustrée finale.
        </p>

        {(animalName || types.length > 0) && (
          <div className="complete-box" style={{ marginTop: 28 }}>
            {animalName && (
              <p>
                Animal source : <strong>{animalName}</strong>
              </p>
            )}

            {types.length > 0 && (
              <p>
                Type{types.length > 1 ? 's' : ''} :{' '}
                <strong>{types.join(' / ')}</strong>
              </p>
            )}
          </div>
        )}

        <PokemonAffinities affinities={pokemonAffinities} />

        <div
          className="center-actions"
          style={{
            marginTop: 34,
          }}
        >
          <button
            className="button button-primary"
            type="button"
            onClick={onGenerate}
          >
            Préparer mon dossier créatif
          </button>
        </div>
      </section>
    </main>
  )
}

export default CompletedScreen
