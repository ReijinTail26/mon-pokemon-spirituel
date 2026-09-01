import {
  useEffect,
  useState,
} from 'react'

import AppShell from './components/AppShell'
import AppHeader from './components/AppHeader'
import HomeScreen from './screens/HomeScreen'
import ResumeScreen from './screens/ResumeScreen'
import QuestionnaireScreen from './screens/QuestionnaireScreen'
import CompletedScreen from './screens/CompletedScreen'
import PreparationScreen from './screens/PreparationScreen'
import DeliverablesScreen from './screens/DeliverablesScreen'
import EvolutionReveal from './components/EvolutionReveal'
import type { PokemonAffinity } from './components/PokemonAffinities'

import {
  getPageSessionBackground,
  type BackgroundTheme,
} from './config/backgrounds'

type Question = {
  id: string
  text: string
}

type Questionnaire = {
  version: string
  locale: string
  question_count: number
  questions: Question[]
}

type DevOptions = {
  animals: string[]
  types: string[]
}

type Answers = Record<string, number>

type AssessmentResult = {
  assessment_id: string
  result_id: string
  classification: {
    animal: {
      name: string
      bucket: string
    }
    types: string[]
  }
  pokemon_affinities: PokemonAffinity[]
  created_at: string
}

type GenerationStatus =
  | 'FINALIZING'
  | 'READY'
  | 'FAILED'

type GenerationState = {
  id: string
  assessment_id: string
  status: GenerationStatus
  current_step: string | null
  deliverables: {
    dossier_pdf: string
    prompt_txt: string
    evolution_seed_pdf: string | null
  } | null
  error: {
    code: string
    message: string
  } | null
}

type AppScreen =
  | 'home'
  | 'resume'
  | 'questionnaire'
  | 'completed'
  | 'preparation'
  | 'deliverables'

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3001'

const DEV_TOOLS_ENABLED =
  import.meta.env.DEV ||
  import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'

function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    credentials: 'include',
  })
}

function App() {
  const [questionnaire, setQuestionnaire] =
    useState<Questionnaire | null>(null)

  const [assessmentId, setAssessmentId] =
    useState<string | null>(null)

  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null)

  const [preparedAssessmentId, setPreparedAssessmentId] =
    useState<string | null>(null)

  const [preparationState, setPreparationState] =
    useState<GenerationState | null>(null)

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [answers, setAnswers] =
    useState<Answers>({})

  const [background] =
    useState<BackgroundTheme>(() => getPageSessionBackground())

  const [screen, setScreen] =
    useState<AppScreen>('home')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [saveStatus, setSaveStatus] =
    useState('')

  const [devOptions, setDevOptions] =
    useState<DevOptions | null>(null)

  const [devAnimal, setDevAnimal] =
    useState('')

  const [devType1, setDevType1] =
    useState('Normal')

  const [devType2, setDevType2] =
    useState('')

  const [devBusy, setDevBusy] =
    useState(false)

  const [isCompleting, setIsCompleting] =
    useState(false)

  const [showEvolutionReveal, setShowEvolutionReveal] =
    useState(false)

  async function loadGenerationState(
    id: string
  ): Promise<GenerationState | null> {
    const response =
      await authFetch(
        `${API_URL}/api/v1/assessments/${id}/generation`
      )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }

      throw new Error(
        'Impossible de récupérer l’état de préparation.'
      )
    }

    const data =
      await response.json()

    const generation =
      data.generation as GenerationState

    setPreparationState(
      generation
    )

    return generation
  }

  useEffect(() => {
    async function initialize() {
      try {
        const questionnaireResponse =
          await fetch(
            `${API_URL}/api/v1/questionnaire`
          )

        if (!questionnaireResponse.ok) {
          throw new Error(
            'Impossible de charger le questionnaire.'
          )
        }

        const questionnaireData =
          await questionnaireResponse.json() as Questionnaire

        setQuestionnaire(
          questionnaireData
        )

        if (DEV_TOOLS_ENABLED) {
          try {
            const devResponse = await fetch(`${API_URL}/api/v1/dev/options`)
            if (devResponse.ok) {
              const options = await devResponse.json() as DevOptions
              setDevOptions(options)
              setDevAnimal(options.animals[0] ?? '')
              setDevType1(options.types.includes('Normal') ? 'Normal' : (options.types[0] ?? ''))
            }
          } catch (devError) {
            console.error('DEV options error:', devError)
          }
        }

        /*
          Depuis la bibliothèque personnelle, une création terminée mais dont
          les livrables ne sont pas prêts peut rouvrir sa validation finale.
          L'identifiant reste vérifié côté API et doit appartenir au compte.
        */
        const creationToFinalize =
          new URLSearchParams(window.location.search)
            .get('finaliser')

        if (creationToFinalize) {
          const assessmentResponse = await authFetch(
            `${API_URL}/api/v1/assessments/${creationToFinalize}`
          )

          if (assessmentResponse.ok) {
            const assessment = await assessmentResponse.json()

            if (assessment.status === 'COMPLETED') {
              setAssessmentId(creationToFinalize)
              await loadAssessmentResult(creationToFinalize)
              window.history.replaceState({}, '', '/')
              setScreen('completed')
              setLoading(false)
              return
            }
          }

          window.history.replaceState({}, '', '/')
        }

        /*
          Une préparation déjà lancée est chargée en mémoire,
          mais elle ne prend jamais possession de assessmentId.
          Elle continue indépendamment d'un nouveau questionnaire.
        */
        const savedGenerationAssessmentId =
          localStorage.getItem(
            'preparedAssessmentId'
          )

        if (savedGenerationAssessmentId) {
          try {
            const generationResponse =
              await authFetch(
                `${API_URL}/api/v1/assessments/${savedGenerationAssessmentId}/generation`
              )

            if (generationResponse.ok) {
              const data =
                await generationResponse.json()

              setPreparedAssessmentId(
                savedGenerationAssessmentId
              )

              setPreparationState(
                data.generation as GenerationState
              )
            } else if (
              generationResponse.status === 404
            ) {
              localStorage.removeItem(
                'preparedAssessmentId'
              )

              setPreparedAssessmentId(
                null
              )

              setPreparationState(
                null
              )
            }
          } catch (err) {
            console.error(
              'Generation resume error:',
              err
            )
          }
        }

        /*
          L'assessment actif ci-dessous concerne uniquement
          un questionnaire encore IN_PROGRESS.
        */
        const savedAssessmentId =
          localStorage.getItem(
            'activeAssessmentId'
          )

        if (!savedAssessmentId) {
          setScreen('home')
          setLoading(false)
          return
        }

        const assessmentResponse =
          await authFetch(
            `${API_URL}/api/v1/assessments/${savedAssessmentId}`
          )

        if (!assessmentResponse.ok) {
          localStorage.removeItem(
            'activeAssessmentId'
          )

          setScreen('home')
          setLoading(false)
          return
        }

        const assessment =
          await assessmentResponse.json()

        if (
          assessment.status !==
          'IN_PROGRESS'
        ) {
          localStorage.removeItem(
            'activeAssessmentId'
          )

          setScreen('home')
          setLoading(false)
          return
        }

        setAssessmentId(
          assessment.assessment_id
        )

        setAnswers(
          assessment.answers ?? {}
        )

        const savedIndex =
          Number.isInteger(
            assessment.current_question_index
          )
            ? assessment.current_question_index
            : 0

        const maxIndex =
          Math.max(
            0,
            questionnaireData.questions.length - 1
          )

        const safeIndex =
          Math.min(
            Math.max(
              savedIndex,
              0
            ),
            maxIndex
          )

        setCurrentIndex(
          safeIndex
        )

        setScreen('home')
        setLoading(false)
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue pendant le chargement.'
        )

        setLoading(false)
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    if (
      screen !== 'preparation' ||
      !preparedAssessmentId
    ) {
      return
    }

    const currentAssessmentId = preparedAssessmentId
    let cancelled = false
    let timeoutId: number | null = null
    let retryDelay = 5000

    async function refresh() {
      try {
        const state =
          await loadGenerationState(
            currentAssessmentId
          )

        if (
          cancelled ||
          !state
        ) {
          return
        }

        if (
          state.status === 'READY'
        ) {
          setScreen('deliverables')
          return
        }

        if (state.status === 'FAILED') {
          return
        }

        retryDelay = 5000
      } catch (err) {
        console.error(
          'Generation polling error:',
          err
        )
        retryDelay = Math.min(retryDelay * 2, 30000)
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(refresh, retryDelay)
      }
    }

    refresh()

    return () => {
      cancelled = true
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [
    screen,
    preparedAssessmentId,
  ])

  async function startNewAssessment() {
    if (!questionnaire) {
      return
    }

    setError('')
    setSaveStatus('')

    try {
      const response =
        await authFetch(
          `${API_URL}/api/v1/assessments`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
          }
        )

      if (!response.ok) {
        throw new Error(
          'Impossible de créer le questionnaire.'
        )
      }

      const assessment =
        await response.json()

      const newAssessmentId =
        assessment.assessment_id

      setAssessmentId(
        newAssessmentId
      )

      setAnswers({})
      setCurrentIndex(0)
      setAssessmentResult(null)

      localStorage.setItem(
        'activeAssessmentId',
        newAssessmentId
      )

      /*
        Une nouvelle session de questionnaire ne touche jamais
        au dossier déjà en préparation : celui-ci peut
        continuer en parallèle.
      */
      setScreen(
        'questionnaire'
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de commencer le test.'
      )
    }
  }

  async function restartAssessment() {
    if (!assessmentId) {
      return
    }

    const confirmed = window.confirm(
      'Recommencer le test supprimera les réponses déjà enregistrées. Continuer ?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await authFetch(
        `${API_URL}/api/v1/assessments/${assessmentId}/restart`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Impossible de recommencer le questionnaire.'
        )
      }

      setAnswers({})
      setCurrentIndex(0)
      setSaveStatus('')
      setError('')
      setScreen('questionnaire')
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de recommencer le questionnaire.'
      )
    }
  }

  function resumeAssessment() {
    if (!assessmentId) {
      return
    }

    if (
      Object.keys(answers).length > 0
    ) {
      setScreen('resume')
    } else {
      setScreen('questionnaire')
    }
  }

  async function saveAnswers(
    answerList: Array<{
      question_id: string
      value: number
    }>,
    nextIndex: number
  ) {
    if (!assessmentId) {
      return false
    }

    setSaveStatus(
      'Sauvegarde...'
    )

    try {
      const response =
        await authFetch(
          `${API_URL}/api/v1/assessments/${assessmentId}/answers`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              answers: answerList,
              current_question_index:
                nextIndex,
            }),
          }
        )

      if (!response.ok) {
        throw new Error(
          'Erreur de sauvegarde.'
        )
      }

      setSaveStatus(
        '✓ Progression sauvegardée'
      )

      return true
    } catch (err) {
      console.error(err)

      setSaveStatus(
        '⚠ Sauvegarde impossible'
      )

      return false
    }
  }

  async function answerQuestion(
    value: number
  ) {
    if (!questionnaire) {
      return
    }

    const currentQuestion =
      questionnaire.questions[
        currentIndex
      ]

    if (!currentQuestion) {
      setError(
        'Question introuvable.'
      )
      return
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    }

    setAnswers(
      updatedAnswers
    )

    const isLastQuestion =
      currentIndex ===
      questionnaire.questions.length - 1

    const nextIndex =
      isLastQuestion
        ? currentIndex
        : currentIndex + 1

    const saved =
      await saveAnswers(
        [
          {
            question_id:
              currentQuestion.id,
            value,
          },
        ],
        nextIndex
      )

    if (
      saved &&
      !isLastQuestion
    ) {
      setCurrentIndex(
        nextIndex
      )
    }
  }

  async function goPrevious() {
    if (
      !questionnaire ||
      !assessmentId
    ) {
      return
    }

    const newIndex =
      Math.max(
        0,
        currentIndex - 1
      )

    setCurrentIndex(
      newIndex
    )

    await saveAnswers(
      [],
      newIndex
    )
  }

  async function loadAssessmentResult(
    id: string
  ) {
    const response =
      await authFetch(
        `${API_URL}/api/v1/assessments/${id}/result`
      )

    if (!response.ok) {
      const data =
        await response
          .json()
          .catch(() => null)

      throw new Error(
        data?.error?.message ??
          'Impossible de récupérer le résultat.'
      )
    }

    const result =
      await response.json() as AssessmentResult

    setAssessmentResult(
      result
    )

    return result
  }

  async function completeAssessment() {
    if (
      !assessmentId ||
      isCompleting
    ) {
      return
    }

    setIsCompleting(true)
    setError('')

    try {
      const response =
        await authFetch(
          `${API_URL}/api/v1/assessments/${assessmentId}/complete`,
          {
            method: 'POST',
          }
        )

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null)

        throw new Error(
          data?.error?.message ??
            'Impossible de terminer le questionnaire.'
        )
      }

      await loadAssessmentResult(
        assessmentId
      )

      localStorage.removeItem(
        'activeAssessmentId'
      )

      setScreen(
        'completed'
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de terminer le questionnaire.'
      )
    } finally {
      setIsCompleting(false)
    }
  }

  async function startCreativeDossierPreparation() {
    if (!assessmentId) {
      setError(
        'Assessment introuvable.'
      )
      return
    }

    const completedAssessmentId =
      assessmentId

    try {
      const response =
        await authFetch(
          `${API_URL}/api/v1/assessments/${completedAssessmentId}/generation/start`,
          {
            method: 'POST',
          }
        )

      if (!response.ok) {
        const failure = await response.json().catch(() => null)
        throw new Error(
          failure?.error?.message ??
          'Impossible de démarrer la préparation du dossier.'
        )
      }

      const data =
        await response.json()

      setPreparationState(
        data.generation as GenerationState
      )

      setShowEvolutionReveal(
        data.evolution_reveal === true
      )

      setPreparedAssessmentId(
        completedAssessmentId
      )

      localStorage.setItem(
        'preparedAssessmentId',
        completedAssessmentId
      )

      /*
        Le questionnaire est terminé. On libère assessmentId
        pour qu'un nouveau questionnaire puisse être créé
        pendant que ce dossier continue sa préparation en arrière-plan.
      */
      setAssessmentId(null)
      setAnswers({})
      setCurrentIndex(0)
      setSaveStatus('')

      setScreen(
        'preparation'
      )
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de démarrer la préparation du dossier.'
      )
    }
  }

  async function generateDevProfile() {
    if (!DEV_TOOLS_ENABLED || !devAnimal || !devType1 || devBusy) {
      return
    }

    setDevBusy(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/v1/dev/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animal: devAnimal,
          type_1: devType1,
          type_2: devType2 || null,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Impossible de générer le profil DEV.')
      }

      const generatedAssessmentId = data.assessment_id as string

      setAssessmentResult({
        assessment_id: generatedAssessmentId,
        result_id: data.result_id,
        classification: data.classification,
        pokemon_affinities: data.pokemon_affinities ?? [],
        created_at: new Date().toISOString(),
      })

      setPreparedAssessmentId(generatedAssessmentId)
      setPreparationState(data.generation as GenerationState)
      localStorage.setItem('preparedAssessmentId', generatedAssessmentId)
      setScreen('preparation')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Impossible de générer le profil DEV.')
    } finally {
      setDevBusy(false)
    }
  }

  function renderHome() {
    const hasActiveAssessment =
      Boolean(assessmentId)

    const answeredCount =
      Object.keys(answers).length

    return (
      <AppShell
        background={background}
      >
        <AppHeader />

        <HomeScreen
          hasActiveAssessment={
            hasActiveAssessment
          }
          answeredCount={
            answeredCount
          }
          totalQuestions={
            questionnaire
              ?.questions.length ??
            74
          }
          hasPreparedResult={
            Boolean(
              preparedAssessmentId &&
              preparationState
            )
          }
          preparedResultReady={
            preparationState?.status ===
            'READY'
          }
          onStart={
            startNewAssessment
          }
          onResume={
            resumeAssessment
          }
          onOpenPreparedResult={() =>
            setScreen(
              preparationState?.status ===
                'READY'
                ? 'deliverables'
                : 'preparation'
            )
          }
          devEnabled={DEV_TOOLS_ENABLED}
          devOptions={devOptions}
          devAnimal={devAnimal}
          devType1={devType1}
          devType2={devType2}
          devBusy={devBusy}
          onDevAnimalChange={setDevAnimal}
          onDevType1Change={(value) => {
            setDevType1(value)
            if (devType2 === value) setDevType2('')
          }}
          onDevType2Change={setDevType2}
          onDevGenerate={generateDevProfile}
        />
      </AppShell>
    )
  }

  function renderResume() {
    if (!questionnaire) {
      return null
    }

    const answeredCount =
      Object.keys(answers).length

    const totalQuestions =
      questionnaire.questions.length

    const progress =
      totalQuestions > 0
        ? (
            answeredCount /
            totalQuestions
          ) * 100
        : 0

    return (
      <AppShell
        background={background}
      >
        <AppHeader
          onHome={() =>
            setScreen('home')
          }
        />

        <ResumeScreen
          answeredCount={
            answeredCount
          }
          totalQuestions={
            totalQuestions
          }
          progress={
            progress
          }
          onResume={() =>
            setScreen(
              'questionnaire'
            )
          }
          onRestart={
            restartAssessment
          }
          onHome={() =>
            setScreen('home')
          }
        />
      </AppShell>
    )
  }

  function renderQuestionnaire() {
    if (
      !questionnaire ||
      !assessmentId
    ) {
      return null
    }

    const currentQuestion =
      questionnaire.questions[
        currentIndex
      ]

    if (!currentQuestion) {
      return null
    }

    const answeredCount =
      Object.keys(answers).length

    const totalQuestions =
      questionnaire.questions.length

    const questionnaireComplete =
      answeredCount ===
      totalQuestions

    const progress =
      totalQuestions > 0
        ? (
            answeredCount /
            totalQuestions
          ) * 100
        : 0

    const selectedAnswer =
      answers[currentQuestion.id]

    const saveClass =
      saveStatus.includes('✓')
        ? 'save-line success'
        : saveStatus.includes('⚠')
          ? 'save-line warning'
          : 'save-line'

    return (
      <AppShell
        background={background}
      >
        <AppHeader
          onHome={() =>
            setScreen('home')
          }
        />

        <QuestionnaireScreen
          currentQuestion={
            currentQuestion
          }
          currentIndex={
            currentIndex
          }
          answeredCount={
            answeredCount
          }
          totalQuestions={
            totalQuestions
          }
          progress={
            progress
          }
          selectedAnswer={
            selectedAnswer
          }
          saveClass={
            saveClass
          }
          saveStatus={
            saveStatus
          }
          questionnaireComplete={
            questionnaireComplete
          }
          isCompleting={
            isCompleting
          }
          onAnswer={
            answerQuestion
          }
          onPrevious={
            goPrevious
          }
          onComplete={
            completeAssessment
          }
        />
      </AppShell>
    )
  }

  function renderCompleted() {
    return (
      <AppShell
        background={background}
      >
        <AppHeader />

        <CompletedScreen
          animalName={
            assessmentResult
              ?.classification
              ?.animal
              ?.name ??
            null
          }
          types={
            assessmentResult
              ?.classification
              ?.types ??
            []
          }
          pokemonAffinities={
            assessmentResult
              ?.pokemon_affinities ??
            []
          }
          onGenerate={
            startCreativeDossierPreparation
          }
        />
      </AppShell>
    )
  }

  function renderPreparation() {
    return (
      <AppShell
        background={background}
      >
        <AppHeader
          onHome={() =>
            setScreen('home')
          }
        />

        <PreparationScreen
          status={
            preparationState
              ?.status ??
            null
          }
          errorMessage={
            preparationState
              ?.error
              ?.message ??
            null
          }
          onHome={() =>
            setScreen('home')
          }
        />
      </AppShell>
    )
  }

  function renderDeliverables() {
    return (
      <AppShell
        background={background}
      >
        <AppHeader
          onHome={() =>
            setScreen('home')
          }
        />

        <DeliverablesScreen
          dossierUrl={
            preparationState
              ?.deliverables
              ?.dossier_pdf
              ? `${API_URL}${preparationState.deliverables.dossier_pdf}`
              : null
          }
          promptUrl={
            preparationState
              ?.deliverables
              ?.prompt_txt
              ? `${API_URL}${preparationState.deliverables.prompt_txt}`
              : null
          }
          evolutionSeedUrl={
            preparationState
              ?.deliverables
              ?.evolution_seed_pdf
              ? `${API_URL}${preparationState.deliverables.evolution_seed_pdf}`
              : null
          }
          onHome={() =>
            setScreen('home')
          }
        />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell
        background={background}
      >
        <main className="page">
          <section className="panel resume-card">
            <p className="eyebrow">
              Initialisation
            </p>

            <h1 className="page-title">
              Mon Pokémon spirituel
            </h1>

            <div className="loading-orb" />
          </section>
        </main>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell
        background={background}
      >
        <AppHeader
          onHome={() => {
            setError('')
            setScreen('home')
          }}
        />

        <main className="page">
          <section className="panel">
            <p className="eyebrow">
              Une erreur est survenue
            </p>

            <h1 className="page-title">
              Impossible de continuer
            </h1>

            <div
              className="error-box"
              style={{
                marginTop: 28,
              }}
            >
              {error}
            </div>

            <div
              className="center-actions"
              style={{
                marginTop: 24,
              }}
            >
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setError('')
                  setScreen('home')
                }}
              >
                Retour à l'accueil
              </button>

              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Recharger
              </button>
            </div>
          </section>
        </main>
      </AppShell>
    )
  }

  const renderedScreen = (() => {
  switch (screen) {
    case 'resume':
      return renderResume()

    case 'questionnaire':
      return renderQuestionnaire()

    case 'completed':
      return renderCompleted()

    case 'preparation':
      return renderPreparation()

    case 'deliverables':
      return renderDeliverables()

    case 'home':
    default:
      return renderHome()
  }
  })()

  return (
    <>
      {renderedScreen}
      {showEvolutionReveal && (
        <EvolutionReveal onContinue={() => setShowEvolutionReveal(false)} />
      )}
    </>
  )
}

export default App
