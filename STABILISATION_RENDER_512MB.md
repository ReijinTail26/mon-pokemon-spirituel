# Stabilisation Render 512 Mo

Ce correctif empêche une génération PDF interrompue de faire redémarrer le
backend sans fin. Il allège aussi les images utilisées par Chromium sans
modifier les originaux.

## Important concernant les assets absents de l'archive

Les dossiers `apps-api/assets/backgrounds`,
`apps-api/assets/visual-seeds` et `apps-web/public/backgrounds` peuvent être
absents de cette archive légère. Conservez ceux de votre dépôt local lorsque
vous remplacez les fichiers. Décompressez l'archive par-dessus votre projet :
ne supprimez pas le projet existant avant la copie.

Lors du build Render, le script `npm run assets:pdf-previews` parcourt
automatiquement ces deux dossiers. Il crée :

- des previews JPEG de 1600 px maximum dans `assets/pdf-previews` ;
- une référence JPEG pleine résolution pour les seeds PNG susceptibles de
  devenir un seed évolutif, dans `assets/evolution-jpeg`.

Les fichiers originaux ne sont ni recadrés, ni supprimés, ni remplacés.

## Ordre de déploiement obligatoire

1. Dans Render, ajouter `GENERATION_ENABLED=false` avec **Save only**.
2. Dans Neon SQL Editor, appliquer
   `apps-api/migrations/20260829_generation_job_resilience.sql`.
3. Copier les fichiers corrigés dans le dépôt sans effacer les assets locaux.
4. Exécuter les tests et le build local.
5. Commit et push vers GitHub.
6. Attendre que Render et Netlify soient `Live`.
7. Vérifier `/health`, `/db-health` et `/api/health` via Netlify.
8. Vérifier la connexion Google sur ordinateur et iOS.
9. Dans Render, passer `GENERATION_ENABLED=true` avec **Save and deploy**.
10. Tester une seule génération et surveiller Render Events.

## Variables Render

```text
GENERATION_ENABLED=false
GENERATION_JOB_TIMEOUT_MS=180000
GENERATION_STALE_MINUTES=10
R2_REQUEST_TIMEOUT_MS=45000
```

`GENERATION_ENABLED` doit rester à `false` jusqu'à la fin des vérifications.

## Comportement après incident

- Un job est verrouillé avant son traitement.
- Une seule tentative automatique est autorisée.
- Si Render tue le processus, le job abandonné devient `FAILED` après le délai
  de sécurité et n'est pas repris indéfiniment.
- Le frontend arrête son polling sur `FAILED`.
- Une erreur `502` pendant la vérification de session n'est plus assimilée à
  une déconnexion Google.

## Commandes locales Windows

Depuis la racine du dépôt :

```powershell
npm --prefix apps-api ci
npm --prefix apps-api test
npm --prefix apps-web ci
npm --prefix apps-web run build
```

Puis :

```powershell
git add .
git status
git commit -m "Stabilisation de la génération sous Render 512 Mo"
git push
```

## Vérifications HTTP

```text
https://mon-pokemon-spirituel.onrender.com/health
https://mon-pokemon-spirituel.onrender.com/db-health
https://mon-pokemon-spirituel.netlify.app/api/health
https://mon-pokemon-spirituel.netlify.app/api/v1/auth/me
```

Le endpoint `/health` indique également si la génération est activée.
