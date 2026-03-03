import Link from "next/link";
import TierBadge from "./TierBadge";

export interface TournamentCardData {
  slug: string;
  name: string;
  game: string;
  tier: "S" | "A" | "B" | "C";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  prizePool?: number;
  currency?: string;
  participantCount?: number;
  maxParticipants?: number;
  logo?: string;
  location?: string;
}

const statusColors = {
  UPCOMING: { bg: "rgba(79, 195, 247, 0.12)", color: "var(--accent-blue)", label: "À venir" },
  ONGOING: { bg: "rgba(0, 230, 118, 0.12)", color: "var(--accent-green)", label: "En cours" },
  COMPLETED: { bg: "rgba(90, 90, 122, 0.2)", color: "var(--text-muted)", label: "Terminé" },
  CANCELLED: { bg: "rgba(255, 68, 68, 0.12)", color: "var(--accent-red)", label: "Annulé" },
};

export default function TournamentCard({ tournament }: { tournament: TournamentCardData }) {
  const st = statusColors[tournament.status];
  const prize = tournament.prizePool
    ? `${tournament.prizePool.toLocaleString()} ${tournament.currency ?? "XOF"}`
    : null;

  return (
    <Link href={`/tournaments/${tournament.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "1.25rem",
          transition: "border-color 0.15s, background 0.15s",
          cursor: "pointer",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
            {/* Logo placeholder */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "1.2rem",
              }}
            >
              🏆
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tournament.name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{tournament.game}</div>
            </div>
          </div>
          <TierBadge tier={tournament.tier} small />
        </div>

        {/* Status + dates */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <span
            style={{
              background: st.bg,
              color: st.color,
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: "4px",
            }}
          >
            {st.label}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            {new Date(tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            {tournament.endDate &&
              ` → ${new Date(tournament.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
          </span>
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {prize ? (
            <span style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.85rem" }}>{prize}</span>
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Sans prize pool</span>
          )}
          {tournament.participantCount !== undefined && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {tournament.participantCount}
              {tournament.maxParticipants ? `/${tournament.maxParticipants}` : ""} participants
            </span>
          )}
        </div>

        {tournament.location && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.73rem", marginTop: "0.4rem" }}>
            📍 {tournament.location}
          </div>
        )}
      </div>
    </Link>
  );
}
