"use client";
import { useState } from "react";
import TournamentCard, { TournamentCardData } from "../components/TournamentCard";
import { useApi } from "@/hooks/useApi";

interface ApiTournament {
  id: string; slug: string; name: string;
  tier: "S" | "A" | "B" | "C";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  startDate: string; endDate?: string;
  prizePool?: number; currency?: string; location?: string;
  games: { game: { name: string; slug: string } }[];
  _count: { participants: number };
}

const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "UPCOMING", label: "À venir" },
  { key: "ONGOING", label: "En cours" },
  { key: "COMPLETED", label: "Terminé" },
];

const TIERS = ["S", "A", "B", "C"];
const YEARS = ["2025", "2024", "2023"];

export default function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (tierFilter) params.set("tier", tierFilter);
  if (gameFilter) params.set("game", gameFilter);
  if (yearFilter) params.set("year", yearFilter);
  params.set("page", String(page));

  const { data: tournaments, meta, loading } = useApi<ApiTournament[]>(
    `/api/tournaments?${params.toString()}`,
    [statusFilter, tierFilter, gameFilter, yearFilter, page],
  );
  const { data: games } = useApi<{ name: string; slug: string }[]>("/api/games");

  const toCardData = (t: ApiTournament): TournamentCardData => ({
    slug: t.slug, name: t.name, game: t.games?.[0]?.game.name ?? "—",
    tier: t.tier, status: t.status, startDate: t.startDate, endDate: t.endDate,
    prizePool: t.prizePool, currency: t.currency,
    participantCount: t._count.participants, location: t.location,
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Tournois</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">
          {loading ? "Chargement..." : `${meta?.total ?? 0} tournois enregistrés sur GamePedia TG`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${statusFilter === f.key ? "bg-[var(--accent-green)] text-black font-semibold" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-3.5 mb-7 flex gap-3 flex-wrap items-center">
        <span className="text-[0.82rem] text-[var(--text-muted)]">Filtres :</span>
        {[
          { value: gameFilter, onChange: setGameFilter, placeholder: "Tous les jeux", options: (games ?? []).map((g) => ({ value: g.slug, label: g.name })) },
          { value: tierFilter, onChange: setTierFilter, placeholder: "Tous les tiers", options: TIERS.map((t) => ({ value: t, label: `Tier ${t}` })) },
          { value: yearFilter, onChange: setYearFilter, placeholder: "Toutes les années", options: YEARS.map((y) => ({ value: y, label: y })) },
        ].map((sel, idx) => (
          <select
            key={idx}
            value={sel.value}
            onChange={(e) => { sel.onChange(e.target.value); setPage(1); }}
            className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3 py-1.5 text-[0.82rem] outline-none"
          >
            <option value="">{sel.placeholder}</option>
            {sel.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !tournaments || tournaments.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun tournoi trouvé.</div>
      ) : (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(310px,1fr))]">
          {tournaments.map((t) => <TournamentCard key={t.slug} tournament={toCardData(t)} />)}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer ${p === page ? "bg-[var(--accent-green)] text-black font-bold" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
