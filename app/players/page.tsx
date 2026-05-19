"use client";
import { useState } from "react";
import PlayerCard, { PlayerCardData } from "../components/PlayerCard";
import { useApi } from "@/hooks/useApi";

interface ApiPlayer {
  id: string; pseudo: string; city?: string; region?: string; isVerified?: boolean;
  gameProfiles: { game: { name: string; slug: string } }[];
  teamMembers: { team: { name: string; tag: string; slug: string } }[];
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (gameFilter) params.set("game", gameFilter);
  if (cityFilter) params.set("city", cityFilter);
  params.set("page", String(page));

  const { data: players, meta, loading } = useApi<ApiPlayer[]>(
    `/api/players?${params.toString()}`,
    [search, gameFilter, cityFilter, page],
  );
  const { data: games } = useApi<{ name: string; slug: string }[]>("/api/games");

  const toCardData = (p: ApiPlayer): PlayerCardData => ({
    pseudo: p.pseudo, city: p.city, isVerified: p.isVerified,
    games: p.gameProfiles.map((gp) => gp.game.name),
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Annuaire des Joueurs</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">
          {loading ? "Chargement..." : `${meta?.total ?? 0} joueurs inscrits sur GamePedia TG`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 mb-6 flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] px-3.5 py-2 text-sm outline-none"
          />
        </div>
        <select
          value={gameFilter}
          onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
          className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3.5 py-2 text-sm outline-none"
        >
          <option value="">Tous les jeux</option>
          {(games ?? []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Ville..."
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
          className="w-36 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3.5 py-2 text-sm outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !players || players.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun joueur trouvé.</div>
      ) : (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {players.map((player) => <PlayerCard key={player.pseudo} player={toCardData(player)} />)}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${p === page ? "bg-[var(--accent-green)] text-black font-bold" : "bg-[var(--bg-card)] text-[var(--text-secondary)] font-medium"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
