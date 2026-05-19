"use client";
import Link from "next/link";
import GameTag from "./GameTag";

export interface PlayerCardData {
  pseudo: string; city?: string; avatar?: string;
  isVerified?: boolean; games?: string[]; totalPoints?: number;
}

export default function PlayerCard({ player }: { player: PlayerCardData }) {
  const initials = player.pseudo.slice(0, 2).toUpperCase();

  return (
    <Link href={`/players/${player.pseudo}`} className="no-underline">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-5 flex items-center gap-4 transition-colors cursor-pointer hover:border-[var(--accent-green)] hover:bg-[var(--bg-card-hover)]">

        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-base text-black ${!player.avatar ? "bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)]" : ""}`}
          style={player.avatar ? { background: `url(${player.avatar}) center/cover` } : undefined}
        >
          {!player.avatar && initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[var(--text-primary)] font-semibold text-[0.95rem]">{player.pseudo}</span>
            {player.isVerified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-blue)">
                <path d="M12 2L3.5 6.5v5C3.5 16.7 7.1 21.3 12 22.5c4.9-1.2 8.5-5.8 8.5-11V6.5L12 2zm-1 13l-3.5-3.5 1.4-1.4 2.1 2.1 4.1-4.1 1.4 1.4L11 15z" />
              </svg>
            )}
          </div>
          {player.city && (
            <p className="text-[var(--text-muted)] text-[0.78rem] mb-1">📍 {player.city}</p>
          )}
          {player.games && player.games.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {player.games.slice(0, 3).map((g) => <GameTag key={g} name={g} />)}
            </div>
          )}
        </div>

        {/* Points */}
        {player.totalPoints !== undefined && (
          <div className="text-right shrink-0">
            <div className="text-[var(--accent-gold)] font-bold text-base">{player.totalPoints.toLocaleString()}</div>
            <div className="text-[var(--text-muted)] text-[0.7rem]">pts</div>
          </div>
        )}
      </div>
    </Link>
  );
}
