"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface AdminPlayer {
  id: string;
  pseudo: string;
  city?: string | null;
  region?: string | null;
  isVerified: boolean;
  isActive: boolean;
  gameProfiles: { game: { name: string; slug: string } }[];
  teamMemberships: { team: { name: string; tag: string; slug: string } }[];
}

export default function AdminPlayersPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [search, setSearch] = useState("");

  const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
  const {
    data: players,
    loading,
    refetch,
  } = useApi<AdminPlayer[]>(
    token && isStaff ? `/api/players?limit=50${q}` : null,
    [token, isStaff, search],
    authHeader,
  );

  if (authLoading) {
    return <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!token || !isStaff) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <p>Accès réservé à l&apos;administration.</p>
          <Link href="/" className="text-[var(--accent-green)] no-underline hover:underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <Link href="/admin" className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5">
        ← Dashboard
      </Link>
      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Joueurs</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Vérifiez, suspendez ou supprimez les profils joueurs.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un pseudo…"
        className="w-full max-w-sm mb-6 bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2 text-[0.88rem] outline-none box-border"
      />

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !players || players.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun joueur.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} authHeader={authHeader} onChanged={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  authHeader,
  onChanged,
}: {
  player: AdminPlayer;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const patch = useMutation(`/api/players/${player.pseudo}`, "PATCH", authHeader);
  const del = useMutation(`/api/players/${player.pseudo}`, "DELETE", authHeader);
  const busy = patch.loading || del.loading;
  const team = player.teamMemberships[0]?.team;
  const games = player.gameProfiles.map((g) => g.game.name).join(", ");

  const toggleVerified = async () => {
    const r = await patch.mutate({ isVerified: !player.isVerified });
    if (r) {
      toast.success(player.isVerified ? "Vérification retirée." : "Joueur vérifié.");
      onChanged();
    }
  };
  const toggleActive = async () => {
    const r = await patch.mutate({ isActive: !player.isActive });
    if (r) {
      toast.success(player.isActive ? "Joueur suspendu." : "Joueur réactivé.");
      onChanged();
    }
  };
  const remove = async () => {
    if (!confirm(`Supprimer définitivement ${player.pseudo} ?`)) return;
    const r = await del.mutate();
    if (r) {
      toast.success("Joueur supprimé.");
      onChanged();
    }
  };

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap ${
        player.isActive ? "border-[var(--border)]" : "border-[rgba(255,68,68,0.35)] opacity-70"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[rgba(0,230,118,0.12)] flex items-center justify-center font-bold text-[0.8rem] text-[var(--accent-green)] shrink-0">
        {player.pseudo.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/players/${player.pseudo}`}
            className="font-bold text-[0.95rem] text-[var(--text-primary)] no-underline hover:text-[var(--accent-green)]"
          >
            {player.pseudo}
          </Link>
          {player.isVerified && (
            <span className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[rgba(79,195,247,0.12)] text-[var(--accent-blue)] border border-[rgba(79,195,247,0.3)]">
              ✓ Vérifié
            </span>
          )}
          {!player.isActive && (
            <span className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[rgba(255,68,68,0.12)] text-[var(--accent-red)] border border-[rgba(255,68,68,0.3)]">
              Suspendu
            </span>
          )}
        </div>
        <div className="text-[0.76rem] text-[var(--text-muted)] mt-0.5">
          {[player.city, games || null, team ? `[${team.tag}]` : null].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={toggleVerified}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-50 transition-colors"
        >
          {player.isVerified ? "Retirer ✓" : "Vérifier"}
        </button>
        <button
          onClick={toggleActive}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] disabled:opacity-50 transition-colors"
        >
          {player.isActive ? "Suspendre" : "Réactiver"}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.78rem] text-[var(--text-muted)] border border-[var(--border)] cursor-pointer hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] disabled:opacity-50 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
