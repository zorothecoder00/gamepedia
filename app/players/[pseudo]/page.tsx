"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import GameTag from "../../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface Player {
  pseudo: string; firstName?: string; lastName?: string;
  city?: string; region?: string; bio?: string;
  isVerified?: boolean; avatarUrl?: string;
  gameProfiles: { game: { name: string; slug: string }; inGameName?: string; rank?: string }[];
  teamMembers: { team: { id: string; name: string; tag: string; slug: string } }[];
  achievements: { achievement: { name: string; description: string; icon?: string; rarity: string; category: string } }[];
}

interface TournamentParticipation {
  id: string; finalPlacement?: number; prizeWon?: number;
  tournament: { name: string; slug: string; tier: "S" | "A" | "B" | "C"; status: string; startDate: string };
}

const TABS = ["Profil", "Palmarès", "Historique", "Achievements"];

const RARITY_COLORS: Record<string, string> = {
  Commun: "var(--text-muted)", Rare: "var(--accent-blue)",
  Épique: "var(--tier-a)", Légendaire: "var(--accent-gold)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-bold text-[0.95rem] text-[var(--text-primary)] mb-3.5 pb-2 border-b border-[var(--border)]">{title}</h3>
      {children}
    </div>
  );
}

const placementIcon = (p?: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : p ? `#${p}` : "—";

export default function PlayerPage({ params }: { params: { pseudo: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const { pseudo } = params;

  const { data: player, loading: loadingPlayer } = useApi<Player>(`/api/players/${pseudo}`);
  const { data: participations, loading: loadingParticipations } = useApi<TournamentParticipation[]>(
    activeTab >= 1 ? `/api/players/${pseudo}/tournaments` : null, [activeTab],
  );

  if (loadingPlayer) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!player) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Joueur introuvable.</div>;
  }

  const team = player.teamMembers?.[0]?.team;
  const palmares = (participations ?? []).filter((p) => p.finalPlacement && p.finalPlacement <= 10);

  return (
    <div>
      {/* Banner */}
      <div className="h-40 relative border-b border-[var(--border)] bg-gradient-to-br from-[#1a1a35] to-[#0d0d20]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,230,118,0.1),rgba(79,195,247,0.05))]" />
      </div>

      {/* Profile header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end gap-5 -mt-10 pb-5 flex-wrap">
            {/* Avatar */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-black font-black text-[1.75rem] shrink-0 border-[3px] border-[var(--bg-secondary)] ${!player.avatarUrl ? "bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)]" : ""}`}
              style={player.avatarUrl ? { background: `url(${player.avatarUrl}) center/cover` } : undefined}
            >
              {!player.avatarUrl && player.pseudo.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 pt-10">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">{player.pseudo}</h1>
                {player.isVerified && <span className="text-[var(--accent-blue)] text-lg" title="Joueur vérifié">✓</span>}
                <span className="text-xl">🇹🇬</span>
              </div>
              {(player.firstName || player.city) && (
                <div className="text-[0.83rem] text-[var(--text-muted)] mb-2">
                  {[player.firstName, player.lastName].filter(Boolean).join(" ")}
                  {player.city && ` · ${player.city}`}
                  {player.region && `, ${player.region}`}
                </div>
              )}
              <div className="flex gap-1.5 flex-wrap">
                {player.gameProfiles.map((gp) => <GameTag key={gp.game.slug} name={gp.game.name} />)}
                {team && (
                  <Link href={`/teams/${team.slug}`} className="no-underline">
                    <span className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded bg-[rgba(255,215,0,0.12)] text-[var(--accent-gold)] border border-[rgba(255,215,0,0.25)]">
                      [{team.tag}] {team.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-[1.125rem] py-3 bg-transparent border-none text-sm cursor-pointer transition-colors border-b-2 ${activeTab === i ? "border-[var(--accent-green)] text-[var(--accent-green)] font-semibold" : "border-transparent text-[var(--text-secondary)] font-normal"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Profil */}
        {activeTab === 0 && (
          <div className="grid [grid-template-columns:2fr_1fr] gap-8">
            <div>
              <Section title="Biographie">
                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.7]">{player.bio ?? "Aucune biographie renseignée."}</p>
              </Section>
              <Section title="Profils in-game">
                <div className="flex flex-col gap-3">
                  {player.gameProfiles.map((gp) => (
                    <div key={gp.game.slug} className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3.5 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{gp.game.name}</div>
                        {gp.inGameName && <div className="text-[0.78rem] text-[var(--text-muted)]">{gp.inGameName}</div>}
                      </div>
                      {gp.rank && (
                        <span className="bg-[rgba(79,195,247,0.1)] text-[var(--accent-blue)] border border-[rgba(79,195,247,0.25)] rounded px-2 py-0.5 text-[0.75rem] font-semibold">
                          {gp.rank}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
            <div>
              <Section title="Équipe actuelle">
                {team ? (
                  <Link href={`/teams/${team.slug}`} className="no-underline">
                    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3.5 flex items-center gap-3 hover:border-[var(--border-bright)] transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-[rgba(255,215,0,0.15)] flex items-center justify-center text-[var(--accent-gold)] font-black text-xs">
                        {team.tag}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{team.name}</div>
                        <div className="text-[0.75rem] text-[var(--text-muted)]">Membre actif</div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Sans équipe</p>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* Palmarès */}
        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">
              Palmarès — {loadingParticipations ? "..." : palmares.length} résultats
            </h2>
            {loadingParticipations ? <p className="text-[var(--text-muted)]">Chargement...</p>
              : palmares.length === 0 ? <p className="text-[var(--text-muted)]">Aucun palmarès.</p>
              : (
                <div className="flex flex-col gap-3">
                  {palmares.map((entry) => (
                    <div key={entry.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-4 flex items-center gap-4 flex-wrap">
                      <span className="text-2xl min-w-8">{placementIcon(entry.finalPlacement)}</span>
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

        {/* Historique */}
        {activeTab === 2 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Historique des participations</h2>
            {loadingParticipations ? <p className="text-[var(--text-muted)]">Chargement...</p>
              : !participations || participations.length === 0 ? <p className="text-[var(--text-muted)]">Aucune participation.</p>
              : (
                <div className="flex flex-col gap-2">
                  {participations.map((entry) => (
                    <div key={entry.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3.5 flex items-center justify-between gap-4">
                      <div className="flex gap-3 items-center">
                        <span className="text-[0.8rem] text-[var(--text-muted)] min-w-[80px]">
                          {new Date(entry.tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Link href={`/tournaments/${entry.tournament.slug}`} className="text-sm font-medium text-[var(--text-primary)] no-underline hover:underline">
                          {entry.tournament.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <TierBadge tier={entry.tournament.tier} small />
                        <span className="text-lg">{placementIcon(entry.finalPlacement)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Achievements */}
        {activeTab === 3 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">
              Achievements — {player.achievements.length} débloqués
            </h2>
            {player.achievements.length === 0 ? (
              <p className="text-[var(--text-muted)]">Aucun achievement débloqué.</p>
            ) : (
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                {player.achievements.map(({ achievement: ach }) => (
                  <div key={ach.name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex gap-3.5 items-start">
                    <span className="text-3xl">{ach.icon ?? "🏅"}</span>
                    <div>
                      <div className="font-semibold text-[0.9rem] text-[var(--text-primary)] mb-1">{ach.name}</div>
                      <div className="text-[0.78rem] text-[var(--text-muted)] mb-2">{ach.description}</div>
                      <span className="text-[0.68rem] font-semibold" style={{ color: RARITY_COLORS[ach.rarity] ?? "var(--text-muted)" }}>
                        {ach.rarity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
