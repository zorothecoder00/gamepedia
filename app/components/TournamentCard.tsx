"use client";
import Link from "next/link";
import TierBadge from "./TierBadge";

export interface TournamentCardData {
  slug: string; name: string; game: string;
  tier: "S" | "A" | "B" | "C";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  startDate: string; endDate?: string;
  prizePool?: number; currency?: string;
  participantCount?: number; maxParticipants?: number;
  logo?: string; location?: string;
}

const statusClasses: Record<string, { badge: string; label: string }> = {
  UPCOMING: { badge: "bg-[rgba(79,195,247,0.12)] text-[var(--accent-blue)]", label: "À venir" },
  ONGOING:  { badge: "bg-[rgba(0,230,118,0.12)] text-[var(--accent-green)]", label: "En cours" },
  COMPLETED:{ badge: "bg-[rgba(90,90,122,0.2)] text-[var(--text-muted)]",    label: "Terminé" },
  CANCELLED:{ badge: "bg-[rgba(255,68,68,0.12)] text-[var(--accent-red)]",   label: "Annulé" },
};

export default function TournamentCard({ tournament }: { tournament: TournamentCardData }) {
  const st = statusClasses[tournament.status];
  const prize = tournament.prizePool
    ? `${tournament.prizePool.toLocaleString()} ${tournament.currency ?? "XOF"}`
    : null;

  return (
    <Link href={`/tournaments/${tournament.slug}`} className="no-underline">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-5 cursor-pointer h-full transition-colors hover:border-[var(--border-bright)] hover:bg-[var(--bg-card-hover)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center shrink-0 text-xl">
              🏆
            </div>
            <div className="min-w-0">
              <div className="text-[var(--text-primary)] font-semibold text-[0.9rem] truncate">
                {tournament.name}
              </div>
              <div className="text-[var(--text-muted)] text-[0.75rem]">{tournament.game}</div>
            </div>
          </div>
          <TierBadge tier={tournament.tier} small />
        </div>

        {/* Status + dates */}
        <div className="flex items-center gap-2 mb-[0.6rem]">
          <span className={`text-[0.7rem] font-semibold px-[7px] py-0.5 rounded ${st.badge}`}>
            {st.label}
          </span>
          <span className="text-[var(--text-muted)] text-[0.75rem]">
            {new Date(tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            {tournament.endDate &&
              ` → ${new Date(tournament.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
          </span>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center">
          {prize ? (
            <span className="text-[var(--accent-gold)] font-bold text-[0.85rem]">{prize}</span>
          ) : (
            <span className="text-[var(--text-muted)] text-[0.75rem]">Sans prize pool</span>
          )}
          {tournament.participantCount !== undefined && (
            <span className="text-[var(--text-muted)] text-[0.75rem]">
              {tournament.participantCount}
              {tournament.maxParticipants ? `/${tournament.maxParticipants}` : ""} participants
            </span>
          )}
        </div>

        {tournament.location && (
          <div className="text-[var(--text-muted)] text-[0.73rem] mt-[0.4rem]">
            📍 {tournament.location}
          </div>
        )}
      </div>
    </Link>
  );
}
