const questionnairePublic = {
  version: '74q-v2',
  locale: 'fr-FR',

  scale: {
    min: 1,
    max: 5,
    labels: {
      1: 'Pas du tout d’accord',
      2: 'Plutôt pas d’accord',
      3: 'Ni d’accord ni pas d’accord',
      4: 'Plutôt d’accord',
      5: 'Tout à fait d’accord',
    },
  },

  questions: [
    { id: 'q001', text: 'J’aime explorer des idées nouvelles, même lorsqu’elles sortent de l’ordinaire.' },
    { id: 'q002', text: 'Je préfère généralement ce qui m’est familier à ce qui est inhabituel.' },
    { id: 'q003', text: 'Je prends plaisir à imaginer plusieurs possibilités pour une même situation.' },
    { id: 'q004', text: 'Les sujets abstraits ou théoriques m’intéressent peu.' },
    { id: 'q005', text: 'Je suis curieux de découvrir de nouvelles façons de voir les choses.' },
    { id: 'q006', text: 'Je préfère rarement changer mes habitudes simplement pour expérimenter.' },
    { id: 'q007', text: 'La créativité et l’imagination occupent une place importante dans ma manière de penser.' },
    { id: 'q010', text: 'Je suis attiré par les idées complexes ou originales.' },
    { id: 'q011', text: 'Je préfère des réponses simples plutôt que d’examiner plusieurs interprétations possibles.' },
    { id: 'q012', text: 'J’aime découvrir des univers, des styles ou des concepts que je ne connais pas encore.' },

    { id: 'q013', text: 'Je m’organise généralement pour terminer ce que j’ai commencé.' },
    { id: 'q014', text: 'Il m’arrive souvent de remettre au lendemain ce que je pourrais faire aujourd’hui.' },
    { id: 'q015', text: 'J’aime savoir clairement ce que je dois faire et dans quel ordre.' },
    { id: 'q016', text: 'Je laisse facilement des tâches importantes inachevées.' },
    { id: 'q017', text: 'Je fais attention aux détails lorsqu’un résultat compte pour moi.' },
    { id: 'q018', text: 'Je préfère improviser plutôt que préparer mes actions à l’avance.' },
    { id: 'q019', text: 'Je peux rester concentré sur un objectif pendant longtemps.' },
    { id: 'q020', text: 'Je perds facilement le fil lorsque quelque chose demande de la régularité.' },
    { id: 'q021', text: 'Je respecte généralement les engagements que je prends.' },
    { id: 'q024', text: 'Lorsque je me fixe un objectif, je cherche sérieusement à l’atteindre.' },

    { id: 'q025', text: 'Je me sens facilement stimulé par la présence d’autres personnes.' },
    { id: 'q026', text: 'Après beaucoup d’interactions sociales, j’ai souvent besoin de retrouver le calme.' },
    { id: 'q027', text: 'Je prends volontiers la parole dans un groupe.' },
    { id: 'q028', text: 'Je préfère souvent rester en retrait lorsque plusieurs personnes sont présentes.' },
    { id: 'q029', text: 'J’aime les environnements vivants et animés.' },
    { id: 'q030', text: 'Je suis généralement réservé avec les personnes que je connais peu.' },
    { id: 'q033', text: 'Je suis à l’aise pour montrer mon enthousiasme.' },
    { id: 'q034', text: 'J’aime participer activement plutôt que simplement observer.' },
    { id: 'q035', text: 'Je cherche rarement à attirer l’attention sur moi.' },
    { id: 'q036', text: 'Je peux rapidement créer une dynamique avec d’autres personnes.' },

    { id: 'q037', text: 'J’essaie de comprendre le point de vue des autres, même lorsqu’il diffère du mien.' },
    { id: 'q038', text: 'Je peux être assez dur dans ma manière de juger les autres.' },
    { id: 'q039', text: 'Je préfère coopérer lorsque cela permet à chacun d’avancer.' },
    { id: 'q041', text: 'Je suis sensible à la manière dont mes décisions affectent les autres.' },
    { id: 'q042', text: 'Je me méfie facilement des intentions des gens.' },
    { id: 'q043', text: 'J’essaie généralement d’être patient avec les erreurs des autres.' },
    { id: 'q044', text: 'Je peux devenir très compétitif, même lorsque ce n’est pas nécessaire.' },
    { id: 'q046', text: 'Je trouve naturel d’aider quelqu’un lorsque je peux le faire.' },
    { id: 'q047', text: 'Je n’ai pas beaucoup de difficulté à dire quelque chose de blessant si je le pense nécessaire.' },
    { id: 'q048', text: 'Je tiens compte des besoins des autres dans mes décisions importantes.' },

    { id: 'q049', text: 'Je peux rester préoccupé longtemps après un événement stressant.' },
    { id: 'q050', text: 'Je retrouve généralement mon calme rapidement après une situation difficile.' },
    { id: 'q051', text: 'Mes émotions peuvent devenir très fortes.' },
    { id: 'q052', text: 'Les imprévus me déstabilisent rarement longtemps.' },
    { id: 'q053', text: 'Je réfléchis beaucoup aux choses qui pourraient mal se passer.' },
    { id: 'q054', text: 'Même sous pression, je garde souvent une certaine stabilité émotionnelle.' },
    { id: 'q055', text: 'Une critique peut rester longtemps dans mon esprit.' },
    { id: 'q056', text: 'Je suis rarement envahi par mes inquiétudes.' },
    { id: 'q059', text: 'Je peux ressentir beaucoup de tension face à l’incertitude.' },
    { id: 'q060', text: 'Je me remets généralement assez vite des contrariétés.' },

    { id: 'q061', text: 'Lorsque quelque chose se produit soudainement, je réagis très vite.' },
    { id: 'q062', text: 'J’ai tendance à prendre du temps avant de répondre à une situation inattendue.' },
    { id: 'q063', text: 'Je préfère agir rapidement plutôt que laisser passer une occasion.' },
    { id: 'q064', text: 'Dans l’urgence, je reste souvent dans l’observation avant d’agir.' },

    { id: 'q066', text: 'J’accorde beaucoup d’importance au fait de pouvoir choisir ma propre manière d’agir.' },
    { id: 'q067', text: 'Un cadre très défini me rassure davantage qu’une grande liberté.' },
    { id: 'q068', text: 'Je supporte mal de me sentir enfermé dans une seule manière de faire.' },
    { id: 'q069', text: 'Je préfère suivre une structure claire plutôt que disposer de trop d’options.' },

    { id: 'q071', text: 'J’aime sentir que je peux avoir un impact important sur une situation.' },
    { id: 'q072', text: 'Je préfère généralement éviter les rapports de force.' },
    { id: 'q073', text: 'La possibilité de relever un défi difficile me motive.' },
    { id: 'q074', text: 'Je cherche rarement à imposer ma présence ou ma volonté.' },

    { id: 'q076', text: 'Je cherche naturellement à préserver une bonne entente autour de moi.' },
    { id: 'q077', text: 'Je préfère parfois laisser un conflit se développer plutôt que chercher à l’apaiser.' },
    { id: 'q078', text: 'Un environnement équilibré et paisible est important pour moi.' },
    { id: 'q079', text: 'Je peux accepter beaucoup de tension autour de moi sans chercher à la réduire.' },

    { id: 'q081', text: 'J’aime vivre les choses avec beaucoup d’intensité.' },
    { id: 'q082', text: 'Je préfère généralement garder un niveau d’énergie modéré et constant.' },
    { id: 'q083', text: 'Quand quelque chose me passionne, je peux m’y engager très fortement.' },
    { id: 'q084', text: 'Je recherche rarement des expériences particulièrement fortes.' },

    { id: 'q086', text: 'Je suis attiré par ce qui reste difficile à expliquer ou à comprendre complètement.' },
    { id: 'q087', text: 'Je préfère généralement ce qui est clair et immédiatement compréhensible.' },
    { id: 'q088', text: 'Les choses énigmatiques éveillent facilement ma curiosité.' },
    { id: 'q089', text: 'Je me sens peu attiré par les situations ambiguës ou mystérieuses.' },
  ],
}

const mixedOrder = [
  'q001', 'q025', 'q061', 'q037', 'q013', 'q049',
  'q066', 'q002', 'q081', 'q038', 'q026', 'q014',
  'q086', 'q050', 'q071', 'q003', 'q039', 'q027',
  'q076', 'q015', 'q062', 'q051', 'q004', 'q028',
  'q067', 'q016', 'q082', 'q052', 'q087',
  'q072', 'q005', 'q029', 'q041', 'q063', 'q017',
  'q077', 'q053', 'q068', 'q006', 'q030', 'q042',
  'q083', 'q018', 'q088', 'q073', 'q054', 'q007', 'q043', 'q064', 'q019', 'q078', 'q069',
  'q055', 'q044', 'q084', 'q020',
  'q089', 'q074', 'q056', 'q033', 'q021', 'q079', 'q010',
  'q034', 'q046', 'q011', 'q035', 'q047',
  'q059', 'q012', 'q036', 'q048', 'q024', 'q060',
]

const byId = new Map(
  questionnairePublic.questions.map((question) => [
    question.id,
    question,
  ])
)

questionnairePublic.questions =
  mixedOrder.map((id) => byId.get(id))

questionnairePublic.question_count =
  questionnairePublic.questions.length

module.exports = questionnairePublic
