const PUBLISHER_NAME = import.meta.env.VITE_LEGAL_PUBLISHER_NAME ?? '[Nom de l’éditeur à compléter]'
const PUBLISHER_ADDRESS = import.meta.env.VITE_LEGAL_PUBLISHER_ADDRESS ?? '[Adresse de l’éditeur à compléter]'
const LEGAL_CONTACT = import.meta.env.VITE_LEGAL_CONTACT ?? '[Adresse e-mail de contact à compléter]'
const HOST_NAME = import.meta.env.VITE_LEGAL_HOST_NAME ?? '[Hébergeur à compléter lors du déploiement]'
const HOST_ADDRESS = import.meta.env.VITE_LEGAL_HOST_ADDRESS ?? '[Adresse de l’hébergeur à compléter]'

export default function LegalScreen({ kind }: { kind: 'legal' | 'privacy' }) {
  if (kind === 'legal') return <main className="page legal-page">
    <section className="panel legal-card">
      <p className="eyebrow">Informations</p><h1>Mentions légales</h1>
      <div className="legal-warning"><strong>À compléter avant la publication</strong><p>Les coordonnées exactes de l’éditeur et de l’hébergeur dépendront de ton mode de déploiement.</p></div>
      <h2>Éditeur du service</h2><p><strong>{PUBLISHER_NAME}</strong><br />{PUBLISHER_ADDRESS}<br />Contact : {LEGAL_CONTACT}</p>
      <h2>Direction de la publication</h2><p>{PUBLISHER_NAME}</p>
      <h2>Hébergement</h2><p><strong>{HOST_NAME}</strong><br />{HOST_ADDRESS}</p>
      <h2>Objet du service</h2><p>Mon Pokémon spirituel propose un questionnaire créatif, la génération d’un résultat privé et l’affichage volontaire d’une fiche finale dans un espace communautaire public.</p>
      <h2>Propriété intellectuelle</h2><p>Les contenus et marques appartenant à des tiers restent la propriété de leurs titulaires respectifs. Les utilisateurs ne doivent publier que des contenus qu’ils sont autorisés à diffuser.</p>
      <div className="legal-actions"><a className="button button-secondary" href="/">Accueil</a><a className="button button-secondary" href="/privacy">Confidentialité</a></div>
    </section>
  </main>

  return <main className="page legal-page">
    <section className="panel legal-card">
      <p className="eyebrow">Données personnelles</p><h1>Politique de confidentialité</h1>
      <p>Cette page décrit simplement les données utilisées par le service et les choix laissés à l’utilisateur.</p>
      <h2>Responsable et contact</h2><p><strong>{PUBLISHER_NAME}</strong><br />Contact pour toute demande relative aux données : {LEGAL_CONTACT}</p>
      <h2>Données traitées</h2><ul><li>identité Google de base utilisée pour la connexion : identifiant technique, nom, e-mail et photo éventuelle ;</li><li>pseudo choisi pour l’affichage public ;</li><li>réponses au questionnaire, résultats, classifications et dossiers créatifs ;</li><li>fiches finales importées, éventuelles fiches Évolution et choix de publication ;</li><li>Pokéballs déposées sur les créations communautaires ;</li><li>données techniques de session indispensables à la connexion.</li></ul>
      <h2>Utilisation des données</h2><p>Ces données servent uniquement à authentifier l’utilisateur, sauvegarder ses créations, produire les résultats demandés, gérer la bibliothèque privée et afficher les éléments qu’il choisit de publier.</p>
      <h2>Visibilité</h2><p>Les réponses, scores, dossiers créatifs, e-mail et identité Google restent privés. Une publication communautaire expose seulement la fiche finale, le pseudo, l’animal, les types, la date et le nombre de Pokéballs.</p>
      <h2>Durée et suppression</h2><p>Les données du compte et les créations sont conservées jusqu’à leur suppression par l’utilisateur. La session de connexion expire automatiquement après 30 jours. La suppression d’un compte retire ses publications, fichiers et Pokéballs associés.</p>
      <h2>Cookies</h2><p>Le service utilise uniquement un cookie de session nécessaire à la connexion et à la sécurité du compte. Aucun outil publicitaire ou de mesure d’audience n’est prévu dans cette version.</p>
      <h2>Droits</h2><p>L’utilisateur peut consulter, modifier ou supprimer les éléments proposés depuis son espace privé. Pour toute demande d’accès, de rectification, d’opposition, d’effacement ou de portabilité, il peut contacter l’adresse indiquée ci-dessus.</p>
      <div className="legal-actions"><a className="button button-secondary" href="/">Accueil</a><a className="button button-secondary" href="/legal">Mentions légales</a></div>
    </section>
  </main>
}
