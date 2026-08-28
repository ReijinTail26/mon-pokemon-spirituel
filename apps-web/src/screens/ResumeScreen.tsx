type ResumeScreenProps = {
  answeredCount: number
  totalQuestions: number
  progress: number
  onResume: () => void
  onRestart: () => void
  onHome: () => void
}

function ResumeScreen({
  answeredCount,
  totalQuestions,
  progress,
  onResume,
  onRestart,
  onHome,
}: ResumeScreenProps) {
  return (
    <main className="page">
      <section className="panel resume-card">
        <div className="resume-icon">
          ◌
        </div>

        <p className="eyebrow">
          Progression sauvegardée
        </p>

        <h1 className="page-title">
          Votre test est en pause
        </h1>

        <p className="page-subtitle">
          Vous pouvez continuer exactement là où vous vous étiez arrêté.
        </p>

        <div className="resume-progress">
          <div className="resume-stat">
            {answeredCount}
            {' / '}
            {totalQuestions}
            {' '}
            réponses complétées
          </div>

          <div className="progress-track">
            <div
              className="progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="center-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={onResume}
          >
            Reprendre mon test
          </button>

          <button
            className="button button-secondary"
            type="button"
            onClick={onRestart}
          >
            Recommencer le test
          </button>

          <button
            className="button button-secondary"
            type="button"
            onClick={onHome}
          >
            Retour à l'accueil
          </button>
        </div>
      </section>
    </main>
  )
}

export default ResumeScreen