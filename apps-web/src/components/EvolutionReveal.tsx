type EvolutionRevealProps = {
  onContinue: () => void
}

function EvolutionReveal({ onContinue }: EvolutionRevealProps) {
  return (
    <div className="evolution-reveal" role="dialog" aria-modal="true" aria-labelledby="evolution-reveal-title">
      <div className="evolution-glow" aria-hidden="true" />
      <div className="evolution-sparkles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index}>✦</span>)}
      </div>

      <section className="evolution-reveal-card">
        <div className="evolution-reveal-icon" aria-hidden="true">✨</div>
        <h2 id="evolution-reveal-title">Une nouvelle aventure commence !</h2>
        <p>Votre Pokémon est prêt à franchir une nouvelle étape !</p>
        <p><strong>Son potentiel ne demande qu’à s’exprimer : il peut évoluer !</strong> 🌟</p>
        <p>Préparez-vous à découvrir une forme plus puissante, plus impressionnante… et peut-être même surprenante ! ⚡🔥</p>
        <p><strong>Votre Pokémon est prêt. Et vous ?</strong></p>
        <button className="button button-primary" type="button" onClick={onContinue} autoFocus>
          Découvrir mon potentiel évolutif
        </button>
      </section>
    </div>
  )
}

export default EvolutionReveal
