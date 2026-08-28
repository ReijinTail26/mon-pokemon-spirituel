const { reserveSelection, SELECTION_KINDS } = require('./selectionHistory')

const ANIMAL_MORPHOLOGY_VARIANTS_VERSION = 'animal-morphology-variants-v1'
const VARIANTS = {
  "Dragon": [
    {
      "id": "dragon-01",
      "label": "Dragon occidental",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "fly"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres porteurs + paire d’ailes distincte",
      "silhouette": "massif, thorax puissant, cou moyen à long, grandes ailes membraneuses",
      "head": "crâne reptilien anguleux",
      "appendages": [
        "grandes ailes membraneuses"
      ],
      "tags": [
        "massive",
        "aerial",
        "armored"
      ],
      "signature_features": [
        "cornes crâniennes",
        "crête dorsale",
        "queue draconique"
      ]
    },
    {
      "id": "dragon-02",
      "label": "Wyverne",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes postérieures; membres antérieurs transformés en ailes",
      "silhouette": "silhouette aérienne en triangle, poitrine haute, ailes dominantes, queue longue",
      "head": "tête reptilienne effilée",
      "appendages": [
        "ailes servant de membres antérieurs"
      ],
      "tags": [
        "aerial",
        "gracile",
        "angular"
      ],
      "signature_features": [
        "ailes-avant puissantes",
        "queue stabilisatrice",
        "crête céphalique"
      ]
    },
    {
      "id": "dragon-03",
      "label": "Dragon chinois",
      "body_plan": "serpentine",
      "locomotion": [
        "walk",
        "climb",
        "fly",
        "hover"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre petits membres le long d’un corps serpentin",
      "silhouette": "très allongé, sinueux, horizontal ou spiralé, sans masse thoracique dominante",
      "head": "tête longue avec moustaches/barbillons",
      "appendages": [
        "barbillons sensoriels",
        "crinière dorsale souple"
      ],
      "tags": [
        "serpentine",
        "elongated",
        "ornate"
      ],
      "signature_features": [
        "barbillons faciaux",
        "crinière dorsale",
        "corps serpentiforme"
      ]
    },
    {
      "id": "dragon-04",
      "label": "Drake terrestre",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres robustes, aucune aile obligatoire",
      "silhouette": "bas, dense et puissant, proche d’un grand reptile cuirassé",
      "head": "tête large et basse",
      "appendages": [],
      "tags": [
        "massive",
        "grounded",
        "armored"
      ],
      "signature_features": [
        "plaques dorsales",
        "mâchoire puissante",
        "queue lourde"
      ]
    },
    {
      "id": "dragon-05",
      "label": "Amphiptère",
      "body_plan": "serpentine",
      "locomotion": [
        "slither",
        "fly",
        "glide"
      ],
      "limb_count": 0,
      "limb_configuration": "aucune patte; propulsion par corps et ailes",
      "silhouette": "corps serpentiforme très long avec une paire d’ailes dominante",
      "head": "petite tête effilée",
      "appendages": [
        "paire d’ailes membraneuses ou emplumées"
      ],
      "tags": [
        "serpentine",
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "ailes latérales",
        "corps ondulant",
        "queue fouet"
      ]
    },
    {
      "id": "dragon-06",
      "label": "Lindworm",
      "body_plan": "serpentine",
      "locomotion": [
        "crawl",
        "slither",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux membres antérieurs ou postérieurs seulement",
      "silhouette": "long corps reptilien, poitrine courte, locomotion basse",
      "head": "tête reptilienne compacte",
      "appendages": [],
      "tags": [
        "serpentine",
        "grounded",
        "unusual"
      ],
      "signature_features": [
        "deux membres puissants",
        "corps allongé",
        "crête courte"
      ]
    },
    {
      "id": "dragon-07",
      "label": "Serpent-dragon marin",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "slither"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre porteur; nage par ondulation",
      "silhouette": "très long, hydrodynamique, nageoires ou crêtes latérales",
      "head": "tête reptilienne hydrodynamique",
      "appendages": [
        "nageoires latérales",
        "crête caudale"
      ],
      "tags": [
        "aquatic",
        "serpentine",
        "elongated"
      ],
      "signature_features": [
        "nageoires draconiques",
        "crête dorsale",
        "queue nageuse"
      ]
    },
    {
      "id": "dragon-08",
      "label": "Dragon plume-serpent",
      "body_plan": "serpentine",
      "locomotion": [
        "slither",
        "glide",
        "fly"
      ],
      "limb_count": 0,
      "limb_configuration": "corps serpentin sans pattes obligatoires",
      "silhouette": "ruban vivant, plumes longues et silhouette céleste",
      "head": "tête serpentine ornée",
      "appendages": [
        "plumage axial",
        "ailettes emplumées"
      ],
      "tags": [
        "serpentine",
        "ornate",
        "aerial"
      ],
      "signature_features": [
        "couronne de plumes",
        "corps serpentiforme",
        "plumes caudales"
      ]
    }
  ],
  "Phénix": [
    {
      "id": "phenix-01",
      "label": "Phénix rapace",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + deux ailes",
      "silhouette": "grand rapace aux ailes larges et queue flamboyante",
      "head": "tête de rapace",
      "appendages": [
        "grandes ailes",
        "traîne caudale"
      ],
      "tags": [
        "aerial",
        "ornate"
      ],
      "signature_features": [
        "huppe flamboyante",
        "traîne de plumes",
        "ailes larges"
      ]
    },
    {
      "id": "phenix-02",
      "label": "Phénix grue",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + deux ailes",
      "silhouette": "très vertical, long cou, longues pattes, ailes élégantes",
      "head": "tête fine à long bec",
      "appendages": [
        "ailes amples"
      ],
      "tags": [
        "gracile",
        "vertical"
      ],
      "signature_features": [
        "longue huppe",
        "plumes de queue rubanées",
        "cou élancé"
      ]
    },
    {
      "id": "phenix-03",
      "label": "Phénix paon",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps compact, immense éventail caudal ornemental",
      "head": "petite tête huppée",
      "appendages": [
        "traîne ocellée",
        "ailes arrondies"
      ],
      "tags": [
        "ornate",
        "broad"
      ],
      "signature_features": [
        "traîne en éventail",
        "huppe rayonnante",
        "plumage irisé"
      ]
    },
    {
      "id": "phenix-04",
      "label": "Phénix hirondelle",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes longues",
      "silhouette": "petit corps fuselé, ailes en faucille, longue queue bifide",
      "head": "tête petite et aérodynamique",
      "appendages": [
        "ailes faucillées"
      ],
      "tags": [
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "queue bifide lumineuse",
        "ailes effilées",
        "huppe courte"
      ]
    },
    {
      "id": "phenix-05",
      "label": "Phénix céleste sans pattes",
      "body_plan": "floating",
      "locomotion": [
        "fly",
        "hover",
        "glide"
      ],
      "limb_count": 0,
      "limb_configuration": "corps avien stylisé sans pattes visibles",
      "silhouette": "silhouette de flamme-oiseau flottante, ailes et queue fusionnées au mouvement",
      "head": "tête avienne simplifiée",
      "appendages": [
        "ailes-énergie",
        "traîne lumineuse"
      ],
      "tags": [
        "aerial",
        "ethereal",
        "unusual"
      ],
      "signature_features": [
        "couronne plumeuse",
        "ailes-énergie",
        "traîne incandescente"
      ]
    }
  ],
  "Griffon": [
    {
      "id": "griffon-01",
      "label": "Griffon aigle-lion",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "fly"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres; avant aviens, arrière félins",
      "silhouette": "thorax de rapace, arrière-train de lion, ailes larges",
      "head": "tête d’aigle",
      "appendages": [
        "ailes de rapace"
      ],
      "tags": [
        "massive",
        "aerial"
      ],
      "signature_features": [
        "bec crochu",
        "ailes de rapace",
        "queue féline"
      ]
    },
    {
      "id": "griffon-02",
      "label": "Griffon faucon-guépard",
      "body_plan": "quadruped",
      "locomotion": [
        "run",
        "fly",
        "glide"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres élancés",
      "silhouette": "très aérodynamique et rapide, torse étroit",
      "head": "tête de faucon",
      "appendages": [
        "ailes pointues"
      ],
      "tags": [
        "gracile",
        "aerial",
        "fast"
      ],
      "signature_features": [
        "masque facial",
        "ailes pointues",
        "queue longue"
      ]
    },
    {
      "id": "griffon-03",
      "label": "Griffon hibou-lion",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres trapus",
      "silhouette": "rond, silencieux, épaules larges",
      "head": "tête de hibou",
      "appendages": [
        "ailes larges silencieuses"
      ],
      "tags": [
        "broad",
        "soft",
        "aerial"
      ],
      "signature_features": [
        "disque facial",
        "aigrettes",
        "ailes arrondies"
      ]
    },
    {
      "id": "griffon-04",
      "label": "Griffon vautour-lion",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "fly",
        "glide"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres longs",
      "silhouette": "haut sur pattes, cou plus long, ailes immenses",
      "head": "tête de vautour",
      "appendages": [
        "très grandes ailes"
      ],
      "tags": [
        "aerial",
        "elongated"
      ],
      "signature_features": [
        "collerette nue",
        "ailes immenses",
        "queue féline"
      ]
    },
    {
      "id": "griffon-05",
      "label": "Griffon corbeau-panthère",
      "body_plan": "quadruped",
      "locomotion": [
        "run",
        "jump",
        "fly"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres souples",
      "silhouette": "sombre, fluide, compact, ailes plus courtes",
      "head": "tête corvidée",
      "appendages": [
        "ailes noires"
      ],
      "tags": [
        "gracile",
        "dark"
      ],
      "signature_features": [
        "bec épais",
        "plumes iridescentes",
        "queue féline souple"
      ]
    }
  ],
  "Kitsune": [
    {
      "id": "kitsune-01",
      "label": "Kitsune renard roux",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "vulpin équilibré, queue(s) très ample(s)",
      "head": "museau fin, oreilles hautes",
      "appendages": [
        "queues multiples"
      ],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "oreilles vulpines",
        "queues multiples",
        "collerette souple"
      ]
    },
    {
      "id": "kitsune-02",
      "label": "Kitsune arctique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes compactes",
      "silhouette": "plus rond, fourrure dense, oreilles courtes",
      "head": "museau court",
      "appendages": [
        "queues épaisses"
      ],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "petites oreilles",
        "queues épaisses",
        "fourrure dense"
      ]
    },
    {
      "id": "kitsune-03",
      "label": "Kitsune fennec",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes très fines",
      "silhouette": "petit corps, très grandes oreilles, queue légère",
      "head": "tête fine à oreilles géantes",
      "appendages": [
        "queues fines"
      ],
      "tags": [
        "gracile",
        "expressive"
      ],
      "signature_features": [
        "oreilles immenses",
        "museau étroit",
        "queues souples"
      ]
    },
    {
      "id": "kitsune-04",
      "label": "Kitsune spectral élancé",
      "body_plan": "quadruped",
      "locomotion": [
        "run",
        "jump",
        "hover"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres très longs",
      "silhouette": "corps presque calligraphique, queues en rubans",
      "head": "tête triangulaire très stylisée",
      "appendages": [
        "queues-rubans"
      ],
      "tags": [
        "elongated",
        "ethereal"
      ],
      "signature_features": [
        "queues rubanées",
        "oreilles longues",
        "ligne dorsale souple"
      ]
    },
    {
      "id": "kitsune-05",
      "label": "Kitsune gardien de temple",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres robustes",
      "silhouette": "poitrine haute, posture statuaire, queues disposées en éventail",
      "head": "tête vulpine plus large",
      "appendages": [
        "queues en éventail"
      ],
      "tags": [
        "broad",
        "ornate"
      ],
      "signature_features": [
        "collerette sculpturale",
        "queues en éventail",
        "oreilles dressées"
      ]
    }
  ],
  "Licorne": [
    {
      "id": "licorne-01",
      "label": "Licorne équine",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres équins",
      "silhouette": "cheval élancé, long cou arqué",
      "head": "tête équine",
      "appendages": [
        "crinière longue"
      ],
      "tags": [
        "gracile"
      ],
      "signature_features": [
        "corne frontale",
        "crinière longue",
        "encolure arquée"
      ]
    },
    {
      "id": "licorne-02",
      "label": "Licorne cervidé",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes très fines",
      "silhouette": "plus légère, hautes pattes, petite tête",
      "head": "tête de cervidé",
      "appendages": [
        "petite crinière"
      ],
      "tags": [
        "gracile",
        "vertical"
      ],
      "signature_features": [
        "corne unique ramifiée",
        "oreilles de cerf",
        "pattes élancées"
      ]
    },
    {
      "id": "licorne-03",
      "label": "Licorne caprine",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres de montagne",
      "silhouette": "compacte, poitrine robuste, membres sûrs",
      "head": "tête caprine",
      "appendages": [
        "barbiche ou collerette"
      ],
      "tags": [
        "compact",
        "grounded"
      ],
      "signature_features": [
        "corne spiralée",
        "barbiche",
        "sabots fendus"
      ]
    },
    {
      "id": "licorne-04",
      "label": "Qilin / kirin",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "glide"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres graciles",
      "silhouette": "corps de cervidé-dragon, cou haut, lignes sinueuses",
      "head": "tête cervidé-draconique",
      "appendages": [
        "crinière dorsale"
      ],
      "tags": [
        "ornate",
        "elongated"
      ],
      "signature_features": [
        "corne frontale",
        "crinière ondulante",
        "écailles partielles"
      ]
    },
    {
      "id": "licorne-05",
      "label": "Licorne zébrée",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres équins",
      "silhouette": "corps nerveux, motifs rayés structurants",
      "head": "tête équine étroite",
      "appendages": [
        "crinière dressée"
      ],
      "tags": [
        "graphic",
        "gracile"
      ],
      "signature_features": [
        "corne frontale",
        "crinière dressée",
        "rayures fortes"
      ]
    }
  ],
  "Basilic": [
    {
      "id": "basilic-01",
      "label": "Basilic serpent couronné",
      "body_plan": "serpentine",
      "locomotion": [
        "slither",
        "climb"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "long serpent à crête-couronne",
      "head": "tête serpentine",
      "appendages": [
        "crête-couronne"
      ],
      "tags": [
        "serpentine",
        "elongated"
      ],
      "signature_features": [
        "crête-couronne",
        "plaques ventrales",
        "regard dominant"
      ]
    },
    {
      "id": "basilic-02",
      "label": "Basilic lézard",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres reptiliens",
      "silhouette": "lézard élancé avec crête haute",
      "head": "tête de lézard",
      "appendages": [
        "crête dorsale"
      ],
      "tags": [
        "gracile",
        "reptilian"
      ],
      "signature_features": [
        "crête haute",
        "queue longue",
        "écailles ventrales"
      ]
    },
    {
      "id": "basilic-03",
      "label": "Basilic cockatrice",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps avien-reptilien, cou haut",
      "head": "tête de coq reptilienne",
      "appendages": [
        "ailes membraneuses ou plumeuses"
      ],
      "tags": [
        "avian",
        "ornate"
      ],
      "signature_features": [
        "crête de coq",
        "bec crochu",
        "queue serpentine"
      ]
    },
    {
      "id": "basilic-04",
      "label": "Basilic cornu désertique",
      "body_plan": "serpentine",
      "locomotion": [
        "slither"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "serpent court et épais, tête triangulaire",
      "head": "tête large à cornes",
      "appendages": [
        "petites cornes supraoculaires"
      ],
      "tags": [
        "compact",
        "grounded"
      ],
      "signature_features": [
        "cornes supraoculaires",
        "écailles carénées",
        "corps trapu"
      ]
    },
    {
      "id": "basilic-05",
      "label": "Basilic aquatique",
      "body_plan": "amphibious",
      "locomotion": [
        "swim",
        "crawl"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre petits membres palmés",
      "silhouette": "corps allongé, queue haute en nageoire",
      "head": "tête reptilienne hydrodynamique",
      "appendages": [
        "crête-nageoire"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "crête-nageoire",
        "queue comprimée",
        "pattes palmées"
      ]
    }
  ],
  "Sphinx": [
    {
      "id": "sphinx-01",
      "label": "Sphinx égyptien classique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres félins",
      "silhouette": "lion couché ou debout, tête humanoïde majestueuse",
      "head": "visage humanoïde",
      "appendages": [
        "coiffe-crinière"
      ],
      "tags": [
        "massive",
        "ornate"
      ],
      "signature_features": [
        "visage énigmatique",
        "poitrail monumental",
        "coiffe-crinière"
      ]
    },
    {
      "id": "sphinx-02",
      "label": "Sphinx grec ailé",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "fly"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres félins + ailes",
      "silhouette": "félin élancé avec ailes hautes",
      "head": "visage humanoïde",
      "appendages": [
        "grandes ailes"
      ],
      "tags": [
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "ailes emplumées",
        "visage énigmatique",
        "queue féline"
      ]
    },
    {
      "id": "sphinx-03",
      "label": "Criosphinx",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres félins",
      "silhouette": "lion massif à tête de bélier",
      "head": "tête de bélier",
      "appendages": [
        "cornes en spirale"
      ],
      "tags": [
        "massive",
        "ornate"
      ],
      "signature_features": [
        "cornes spiralées",
        "poitrail massif",
        "crinière courte"
      ]
    },
    {
      "id": "sphinx-04",
      "label": "Hiéracosphinx",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "glide"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres félins",
      "silhouette": "félin compact, tête de faucon",
      "head": "tête de faucon",
      "appendages": [
        "petites ailes optionnelles"
      ],
      "tags": [
        "aerial",
        "angular"
      ],
      "signature_features": [
        "bec de rapace",
        "collerette",
        "épaules félines"
      ]
    },
    {
      "id": "sphinx-05",
      "label": "Sphinx chacal",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres fins",
      "silhouette": "corps félin allongé, tête canine haute",
      "head": "tête de chacal",
      "appendages": [
        "coiffe longue"
      ],
      "tags": [
        "elongated",
        "mystic"
      ],
      "signature_features": [
        "oreilles hautes",
        "museau long",
        "coiffe cérémonielle"
      ]
    }
  ],
  "Kraken": [
    {
      "id": "kraken-01",
      "label": "Kraken pieuvre géante",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "crawl"
      ],
      "limb_count": 8,
      "limb_configuration": "huit bras",
      "silhouette": "manteau rond, bras rayonnants",
      "head": "tête/manteau de pieuvre",
      "appendages": [
        "huit tentacules"
      ],
      "tags": [
        "aquatic",
        "radial"
      ],
      "signature_features": [
        "couronne de tentacules",
        "ventouses",
        "manteau central"
      ]
    },
    {
      "id": "kraken-02",
      "label": "Kraken calmar",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 10,
      "limb_configuration": "huit bras + deux tentacules longs",
      "silhouette": "fusiforme, très dynamique",
      "head": "manteau allongé",
      "appendages": [
        "nageoires latérales",
        "deux tentacules chasseurs"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "tentacules chasseurs",
        "manteau fuselé",
        "nageoires latérales"
      ]
    },
    {
      "id": "kraken-03",
      "label": "Kraken seiche",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 10,
      "limb_configuration": "bras courts + tentacules",
      "silhouette": "large et aplati, nageoire ondulante tout autour",
      "head": "manteau large",
      "appendages": [
        "nageoire périphérique"
      ],
      "tags": [
        "aquatic",
        "broad"
      ],
      "signature_features": [
        "nageoire ondulante",
        "pupilles particulières",
        "bras courts"
      ]
    },
    {
      "id": "kraken-04",
      "label": "Kraken nautile",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "tentacules nombreux non locomoteurs",
      "silhouette": "coquille spiralée dominante",
      "head": "tête céphalopode",
      "appendages": [
        "coquille spiralée",
        "couronne de tentacules"
      ],
      "tags": [
        "aquatic",
        "armored"
      ],
      "signature_features": [
        "coquille spiralée",
        "tentacules fins",
        "capuchon céphalique"
      ]
    },
    {
      "id": "kraken-05",
      "label": "Kraken abyssal",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 8,
      "limb_configuration": "huit appendices variables",
      "silhouette": "silhouette sombre, membrane entre les bras, bioluminescence",
      "head": "tête compacte",
      "appendages": [
        "membrane interbrachiale"
      ],
      "tags": [
        "aquatic",
        "ethereal",
        "unusual"
      ],
      "signature_features": [
        "photophores",
        "membrane tentaculaire",
        "bras filiformes"
      ]
    }
  ],
  "Minotaure": [
    {
      "id": "minotaure-01",
      "label": "Minotaure taureau",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes humanoïdes + deux bras",
      "silhouette": "très massif, épaules larges",
      "head": "tête de taureau",
      "appendages": [
        "cornes latérales"
      ],
      "tags": [
        "massive",
        "vertical"
      ],
      "signature_features": [
        "cornes jumelles",
        "museau bovin",
        "épaules massives"
      ]
    },
    {
      "id": "minotaure-02",
      "label": "Minotaure aurochs",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 2,
      "limb_configuration": "corps humanoïde puissant",
      "silhouette": "haut, poitrine profonde, longues cornes",
      "head": "tête d’aurochs",
      "appendages": [
        "très longues cornes"
      ],
      "tags": [
        "massive",
        "elongated"
      ],
      "signature_features": [
        "cornes étendues",
        "museau long",
        "garrot haut"
      ]
    },
    {
      "id": "minotaure-03",
      "label": "Minotaure bison",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 2,
      "limb_configuration": "corps humanoïde trapu",
      "silhouette": "bossu, très large, avant du corps surdéveloppé",
      "head": "tête de bison",
      "appendages": [
        "bosse scapulaire"
      ],
      "tags": [
        "massive",
        "broad"
      ],
      "signature_features": [
        "bosse d’épaules",
        "cornes courtes",
        "barbe épaisse"
      ]
    },
    {
      "id": "minotaure-04",
      "label": "Minotaure yak",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "corps humanoïde large",
      "silhouette": "fourrure très longue, cornes évasées",
      "head": "tête de yak",
      "appendages": [
        "long pelage"
      ],
      "tags": [
        "massive",
        "soft"
      ],
      "signature_features": [
        "cornes évasées",
        "frange longue",
        "pelage dense"
      ]
    },
    {
      "id": "minotaure-05",
      "label": "Minotaure buffle",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 2,
      "limb_configuration": "corps humanoïde compact",
      "silhouette": "bas, dense, cornes très larges",
      "head": "tête de buffle",
      "appendages": [
        "cornes en casque"
      ],
      "tags": [
        "broad",
        "grounded"
      ],
      "signature_features": [
        "cornes massives",
        "front large",
        "cou court"
      ]
    }
  ],
  "Cerbère": [
    {
      "id": "cerbere-01",
      "label": "Cerbère molosse",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes robustes",
      "silhouette": "trapu, poitrine énorme, trois cous courts",
      "head": "trois têtes de molosse",
      "appendages": [],
      "tags": [
        "massive",
        "broad"
      ],
      "signature_features": [
        "trois têtes",
        "triple cou",
        "mâchoires massives"
      ]
    },
    {
      "id": "cerbere-02",
      "label": "Cerbère lévrier",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes très longues",
      "silhouette": "très élancé, trois cous fins",
      "head": "trois têtes canines fines",
      "appendages": [],
      "tags": [
        "gracile",
        "fast"
      ],
      "signature_features": [
        "trois têtes",
        "longues pattes",
        "queues fines"
      ]
    },
    {
      "id": "cerbere-03",
      "label": "Cerbère loup",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "silhouette lupine équilibrée, triple encolure",
      "head": "trois têtes de loup",
      "appendages": [],
      "tags": [
        "balanced",
        "wild"
      ],
      "signature_features": [
        "trois têtes",
        "oreilles triangulaires",
        "triple crinière"
      ]
    },
    {
      "id": "cerbere-04",
      "label": "Cerbère chacal",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "haut sur pattes, oreilles très grandes",
      "head": "trois têtes de chacal",
      "appendages": [],
      "tags": [
        "gracile",
        "vertical"
      ],
      "signature_features": [
        "trois têtes",
        "oreilles hautes",
        "museaux longs"
      ]
    },
    {
      "id": "cerbere-05",
      "label": "Cerbère hyénoïde",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes, avant plus haut",
      "silhouette": "dos incliné, cou puissant, trois têtes compactes",
      "head": "trois têtes hyénoïdes",
      "appendages": [],
      "tags": [
        "broad",
        "unusual"
      ],
      "signature_features": [
        "trois têtes",
        "garrot haut",
        "crinière dorsale"
      ]
    }
  ],
  "Fourmi": [
    {
      "id": "fourmi-01",
      "label": "Fourmi charpentière",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "insecte élancé, abdomen ovale",
      "head": "tête large à mandibules",
      "appendages": [
        "antennes coudées"
      ],
      "tags": [
        "balanced"
      ],
      "signature_features": [
        "mandibules",
        "antennes coudées",
        "gastre segmenté"
      ]
    },
    {
      "id": "fourmi-02",
      "label": "Fourmi coupe-feuille",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "taille fine, longues pattes, tête très large",
      "head": "tête massive",
      "appendages": [
        "antennes coudées"
      ],
      "tags": [
        "gracile"
      ],
      "signature_features": [
        "mandibules larges",
        "taille étranglée",
        "pattes longues"
      ]
    },
    {
      "id": "fourmi-03",
      "label": "Fourmi soldat",
      "body_plan": "insectoid",
      "locomotion": [
        "walk"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes robustes",
      "silhouette": "tête surdimensionnée, thorax compact",
      "head": "tête cuirassée",
      "appendages": [
        "antennes épaisses"
      ],
      "tags": [
        "massive",
        "armored"
      ],
      "signature_features": [
        "tête massive",
        "mandibules géantes",
        "gastre court"
      ]
    },
    {
      "id": "fourmi-04",
      "label": "Fourmi tisserande",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six longues pattes",
      "silhouette": "fine et haute, abdomen relevé",
      "head": "tête triangulaire",
      "appendages": [
        "antennes longues"
      ],
      "tags": [
        "gracile",
        "vertical"
      ],
      "signature_features": [
        "pattes longues",
        "mandibules fines",
        "gastre relevé"
      ]
    },
    {
      "id": "fourmi-05",
      "label": "Fourmi légionnaire",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps bas, mandibules en faucille",
      "head": "tête allongée",
      "appendages": [
        "antennes courtes"
      ],
      "tags": [
        "fast",
        "angular"
      ],
      "signature_features": [
        "mandibules faucilles",
        "thorax puissant",
        "abdomen fuselé"
      ]
    }
  ],
  "Abeille": [
    {
      "id": "abeille-01",
      "label": "Abeille domestique",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "thorax velu, abdomen rayé",
      "head": "tête ronde",
      "appendages": [
        "deux paires d’ailes"
      ],
      "tags": [
        "soft",
        "aerial"
      ],
      "signature_features": [
        "bandes abdominales",
        "ailes nervurées",
        "aiguillon"
      ]
    },
    {
      "id": "abeille-02",
      "label": "Bourdon",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "très rond et velu",
      "head": "tête compacte",
      "appendages": [
        "ailes courtes"
      ],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "fourrure dense",
        "abdomen rond",
        "ailes courtes"
      ]
    },
    {
      "id": "abeille-03",
      "label": "Abeille charpentière",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "grosse, abdomen lisse et sombre",
      "head": "tête large",
      "appendages": [
        "ailes sombres"
      ],
      "tags": [
        "massive",
        "aerial"
      ],
      "signature_features": [
        "thorax velu",
        "abdomen brillant",
        "mandibules fortes"
      ]
    },
    {
      "id": "abeille-04",
      "label": "Abeille orchidée",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "fine, métallique, pattes arrière spécialisées",
      "head": "tête fine",
      "appendages": [
        "ailes transparentes"
      ],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "reflets métalliques",
        "pattes arrière larges",
        "ailes claires"
      ]
    },
    {
      "id": "abeille-05",
      "label": "Abeille longue-corne",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps mince, antennes extrêmement longues",
      "head": "tête petite",
      "appendages": [
        "ailes fines"
      ],
      "tags": [
        "elongated",
        "expressive"
      ],
      "signature_features": [
        "antennes très longues",
        "abdomen fin",
        "ailes étroites"
      ]
    }
  ],
  "Papillon": [
    {
      "id": "papillon-01",
      "label": "Papillon monarque",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes fines",
      "silhouette": "ailes larges triangulaires",
      "head": "tête petite",
      "appendages": [
        "grandes ailes"
      ],
      "tags": [
        "ornate",
        "aerial"
      ],
      "signature_features": [
        "ailes nervurées",
        "motifs contrastés",
        "antennes délicates"
      ]
    },
    {
      "id": "papillon-02",
      "label": "Machaon",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "ailes postérieures prolongées en queues",
      "head": "tête petite",
      "appendages": [
        "ailes à queues"
      ],
      "tags": [
        "ornate",
        "gracile"
      ],
      "signature_features": [
        "queues alaires",
        "ocelles",
        "ailes larges"
      ]
    },
    {
      "id": "papillon-03",
      "label": "Morpho",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "ailes très larges et arrondies",
      "head": "tête petite",
      "appendages": [
        "ailes irisées"
      ],
      "tags": [
        "broad",
        "ornate"
      ],
      "signature_features": [
        "grandes ailes irisées",
        "bords sombres",
        "antennes fines"
      ]
    },
    {
      "id": "papillon-04",
      "label": "Papillon de nuit atlas",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "énorme envergure, ailes anguleuses",
      "head": "tête velue",
      "appendages": [
        "ailes massives"
      ],
      "tags": [
        "massive",
        "ornate"
      ],
      "signature_features": [
        "ailes très larges",
        "extrémités serpentines",
        "thorax velu"
      ]
    },
    {
      "id": "papillon-05",
      "label": "Sphinx colibri",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps fuselé, ailes étroites, vol stationnaire",
      "head": "tête compacte",
      "appendages": [
        "ailes rapides"
      ],
      "tags": [
        "fast",
        "aerial"
      ],
      "signature_features": [
        "trompe longue",
        "ailes étroites",
        "abdomen fuselé"
      ]
    }
  ],
  "Mante religieuse": [
    {
      "id": "mante-religieuse-01",
      "label": "Mante européenne",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "quatre pattes porteuses + deux ravisseuses",
      "silhouette": "thorax très long, posture dressée",
      "head": "tête triangulaire",
      "appendages": [
        "pattes ravisseuses"
      ],
      "tags": [
        "elongated",
        "angular"
      ],
      "signature_features": [
        "pattes ravisseuses",
        "tête triangulaire",
        "prothorax long"
      ]
    },
    {
      "id": "mante-religieuse-02",
      "label": "Mante orchidée",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes, pattes lobées",
      "silhouette": "silhouette florale, large et délicate",
      "head": "tête triangulaire",
      "appendages": [
        "lobes pétaloïdes"
      ],
      "tags": [
        "ornate",
        "gracile"
      ],
      "signature_features": [
        "lobes pétaloïdes",
        "pattes ravisseuses",
        "abdomen floral"
      ]
    },
    {
      "id": "mante-religieuse-03",
      "label": "Mante feuille morte",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "aplatie, franges irrégulières",
      "head": "tête large",
      "appendages": [
        "lobes foliacés"
      ],
      "tags": [
        "flat",
        "camouflage"
      ],
      "signature_features": [
        "lobes foliacés",
        "thorax large",
        "bords irréguliers"
      ]
    },
    {
      "id": "mante-religieuse-04",
      "label": "Mante fantôme",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "très fine, excroissances sèches",
      "head": "tête conique",
      "appendages": [
        "appendices foliacés"
      ],
      "tags": [
        "gracile",
        "unusual"
      ],
      "signature_features": [
        "tête conique",
        "lobes secs",
        "abdomen mince"
      ]
    },
    {
      "id": "mante-religieuse-05",
      "label": "Mante bouclier",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "thorax très large en forme de bouclier",
      "head": "tête petite",
      "appendages": [
        "pronotum élargi"
      ],
      "tags": [
        "broad",
        "armored"
      ],
      "signature_features": [
        "pronotum bouclier",
        "pattes ravisseuses",
        "ailes larges"
      ]
    }
  ],
  "Scarabée": [
    {
      "id": "scarabee-01",
      "label": "Scarabée rhinocéros",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes robustes",
      "silhouette": "corps lourd, élytres bombés",
      "head": "tête cornue",
      "appendages": [
        "élytres",
        "corne céphalique"
      ],
      "tags": [
        "massive",
        "armored"
      ],
      "signature_features": [
        "corne céphalique",
        "élytres bombés",
        "carapace dure"
      ]
    },
    {
      "id": "scarabee-02",
      "label": "Scarabée cerf-volant",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps allongé, énormes mandibules",
      "head": "tête large",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "elongated",
        "angular"
      ],
      "signature_features": [
        "mandibules ramifiées",
        "élytres lisses",
        "thorax large"
      ]
    },
    {
      "id": "scarabee-03",
      "label": "Scarabée Goliath",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes très robustes",
      "silhouette": "très large, thorax massif",
      "head": "tête courte",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "massive",
        "broad"
      ],
      "signature_features": [
        "thorax massif",
        "motifs contrastés",
        "pattes épaisses"
      ]
    },
    {
      "id": "scarabee-04",
      "label": "Bousier",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps très rond, pattes avant fouisseuses",
      "head": "tête compacte",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "compact",
        "grounded"
      ],
      "signature_features": [
        "pattes fouisseuses",
        "corps rond",
        "élytres striés"
      ]
    },
    {
      "id": "scarabee-05",
      "label": "Scarabée bijou",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "fusiforme, très lisse et métallique",
      "head": "tête petite",
      "appendages": [
        "élytres métalliques"
      ],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "reflets métalliques",
        "élytres fuselés",
        "antennes courtes"
      ]
    }
  ],
  "Coccinelle": [
    {
      "id": "coccinelle-01",
      "label": "Coccinelle à sept points",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "dôme rond classique",
      "head": "tête petite",
      "appendages": [
        "élytres bombés"
      ],
      "tags": [
        "compact"
      ],
      "signature_features": [
        "élytres à points",
        "forme en dôme",
        "ligne médiane"
      ]
    },
    {
      "id": "coccinelle-02",
      "label": "Coccinelle asiatique",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "dôme plus large, motifs variables",
      "head": "tête claire",
      "appendages": [
        "élytres larges"
      ],
      "tags": [
        "compact",
        "variable"
      ],
      "signature_features": [
        "motifs variables",
        "pronotum clair",
        "dôme large"
      ]
    },
    {
      "id": "coccinelle-03",
      "label": "Coccinelle jaune",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "petite et ronde",
      "head": "tête petite",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "compact",
        "bright"
      ],
      "signature_features": [
        "élytres jaunes",
        "petits points",
        "forme ronde"
      ]
    },
    {
      "id": "coccinelle-04",
      "label": "Coccinelle noire",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "dôme sombre très lisse",
      "head": "tête discrète",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "compact",
        "graphic"
      ],
      "signature_features": [
        "élytres sombres",
        "points rouges",
        "surface brillante"
      ]
    },
    {
      "id": "coccinelle-05",
      "label": "Coccinelle allongée",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "ovale plus long et moins bombé",
      "head": "tête petite",
      "appendages": [
        "élytres"
      ],
      "tags": [
        "elongated"
      ],
      "signature_features": [
        "corps ovale",
        "élytres fins",
        "motifs ponctués"
      ]
    }
  ],
  "Criquet": [
    {
      "id": "criquet-01",
      "label": "Criquet migrateur",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "jump",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "quatre pattes marcheuses + deux sauteuses",
      "silhouette": "corps fuselé, grands fémurs",
      "head": "tête anguleuse",
      "appendages": [
        "ailes repliées"
      ],
      "tags": [
        "fast",
        "elongated"
      ],
      "signature_features": [
        "fémurs postérieurs massifs",
        "ailes repliées",
        "antennes droites"
      ]
    },
    {
      "id": "criquet-02",
      "label": "Criquet pèlerin",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "jump",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "plus robuste, thorax haut",
      "head": "tête large",
      "appendages": [
        "longues ailes"
      ],
      "tags": [
        "massive",
        "fast"
      ],
      "signature_features": [
        "pattes sauteuses",
        "ailes longues",
        "thorax puissant"
      ]
    },
    {
      "id": "criquet-03",
      "label": "Sauterelle feuille",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "jump",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "ailes imitant une feuille, corps fin",
      "head": "tête pointue",
      "appendages": [
        "ailes foliacées"
      ],
      "tags": [
        "gracile",
        "camouflage"
      ],
      "signature_features": [
        "ailes-feuilles",
        "longues antennes",
        "pattes fines"
      ]
    },
    {
      "id": "criquet-04",
      "label": "Criquet épineux",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "jump"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps compact, pronotum épineux",
      "head": "tête courte",
      "appendages": [
        "épines dorsales"
      ],
      "tags": [
        "compact",
        "armored"
      ],
      "signature_features": [
        "pronotum épineux",
        "fémurs larges",
        "corps court"
      ]
    },
    {
      "id": "criquet-05",
      "label": "Criquet à tête conique",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "jump",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "très long et fin",
      "head": "tête conique",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "elongated",
        "angular"
      ],
      "signature_features": [
        "tête conique",
        "ailes étroites",
        "pattes longues"
      ]
    }
  ],
  "Libellule": [
    {
      "id": "libellule-01",
      "label": "Anax impérial",
      "body_plan": "insectoid",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes non porteuses en vol",
      "silhouette": "grand corps horizontal, quatre ailes longues",
      "head": "tête large à yeux énormes",
      "appendages": [
        "quatre ailes indépendantes"
      ],
      "tags": [
        "aerial",
        "fast"
      ],
      "signature_features": [
        "quatre ailes",
        "yeux composés",
        "abdomen segmenté"
      ]
    },
    {
      "id": "libellule-02",
      "label": "Demoiselle",
      "body_plan": "insectoid",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes fines",
      "silhouette": "très mince, ailes étroites repliables",
      "head": "tête petite",
      "appendages": [
        "quatre ailes fines"
      ],
      "tags": [
        "gracile",
        "elongated"
      ],
      "signature_features": [
        "abdomen filiforme",
        "ailes étroites",
        "yeux latéraux"
      ]
    },
    {
      "id": "libellule-03",
      "label": "Libellule écarlate",
      "body_plan": "insectoid",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps court, abdomen large",
      "head": "tête large",
      "appendages": [
        "ailes transparentes"
      ],
      "tags": [
        "compact",
        "aerial"
      ],
      "signature_features": [
        "abdomen épais",
        "ailes claires",
        "yeux massifs"
      ]
    },
    {
      "id": "libellule-04",
      "label": "Cordulégastre",
      "body_plan": "insectoid",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "très grand, abdomen long et annelé",
      "head": "tête large",
      "appendages": [
        "quatre longues ailes"
      ],
      "tags": [
        "elongated",
        "fast"
      ],
      "signature_features": [
        "anneaux abdominaux",
        "ailes longues",
        "thorax puissant"
      ]
    },
    {
      "id": "libellule-05",
      "label": "Libellule pennée",
      "body_plan": "insectoid",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "ailes postérieures plus larges, silhouette ornementale",
      "head": "tête large",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "ornate",
        "aerial"
      ],
      "signature_features": [
        "ailes marquées",
        "abdomen fin",
        "yeux composés"
      ]
    }
  ],
  "Phasme": [
    {
      "id": "phasme-01",
      "label": "Phasme bâton",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes filiformes",
      "silhouette": "extrêmement long et fin",
      "head": "tête minuscule",
      "appendages": [
        "antennes fines"
      ],
      "tags": [
        "elongated",
        "gracile"
      ],
      "signature_features": [
        "forme de brindille",
        "pattes filiformes",
        "antennes longues"
      ]
    },
    {
      "id": "phasme-02",
      "label": "Phasme feuille",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes lobées",
      "silhouette": "large et plat, comme une feuille",
      "head": "tête courte",
      "appendages": [
        "lobes foliacés"
      ],
      "tags": [
        "flat",
        "broad"
      ],
      "signature_features": [
        "abdomen-feuille",
        "pattes foliacées",
        "bords nervurés"
      ]
    },
    {
      "id": "phasme-03",
      "label": "Phasme épineux",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps lourd hérissé de pointes",
      "head": "tête rugueuse",
      "appendages": [
        "épines corporelles"
      ],
      "tags": [
        "armored",
        "massive"
      ],
      "signature_features": [
        "épines dorsales",
        "pattes épaisses",
        "abdomen robuste"
      ]
    },
    {
      "id": "phasme-04",
      "label": "Phasme ailé",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb",
        "glide",
        "fly"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes",
      "silhouette": "corps fin avec grandes ailes cachées",
      "head": "tête petite",
      "appendages": [
        "ailes déployables"
      ],
      "tags": [
        "gracile",
        "aerial"
      ],
      "signature_features": [
        "ailes colorées",
        "corps brindille",
        "pattes fines"
      ]
    },
    {
      "id": "phasme-05",
      "label": "Phasme géant",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 6,
      "limb_configuration": "six pattes longues",
      "silhouette": "très grand, segments épais",
      "head": "tête petite",
      "appendages": [
        "antennes longues"
      ],
      "tags": [
        "elongated",
        "massive"
      ],
      "signature_features": [
        "segments longs",
        "pattes robustes",
        "corps de branche"
      ]
    }
  ],
  "Yéti": [
    {
      "id": "yeti-01",
      "label": "Yéti grand singe",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + deux bras",
      "silhouette": "haut, épaules larges, bras longs",
      "head": "visage de grand primate",
      "appendages": [],
      "tags": [
        "massive",
        "vertical"
      ],
      "signature_features": [
        "fourrure épaisse",
        "bras longs",
        "larges pieds"
      ]
    },
    {
      "id": "yeti-02",
      "label": "Yéti gorille",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "locomotion bipède ou sur phalanges",
      "silhouette": "très massif, torse énorme, cou court",
      "head": "tête de gorille",
      "appendages": [],
      "tags": [
        "massive",
        "broad"
      ],
      "signature_features": [
        "épaules énormes",
        "mains larges",
        "fourrure dense"
      ]
    },
    {
      "id": "yeti-03",
      "label": "Yéti langur",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "jump",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + bras très longs",
      "silhouette": "plus fin, très long pelage et queue possible",
      "head": "visage de singe montagnard",
      "appendages": [],
      "tags": [
        "gracile",
        "elongated"
      ],
      "signature_features": [
        "long pelage",
        "membres fins",
        "visage sombre"
      ]
    },
    {
      "id": "yeti-04",
      "label": "Yéti ursidé",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes portantes + bras puissants",
      "silhouette": "massif, dos arrondi, museau plus animal",
      "head": "tête ursine",
      "appendages": [],
      "tags": [
        "massive",
        "grounded"
      ],
      "signature_features": [
        "fourrure épaisse",
        "museau large",
        "pattes puissantes"
      ]
    },
    {
      "id": "yeti-05",
      "label": "Yéti esprit des neiges",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "jump",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + bras",
      "silhouette": "silhouette haute, fourrure en mèches et extrémités exagérées",
      "head": "visage stylisé",
      "appendages": [],
      "tags": [
        "vertical",
        "ethereal"
      ],
      "signature_features": [
        "mèches de fourrure",
        "larges pieds",
        "longs avant-bras"
      ]
    }
  ],
  "Lion": [
    {
      "id": "lion-01",
      "label": "Lion africain",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes puissantes",
      "silhouette": "poitrine haute, crinière volumineuse",
      "head": "tête féline large",
      "appendages": [],
      "tags": [
        "massive"
      ],
      "signature_features": [
        "crinière",
        "touffe caudale",
        "poitrail puissant"
      ]
    },
    {
      "id": "lion-02",
      "label": "Lion de l’Atlas",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "plus massif, crinière très longue et sombre",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "massive",
        "ornate"
      ],
      "signature_features": [
        "crinière très longue",
        "épaules puissantes",
        "queue touffue"
      ]
    },
    {
      "id": "lion-03",
      "label": "Lion blanc",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "silhouette classique, lignes très claires",
      "head": "tête féline",
      "appendages": [],
      "tags": [
        "balanced",
        "bright"
      ],
      "signature_features": [
        "crinière claire",
        "poitrail puissant",
        "queue à touffe"
      ]
    },
    {
      "id": "lion-04",
      "label": "Lion des cavernes",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "très grand, membres longs, crinière réduite",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "massive",
        "elongated"
      ],
      "signature_features": [
        "corps géant",
        "membres longs",
        "crinière courte"
      ]
    },
    {
      "id": "lion-05",
      "label": "Lion stylisé sans crinière",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes élancées",
      "silhouette": "félin athlétique, nuque lisse, silhouette plus proche d’une lionne",
      "head": "tête fine",
      "appendages": [],
      "tags": [
        "gracile",
        "fast"
      ],
      "signature_features": [
        "poitrail félin",
        "queue à touffe",
        "museau puissant"
      ]
    }
  ],
  "Loup": [
    {
      "id": "loup-01",
      "label": "Loup gris",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "équilibré, poitrine profonde, queue touffue",
      "head": "museau allongé",
      "appendages": [],
      "tags": [
        "balanced"
      ],
      "signature_features": [
        "oreilles triangulaires",
        "queue touffue",
        "museau allongé"
      ]
    },
    {
      "id": "loup-02",
      "label": "Loup arctique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes compactes",
      "silhouette": "plus trapu, fourrure dense, petites oreilles",
      "head": "museau court",
      "appendages": [],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "fourrure dense",
        "petites oreilles",
        "larges pattes"
      ]
    },
    {
      "id": "loup-03",
      "label": "Loup à crinière",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre très longues pattes",
      "silhouette": "très haut et fin, crinière dorsale sombre",
      "head": "museau très long",
      "appendages": [],
      "tags": [
        "vertical",
        "gracile"
      ],
      "signature_features": [
        "longues pattes",
        "crinière dorsale",
        "grandes oreilles"
      ]
    },
    {
      "id": "loup-04",
      "label": "Loup d’Éthiopie",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "léger, long museau, oreilles hautes",
      "head": "tête fine",
      "appendages": [],
      "tags": [
        "gracile",
        "fast"
      ],
      "signature_features": [
        "museau fin",
        "oreilles hautes",
        "queue sombre"
      ]
    },
    {
      "id": "loup-05",
      "label": "Loup noir massif",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres robustes",
      "silhouette": "large, épaules hautes, fourrure abondante",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "massive",
        "dark"
      ],
      "signature_features": [
        "fourrure sombre",
        "épaules hautes",
        "queue épaisse"
      ]
    }
  ],
  "Renard": [
    {
      "id": "renard-01",
      "label": "Renard roux",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "vulpin équilibré, queue très ample",
      "head": "museau fin",
      "appendages": [],
      "tags": [
        "balanced"
      ],
      "signature_features": [
        "queue touffue",
        "oreilles hautes",
        "museau étroit"
      ]
    },
    {
      "id": "renard-02",
      "label": "Fennec",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "petit corps et oreilles disproportionnées",
      "head": "tête très fine",
      "appendages": [],
      "tags": [
        "gracile",
        "expressive"
      ],
      "signature_features": [
        "oreilles immenses",
        "petit corps",
        "queue souple"
      ]
    },
    {
      "id": "renard-03",
      "label": "Renard arctique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes compactes",
      "silhouette": "rond, très dense, oreilles courtes",
      "head": "museau court",
      "appendages": [],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "fourrure dense",
        "petites oreilles",
        "queue épaisse"
      ]
    },
    {
      "id": "renard-04",
      "label": "Renard gris",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "corps plus long, queue moins volumineuse",
      "head": "museau fin",
      "appendages": [],
      "tags": [
        "elongated",
        "climber"
      ],
      "signature_features": [
        "queue longue",
        "dos sombre",
        "griffes adaptées"
      ]
    },
    {
      "id": "renard-05",
      "label": "Renard tibétain",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "tête presque carrée, corps compact",
      "head": "museau court et large",
      "appendages": [],
      "tags": [
        "compact",
        "unusual"
      ],
      "signature_features": [
        "visage carré",
        "fourrure épaisse",
        "queue touffue"
      ]
    }
  ],
  "Éléphant": [
    {
      "id": "elephant-01",
      "label": "Éléphant de savane",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres colonnaires",
      "silhouette": "très massif, grandes oreilles",
      "head": "tête large à trompe",
      "appendages": [],
      "tags": [
        "massive",
        "broad"
      ],
      "signature_features": [
        "grandes oreilles",
        "trompe",
        "défenses"
      ]
    },
    {
      "id": "elephant-02",
      "label": "Éléphant de forêt",
      "body_plan": "quadruped",
      "locomotion": [
        "walk"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "plus compact, oreilles rondes, défenses droites",
      "head": "tête compacte",
      "appendages": [],
      "tags": [
        "compact",
        "massive"
      ],
      "signature_features": [
        "oreilles arrondies",
        "défenses fines",
        "trompe"
      ]
    },
    {
      "id": "elephant-03",
      "label": "Éléphant d’Asie",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "dos plus arqué, oreilles plus petites",
      "head": "front bombé",
      "appendages": [],
      "tags": [
        "balanced"
      ],
      "signature_features": [
        "front bombé",
        "petites oreilles",
        "trompe"
      ]
    },
    {
      "id": "elephant-04",
      "label": "Mammouth laineux",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "haut garrot, fourrure longue, défenses courbes",
      "head": "tête haute",
      "appendages": [],
      "tags": [
        "massive",
        "soft"
      ],
      "signature_features": [
        "défenses courbes",
        "fourrure longue",
        "bosse d’épaules"
      ]
    },
    {
      "id": "elephant-05",
      "label": "Mastodonte",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "corps bas et lourd, tête massive",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "massive",
        "grounded"
      ],
      "signature_features": [
        "défenses robustes",
        "corps trapu",
        "trompe"
      ]
    }
  ],
  "Ours": [
    {
      "id": "ours-01",
      "label": "Ours brun",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes massives",
      "silhouette": "large et bossu aux épaules",
      "head": "museau long",
      "appendages": [],
      "tags": [
        "massive"
      ],
      "signature_features": [
        "bosse d’épaules",
        "larges pattes",
        "museau arrondi"
      ]
    },
    {
      "id": "ours-02",
      "label": "Ours polaire",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "plus long et hydrodynamique, petit crâne",
      "head": "tête allongée",
      "appendages": [],
      "tags": [
        "elongated",
        "massive"
      ],
      "signature_features": [
        "petites oreilles",
        "long cou",
        "larges pattes"
      ]
    },
    {
      "id": "ours-03",
      "label": "Ours noir",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "plus léger, oreilles plus grandes",
      "head": "museau fin",
      "appendages": [],
      "tags": [
        "gracile",
        "climber"
      ],
      "signature_features": [
        "oreilles rondes",
        "pattes agiles",
        "museau fin"
      ]
    },
    {
      "id": "ours-04",
      "label": "Ours malais",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "petit, longues griffes, poitrine marquée",
      "head": "tête courte",
      "appendages": [],
      "tags": [
        "compact",
        "climber"
      ],
      "signature_features": [
        "longues griffes",
        "poitrail marqué",
        "petites oreilles"
      ]
    },
    {
      "id": "ours-05",
      "label": "Panda géant",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "très rond, grosse tête",
      "head": "tête ronde",
      "appendages": [],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "masque facial",
        "corps rond",
        "larges pattes"
      ]
    }
  ],
  "Cerf": [
    {
      "id": "cerf-01",
      "label": "Cerf élaphe",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes élancées",
      "silhouette": "haut, poitrine fine, grande ramure",
      "head": "tête longue",
      "appendages": [],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "grande ramure",
        "long cou",
        "pattes élancées"
      ]
    },
    {
      "id": "cerf-02",
      "label": "Renne",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes",
      "silhouette": "plus compact, ramure large et complexe",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "compact",
        "ornate"
      ],
      "signature_features": [
        "ramure complexe",
        "sabots larges",
        "cou épais"
      ]
    },
    {
      "id": "cerf-03",
      "label": "Élan",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre très longues pattes",
      "silhouette": "très haut, gros museau, ramure palmée",
      "head": "tête longue et lourde",
      "appendages": [],
      "tags": [
        "massive",
        "vertical"
      ],
      "signature_features": [
        "ramure palmée",
        "longues pattes",
        "museau massif"
      ]
    },
    {
      "id": "cerf-04",
      "label": "Chevreuil",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes fines",
      "silhouette": "petit, léger, ramure courte",
      "head": "tête fine",
      "appendages": [],
      "tags": [
        "gracile",
        "compact"
      ],
      "signature_features": [
        "petite ramure",
        "grandes oreilles",
        "corps léger"
      ]
    },
    {
      "id": "cerf-05",
      "label": "Pudu",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes courtes",
      "silhouette": "très petit et compact, petites cornes",
      "head": "tête ronde",
      "appendages": [],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "petites cornes",
        "corps trapu",
        "oreilles rondes"
      ]
    }
  ],
  "Panthère": [
    {
      "id": "panthere-01",
      "label": "Panthère noire / léopard mélanique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres souples",
      "silhouette": "félin bas, long et fluide",
      "head": "tête féline compacte",
      "appendages": [],
      "tags": [
        "gracile",
        "dark"
      ],
      "signature_features": [
        "queue longue",
        "épaules souples",
        "pelage sombre"
      ]
    },
    {
      "id": "panthere-02",
      "label": "Jaguar mélanique",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres robustes",
      "silhouette": "plus trapu, tête très large",
      "head": "tête massive",
      "appendages": [],
      "tags": [
        "massive",
        "dark"
      ],
      "signature_features": [
        "mâchoire large",
        "corps compact",
        "queue épaisse"
      ]
    },
    {
      "id": "panthere-03",
      "label": "Panthère des neiges",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "jump",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre pattes larges",
      "silhouette": "corps long, queue extrêmement longue",
      "head": "tête ronde",
      "appendages": [],
      "tags": [
        "gracile",
        "soft"
      ],
      "signature_features": [
        "queue très longue",
        "larges pattes",
        "fourrure dense"
      ]
    },
    {
      "id": "panthere-04",
      "label": "Panthère nébuleuse",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "climb",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres courts",
      "silhouette": "corps long, canines très développées",
      "head": "tête courte",
      "appendages": [],
      "tags": [
        "elongated",
        "climber"
      ],
      "signature_features": [
        "canines longues",
        "motifs nuageux",
        "queue longue"
      ]
    },
    {
      "id": "panthere-05",
      "label": "Panthère stylisée guépard",
      "body_plan": "quadruped",
      "locomotion": [
        "run",
        "jump"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre longues pattes",
      "silhouette": "très mince, poitrine profonde, taille fine",
      "head": "petite tête",
      "appendages": [],
      "tags": [
        "fast",
        "gracile"
      ],
      "signature_features": [
        "longues pattes",
        "queue stabilisatrice",
        "corps fuselé"
      ]
    }
  ],
  "Rhinocéros": [
    {
      "id": "rhinoceros-01",
      "label": "Rhinocéros blanc",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres massifs",
      "silhouette": "très long et bas, deux cornes",
      "head": "tête basse et large",
      "appendages": [],
      "tags": [
        "massive",
        "grounded"
      ],
      "signature_features": [
        "deux cornes",
        "nuque massive",
        "peau épaisse"
      ]
    },
    {
      "id": "rhinoceros-02",
      "label": "Rhinocéros noir",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "plus compact, tête relevée",
      "head": "museau préhensile",
      "appendages": [],
      "tags": [
        "massive",
        "compact"
      ],
      "signature_features": [
        "corne nasale",
        "museau pointu",
        "épaules fortes"
      ]
    },
    {
      "id": "rhinoceros-03",
      "label": "Rhinocéros indien",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "corps en plaques de peau",
      "head": "tête large",
      "appendages": [],
      "tags": [
        "armored",
        "massive"
      ],
      "signature_features": [
        "plis cuirassés",
        "corne unique",
        "épaules blindées"
      ]
    },
    {
      "id": "rhinoceros-04",
      "label": "Rhinocéros de Sumatra",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "plus petit, velu, deux petites cornes",
      "head": "tête allongée",
      "appendages": [],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "pelage clairsemé",
        "deux cornes",
        "corps compact"
      ]
    },
    {
      "id": "rhinoceros-05",
      "label": "Rhinocéros laineux",
      "body_plan": "quadruped",
      "locomotion": [
        "walk",
        "run"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "très trapu, fourrure longue, grande corne antérieure",
      "head": "tête basse",
      "appendages": [],
      "tags": [
        "massive",
        "soft"
      ],
      "signature_features": [
        "grande corne",
        "fourrure longue",
        "bosse d’épaules"
      ]
    }
  ],
  "Singe": [
    {
      "id": "singe-01",
      "label": "Macaque",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "climb",
        "jump"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + deux bras",
      "silhouette": "corps compact, membres équilibrés",
      "head": "visage de macaque",
      "appendages": [],
      "tags": [
        "balanced"
      ],
      "signature_features": [
        "mains préhensiles",
        "visage expressif",
        "queue variable"
      ]
    },
    {
      "id": "singe-02",
      "label": "Capucin",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "climb",
        "jump"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + longs bras",
      "silhouette": "petit corps, longue queue préhensile",
      "head": "tête ronde",
      "appendages": [],
      "tags": [
        "gracile",
        "climber"
      ],
      "signature_features": [
        "queue préhensile",
        "mains fines",
        "face ronde"
      ]
    },
    {
      "id": "singe-03",
      "label": "Babouin",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "run",
        "climb"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + deux bras",
      "silhouette": "torse long, museau canin, membres robustes",
      "head": "museau allongé",
      "appendages": [],
      "tags": [
        "massive",
        "grounded"
      ],
      "signature_features": [
        "museau long",
        "crocs",
        "bras puissants"
      ]
    },
    {
      "id": "singe-04",
      "label": "Tamarin",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "climb",
        "jump"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + bras",
      "silhouette": "très petit, ornements faciaux, longue queue",
      "head": "petite tête",
      "appendages": [],
      "tags": [
        "compact",
        "ornate"
      ],
      "signature_features": [
        "moustaches/tufts",
        "longue queue",
        "petites mains"
      ]
    },
    {
      "id": "singe-05",
      "label": "Gibbon",
      "body_plan": "biped",
      "locomotion": [
        "walk",
        "climb",
        "jump"
      ],
      "limb_count": 2,
      "limb_configuration": "deux jambes + bras extrêmement longs",
      "silhouette": "très vertical en suspension, bras dominants",
      "head": "petite tête",
      "appendages": [],
      "tags": [
        "elongated",
        "gracile"
      ],
      "signature_features": [
        "bras très longs",
        "mains crochues",
        "torse compact"
      ]
    }
  ],
  "Tortue": [
    {
      "id": "tortue-01",
      "label": "Tortue terrestre géante",
      "body_plan": "quadruped",
      "locomotion": [
        "walk"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres colonnaires",
      "silhouette": "très haute carapace, membres lourds",
      "head": "tête courte",
      "appendages": [],
      "tags": [
        "massive",
        "armored"
      ],
      "signature_features": [
        "carapace bombée",
        "pattes épaisses",
        "cou rétractile"
      ]
    },
    {
      "id": "tortue-02",
      "label": "Tortue boîte",
      "body_plan": "quadruped",
      "locomotion": [
        "walk"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres",
      "silhouette": "petite carapace très bombée",
      "head": "tête compacte",
      "appendages": [],
      "tags": [
        "compact",
        "armored"
      ],
      "signature_features": [
        "carapace fermante",
        "plastron",
        "cou court"
      ]
    },
    {
      "id": "tortue-03",
      "label": "Tortue luth",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre nageoires",
      "silhouette": "très grande, carapace souple en crêtes",
      "head": "tête hydrodynamique",
      "appendages": [
        "nageoires puissantes"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "carapace striée",
        "longues nageoires",
        "corps fuselé"
      ]
    },
    {
      "id": "tortue-04",
      "label": "Tortue imbriquée",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre nageoires",
      "silhouette": "carapace aplatie à écailles imbriquées",
      "head": "bec crochu",
      "appendages": [
        "nageoires"
      ],
      "tags": [
        "aquatic",
        "ornate"
      ],
      "signature_features": [
        "bec crochu",
        "écailles imbriquées",
        "nageoires"
      ]
    },
    {
      "id": "tortue-05",
      "label": "Tortue serpentine",
      "body_plan": "amphibious",
      "locomotion": [
        "walk",
        "swim"
      ],
      "limb_count": 4,
      "limb_configuration": "quatre membres robustes",
      "silhouette": "carapace basse, très longue queue, grosse tête",
      "head": "tête massive",
      "appendages": [],
      "tags": [
        "grounded",
        "unusual"
      ],
      "signature_features": [
        "queue longue",
        "mâchoire puissante",
        "carapace basse"
      ]
    }
  ],
  "Baleine": [
    {
      "id": "baleine-01",
      "label": "Baleine bleue",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales, pas de membres porteurs",
      "silhouette": "immense fuseau hydrodynamique",
      "head": "tête très large",
      "appendages": [
        "nageoires pectorales",
        "caudale horizontale"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "caudale horizontale",
        "nageoires pectorales",
        "évent dorsal"
      ]
    },
    {
      "id": "baleine-02",
      "label": "Baleine à bosse",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "très longues nageoires pectorales",
      "silhouette": "corps robuste, nageoires immenses",
      "head": "tête tuberculée",
      "appendages": [
        "très longues pectorales"
      ],
      "tags": [
        "aquatic",
        "ornate"
      ],
      "signature_features": [
        "nageoires longues",
        "tubercules céphaliques",
        "caudale large"
      ]
    },
    {
      "id": "baleine-03",
      "label": "Baleine franche",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires courtes",
      "silhouette": "très ronde, tête énorme sans dorsale",
      "head": "tête arquée",
      "appendages": [
        "nageoires courtes"
      ],
      "tags": [
        "aquatic",
        "massive",
        "broad"
      ],
      "signature_features": [
        "tête énorme",
        "callosités",
        "absence de dorsale"
      ]
    },
    {
      "id": "baleine-04",
      "label": "Rorqual commun",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales petites",
      "silhouette": "très long et fin",
      "head": "tête en V",
      "appendages": [
        "petite dorsale"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "corps fuselé",
        "tête en V",
        "dorsale reculée"
      ]
    },
    {
      "id": "baleine-05",
      "label": "Baleine boréale",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires courtes",
      "silhouette": "corps compact, tête arquée gigantesque",
      "head": "tête en arc",
      "appendages": [
        "nageoires pectorales"
      ],
      "tags": [
        "aquatic",
        "compact"
      ],
      "signature_features": [
        "mâchoire arquée",
        "corps sombre",
        "absence de dorsale"
      ]
    }
  ],
  "Dauphin": [
    {
      "id": "dauphin-01",
      "label": "Grand dauphin",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "jump"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "corps fuselé robuste",
      "head": "rostre moyen",
      "appendages": [
        "dorsale arquée"
      ],
      "tags": [
        "aquatic",
        "balanced"
      ],
      "signature_features": [
        "rostre",
        "dorsale arquée",
        "caudale horizontale"
      ]
    },
    {
      "id": "dauphin-02",
      "label": "Dauphin commun",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "jump"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "plus fin, long rostre",
      "head": "rostre long",
      "appendages": [
        "dorsale triangulaire"
      ],
      "tags": [
        "aquatic",
        "gracile"
      ],
      "signature_features": [
        "long rostre",
        "corps fuselé",
        "motifs latéraux"
      ]
    },
    {
      "id": "dauphin-03",
      "label": "Dauphin de Risso",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "tête ronde sans rostre marqué, corps cicatrisé",
      "head": "front bombé",
      "appendages": [
        "dorsale haute"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "front arrondi",
        "dorsale haute",
        "motifs cicatriciels"
      ]
    },
    {
      "id": "dauphin-04",
      "label": "Dauphin de l’Amazone",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires larges",
      "silhouette": "corps souple, long bec, petite dorsale",
      "head": "rostre très long",
      "appendages": [
        "petite crête dorsale"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "long rostre",
        "nageoires larges",
        "corps flexible"
      ]
    },
    {
      "id": "dauphin-05",
      "label": "Dauphin de Commerson",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "jump"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "petit et compact, tête courte",
      "head": "tête ronde",
      "appendages": [
        "dorsale basse"
      ],
      "tags": [
        "aquatic",
        "compact"
      ],
      "signature_features": [
        "motifs noir/blanc",
        "corps court",
        "tête arrondie"
      ]
    }
  ],
  "Orque": [
    {
      "id": "orque-01",
      "label": "Orque océanique classique",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "corps massif, dorsale haute",
      "head": "tête arrondie",
      "appendages": [
        "dorsale haute"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "dorsale haute",
        "taches blanches",
        "pectorales ovales"
      ]
    },
    {
      "id": "orque-02",
      "label": "Orque mâle adulte",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales très larges",
      "silhouette": "très massif, dorsale presque verticale",
      "head": "tête large",
      "appendages": [
        "dorsale géante"
      ],
      "tags": [
        "aquatic",
        "vertical"
      ],
      "signature_features": [
        "dorsale immense",
        "pectorales larges",
        "selle dorsale"
      ]
    },
    {
      "id": "orque-03",
      "label": "Orque femelle",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "plus fine, dorsale courbe",
      "head": "tête arrondie",
      "appendages": [
        "dorsale falciforme"
      ],
      "tags": [
        "aquatic",
        "gracile"
      ],
      "signature_features": [
        "dorsale courbée",
        "corps fin",
        "taches oculaires"
      ]
    },
    {
      "id": "orque-04",
      "label": "Orque antarctique",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "corps épais, motifs gris/blanc variables",
      "head": "tête large",
      "appendages": [
        "dorsale"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "motifs pâles",
        "dorsale haute",
        "corps trapu"
      ]
    },
    {
      "id": "orque-05",
      "label": "Orque stylisée longiligne",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "jump"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "corps très fuselé, caudale fine",
      "head": "tête étroite",
      "appendages": [
        "dorsale longue"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "corps fuselé",
        "dorsale longue",
        "caudale fine"
      ]
    }
  ],
  "Requin": [
    {
      "id": "requin-01",
      "label": "Grand requin blanc",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires uniquement",
      "silhouette": "corps torpille massif",
      "head": "museau conique",
      "appendages": [
        "dorsale triangulaire"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "dorsale triangulaire",
        "fentes branchiales",
        "mâchoire dentée"
      ]
    },
    {
      "id": "requin-02",
      "label": "Requin marteau",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires uniquement",
      "silhouette": "corps fin, tête très large latéralement",
      "head": "tête en marteau",
      "appendages": [
        "dorsale haute"
      ],
      "tags": [
        "aquatic",
        "broad"
      ],
      "signature_features": [
        "tête marteau",
        "yeux latéraux",
        "dorsale haute"
      ]
    },
    {
      "id": "requin-03",
      "label": "Requin mako",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires uniquement",
      "silhouette": "extrêmement fuselé et rapide",
      "head": "museau pointu",
      "appendages": [
        "nageoires étroites"
      ],
      "tags": [
        "aquatic",
        "fast",
        "gracile"
      ],
      "signature_features": [
        "museau pointu",
        "caudale puissante",
        "corps fuselé"
      ]
    },
    {
      "id": "requin-04",
      "label": "Requin-baleine",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires uniquement",
      "silhouette": "très massif, tête plate et large",
      "head": "gueule frontale",
      "appendages": [
        "nageoires larges"
      ],
      "tags": [
        "aquatic",
        "massive",
        "broad"
      ],
      "signature_features": [
        "motifs à points",
        "tête large",
        "corps énorme"
      ]
    },
    {
      "id": "requin-05",
      "label": "Requin-renard",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires uniquement",
      "silhouette": "corps fin, lobe supérieur de queue immense",
      "head": "tête petite",
      "appendages": [
        "caudale très longue"
      ],
      "tags": [
        "aquatic",
        "elongated",
        "unusual"
      ],
      "signature_features": [
        "queue fouet",
        "petite tête",
        "pectorales longues"
      ]
    }
  ],
  "Raie manta": [
    {
      "id": "raie-manta-01",
      "label": "Manta géante",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "glide"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales en ailes",
      "silhouette": "très large losange, lobes céphaliques",
      "head": "tête large",
      "appendages": [
        "ailes pectorales",
        "lobes céphaliques"
      ],
      "tags": [
        "aquatic",
        "broad"
      ],
      "signature_features": [
        "ailes pectorales",
        "lobes céphaliques",
        "silhouette en losange"
      ]
    },
    {
      "id": "raie-manta-02",
      "label": "Raie mobula",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "glide",
        "jump"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "plus petite et anguleuse, queue longue",
      "head": "tête compacte",
      "appendages": [
        "ailes pointues"
      ],
      "tags": [
        "aquatic",
        "gracile"
      ],
      "signature_features": [
        "ailes pointues",
        "queue fine",
        "lobes céphaliques"
      ]
    },
    {
      "id": "raie-manta-03",
      "label": "Raie aigle",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "glide"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "ailes triangulaires, museau projeté",
      "head": "tête saillante",
      "appendages": [
        "ailes triangulaires"
      ],
      "tags": [
        "aquatic",
        "angular"
      ],
      "signature_features": [
        "museau projeté",
        "ailes triangulaires",
        "queue longue"
      ]
    },
    {
      "id": "raie-manta-04",
      "label": "Raie pastenague",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "glide"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "disque rond, queue fouet",
      "head": "tête intégrée au disque",
      "appendages": [
        "disque pectoral"
      ],
      "tags": [
        "aquatic",
        "compact"
      ],
      "signature_features": [
        "disque rond",
        "queue fouet",
        "corps aplati"
      ]
    },
    {
      "id": "raie-manta-05",
      "label": "Raie guitare",
      "body_plan": "aquatic",
      "locomotion": [
        "swim"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires pectorales",
      "silhouette": "avant aplati de raie, arrière de requin",
      "head": "tête triangulaire",
      "appendages": [
        "pectorales fusionnées"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "museau triangulaire",
        "corps allongé",
        "queue de requin"
      ]
    }
  ],
  "Hippocampe": [
    {
      "id": "hippocampe-01",
      "label": "Hippocampe commun",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires petites",
      "silhouette": "vertical, queue spiralée",
      "head": "museau tubulaire",
      "appendages": [
        "dorsale vibrante"
      ],
      "tags": [
        "aquatic",
        "vertical"
      ],
      "signature_features": [
        "queue spiralée",
        "couronne osseuse",
        "museau tubulaire"
      ]
    },
    {
      "id": "hippocampe-02",
      "label": "Hippocampe pygmée",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires minuscules",
      "silhouette": "très petit et compact, excroissances nombreuses",
      "head": "museau court",
      "appendages": [
        "tubercules"
      ],
      "tags": [
        "aquatic",
        "compact",
        "ornate"
      ],
      "signature_features": [
        "tubercules",
        "couronne courte",
        "queue enroulée"
      ]
    },
    {
      "id": "hippocampe-03",
      "label": "Hippocampe feuillu",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires petites",
      "silhouette": "très allongé avec appendices foliacés",
      "head": "museau long",
      "appendages": [
        "appendices foliacés"
      ],
      "tags": [
        "aquatic",
        "ornate",
        "elongated"
      ],
      "signature_features": [
        "appendices feuille",
        "museau long",
        "queue flexible"
      ]
    },
    {
      "id": "hippocampe-04",
      "label": "Hippocampe épineux",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires petites",
      "silhouette": "corps hérissé de pointes",
      "head": "museau moyen",
      "appendages": [
        "épines corporelles"
      ],
      "tags": [
        "aquatic",
        "armored"
      ],
      "signature_features": [
        "épines",
        "couronne haute",
        "anneaux osseux"
      ]
    },
    {
      "id": "hippocampe-05",
      "label": "Hippocampe ventru",
      "body_plan": "aquatic",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "nageoires petites",
      "silhouette": "abdomen très rond, tête inclinée",
      "head": "museau long",
      "appendages": [
        "dorsale"
      ],
      "tags": [
        "aquatic",
        "broad"
      ],
      "signature_features": [
        "ventre arrondi",
        "queue spiralée",
        "museau long"
      ]
    }
  ],
  "Crabe": [
    {
      "id": "crabe-01",
      "label": "Crabe tourteau",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "crawl"
      ],
      "limb_count": 10,
      "limb_configuration": "huit pattes + deux pinces",
      "silhouette": "très large, carapace ovale",
      "head": "tête fusionnée au céphalothorax",
      "appendages": [
        "deux pinces"
      ],
      "tags": [
        "broad",
        "armored"
      ],
      "signature_features": [
        "pinces",
        "carapace transversale",
        "yeux pédonculés"
      ]
    },
    {
      "id": "crabe-02",
      "label": "Crabe violoniste",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "crawl"
      ],
      "limb_count": 10,
      "limb_configuration": "huit pattes + pinces asymétriques",
      "silhouette": "petit corps, une pince gigantesque",
      "head": "tête compacte",
      "appendages": [
        "une pince hypertrophiée"
      ],
      "tags": [
        "asymmetric",
        "unusual"
      ],
      "signature_features": [
        "pince géante",
        "yeux pédonculés",
        "pattes fines"
      ]
    },
    {
      "id": "crabe-03",
      "label": "Crabe-araignée japonais",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "crawl"
      ],
      "limb_count": 10,
      "limb_configuration": "très longues pattes + pinces",
      "silhouette": "minuscule corps central, pattes immenses",
      "head": "tête compacte",
      "appendages": [
        "pattes filiformes"
      ],
      "tags": [
        "elongated",
        "spidery"
      ],
      "signature_features": [
        "pattes très longues",
        "carapace petite",
        "pinces fines"
      ]
    },
    {
      "id": "crabe-04",
      "label": "Crabe fantôme",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "run",
        "crawl"
      ],
      "limb_count": 10,
      "limb_configuration": "huit pattes + pinces",
      "silhouette": "léger, haut sur pattes",
      "head": "tête compacte",
      "appendages": [
        "pinces courtes"
      ],
      "tags": [
        "fast",
        "gracile"
      ],
      "signature_features": [
        "yeux hauts",
        "pattes longues",
        "carapace carrée"
      ]
    },
    {
      "id": "crabe-05",
      "label": "Crabe royal",
      "body_plan": "insectoid",
      "locomotion": [
        "walk",
        "crawl"
      ],
      "limb_count": 10,
      "limb_configuration": "longues pattes épineuses",
      "silhouette": "massif, pattes longues, carapace épineuse",
      "head": "tête intégrée",
      "appendages": [
        "épines",
        "pinces"
      ],
      "tags": [
        "massive",
        "armored"
      ],
      "signature_features": [
        "carapace épineuse",
        "longues pattes",
        "grosses pinces"
      ]
    }
  ],
  "Sirène": [
    {
      "id": "sirene-01",
      "label": "Sirène poisson classique",
      "body_plan": "hybrid",
      "locomotion": [
        "swim"
      ],
      "limb_count": 2,
      "limb_configuration": "torse humanoïde + queue de poisson",
      "silhouette": "verticale, torse humanoïde, longue queue écailleuse",
      "head": "visage humanoïde",
      "appendages": [
        "nageoire caudale"
      ],
      "tags": [
        "aquatic",
        "gracile"
      ],
      "signature_features": [
        "queue écailleuse",
        "nageoire caudale",
        "silhouette humano-aquatique"
      ]
    },
    {
      "id": "sirene-02",
      "label": "Sirène anguille",
      "body_plan": "hybrid",
      "locomotion": [
        "swim",
        "slither"
      ],
      "limb_count": 2,
      "limb_configuration": "torse humanoïde + très longue queue serpentine",
      "silhouette": "très allongée et sinueuse",
      "head": "visage humanoïde",
      "appendages": [
        "nageoire dorsale"
      ],
      "tags": [
        "aquatic",
        "serpentine"
      ],
      "signature_features": [
        "queue anguilliforme",
        "nageoire dorsale",
        "corps souple"
      ]
    },
    {
      "id": "sirene-03",
      "label": "Sirène manta",
      "body_plan": "hybrid",
      "locomotion": [
        "swim",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "torse humanoïde + mante inférieure",
      "silhouette": "large silhouette en ailes sous-marines",
      "head": "visage humanoïde",
      "appendages": [
        "nageoires pectorales en cape"
      ],
      "tags": [
        "aquatic",
        "broad"
      ],
      "signature_features": [
        "ailes de raie",
        "queue fine",
        "silhouette flottante"
      ]
    },
    {
      "id": "sirene-04",
      "label": "Sirène pinnipède",
      "body_plan": "hybrid",
      "locomotion": [
        "swim",
        "crawl"
      ],
      "limb_count": 2,
      "limb_configuration": "torse humanoïde + bassin/nageoires de phoque",
      "silhouette": "corps plus compact et arrondi",
      "head": "visage humanoïde",
      "appendages": [
        "nageoires caudales courtes"
      ],
      "tags": [
        "aquatic",
        "compact"
      ],
      "signature_features": [
        "corps fuselé",
        "nageoires larges",
        "cou court"
      ]
    },
    {
      "id": "sirene-05",
      "label": "Sirène abyssale",
      "body_plan": "hybrid",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "torse humanoïde stylisé + queue profonde",
      "silhouette": "silhouette fine, appendices translucides",
      "head": "visage simplifié",
      "appendages": [
        "voiles membranaires",
        "photophores"
      ],
      "tags": [
        "aquatic",
        "ethereal"
      ],
      "signature_features": [
        "photophores",
        "nageoires voiles",
        "queue filiforme"
      ]
    }
  ],
  "Méduse": [
    {
      "id": "meduse-01",
      "label": "Méduse lune",
      "body_plan": "floating",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "ombrelle ronde plate, tentacules courts",
      "head": "pas de tête distincte",
      "appendages": [
        "tentacules fins"
      ],
      "tags": [
        "aquatic",
        "ethereal"
      ],
      "signature_features": [
        "ombrelle translucide",
        "tentacules fins",
        "symétrie radiale"
      ]
    },
    {
      "id": "meduse-02",
      "label": "Méduse crinière de lion",
      "body_plan": "floating",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "énorme ombrelle, masse de tentacules très longue",
      "head": "pas de tête",
      "appendages": [
        "très nombreux tentacules"
      ],
      "tags": [
        "aquatic",
        "massive",
        "ornate"
      ],
      "signature_features": [
        "couronne de tentacules",
        "ombrelle large",
        "franges denses"
      ]
    },
    {
      "id": "meduse-03",
      "label": "Méduse boîte",
      "body_plan": "floating",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "ombrelle cubique, quatre groupes de tentacules",
      "head": "pas de tête",
      "appendages": [
        "quatre faisceaux de tentacules"
      ],
      "tags": [
        "aquatic",
        "angular"
      ],
      "signature_features": [
        "ombrelle cubique",
        "tentacules groupés",
        "silhouette géométrique"
      ]
    },
    {
      "id": "meduse-04",
      "label": "Méduse peigne / cténophore",
      "body_plan": "floating",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "ovale translucide, bandes lumineuses",
      "head": "pas de tête",
      "appendages": [
        "rangées ciliées"
      ],
      "tags": [
        "aquatic",
        "ethereal",
        "ornate"
      ],
      "signature_features": [
        "bandes iridescentes",
        "corps ovale",
        "transparence"
      ]
    },
    {
      "id": "meduse-05",
      "label": "Méduse profonde",
      "body_plan": "floating",
      "locomotion": [
        "swim",
        "hover"
      ],
      "limb_count": 0,
      "limb_configuration": "aucun membre",
      "silhouette": "cloche haute, tentacules très longs et peu nombreux",
      "head": "pas de tête",
      "appendages": [
        "longs filaments"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "cloche haute",
        "filaments longs",
        "bioluminescence"
      ]
    }
  ],
  "Étoile de mer": [
    {
      "id": "etoile-de-mer-01",
      "label": "Étoile à cinq bras",
      "body_plan": "aquatic",
      "locomotion": [
        "crawl"
      ],
      "limb_count": 0,
      "limb_configuration": "bras radiaux",
      "silhouette": "symétrie pentaradiale classique",
      "head": "disque central",
      "appendages": [
        "cinq bras"
      ],
      "tags": [
        "radial",
        "balanced"
      ],
      "signature_features": [
        "cinq bras",
        "texture granuleuse",
        "disque central"
      ]
    },
    {
      "id": "etoile-de-mer-02",
      "label": "Étoile tournesol",
      "body_plan": "aquatic",
      "locomotion": [
        "crawl"
      ],
      "limb_count": 0,
      "limb_configuration": "nombreux bras radiaux",
      "silhouette": "grand disque avec beaucoup de bras souples",
      "head": "disque central",
      "appendages": [
        "nombreux bras"
      ],
      "tags": [
        "radial",
        "ornate"
      ],
      "signature_features": [
        "nombreux bras",
        "disque large",
        "texture souple"
      ]
    },
    {
      "id": "etoile-de-mer-03",
      "label": "Étoile coussin",
      "body_plan": "aquatic",
      "locomotion": [
        "crawl"
      ],
      "limb_count": 0,
      "limb_configuration": "bras presque fusionnés",
      "silhouette": "très ronde et épaisse",
      "head": "disque bombé",
      "appendages": [],
      "tags": [
        "compact",
        "broad"
      ],
      "signature_features": [
        "corps coussin",
        "bras courts",
        "surface granuleuse"
      ]
    },
    {
      "id": "etoile-de-mer-04",
      "label": "Étoile serpent",
      "body_plan": "aquatic",
      "locomotion": [
        "crawl"
      ],
      "limb_count": 0,
      "limb_configuration": "cinq très longs bras fins",
      "silhouette": "petit disque, bras filiformes",
      "head": "disque central",
      "appendages": [
        "bras très longs"
      ],
      "tags": [
        "radial",
        "elongated"
      ],
      "signature_features": [
        "bras filiformes",
        "petit disque",
        "mouvement ondulant"
      ]
    },
    {
      "id": "etoile-de-mer-05",
      "label": "Étoile couronne d’épines",
      "body_plan": "aquatic",
      "locomotion": [
        "crawl"
      ],
      "limb_count": 0,
      "limb_configuration": "nombreux bras épais",
      "silhouette": "large et très épineuse",
      "head": "disque central",
      "appendages": [
        "épines longues"
      ],
      "tags": [
        "radial",
        "armored"
      ],
      "signature_features": [
        "épines",
        "nombreux bras",
        "surface cuirassée"
      ]
    }
  ],
  "Aigle": [
    {
      "id": "aigle-01",
      "label": "Aigle royal",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "grand rapace robuste, ailes longues",
      "head": "tête de rapace",
      "appendages": [
        "grandes ailes"
      ],
      "tags": [
        "aerial",
        "massive"
      ],
      "signature_features": [
        "bec crochu",
        "serres",
        "grandes ailes"
      ]
    },
    {
      "id": "aigle-02",
      "label": "Pygargue",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus massif, tête et bec larges",
      "head": "tête large",
      "appendages": [
        "ailes très larges"
      ],
      "tags": [
        "aerial",
        "broad"
      ],
      "signature_features": [
        "gros bec",
        "ailes larges",
        "queue courte"
      ]
    },
    {
      "id": "aigle-03",
      "label": "Aigle harpie",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes très puissantes + ailes",
      "silhouette": "compact et énorme, serres gigantesques",
      "head": "tête huppée",
      "appendages": [
        "ailes courtes et larges"
      ],
      "tags": [
        "massive",
        "ornate"
      ],
      "signature_features": [
        "huppe",
        "serres géantes",
        "pattes épaisses"
      ]
    },
    {
      "id": "aigle-04",
      "label": "Aigle serpent",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + ailes",
      "silhouette": "haut sur pattes, tête large",
      "head": "tête de rapace",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "vertical",
        "aerial"
      ],
      "signature_features": [
        "longues pattes",
        "tête large",
        "ailes amples"
      ]
    },
    {
      "id": "aigle-05",
      "label": "Aigle huppard",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "silhouette plus fine, longue huppe",
      "head": "tête fine",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "longue huppe",
        "ailes fines",
        "serres"
      ]
    }
  ],
  "Hibou": [
    {
      "id": "hibou-01",
      "label": "Grand-duc",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "grand, large, aigrettes marquées",
      "head": "tête ronde à aigrettes",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "broad",
        "aerial"
      ],
      "signature_features": [
        "disque facial",
        "grands yeux",
        "aigrettes"
      ]
    },
    {
      "id": "hibou-02",
      "label": "Harfang des neiges",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "rond, dense, sans aigrettes",
      "head": "tête ronde",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "compact",
        "soft"
      ],
      "signature_features": [
        "plumage dense",
        "grands yeux",
        "tête ronde"
      ]
    },
    {
      "id": "hibou-03",
      "label": "Effraie",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "fine, longues ailes, visage en cœur",
      "head": "tête en cœur",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "gracile",
        "ethereal"
      ],
      "signature_features": [
        "disque facial en cœur",
        "ailes longues",
        "pattes fines"
      ]
    },
    {
      "id": "hibou-04",
      "label": "Petit-duc",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petit, compact, grandes aigrettes",
      "head": "tête petite",
      "appendages": [
        "ailes courtes"
      ],
      "tags": [
        "compact",
        "expressive"
      ],
      "signature_features": [
        "aigrettes",
        "grands yeux",
        "corps court"
      ]
    },
    {
      "id": "hibou-05",
      "label": "Hibou pêcheur",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes puissantes + ailes",
      "silhouette": "grand et allongé, pattes fortes",
      "head": "tête large",
      "appendages": [
        "ailes amples"
      ],
      "tags": [
        "massive",
        "vertical"
      ],
      "signature_features": [
        "pattes puissantes",
        "disque facial réduit",
        "ailes larges"
      ]
    }
  ],
  "Faucon": [
    {
      "id": "faucon-01",
      "label": "Faucon pèlerin",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "compact, ailes pointues, poitrine profonde",
      "head": "tête au masque sombre",
      "appendages": [
        "ailes pointues"
      ],
      "tags": [
        "aerial",
        "fast"
      ],
      "signature_features": [
        "ailes pointues",
        "masque facial",
        "serres fines"
      ]
    },
    {
      "id": "faucon-02",
      "label": "Faucon gerfaut",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus grand et massif",
      "head": "tête large",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "aerial",
        "massive"
      ],
      "signature_features": [
        "ailes longues",
        "poitrine forte",
        "bec crochu"
      ]
    },
    {
      "id": "faucon-03",
      "label": "Crécerelle",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petit, léger, queue longue",
      "head": "tête fine",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "queue longue",
        "ailes fines",
        "vol stationnaire"
      ]
    },
    {
      "id": "faucon-04",
      "label": "Faucon lanier",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "longiligne, ailes longues",
      "head": "tête fine",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "aerial",
        "elongated"
      ],
      "signature_features": [
        "ailes longues",
        "tête claire",
        "serres fines"
      ]
    },
    {
      "id": "faucon-05",
      "label": "Faucon aplomado",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + ailes",
      "silhouette": "haut sur pattes, silhouette fine",
      "head": "tête masquée",
      "appendages": [
        "ailes pointues"
      ],
      "tags": [
        "vertical",
        "gracile"
      ],
      "signature_features": [
        "longues pattes",
        "masque facial",
        "queue longue"
      ]
    }
  ],
  "Corbeau": [
    {
      "id": "corbeau-01",
      "label": "Grand corbeau",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "grand, bec massif, gorge hirsute",
      "head": "tête à gros bec",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "massive",
        "dark"
      ],
      "signature_features": [
        "bec épais",
        "queue en coin",
        "plumage irisé"
      ]
    },
    {
      "id": "corbeau-02",
      "label": "Corneille noire",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus compacte et régulière",
      "head": "tête fine",
      "appendages": [
        "ailes moyennes"
      ],
      "tags": [
        "balanced",
        "dark"
      ],
      "signature_features": [
        "bec droit",
        "queue carrée",
        "plumage noir"
      ]
    },
    {
      "id": "corbeau-03",
      "label": "Corbeau freux",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps fin, base du bec nue",
      "head": "tête étroite",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "gracile",
        "dark"
      ],
      "signature_features": [
        "bec long",
        "face nue",
        "ailes longues"
      ]
    },
    {
      "id": "corbeau-04",
      "label": "Geai noir / corvidé huppé",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus ornemental, huppe et longue queue",
      "head": "tête huppée",
      "appendages": [
        "ailes courtes"
      ],
      "tags": [
        "ornate",
        "gracile"
      ],
      "signature_features": [
        "huppe",
        "longue queue",
        "bec fin"
      ]
    },
    {
      "id": "corbeau-05",
      "label": "Corbeau à cou blanc",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "grand, cou contrasté",
      "head": "tête robuste",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "broad",
        "graphic"
      ],
      "signature_features": [
        "collier clair",
        "bec épais",
        "ailes larges"
      ]
    }
  ],
  "Perroquet": [
    {
      "id": "perroquet-01",
      "label": "Ara",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "climb",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes zygodactyles + ailes",
      "silhouette": "grand, longue queue, ailes larges",
      "head": "gros bec courbe",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "ornate",
        "aerial"
      ],
      "signature_features": [
        "bec courbe",
        "longue queue",
        "plumage coloré"
      ]
    },
    {
      "id": "perroquet-02",
      "label": "Cacatoès",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps compact, grande huppe",
      "head": "tête huppée",
      "appendages": [
        "huppe érectile"
      ],
      "tags": [
        "ornate",
        "compact"
      ],
      "signature_features": [
        "grande huppe",
        "bec puissant",
        "queue courte"
      ]
    },
    {
      "id": "perroquet-03",
      "label": "Amazone",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "compact, queue courte, tête large",
      "head": "bec courbe",
      "appendages": [
        "ailes rondes"
      ],
      "tags": [
        "compact",
        "balanced"
      ],
      "signature_features": [
        "bec courbe",
        "corps trapu",
        "plumage dense"
      ]
    },
    {
      "id": "perroquet-04",
      "label": "Loriquet",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petit, très coloré, corps fin",
      "head": "tête petite",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "gracile",
        "ornate"
      ],
      "signature_features": [
        "plumage vif",
        "bec fin",
        "queue pointue"
      ]
    },
    {
      "id": "perroquet-05",
      "label": "Kéa",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "climb",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "robuste, bec long, ailes larges",
      "head": "tête allongée",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "massive",
        "grounded"
      ],
      "signature_features": [
        "bec long",
        "ailes larges",
        "corps robuste"
      ]
    }
  ],
  "Hirondelle": [
    {
      "id": "hirondelle-01",
      "label": "Hirondelle rustique",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes",
      "silhouette": "corps fuselé, longue queue fourchue",
      "head": "petite tête",
      "appendages": [
        "ailes faucillées"
      ],
      "tags": [
        "aerial",
        "fast"
      ],
      "signature_features": [
        "queue fourchue",
        "ailes faucillées",
        "corps fuselé"
      ]
    },
    {
      "id": "hirondelle-02",
      "label": "Hirondelle de fenêtre",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes",
      "silhouette": "plus compacte, queue courte",
      "head": "tête petite",
      "appendages": [
        "ailes triangulaires"
      ],
      "tags": [
        "aerial",
        "compact"
      ],
      "signature_features": [
        "queue courte",
        "ailes triangulaires",
        "corps rond"
      ]
    },
    {
      "id": "hirondelle-03",
      "label": "Hirondelle de rivage",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petite, fine, queue peu fourchue",
      "head": "tête petite",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "ailes étroites",
        "corps fin",
        "queue courte"
      ]
    },
    {
      "id": "hirondelle-04",
      "label": "Hirondelle à longs brins",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes",
      "silhouette": "queue prolongée de longs filaments",
      "head": "tête petite",
      "appendages": [
        "ailes fines"
      ],
      "tags": [
        "aerial",
        "ornate"
      ],
      "signature_features": [
        "filets caudaux",
        "ailes fines",
        "corps fuselé"
      ]
    },
    {
      "id": "hirondelle-05",
      "label": "Hirondelle géante stylisée",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes",
      "silhouette": "grande envergure, corps minuscule, queue très longue",
      "head": "tête simplifiée",
      "appendages": [
        "ailes immenses"
      ],
      "tags": [
        "aerial",
        "unusual"
      ],
      "signature_features": [
        "ailes immenses",
        "queue bifide longue",
        "corps réduit"
      ]
    }
  ],
  "Flamant rose": [
    {
      "id": "flamant-rose-01",
      "label": "Flamant rose européen",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux très longues pattes + ailes",
      "silhouette": "très vertical, long cou en S",
      "head": "petite tête à bec coudé",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "vertical",
        "gracile"
      ],
      "signature_features": [
        "long cou en S",
        "pattes échasses",
        "bec coudé"
      ]
    },
    {
      "id": "flamant-rose-02",
      "label": "Flamant nain",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + ailes",
      "silhouette": "plus petit, cou fin, bec sombre",
      "head": "petite tête",
      "appendages": [
        "ailes"
      ],
      "tags": [
        "vertical",
        "compact"
      ],
      "signature_features": [
        "cou fin",
        "pattes longues",
        "bec sombre"
      ]
    },
    {
      "id": "flamant-rose-03",
      "label": "Flamant des Andes",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + ailes",
      "silhouette": "plus massif, plumage contrasté",
      "head": "tête fine",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "vertical",
        "ornate"
      ],
      "signature_features": [
        "plumage contrasté",
        "cou long",
        "pattes échasses"
      ]
    },
    {
      "id": "flamant-rose-04",
      "label": "Flamant de James",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux longues pattes + ailes",
      "silhouette": "corps compact, long cou et pattes",
      "head": "petite tête",
      "appendages": [
        "ailes"
      ],
      "tags": [
        "vertical",
        "balanced"
      ],
      "signature_features": [
        "bec bicolore",
        "cou long",
        "corps compact"
      ]
    },
    {
      "id": "flamant-rose-05",
      "label": "Flamant stylisé extrême",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes extrêmement longues + ailes",
      "silhouette": "silhouette filiforme, cou exagérément long",
      "head": "tête minuscule",
      "appendages": [
        "ailes réduites"
      ],
      "tags": [
        "vertical",
        "elongated"
      ],
      "signature_features": [
        "cou très long",
        "pattes filiformes",
        "petite tête"
      ]
    }
  ],
  "Colibri": [
    {
      "id": "colibri-01",
      "label": "Colibri à gorge rubis",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux minuscules pattes + ailes",
      "silhouette": "très petit, bec long, ailes rapides",
      "head": "petite tête",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "aerial",
        "compact"
      ],
      "signature_features": [
        "long bec",
        "gorge irisée",
        "ailes rapides"
      ]
    },
    {
      "id": "colibri-02",
      "label": "Colibri porte-épée",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux petites pattes + ailes",
      "silhouette": "bec presque aussi long que le corps",
      "head": "petite tête",
      "appendages": [
        "ailes étroites"
      ],
      "tags": [
        "aerial",
        "elongated"
      ],
      "signature_features": [
        "bec immense",
        "corps court",
        "ailes rapides"
      ]
    },
    {
      "id": "colibri-03",
      "label": "Colibri à queue en raquettes",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petit corps, deux longues plumes caudales",
      "head": "petite tête",
      "appendages": [
        "plumes caudales en raquettes"
      ],
      "tags": [
        "aerial",
        "ornate"
      ],
      "signature_features": [
        "queue en raquettes",
        "bec fin",
        "gorge irisée"
      ]
    },
    {
      "id": "colibri-04",
      "label": "Colibri géant",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus grand et allongé, ailes longues",
      "head": "tête fine",
      "appendages": [
        "ailes longues"
      ],
      "tags": [
        "aerial",
        "gracile"
      ],
      "signature_features": [
        "ailes longues",
        "bec droit",
        "corps élancé"
      ]
    },
    {
      "id": "colibri-05",
      "label": "Colibri à huppe",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "hover"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "petit, huppe marquée, queue courte",
      "head": "tête huppée",
      "appendages": [
        "ailes rapides"
      ],
      "tags": [
        "aerial",
        "ornate"
      ],
      "signature_features": [
        "huppe",
        "gorge brillante",
        "ailes rapides"
      ]
    }
  ],
  "Cygne": [
    {
      "id": "cygne-01",
      "label": "Cygne tuberculé",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "swim",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes palmées + ailes",
      "silhouette": "grand corps flottant, cou en S",
      "head": "tête fine",
      "appendages": [
        "grandes ailes"
      ],
      "tags": [
        "aquatic",
        "gracile"
      ],
      "signature_features": [
        "cou en S",
        "grandes ailes",
        "silhouette flottante"
      ]
    },
    {
      "id": "cygne-02",
      "label": "Cygne chanteur",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "swim",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes palmées + ailes",
      "silhouette": "cou plus droit, corps long",
      "head": "tête fine",
      "appendages": [
        "ailes larges"
      ],
      "tags": [
        "aquatic",
        "elongated"
      ],
      "signature_features": [
        "long cou",
        "bec droit",
        "grandes ailes"
      ]
    },
    {
      "id": "cygne-03",
      "label": "Cygne noir",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "swim",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes palmées + ailes",
      "silhouette": "cou très long et ondulant, plumes bouclées",
      "head": "tête fine",
      "appendages": [
        "ailes frangées"
      ],
      "tags": [
        "aquatic",
        "ornate"
      ],
      "signature_features": [
        "cou très long",
        "plumes frangées",
        "ailes larges"
      ]
    },
    {
      "id": "cygne-04",
      "label": "Cygne trompette",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "swim",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes palmées + ailes",
      "silhouette": "très grand et massif",
      "head": "tête large",
      "appendages": [
        "ailes puissantes"
      ],
      "tags": [
        "aquatic",
        "massive"
      ],
      "signature_features": [
        "grand bec",
        "cou épais",
        "ailes puissantes"
      ]
    },
    {
      "id": "cygne-05",
      "label": "Cygne stylisé aérien",
      "body_plan": "avian",
      "locomotion": [
        "fly",
        "glide",
        "swim"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps réduit, cou rubané, ailes surdimensionnées",
      "head": "tête petite",
      "appendages": [
        "ailes immenses"
      ],
      "tags": [
        "aerial",
        "gracile",
        "unusual"
      ],
      "signature_features": [
        "cou rubané",
        "ailes immenses",
        "queue courte"
      ]
    }
  ],
  "Paon": [
    {
      "id": "paon-01",
      "label": "Paon bleu",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "corps fin, immense traîne ocellée",
      "head": "petite tête huppée",
      "appendages": [
        "traîne en éventail"
      ],
      "tags": [
        "ornate",
        "broad"
      ],
      "signature_features": [
        "traîne ocellée",
        "huppe en éventail",
        "cou irisé"
      ]
    },
    {
      "id": "paon-02",
      "label": "Paon vert",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus long et élancé, traîne fine",
      "head": "tête huppée",
      "appendages": [
        "longue traîne"
      ],
      "tags": [
        "ornate",
        "elongated"
      ],
      "signature_features": [
        "cou long",
        "traîne fine",
        "huppe dressée"
      ]
    },
    {
      "id": "paon-03",
      "label": "Paon du Congo",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "plus compact, traîne réduite",
      "head": "tête petite",
      "appendages": [
        "queue courte"
      ],
      "tags": [
        "compact",
        "ornate"
      ],
      "signature_features": [
        "huppe courte",
        "plumage sombre",
        "queue réduite"
      ]
    },
    {
      "id": "paon-04",
      "label": "Paon blanc",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "silhouette classique, traîne très claire",
      "head": "tête huppée",
      "appendages": [
        "traîne large"
      ],
      "tags": [
        "ornate",
        "bright"
      ],
      "signature_features": [
        "traîne blanche",
        "huppe en éventail",
        "plumes irisées"
      ]
    },
    {
      "id": "paon-05",
      "label": "Paon stylisé lyre",
      "body_plan": "avian",
      "locomotion": [
        "walk",
        "fly",
        "glide"
      ],
      "limb_count": 2,
      "limb_configuration": "deux pattes + ailes",
      "silhouette": "queue transformée en longues plumes rubanées plutôt qu’en éventail",
      "head": "tête huppée",
      "appendages": [
        "plumes caudales rubanées"
      ],
      "tags": [
        "ornate",
        "gracile"
      ],
      "signature_features": [
        "plumes rubanées",
        "huppe",
        "cou élancé"
      ]
    }
  ]
};


function buildRequiredBodyPlan(animal, variant) {
  const requirements = [
    `MORPHOTYPE PRIMAIRE : ${variant.label}`,
    `Famille animale large : ${animal} (information secondaire ; elle ne doit jamais écraser le morphotype primaire)`,
    `Plan corporel : ${variant.body_plan}`,
    `Configuration des membres : ${variant.limb_configuration}`,
    `Silhouette obligatoire de référence : ${variant.silhouette}`,
    `Construction de tête : ${variant.head}`,
  ]

  if (Number.isInteger(variant.limb_count)) {
    requirements.push(`Métadonnée de membres porteurs / locomoteurs : ${variant.limb_count}; la configuration textuelle des membres reste l'autorité principale.`)
  }

  if ((variant.locomotion ?? []).length > 0) {
    requirements.push(`Locomotion compatible : ${(variant.locomotion ?? []).join(' / ')}`)
  }

  if ((variant.appendages ?? []).length > 0) {
    requirements.push(`Appendices majeurs attendus : ${(variant.appendages ?? []).join(' ; ')}`)
  } else {
    requirements.push('Aucun appendice majeur supplémentaire ne doit être inventé uniquement pour revenir au stéréotype de la famille animale.')
  }

  if ((variant.signature_features ?? []).length > 0) {
    requirements.push(`Traits signatures du morphotype : ${(variant.signature_features ?? []).join(' ; ')}`)
  }

  return requirements
}

function buildForbiddenBodyPlans(animal, variant, variants) {
  const forbidden = [
    `Ne pas remplacer ${variant.label} par une version générique ou stéréotypée de la famille ${animal}.`,
    `Ne pas modifier le plan corporel « ${variant.body_plan} » d'une manière qui ferait reconnaître un autre morphotype plutôt que ${variant.label}.`,
    `Ne pas contredire la configuration de membres suivante : ${variant.limb_configuration}.`,
  ]

  for (const other of variants) {
    if (other.id === variant.id) continue
    forbidden.push(
      `MORPHOTYPE ALTERNATIF INTERDIT : ${other.label} — ne pas dériver vers sa structure (${other.body_plan}; ${other.limb_configuration}).`
    )
  }

  return forbidden
}

function enrichMorphologyContracts() {
  for (const [animal, variants] of Object.entries(VARIANTS)) {
    for (const variant of variants) {
      variant.priority = 'CRITICAL'
      variant.morphology_priority = 'CRITICAL'
      variant.morphology_weight = 1.0
      variant.required_body_plan = buildRequiredBodyPlan(animal, variant)
      variant.forbidden_body_plans = buildForbiddenBodyPlans(animal, variant, variants)
      variant.morphology_gate = {
        must_pass_before_design: true,
        selected_morphotype_is_primary_anatomical_identity: true,
        broad_animal_family_is_secondary: true,
        restart_if_generic_family_template_detected: true,
        fail_if_final_morphotype_not_recognizable: true,
        questions: [
          'Quel est le plan corporel exact du morphotype sélectionné ?',
          'Quelle est sa configuration exacte de membres ?',
          'Les ailes ou appendices existent-ils, et sous quelle forme ?',
          'Quelle silhouette et quelle locomotion distinguent ce morphotype des autres variantes de la même famille ?',
          'Mon image mentale correspond-elle au morphotype exact plutôt qu’au stéréotype de la famille animale ?',
        ],
      }
      variant.structural_identity_rule =
        `Le morphotype « ${variant.label} » est l'identité anatomique PRIMAIRE. Le libellé large « ${animal} » est secondaire et ne doit jamais réinjecter un body plan générique incompatible.`
    }
  }
}

enrichMorphologyContracts()


function hash32(value) {
  let hash = 2166136261
  const text = String(value ?? '')
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const NAME_INDEX = new Map(
  Object.keys(VARIANTS).map((name) => [normalizeName(name), name])
)

const ALIASES = new Map([
  ['raie manta', 'Raie manta'],
  ['raie', 'Raie manta'],
  ['mante', 'Mante religieuse'],
  ['etoile de mer', 'Étoile de mer'],
  ['flamant', 'Flamant rose'],
  ['phoenix', 'Phénix'],
  ['yeti', 'Yéti'],
])

function resolveAnimalName(animal) {
  const normalized = normalizeName(animal)
  return NAME_INDEX.get(normalized) ?? ALIASES.get(normalized) ?? null
}

function preferenceScore(variant, visual = {}) {
  let score = 1
  const tags = new Set(variant.tags ?? [])
  const verticality = Number(visual.verticality ?? 50)
  const width = Number(visual.width ?? 50)
  const complexity = Number(visual.complexity ?? 50)
  const expressiveness = Number(visual.expressiveness ?? 50)

  if (verticality >= 65 && (tags.has('vertical') || tags.has('elongated'))) score += 0.35
  if (verticality <= 35 && (tags.has('grounded') || tags.has('compact'))) score += 0.25
  if (width >= 65 && (tags.has('massive') || tags.has('broad'))) score += 0.35
  if (width <= 35 && (tags.has('gracile') || tags.has('elongated'))) score += 0.30
  if (complexity >= 65 && (tags.has('ornate') || tags.has('armored') || tags.has('unusual'))) score += 0.35
  if (complexity <= 35 && (tags.has('compact') || tags.has('gracile') || tags.has('balanced'))) score += 0.20
  if (expressiveness >= 65 && (tags.has('ornate') || tags.has('expressive') || tags.has('unusual'))) score += 0.25

  return Math.max(0.1, score)
}

function selectAnimalMorphologyVariant({ animal, seed, assessmentId, visual }) {
  const canonicalName = resolveAnimalName(animal)
  if (!canonicalName) return null
  const candidates = VARIANTS[canonicalName] ?? []
  if (candidates.length === 0) return null

  const scores = candidates.map((variant) => preferenceScore(variant, visual))
  const total = scores.reduce((sum, value) => sum + value, 0)
  const stableKey = `${assessmentId ?? seed ?? 'default'}|${canonicalName}|morphology-v1`
  let cursor = (hash32(stableKey) / 0xFFFFFFFF) * total

  for (let index = 0; index < candidates.length; index += 1) {
    cursor -= scores[index]
    if (cursor <= 0) {
      return {
        ...candidates[index],
        animal: canonicalName,
        library_version: ANIMAL_MORPHOLOGY_VARIANTS_VERSION,
        candidate_count: candidates.length,
        morphology_priority: 'CRITICAL',
        morphology_weight: 1.0,
        structural_identity_rule: 'Le morphotype sélectionné est une contrainte structurelle prioritaire. Il doit rester reconnaissable dans le design final et ne doit jamais être aplati vers la forme stéréotypée de la famille animale.',
      }
    }
  }

  return {
    ...candidates[candidates.length - 1],
    animal: canonicalName,
    library_version: ANIMAL_MORPHOLOGY_VARIANTS_VERSION,
    candidate_count: candidates.length,
    morphology_priority: 'CRITICAL',
    morphology_weight: 1.0,
    structural_identity_rule: 'Le morphotype sélectionné est une contrainte structurelle prioritaire. Il doit rester reconnaissable dans le design final et ne doit jamais être aplati vers la forme stéréotypée de la famille animale.',
  }
}


async function selectAnimalMorphologyVariantWithHistory({
  animal,
  seed,
  assessmentId,
  visual,
}) {
  const canonicalName = resolveAnimalName(animal)
  if (!canonicalName) return null

  const candidates = VARIANTS[canonicalName] ?? []
  if (candidates.length === 0) return null

  const reservation = await reserveSelection({
    assessmentId,
    selectionKind: SELECTION_KINDS.MORPHOLOGY,
    scopeKey: canonicalName,
    candidateIds: candidates.map(item => item.id),
    metadata: {
      animal: canonicalName,
      library_version: ANIMAL_MORPHOLOGY_VARIANTS_VERSION,
      anti_repeat_window: 3,
    },
    chooseId: (eligibleIds) => {
      const eligible = candidates.filter(item => eligibleIds.includes(item.id))
      const scores = eligible.map((variant) => preferenceScore(variant, visual))
      const total = scores.reduce((sum, value) => sum + value, 0)
      const stableKey = `${assessmentId ?? seed ?? 'default'}|${canonicalName}|morphology-history-v1`
      let cursor = (hash32(stableKey) / 0xFFFFFFFF) * total

      for (let index = 0; index < eligible.length; index += 1) {
        cursor -= scores[index]
        if (cursor <= 0) return eligible[index].id
      }

      return eligible[eligible.length - 1].id
    },
  })

  const selected = candidates.find(item => item.id === reservation.selectedId)
  if (!selected) throw new Error('MORPHOLOGY_HISTORY_SELECTED_ID_NOT_FOUND')

  return {
    ...selected,
    animal: canonicalName,
    library_version: ANIMAL_MORPHOLOGY_VARIANTS_VERSION,
    candidate_count: candidates.length,
    morphology_priority: 'CRITICAL',
    morphology_weight: 1.0,
    structural_identity_rule: 'Le morphotype sélectionné est une contrainte structurelle prioritaire. Il doit rester reconnaissable dans le design final et ne doit jamais être aplati vers la forme stéréotypée de la famille animale.',
    anti_repetition: {
      window: 3,
      scope: 'same_animal',
      recent_excluded: reservation.recentIds,
      eligible_count: reservation.eligibleIds.length,
      reused_for_same_assessment: reservation.reusedForAssessment,
    },
  }
}

function getAnimalMorphologyVariants(animal) {
  const canonicalName = resolveAnimalName(animal)
  return canonicalName ? [...(VARIANTS[canonicalName] ?? [])] : []
}

module.exports = {
  ANIMAL_MORPHOLOGY_VARIANTS_VERSION,
  VARIANTS,
  getAnimalMorphologyVariants,
  selectAnimalMorphologyVariant,
  selectAnimalMorphologyVariantWithHistory,
}
