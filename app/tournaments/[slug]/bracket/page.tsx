"use client";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface MatchParticipant {
  id: string;
  score?: number | null;
  isWinner?: boolean | null;
  team?: { name: string; tag: string } | null;
}
interface Match {
  id: string;
  matchNumber?: number | null;
  round?: number | null;
  status?: string;
  participants: MatchParticipant[];
}
interface Stage {
  id: string;
  name: string;
  stageNumber: number;
  matches: Match[];
}
interface Tournament {
  name: string;
  status: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "À venir", color: "var(--accent-blue)" },
  ONGOING: { label: "En cours", color: "var(--accent-green)" },
  COMPLETED: { label: "Terminé", color: "var(--text-muted)" },
  CANCELLED: { label: "Annulé", color: "var(--accent-red)" },
};

function Slot({ p }: { p?: MatchParticipant }) {
  const name = p?.team?.name ?? "TBD";
  const win = p?.isWinner;
  return (
    <div
      className={`px-3.5 py-2 flex justify-between items-center gap-3 ${
        win ? "bg-[rgba(0,230,118,0.08)]" : "bg-transparent"
      }`}
    >
      <span className={`text-[0.82rem] truncate ${win ? "text-[var(--accent-green)] font-bold" : "text-[var(--text-secondary)]"}`}>
        {name}
      </span>
      <span className={`font-bold text-sm shrink-0 ${win ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
        {p?.score ?? "—"}
      </span>
    </div>
  );
}

export default function BracketFullscreenPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: tournament } = useApi<Tournament>(`/api/tournaments/${slug}`);
  const { data: stages, loading } = useApi<Stage[]>(`/api/tournaments/${slug}/bracket`);

  const st = tournament ? STATUS_META[tournament.status] ?? STATUS_META.UPCOMING : null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Barre supérieure */}
      <div className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/tournaments/${slug}`}
            className="text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] shrink-0"
          >
            ← Tournoi
          </Link>
          <span className="text-[var(--border-bright)]">/</span>
          <h1 className="text-[1rem] font-bold text-[var(--text-primary)] truncate">
            {tournament?.name ?? slug} — Bracket
          </h1>
        </div>
        {st && (
          <span
            className="text-[0.72rem] font-semibold px-2 py-0.5 rounded shrink-0"
            style={{ color: st.color, border: `1px solid ${st.color}55` }}
          >
            {st.label}
          </span>
        )}
      </div>

      {/* Bracket */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)]">Chargement du bracket...</div>
        ) : !stages || stages.length === 0 || stages.every((s) => s.matches.length === 0) ? (
          <div className="text-center py-20 text-[var(--text-muted)]">
            Le bracket n&apos;est pas encore disponible pour ce tournoi.
          </div>
        ) : (
          <div className="flex gap-8 items-start min-w-max pb-6">
            {stages
              .filter((s) => s.matches.length > 0)
              .map((stage) => (
                <div key={stage.id} className="flex flex-col">
                  <div className="text-[0.78rem] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-4 text-center">
                    {stage.name}
                  </div>
                  <div className="flex flex-col justify-around gap-6 h-full">
                    {stage.matches.map((match) => {
                      const [p1, p2] = match.participants;
                      return (
                        <div
                          key={match.id}
                          className="w-[260px] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm"
                        >
                          {match.round || match.matchNumber ? (
                            <div className="px-3.5 py-1 text-[0.65rem] uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                              {match.round ? `Round ${match.round}` : "Match"}
                              {match.matchNumber ? ` · #${match.matchNumber}` : ""}
                            </div>
                          ) : null}
                          <Slot p={p1} />
                          <div className="border-t border-[var(--border)]" />
                          <Slot p={p2} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
