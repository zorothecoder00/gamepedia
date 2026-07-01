"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface AdminGame {
  id: string;
  name: string;
  slug: string;
  genre?: string | null;
  format: string;
  platforms?: string | null;
  isActive: boolean;
  _count: { playerProfiles: number; tournamentGames: number };
}

const FORMATS = [
  "FIVE_VS_FIVE",
  "ONE_VS_ONE",
  "TWO_VS_TWO",
  "FOUR_VS_FOUR",
  "BATTLE_ROYALE",
  "MOBA",
  "FREE_FOR_ALL",
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AdminGamesPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";

  const {
    data: games,
    loading,
    refetch,
  } = useApi<AdminGame[]>(
    token && isStaff ? "/api/games?all=true" : null,
    [token, isStaff],
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
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <Link href="/admin" className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5">
        ← Dashboard
      </Link>
      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Jeux</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Ajoutez des jeux et activez/désactivez leur visibilité sur la plateforme.
      </p>

      <AddGameForm authHeader={authHeader} onAdded={refetch} />

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !games || games.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun jeu.</div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-6">
          {games.map((g) => (
            <GameRow key={g.id} game={g} authHeader={authHeader} onChanged={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameRow({
  game,
  authHeader,
  onChanged,
}: {
  game: AdminGame;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const patch = useMutation(`/api/games/${game.slug}`, "PATCH", authHeader);

  const toggle = async () => {
    const r = await patch.mutate({ isActive: !game.isActive });
    if (r) {
      toast.success(game.isActive ? "Jeu désactivé." : "Jeu activé.");
      onChanged();
    }
  };

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap ${
        game.isActive ? "border-[var(--border)]" : "border-[var(--border)] opacity-60"
      }`}
    >
      <span className="text-2xl shrink-0">🎮</span>
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[0.95rem] text-[var(--text-primary)]">{game.name}</span>
          <span className="text-[0.68rem] text-[var(--text-muted)]">/{game.slug}</span>
          {!game.isActive && (
            <span className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[rgba(255,68,68,0.1)] text-[var(--accent-red)] border border-[rgba(255,68,68,0.25)]">
              Désactivé
            </span>
          )}
        </div>
        <div className="text-[0.76rem] text-[var(--text-muted)] mt-0.5">
          {[game.genre, game.platforms, `${game._count.tournamentGames} tournois`, `${game._count.playerProfiles} joueurs`]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={patch.loading}
        className={`px-3.5 py-1.5 rounded-lg text-[0.8rem] font-semibold border cursor-pointer disabled:opacity-50 transition-colors ${
          game.isActive
            ? "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:border-[var(--accent-red)]"
            : "bg-[rgba(0,230,118,0.1)] border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] hover:bg-[rgba(0,230,118,0.2)]"
        }`}
      >
        {patch.loading ? "…" : game.isActive ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}

function AddGameForm({ authHeader, onAdded }: { authHeader?: Record<string, string>; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [format, setFormat] = useState("FIVE_VS_FIVE");
  const [platforms, setPlatforms] = useState("");
  const create = useMutation("/api/games", "POST", authHeader, "Jeu ajouté.");

  const submit = async () => {
    if (!name.trim()) return toast.error("Le nom est requis.");
    const r = await create.mutate({
      name: name.trim(),
      slug: slugify(name),
      genre: genre.trim() || undefined,
      format,
      platforms: platforms.trim() || undefined,
    });
    if (r) {
      setName("");
      setGenre("");
      setPlatforms("");
      onAdded();
    }
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-[0.85rem] font-bold text-[var(--text-primary)] mb-3">Ajouter un jeu</h3>
      <div className="flex gap-2 flex-wrap items-end">
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Valorant" className={`${field} w-40`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Genre
          <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="FPS" className={`${field} w-28`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={`${field} cursor-pointer`}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Plateformes
          <input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="PC,Mobile" className={`${field} w-32`} />
        </label>
        <button
          onClick={submit}
          disabled={create.loading}
          className="px-4 py-1.5 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {create.loading ? "…" : "Ajouter"}
        </button>
      </div>
      {name.trim() && (
        <p className="text-[0.7rem] text-[var(--text-muted)] mt-2">
          slug : <span className="text-[var(--text-secondary)]">/{slugify(name) || "…"}</span>
        </p>
      )}
    </div>
  );
}
