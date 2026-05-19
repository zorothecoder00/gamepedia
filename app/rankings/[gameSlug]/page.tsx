"use client";
import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface RankingEntry {
  id: string; rank: number; points: number; wins: number;
  top3?: number; tournamentsPlayed?: number; prizeMoney?: number; prevRank?: number;
  player?: { pseudo: string; city?: string; isVerified?: boolean };
  team?: { name: string; tag: string; slug: string };
  season?: { name: string };
}

interface Season { id: string; name: string; isActive: boolean }
interface Game { name: string; slug: string; color?: string; logoUrl?: string }

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

export default function GameRankingPage({ params }: { params: { gameSlug: string } }) {
  const { gameSlug } = params;
  const [seasonId, setSeasonId] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: gameData } = useApi<Game>(`/api/games/${gameSlug}`);
  const { data: seasons } = useApi<Season[]>(`/api/rankings/${gameSlug}/seasons`);

  const rankUrl = seasonId
    ? `/api/rankings/${gameSlug}/${seasonId}?page=${page}`
    : `/api/rankings/${gameSlug}?page=${page}`;

  const { data: entries, meta, loading } = useApi<RankingEntry[]>(rankUrl, [gameSlug, seasonId, page]);

  const game = gameData ?? { name: gameSlug, slug: gameSlug, color: "var(--accent-blue)" };
  const color = game.color ?? "var(--accent-blue)";

  const medalIcons = ["🥇", "🥈", "🥉"];
  const medalColors = ["var(--accent-gold)", "#b0b0c0", "#cd7f32"];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex gap-1.5 items-center mb-5 text-[0.8rem]">
        <Link href="/rankings" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]">Classements</Link>
        <span className="text-[var(--border-bright)]">›</span>
        <span className="text-[var(--text-secondary)]">{game.name}</span>
      </div>

      {/* Header */}
      <div
        className="rounded-xl p-6 mb-8 flex items-center justify-between flex-wrap gap-4"
        style={{ background: `linear-gradient(135deg, ${color}15, var(--bg-primary))`, border: `1px solid ${color}33` }}
      >
        <div className="flex items-center gap-4">
          {game.logoUrl
            ? <img src={game.logoUrl} alt={game.name} className="w-10 h-10 object-contain" />
            : <span className="text-[2.5rem]">🎮</span>}
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1">Classement {game.name}</h1>
            <p className="text-[0.83rem] text-[var(--text-muted)]">
              {loading ? "..." : `${meta?.total ?? 0} joueurs classés`}
              {entries?.[0]?.season ? ` · ${entries[0].season.name}` : ""}
            </p>
          </div>
        </div>
        {seasons && seasons.length > 0 && (
          <select
            value={seasonId}
            onChange={(e) => { setSeasonId(e.target.value); setPage(1); }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] px-4 py-2 text-sm outline-none"
          >
            <option value="">Saison active</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !entries || entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucune entrée de classement.</div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* Header row */}
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
                className={`grid [grid-template-columns:60px_40px_1fr_120px_70px_70px_70px_130px] px-4 py-3.5 gap-2 items-center ${i < entries.length - 1 ? "border-b border-[var(--border)]" : ""} ${entry.rank === 1 ? "bg-[rgba(255,215,0,0.04)]" : entry.rank === 2 ? "bg-[rgba(176,176,192,0.04)]" : entry.rank === 3 ? "bg-[rgba(205,127,50,0.04)]" : "bg-transparent"}`}
              >
                <div>
                  {entry.rank <= 3
                    ? <span className="text-xl">{medalIcons[entry.rank - 1]}</span>
                    : <span className="font-bold text-[0.9rem]" style={{ color }}>#{entry.rank}</span>}
                </div>
                <div><MovementBadge current={entry.rank} prev={entry.prevRank} /></div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.68rem] shrink-0 text-black"
                    style={{ background: `linear-gradient(135deg, ${color}, var(--accent-blue))` }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={href}
                        className={`no-underline text-sm hover:underline ${entry.rank === 1 ? "text-[var(--accent-gold)] font-bold" : entry.rank === 2 ? "text-[#b0b0c0] font-bold" : entry.rank === 3 ? "text-[#cd7f32] font-bold" : "text-[var(--text-primary)] font-medium"}`}
                      >
                        {name}
                      </Link>
                      {isVerified && <span className="text-[var(--accent-blue)] text-[0.7rem]">✓</span>}
                    </div>
                    {city && <div className="text-[0.72rem] text-[var(--text-muted)]">{city}</div>}
                  </div>
                </div>
                <div className="font-bold text-[0.9rem] text-[var(--accent-gold)]">{entry.points.toLocaleString()} pts</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.wins}</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.top3 ?? "—"}</div>
                <div className="text-sm text-[var(--text-secondary)]">{entry.tournamentsPlayed ?? "—"}</div>
                <div className={`text-[0.8rem] ${entry.prizeMoney ? "text-[var(--accent-green)] font-semibold" : "text-[var(--text-muted)]"}`}>
                  {entry.prizeMoney ? `${entry.prizeMoney.toLocaleString()} XOF` : "—"}
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
                color: p === page ? "#000" : "var(--text-secondary)",
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
