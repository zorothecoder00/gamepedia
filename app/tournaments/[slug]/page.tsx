"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import { useApi } from "@/hooks/useApi";

interface Participant {
  id: string; finalPlacement?: number; prizeWon?: number; seed?: number;
  player?: { pseudo: string; city?: string };
  team?: { name: string; tag: string; slug: string };
}

interface MatchParticipant {
  score?: number; isWinner?: boolean;
  player?: { pseudo: string };
  team?: { name: string; tag: string };
}

interface Match {
  id: string;
  participants: MatchParticipant[];
}

interface Stage {
  id: string; name: string; order: number;
  matches: Match[];
}

interface Tournament {
  slug: string; name: string; edition?: number;
  tier: "S" | "A" | "B" | "C";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  format?: string; participantType?: string;
  location?: string; venue?: string; isOnline?: boolean;
  startDate: string; endDate?: string;
  prizePool?: number; currency?: string;
  prizeDistribution?: Record<string, number>;
  description?: string; rules?: string;
  organizerName?: string; streamUrl?: string;
  games: { game: { name: string; slug: string } }[];
  participants: Participant[];
  _count: { participants: number };
}

const TABS = ["Infos", "Participants", "Bracket", "Résultats", "Podium"];

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "À venir", color: "var(--accent-blue)" },
  ONGOING: { label: "En cours", color: "var(--accent-green)" },
  COMPLETED: { label: "Terminé", color: "var(--text-muted)" },
  CANCELLED: { label: "Annulé", color: "var(--accent-red)" },
};

function InfoItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span className="text-sm text-[var(--text-secondary)]">{text}</span>
    </div>
  );
}

function MatchRow({ name, score, isWinner }: { name: string; score?: number; isWinner?: boolean }) {
  return (
    <div className={`px-3.5 py-2 flex justify-between items-center ${isWinner ? "bg-[rgba(0,230,118,0.06)]" : "bg-transparent"}`}>
      <span className={`text-[0.82rem] ${isWinner ? "text-[var(--accent-green)] font-bold" : "text-[var(--text-muted)]"}`}>{name}</span>
      <span className={`font-bold text-sm ${isWinner ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>{score ?? "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-bold text-[0.95rem] text-[var(--text-primary)] mb-3.5 pb-2 border-b border-[var(--border)]">{title}</h3>
      {children}
    </div>
  );
}

export default function TournamentPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const { slug } = params;

  const { data: tournament, loading } = useApi<Tournament>(`/api/tournaments/${slug}`);
  const { data: bracket, loading: loadingBracket } = useApi<Stage[]>(
    activeTab === 2 ? `/api/tournaments/${slug}/bracket` : null, [activeTab],
  );

  if (loading) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!tournament) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Tournoi introuvable.</div>;
  }

  const st = STATUS_INFO[tournament.status] ?? STATUS_INFO.UPCOMING;
  const gameName = tournament.games?.[0]?.game.name ?? "—";
  const podium = [...tournament.participants]
    .filter((p) => p.finalPlacement)
    .sort((a, b) => (a.finalPlacement ?? 99) - (b.finalPlacement ?? 99))
    .slice(0, 4);

  return (
    <div>
      {/* Banner header */}
      <div className="px-6 py-8 border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,107,53,0.15),var(--bg-primary))]">
        <div className="max-w-[1280px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex gap-1.5 items-center mb-4 text-[0.8rem]">
            <Link href="/tournaments" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]">Tournois</Link>
            <span className="text-[var(--border-bright)]">›</span>
            <span className="text-[var(--text-secondary)]">{tournament.name}</span>
          </div>

          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-xl bg-[rgba(255,107,53,0.12)] border-2 border-[rgba(255,107,53,0.35)] flex items-center justify-center text-[2.5rem] shrink-0">
              🏆
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-[1.75rem] font-black text-[var(--text-primary)]">{tournament.name}</h1>
                <TierBadge tier={tournament.tier} />
                <span
                  className="text-[0.78rem] font-semibold px-2 py-0.5 rounded"
                  style={{ color: st.color, border: `1px solid ${st.color}55` }}
                >
                  {st.label}
                </span>
              </div>
              <div className="flex gap-6 flex-wrap mb-3">
                <InfoItem icon="🎮" text={gameName} />
                <InfoItem icon="📅" text={`${new Date(tournament.startDate).toLocaleDateString("fr-FR")}${tournament.endDate ? ` → ${new Date(tournament.endDate).toLocaleDateString("fr-FR")}` : ""}`} />
                {tournament.location && <InfoItem icon="📍" text={tournament.location} />}
                <InfoItem icon="👥" text={`${tournament._count.participants} participants`} />
              </div>
              {tournament.prizePool && tournament.prizePool > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[0.82rem] text-[var(--text-muted)]">Prize Pool :</span>
                  <span className="font-black text-xl text-[var(--accent-gold)]">
                    {tournament.prizePool.toLocaleString()} {tournament.currency ?? "XOF"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 flex">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-[1.125rem] py-3.5 bg-transparent border-none text-sm cursor-pointer transition-colors border-b-2 ${activeTab === i ? "border-[var(--tier-s)] text-[var(--tier-s)] font-semibold" : "border-transparent text-[var(--text-secondary)] font-normal"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Infos */}
        {activeTab === 0 && (
          <div className="grid [grid-template-columns:2fr_1fr] gap-8">
            <div>
              {tournament.description && (
                <Section title="Description">
                  <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.7]">{tournament.description}</p>
                </Section>
              )}
              {tournament.rules && (
                <Section title="Règlement">
                  <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.7]">{tournament.rules}</p>
                </Section>
              )}
            </div>
            <div>
              <Section title="Informations">
                {[
                  tournament.format && { label: "Format", value: tournament.format.replace(/_/g, " ") },
                  tournament.participantType && { label: "Participants", value: tournament.participantType === "TEAM" ? "Équipes" : "Solo" },
                  tournament.venue && { label: "Lieu", value: tournament.venue },
                  tournament.organizerName && { label: "Organisateur", value: tournament.organizerName },
                  tournament.streamUrl && { label: "Stream", value: "Voir le stream →" },
                ].filter(Boolean).map((item) => item && (
                  <div key={item.label} className="flex justify-between mb-2.5 pb-2.5 border-b border-[var(--border)]">
                    <span className="text-[0.82rem] text-[var(--text-muted)]">{item.label}</span>
                    <span className="text-[0.82rem] font-medium text-[var(--text-primary)]">{item.value}</span>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        )}

        {/* Participants */}
        {activeTab === 1 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">
              Participants inscrits — {tournament._count.participants}
            </h2>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {tournament.participants.map((p) => {
                const name = p.team?.name ?? p.player?.pseudo ?? "—";
                const tag = p.team?.tag ?? p.player?.pseudo?.slice(0, 3) ?? "—";
                return (
                  <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-[1.125rem] py-4 flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(255,107,53,0.12)] flex items-center justify-center text-[var(--tier-s)] font-bold text-[0.7rem]">
                      {tag}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{name}</div>
                      {p.seed && <div className="text-[0.73rem] text-[var(--text-muted)]">Seed #{p.seed}</div>}
                    </div>
                    {p.finalPlacement && p.finalPlacement <= 3 && (
                      <span className="text-xl">{p.finalPlacement === 1 ? "🥇" : p.finalPlacement === 2 ? "🥈" : "🥉"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bracket */}
        {activeTab === 2 && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)]">Bracket</h2>
              <Link
                href={`/tournaments/${tournament.slug}/bracket`}
                className="text-[0.82rem] font-semibold text-[var(--tier-s)] no-underline hover:underline"
              >
                Plein écran ↗
              </Link>
            </div>
            {loadingBracket ? (
              <p className="text-[var(--text-muted)]">Chargement du bracket...</p>
            ) : !bracket || bracket.length === 0 ? (
              <p className="text-[var(--text-muted)]">Bracket non disponible.</p>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4">
                {bracket.map((stage) => (
                  <div key={stage.id} className="min-w-[240px] flex-[0_0_240px]">
                    <div className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3.5 text-center">
                      {stage.name}
                    </div>
                    <div className="flex flex-col gap-4">
                      {stage.matches.map((match) => {
                        const [p1, p2] = match.participants;
                        if (!p1) return null;
                        const n1 = p1.team?.name ?? p1.player?.pseudo ?? "TBD";
                        const n2 = p2?.team?.name ?? p2?.player?.pseudo ?? "TBD";
                        return (
                          <div key={match.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
                            <MatchRow name={n1} score={p1.score} isWinner={p1.isWinner} />
                            <div className="border-t border-[var(--border)]" />
                            <MatchRow name={n2} score={p2?.score} isWinner={p2?.isWinner} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Résultats */}
        {activeTab === 3 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-5">Résultats des matchs</h2>
            {!bracket || bracket.length === 0 ? (
              <p className="text-[var(--text-muted)]">Aucun résultat disponible.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {bracket.flatMap((stage) =>
                  stage.matches.map((match) => {
                    const [p1, p2] = match.participants;
                    if (!p1 || !p2) return null;
                    const n1 = p1.team?.name ?? p1.player?.pseudo ?? "TBD";
                    const n2 = p2.team?.name ?? p2.player?.pseudo ?? "TBD";
                    return (
                      <div key={match.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3.5 flex items-center gap-4 flex-wrap">
                        <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-[var(--text-muted)] min-w-[130px]">{stage.name}</span>
                        <div className="flex-1 flex items-center gap-3.5">
                          <span className={`text-[0.9rem] flex-1 text-right ${p1.isWinner ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{n1}</span>
                          <span className="font-black text-base text-[var(--text-primary)] bg-[var(--bg-primary)] px-3 py-1 rounded whitespace-nowrap">
                            {p1.score ?? "—"} – {p2.score ?? "—"}
                          </span>
                          <span className={`text-[0.9rem] flex-1 ${p2.isWinner ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{n2}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Podium */}
        {activeTab === 4 && (
          <div>
            <h2 className="font-bold text-[1.1rem] text-[var(--text-primary)] mb-8">Classement final & Distribution des prix</h2>
            {podium.length === 0 ? (
              <p className="text-[var(--text-muted)]">Résultats non encore disponibles.</p>
            ) : (
              <div className="flex flex-col gap-3 max-w-[600px]">
                {podium.map((p) => {
                  const podiumIcons: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };
                  const name = p.team?.name ?? p.player?.pseudo ?? "—";
                  const tag = p.team?.tag ?? "";
                  const pct = tournament.prizeDistribution?.[String(p.finalPlacement)];
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl px-6 py-[1.125rem] flex items-center gap-4 border ${p.finalPlacement === 1 ? "bg-[rgba(255,215,0,0.08)] border-[rgba(255,215,0,0.3)]" : "bg-[var(--bg-card)] border-[var(--border)]"}`}
                    >
                      <span className="text-3xl">{podiumIcons[p.finalPlacement ?? 4]}</span>
                      <div className="flex-1">
                        <div className="font-bold text-base text-[var(--text-primary)]">{name}</div>
                        {tag && <div className="text-[0.78rem] text-[var(--text-muted)]">[{tag}]</div>}
                      </div>
                      <div className="text-right">
                        {p.prizeWon && p.prizeWon > 0 ? (
                          <>
                            <div className="font-black text-[1.1rem] text-[var(--accent-gold)]">{p.prizeWon.toLocaleString()} XOF</div>
                            {pct && <div className="text-[0.72rem] text-[var(--text-muted)]">{pct}% du prize pool</div>}
                          </>
                        ) : (
                          <div className="text-[0.82rem] text-[var(--text-muted)]">Sans prix</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
