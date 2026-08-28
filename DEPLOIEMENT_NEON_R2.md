# Jalon Neon + Cloudflare R2

Le backend accepte désormais :

- PostgreSQL local via `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` ;
- Neon via `DATABASE_URL` et TLS ;
- le disque local avec `STORAGE_DRIVER=local` ;
- le bucket R2 privé `pokemon` avec `STORAGE_DRIVER=r2`.

Les URLs du frontend ne changent pas. L’API contrôle toujours les droits d’accès, puis lit le fichier dans R2. Il n’est donc pas nécessaire de rendre le bucket public ni de configurer un domaine R2 ou une règle CORS.

## 1. Charger la structure dans Neon

Le fichier `apps-api/schema/current_schema.sql` est une copie portable du schéma fourni, sans données et sans commandes propres à PostgreSQL 18.

Pour une base Neon vide :

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps-api/schema/current_schema.sql
```

Ne lancez pas ensuite les anciennes migrations `20260828_*.sql` : leurs changements sont déjà présents dans ce schéma courant.

Contrôle rapide dans l’éditeur SQL Neon :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessments'
  AND column_name IN (
    'evolution_reward_decided_at',
    'evolution_seed_pdf_created_at',
    'evolution_reward_revealed_at'
  )
ORDER BY column_name;
```

Attention : `current_schema.sql` ne contient aucun compte, questionnaire ou Pokémon existant. Pour conserver les données locales, il faudra aussi produire puis importer un dump de données avant la mise en ligne.

## 2. Créer les variables Koyeb

Copiez les noms de `apps-api/.env.production.example` dans les variables d’environnement du service Koyeb et remplacez uniquement les valeurs factices.

Points à respecter :

- utilisez de préférence l’URL **pooled** de Neon ;
- conservez `sslmode=require`, `DB_SSL=true` et `DB_SSL_REJECT_UNAUTHORIZED=true` ;
- utilisez `R2_ENDPOINT=https://ACCOUNT_ID.eu.r2.cloudflarestorage.com` pour la juridiction UE ;
- `R2_BUCKET_NAME` vaut exactement `pokemon` ;
- le jeton R2 doit autoriser la lecture et l’écriture d’objets uniquement sur ce bucket ;
- ne placez jamais ces valeurs dans GitHub ou dans les variables `VITE_*` du frontend.

## 3. Tester Neon et R2 avant le déploiement

Dans `apps-api`, créez temporairement un `.env` local contenant les variables de production, puis lancez :

```bash
npm run cloud:check
```

Le contrôle :

1. ouvre une connexion TLS vers Neon ;
2. écrit un petit objet temporaire dans R2 ;
3. le relit et vérifie son contenu ;
4. le supprime.

Résultat attendu : deux lignes `Neon OK` et `R2 OK`.

## 4. Transférer d’anciens fichiers locaux, si nécessaire

Si l’ancienne installation contient déjà des dossiers créatifs ou des fiches Pokédex, placez ses dossiers `generated-dossiers` et `uploads` dans `apps-api`, utilisez la base contenant les enregistrements correspondants et lancez :

```bash
npm run storage:migrate
```

Le script peut être relancé : les mêmes clés R2 sont simplement remplacées. Ne supprimez les fichiers locaux qu’après avoir testé leur ouverture depuis l’application configurée avec R2.

## 5. Préparer GitHub, Koyeb et Netlify

Le dépôt contient maintenant :

- `apps-api/Dockerfile` pour le backend et Chromium/Playwright ;
- `netlify.toml` pour compiler le frontend et gérer les routes React ;
- `.gitignore` pour exclure secrets, dépendances et fichiers utilisateurs ;
- `apps-web/.env.production.example` pour les variables Netlify.
- `.github/workflows/ci.yml` pour tester automatiquement le backend et compiler le frontend à chaque push ou pull request.

Le démarrage du backend en production est volontairement interrompu si un secret manque, si une URL n’utilise pas HTTPS, si `DATABASE_URL` n’est pas une URL PostgreSQL ou si R2 n’est pas activé. Cela évite un déploiement apparemment réussi mais inutilisable.

Sur Koyeb, construisez `apps-api/Dockerfile` avec `apps-api` comme dossier de travail/contexte. Après création du service, vérifiez :

```text
https://VOTRE-API.koyeb.app/health
https://VOTRE-API.koyeb.app/db-health
```

Sur Netlify, le fichier `netlify.toml` configure le dossier `apps-web`. Ajoutez `VITE_API_URL` avec l’URL HTTPS Koyeb, puis déclenchez un nouveau build.

## 6. Terminer OAuth et le parcours complet

Quand les deux URL définitives existent :

1. mettez `FRONTEND_URL` et `WEB_ORIGIN` sur l’URL Netlify, sans barre oblique finale ;
2. mettez `GOOGLE_CALLBACK_URL` sur `https://VOTRE-API.koyeb.app/api/v1/auth/google/callback` ;
3. ajoutez exactement cette URI dans les URI de redirection autorisées de Google OAuth ;
4. redéployez le backend ;
5. testez connexion, reprise du questionnaire, génération, téléchargement, import des deux fiches, publication et Pokéball.

En production, le cookie est automatiquement configuré en `SameSite=None; Secure`, condition nécessaire entre les domaines Netlify et Koyeb.

## Secrets

Avant de pousser le dépôt, remplacez les secrets qui ont déjà existé dans un ancien fichier `.env` (mot de passe PostgreSQL, secret de session et secret Google OAuth). Vérifiez ensuite que `git status` ne propose aucun fichier `.env`.
