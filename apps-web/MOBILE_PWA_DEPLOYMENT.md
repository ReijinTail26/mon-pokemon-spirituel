# Mise en ligne de la version mobile PWA

Cette version rend **Mon Pokémon spirituel** installable depuis le navigateur, sans store, tout en conservant l’authentification Google existante.

## Fichiers ajoutés

- `public/manifest.webmanifest` : informations d’installation de l’application ;
- `public/sw.js` : mise à jour automatique et écran de secours hors connexion ;
- `public/offline.html` : message affiché lorsqu’aucune connexion n’est disponible ;
- `public/icons/` : icônes Android, iPhone et masque adaptatif ;
- `public/_redirects` : prise en charge des adresses directes par Netlify ;
- `public/_headers` : actualisation correcte du service worker ;
- `src/screens/InstallScreen.tsx` : page `/install` ;
- `src/pwa.ts` : activation du service worker en production.

## Mise à jour du dépôt GitHub

Depuis PowerShell, placez-vous à la racine du dépôt puis copiez le contenu fourni par-dessus le dossier `apps-web` existant. **Ne supprimez pas le dossier existant** : vos fichiers volumineux doivent rester dans `apps-web/public/backgrounds`.

Exécutez ensuite :

```powershell
git status
git add apps-web
git commit -m "Ajout de la version mobile PWA"
git push
```

Netlify reconstruira automatiquement le frontend.

## Vérification après le déploiement

1. Ouvrir `https://mon-pokemon-spirituel.netlify.app/install`.
2. Vérifier que la nouvelle icône et les instructions apparaissent.
3. Sur Android avec Chrome, utiliser **Installer l’application**.
4. Sur iPhone avec Safari, utiliser **Partager**, puis **Sur l’écran d’accueil**.
5. Ouvrir l’application installée et tester la connexion Google.
6. Vérifier le questionnaire, l’espace personnel et un téléchargement.

Si Chrome affiche encore une ancienne version après une mise à jour, ouvrez les paramètres du site dans Chrome, supprimez les données enregistrées pour `mon-pokemon-spirituel.netlify.app`, puis rechargez la page. Le service worker version 2 ne conserve plus les pages de navigation dans le cache.

## Étape APK

L’APK Android sera préparé après validation de la PWA déployée. Il devra utiliser une application Web de confiance afin de conserver la connexion Google dans le navigateur sécurisé. Un simple conteneur WebView n’est pas retenu, car Google peut y bloquer OAuth.
