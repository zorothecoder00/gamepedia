"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";

const demoTournament = {
  slug: "valorant-cup-lome-2025",
  name: "Valorant Cup Lomé 2025",
  edition: 3,
  game: "Valorant",
  tier: "A" as const,
  status: "COMPLETED" as const,
  format: "SINGLE_ELIMINATION",
  participantType: "TEAM",
  location: "Lomé, Togo",
  venue: "Centre de la Jeunesse de Lomé",
  isOnline: false,
  startDate: "2025-03-15",
  endDate: "2025-03-20",
  prizePool: 300000,
  currency: "XOF",
  prizeDistribution: { "1": 50, "2": 30, "3": 10, "4": 10 },
  description: "La 3ème édition de la Valorant Cup Lomé réunit les meilleures équipes du Togo dans un tournoi en élimination directe sur 3 jours.",
  rules: "Format Bo3 jusqu'en finale (Bo5). Règlement complet disponible sur demande.",
  organizerName: "TG Esports Association",
  streamUrl: "https://twitch.tv/gamepediatg",
  participants: [
    { name: "TGO Esports", tag: "TGO", seed: 1, placement: 1, prizeWon: 150000 },
    { name: "Lomé Gaming", tag: "LMG", seed: 4, placement: 2, prizeWon: 90000 },
    { name: "Northern Force", tag: "NFR", seed: 2, placement: 3, prizeWon: 30000 },
    { name: "Togo Legends", tag: "TGL", seed: 3, placement: 4, prizeWon: 30000 },
    { name: "Savane Squad", tag: "SVS", seed: 5, placement: 5, prizeWon: 0 },
    { name: "Black Panther Gaming", tag: "BPG", seed: 6, placement: 6, prizeWon: 0 },
    { name: "Lome Hawks", tag: "LHK", seed: 7, placement: 7, prizeWon: 0 },
    { name: "Atakpame Rising", tag: "ATK", seed: 8, placement: 8, prizeWon: 0 },
  ],
  matches: [
    { round: "Quarts de finale", team1: "TGO Esports", score1: 2, team2: "Atakpame Rising", score2: 0, winner: "TGO Esports" },
    { round: "Quarts de finale", team1: "Northern Force", score1: 2, team2: "Lome Hawks", score2: 1, winner: "Northern Force" },
    { round: "Quarts de finale", team1: "Lomé Gaming", score1: 2, team2: "Savane Squad", score2: 0, winner: "Lomé Gaming" },
    { round: "Quarts de finale", team1: "Togo Legends", score1: 2, team2: "Black Panther Gaming", score2: 0, winner: "Togo Legends" },
    { round: "Demi-finales", team1: "TGO Esports", score1: 2, team2: "Togo Legends", score2: 1, winner: "TGO Esports" },
    { round: "Demi-finales", team1: "Lomé Gaming", score1: 2, team2: "Northern Force", score2: 0, winner: "Lomé Gaming" },
    { round: "Finale", team1: "TGO Esports", score1: 3, team2: "Lomé Gaming", score2: 1, winner: "TGO Esports" },
  ],
};

const tabs = ["Infos", "Participants", "Bracket", "Résultats", "Podium"];

const statusInfo = {
  UPCOMING: { label: "À venir", color: "var(--accent-blue)" },
  ONGOING: { label: "En cours", color: "var(--accent-green)" },
  COMPLETED: { label: "Terminé", color: "var(--text-muted)" },
  CANCELLED: { label: "Annulé", color: "var(--accent-red)" },
};

export default function TournamentPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const tournament = demoTournament;
  const st = statusInfo[tournament.status];

  return (
    <div>
      {/* Banner header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,107,53,0.15), var(--bg-primary))",
          borderBottom: "1px solid var(--border)",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "1rem", fontSize: "0.8rem" }}>
            <Link href="/tournaments" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Tournois</Link>
            <span style={{ color: "var(--border-bright)" }}>›</span>
            <span style={{ color: "var(--text-secondary)" }}>{tournament.name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Logo */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                background: "rgba(255,107,53,0.12)",
                border: "2px solid rgba(255,107,53,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                flexShrink: 0,
              }}
            >
              🏆
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 800 }}>{tournament.name}</h1>
                <TierBadge tier={tournament.tier} />
                <span
                  style={{
                    background: "transparent",
                    color: st.color,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    border: `1px solid ${st.color}55`,
                    borderRadius: "4px",
                    padding: "2px 8px",
                  }}
                >
                  {st.label}
                </span>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <InfoItem icon="🎮" text={tournament.game} />
                <InfoItem icon="📅" text={`${new Date(tournament.startDate).toLocaleDateString("fr-FR")} → ${new Date(tournament.endDate).toLocaleDateString("fr-FR")}`} />
                <InfoItem icon="📍" text={tournament.location} />
                <InfoItem icon="👥" text={`${tournament.participants.length} équipes`} />
              </div>

              {tournament.prizePool > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Prize Pool :</span>
                  <span style={{ color: "var(--accent-gold)", fontWeight: 800, fontSize: "1.25rem" }}>
                    {tournament.prizePool.toLocaleString()} {tournament.currency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", display: "flex" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.875rem 1.125rem",
                background: "none",
                border: "none",
                borderBottom: activeTab === i ? "2px solid var(--tier-s)" : "2px solid transparent",
                color: activeTab === i ? "var(--tier-s)" : "var(--text-secondary)",
                fontWeight: activeTab === i ? 600 : 400,
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Infos */}
        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div>
              <Section title="Description">
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{tournament.description}</p>
              </Section>
              <Section title="Règlement">
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{tournament.rules}</p>
              </Section>
            </div>
            <div>
              <Section title="Informations">
                {[
                  { label: "Format", value: tournament.format.replace(/_/g, " ") },
                  { label: "Participants", value: tournament.participantType === "TEAM" ? "Équipes" : "Solo" },
                  { label: "Lieu", value: tournament.venue },
                  { label: "Organisateur", value: tournament.organizerName },
                  { label: "Stream", value: tournament.streamUrl ? "Voir le stream →" : "Non disponible" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem", paddingBottom: "0.625rem", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{item.label}</span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        )}

        {/* Participants */}
        {activeTab === 1 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Participants inscrits — {tournament.participants.length} équipes
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.875rem" }}>
              {tournament.participants.map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "1rem 1.125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "rgba(255,107,53,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--tier-s)",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  >
                    {p.tag}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{p.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.73rem" }}>Tête de série #{p.seed}</div>
                  </div>
                  {p.placement && p.placement <= 3 && (
                    <span style={{ fontSize: "1.2rem" }}>
                      {p.placement === 1 ? "🥇" : p.placement === 2 ? "🥈" : "🥉"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bracket */}
        {activeTab === 2 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Bracket — Élimination directe
            </h2>
            <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "1rem" }}>
              {["Quarts de finale", "Demi-finales", "Finale"].map((round) => {
                const roundMatches = tournament.matches.filter((m) => m.round === round);
                return (
                  <div key={round} style={{ minWidth: "240px", flex: "0 0 240px" }}>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "0.875rem",
                        textAlign: "center",
                      }}
                    >
                      {round}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {roundMatches.map((m, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <MatchRow name={m.team1} score={m.score1} isWinner={m.winner === m.team1} />
                          <div style={{ borderTop: "1px solid var(--border)" }} />
                          <MatchRow name={m.team2} score={m.score2} isWinner={m.winner === m.team2} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Résultats */}
        {activeTab === 3 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Résultats des matchs
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {tournament.matches.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.875rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      minWidth: "130px",
                    }}
                  >
                    {m.round}
                  </span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <span
                      style={{
                        color: m.winner === m.team1 ? "var(--text-primary)" : "var(--text-muted)",
                        fontWeight: m.winner === m.team1 ? 700 : 400,
                        fontSize: "0.9rem",
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {m.team1}
                    </span>
                    <span
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: 800,
                        fontSize: "1rem",
                        background: "var(--bg-primary)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.score1} – {m.score2}
                    </span>
                    <span
                      style={{
                        color: m.winner === m.team2 ? "var(--text-primary)" : "var(--text-muted)",
                        fontWeight: m.winner === m.team2 ? 700 : 400,
                        fontSize: "0.9rem",
                        flex: 1,
                      }}
                    >
                      {m.team2}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Podium */}
        {activeTab === 4 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "2rem" }}>
              Classement final & Distribution des prix
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "600px" }}>
              {tournament.participants
                .filter((p) => p.placement && p.placement <= 4)
                .sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99))
                .map((p) => {
                  const podiumIcons: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };
                  const pct = tournament.prizeDistribution[String(p.placement) as keyof typeof tournament.prizeDistribution];
                  return (
                    <div
                      key={p.name}
                      style={{
                        background: p.placement === 1 ? "rgba(255,215,0,0.08)" : "var(--bg-card)",
                        border: p.placement === 1 ? "1px solid rgba(255,215,0,0.3)" : "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "1.125rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>{podiumIcons[p.placement ?? 4]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>{p.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>[{p.tag}]</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {p.prizeWon > 0 ? (
                          <>
                            <div style={{ color: "var(--accent-gold)", fontWeight: 800, fontSize: "1.1rem" }}>
                              {p.prizeWon.toLocaleString()} XOF
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{pct}% du prize pool</div>
                          </>
                        ) : (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Sans prix</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
      <span>{icon}</span>
      <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{text}</span>
    </div>
  );
}

function MatchRow({ name, score, isWinner }: { name: string; score: number; isWinner: boolean }) {
  return (
    <div
      style={{
        padding: "0.5rem 0.875rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: isWinner ? "rgba(0,230,118,0.06)" : "transparent",
      }}
    >
      <span style={{ color: isWinner ? "var(--accent-green)" : "var(--text-muted)", fontSize: "0.82rem", fontWeight: isWinner ? 700 : 400 }}>
        {name}
      </span>
      <span style={{ color: isWinner ? "var(--accent-green)" : "var(--text-muted)", fontWeight: 700, fontSize: "0.88rem" }}>
        {score}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
