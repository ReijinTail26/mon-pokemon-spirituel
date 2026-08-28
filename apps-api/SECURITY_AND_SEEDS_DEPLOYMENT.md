# Déploiement — seeds automatiques et protections API

## Prérequis Render

La variable suivante doit rester exactement configurée avec l’origine publique du frontend :

```text
WEB_ORIGIN=https://mon-pokemon-spirituel.netlify.app
```

Aucune nouvelle variable secrète ni migration Neon n’est requise.

## Protections ajoutées

- en-têtes HTTP de sécurité avec Helmet ;
- limitation générale à 300 requêtes par tranche de 5 minutes et par adresse IP ;
- limitation OAuth à 20 tentatives par tranche de 15 minutes ;
- limitation à 20 nouveaux questionnaires par heure et par utilisateur ;
- limitation à 8 lancements de génération par heure et par utilisateur ;
- limitation à 20 imports de fiches par heure et par utilisateur ;
- limitation à 60 actions de like par minute et par utilisateur ;
- limitation des téléchargements et des contrôles de santé ;
- corps JSON limité à 64 Ko et images limitées à 15 Mo ;
- contrôle de l’origine des opérations qui modifient les données ;
- délais serveur contre les connexions volontairement incomplètes.

Les compteurs sont conservés en mémoire par l’instance Render. Ils conviennent à l’instance unique actuelle. Un DDoS massif doit être filtré par l’hébergeur ou par un proxy Cloudflare placé devant l’API ; les limites Express protègent principalement les ressources applicatives et la base de données.

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
