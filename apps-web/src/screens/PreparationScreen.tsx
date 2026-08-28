type PreparationStatus =
  | 'FINALIZING'
  | 'READY'
  | 'FAILED'

type PreparationScreenProps = {
  status: PreparationStatus | null
  errorMessage?: string | null
  onHome: () => void
}

function getPreparationLabel(
  status: PreparationStatus | null
) {
  switch (status) {
    case 'FINALIZING':
      return {
        title:
          'Votre dossier créatif prend forme',
        subtitle:
          'Nous assemblons le DNA, la spécification canonique du Pokémon, le dossier PDF et le prompt final.',
        step:
          'Création des livrables',
      }

    case 'READY':
      return {
        title:
          'Votre dossier créatif est prêt',
        subtitle:
          'Les deux livrables sont disponibles.',
        step:
          'Terminé',
      }

    case 'FAILED':
      return {
        title:
          'La préparation a rencontré un problème',
        subtitle:
          'Le backend a interrompu la création des livrables.',
        step:
          'Préparation interrompue',
      }

    default:
      return {
        title:
          'Préparation de votre dossier créatif',
        subtitle:
          'Nous récupérons l’état de la préparation.',
        step:
          'Initialisation',
      }
  }
}

function PreparationScreen({
  status,
  errorMessage,
  onHome,
}: PreparationScreenProps) {
  const content =
    getPreparationLabel(
      status
    )

  const failed =
    status ===
    'FAILED'

  return (
    <main className="page">
      <section className="panel resume-card">
        <p className="eyebrow">
          Dossier créatif
        </p>

        <h1 className="page-title">
          {content.title}
        </h1>

        <p className="page-subtitle">
          {content.subtitle}
        </p>

        {!failed && (
          <div className="loading-orb" />
        )}

        <div className="generation-status-card">
          <span className="generation-status-dot" />

          <div>
            <strong>
              {content.step}
            </strong>

            {!failed && (
              <p>
                Le résultat reste associé à votre questionnaire. Vous pourrez le récupérer une fois prêt.
              </p>
            )}
          </div>
        </div>

        {failed && (
          <div className="error-box generation-error">
            {errorMessage ??
              'Une erreur inconnue est survenue.'}
          </div>
        )}

        {failed && (
          <div className="center-actions generation-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={onHome}
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default PreparationScreen
