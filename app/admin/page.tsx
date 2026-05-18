import Link from "next/link";

// ─── Données de démo ─────────────────────────────────────────

const KPIS = [
  { label: "Joueurs inscrits", value: "248", delta: "+12 ce mois", icon: "👤", color: "text-[var(--accent-green)]", bg: "bg-[rgba(0,230,118,0.08)]", border: "border-[rgba(0,230,118,0.2)]" },
  { label: "Tournois total", value: "34", delta: "+3 ce mois", icon: "🏆", color: "text-[var(--accent-gold)]", bg: "bg-[rgba(255,215,0,0.08)]", border: "border-[rgba(255,215,0,0.2)]" },
  { label: "Matchs joués", value: "1 247", delta: "+89 cette semaine", icon: "⚔️", color: "text-[var(--accent-blue)]", bg: "bg-[rgba(79,195,247,0.08)]", border: "border-[rgba(79,195,247,0.2)]" },
  { label: "Articles publiés", value: "56", delta: "+4 ce mois", icon: "📰", color: "text-[var(--tier-a)]", bg: "bg-[rgba(155,89,182,0.08)]", border: "border-[rgba(155,89,182,0.2)]" },
];

const RECENT_ACTIONS = [
  { type: "Tournoi créé", detail: "Togo Valorant Open S3", user: "Admin", time: "Il y a 2h", color: "bg-[var(--accent-gold)]" },
  { type: "Joueur vérifié", detail: "Phantom_TG", user: "Moderator1", time: "Il y a 3h", color: "bg-[var(--accent-green)]" },
  { type: "Résultat saisi", detail: "Valorant Open S2 — Finale", user: "Admin", time: "Il y a 5h", color: "bg-[var(--accent-blue)]" },
  { type: "Article publié", detail: "Récap semaine #12", user: "Moderator1", time: "Il y a 6h", color: "bg-[var(--tier-a)]" },
  { type: "Équipe suspendue", detail: "Team Shadow", user: "Admin", time: "Hier", color: "bg-[var(--accent-red)]" },
  { type: "Saison clôturée", detail: "Saison 2024 — Valorant", user: "Admin", time: "Il y a 2j", color: "bg-[var(--text-muted)]" },
];

const ADMIN_SECTIONS = [
  { href: "/admin/players", label: "Joueurs", description: "Vérifier, suspendre, supprimer", icon: "👤", count: 248 },
  { href: "/admin/tournaments", label: "Tournois", description: "Créer, modifier, gérer les inscriptions", icon: "🏆", count: 34 },
  { href: "/admin/teams", label: "Équipes", description: "Valider, modifier, désactiver", icon: "🛡️", count: 42 },
  { href: "/admin/games", label: "Jeux", description: "Ajouter, activer/désactiver", icon: "🎮", count: 8 },
  { href: "/admin/rankings", label: "Classements", description: "Saisons, recalcul des points", icon: "📊", count: null },
  { href: "/admin/point-rules", label: "Règles de points", description: "Par jeu, tier et placement", icon: "⚙️", count: null },
  { href: "/admin/articles", label: "Articles", description: "Rédiger, publier, dépublier", icon: "📰", count: 56 },
  { href: "/admin/users", label: "Utilisateurs", description: "Rôles et accès", icon: "🔑", count: 312 },
];

const ONGOING_TOURNAMENTS = [
  { name: "Togo Valorant Open S2", game: "Valorant", matchesLeft: 4, tier: "A" },
  { name: "Free Fire Cup Lomé", game: "Free Fire", matchesLeft: 8, tier: "B" },
];

// ─── Page admin (Server Component) ───────────────────────────

export default function AdminDashboard() {
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
              Bienvenue, <span className="text-[var(--accent-green)] font-semibold">Admin</span> · GamePedia TG
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Voir le site
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className={`rounded-xl p-5 border ${kpi.bg} ${kpi.border}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{kpi.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{kpi.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Sections de gestion */}
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Gestion</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ADMIN_SECTIONS.map((s) => (
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
                      {s.count !== null && (
                        <span className="text-xs font-bold text-[var(--text-muted)]">{s.count}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{s.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-green)] transition-colors shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </Link>
              ))}
            </div>

            {/* Tournois en cours */}
            {ONGOING_TOURNAMENTS.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
                  Tournois en cours
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[rgba(0,230,118,0.1)] text-[var(--accent-green)]">
                    {ONGOING_TOURNAMENTS.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {ONGOING_TOURNAMENTS.map((t) => (
                    <div key={t.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{t.game} · Tier {t.tier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-[var(--accent-blue)]">{t.matchesLeft}</p>
                          <p className="text-xs text-[var(--text-muted)]">matchs restants</p>
                        </div>
                        <Link
                          href={`/admin/tournaments`}
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
              {RECENT_ACTIONS.map((action, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3.5 ${
                    i < RECENT_ACTIONS.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${action.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{action.type}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{action.detail}</p>
                    <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                      {action.user} · {action.time}
                    </p>
                  </div>
                </div>
              ))}
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
