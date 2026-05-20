import { MatchStatus, TournamentStatus } from "@prisma/client";
import { db } from "./prisma";

// ── Helpers ───────────────────────────────────────────────────

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

// ── Types exportés ────────────────────────────────────────────

export type ActionColorKey = "gold" | "green" | "blue" | "purple" | "red" | "muted";

export interface DashboardKpis {
  players: { value: number; deltaMonth: number };
  tournaments: { value: number; deltaMonth: number };
  matches: { value: number; deltaWeek: number };
  articles: { value: number; deltaMonth: number };
}

export interface DashboardSectionCounts {
  players: number;
  tournaments: number;
  teams: number;
  games: number;
  articles: number;
  users: number;
}

export interface OngoingTournament {
  id: string;
  name: string;
  game: string;
  tier: string;
  matchesLeft: number;
}

export interface RecentAction {
  type: string;
  detail: string;
  user: string;
  time: string;
  colorKey: ActionColorKey;
}

export interface AdminDashboardData {
  kpis: DashboardKpis;
  sectionCounts: DashboardSectionCounts;
  ongoingTournaments: OngoingTournament[];
  recentActions: RecentAction[];
}

// ── Mapping couleur par action d'audit ───────────────────────

const ACTION_COLOR_MAP: Record<string, ActionColorKey> = {
  CREATE: "gold",
  UPDATE: "blue",
  DELETE: "red",
  VERIFY: "green",
  SUSPEND: "red",
  UNSUSPEND: "green",
  PUBLISH: "purple",
  UNPUBLISH: "muted",
  RECALCULATE_RANKING: "blue",
  CANCEL: "muted",
  RESTORE: "green",
};

const ACTION_LABEL_MAP: Record<string, Record<string, string>> = {
  PLAYER: {
    CREATE: "Joueur inscrit",
    UPDATE: "Joueur modifié",
    DELETE: "Joueur supprimé",
    VERIFY: "Joueur vérifié",
    SUSPEND: "Joueur suspendu",
    UNSUSPEND: "Suspension levée",
  },
  TEAM: {
    CREATE: "Équipe créée",
    UPDATE: "Équipe modifiée",
    DELETE: "Équipe supprimée",
    SUSPEND: "Équipe suspendue",
    UNSUSPEND: "Suspension levée",
  },
  TOURNAMENT: {
    CREATE: "Tournoi créé",
    UPDATE: "Tournoi modifié",
    DELETE: "Tournoi supprimé",
    CANCEL: "Tournoi annulé",
  },
  MATCH: {
    CREATE: "Match programmé",
    UPDATE: "Résultat saisi",
    CANCEL: "Match annulé",
  },
  ARTICLE: {
    CREATE: "Article créé",
    PUBLISH: "Article publié",
    UNPUBLISH: "Article dépublié",
    DELETE: "Article supprimé",
  },
  USER: {
    CREATE: "Utilisateur créé",
    UPDATE: "Rôle modifié",
    DELETE: "Utilisateur supprimé",
  },
  GAME: {
    CREATE: "Jeu ajouté",
    UPDATE: "Jeu modifié",
  },
  SEASON: {
    CREATE: "Saison créée",
    RECALCULATE_RANKING: "Classement recalculé",
  },
};

function getActionLabel(entityType: string, action: string): string {
  return ACTION_LABEL_MAP[entityType]?.[action] ?? `${action} (${entityType})`;
}

// ── Requête principale ────────────────────────────────────────

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const monthStart = startOfMonth();
  const weekStart = startOfWeek();

  const [
    playerCount,
    playerDeltaMonth,
    tournamentCount,
    tournamentDeltaMonth,
    matchCount,
    matchDeltaWeek,
    articleCount,
    articleDeltaMonth,
    teamCount,
    gameCount,
    userCount,
    ongoingRaw,
    recentLogs,
  ] = await Promise.all([
    db.player.count({ where: { isActive: true } }),
    db.player.count({ where: { createdAt: { gte: monthStart } } }),
    db.tournament.count(),
    db.tournament.count({ where: { createdAt: { gte: monthStart } } }),
    db.match.count({ where: { status: MatchStatus.COMPLETED } }),
    db.match.count({
      where: { status: MatchStatus.COMPLETED, endedAt: { gte: weekStart } },
    }),
    db.article.count({ where: { isPublished: true } }),
    db.article.count({
      where: { isPublished: true, publishedAt: { gte: monthStart } },
    }),
    db.team.count({ where: { isActive: true } }),
    db.game.count({ where: { isActive: true } }),
    db.user.count(),

    // Tournois en cours avec leurs matchs restants
    db.tournament.findMany({
      where: { status: TournamentStatus.ONGOING },
      select: {
        id: true,
        name: true,
        tier: true,
        games: {
          select: { game: { select: { name: true } } },
          take: 1,
        },
        stages: {
          select: {
            _count: {
              select: {
                matches: { where: { status: MatchStatus.SCHEDULED } },
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { startDate: "desc" },
    }),

    // Dernières actions depuis AuditLog (source de vérité)
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        action: true,
        entityType: true,
        entityName: true,
        actorName: true,
        createdAt: true,
      },
    }),
  ]);

  // ── KPIs ──────────────────────────────────────────────────

  const kpis: DashboardKpis = {
    players: { value: playerCount, deltaMonth: playerDeltaMonth },
    tournaments: { value: tournamentCount, deltaMonth: tournamentDeltaMonth },
    matches: { value: matchCount, deltaWeek: matchDeltaWeek },
    articles: { value: articleCount, deltaMonth: articleDeltaMonth },
  };

  // ── Counts sections ───────────────────────────────────────

  const sectionCounts: DashboardSectionCounts = {
    players: playerCount,
    tournaments: tournamentCount,
    teams: teamCount,
    games: gameCount,
    articles: articleCount,
    users: userCount,
  };

  // ── Tournois en cours ─────────────────────────────────────

  const ongoingTournaments: OngoingTournament[] = ongoingRaw.map((t) => ({
    id: t.id,
    name: t.name,
    game: t.games[0]?.game.name ?? "Multi-jeux",
    tier: t.tier as string,
    matchesLeft: t.stages.reduce((sum, s) => sum + s._count.matches, 0),
  }));

  // ── Dernières actions depuis AuditLog ─────────────────────

  const recentActions: RecentAction[] = recentLogs.map((log) => ({
    type: getActionLabel(log.entityType, log.action),
    detail: log.entityName ?? "—",
    user: log.actorName ?? "Système",
    time: formatRelative(log.createdAt),
    colorKey: ACTION_COLOR_MAP[log.action] ?? "muted",
  }));

  return { kpis, sectionCounts, ongoingTournaments, recentActions };
}
