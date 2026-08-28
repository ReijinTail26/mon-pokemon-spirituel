type DevOptions = {
  animals: string[]
  types: string[]
}

type HomeScreenProps = {
  hasActiveAssessment: boolean
  answeredCount: number
  totalQuestions: number
  hasPreparedResult: boolean
  preparedResultReady: boolean
  onStart: () => void
  onResume: () => void
  onOpenPreparedResult: () => void
  devEnabled: boolean
  devOptions: DevOptions | null
  devAnimal: string
  devType1: string
  devType2: string
  devBusy: boolean
  onDevAnimalChange: (value: string) => void
  onDevType1Change: (value: string) => void
  onDevType2Change: (value: string) => void
  onDevGenerate: () => void
}

function HomeScreen({
  hasActiveAssessment,
  answeredCount,
  totalQuestions,
  hasPreparedResult,
  preparedResultReady,
  onStart,
  onResume,
  onOpenPreparedResult,
  devEnabled,
  devOptions,
  devAnimal,
  devType1,
  devType2,
  devBusy,
  onDevAnimalChange,
  onDevType1Change,
  onDevType2Change,
  onDevGenerate,
}: HomeScreenProps) {
  return (
    <main className="page">
      <section className="panel resume-card">
        <p className="eyebrow">Expérience de personnalité</p>

        <h1 className="page-title">
          Découvrez le Pokémon qui vous correspond
        </h1>

        <p className="page-subtitle">
          Répondez à {totalQuestions} questions pour construire
          un Pokémon original inspiré de votre personnalité,
          avec son identité, son anatomie et son style de combat.
        </p>

        <div className="autosave-notice" role="note">
          <span aria-hidden="true">✓</span>
          <p><strong>Sauvegarde automatique activée</strong><br />Votre progression est enregistrée au fil du test. Vous pourrez reprendre là où vous vous êtes arrêté.</p>
        </div>

        <div className="center-actions" style={{ marginTop: 34 }}>
          {hasActiveAssessment ? (
            <button className="button button-primary" type="button" onClick={onResume}>
              Reprendre mon test
            </button>
          ) : (
            <button className="button button-primary" type="button" onClick={onStart}>
              Commencer le test
            </button>
          )}

          {hasPreparedResult && (
            <button className="button button-secondary" type="button" onClick={onOpenPreparedResult}>
              {preparedResultReady ? 'Ouvrir mes livrables' : 'Voir la préparation en cours'}
            </button>
          )}
        </div>

        {hasActiveAssessment && (
          <div className="complete-box" style={{ marginTop: 30 }}>
            <h3>Test en cours</h3>
            <p>{answeredCount} / {totalQuestions} réponses sauvegardées.</p>
          </div>
        )}

        {hasPreparedResult && (
          <div className="complete-box" style={{ marginTop: 18 }}>
            <h3>{preparedResultReady ? 'Dossier disponible' : 'Dossier en préparation'}</h3>
            <p>
              {preparedResultReady
                ? 'Votre dossier créatif PDF et votre prompt complet sont prêts.'
                : 'La préparation continue indépendamment de votre questionnaire actuel.'}
            </p>
          </div>
        )}

        {devEnabled && (
          <div className="dev-panel">
            <div className="dev-panel-heading">
              <span className="dev-badge">DEV</span>
              <div>
                <h3>Génération ciblée</h3>
                <p>Force un animal pour tester directement son DNA visuel et son Visual Seed, sans répondre au questionnaire.</p>
              </div>
            </div>

            <div className="dev-grid">
              <label>
                Animal
                <select value={devAnimal} onChange={(event) => onDevAnimalChange(event.target.value)}>
                  {(devOptions?.animals ?? []).map((animal) => (
                    <option key={animal} value={animal}>{animal}</option>
                  ))}
                </select>
              </label>

              <label>
                Type principal
                <select value={devType1} onChange={(event) => onDevType1Change(event.target.value)}>
                  {(devOptions?.types ?? []).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label>
                Type secondaire
                <select value={devType2} onChange={(event) => onDevType2Change(event.target.value)}>
                  <option value="">Aucun</option>
                  {(devOptions?.types ?? [])
                    .filter((type) => type !== devType1)
                    .map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                </select>
              </label>
            </div>

            <button
              className="button button-secondary"
              type="button"
              disabled={devBusy || !devAnimal || !devType1}
              onClick={onDevGenerate}
            >
              {devBusy ? 'Création du profil DEV…' : 'Générer ce profil DEV'}
            </button>
          </div>
        )}

        <div className="home-stats">
          <div className="home-stat-card"><strong>{totalQuestions}</strong><span>questions</span></div>
          <div className="home-stat-card"><strong>50</strong><span>animaux sources</span></div>
          <div className="home-stat-card"><strong>18</strong><span>types élémentaires</span></div>
        </div>
      </section>
    </main>
  )
}

export default HomeScreen
