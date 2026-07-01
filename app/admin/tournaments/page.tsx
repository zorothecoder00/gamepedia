"use client";
import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";
import TierBadge from "../../components/TierBadge";

interface AdminTournament {
  id: string;
  slug: string;
  name: string;
  tier: "S" | "A" | "B" | "C";
  status: string;
  startDate: string;
  games: { game: { name: string; slug: string } }[];
  _count: { participants: number };
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "À venir", color: "var(--accent-blue)" },
  ONGOING: { label: "En cours", color: "var(--accent-green)" },
  COMPLETED: { label: "Terminé", color: "var(--text-muted)" },
  CANCELLED: { label: "Annulé", color: "var(--accent-red)" },
};

const FILTERS = [
  { key: "", label: "Tous" },
  { key: "ONGOING", label: "En cours" },
  { key: "UPCOMING", label: "À venir" },
  { key: "COMPLETED", label: "Terminés" },
];

const NEXT_STATUS: string[] = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

export default function AdminTournamentsPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [filter, setFilter] = useState("");

  const query = filter ? `&status=${filter}` : "";
  const {
    data: tournaments,
    loading,
    refetch,
  } = useApi<AdminTournament[]>(
    token && isStaff ? `/api/tournaments?limit=100${query}` : null,
    [token, isStaff, filter],
    authHeader,
  );

  if (authLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }

  if (!token || !isStaff) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <p>Accès réservé à l&apos;administration.</p>
          <Link href="/" className="text-[var(--accent-green)] no-underline hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <Link
        href="/admin"
        className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5"
      >
        ← Dashboard
      </Link>

      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Tournois</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Gérez le statut et saisissez les résultats de chaque tournoi.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[0.82rem] border cursor-pointer transition-colors ${
              filter === f.key
                ? "bg-[var(--accent-green)] text-black font-semibold border-[var(--accent-green)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-bright)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !tournaments || tournaments.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun tournoi.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tournaments.map((t) => (
            <TournamentRow
              key={t.id}
              tournament={t}
              authHeader={authHeader}
              onChanged={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentRow({
  tournament,
  authHeader,
  onChanged,
}: {
  tournament: AdminTournament;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const st = STATUS_META[tournament.status] ?? STATUS_META.UPCOMING;
  const game = tournament.games?.[0]?.game.name ?? "—";
  const setStatus = useMutation(
    `/api/tournaments/${tournament.slug}/status`,
    "PATCH",
    authHeader,
    "Statut mis à jour.",
  );

  const onStatus = async (status: string) => {
    if (status === tournament.status) return;
    const r = await setStatus.mutate({ status });
    if (r) onChanged();
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-bold text-[0.95rem] text-[var(--text-primary)]">
            {tournament.name}
          </span>
          <TierBadge tier={tournament.tier} small />
        </div>
        <div className="text-[0.78rem] text-[var(--text-muted)]">
          {game} · {tournament._count.participants} participants ·{" "}
          {new Date(tournament.startDate).toLocaleDateString("fr-FR")}
        </div>
      </div>

      <select
        value={tournament.status}
        onChange={(e) => onStatus(e.target.value)}
        disabled={setStatus.loading}
        className="bg-[var(--bg-primary)] border rounded-lg text-[0.8rem] px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-50"
        style={{ color: st.color, borderColor: `${st.color}55` }}
      >
        {NEXT_STATUS.map((s) => (
          <option key={s} value={s} className="text-[var(--text-primary)] bg-[var(--bg-primary)]">
            {STATUS_META[s]?.label ?? s}
          </option>
        ))}
      </select>

      <Link
        href={`/admin/tournaments/${tournament.slug}/matches`}
        className="px-3.5 py-1.5 rounded-lg text-[0.8rem] font-semibold bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] no-underline hover:bg-[rgba(0,230,118,0.2)] transition-colors"
      >
        Saisir les résultats
      </Link>
    </div>
  );
}
