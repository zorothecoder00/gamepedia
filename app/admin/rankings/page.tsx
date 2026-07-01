"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface Season {
  id: string;
  name: string;
  year: number;
  quarter?: number | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  game: { name: string; slug: string };
  _count: { rankingEntries: number };
}
interface Game {
  id: string;
  name: string;
  slug: string;
}

function seasonStatus(s: Season): { label: string; color: string } {
  if (s.isActive) return { label: "Active", color: "var(--accent-green)" };
  if (s.endDate) return { label: "Clôturée", color: "var(--text-muted)" };
  return { label: "En attente", color: "var(--accent-blue)" };
}

export default function AdminRankingsPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";

  const {
    data: seasons,
    loading,
    refetch,
  } = useApi<Season[]>(
    token && isStaff ? "/api/seasons" : null,
    [token, isStaff],
    authHeader,
  );
  const { data: games } = useApi<Game[]>(
    token && isStaff ? "/api/games" : null,
    [token, isStaff],
    authHeader,
  );

  const recalcAll = useMutation(
    "/api/rankings/recalculate",
    "POST",
    authHeader,
    "Recalcul global déclenché.",
  );

  const [showCreate, setShowCreate] = useState(false);

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

  // Regroupe les saisons par jeu
  const byGame = new Map<string, { game: Season["game"]; seasons: Season[] }>();
  for (const s of seasons ?? []) {
    const entry = byGame.get(s.game.slug) ?? { game: s.game, seasons: [] };
    entry.seasons.push(s);
    byGame.set(s.game.slug, entry);
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <Link
        href="/admin"
        className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5"
      >
        ← Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)]">Classements & saisons</h1>
        <button
          onClick={() => recalcAll.mutate()}
          disabled={recalcAll.loading}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[0.82rem] font-semibold text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
        >
          {recalcAll.loading ? "…" : "↻ Recalculer tous les classements"}
        </button>
      </div>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Activez la saison en cours, clôturez les saisons terminées et recalculez
        les points depuis les résultats.
      </p>

      <button
        onClick={() => setShowCreate((v) => !v)}
        className="text-[0.85rem] font-semibold text-[var(--accent-green)] bg-transparent border-none cursor-pointer mb-4 hover:opacity-80"
      >
        {showCreate ? "− Fermer" : "+ Nouvelle saison"}
      </button>

      {showCreate && (
        <CreateSeasonForm
          games={games ?? []}
          authHeader={authHeader}
          onCreated={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : byGame.size === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          Aucune saison. Créez-en une pour commencer.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {[...byGame.values()].map(({ game, seasons: gs }) => (
            <section key={game.slug}>
              <h2 className="text-[1.1rem] font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                🎮 {game.name}
              </h2>
              <div className="flex flex-col gap-2.5">
                {gs.map((s) => (
                  <SeasonCard
                    key={s.id}
                    season={s}
                    authHeader={authHeader}
                    onChanged={refetch}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SeasonCard({
  season,
  authHeader,
  onChanged,
}: {
  season: Season;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const st = seasonStatus(season);
  const activate = useMutation(`/api/seasons/${season.id}/activate`, "POST", authHeader, "Saison activée.");
  const close = useMutation(`/api/seasons/${season.id}/close`, "POST", authHeader, "Saison clôturée.");
  const recalc = useMutation(
    `/api/rankings/${season.game.slug}/${season.id}/recalculate`,
    "POST",
    authHeader,
    "Recalcul de la saison déclenché.",
  );
  const busy = activate.loading || close.loading || recalc.loading;

  const run = async (m: { mutate: (b?: unknown) => Promise<unknown> }) => {
    const r = await m.mutate();
    if (r) onChanged();
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-bold text-[0.95rem] text-[var(--text-primary)]">{season.name}</span>
          <span
            className="text-[0.68rem] font-semibold px-2 py-0.5 rounded"
            style={{ color: st.color, border: `1px solid ${st.color}55` }}
          >
            {st.label}
          </span>
        </div>
        <div className="text-[0.78rem] text-[var(--text-muted)]">
          {season.year}
          {season.quarter ? ` · T${season.quarter}` : ""} ·{" "}
          {new Date(season.startDate).toLocaleDateString("fr-FR")}
          {season.endDate ? ` → ${new Date(season.endDate).toLocaleDateString("fr-FR")}` : ""} ·{" "}
          {season._count.rankingEntries} entrées
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!season.isActive && (
          <button
            onClick={() => run(activate)}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-[0.8rem] font-semibold bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] cursor-pointer hover:bg-[rgba(0,230,118,0.2)] disabled:opacity-50 transition-colors"
          >
            Activer
          </button>
        )}
        {season.isActive && (
          <button
            onClick={() => run(close)}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-[0.8rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] disabled:opacity-50 transition-colors"
          >
            Clôturer
          </button>
        )}
        <button
          onClick={() => run(recalc)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.8rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
        >
          {recalc.loading ? "…" : "↻ Recalculer"}
        </button>
      </div>
    </div>
  );
}

function CreateSeasonForm({
  games,
  authHeader,
  onCreated,
}: {
  games: Game[];
  authHeader?: Record<string, string>;
  onCreated: () => void;
}) {
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState("");
  const [startDate, setStartDate] = useState("");
  const create = useMutation("/api/seasons", "POST", authHeader, "Saison créée.");

  const submit = async () => {
    if (!gameId) return toast.error("Choisissez un jeu.");
    if (!name.trim()) return toast.error("Donnez un nom à la saison.");
    if (!startDate) return toast.error("Indiquez une date de début.");
    const r = await create.mutate({
      gameId,
      name: name.trim(),
      year: Number(year),
      quarter: quarter ? Number(quarter) : undefined,
      startDate: new Date(startDate).toISOString(),
    });
    if (r) onCreated();
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-[0.85rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-6">
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <select value={gameId} onChange={(e) => setGameId(e.target.value)} className={`${field} cursor-pointer`}>
          <option value="">— Jeu —</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (ex : Saison 1 - 2026)"
          className={field}
        />
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          placeholder="Année"
          className={field}
        />
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className={`${field} cursor-pointer`}>
          <option value="">Trimestre (optionnel)</option>
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>
              T{q}
            </option>
          ))}
        </select>
        <label className="text-[0.78rem] text-[var(--text-muted)] flex flex-col gap-1">
          Date de début
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
        </label>
      </div>
      <button
        onClick={submit}
        disabled={create.loading}
        className="px-5 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {create.loading ? "…" : "Créer la saison"}
      </button>
    </div>
  );
}
