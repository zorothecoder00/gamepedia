"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";
import GameTag from "../../components/GameTag";

const demoTeam = {
  slug: "tgo-esports",
  name: "TGO Esports",
  tag: "TGO",
  city: "Lomé",
  region: "Maritime",
  logo: "🦅",
  color: "#00e676",
  founded: "2022-04-10",
  description: "TGO Esports est l'une des meilleures équipes esport du Togo. Fondée en 2022, elle évolue principalement sur Valorant et Free Fire.",
  games: ["Valorant", "Free Fire"],
  socialLinks: { twitter: "@TGOEsports", discord: "TGO#0001" },
  stats: {
    totalWins: 7,
    totalTournaments: 21,
    totalPrizeMoney: 850000,
    top3: 13,
  },
};

const demoRoster = [
  { pseudo: "Phantom_TG", role: "IGL / Entry Fragger", isActive: true, joinedAt: "2022-04-10", city: "Lomé" },
  { pseudo: "ShadowKing", role: "Support", isActive: true, joinedAt: "2022-04-10", city: "Kara" },
  { pseudo: "RapidStrike", role: "AWP / Sniper", isActive: true, joinedAt: "2022-05-01", city: "Lomé" },
  { pseudo: "NightWolf", role: "Lurker", isActive: true, joinedAt: "2022-08-15", city: "Lomé" },
  { pseudo: "BlazeFire", role: "Coach", isActive: true, joinedAt: "2023-01-20", city: "Atakpamé" },
];

const demoPalmares = [
  { tournament: "Valorant Cup Lomé 2025", placement: 1, tier: "A" as const, date: "2025-03-20", prize: 150000 },
  { tournament: "National Championship 2024", placement: 2, tier: "S" as const, date: "2024-11-15", prize: 200000 },
  { tournament: "Community Cup 2024", placement: 1, tier: "B" as const, date: "2024-07-12", prize: 75000 },
  { tournament: "Qualifier Q3 2024", placement: 3, tier: "C" as const, date: "2024-09-05", prize: 25000 },
];

const tabs = ["Profil", "Roster", "Palmarès", "Statistiques"];

export default function TeamPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const team = demoTeam;
  const placementIcon = (p: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `#${p}`;

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          height: "180px",
          background: `linear-gradient(135deg, ${team.color}25, var(--bg-primary))`,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 1.5rem 1.5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent, rgba(9,9,15,0.7))",
          }}
        />
      </div>

      {/* Team header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem", marginTop: "-44px", paddingBottom: "1.25rem", flexWrap: "wrap" }}>
            {/* Logo */}
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "12px",
                background: `${team.color}22`,
                border: `3px solid ${team.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.75rem",
                flexShrink: 0,
              }}
            >
              {team.logo}
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingTop: "2.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>{team.name}</h1>
                <span
                  style={{
                    background: `${team.color}22`,
                    color: team.color,
                    border: `1px solid ${team.color}55`,
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  [{team.tag}]
                </span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
                📍 {team.city}, {team.region} · Fondée en {new Date(team.founded).getFullYear()}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {team.games.map((g) => <GameTag key={g} name={g} color={team.color} />)}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "1.5rem", paddingTop: "2.75rem", flexWrap: "wrap" }}>
              <StatBubble label="Victoires" value={team.stats.totalWins} color="var(--accent-gold)" />
              <StatBubble label="Tournois" value={team.stats.totalTournaments} color="var(--accent-blue)" />
              <StatBubble label="Prize Money" value={`${(team.stats.totalPrizeMoney / 1000).toFixed(0)}k XOF`} color="var(--accent-gold)" />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex" }}>
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                style={{
                  padding: "0.75rem 1.125rem",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === i ? `2px solid ${team.color}` : "2px solid transparent",
                  color: activeTab === i ? team.color : "var(--text-secondary)",
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

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Profil */}
        {activeTab === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div>
              <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                Description
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{team.description}</p>
            </div>
            <div>
              <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                Réseaux
              </h3>
              {Object.entries(team.socialLinks).map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", width: "60px", textTransform: "capitalize" }}>{k}</span>
                  <span style={{ color: "var(--accent-blue)", fontSize: "0.82rem" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster */}
        {activeTab === 1 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Roster actuel — {demoRoster.length} membres
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {demoRoster.map((member) => (
                <Link key={member.pseudo} href={`/players/${member.pseudo}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = team.color)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${team.color}, var(--accent-blue))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {member.pseudo.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{member.pseudo}</div>
                      <div style={{ color: team.color, fontSize: "0.75rem", fontWeight: 500 }}>{member.role}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>📍 {member.city}</div>
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
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Palmarès
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
                  <span style={{ fontSize: "1.5rem" }}>{placementIcon(entry.placement)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{entry.tournament}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <TierBadge tier={entry.tier} small />
                  {entry.prize > 0 && (
                    <span style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.88rem" }}>
                      +{entry.prize.toLocaleString()} XOF
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques */}
        {activeTab === 3 && (
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Statistiques de l&apos;équipe
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              {[
                { label: "Tournois joués", value: team.stats.totalTournaments, color: "var(--accent-blue)" },
                { label: "Victoires", value: team.stats.totalWins, color: "var(--accent-gold)" },
                { label: "Top 3", value: team.stats.top3, color: "var(--accent-green)" },
                { label: "Taux de victoire", value: `${Math.round((team.stats.totalWins / team.stats.totalTournaments) * 100)}%`, color: "var(--tier-s)" },
                { label: "Prize Money total", value: `${team.stats.totalPrizeMoney.toLocaleString()} XOF`, color: "var(--accent-gold)" },
                { label: "Membres actifs", value: demoRoster.length, color: "var(--accent-blue)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: stat.color, fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.value}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{stat.label}</div>
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
