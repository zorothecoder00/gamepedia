// ============================================================
// PAGE D'ACCUEIL — GamePedia TG
// ============================================================

import Link from "next/link";

// ─── Données de démo ─────────────────────────────────────────

const STATS = [
  { value: "248", label: "Joueurs inscrits" },
  { value: "34", label: "Tournois organisés" },
  { value: "8", label: "Jeux actifs" },
  { value: "2.4M XOF", label: "Prize money distribué" },
];

const GAMES = [
  { name: "Valorant", slug: "valorant", genre: "FPS", players: 87, icon: "🎯", color: "#ff4655" },
  { name: "Free Fire", slug: "free-fire", genre: "Battle Royale", players: 74, icon: "🔥", color: "#ff8c00" },
  { name: "FIFA 25", slug: "fifa-25", genre: "Sports", players: 52, icon: "⚽", color: "#00b4d8" },
  { name: "Mobile Legends", slug: "mobile-legends", genre: "MOBA", players: 35, icon: "⚔️", color: "#9b59b6" },
];

const TOURNAMENTS = [
  {
    id: 1,
    name: "Togo Valorant Open S2",
    slug: "togo-valorant-open-s2",
    game: "Valorant",
    gameColor: "#ff4655",
    tier: "A",
    status: "ONGOING",
    startDate: "15 Mar 2025",
    endDate: "22 Mar 2025",
    location: "Lomé, Togo",
    prizePool: "500 000 XOF",
    teams: 16,
  },
  {
    id: 2,
    name: "Free Fire Cup Lomé",
    slug: "free-fire-cup-lome",
    game: "Free Fire",
    gameColor: "#ff8c00",
    tier: "B",
    status: "UPCOMING",
    startDate: "5 Avr 2025",
    endDate: "6 Avr 2025",
    location: "En ligne",
    prizePool: "200 000 XOF",
    teams: 32,
  },
  {
    id: 3,
    name: "FIFA 25 Challenge National",
    slug: "fifa-25-challenge-national",
    game: "FIFA 25",
    gameColor: "#00b4d8",
    tier: "S",
    status: "UPCOMING",
    startDate: "20 Avr 2025",
    endDate: "21 Avr 2025",
    location: "Kara, Togo",
    prizePool: "1 000 000 XOF",
    teams: 64,
  },
];

const RANKINGS = [
  {
    game: "Valorant",
    gameSlug: "valorant",
    color: "#ff4655",
    top: [
      { rank: 1, pseudo: "ShadowX_TG", city: "Lomé", points: 2850, wins: 3 },
      { rank: 2, pseudo: "Inferno99", city: "Kara", points: 2310, wins: 2 },
      { rank: 3, pseudo: "ZeroTwo_GG", city: "Lomé", points: 1980, wins: 1 },
    ],
  },
  {
    game: "Free Fire",
    gameSlug: "free-fire",
    color: "#ff8c00",
    top: [
      { rank: 1, pseudo: "Predator_Lomé", city: "Lomé", points: 3200, wins: 5 },
      { rank: 2, pseudo: "PhantomKill", city: "Sokodé", points: 2740, wins: 3 },
      { rank: 3, pseudo: "OmegaTG", city: "Lomé", points: 2100, wins: 2 },
    ],
  },
  {
    game: "FIFA 25",
    gameSlug: "fifa-25",
    color: "#00b4d8",
    top: [
      { rank: 1, pseudo: "GoalMachine", city: "Lomé", points: 1900, wins: 4 },
      { rank: 2, pseudo: "TacticoTG", city: "Atakpamé", points: 1650, wins: 2 },
      { rank: 3, pseudo: "ManUtd_Fan", city: "Lomé", points: 1320, wins: 1 },
    ],
  },
];

const RECENT_RESULTS = [
  {
    tournament: "Valorant Open S2 — Quart de finale",
    team1: "Team Lomé",
    team2: "Shadow Squad",
    score: "2 – 1",
    winner: "Team Lomé",
    date: "16 Mar 2025",
  },
  {
    tournament: "Valorant Open S2 — Quart de finale",
    team1: "GG Togo",
    team2: "North Stars",
    score: "2 – 0",
    winner: "GG Togo",
    date: "16 Mar 2025",
  },
  {
    tournament: "FF Cup Kara — Finale",
    team1: "Predators",
    team2: "Delta Force",
    score: "1er – 4ème",
    winner: "Predators",
    date: "12 Mar 2025",
  },
];

// ─── Icônes SVG inline ────────────────────────────────────────

function IconTrophy({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V18H7v2h10v-2h-4v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-2 3c0 1.65-1.35 3-3 3s-3-1.35-3-3V5h6v3z" />
    </svg>
  );
}

function IconUsers({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function IconLocation({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function IconCalendar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  );
}

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}

// ─── Styles par tier / statut ─────────────────────────────────

const TIER_STYLES: Record<string, string> = {
  S: "bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/40",
  A: "bg-[#9b59b6]/10 text-[#9b59b6] border border-[#9b59b6]/40",
  B: "bg-[#3498db]/10 text-[#3498db] border border-[#3498db]/40",
  C: "bg-[#7f8c8d]/10 text-[#7f8c8d] border border-[#7f8c8d]/40",
};

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  ONGOING: { dot: "bg-[#00e676] animate-pulse", text: "text-[#00e676]", label: "En cours" },
  UPCOMING: { dot: "bg-[#ffd700]", text: "text-[#ffd700]", label: "À venir" },
  COMPLETED: { dot: "bg-[#9090b0]", text: "text-[#9090b0]", label: "Terminé" },
};

// ─── Composants de sections ───────────────────────────────────

function Navbar() {
  const links = [
    { href: "/tournaments", label: "Tournois" },
    { href: "/players", label: "Joueurs" },
    { href: "/teams", label: "Équipes" },
    { href: "/rankings", label: "Classements" },
    { href: "/games", label: "Jeux" },
    { href: "/news", label: "News" },
  ];

  return (
    <header
      style={{ borderBottom: "1px solid var(--border)" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        style={{ background: "rgba(9,9,15,0.92)" }}
        className="absolute inset-0 backdrop-blur-md"
      />
      <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            style={{ background: "linear-gradient(135deg,#00e676,#4fc3f7)" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#09090f] font-black text-sm flex-shrink-0"
          >
            GP
          </span>
          <span className="font-bold text-lg tracking-tight">
            <span style={{ color: "#00e676" }}>Game</span>
            <span style={{ color: "#f0f0f8" }}>Pedia</span>
            <span
              style={{ color: "#ffd700" }}
              className="ml-1 text-xs font-semibold"
            >
              TG
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: "var(--text-secondary)" }}
              className="px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            style={{ color: "var(--text-secondary)" }}
            className="hidden sm:block text-sm font-medium hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            style={{ background: "var(--accent-green)", color: "#09090f" }}
            className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Arrière-plan */}
      <div className="absolute inset-0" style={{ background: "var(--bg-primary)" }}>
        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,230,118,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Halos de lumière */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "#00e676" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "#4fc3f7" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "#ffd700" }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        <div className="max-w-3xl">
          {/* Badge Togo */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(0,230,118,0.1)",
              border: "1px solid rgba(0,230,118,0.3)",
              color: "#00e676",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            🇹🇬 La plateforme esport du Togo
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-6">
            <span style={{ color: "#f0f0f8" }}>L&apos;esport</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00e676 0%, #4fc3f7 50%, #ffd700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              togolais
            </span>
            <br />
            <span style={{ color: "#f0f0f8" }}>centralisé.</span>
          </h1>

          {/* Description */}
          <p
            className="text-lg sm:text-xl mb-10 max-w-xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Suivez les tournois, retracez les performances des joueurs et découvrez
            les classements officiels de la scène compétitive togolaise.
          </p>

          {/* Boutons CTA */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tournaments"
              style={{ background: "var(--accent-green)", color: "#09090f" }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
            >
              <IconTrophy size={18} />
              Voir les tournois
            </Link>
            <Link
              href="/rankings"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-150"
              style={{
                border: "1px solid var(--border-bright)",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
              }}
            >
              Classements
              <IconArrow size={16} />
            </Link>
          </div>
        </div>

        {/* Barre de statistiques */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="text-2xl sm:text-3xl font-black mb-1"
                style={{ color: "var(--accent-green)" }}
              >
                {s.value}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fondu vers la section suivante */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg-secondary))",
        }}
      />
    </section>
  );
}

function GamesSection() {
  return (
    <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Jeux actifs
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Les jeux compétitifs de la scène togolaise
            </p>
          </div>
          <Link
            href="/games"
            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent-green)" }}
          >
            Tous les jeux <IconArrow size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Halo de couleur */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ background: g.color }}
              />
              <div className="relative z-10">
                <span className="text-4xl">{g.icon}</span>
                <div className="mt-3">
                  <h3
                    className="font-bold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {g.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {g.genre}
                  </p>
                </div>
                <div
                  className="mt-3 flex items-center gap-1 text-xs font-semibold"
                  style={{ color: g.color }}
                >
                  <IconUsers size={12} />
                  {g.players} joueurs
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TournamentsSection() {
  return (
    <section className="py-20" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Tournois
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              En cours et à venir
            </p>
          </div>
          <Link
            href="/tournaments"
            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent-green)" }}
          >
            Voir tout <IconArrow size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOURNAMENTS.map((t) => {
            const st = STATUS_STYLES[t.status];
            return (
              <Link
                key={t.id}
                href={`/tournaments/${t.slug}`}
                className="group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Bandeau de couleur du jeu */}
                <div className="h-1.5 w-full" style={{ background: t.gameColor }} />

                <div className="p-5 flex flex-col flex-1">
                  {/* Badges tier + statut */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${TIER_STYLES[t.tier]}`}
                    >
                      Tier {t.tier}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* Nom du tournoi */}
                  <h3
                    className="font-bold text-base leading-tight mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.name}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: t.gameColor }}>
                    {t.game}
                  </p>

                  {/* Métadonnées */}
                  <div className="space-y-1.5 mt-auto">
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <IconCalendar />
                      {t.startDate} → {t.endDate}
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <IconLocation />
                      {t.location}
                    </div>
                  </div>

                  {/* Footer de la carte */}
                  <div
                    className="mt-4 pt-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Prize pool
                      </div>
                      <div
                        className="font-bold text-sm"
                        style={{ color: "var(--accent-gold)" }}
                      >
                        {t.prizePool}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Équipes
                      </div>
                      <div
                        className="font-bold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {t.teams}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RankingsSection() {
  return (
    <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Classements
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Top joueurs de la saison en cours
            </p>
          </div>
          <Link
            href="/rankings"
            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent-green)" }}
          >
            Classement complet <IconArrow size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RANKINGS.map((r) => (
            <div
              key={r.game}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* En-tête du classement */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: r.color }}
                  />
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {r.game}
                  </h3>
                </div>
                <Link
                  href={`/rankings/${r.gameSlug}`}
                  className="text-xs font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: r.color }}
                >
                  Voir tout
                </Link>
              </div>

              {/* Top 3 */}
              <div>
                {r.top.map((p, i) => (
                  <Link
                    key={p.pseudo}
                    href={`/players/${p.pseudo}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:opacity-80 transition-opacity"
                    style={{
                      borderBottom:
                        i < r.top.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* Rang */}
                    <span
                      className="w-6 text-center font-black text-sm flex-shrink-0"
                      style={{
                        color:
                          p.rank === 1
                            ? "#ffd700"
                            : p.rank === 2
                            ? "#c0c0c0"
                            : "#cd7f32",
                      }}
                    >
                      {p.rank}
                    </span>

                    {/* Avatar placeholder */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: r.color + "22", color: r.color }}
                    >
                      {p.pseudo[0].toUpperCase()}
                    </div>

                    {/* Infos joueur */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.pseudo}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {p.city}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-sm font-bold"
                        style={{ color: "var(--accent-green)" }}
                      >
                        {p.points.toLocaleString("fr-FR")}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        pts
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentResultsSection() {
  return (
    <section className="py-20" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2
            className="text-2xl sm:text-3xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            Derniers résultats
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Résultats récents des tournois
          </p>
        </div>

        <div className="space-y-3">
          {RECENT_RESULTS.map((r, i) => (
            <div
              key={i}
              className="rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Nom du tournoi */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {r.tournament}
                </p>
              </div>

              {/* Résultat du match */}
              <div className="flex items-center gap-4 justify-center">
                <span
                  className="font-bold text-sm text-right w-28 truncate"
                  style={{
                    color:
                      r.winner === r.team1
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {r.team1}
                </span>
                <span
                  className="font-black text-sm px-3 py-1 rounded-lg tabular-nums"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--accent-green)",
                  }}
                >
                  {r.score}
                </span>
                <span
                  className="font-bold text-sm text-left w-28 truncate"
                  style={{
                    color:
                      r.winner === r.team2
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {r.team2}
                </span>
              </div>

              {/* Date */}
              <div
                className="text-xs sm:w-24 flex-shrink-0 text-right"
                style={{ color: "var(--text-muted)" }}
              >
                {r.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,230,118,0.08) 0%, rgba(79,195,247,0.08) 50%, rgba(255,215,0,0.05) 100%)",
            border: "1px solid rgba(0,230,118,0.2)",
          }}
        >
          {/* Décorations */}
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: "#00e676" }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: "#4fc3f7" }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Tu es joueur ?{" "}
              <span style={{ color: "var(--accent-green)" }}>
                Rejoins la scène officielle.
              </span>
            </h2>
            <p
              className="text-base max-w-lg mx-auto mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Crée ton profil joueur, participe aux tournois officiels,
              suis tes statistiques et grimpe dans les classements nationaux.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all duration-150 hover:scale-[1.02] shadow-lg"
                style={{ background: "var(--accent-green)", color: "#09090f" }}
              >
                Créer mon profil — c&apos;est gratuit
              </Link>
              <Link
                href="/players"
                className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-80 transition-opacity"
                style={{
                  border: "1px solid var(--border-bright)",
                  color: "var(--text-primary)",
                }}
              >
                Explorer les joueurs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    {
      title: "Plateforme",
      links: [
        { href: "/tournaments", label: "Tournois" },
        { href: "/players", label: "Joueurs" },
        { href: "/teams", label: "Équipes" },
        { href: "/rankings", label: "Classements" },
      ],
    },
    {
      title: "Jeux",
      links: [
        { href: "/games/valorant", label: "Valorant" },
        { href: "/games/free-fire", label: "Free Fire" },
        { href: "/games/fifa-25", label: "FIFA 25" },
        { href: "/games/mobile-legends", label: "Mobile Legends" },
      ],
    },
    {
      title: "Informations",
      links: [
        { href: "/news", label: "Actualités" },
        { href: "/about", label: "À propos" },
        { href: "/contact", label: "Contact" },
        { href: "/admin", label: "Administration" },
      ],
    },
  ];

  return (
    <footer
      className="pt-16 pb-8"
      style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Marque */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                style={{ background: "linear-gradient(135deg,#00e676,#4fc3f7)" }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#09090f] font-black text-sm flex-shrink-0"
              >
                GP
              </span>
              <span className="font-bold text-lg">
                <span style={{ color: "#00e676" }}>Game</span>
                <span style={{ color: "#f0f0f8" }}>Pedia</span>
                <span style={{ color: "#ffd700" }} className="ml-1 text-xs">
                  TG
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              La référence de l&apos;esport au Togo.
              <br />
              Tournois, joueurs et classements.
            </p>
            <div
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(0,230,118,0.08)",
                color: "#00e676",
                border: "1px solid rgba(0,230,118,0.2)",
              }}
            >
              🇹🇬 Made in Togo
            </div>
          </div>

          {/* Colonnes de liens */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                className="font-semibold text-sm mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bas du footer */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <p>© {new Date().getFullYear()} GamePedia TG. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page principale ──────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <GamesSection />
      <TournamentsSection />
      <RankingsSection />
      <RecentResultsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
