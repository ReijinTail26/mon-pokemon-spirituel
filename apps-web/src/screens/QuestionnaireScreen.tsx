type Question = {
  id: string
  text: string
}

type QuestionnaireScreenProps = {
  currentQuestion: Question
  currentIndex: number
  answeredCount: number
  totalQuestions: number
  progress: number
  selectedAnswer?: number
  saveClass: string
  saveStatus: string
  questionnaireComplete: boolean
  isCompleting: boolean

  onAnswer: (value: number) => void
  onPrevious: () => void
  onComplete: () => void
}

function QuestionnaireScreen({
  currentQuestion,
  currentIndex,
  answeredCount,
  totalQuestions,
  progress,
  selectedAnswer,
  saveClass,
  saveStatus,
  questionnaireComplete,
  isCompleting,
  onAnswer,
  onPrevious,
  onComplete,
}: QuestionnaireScreenProps) {
  return (
    <>
      <main className="page">
        <section className="panel">
          <p className="eyebrow">
            Votre profil
          </p>

          <h1 className="page-title">
            Questionnaire
          </h1>

          <p className="page-subtitle">
            Répondez spontanément.
            Il n'y a ni bonne ni mauvaise réponse.
          </p>

          <div className="question-meta">
            <span>
              Question {currentIndex + 1}
            </span>

            <span>
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div
            key={currentQuestion.id}
            className="question-card question-transition"
          >
            <h2 className="question-text">
              {currentQuestion.text}
            </h2>

            <div className="answer-scale">
              {[1, 2, 3, 4, 5].map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      selectedAnswer === value
                        ? 'answer-button selected'
                        : 'answer-button'
                    }
                    onClick={() =>
                      onAnswer(value)
                    }
                    aria-label={`Réponse ${value}`}
                  >
                    {value}
                  </button>
                )
              )}
            </div>

            <div className="scale-labels">
              <span>
                Pas du tout d’accord
              </span>

              <span>
                Tout à fait d’accord
              </span>
            </div>
          </div>

          <div className="actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={onPrevious}
              disabled={currentIndex === 0}
            >
              ← Précédent
            </button>

            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              La réponse suivante s'affiche automatiquement
            </span>
          </div>

          <p className={saveClass}>
            {saveStatus}
          </p>

          {questionnaireComplete && (
            <div className="complete-box">
              <h3>
                Questionnaire complet
              </h3>

              <p>
                Toutes les questions ont reçu une réponse.
              </p>

              <button
                className="button button-primary"
                type="button"
                disabled={isCompleting}
                onClick={onComplete}
              >
                {isCompleting
                  ? 'Analyse en cours...'
                  : 'Terminer mon test'}
              </button>
            </div>
          )}
        </section>
      </main>

    </>
  )
}

export default QuestionnaireScreen