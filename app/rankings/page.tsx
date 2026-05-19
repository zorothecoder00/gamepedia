"use client";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface RankingEntry {
  id: string; rank: number; points: number; wins: number;
  player?: { pseudo: string; city?: string };
  team?: { name: string; tag: string; slug: string };
}

interface GameRanking {
  game: { id: string; name: string; slug: string; color?: string; logoUrl?: string };
  top5: RankingEntry[];
}

interface RankingsData {
  season: { id: string; name: string } | null;
  rankings: GameRanking[];
}

const RANK_ICONS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["var(--accent-gold)", "#b0b0c0", "#cd7f32"];

export default function RankingsPage() {
  const { data, loading } = useApi<RankingsData>("/api/rankings");
  const season = data?.season;
  const rankings = data?.rankings ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Classements</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">
          {loading ? "Chargement..." : `Top 5 de chaque jeu actif${season ? ` — ${season.name}` : ""}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement des classements...</div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun classement disponible.</div>
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(380px,1fr))]">
          {rankings.map(({ game, top5 }) => {
            const color = game.color ?? "var(--accent-green)";
            return (
              <div key={game.slug} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
                {/* Game header */}
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, ${color}18, ${color}05)`, borderBottom: `1px solid ${color}33` }}
                >
                  <div className="flex items-center gap-3">
                    {game.logoUrl
                      ? <img src={game.logoUrl} alt={game.name} className="w-7 h-7 object-contain" />
                      : <span className="text-2xl">🎮</span>}
                    <div>
                      <div className="font-bold text-[0.95rem] text-[var(--text-primary)]">{game.name}</div>
                      <div className="text-[0.73rem] text-[var(--text-muted)]">{season?.name ?? "Saison active"}</div>
                    </div>
                  </div>
                  <Link href={`/rankings/${game.slug}`} className="text-[0.8rem] font-semibold no-underline hover:underline" style={{ color }}>
                    Voir tout →
                  </Link>
                </div>

                {/* Top 5 */}
                <div>
                  {top5.length === 0 ? (
                    <div className="px-5 py-4 text-[0.82rem] text-[var(--text-muted)]">Aucune entrée.</div>
                  ) : top5.map((entry, i) => {
                    const name = entry.player?.pseudo ?? entry.team?.name ?? "—";
                    const city = entry.player?.city ?? "";
                    const href = entry.player ? `/players/${entry.player.pseudo}` : `/teams/${entry.team?.slug}`;
                    return (
                      <div
                        key={entry.id}
                        className="px-5 py-3 flex items-center gap-3.5"
                        style={{
                          borderBottom: i < top5.length - 1 ? "1px solid var(--border)" : "none",
                          background: i === 0 ? "rgba(255,215,0,0.04)" : "transparent",
                        }}
                      >
                        <div className="w-7 text-center shrink-0">
                          {i < 3 ? <span className="text-base">{RANK_ICONS[i]}</span> : <span className="font-bold text-sm" style={{ color }}>#{entry.rank}</span>}
                        </div>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.7rem] shrink-0"
                          style={{ background: i < 3 ? `linear-gradient(135deg, ${RANK_COLORS[i]}, ${color})` : `${color}33`, color: i < 3 ? "#000" : color }}
                        >
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={href}
                            className={`block no-underline text-sm whitespace-nowrap overflow-hidden text-ellipsis hover:underline ${i === 0 ? "text-[var(--accent-gold)] font-bold" : i < 3 ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-primary)] font-medium"}`}
                          >
                            {name}
                          </Link>
                          {city && <span className="text-[0.72rem] text-[var(--text-muted)]">{city}</span>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-[0.9rem] text-[var(--accent-gold)]">{entry.points.toLocaleString()}</div>
                          <div className="text-[0.68rem] text-[var(--text-muted)]">pts</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--border)] px-5 py-3 flex justify-center">
                  <Link href={`/rankings/${game.slug}`} className="text-[0.82rem] font-medium text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors">
                    Classement complet →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
