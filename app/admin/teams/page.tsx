"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface TeamMemberLite {
  player: { pseudo: string; isVerified: boolean };
}
interface AdminTeam {
  id: string;
  name: string;
  slug: string;
  tag: string;
  city?: string | null;
  region?: string | null;
  isActive: boolean;
  _count: { members: number };
  members: TeamMemberLite[];
}

export default function AdminTeamsPage() {
  const { me, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [search, setSearch] = useState("");

  const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
  const {
    data: teams,
    loading,
    refetch,
  } = useApi<AdminTeam[]>(
    isStaff ? `/api/teams?all=true&limit=100${q}` : null,
    [isStaff, search],
  );

  if (authLoading) {
    return <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!isStaff) {
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
      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Équipes</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Validez (activez), modifiez ou désactivez les équipes.
      </p>

      <AddTeamForm onAdded={refetch} />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une équipe…"
        className="w-full max-w-sm mb-6 mt-6 bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2 text-[0.88rem] outline-none box-border"
      />

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !teams || teams.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucune équipe.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {teams.map((t) => (
            <TeamRow key={t.id} team={t} onChanged={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function AddTeamForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const create = useMutation("/api/teams", "POST", undefined, "Équipe créée.");

  const submit = async () => {
    if (!name.trim()) return toast.error("Le nom est requis.");
    if (!tag.trim()) return toast.error("Le tag est requis.");
    const r = await create.mutate({
      name: name.trim(),
      slug: slugify(name),
      tag: tag.trim(),
      city: city.trim() || undefined,
      region: region.trim() || undefined,
    });
    if (r) {
      setName("");
      setTag("");
      setCity("");
      setRegion("");
      onAdded();
    }
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-[0.85rem] font-bold text-[var(--text-primary)] mb-3">Ajouter une équipe</h3>
      <div className="flex gap-2 flex-wrap items-end">
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Togo Esports" className={`${field} w-44`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Tag
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="TGE" className={`${field} w-20`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Ville
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lomé" className={`${field} w-32`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Région
          <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Maritime" className={`${field} w-32`} />
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

function TeamRow({
  team,
  onChanged,
}: {
  team: AdminTeam;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [tag, setTag] = useState(team.tag);
  const [city, setCity] = useState(team.city ?? "");
  const [region, setRegion] = useState(team.region ?? "");

  const patch = useMutation(`/api/teams/${team.slug}`, "PATCH");
  const busy = patch.loading;

  const roster = team.members.map((m) => m.player.pseudo).join(", ");

  const toggleActive = async () => {
    const r = await patch.mutate({ isActive: !team.isActive });
    if (r) {
      toast.success(team.isActive ? "Équipe désactivée." : "Équipe activée.");
      onChanged();
    }
  };

  const saveEdit = async () => {
    if (!name.trim()) return toast.error("Le nom est requis.");
    if (!tag.trim()) return toast.error("Le tag est requis.");
    const r = await patch.mutate({
      name: name.trim(),
      tag: tag.trim(),
      city: city.trim() || null,
      region: region.trim() || null,
    });
    if (r) {
      toast.success("Équipe modifiée.");
      setEditing(false);
      onChanged();
    }
  };

  const cancelEdit = () => {
    setName(team.name);
    setTag(team.tag);
    setCity(team.city ?? "");
    setRegion(team.region ?? "");
    setEditing(false);
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl px-5 py-4 ${
        team.isActive ? "border-[var(--border)]" : "border-[rgba(255,68,68,0.35)] opacity-70"
      }`}
    >
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap items-end">
            <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
              Nom
              <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} w-48`} />
            </label>
            <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
              Tag
              <input value={tag} onChange={(e) => setTag(e.target.value)} className={`${field} w-24`} />
            </label>
            <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
              Ville
              <input value={city} onChange={(e) => setCity(e.target.value)} className={`${field} w-32`} />
            </label>
            <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
              Région
              <input value={region} onChange={(e) => setRegion(e.target.value)} className={`${field} w-32`} />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={busy}
              className="px-4 py-1.5 rounded-lg border-none font-semibold text-[0.8rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {busy ? "…" : "Enregistrer"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-[0.8rem] text-[var(--text-muted)] border border-[var(--border)] cursor-pointer hover:text-[var(--text-secondary)] disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-lg bg-[rgba(79,195,247,0.12)] flex items-center justify-center font-bold text-[0.72rem] text-[var(--accent-blue)] shrink-0">
            {team.tag.slice(0, 4).toUpperCase()}
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/teams/${team.slug}`}
                className="font-bold text-[0.95rem] text-[var(--text-primary)] no-underline hover:text-[var(--accent-green)]"
              >
                {team.name}
              </Link>
              <span className="text-[0.72rem] text-[var(--text-muted)]">[{team.tag}]</span>
              {!team.isActive && (
                <span className="text-[0.68rem] font-semibold px-1.5 py-0.5 rounded bg-[rgba(255,68,68,0.12)] text-[var(--accent-red)] border border-[rgba(255,68,68,0.3)]">
                  Désactivée
                </span>
              )}
            </div>
            <div className="text-[0.76rem] text-[var(--text-muted)] mt-0.5">
              {[
                [team.city, team.region].filter(Boolean).join(", ") || null,
                `${team._count.members} membre${team._count.members > 1 ? "s" : ""}`,
                roster || null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEditing(true)}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={toggleActive}
              disabled={busy}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold border cursor-pointer disabled:opacity-50 transition-colors ${
                team.isActive
                  ? "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:border-[var(--accent-red)]"
                  : "bg-[rgba(0,230,118,0.1)] border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] hover:bg-[rgba(0,230,118,0.2)]"
              }`}
            >
              {team.isActive ? "Désactiver" : "Activer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
