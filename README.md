# NHA Digital Cloud

Plateforme tout-en-un : Académie, Réunions, Boutique, Social, Assistant IA.
Stack : React + Vite + TypeScript, Supabase (comptes, base de données), GitHub Pages (hébergement).

## Mise en route

- [ ] 1. Supabase : créer un nouveau projet (ou utiliser un projet dédié à NHA Digital Cloud)
- [ ] 2. Supabase > SQL Editor : coller le contenu de `supabase/schema.sql` puis Run
- [ ] 3. Supabase > Project Settings > API : copier l'URL du projet et la clé `anon`
- [ ] 4. GitHub : créer le dépôt, puis envoyer tous les fichiers (Add file > Upload files)
- [ ] 5. GitHub > Settings > Secrets and variables > Actions : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- [ ] 6. GitHub > Settings > Pages > Source : choisir « GitHub Actions »
- [ ] 7. GitHub > Actions : lancer « Deploy NHA Digital Cloud » (ou refaire un commit)
- [ ] 8. Ouvrir l'adresse affichée par le déploiement et créer le premier compte : il devient administrateur automatiquement
- [ ] 9. Les comptes suivants sont « en attente » : l'administrateur leur attribue un rôle dans l'onglet Utilisateurs

## En local (Windows)

```
copy .env.example .env      (puis remplir les deux valeurs)
npm install
npm run dev
```

## Contenu actuel

- Connexion, inscription, validation des comptes par l'administrateur
- Académie : liste, ajout et suppression de cours (administrateur et enseignant)
- Réunions, Boutique, Social, Assistant IA : pages réservées, à construire module par module

## Dépôt privé et Pages

GitHub Pages sur un dépôt privé exige un abonnement payant. Avec un compte gratuit, le dépôt doit être public
(sans problème pour la clé `anon`, qui est faite pour être publique ; la sécurité repose sur les règles RLS du schéma SQL).
