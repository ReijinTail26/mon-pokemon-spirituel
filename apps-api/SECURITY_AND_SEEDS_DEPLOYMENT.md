# Déploiement — seeds automatiques et protections API

## Prérequis Render

La variable suivante doit rester exactement configurée avec l’origine publique du frontend :

```text
WEB_ORIGIN=https://mon-pokemon-spirituel.netlify.app
```

Pour Safari/iOS, le callback OAuth doit également passer par Netlify :

```text
GOOGLE_CALLBACK_URL=https://mon-pokemon-spirituel.netlify.app/api/v1/auth/google/callback
```

Aucune nouvelle variable secrète ni migration Neon n’est requise.

## Protections conservées

- en-têtes HTTP de sécurité avec Helmet ;
- corps JSON limité à 64 Ko et images limitées à 15 Mo ;
- contrôle de l’origine des opérations qui modifient les données ;
- délais serveur contre les connexions volontairement incomplètes.

Il n’y a volontairement aucun rate limiting applicatif. Un trafic automatisé important ou un DDoS doit donc être filtré par l’hébergeur ou par un proxy Cloudflare placé devant l’API.

## Mise en ligne

Copier ce dossier par-dessus `apps-api` sans supprimer `apps-api/assets`, puis exécuter :

```powershell
npm --prefix apps-api ci
npm --prefix apps-api test
git add apps-api
git commit -m "Ajout automatique des seeds et protection anti-abus"
git push
```

Render reconstruira automatiquement le backend. Après publication, vérifier `/health`, `/db-health`, la connexion Google, la sauvegarde d’un questionnaire et un import de fiche.
