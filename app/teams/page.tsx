"use client";
import { useState } from "react";
import Link from "next/link";
import GameTag from "../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface Team {
  id: string; slug: string; name: string; tag: string;
  city?: string; region?: string; color?: string; logoUrl?: string; foundedAt?: string;
  _count: { members: number };
  members: { player: { pseudo: string; isVerified?: boolean } }[];
}

const REGIONS = ["Maritime", "Centrale", "Savanes", "Kara", "Plateaux", "Lomé"];

export default function TeamsPage() {
  const [gameFilter, setGameFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (gameFilter) params.set("game", gameFilter);
  if (regionFilter) params.set("region", regionFilter);
  params.set("page", String(page));

  const { data: teams, meta, loading } = useApi<Team[]>(
    `/api/teams?${params.toString()}`, [gameFilter, regionFilter, page],
  );
  const { data: games } = useApi<{ name: string; slug: string }[]>("/api/games");

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Équipes</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">
          {loading ? "Chargement..." : `${meta?.total ?? 0} équipes inscrites sur GamePedia TG`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-7 flex-wrap items-center">
        <select
          value={gameFilter}
          onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3.5 py-2 text-sm outline-none"
        >
          <option value="">Tous les jeux</option>
          {(games ?? []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
        <select
          value={regionFilter}
          onChange={(e) => { setRegionFilter(e.target.value); setPage(1); }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3.5 py-2 text-sm outline-none"
        >
          <option value="">Toutes les régions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !teams || teams.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucune équipe trouvée.</div>
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
          {teams.map((team) => {
            const color = team.color ?? "var(--accent-green)";
            return (
              <Link key={team.slug} href={`/teams/${team.slug}`} className="no-underline">
                <div
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 cursor-pointer h-full transition-all duration-150 hover:-translate-y-0.5"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = color)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-[52px] h-[52px] rounded-[10px] flex items-center justify-center text-[1.75rem] overflow-hidden"
                      style={{ background: `${color}20`, border: `1px solid ${color}44` }}
                    >
                      {team.logoUrl
                        ? <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        : "🛡️"}
                    </div>
                    <div>
                      <div className="font-bold text-[0.95rem] text-[var(--text-primary)]">{team.name}</div>
                      <span
                        className="text-[0.68rem] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                      >
                        {team.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-3.5">
                    {team.members.slice(0, 4).map((m) => <GameTag key={m.player.pseudo} name={m.player.pseudo} color={color} />)}
                    {team._count.members > 4 && <GameTag name={`+${team._count.members - 4}`} color="var(--text-muted)" />}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-[0.78rem] text-[var(--text-muted)]">
                      {team.city && `📍 ${team.city}`}
                      {team._count.members > 0 && ` · 👥 ${team._count.members} membres`}
                    </div>
                    {team.foundedAt && (
                      <div className="text-[0.72rem] text-[var(--text-muted)]">
                        Depuis {new Date(team.foundedAt).getFullYear()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${p === page ? "bg-[var(--accent-green)] text-black font-bold" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
