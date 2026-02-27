# GamePedia TG — Documentation des routes API

Toutes les routes sont sous `/api/`. Le préfixe complet est `/api/[route]`.

---

## Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/register` | Créer un compte utilisateur |
| `POST` | `/api/auth/login` | Connexion — retourne un token JWT |
| `POST` | `/api/auth/logout` | Déconnexion (invalide le token) |
| `GET` | `/api/auth/me` | Récupérer le profil de l'utilisateur connecté |
| `PATCH` | `/api/auth/me` | Mettre à jour son profil |
| `POST` | `/api/auth/password/reset` | Demander une réinitialisation de mot de passe |
| `POST` | `/api/auth/password/confirm` | Confirmer le nouveau mot de passe |

---

## Joueurs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/players` | Lister tous les joueurs (filtres : game, city, search) |
| `POST` | `/api/players` | Créer un profil joueur (auth requis) |
| `GET` | `/api/players/[pseudo]` | Profil complet d'un joueur |
| `PATCH` | `/api/players/[pseudo]` | Mettre à jour son profil (propriétaire ou admin) |
| `DELETE` | `/api/players/[pseudo]` | Supprimer un joueur (admin) |
| `GET` | `/api/players/[pseudo]/stats` | Stats de carrière globales par jeu |
| `GET` | `/api/players/[pseudo]/performances` | Historique des performances match par match |
| `GET` | `/api/players/[pseudo]/tournaments` | Tous les tournois auxquels il a participé |
| `GET` | `/api/players/[pseudo]/teams` | Historique des équipes |
| `GET` | `/api/players/[pseudo]/achievements` | Achievements débloqués |
| `GET` | `/api/players/[pseudo]/rankings` | Positions dans les classements |

---

## Jeux

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/games` | Lister tous les jeux actifs |
| `POST` | `/api/games` | Ajouter un jeu (admin) |
| `GET` | `/api/games/[slug]` | Détails d'un jeu |
| `PATCH` | `/api/games/[slug]` | Mettre à jour un jeu (admin) |
| `DELETE` | `/api/games/[slug]` | Désactiver un jeu (admin) |
| `GET` | `/api/games/[slug]/tournaments` | Tournois de ce jeu |
| `GET` | `/api/games/[slug]/players` | Joueurs inscrits sur ce jeu |
| `GET` | `/api/games/[slug]/rankings` | Classement général de ce jeu (toutes saisons) |

---

## Équipes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/teams` | Lister toutes les équipes |
| `POST` | `/api/teams` | Créer une équipe (auth requis) |
| `GET` | `/api/teams/[slug]` | Détails d'une équipe |
| `PATCH` | `/api/teams/[slug]` | Modifier une équipe (capitaine ou admin) |
| `DELETE` | `/api/teams/[slug]` | Supprimer une équipe (admin) |
| `GET` | `/api/teams/[slug]/members` | Membres actuels et historique |
| `POST` | `/api/teams/[slug]/members` | Ajouter un membre (capitaine ou admin) |
| `PATCH` | `/api/teams/[slug]/members/[playerId]` | Modifier le rôle ou retirer un membre |
| `GET` | `/api/teams/[slug]/tournaments` | Tournois de l'équipe |
| `GET` | `/api/teams/[slug]/stats` | Stats et palmarès de l'équipe |
| `GET` | `/api/teams/[slug]/rankings` | Position dans les classements |

---

## Tournois

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/tournaments` | Lister les tournois (filtres : status, game, tier, year) |
| `POST` | `/api/tournaments` | Créer un tournoi (mod/admin) |
| `GET` | `/api/tournaments/[slug]` | Détails complets d'un tournoi |
| `PATCH` | `/api/tournaments/[slug]` | Modifier un tournoi (mod/admin) |
| `DELETE` | `/api/tournaments/[slug]` | Supprimer un tournoi (admin) |
| `PATCH` | `/api/tournaments/[slug]/status` | Changer le statut (UPCOMING → ONGOING → COMPLETED) |
| `GET` | `/api/tournaments/[slug]/participants` | Liste des participants inscrits |
| `POST` | `/api/tournaments/[slug]/participants` | S'inscrire à un tournoi |
| `DELETE` | `/api/tournaments/[slug]/participants/[id]` | Retirer une inscription (admin) |
| `POST` | `/api/tournaments/[slug]/participants/[id]/confirm` | Confirmer l'inscription (admin) |
| `GET` | `/api/tournaments/[slug]/stages` | Toutes les phases du tournoi |
| `POST` | `/api/tournaments/[slug]/stages` | Créer une phase (mod/admin) |
| `GET` | `/api/tournaments/[slug]/stages/[stageId]` | Détails d'une phase |
| `GET` | `/api/tournaments/[slug]/stages/[stageId]/matches` | Matchs d'une phase |
| `POST` | `/api/tournaments/[slug]/stages/[stageId]/matches` | Créer un match (mod/admin) |
| `GET` | `/api/tournaments/[slug]/bracket` | Bracket complet (toutes phases) |
| `GET` | `/api/tournaments/[slug]/results` | Résultats finaux + distribution des prix |

---

## Matchs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/matches/[id]` | Détails d'un match |
| `PATCH` | `/api/matches/[id]` | Mettre à jour un match (score, statut) (mod/admin) |
| `GET` | `/api/matches/[id]/performances` | Stats des joueurs pour ce match |
| `POST` | `/api/matches/[id]/performances` | Saisir les stats des joueurs (mod/admin) |
| `PATCH` | `/api/matches/[id]/performances/[playerId]` | Modifier les stats d'un joueur |

---

## Classements

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/rankings` | Classements toutes saisons actives (groupés par jeu) |
| `GET` | `/api/rankings/[gameSlug]` | Classement d'un jeu — saison active |
| `GET` | `/api/rankings/[gameSlug]/seasons` | Toutes les saisons d'un jeu |
| `GET` | `/api/rankings/[gameSlug]/[seasonId]` | Classement d'un jeu pour une saison précise |
| `POST` | `/api/rankings/recalculate` | Recalculer tous les classements (admin) |
| `POST` | `/api/rankings/[gameSlug]/[seasonId]/recalculate` | Recalculer un classement précis (admin) |

---

## Saisons

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/seasons` | Lister toutes les saisons |
| `POST` | `/api/seasons` | Créer une saison (admin) |
| `GET` | `/api/seasons/[id]` | Détails d'une saison |
| `PATCH` | `/api/seasons/[id]` | Modifier une saison (admin) |
| `POST` | `/api/seasons/[id]/activate` | Activer une saison (admin) |
| `POST` | `/api/seasons/[id]/close` | Clôturer une saison (admin) |

---

## Règles de points

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/point-rules` | Lister les règles (filtres : game, season, tier) |
| `POST` | `/api/point-rules` | Créer une règle (admin) |
| `PATCH` | `/api/point-rules/[id]` | Modifier une règle (admin) |
| `DELETE` | `/api/point-rules/[id]` | Supprimer une règle (admin) |
| `GET` | `/api/point-rules/preview` | Simuler les points pour un tournoi donné |

---

## Attributions de points

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/point-attributions/tournament/[slug]` | Attribuer les points après un tournoi (admin) |
| `GET` | `/api/point-attributions/tournament/[slug]` | Voir les attributions d'un tournoi |
| `DELETE` | `/api/point-attributions/[id]` | Annuler une attribution (admin) |

---

## Achievements

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/achievements` | Lister tous les achievements |
| `POST` | `/api/achievements` | Créer un achievement (admin) |
| `POST` | `/api/achievements/award` | Attribuer un achievement à un joueur (admin) |
| `DELETE` | `/api/achievements/award/[id]` | Retirer un achievement (admin) |

---

## Articles & News

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/articles` | Lister les articles publiés |
| `POST` | `/api/articles` | Créer un article (mod/admin) |
| `GET` | `/api/articles/[slug]` | Lire un article |
| `PATCH` | `/api/articles/[slug]` | Modifier un article (mod/admin) |
| `DELETE` | `/api/articles/[slug]` | Supprimer un article (mod/admin) |
| `POST` | `/api/articles/[slug]/publish` | Publier un article (mod/admin) |

---

## Administration

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/admin/dashboard` | Statistiques globales de la plateforme |
| `GET` | `/api/admin/users` | Gestion des utilisateurs |
| `PATCH` | `/api/admin/users/[id]/role` | Changer le rôle d'un utilisateur |
| `POST` | `/api/admin/users/[id]/verify` | Vérifier un joueur |
| `GET` | `/api/admin/logs` | Logs d'activité admin |
| `POST` | `/api/admin/import` | Import bulk de données (CSV/JSON) |

---

## Upload de médias

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/upload/avatar` | Upload d'un avatar (joueur/équipe) |
| `POST` | `/api/upload/banner` | Upload d'un banner |
| `POST` | `/api/upload/logo` | Upload d'un logo de tournoi/équipe/jeu |

---

> **Authentification** : Les routes protégées nécessitent un header `Authorization: Bearer <token>`.
> **Pagination** : Les routes de liste acceptent les params `?page=1&limit=20`.
> **Filtres** : Les routes de liste acceptent des query params de filtre spécifiques à chaque ressource.
