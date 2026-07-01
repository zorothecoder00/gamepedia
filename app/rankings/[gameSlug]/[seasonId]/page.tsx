"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

const GAME_COLORS: Record<string, string> = {
  "valorant": "#e63030",
  "free-fire": "#ff8c00",
  "fifa-25": "#00c44a",
  "mobile-legends": "#ffcc00",
  "cs2": "#e3a04f",
  "pubg-mobile": "#f5c518",
  "league-of-legends": "#c89b3c",
};
const getGameColor = (slug: string) => GAME_COLORS[slug] ?? "#00c44a";

interface RankingEntry {
  id: string; rank: number; totalPoints: number; wins: number;
  top3Finishes?: number; tournamentsPlayed?: number; totalPrizeMoney?: number; prevRank?: number;
  player?: { pseudo: string; city?: string; isVerified?: boolean };
  team?: { name: string; tag: string; slug: string };
}
interface Season { id: string; name: string; isActive: boolean }
interface Game { name: string; slug: string; logo?: string }
interface SeasonSummary {
  name: string; year: number; participants: number; totalPrize: number; tournamentsCount: number;
}

function MovementBadge({ current, prev }: { current: number; prev?: number }) {
  if (!prev || prev === current) return <span className="text-[0.72rem] text-[var(--text-muted)]">—</span>;
  const diff = prev - current;
  const isUp = diff > 0;
  return (
    <span className={`text-[0.72rem] font-semibold ${isUp ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
      {isUp ? "▲" : "▼"} {Math.abs(diff)}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[1.2rem] font-black text-[var(--text-primary)]">{value}</div>
      <div className="text-[0.72rem] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function SeasonRankingPage({ params }: { params: { gameSlug: string; seasonId: string } }) {
  const { gameSlug, seasonId } = params;
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data: gameData } = useApi<Game>(`/api/games/${gameSlug}`);
  const { data: seasons } = useApi<Season[]>(`/api/rankings/${gameSlug}/seasons`);
  const { data: entries, meta, loading } = useApi<RankingEntry[]>(
    `/api/rankings/${gameSlug}/${seasonId}?page=${page}`,
    [gameSlug, seasonId, page],
  );

  const game = gameData ?? { name: gameSlug, slug: gameSlug };
  const color = getGameColor(gameSlug);
  const medalIcons = ["🥇", "🥈", "🥉"];
  const summary = (meta as unknown as { season?: SeasonSummary } | null)?.season;

  const onSeasonChange = (value: string) => {
    router.push(value ? `/rankings/${gameSlug}/${value}` : `/rankings/${gameSlug}`);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex gap-1.5 items-center mb-5 text-[0.8rem]">
        <Link href="/rankings" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]">Classements</Link>
        <span className="text-[var(--border-bright)]">›</span>
        <Link href={`/rankings/${gameSlug}`} className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]">{game.name}</Link>
        <span className="text-[var(--border-bright)]">›</span>
        <span className="text-[var(--text-secondary)]">{summary?.name ?? "Saison"}</span>
      </div>

      {/* Header */}
      <div
        className="rounded-xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4"
        style={{ background: `linear-gradient(135deg, ${color}12, var(--bg-primary))`, border: `1px solid ${color}30` }}
      >
        <div className="flex items-center gap-4">
          {game.logo
            ? <Image src={game.logo} alt={game.name} width={40} height={40} className="object-contain" unoptimized />
            : <span className="text-[2.5rem]">🎮</span>}
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1">Classement {game.name}</h1>
            <p className="text-[0.83rem] text-[var(--text-muted)]">
              {summary?.name ?? "Saison"}{summary?.year ? ` · ${summary.year}` : ""}
            </p>
          </div>
        </div>
        {seasons && seasons.length > 0 && (
          <select
            value={seasonId}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] px-4 py-2 text-sm outline-none"
          >
            <option value="">Saison active</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {/* Résumé de la saison */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
          <SummaryStat label="Participants classés" value={summary.participants} />
          <SummaryStat label="Tournois inclus" value={summary.tournamentsCount} />
          <SummaryStat label="Prize distribué" value={`${summary.totalPrize.toLocaleString("fr-FR")} XOF`} />
          <SummaryStat label="Année" value={summary.year || "—"} />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !entries || entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucune entrée pour cette saison.</div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="grid [grid-template-columns:60px_40px_1fr_120px_70px_70px_70px_130px] bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3 gap-2 text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {["Rang", "Mvt", "Joueur", "Points", "Wins", "Top 3", "Tournois", "Prize Money"].map((h) => (
              <div key={h}>{h}</div>
            ))}
          </div>

          {entries.map((entry, i) => {
            const name = entry.player?.pseudo ?? entry.team?.name ?? "—";
            const city = entry.player?.city ?? "";
            const isVerified = entry.player?.isVerified;
            const href = entry.player ? `/players/${entry.player.pseudo}` : `/teams/${entry.team?.slug ?? ""}`;

            return (
              <div
                key={entry.id}
                className={`grid [grid-template-columns:60px_40px_1fr_120px_70px_70px_70px_130px] px-4 py-3.5 gap-2 items-center ${
                  i < entries.length - 1 ? "border-b border-[var(--border)]" : ""
                } ${
                  entry.rank === 1 ? "bg-[rgba(255,204,0,0.04)]"
                  : entry.rank === 2 ? "bg-[rgba(192,192,192,0.03)]"
                  : entry.rank === 3 ? "bg-[rgba(205,127,50,0.03)]"
                  : "bg-transparent"
                }`}
              >
                <div>
                  {entry.rank <= 3
                    ? <span className="text-xl">{medalIcons[entry.rank - 1]}</span>
                    : <span className="font-bold text-[0.9rem]" style={{ color }}>#{entry.rank}</span>}
                </div>
                <div><MovementBadge current={entry.rank} prev={entry.prevRank} /></div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.68rem] shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, var(--accent-gold))`, color: "#09090f" }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={href}
                        className={`no-underline text-sm hover:underline ${
                          entry.rank === 1 ? "text-[var(--accent-gold)] font-bold"
                          : entry.rank === 2 ? "text-[#b0b0c0] font-bold"
                          : entry.rank === 3 ? "text-[#cd7f32] font-bold"
                          : "text-[var(--text-primary)] font-medium"
                        }`}
                      >
                        {name}
                      </Link>
                      {isVerified && <span className="text-[var(--accent-green)] text-[0.7rem]" title="Vérifié">✓</span>}
                    </div>
                    {city && <div className="text-[0.72rem] text-[var(--text-muted)]">{city}</div>}
                  </div>
                </div>
                <div className="font-bold text-[0.9rem] text-[var(--accent-gold)]">{entry.totalPoints.toLocaleString()} pts</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.wins}</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.top3Finishes ?? "—"}</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.tournamentsPlayed ?? "—"}</div>
                <div className={`text-[0.8rem] ${entry.totalPrizeMoney ? "text-[var(--accent-green)] font-semibold" : "text-[var(--text-muted)]"}`}>
                  {entry.totalPrizeMoney ? `${entry.totalPrizeMoney.toLocaleString()} XOF` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer"
              style={{
                background: p === page ? color : "var(--bg-card)",
                color: p === page ? "#09090f" : "var(--text-secondary)",
                fontWeight: p === page ? 700 : 400,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
