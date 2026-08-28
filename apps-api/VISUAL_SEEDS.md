# Ajouter une seed visuelle depuis GitHub

Les nouvelles seeds JPEG sont détectées automatiquement au démarrage du backend. Il n’est plus nécessaire de modifier `visualSeedLibrary.json` ni un compteur de test.

1. Dans GitHub, ouvrir `apps-api/assets/visual-seeds`.
2. Ouvrir le dossier de l’animal concerné, par exemple `loup`.
3. Utiliser **Add file**, puis **Upload files**.
4. Ajouter une image `.jpg` ou `.jpeg` avec un nom inédit.
5. Valider le commit sur `main`.
6. Attendre le redéploiement automatique de Render.

Exemple :

```text
apps-api/assets/visual-seeds/loup/seed-019.jpg
```

Règles :

- utiliser uniquement JPEG/JPG, car le PDF évolutif incorpore directement le JPEG sans recompression ;
- ne jamais renommer ou supprimer une seed déjà utilisée ;
- ne pas réutiliser le nom d’un autre fichier du même animal ;
- préférer des noms simples comme `seed-019.jpg` ;
- conserver l’image en pleine résolution.

Le catalogue JSON historique reste prioritaire. La découverte automatique ajoute seulement les fichiers JPEG encore absents du catalogue.
