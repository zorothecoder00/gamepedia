"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import { useApi } from "@/hooks/useApi";

// ─── Couleurs par slug (pas de champ color en base) ──────────
const GAME_COLORS: Record<string, string> = {
  "valorant":          "#e63030",
  "free-fire":         "#ff8c00",
  "fifa-25":           "#00c44a",
  "mobile-legends":    "#ffcc00",
  "cs2":               "#e3a04f",
  "pubg-mobile":       "#f5c518",
  "league-of-legends": "#c89b3c",
};
function getGameColor(slug: string) {
  return GAME_COLORS[slug] ?? "#00c44a";
}

// ─── Types ────────────────────────────────────────────────────

interface Game {
  id: string; slug: string; name: string; genre: string; format: string;
  platforms: string[]; description: string; logo: string | null;
  publisher?: string;
  _count: { playerProfiles: number; tournamentGames: number };
}

interface Tournament {
  id: string; slug: string; name: string;
  tier: "S" | "A" | "B" | "C";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  startDate: string; prizePool?: number; currency?: string;
}

interface RankingEntry {
  id: string; rank: number; totalPoints: number; wins: number;
  player?: { pseudo: string; city?: string };
  team?: { name: string; tag: string; slug: string };
}

interface Player { id: string; pseudo: string; city?: string; isVerified?: boolean }

const TABS = ["Vue d'ensemble", "Classement", "Tournois", "Joueurs"];

const STATUS_COLORS: Record<string, string> = {
  UPCOMING:  "#ffcc00",
  ONGOING:   "var(--accent-green)",
  COMPLETED: "var(--text-muted)",
  CANCELLED: "var(--accent-red)",
};
const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "À venir", ONGOING: "En cours", COMPLETED: "Terminé", CANCELLED: "Annulé",
};

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div className="font-bold text-base" style={{ color }}>{value}</div>
      <div className="text-[0.72rem] text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const { slug } = params;

  const { data: game, loading: loadingGame }         = useApi<Game>(`/api/games/${slug}`);
  const { data: tournaments, loading: loadingTournaments } = useApi<Tournament[]>(`/api/games/${slug}/tournaments`);
  const { data: rankings, loading: loadingRankings } = useApi<RankingEntry[]>(
    activeTab === 1 ? `/api/rankings/${slug}` : null, [activeTab],
  );
  const { data: players, loading: loadingPlayers }   = useApi<Player[]>(
    activeTab === 3 ? `/api/games/${slug}/players` : null, [activeTab],
  );

  const color = game ? getGameColor(game.slug) : "#00c44a";

  if (loadingGame) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!game) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Jeu introuvable.</div>;
  }

  const completedTournaments = (tournaments ?? []).filter((t) => t.status === "COMPLETED");
  const upcomingTournaments  = (tournaments ?? []).filter((t) => t.status === "UPCOMING" || t.status === "ONGOING");

  return (
    <div>
      {/* Banner / Header */}
      <div
        className="border-b border-[var(--border)] px-6 pt-10 pb-6"
        style={{ background: `linear-gradient(180deg, ${color}20 0%, var(--bg-primary) 100%)` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end gap-6 flex-wrap">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-[2.5rem] shrink-0 overflow-hidden"
              style={{ background: `${color}18`, border: `2px solid ${color}44` }}
            >
              {game.logo
                ? <Image src={game.logo} alt={game.name} width={56} height={56} className="object-contain" unoptimized />
                : "🎮"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-[1.75rem] font-black text-[var(--text-primary)]">{game.name}</h1>
                <span
                  className="text-[0.75rem] font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
                >
                  {game.genre}
                </span>
              </div>
              <p className="text-[0.9rem] text-[var(--text-secondary)] mb-3">{game.description}</p>
              <div className="flex gap-6 flex-wrap">
                <Stat label="Joueurs"  value={game._count.playerProfiles}  color={color} />
                <Stat label="Tournois" value={game._count.tournamentGames} color="var(--accent-gold)" />
                <Stat label="Format"   value={game.format}                 color="var(--text-secondary)" />
                {game.publisher && <Stat label="Éditeur" value={game.publisher} color="var(--text-secondary)" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 flex">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="px-5 py-3.5 bg-transparent border-none text-sm cursor-pointer transition-colors"
              style={{
                borderBottom: activeTab === i ? `2px solid ${color}` : "2px solid transparent",
                color: activeTab === i ? color : "var(--text-secondary)",
                fontWeight: activeTab === i ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Vue d'ensemble */}
        {activeTab === 0 && (
          <div className="grid grid-cols-2 gap-8">
            {[
              { title: "Derniers résultats", items: completedTournaments.slice(0, 5), upcoming: false },
              { title: "Tournois à venir",   items: upcomingTournaments.slice(0, 5),  upcoming: true  },
            ].map(({ title, items, upcoming }) => (
              <div key={title}>
                <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-4">{title}</h2>
                {loadingTournaments ? (
                  <p className="text-sm text-[var(--text-muted)]">Chargement...</p>
                ) : items.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">{upcoming ? "Aucun tournoi à venir." : "Aucun résultat."}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((t) => (
                      <Link key={t.slug} href={`/tournaments/${t.slug}`} className="no-underline">
                        <div
                          className="bg-[var(--bg-card)] rounded-lg px-4 py-3.5 hover:border-opacity-60 transition-colors"
                          style={{ border: upcoming ? `1px solid ${color}40` : "1px solid var(--border)" }}
                        >
                          <div className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</div>
                          <div className="text-[0.75rem] text-[var(--text-muted)] mt-1">
                            {upcoming ? "Début : " : ""}{new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <TierBadge tier={t.tier} small />
                            {upcoming && t.prizePool && t.prizePool > 0 && (
                              <span className="text-[0.78rem] font-semibold text-[var(--accent-gold)]">
                                {t.prizePool.toLocaleString()} {t.currency ?? "XOF"}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Classement */}
        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Classement — Saison active</h2>
            {loadingRankings ? (
              <p className="text-[var(--text-muted)]">Chargement...</p>
            ) : !rankings || rankings.length === 0 ? (
              <p className="text-[var(--text-muted)]">Aucun classement disponible.</p>
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                      {["Rang", "Joueur / Équipe", "Points", "Wins"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[0.78rem] font-semibold text-[var(--text-muted)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((entry, i) => {
                      const name = entry.player?.pseudo ?? entry.team?.name ?? "—";
                      const city = entry.player?.city ?? "";
                      const href = entry.player ? `/players/${entry.player.pseudo}` : `/teams/${entry.team?.slug}`;
                      return (
                        <tr key={entry.id} className={i < rankings.length - 1 ? "border-b border-[var(--border)]" : ""}>
                          <td className="px-4 py-3.5 text-sm">
                            {entry.rank === 1 ? "🥇 1" : entry.rank === 2 ? "🥈 2" : entry.rank === 3 ? "🥉 3" : (
                              <span className="font-semibold" style={{ color }}>#{entry.rank}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <Link href={href} className="no-underline font-semibold text-[0.9rem] text-[var(--text-primary)] hover:underline">{name}</Link>
                            {city && <div className="text-[0.75rem] text-[var(--text-muted)]">{city}</div>}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-[var(--accent-gold)]">{entry.totalPoints.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{entry.wins}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tournois */}
        {activeTab === 2 && (
          <div>
            {loadingTournaments ? (
              <p className="text-[var(--text-muted)]">Chargement...</p>
            ) : !tournaments || tournaments.length === 0 ? (
              <p className="text-[var(--text-muted)]">Aucun tournoi.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tournaments.map((t) => (
                  <Link key={t.slug} href={`/tournaments/${t.slug}`} className="no-underline">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:border-[var(--border-bright)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <div className="font-semibold text-[0.9rem] text-[var(--text-primary)]">{t.name}</div>
                          <div className="text-[0.75rem] text-[var(--text-muted)]">
                            {new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <TierBadge tier={t.tier} small />
                        <span className="text-[0.78rem] font-semibold" style={{ color: STATUS_COLORS[t.status] }}>{STATUS_LABELS[t.status]}</span>
                        {t.prizePool && t.prizePool > 0 && (
                          <span className="text-[0.82rem] font-bold text-[var(--accent-gold)]">{t.prizePool.toLocaleString()} XOF</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Joueurs */}
        {activeTab === 3 && (
          <div>
            {loadingPlayers ? (
              <p className="text-[var(--text-muted)]">Chargement...</p>
            ) : !players || players.length === 0 ? (
              <p className="text-[var(--text-muted)]">Aucun joueur inscrit.</p>
            ) : (
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {players.map((p) => (
                  <Link key={p.pseudo} href={`/players/${p.pseudo}`} className="no-underline">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 flex items-center gap-3 hover:border-[var(--border-bright)] transition-colors">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${color}, var(--accent-gold))`,
                          color: "#09090f",
                        }}
                      >
                        {p.pseudo.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{p.pseudo}</div>
                        {p.city && <div className="text-[0.75rem] text-[var(--text-muted)]">{p.city}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
