"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

type Tier = "S" | "A" | "B" | "C";
const TIERS: Tier[] = ["S", "A", "B", "C"];

interface PointRule {
  id: string;
  gameId: string;
  placement: number;
  tier: Tier;
  pointsAwarded: number;
  formatMultiplier: number;
  description?: string | null;
}
interface Game {
  id: string;
  name: string;
  slug: string;
}

const finalPoints = (r: { pointsAwarded: number; formatMultiplier: number }) =>
  Math.round(r.pointsAwarded * r.formatMultiplier);

export default function AdminPointRulesPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";

  const { data: games } = useApi<Game[]>(
    token && isStaff ? "/api/games" : null,
    [token, isStaff],
    authHeader,
  );
  // Sélection dérivée : le jeu choisi, sinon le premier de la liste.
  const [selected, setSelected] = useState("");
  const gameSlug = selected || games?.[0]?.slug || "";
  const game = games?.find((g) => g.slug === gameSlug);

  const {
    data: rules,
    loading,
    refetch,
  } = useApi<PointRule[]>(
    token && isStaff && gameSlug ? `/api/point-rules?game=${gameSlug}` : null,
    [token, isStaff, gameSlug],
    authHeader,
  );

  if (authLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>
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

      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Règles de points</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Barème par jeu, tier et placement. Les points finaux = points de base ×
        multiplicateur de format.
      </p>

      {/* Sélecteur de jeu */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(games ?? []).map((g) => (
          <button
            key={g.slug}
            onClick={() => setSelected(g.slug)}
            className={`px-3.5 py-1.5 rounded-lg text-[0.82rem] border cursor-pointer transition-colors ${
              gameSlug === g.slug
                ? "bg-[var(--accent-green)] text-black font-semibold border-[var(--accent-green)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-bright)]"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {!game ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          {games && games.length === 0 ? "Aucun jeu actif." : "Sélectionnez un jeu."}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div>
            <AddRuleForm gameId={game.id} authHeader={authHeader} onAdded={refetch} />

            {loading ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
            ) : (
              <div className="flex flex-col gap-6 mt-6">
                {TIERS.map((tier) => {
                  const tierRules = (rules ?? [])
                    .filter((r) => r.tier === tier)
                    .sort((a, b) => a.placement - b.placement);
                  return (
                    <TierTable
                      key={tier}
                      tier={tier}
                      rules={tierRules}
                      authHeader={authHeader}
                      onChanged={refetch}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <Simulator rules={rules ?? []} gameName={game.name} />
        </div>
      )}
    </div>
  );
}

function TierTable({
  tier,
  rules,
  authHeader,
  onChanged,
}: {
  tier: Tier;
  rules: PointRule[];
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  return (
    <div>
      <h3 className="text-[0.9rem] font-bold text-[var(--text-primary)] mb-2">Tier {tier}</h3>
      {rules.length === 0 ? (
        <p className="text-[0.8rem] text-[var(--text-muted)] italic">Aucune règle pour ce tier.</p>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_1fr_80px_auto] gap-2 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--border)]">
            <span>Place</span>
            <span>Base</span>
            <span>× Format</span>
            <span>Final</span>
            <span></span>
          </div>
          {rules.map((r) => (
            <RuleRow key={r.id} rule={r} authHeader={authHeader} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function RuleRow({
  rule,
  authHeader,
  onChanged,
}: {
  rule: PointRule;
  authHeader?: Record<string, string>;
  onChanged: () => void;
}) {
  const [points, setPoints] = useState(String(rule.pointsAwarded));
  const [mult, setMult] = useState(String(rule.formatMultiplier));
  const patch = useMutation(`/api/point-rules/${rule.id}`, "PATCH", authHeader, "Règle mise à jour.");
  const del = useMutation(`/api/point-rules/${rule.id}`, "DELETE", authHeader);

  const dirty = points !== String(rule.pointsAwarded) || mult !== String(rule.formatMultiplier);
  const final = finalPoints({ pointsAwarded: Number(points) || 0, formatMultiplier: Number(mult) || 0 });

  const save = async () => {
    const p = Number(points);
    const m = Number(mult);
    if (!Number.isInteger(p) || p < 0) return toast.error("Points de base : entier positif.");
    if (!(m > 0)) return toast.error("Multiplicateur : nombre > 0.");
    const r = await patch.mutate({ pointsAwarded: p, formatMultiplier: m });
    if (r) onChanged();
  };

  const remove = async () => {
    const r = await del.mutate();
    if (r) {
      toast.success("Règle supprimée.");
      onChanged();
    }
  };

  const field =
    "w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded text-[var(--text-primary)] px-2 py-1 text-[0.82rem] outline-none box-border";

  return (
    <div className="grid grid-cols-[60px_1fr_1fr_80px_auto] gap-2 px-4 py-2 items-center border-b border-[var(--border)] last:border-b-0">
      <span className="font-bold text-[0.85rem] text-[var(--text-primary)]">#{rule.placement}</span>
      <input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} className={field} />
      <input type="number" min={0} step="0.1" value={mult} onChange={(e) => setMult(e.target.value)} className={field} />
      <span className="font-bold text-[0.85rem] text-[var(--accent-gold)]">{final}</span>
      <div className="flex gap-1">
        <button
          onClick={save}
          disabled={!dirty || patch.loading}
          className="px-2 py-1 rounded text-[0.72rem] font-semibold bg-[rgba(0,230,118,0.12)] text-[var(--accent-green)] border border-[rgba(0,230,118,0.25)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgba(0,230,118,0.2)] transition-colors"
        >
          {patch.loading ? "…" : "✓"}
        </button>
        <button
          onClick={remove}
          disabled={del.loading}
          className="px-2 py-1 rounded text-[0.72rem] text-[var(--text-muted)] border border-[var(--border)] cursor-pointer hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] disabled:opacity-30 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AddRuleForm({
  gameId,
  authHeader,
  onAdded,
}: {
  gameId: string;
  authHeader?: Record<string, string>;
  onAdded: () => void;
}) {
  const [tier, setTier] = useState<Tier>("A");
  const [placement, setPlacement] = useState("1");
  const [points, setPoints] = useState("100");
  const [mult, setMult] = useState("1");
  const [description, setDescription] = useState("");
  const create = useMutation("/api/point-rules", "POST", authHeader, "Règle ajoutée.");

  const submit = async () => {
    const pl = Number(placement);
    const p = Number(points);
    const m = Number(mult);
    if (!Number.isInteger(pl) || pl < 1) return toast.error("Placement : entier ≥ 1.");
    if (!Number.isInteger(p) || p < 0) return toast.error("Points : entier positif.");
    if (!(m > 0)) return toast.error("Multiplicateur : nombre > 0.");
    const r = await create.mutate({
      gameId,
      tier,
      placement: pl,
      pointsAwarded: p,
      formatMultiplier: m,
      description: description.trim() || undefined,
    });
    if (r) {
      setDescription("");
      onAdded();
    }
  };

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-[0.85rem] font-bold text-[var(--text-primary)] mb-3">Ajouter une règle</h3>
      <div className="flex gap-2 flex-wrap items-end">
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Tier
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className={`${field} cursor-pointer`}>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Place
          <input type="number" min={1} value={placement} onChange={(e) => setPlacement(e.target.value)} className={`${field} w-16`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          Points
          <input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} className={`${field} w-20`} />
        </label>
        <label className="flex flex-col gap-1 text-[0.7rem] text-[var(--text-muted)]">
          × Format
          <input type="number" min={0} step="0.1" value={mult} onChange={(e) => setMult(e.target.value)} className={`${field} w-16`} />
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className={`${field} flex-1 min-w-[140px]`}
        />
        <button
          onClick={submit}
          disabled={create.loading}
          className="px-4 py-1.5 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {create.loading ? "…" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

function Simulator({ rules, gameName }: { rules: PointRule[]; gameName: string }) {
  const [tier, setTier] = useState<Tier>("A");
  const [placement, setPlacement] = useState("1");
  const [eventMult, setEventMult] = useState("1");

  const rule = useMemo(
    () => rules.find((r) => r.tier === tier && r.placement === Number(placement)),
    [rules, tier, placement],
  );

  const base = rule ? finalPoints(rule) : null;
  const total = base != null ? Math.round(base * (Number(eventMult) || 1)) : null;

  const field =
    "bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-2.5 py-1.5 text-[0.82rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 sticky top-6">
      <h3 className="text-[0.9rem] font-bold text-[var(--text-primary)] mb-1">Simulateur</h3>
      <p className="text-[0.75rem] text-[var(--text-muted)] mb-4">{gameName}</p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[0.72rem] text-[var(--text-muted)]">
          Tier du tournoi
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className={`${field} cursor-pointer`}>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.72rem] text-[var(--text-muted)]">
          Placement final
          <input type="number" min={1} value={placement} onChange={(e) => setPlacement(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-[0.72rem] text-[var(--text-muted)]">
          Multiplicateur événement
          <input type="number" min={0} step="0.1" value={eventMult} onChange={(e) => setEventMult(e.target.value)} className={field} />
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        {rule ? (
          <>
            <div className="flex justify-between text-[0.78rem] text-[var(--text-secondary)] mb-1">
              <span>Base × format</span>
              <span>{base}</span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-[0.82rem] font-semibold text-[var(--text-primary)]">Points attribués</span>
              <span className="text-[1.6rem] font-black text-[var(--accent-gold)]">{total}</span>
            </div>
          </>
        ) : (
          <p className="text-[0.8rem] text-[var(--accent-red)]">
            Aucune règle pour Tier {tier}, place #{placement}.
          </p>
        )}
      </div>
    </div>
  );
}
