"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import GameTag from "../../components/GameTag";

const demoPlayer = {
  pseudo: "Phantom_TG",
  firstName: "Kofi",
  lastName: "Mensah",
  city: "Lomé",
  region: "Maritime",
  bio: "Joueur professionnel Valorant & Free Fire. Capitaine de l'équipe TGO Esports. Passionné de gaming depuis 2018.",
  isVerified: true,
  isActive: true,
  nationality: "TG",
  games: [
    { name: "Valorant", rank: "Platinum 2", inGameName: "Phantom#TG01" },
    { name: "Free Fire", rank: "Diamond", inGameName: "PhantomTG" },
  ],
  team: { name: "TGO Esports", slug: "tgo-esports", tag: "TGO" },
  stats: {
    totalPoints: 2850,
    tournamentsPlayed: 14,
    wins: 4,
    top3: 8,
    prizeMoney: 450000,
  },
  socialLinks: {
    twitter: "@PhantomTG",
    discord: "Phantom#1234",
    youtube: "PhantomTGYT",
  },
};

const demoPalmares = [
  { tournament: "Valorant Cup Lomé 2025", placement: 1, tier: "A" as const, prizeWon: 150000, date: "2025-03-20" },
  { tournament: "National Championship 2024", placement: 2, tier: "S" as const, prizeWon: 200000, date: "2024-11-15" },
  { tournament: "Qualifier Q3 2024", placement: 1, tier: "C" as const, prizeWon: 50000, date: "2024-09-05" },
  { tournament: "Community Cup 2024", placement: 3, tier: "B" as const, prizeWon: 50000, date: "2024-07-12" },
];

const demoAchievements = [
  { name: "Premier Titre", description: "Gagner un tournoi", icon: "🏆", rarity: "Rare", category: "Palmares" },
  { name: "Hat-trick", description: "Gagner 3 tournois", icon: "🎯", rarity: "Épique", category: "Palmares" },
  { name: "Vétéran", description: "Participer à 10 tournois", icon: "⚔️", rarity: "Commun", category: "Participation" },
  { name: "Joueur Vérifié", description: "Compte vérifié par l'admin", icon: "✅", rarity: "Commun", category: "Special" },
];

const tabs = ["Profil", "Palmarès", "Historique", "Achievements"];

const rarityColors: Record<string, string> = {
  Commun: "var(--text-muted)",
  Rare: "var(--accent-blue)",
  Épique: "var(--tier-a)",
  Légendaire: "var(--accent-gold)",
};

export default function PlayerPage({ params }: { params: { pseudo: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const player = demoPlayer;

  const placementIcon = (p: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `#${p}`;

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          height: "160px",
          background: "linear-gradient(135deg, #1a1a35, #0d0d20)",
          position: "relative",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,230,118,0.1), rgba(79,195,247,0.05))",
          }}
        />
      </div>

      {/* Profile header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem", marginTop: "-40px", paddingBottom: "1.25rem", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
                border: "3px solid var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 800,
                fontSize: "1.75rem",
                flexShrink: 0,
              }}
            >
              {player.pseudo.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingTop: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>
                  {player.pseudo}
                </h1>
                {player.isVerified && (
                  <span title="Joueur vérifié" style={{ color: "var(--accent-blue)", fontSize: "1.1rem" }}>✓</span>
                )}
                <span style={{ fontSize: "1.25rem" }}>🇹🇬</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.83rem", marginBottom: "0.5rem" }}>
                {player.firstName} {player.lastName} · {player.city}, {player.region}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {player.games.map((g) => <GameTag key={g.name} name={g.name} />)}
                {player.team && (
                  <Link href={`/teams/${player.team.slug}`} style={{ textDecoration: "none" }}>
                    <span
                      style={{
                        background: "rgba(255, 215, 0, 0.12)",
                        color: "var(--accent-gold)",
                        border: "1px solid rgba(255,215,0,0.25)",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "1px 7px",
                      }}
                    >
                      [{player.team.tag}] {player.team.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats globales */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", paddingTop: "2rem" }}>
              <StatBubble label="Points" value={player.stats.totalPoints.toLocaleString()} color="var(--accent-gold)" />
              <StatBubble label="Tournois" value={player.stats.tournamentsPlayed} color="var(--accent-blue)" />
              <StatBubble label="Victoires" value={player.stats.wins} color="var(--accent-green)" />
              <StatBubble label="Prize Money" value={`${player.stats.prizeMoney.toLocaleString()} XOF`} color="var(--accent-gold)" />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0" }}>
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                style={{
                  padding: "0.75rem 1.125rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === i ? "2px solid var(--accent-green)" : "2px solid transparent",
                  color: activeTab === i ? "var(--accent-green)" : "var(--text-secondary)",
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
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Profile tab */}
        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div>
              <Section title="Biographie">
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {player.bio}
                </p>
              </Section>
              <Section title="Profils in-game">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {player.games.map((g) => (
                    <div
                      key={g.name}
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "0.875rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{g.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{g.inGameName}</div>
                      </div>
                      <span
                        style={{
                          background: "rgba(79,195,247,0.1)",
                          color: "var(--accent-blue)",
                          border: "1px solid rgba(79,195,247,0.25)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                        }}
                      >
                        {g.rank}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <div>
              <Section title="Réseaux sociaux">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {Object.entries(player.socialLinks).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", width: "60px", textTransform: "capitalize" }}>{key}</span>
                      <span style={{ color: "var(--accent-blue)", fontSize: "0.82rem" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Équipe actuelle">
                {player.team ? (
                  <Link href={`/teams/${player.team.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "0.875rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          background: "rgba(255,215,0,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--accent-gold)",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                        }}
                      >
                        {player.team.tag}
                      </div>
                      <div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{player.team.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Membre actif</div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Sans équipe</p>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* Palmarès tab */}
        {activeTab === 1 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Palmarès — {demoPalmares.length} résultats
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {demoPalmares.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", minWidth: "2rem" }}>{placementIcon(entry.placement)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{entry.tournament}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <TierBadge tier={entry.tier} small />
                  {entry.prizeWon > 0 && (
                    <span style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.88rem" }}>
                      +{entry.prizeWon.toLocaleString()} XOF
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique tab */}
        {activeTab === 2 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Historique des participations
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {demoPalmares.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.875rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", minWidth: "80px" }}>
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.88rem", fontWeight: 500 }}>{entry.tournament}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <TierBadge tier={entry.tier} small />
                    <span style={{ fontSize: "1.1rem" }}>{placementIcon(entry.placement)}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      {entry.placement === 1 ? "Champion" : entry.placement === 2 ? "Finaliste" : entry.placement === 3 ? "3e place" : `${entry.placement}e place`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements tab */}
        {activeTab === 3 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Achievements — {demoAchievements.length} débloqués
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {demoAchievements.map((ach) => (
                <div
                  key={ach.name}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    display: "flex",
                    gap: "0.875rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{ach.icon}</span>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                      {ach.name}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.5rem" }}>
                      {ach.description}
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: rarityColors[ach.rarity] ?? "var(--text-muted)",
                      }}
                    >
                      {ach.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBubble({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color, fontWeight: 700, fontSize: "1.1rem" }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h3
        style={{
          color: "var(--text-primary)",
          fontWeight: 700,
          fontSize: "0.95rem",
          marginBottom: "0.875rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
