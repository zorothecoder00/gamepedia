import Link from "next/link";
import GameTag from "./GameTag";

export interface PlayerCardData {
  pseudo: string;
  city?: string;
  avatar?: string;
  isVerified?: boolean;
  games?: string[];
  totalPoints?: number;
}

export default function PlayerCard({ player }: { player: PlayerCardData }) {
  const initials = player.pseudo.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/players/${player.pseudo}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          transition: "border-color 0.15s, background 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-green)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: player.avatar
              ? `url(${player.avatar}) center/cover`
              : "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#000",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          {!player.avatar && initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
              {player.pseudo}
            </span>
            {player.isVerified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-blue)">
                <path d="M12 2L3.5 6.5v5C3.5 16.7 7.1 21.3 12 22.5c4.9-1.2 8.5-5.8 8.5-11V6.5L12 2zm-1 13l-3.5-3.5 1.4-1.4 2.1 2.1 4.1-4.1 1.4 1.4L11 15z" />
              </svg>
            )}
          </div>
          {player.city && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
              📍 {player.city}
            </p>
          )}
          {player.games && player.games.length > 0 && (
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {player.games.slice(0, 3).map((g) => (
                <GameTag key={g} name={g} />
              ))}
            </div>
          )}
        </div>

        {/* Points */}
        {player.totalPoints !== undefined && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "1rem" }}>
              {player.totalPoints.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>pts</div>
          </div>
        )}
      </div>
    </Link>
  );
}
