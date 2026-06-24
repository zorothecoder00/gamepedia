import Link from "next/link";
import GameTag from "./GameTag";
import {
  WAGER_STATUS_META,
  WagerStatus,
  formatMoney,
} from "../wagers/wager-ui";

export interface WagerCardData {
  id: string;
  title: string;
  status: WagerStatus;
  stakeAmount: number;
  currency?: string;
  game: { name: string; slug: string };
  challenger: { pseudo: string; avatar?: string | null; trustScore?: number };
  opponent?: { pseudo: string; avatar?: string | null } | null;
  createdAt: string;
}

/** Pastille de statut d'un défi. */
export function WagerStatusBadge({ status }: { status: WagerStatus }) {
  const meta = WAGER_STATUS_META[status];
  return (
    <span
      className="inline-block rounded text-[0.68rem] font-bold px-2 py-0.5 whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        color: meta.color,
        border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  );
}

function Avatar({ pseudo, avatar }: { pseudo: string; avatar?: string | null }) {
  return (
    <span
      className="w-6 h-6 rounded-full grid place-items-center text-[0.62rem] font-bold bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border)] overflow-hidden"
      style={avatar ? { background: `url(${avatar}) center/cover` } : undefined}
    >
      {!avatar && pseudo.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function WagerCard({ wager }: { wager: WagerCardData }) {
  return (
    <Link
      href={`/wagers/${wager.id}`}
      className="block no-underline bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] hover:border-[var(--border-bright)] rounded-xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <GameTag name={wager.game.name} />
        <WagerStatusBadge status={wager.status} />
      </div>

      <h3 className="text-[0.95rem] font-bold text-[var(--text-primary)] mb-3 line-clamp-1">
        {wager.title}
      </h3>

      <div className="flex items-center gap-2 mb-3 text-[0.82rem] text-[var(--text-secondary)]">
        <Avatar pseudo={wager.challenger.pseudo} avatar={wager.challenger.avatar} />
        <span className="font-medium text-[var(--text-primary)]">
          {wager.challenger.pseudo}
        </span>
        <span className="text-[var(--text-muted)]">vs</span>
        {wager.opponent ? (
          <>
            <Avatar pseudo={wager.opponent.pseudo} avatar={wager.opponent.avatar} />
            <span className="font-medium text-[var(--text-primary)]">
              {wager.opponent.pseudo}
            </span>
          </>
        ) : (
          <span className="italic text-[var(--text-muted)]">en attente…</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <span className="text-[0.72rem] text-[var(--text-muted)]">Mise</span>
        <span className="text-[0.95rem] font-black text-[var(--accent-gold)]">
          {formatMoney(wager.stakeAmount, wager.currency)}
        </span>
      </div>
    </Link>
  );
}
