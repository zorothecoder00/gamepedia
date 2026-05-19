"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import GameTag from "../../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface TeamMember {
  role?: string;
  player: { id: string; pseudo: string; city?: string; isVerified?: boolean };
}

interface Team {
  slug: string; name: string; tag: string; city?: string; region?: string;
  description?: string; color?: string; logoUrl?: string; foundedAt?: string;
  socialLinks?: Record<string, string>;
  members: TeamMember[];
  _count: { members: number; participations: number };
}

interface TeamStats {
  tournamentsPlayed: number; wins: number; top3: number; totalPrize: number;
}

interface TournamentParticipation {
  id: string; finalPlacement?: number; prizeWon?: number;
  tournament: { name: string; slug: string; tier: "S" | "A" | "B" | "C"; startDate: string };
}

const TABS = ["Profil", "Roster", "Palmarès", "Statistiques"];

function StatBubble({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center">
      <div className="font-bold text-[1.1rem]" style={{ color }}>{value}</div>
      <div className="text-[0.72rem] text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

const placementIcon = (p?: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : p ? `#${p}` : "—";

export default function TeamPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const { slug } = params;

  const { data: team, loading: loadingTeam } = useApi<Team>(`/api/teams/${slug}`);
  const { data: stats } = useApi<TeamStats>(`/api/teams/${slug}/stats`);
  const { data: palmares, loading: loadingPalmares } = useApi<TournamentParticipation[]>(
    activeTab === 2 ? `/api/teams/${slug}/tournaments` : null, [activeTab],
  );

  if (loadingTeam) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!team) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Équipe introuvable.</div>;
  }

  const color = team.color ?? "var(--accent-green)";

  return (
    <div>
      {/* Banner */}
      <div
        className="h-[180px] border-b border-[var(--border)] relative"
        style={{ background: `linear-gradient(135deg, ${color}25, var(--bg-primary))` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(9,9,15,0.7))]" />
      </div>

      {/* Team header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end gap-5 -mt-11 pb-5 flex-wrap">
            {/* Logo */}
            <div
              className="w-[88px] h-[88px] rounded-xl flex items-center justify-center text-[2.75rem] shrink-0 overflow-hidden"
              style={{ background: `${color}22`, border: `3px solid ${color}55` }}
            >
              {team.logoUrl ? <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" /> : "🛡️"}
            </div>

            {/* Info */}
            <div className="flex-1 pt-11">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">{team.name}</h1>
                <span className="text-[0.75rem] font-bold px-2 py-0.5 rounded" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
                  [{team.tag}]
                </span>
              </div>
              <div className="text-[0.82rem] text-[var(--text-muted)] mb-1">
                {team.city && `📍 ${team.city}`}
                {team.region && `, ${team.region}`}
                {team.foundedAt && ` · Fondée en ${new Date(team.foundedAt).getFullYear()}`}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex gap-6 pt-11 flex-wrap">
                <StatBubble label="Victoires" value={stats.wins} color="var(--accent-gold)" />
                <StatBubble label="Tournois" value={stats.tournamentsPlayed} color="var(--accent-blue)" />
                <StatBubble label="Prize Money" value={`${(stats.totalPrize / 1000).toFixed(0)}k XOF`} color="var(--accent-gold)" />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="px-[1.125rem] py-3 bg-transparent border-none text-sm cursor-pointer transition-colors"
                style={{
                  borderBottom: activeTab === i ? `2px solid ${color}` : "2px solid transparent",
                  color: activeTab === i ? color : "var(--text-secondary)",
                  fontWeight: activeTab === i ? 600 : 400,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Profil */}
        {activeTab === 0 && (
          <div className="grid [grid-template-columns:2fr_1fr] gap-8">
            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">Description</h3>
              <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.7]">
                {team.description ?? "Aucune description renseignée."}
              </p>
            </div>
            {team.socialLinks && Object.keys(team.socialLinks).length > 0 && (
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">Réseaux</h3>
                {Object.entries(team.socialLinks).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2 mb-1.5">
                    <span className="text-[0.8rem] text-[var(--text-muted)] w-[60px] capitalize">{k}</span>
                    <span className="text-[0.82rem] text-[var(--accent-blue)]">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Roster */}
        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Roster actuel — {team._count.members} membres</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
              {team.members.map((member) => (
                <Link key={member.player.pseudo} href={`/players/${member.player.pseudo}`} className="no-underline">
                  <div
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-3.5 transition-colors hover:border-[var(--border-bright)]"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = color)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[0.9rem] shrink-0 text-black"
                      style={{ background: `linear-gradient(135deg, ${color}, var(--accent-blue))` }}
                    >
                      {member.player.pseudo.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[0.9rem] text-[var(--text-primary)]">{member.player.pseudo}</div>
                      {member.role && <div className="text-[0.75rem] font-medium" style={{ color }}>{member.role}</div>}
                      {member.player.city && <div className="text-[0.72rem] text-[var(--text-muted)]">📍 {member.player.city}</div>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Palmarès */}
        {activeTab === 2 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Palmarès</h2>
            {loadingPalmares ? <p className="text-[var(--text-muted)]">Chargement...</p>
              : !palmares || palmares.length === 0 ? <p className="text-[var(--text-muted)]">Aucun palmarès.</p>
              : (
                <div className="flex flex-col gap-3">
                  {palmares.map((entry) => (
                    <div key={entry.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-4 flex items-center gap-4 flex-wrap">
                      <span className="text-2xl">{placementIcon(entry.finalPlacement)}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-[0.9rem] text-[var(--text-primary)]">{entry.tournament.name}</div>
                        <div className="text-[0.75rem] text-[var(--text-muted)]">
                          {new Date(entry.tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                      <TierBadge tier={entry.tournament.tier} small />
                      {entry.prizeWon && entry.prizeWon > 0 && (
                        <span className="font-bold text-sm text-[var(--accent-gold)]">+{entry.prizeWon.toLocaleString()} XOF</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Statistiques */}
        {activeTab === 3 && stats && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Statistiques de l&apos;équipe</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              {[
                { label: "Tournois joués", value: stats.tournamentsPlayed, color: "var(--accent-blue)" },
                { label: "Victoires", value: stats.wins, color: "var(--accent-gold)" },
                { label: "Top 3", value: stats.top3, color: "var(--accent-green)" },
                { label: "Taux de victoire", value: stats.tournamentsPlayed > 0 ? `${Math.round((stats.wins / stats.tournamentsPlayed) * 100)}%` : "—", color: "var(--tier-s)" },
                { label: "Prize Money total", value: `${stats.totalPrize.toLocaleString()} XOF`, color: "var(--accent-gold)" },
                { label: "Membres actifs", value: team._count.members, color: "var(--accent-blue)" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 text-center">
                  <div className="font-black text-2xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[0.78rem] text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
