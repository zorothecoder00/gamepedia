// ============================================================
// PAGE D'ACCUEIL — GamePedia TG
// ============================================================

import Link from "next/link";
import { db } from "@/lib/prisma";

// ─── Métadonnées visuelles des jeux (couleur + icône) ────────
const GAME_META: Record<string, { color: string; icon: string }> = {
  "valorant":          { color: "#e63030", icon: "🎯" },
  "free-fire":         { color: "#ff8c00", icon: "🔥" },
  "fifa-25":           { color: "#00c44a", icon: "⚽" },
  "mobile-legends":    { color: "#ffcc00", icon: "⚔️" },
  "cs2":               { color: "#e3a04f", icon: "💥" },
  "pubg-mobile":       { color: "#f5c518", icon: "🪖" },
  "league-of-legends": { color: "#c89b3c", icon: "🧙" },
};
const DEFAULT_GAME_META = { color: "#00c44a", icon: "🎮" };
function getGameMeta(slug: string) {
  return GAME_META[slug] ?? DEFAULT_GAME_META;
}

// ─── Helpers de formatage ─────────────────────────────────────
function fmtDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function fmtPrize(amount: number | null | undefined, currency = "XOF"): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("fr-FR").format(amount) + " " + currency;
}

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
// Tiers calés sur les couleurs du drapeau togolais

const TIER_STYLES: Record<string, string> = {
  S: "bg-[#e63030]/10 text-[#e63030] border border-[#e63030]/40",
  A: "bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/40",
  B: "bg-[#00c44a]/10 text-[#00c44a] border border-[#00c44a]/40",
  C: "bg-[#7f8c8d]/10 text-[#7f8c8d] border border-[#7f8c8d]/40",
};

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  ONGOING:   { dot: "bg-[#00c44a] animate-pulse", text: "text-[#00c44a]", label: "En cours" },
  UPCOMING:  { dot: "bg-[#ffcc00]",               text: "text-[#ffcc00]", label: "À venir"  },
  COMPLETED: { dot: "bg-[#7f8c8d]",               text: "text-[#7f8c8d]", label: "Terminé"  },
};

// ─── Types ────────────────────────────────────────────────────

type StatItem = { value: string; label: string };

type GameItem = {
  id: string;
  name: string;
  slug: string;
  genre: string | null;
  _count: { playerProfiles: number };
};

type TournamentItem = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isOnline: boolean;
  prizePool: number | null;
  currency: string;
  games: Array<{ game: { name: string; slug: string } }>;
  _count: { participants: number };
};

type RankingPlayerItem = {
  rank: number;
  pseudo: string;
  city: string | null;
  totalPoints: number;
  wins: number;
};

type GameRanking = {
  game: { name: string; slug: string };
  top: RankingPlayerItem[];
};

type MatchParticipantItem = {
  team: { name: string; tag: string } | null;
  score: number | null;
  isWinner: boolean | null;
};

type RecentMatchItem = {
  id: string;
  endedAt: Date | null;
  stageName: string;
  tournamentName: string;
  tournamentSlug: string;
  participants: MatchParticipantItem[];
};

// ─── Composants de sections ───────────────────────────────────

function Navbar() {
  const links = [
    { href: "/tournaments", label: "Tournois"    },
    { href: "/players",     label: "Joueurs"     },
    { href: "/teams",       label: "Équipes"     },
    { href: "/rankings",    label: "Classements" },
    { href: "/games",       label: "Jeux"        },
    { href: "/news",        label: "News"        },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)]">
      <div className="absolute inset-0 backdrop-blur-md bg-[rgba(9,9,8,0.92)]" />
      <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#09090f] font-black text-sm flex-shrink-0 bg-gradient-to-br from-[#00c44a] via-[#ffcc00] to-[#e63030]">
            GP
          </span>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-[#00c44a]">Game</span>
            <span className="text-[#f0ede6]">Pedia</span>
            <span className="ml-1 text-xs font-semibold text-[#ffcc00]">TG</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[#f0ede6] hover:bg-white/5 transition-all duration-150"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[#f0ede6] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 rounded-lg text-sm font-bold bg-[var(--accent-green)] text-[#09090f] hover:opacity-90 transition-opacity"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ stats }: { stats: StatItem[] }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg-primary)]">
      {/* Grille subtile */}
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(0,196,74,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,196,74,0.06)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* Halos drapeau togolais */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.09] pointer-events-none bg-[#00c44a]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.08] pointer-events-none bg-[#ffcc00]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-[0.07] pointer-events-none bg-[#e63030]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 w-full">
        <div className="max-w-3xl">
          {/* Badge Togo */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold bg-[rgba(0,196,74,0.1)] border border-[rgba(0,196,74,0.3)] text-[#00c44a]">
            <span className="w-2 h-2 rounded-full bg-[#00c44a] animate-pulse" />
            🇹🇬 La plateforme esport du Togo
          </div>

          {/* Titre — couleurs du drapeau */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-6">
            <span className="text-[#f0ede6]">L&apos;esport</span>
            <br />
            <span className="bg-[linear-gradient(135deg,#00c44a_0%,#ffcc00_50%,#e63030_100%)] bg-clip-text text-transparent">
              togolais
            </span>
            <br />
            <span className="text-[#f0ede6]">centralisé.</span>
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-xl leading-relaxed text-[var(--text-secondary)]">
            Suivez les tournois, retracez les performances des joueurs et découvrez
            les classements officiels de la scène compétitive togolaise.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/tournaments"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-lg bg-[var(--accent-green)] text-[#09090f]"
            >
              <IconTrophy size={18} />
              Voir les tournois
            </Link>
            <Link
              href="/rankings"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-150 border border-[var(--border-bright)] text-[var(--text-primary)] bg-[var(--bg-card)]"
            >
              Classements
              <IconArrow size={16} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            // Couleur de la valeur : vert, jaune, rouge, vert (cycle drapeau)
            const colors = ["#00c44a", "#ffcc00", "#e63030", "#00c44a"];
            return (
              <div
                key={s.label}
                className="rounded-xl p-4 text-center bg-[var(--bg-card)] border border-[var(--border)]"
              >
                <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: colors[i % colors.length] }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)]">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-[linear-gradient(to_bottom,transparent,var(--bg-secondary))]" />
    </section>
  );
}

function GamesSection({ games }: { games: GameItem[] }) {
  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Jeux actifs</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Les jeux compétitifs de la scène togolaise</p>
          </div>
          <Link href="/games" className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity text-[var(--accent-green)]">
            Tous les jeux <IconArrow size={14} />
          </Link>
        </div>

        {games.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Aucun jeu actif pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {games.map((g) => {
              const meta = getGameMeta(g.slug);
              return (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1 bg-[var(--bg-card)] border border-[var(--border)]"
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                    style={{ background: meta.color }}
                  />
                  <div className="relative z-10">
                    <span className="text-4xl">{meta.icon}</span>
                    <div className="mt-3">
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{g.name}</h3>
                      <p className="text-xs mt-0.5 text-[var(--text-secondary)]">{g.genre ?? "Jeu compétitif"}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: meta.color }}>
                      <IconUsers size={12} />
                      {g._count.playerProfiles} joueur{g._count.playerProfiles !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function TournamentsSection({ tournaments }: { tournaments: TournamentItem[] }) {
  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Tournois</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">En cours et à venir</p>
          </div>
          <Link href="/tournaments" className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity text-[var(--accent-green)]">
            Voir tout <IconArrow size={14} />
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Aucun tournoi prévu pour le moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => {
              const st = STATUS_STYLES[t.status] ?? STATUS_STYLES.UPCOMING;
              const firstGame = t.games[0]?.game;
              const gameMeta = firstGame ? getGameMeta(firstGame.slug) : DEFAULT_GAME_META;
              const gameName = firstGame?.name ?? "—";
              return (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.slug}`}
                  className="group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col bg-[var(--bg-card)] border border-[var(--border)]"
                >
                  <div className="h-1.5 w-full" style={{ background: gameMeta.color }} />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${TIER_STYLES[t.tier] ?? TIER_STYLES.C}`}>
                        Tier {t.tier}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-base leading-tight mb-1 text-[var(--text-primary)]">{t.name}</h3>
                    <p className="text-xs mb-4" style={{ color: gameMeta.color }}>{gameName}</p>

                    <div className="space-y-1.5 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <IconCalendar />
                        {fmtDate(t.startDate)} → {fmtDate(t.endDate)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <IconLocation />
                        {t.isOnline ? "En ligne" : (t.location ?? "—")}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-between border-t border-[var(--border)]">
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">Prize pool</div>
                        <div className="font-bold text-sm text-[var(--accent-gold)]">
                          {fmtPrize(t.prizePool, t.currency)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Participants</div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">{t._count.participants}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function RankingsSection({ rankings }: { rankings: GameRanking[] }) {
  // Médailles : or → argent → bronze (couleurs classiques du podium)
  const MEDAL = ["#ffcc00", "#c0c0c0", "#cd7f32"];

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Classements</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Top joueurs de la saison en cours</p>
          </div>
          <Link href="/rankings" className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity text-[var(--accent-green)]">
            Classement complet <IconArrow size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rankings.map((r) => {
            const meta = getGameMeta(r.game.slug);
            return (
              <div key={r.game.slug} className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: meta.color }} />
                    <h3 className="font-bold text-[var(--text-primary)]">{r.game.name}</h3>
                  </div>
                  <Link
                    href={`/rankings/${r.game.slug}`}
                    className="text-xs font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: meta.color }}
                  >
                    Voir tout
                  </Link>
                </div>

                <div>
                  {r.top.map((p, i) => (
                    <Link
                      key={p.pseudo}
                      href={`/players/${p.pseudo}`}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i < r.top.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                    >
                      <span
                        className="w-6 text-center font-black text-sm flex-shrink-0"
                        style={{ color: MEDAL[i] ?? "#565048" }}
                      >
                        {p.rank}
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: meta.color + "22", color: meta.color }}
                      >
                        {p.pseudo[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-[var(--text-primary)]">{p.pseudo}</div>
                        <div className="text-xs text-[var(--text-muted)]">{p.city ?? "—"}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[var(--accent-green)]">
                          {p.totalPoints.toLocaleString("fr-FR")}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">pts</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentResultsSection({ matches }: { matches: RecentMatchItem[] }) {
  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Derniers résultats</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Résultats récents des tournois</p>
        </div>

        <div className="space-y-3">
          {matches.map((m) => {
            const [p1, p2] = m.participants;
            const team1 = p1?.team?.name ?? p1?.team?.tag ?? "—";
            const team2 = p2?.team?.name ?? p2?.team?.tag ?? "—";
            const score = p1 !== undefined && p2 !== undefined
              ? `${p1.score ?? "?"} – ${p2.score ?? "?"}`
              : "—";
            const winner1 = p1?.isWinner === true;
            const winner2 = p2?.isWinner === true;

            return (
              <div
                key={m.id}
                className="rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-[var(--bg-card)] border border-[var(--border)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate text-[var(--text-muted)]">
                    {m.tournamentName} — {m.stageName}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-center">
                  <span className={`font-bold text-sm text-right w-28 truncate ${winner1 ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {team1}
                  </span>
                  <span className="font-black text-sm px-3 py-1 rounded-lg tabular-nums bg-[var(--bg-secondary)] text-[var(--accent-green)]">
                    {score}
                  </span>
                  <span className={`font-bold text-sm text-left w-28 truncate ${winner2 ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {team2}
                  </span>
                </div>

                <div className="text-xs sm:w-24 flex-shrink-0 text-right text-[var(--text-muted)]">
                  {fmtDate(m.endedAt)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Gradient drapeau : vert → jaune → rouge */}
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center bg-[linear-gradient(135deg,rgba(0,196,74,0.08)_0%,rgba(255,204,0,0.07)_50%,rgba(230,48,48,0.06)_100%)] border border-[rgba(0,196,74,0.2)]">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-[0.12] pointer-events-none bg-[#00c44a]" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-[0.10] pointer-events-none bg-[#e63030]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-[0.08] pointer-events-none bg-[#ffcc00]" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-[var(--text-primary)]">
              Tu es joueur ?{" "}
              <span className="text-[var(--accent-green)]">Rejoins la scène officielle.</span>
            </h2>
            <p className="text-base max-w-lg mx-auto mb-8 text-[var(--text-secondary)]">
              Crée ton profil joueur, participe aux tournois officiels,
              suis tes statistiques et grimpe dans les classements nationaux.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all duration-150 hover:scale-[1.02] shadow-lg bg-[var(--accent-green)] text-[#09090f]"
              >
                Créer mon profil — c&apos;est gratuit
              </Link>
              <Link
                href="/players"
                className="px-8 py-4 rounded-xl font-bold text-base hover:opacity-80 transition-opacity border border-[var(--border-bright)] text-[var(--text-primary)]"
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
        { href: "/tournaments", label: "Tournois"    },
        { href: "/players",     label: "Joueurs"     },
        { href: "/teams",       label: "Équipes"     },
        { href: "/rankings",    label: "Classements" },
      ],
    },
    {
      title: "Jeux",
      links: [
        { href: "/games/valorant",       label: "Valorant"       },
        { href: "/games/free-fire",      label: "Free Fire"      },
        { href: "/games/fifa-25",        label: "FIFA 25"        },
        { href: "/games/mobile-legends", label: "Mobile Legends" },
      ],
    },
    {
      title: "Informations",
      links: [
        { href: "/news",    label: "Actualités"     },
        { href: "/about",   label: "À propos"       },
        { href: "/contact", label: "Contact"        },
        { href: "/admin",   label: "Administration" },
      ],
    },
  ];

  return (
    <footer className="pt-16 pb-8 bg-[var(--bg-primary)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#09090f] font-black text-sm flex-shrink-0 bg-gradient-to-br from-[#00c44a] via-[#ffcc00] to-[#e63030]">
                GP
              </span>
              <span className="font-bold text-lg">
                <span className="text-[#00c44a]">Game</span>
                <span className="text-[#f0ede6]">Pedia</span>
                <span className="ml-1 text-xs text-[#ffcc00]">TG</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              La référence de l&apos;esport au Togo.
              <br />
              Tournois, joueurs et classements.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[rgba(0,196,74,0.08)] text-[#00c44a] border border-[rgba(0,196,74,0.2)]">
              🇹🇬 Made in Togo
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4 text-[var(--text-primary)]">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:opacity-80 transition-opacity text-[var(--text-muted)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[var(--border)] text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} GamePedia TG. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">Confidentialité</Link>
            <Link href="/terms"   className="hover:opacity-80 transition-opacity">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page principale (Server Component async) ─────────────────

export default async function HomePage() {
  // ── Statistiques globales ──────────────────────────────────
  const [playerCount, tournamentCount, gameCount, prizeAgg] = await Promise.all([
    db.player.count({ where: { isActive: true } }),
    db.tournament.count(),
    db.game.count({ where: { isActive: true } }),
    db.tournament.aggregate({ _sum: { prizePool: true } }),
  ]);

  const stats: StatItem[] = [
    { value: playerCount.toString(),     label: "Joueurs inscrits"       },
    { value: tournamentCount.toString(), label: "Tournois organisés"     },
    { value: gameCount.toString(),       label: "Jeux actifs"            },
    { value: fmtPrize(prizeAgg._sum.prizePool), label: "Prize money distribué" },
  ];

  // ── Jeux actifs (max 4 pour la grille) ────────────────────
  const games = await db.game.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 4,
    include: { _count: { select: { playerProfiles: true } } },
  });

  // ── Tournois en cours + à venir (ONGOING en premier) ──────
  const [ongoingT, upcomingT] = await Promise.all([
    db.tournament.findMany({
      where: { status: "ONGOING" },
      orderBy: { startDate: "asc" },
      take: 3,
      include: {
        games: { include: { game: { select: { name: true, slug: true } } } },
        _count: { select: { participants: true } },
      },
    }),
    db.tournament.findMany({
      where: { status: "UPCOMING" },
      orderBy: { startDate: "asc" },
      take: 3,
      include: {
        games: { include: { game: { select: { name: true, slug: true } } } },
        _count: { select: { participants: true } },
      },
    }),
  ]);
  const tournaments = [...ongoingT, ...upcomingT].slice(0, 3);

  // ── Classements par jeu (saison active) ───────────────────
  const [activeSeason, rankingGames] = await Promise.all([
    db.season.findFirst({ where: { isActive: true } }),
    db.game.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rankingsRaw = await Promise.all(
    rankingGames.map(async (game) => {
      const entries = await db.rankingEntry.findMany({
        where: {
          gameId: game.id,
          playerId: { not: null },
          ...(activeSeason ? { seasonId: activeSeason.id } : {}),
        },
        orderBy: { rank: "asc" },
        take: 3,
        include: { player: { select: { pseudo: true, city: true } } },
      });
      return { game, entries };
    }),
  );

  const rankings: GameRanking[] = rankingsRaw
    .filter((r) => r.entries.length > 0)
    .slice(0, 3)
    .map((r) => ({
      game: r.game,
      top: r.entries.map((e, i) => ({
        rank:        e.rank ?? i + 1,
        pseudo:      e.player?.pseudo ?? "—",
        city:        e.player?.city ?? null,
        totalPoints: e.totalPoints,
        wins:        e.wins,
      })),
    }));

  // ── Derniers résultats ─────────────────────────────────────
  const rawMatches = await db.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { endedAt: "desc" },
    take: 5,
    include: {
      stage: {
        select: {
          name: true,
          tournament: { select: { name: true, slug: true } },
        },
      },
      participants: {
        include: { team: { select: { name: true, tag: true } } },
      },
    },
  });

  const recentMatches: RecentMatchItem[] = rawMatches.map((m) => ({
    id:             m.id,
    endedAt:        m.endedAt,
    stageName:      m.stage.name,
    tournamentName: m.stage.tournament.name,
    tournamentSlug: m.stage.tournament.slug,
    participants:   m.participants.map((p) => ({
      team:     p.team,
      score:    p.score,
      isWinner: p.isWinner,
    })),
  }));

  return (
    <main>
      <Navbar />
      <HeroSection stats={stats} />
      <GamesSection games={games} />
      <TournamentsSection tournaments={tournaments} />
      {rankings.length > 0 && <RankingsSection rankings={rankings} />}
      {recentMatches.length > 0 && <RecentResultsSection matches={recentMatches} />}
      <CtaSection />
      <Footer />
    </main>
  );
}
