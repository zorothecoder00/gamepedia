"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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

interface GameOption {
  id: string;
  name: string;
}

const TOURNAMENT_FORMATS = ["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS", "MIXED"];
const TIERS = ["S", "A", "B", "C"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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
  const { me, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [filter, setFilter] = useState("");

  const query = filter ? `&status=${filter}` : "";
  const {
    data: tournaments,
    loading,
    refetch,
  } = useApi<AdminTournament[]>(
    isStaff ? `/api/tournaments?limit=100${query}` : null,
    [isStaff, filter],
  );

  if (authLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }

  if (!isStaff) {
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

      <AddTournamentForm onAdded={refetch} />

      <div className="flex gap-2 mb-6 mt-6 flex-wrap">
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
  onChanged,
}: {
  tournament: AdminTournament;
  onChanged: () => void;
}) {
  const st = STATUS_META[tournament.status] ?? STATUS_META.UPCOMING;
  const game = tournament.games?.[0]?.game.name ?? "—";
  const setStatus = useMutation(
    `/api/tournaments/${tournament.slug}/status`,
    "PATCH",
    undefined,
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

function AddTournamentForm({ onAdded }: { onAdded: () => void }) {
  const { data: games } = useApi<GameOption[]>("/api/games?all=true");
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [format, setFormat] = useState("SINGLE_ELIMINATION");
  const [participantType, setParticipantType] = useState<"TEAM" | "SOLO">("TEAM");
  const [tier, setTier] = useState("C");
  const [startDate, setStartDate] = useState("");
  const [location, setLocation] = useState("");
  const create = useMutation("/api/tournaments", "POST");

  const submit = async () => {
    if (!name.trim()) return toast.error("Le nom est requis.");
    if (!startDate) return toast.error("La date de début est requise.");

    const slug = slugify(name);
    const r = await create.mutate({
      name: name.trim(),
      slug,
      format,
      participantType,
      tier,
      startDate: new Date(startDate).toISOString(),
      location: location.trim() || undefined,
    });
    if (!r) return;

    // Associe le jeu choisi au tournoi tout juste créé (URL dynamique,
    // dépend du slug généré ci-dessus — pas adapté à useMutation).
    if (gameId) {
      await fetch(`/api/tournaments/${slug}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
    }

    toast.success("Tournoi créé.");
    setName("");
    setGameId("");
    setStartDate("");
    setLocation("");
    onAdded();
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-[0.85rem] font-bold text-[var(--text-primary)] mb-3">Ajouter un tournoi</h3>
      <div className="flex gap-2 flex-wrap items-end">
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Valorant Open Togo" className={`${field} w-52`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Jeu
          <select value={gameId} onChange={(e) => setGameId(e.target.value)} className={`${field} cursor-pointer w-36`}>
            <option value="">—</option>
            {games?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={`${field} cursor-pointer`}>
            {TOURNAMENT_FORMATS.map((f) => (
              <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Participants
          <select
            value={participantType}
            onChange={(e) => setParticipantType(e.target.value as "TEAM" | "SOLO")}
            className={`${field} cursor-pointer`}
          >
            <option value="TEAM">Équipes</option>
            <option value="SOLO">Solo</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Tier
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={`${field} cursor-pointer w-16`}>
            {TIERS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Début
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${field} w-36`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Lieu
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lomé, Togo" className={`${field} w-36`} />
        </label>
        <button
          onClick={submit}
          disabled={create.loading}
          className="px-4 py-1.5 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {create.loading ? "…" : "Créer"}
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
