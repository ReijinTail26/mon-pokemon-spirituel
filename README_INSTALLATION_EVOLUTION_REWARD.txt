CORRECTIF — OBTENTION ALÉATOIRE D'UNE ÉVOLUTION
================================================

1. Copiez les dossiers apps-api et apps-web du correctif dans le dossier du
   projet en conservant leur arborescence. Acceptez le remplacement des fichiers.

2. Conservez vos assets existants. Le ZIP de correctif n'en contient aucun.
   Les Visual Seeds doivent notamment rester disponibles sous :

   apps-api/assets/visual-seeds/<animal>/seed-XXX.jpg

   Le seed évolutif ne peut pas être produit sans le JPG sélectionné dans le
   dossier créatif.

3. Appliquez la nouvelle migration PostgreSQL depuis PowerShell :

   cd "C:\Users\nicol\pokemon-personnalise"

   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d pokemon_personnalise -W -f ".\apps-api\migrations\20260828_evolution_reward.sql"

   La migration 20260828_evolution_sheet.sql doit également avoir été appliquée.

4. Aucun npm install n'est nécessaire. Redémarrez le backend et le frontend.

FONCTIONNEMENT
--------------

- Le tirage a lieu côté serveur lorsque l'utilisateur clique sur
  « Préparer mon dossier créatif ».
- Une chance sur quatre accorde l'évolution.
- Le résultat est enregistré définitivement : double-clic, actualisation et
  nouvel appel ne permettent pas de rejouer.
- En cas de réussite, l'écran s'illumine et affiche l'annonce d'évolution.
- Le package contient alors un troisième téléchargement : seed-evolutif.pdf.
- Le JPG est incorporé directement au PDF, avec ses octets et ses dimensions
  d'origine : aucune recompression, aucun recadrage et aucune réduction.
- La règle s'applique aux préparations lancées après cette migration. Les
  packages déjà créés ne font pas l'objet d'un tirage rétroactif.

AUTRES MODIFICATIONS INCLUSES
-----------------------------

- Mention claire de la sauvegarde automatique sur l'accueil.
- Navigation Accueil / Communauté / Mon espace plus contrastée et lisible.
- Nouveau titre : « Mon Pokémon spirituel ».
- Suppression de la formulation « les deux livrables » sur l'écran de résultat.
- Une création dont le questionnaire est terminé mais dont les livrables ne
  sont pas prêts affiche « Finaliser cette création » dans l'espace personnel.
  Ce bouton rouvre la validation du bon Pokémon, sans recommencer le test.
- Toute création autorisée à évoluer affiche clairement le badge
  « ✨ Peut évoluer » dans sa fiche personnelle, même avant l'import d'une
  fiche Pokédex finale.
- La page des livrables est désormais un guide obligatoire : elle rappelle que
  le dossier n'est pas le résultat final, détaille la procédure ChatGPT et ne
  révèle les fichiers qu'après confirmation de lecture.
- Le prompt principal est copié directement dans le presse-papiers avec une
  notification « Prompt copié ».
- Un lien visible ouvre ChatGPT dans un nouvel onglet ou via l'application
  associée sur mobile.
- En cas d'Évolution, une seconde procédure fournit le Seed évolutif et copie
  le prompt de transformation dédié.
