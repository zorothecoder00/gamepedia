# GamePedia TG — Documentation des Pages

Structure complète des pages Next.js (App Router).

---

## Pages publiques

### `/` — Page d'accueil ✅ (codée)
Vitrine de la plateforme.
- Hero avec slogan et statistiques clés
- Tournois en vedette (upcoming + récents)
- Top classements par jeu
- Joueurs mis en avant
- Dernières actualités
- Appel à l'action (inscription)

---

### `/games` — Catalogue des jeux
Liste de tous les jeux disponibles sur la plateforme.
- Grille de cartes par jeu (logo, nom, genre, nb joueurs, nb tournois)
- Filtre par plateforme (PC, Mobile, Console)

### `/games/[slug]` — Page d'un jeu
- Header : bannière, logo, description
- Onglets :
  - **Vue d'ensemble** : derniers résultats, tournois à venir
  - **Classement** : top 20 joueurs/équipes de la saison active
  - **Tournois** : tous les tournois du jeu (avec filtre par statut)
  - **Joueurs** : tous les joueurs inscrits
- Sélecteur de saison

---

### `/players` — Annuaire des joueurs
- Grille/liste de joueurs avec avatar, pseudo, ville, jeux pratiqués
- Recherche par pseudo ou nom
- Filtre par jeu, ville, région

### `/players/[pseudo]` — Profil d'un joueur
- Header : avatar, pseudo, bio, réseaux sociaux, badges de vérification
- Statistiques globales (points totaux, tournois joués, wins, prize money)
- Onglets :
  - **Profil** : présentation, jeux, équipe actuelle
  - **Palmarès** : classements dans les podiums de tournois
  - **Historique** : tous les matchs / tournois (avec résultats)
  - **Statistiques** : graphiques de progression (points dans le temps, K/D, etc.)
  - **Achievements** : badges gagnés

---

### `/teams` — Liste des équipes
- Cartes par équipe (logo, tag, ville, jeux)
- Filtre par jeu, région

### `/teams/[slug]` — Page d'une équipe
- Header : logo, banner, tag, ville, date de création
- Roster actuel (avatars + rôles des joueurs)
- Palmarès
- Historique des tournois
- Statistiques de l'équipe

---

### `/tournaments` — Liste des tournois
- Filtres : statut (À venir / En cours / Terminé), jeu, tier, année, format
- Liste avec cards : nom, logo, dates, jeu, prize pool, nb participants
- Vue calendrier (optionnelle)

### `/tournaments/[slug]` — Page d'un tournoi
- Header : banner, nom, dates, lieu, prize pool, tier badge
- Onglets :
  - **Infos** : description, règlement, organisateur, sponsors
  - **Participants** : liste des équipes/joueurs inscrits
  - **Bracket** : arbre d'élimination ou tableau de poules (interactif)
  - **Résultats** : résultats match par match
  - **Podium** : classement final + distribution des prix

### `/tournaments/[slug]/bracket` — Bracket interactif
- Visualisation du bracket en plein écran
- Mise à jour en temps réel (si tournoi en cours)

---

### `/rankings` — Page de classements généraux
- Vue d'ensemble : top 5 de chaque jeu actif
- Liens vers les classements complets par jeu

### `/rankings/[gameSlug]` — Classement d'un jeu
- Tableau de classement avec : rang, mouvement (+/-), avatar, pseudo, points, wins, tournois joués, prize money
- Sélecteur de saison
- Graphique d'évolution du top 5

### `/rankings/[gameSlug]/[seasonId]` — Classement saison spécifique
- Même structure que ci-dessus, fixé sur une saison précise
- Résumé de la saison (tournois inclus, total prize pool distribué)

---

### `/news` — Actualités
- Grille d'articles (cover, titre, extrait, date, tags)
- Filtre par jeu, catégorie

### `/news/[slug]` — Article
- Contenu complet en Markdown rendu
- Articles liés

---

## Pages d'authentification

### `/auth/login` — Connexion
- Formulaire email + mot de passe
- Lien "Mot de passe oublié"

### `/auth/register` — Inscription
- Formulaire : email, username, mot de passe
- Lien pour créer un profil joueur après inscription

### `/auth/reset-password` — Réinitialisation du mot de passe
### `/auth/verify-email` — Vérification de l'email

---

## Espace personnel (auth requis)

### `/profile` — Mon profil
- Voir et modifier son profil joueur
- Paramètres de compte

### `/profile/edit` — Édition du profil
- Formulaire complet : avatar, bio, pseudo, jeux, réseaux sociaux

---

## Administration (role ADMIN / MODERATOR)

### `/admin` — Dashboard admin
- KPIs : joueurs, tournois, matchs, articles
- Graphiques d'activité
- Dernières actions

### `/admin/players` — Gestion des joueurs
- Liste + recherche
- Actions : vérifier, suspendre, supprimer

### `/admin/games` — Gestion des jeux
- Ajouter, modifier, activer/désactiver

### `/admin/tournaments` — Gestion des tournois
- Créer, modifier, changer le statut
- Gérer les participants
- Saisir les résultats

### `/admin/tournaments/[slug]/matches` — Saisie des résultats
- Interface pour renseigner scores et stats de chaque match

### `/admin/teams` — Gestion des équipes
- Valider, modifier, désactiver

### `/admin/rankings` — Gestion des classements
- Voir les saisons, activer/clôturer
- Déclencher un recalcul

### `/admin/point-rules` — Règles de points
- Tableau par jeu et par tier
- Ajouter, modifier, supprimer des règles
- Simulateur de points

### `/admin/articles` — Gestion des articles
- Éditeur Markdown avec preview
- Publier / dépublier

### `/admin/users` — Gestion des utilisateurs
- Modifier les rôles (VISITOR → PLAYER → MODERATOR → ADMIN)
- Désactiver des comptes

---

## Pages d'erreur

### `/not-found` — 404
### `/error` — Erreur générale

---

## Composants partagés (non des pages mais à développer)

- `Navbar` : navigation principale + bouton connexion
- `Footer` : liens, réseaux, mention légale
- `PlayerCard` : card d'un joueur
- `TournamentCard` : card d'un tournoi
- `BracketViewer` : visualisation des brackets
- `RankingTable` : tableau de classement
- `MatchCard` : résumé d'un match
- `StatsChart` : graphiques de performances
- `GameTag` : badge d'un jeu
- `TierBadge` : badge Tier S/A/B/C
