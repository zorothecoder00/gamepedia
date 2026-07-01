"use client";
import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface AttributionResult {
  created: number;
  entries: number;
}

// ── Types (contrat de /api/tournaments/[slug]/bracket) ─────────

interface MatchParticipant {
  id: string;
  score?: number | null;
  isWinner?: boolean | null;
  isForfeit?: boolean;
  team?: { name: string; tag: string } | null;
}
interface Match {
  id: string;
  matchNumber?: number | null;
  round?: number | null;
  status: string;
  notes?: string | null;
  participants: MatchParticipant[];
}
interface Stage {
  id: string;
  name: string;
  stageNumber: number;
  bestOf?: number;
  matches: Match[];
}
interface Tournament {
  name: string;
  slug: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Programmé", color: "var(--accent-blue)" },
  ONGOING: { label: "En cours", color: "var(--accent-green)" },
  COMPLETED: { label: "Terminé", color: "var(--text-muted)" },
  FORFEITED: { label: "Forfait", color: "var(--accent-gold)" },
  CANCELLED: { label: "Annulé", color: "var(--accent-red)" },
};

export default function AdminMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";

  const { data: tournament } = useApi<Tournament>(
    token && isStaff ? `/api/tournaments/${slug}` : null,
    [token, isStaff],
    authHeader,
  );
  const {
    data: stages,
    loading,
    refetch,
  } = useApi<Stage[]>(
    token && isStaff ? `/api/tournaments/${slug}/bracket` : null,
    [token, isStaff],
    authHeader,
  );
  const attribute = useMutation<AttributionResult>(
    `/api/point-attributions/tournament/${slug}`,
    "POST",
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

  const totalMatches = stages?.reduce((n, s) => n + s.matches.length, 0) ?? 0;
  const played =
    stages?.reduce(
      (n, s) => n + s.matches.filter((m) => m.status === "COMPLETED" || m.status === "FORFEITED").length,
      0,
    ) ?? 0;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <Link
        href="/admin/tournaments"
        className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5"
      >
        ← Tournois
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap mb-2">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)]">
          Saisie des résultats
        </h1>
        {totalMatches > 0 && (
          <span className="text-[0.85rem] text-[var(--text-muted)]">
            {played}/{totalMatches} matchs saisis
          </span>
        )}
      </div>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-4">
        {tournament?.name ?? slug} — le vainqueur et le statut sont déterminés
        automatiquement à partir des scores.
      </p>

      {/* Clôture : placements → points → classement */}
      <div className="flex items-center gap-3 flex-wrap mb-8 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
        <div className="flex-1 min-w-[200px]">
          <p className="text-[0.85rem] font-semibold text-[var(--text-primary)]">Attribuer les points</p>
          <p className="text-[0.76rem] text-[var(--text-muted)]">
            Génère les points depuis les placements finaux et recalcule le classement de la saison.
          </p>
        </div>
        <button
          onClick={async () => {
            const r = await attribute.mutate();
            if (r) toast.success(`${r.created} attribution(s) · ${r.entries} entrées classées.`);
          }}
          disabled={attribute.loading}
          className="px-4 py-2 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-gold)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {attribute.loading ? "…" : "⚡ Attribuer & recalculer"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !stages || stages.length === 0 ? (
        <EmptyState
          message="Aucune phase n'a encore été créée pour ce tournoi."
          hint="Créez d'abord des phases et des matchs depuis la gestion du tournoi."
        />
      ) : (
        <div className="flex flex-col gap-9">
          {stages.map((stage) => (
            <section key={stage.id}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[1.1rem] font-bold text-[var(--text-primary)]">
                  {stage.name}
                </h2>
                {stage.bestOf ? (
                  <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]">
                    BO{stage.bestOf}
                  </span>
                ) : null}
              </div>
              {stage.matches.length === 0 ? (
                <EmptyState message="Aucun match dans cette phase." />
              ) : (
                <div className="flex flex-col gap-3">
                  {stage.matches.map((m) => (
                    <MatchEditor
                      key={m.id}
                      match={m}
                      authHeader={authHeader}
                      onSaved={refetch}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="text-center py-8 bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-xl">
      <p className="text-[0.9rem] text-[var(--text-muted)]">{message}</p>
      {hint && <p className="text-[0.78rem] text-[var(--text-muted)] mt-1 opacity-70">{hint}</p>}
    </div>
  );
}

function MatchEditor({
  match,
  authHeader,
  onSaved,
}: {
  match: Match;
  authHeader?: Record<string, string>;
  onSaved: () => void;
}) {
  const [p1, p2] = match.participants;
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      match.participants.map((p) => [p.id, p.score != null ? String(p.score) : ""]),
    ),
  );
  const [forfeit, setForfeit] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(match.participants.map((p) => [p.id, p.isForfeit ?? false])),
  );
  const [notes, setNotes] = useState(match.notes ?? "");

  const save = useMutation(
    `/api/matches/${match.id}/result`,
    "POST",
    authHeader,
    "Résultat enregistré.",
  );

  const st = STATUS_META[match.status] ?? STATUS_META.SCHEDULED;
  const bothPresent = !!p1?.team && !!p2?.team;

  const submit = async () => {
    const anyForfeit = match.participants.some((p) => forfeit[p.id]);
    if (!anyForfeit && match.participants.some((p) => scores[p.id].trim() === "")) {
      toast.error("Renseignez le score de chaque participant.");
      return;
    }
    const payload = {
      participants: match.participants.map((p) => ({
        id: p.id,
        score: forfeit[p.id] || scores[p.id].trim() === "" ? null : Number(scores[p.id]),
        isForfeit: forfeit[p.id] ?? false,
      })),
      notes: notes.trim() || undefined,
    };
    const r = await save.mutate(payload);
    if (r) onSaved();
  };

  const cancel = async () => {
    const r = await save.mutate({ status: "CANCELLED" });
    if (r) {
      toast.success("Match réinitialisé.");
      onSaved();
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {match.round ? `Round ${match.round}` : "Match"}
          {match.matchNumber ? ` · #${match.matchNumber}` : ""}
        </span>
        <span
          className="text-[0.7rem] font-semibold px-2 py-0.5 rounded"
          style={{ color: st.color, border: `1px solid ${st.color}55` }}
        >
          {st.label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {match.participants.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            score={scores[p.id]}
            isForfeit={forfeit[p.id] ?? false}
            onScore={(v) => setScores((s) => ({ ...s, [p.id]: v }))}
            onForfeit={(v) => setForfeit((f) => ({ ...f, [p.id]: v }))}
          />
        ))}
      </div>

      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Note (optionnel) — résumé, VOD…"
        className="w-full mt-3 bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-[0.82rem] outline-none box-border"
      />

      {!bothPresent && (
        <p className="text-[0.75rem] text-[var(--accent-gold)] mt-2">
          Les deux participants doivent être désignés avant de saisir un résultat.
        </p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={submit}
          disabled={save.loading || !bothPresent}
          className="px-4 py-2 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {save.loading ? "…" : "Enregistrer"}
        </button>
        {(match.status === "COMPLETED" || match.status === "FORFEITED") && (
          <button
            onClick={cancel}
            disabled={save.loading}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] text-[0.82rem] cursor-pointer hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] disabled:opacity-40 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}

function ParticipantRow({
  participant,
  score,
  isForfeit,
  onScore,
  onForfeit,
}: {
  participant: MatchParticipant;
  score: string;
  isForfeit: boolean;
  onScore: (v: string) => void;
  onForfeit: (v: boolean) => void;
}) {
  const name = participant.team?.name ?? "TBD";
  const tag = participant.team?.tag;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
        participant.isWinner
          ? "bg-[rgba(0,230,118,0.06)] border-[rgba(0,230,118,0.3)]"
          : "bg-[var(--bg-primary)] border-[var(--border)]"
      }`}
    >
      <div className="flex-1 min-w-0">
        <span
          className={`text-[0.9rem] ${
            participant.isWinner
              ? "font-bold text-[var(--accent-green)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          {name}
        </span>
        {tag && <span className="text-[0.72rem] text-[var(--text-muted)] ml-1.5">[{tag}]</span>}
      </div>

      <label className="flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isForfeit}
          onChange={(e) => onForfeit(e.target.checked)}
          className="accent-[var(--accent-gold)] cursor-pointer"
        />
        Forfait
      </label>

      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={isForfeit ? "" : score}
        disabled={isForfeit || !participant.team}
        onChange={(e) => onScore(e.target.value)}
        placeholder="—"
        className="w-16 text-center bg-[var(--bg-secondary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] font-bold px-2 py-1.5 text-[0.9rem] outline-none disabled:opacity-40"
      />
    </div>
  );
}
