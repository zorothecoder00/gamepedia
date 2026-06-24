import Link from "next/link";
import {
  type ActionColorKey,
  formatNumber,
  getAdminDashboardData,
} from "@/lib/admin-dashboard";

// ── Config statique de navigation (pas des données) ──────────

const KPI_CONFIG = [ 
  {  
    key: "players" as const,
    label: "Joueurs inscrits",
    icon: "👤",
    color: "text-[var(--accent-green)]",
    bg: "bg-[rgba(0,230,118,0.08)]",
    border: "border-[rgba(0,230,118,0.2)]",
    deltaLabel: (n: number) => `+${n} ce mois`,
  },
  {
    key: "tournaments" as const,
    label: "Tournois total",
    icon: "🏆",
    color: "text-[var(--accent-gold)]",
    bg: "bg-[rgba(255,215,0,0.08)]",
    border: "border-[rgba(255,215,0,0.2)]",
    deltaLabel: (n: number) => `+${n} ce mois`,
  },
  {
    key: "matches" as const,
    label: "Matchs joués",
    icon: "⚔️",
    color: "text-[var(--accent-blue)]",
    bg: "bg-[rgba(79,195,247,0.08)]",
    border: "border-[rgba(79,195,247,0.2)]",
    deltaLabel: (n: number) => `+${n} cette semaine`,
  },
  {
    key: "articles" as const,
    label: "Articles publiés",
    icon: "📰",
    color: "text-[var(--tier-a)]",
    bg: "bg-[rgba(155,89,182,0.08)]",
    border: "border-[rgba(155,89,182,0.2)]",
    deltaLabel: (n: number) => `+${n} ce mois`,
  },
];

const ADMIN_SECTIONS = [
  { href: "/admin/players",     label: "Joueurs",           description: "Vérifier, suspendre, supprimer",        icon: "👤", countKey: "players"     as const },
  { href: "/admin/tournaments", label: "Tournois",          description: "Créer, modifier, gérer les inscriptions", icon: "🏆", countKey: "tournaments" as const },
  { href: "/admin/teams",       label: "Équipes",           description: "Valider, modifier, désactiver",          icon: "🛡️", countKey: "teams"       as const },
  { href: "/admin/games",       label: "Jeux",              description: "Ajouter, activer/désactiver",            icon: "🎮", countKey: "games"       as const },
  { href: "/admin/rankings",    label: "Classements",       description: "Saisons, recalcul des points",           icon: "📊", countKey: null },
  { href: "/admin/point-rules", label: "Règles de points",  description: "Par jeu, tier et placement",             icon: "⚙️", countKey: null },
  { href: "/admin/articles",    label: "Articles",          description: "Rédiger, publier, dépublier",            icon: "📰", countKey: "articles"    as const },
  { href: "/admin/disputes",    label: "Litiges paris",     description: "Arbitrer les défis contestés",           icon: "⚖️", countKey: null },
  { href: "/admin/users",       label: "Utilisateurs",      description: "Rôles et accès",                         icon: "🔑", countKey: "users"       as const },
];

const ACTION_DOT: Record<ActionColorKey, string> = {
  gold:   "bg-[var(--accent-gold)]",
  green:  "bg-[var(--accent-green)]",
  blue:   "bg-[var(--accent-blue)]",
  purple: "bg-[var(--tier-a)]",
  red:    "bg-[var(--accent-red)]",
  muted:  "bg-[var(--text-muted)]",
};

// ── Page admin (Server Component) ────────────────────────────

export default async function AdminDashboard() {
  const { kpis, sectionCounts, ongoingTournaments, recentActions } =
    await getAdminDashboardData();

  const kpiValues = {
    players:     { value: kpis.players.value,     delta: kpis.players.deltaMonth },
    tournaments: { value: kpis.tournaments.value, delta: kpis.tournaments.deltaMonth },
    matches:     { value: kpis.matches.value,     delta: kpis.matches.deltaWeek },
    articles:    { value: kpis.articles.value,    delta: kpis.articles.deltaMonth },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(255,68,68,0.1)] border border-[rgba(255,68,68,0.25)] text-[var(--accent-red)]">
                ADMIN
              </span>
            </div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              GamePedia TG
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Voir le site
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CONFIG.map((kpi) => {
            const { value, delta } = kpiValues[kpi.key];
            return (
              <div key={kpi.key} className={`rounded-xl p-5 border ${kpi.bg} ${kpi.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className={`text-3xl font-black ${kpi.color}`}>
                    {formatNumber(value)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{kpi.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {delta > 0 ? kpi.deltaLabel(delta) : "Aucun ajout récent"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Sections de gestion */}
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Gestion</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ADMIN_SECTIONS.map((s) => {
                const count = s.countKey !== null ? sectionCounts[s.countKey] : null;
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-bright)] hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors">
                          {s.label}
                        </p>
                        {count !== null && (
                          <span className="text-xs font-bold text-[var(--text-muted)]">
                            {formatNumber(count)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">{s.description}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-green)] transition-colors shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </Link>
                );
              })}
            </div>

            {/* Tournois en cours */}
            {ongoingTournaments.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
                  Tournois en cours
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[rgba(0,230,118,0.1)] text-[var(--accent-green)]">
                    {ongoingTournaments.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {ongoingTournaments.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {t.game} · Tier {t.tier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[var(--accent-blue)]">{t.matchesLeft}</p>
                          <p className="text-xs text-[var(--text-muted)]">matchs restants</p>
                        </div>
                        <Link
                          href="/admin/tournaments"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] hover:bg-[rgba(0,230,118,0.2)] transition-colors"
                        >
                          Gérer
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dernières actions */}
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Dernières actions</h2>
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
              {recentActions.length === 0 ? (
                <p className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
                  Aucune action enregistrée
                </p>
              ) : (
                recentActions.map((action, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3.5 ${
                      i < recentActions.length - 1 ? "border-b border-[var(--border)]" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ACTION_DOT[action.colorKey]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{action.type}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{action.detail}</p>
                      <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                        {action.user} · {action.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="px-4 py-3 border-t border-[var(--border)]">
                <Link
                  href="/admin/logs"
                  className="text-xs font-semibold text-[var(--accent-green)] hover:opacity-80 transition-opacity"
                >
                  Voir tous les logs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
