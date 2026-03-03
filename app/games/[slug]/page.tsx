"use client";
import { useState } from "react";
import Link from "next/link";
import TierBadge from "../../components/TierBadge";

// Données de démo — remplacées par des appels API
const gamesData: Record<string, {
  name: string; genre: string; format: string; platforms: string[];
  description: string; logo: string; color: string;
  publisher: string; playerCount: number; tournamentCount: number;
}> = {
  "valorant": {
    name: "Valorant", genre: "FPS Tactique", format: "5v5",
    platforms: ["PC"], color: "#ff4655", logo: "🎯",
    description: "Valorant est un shooter tactique 5v5 développé par Riot Games. La scène compétitive au Togo connaît une croissance rapide depuis 2022.",
    publisher: "Riot Games", playerCount: 124, tournamentCount: 18,
  },
  "free-fire": {
    name: "Free Fire", genre: "Battle Royale", format: "Battle Royale",
    platforms: ["Mobile"], color: "#ff9800", logo: "🔥",
    description: "Free Fire est un battle royale mobile développé par Garena. C'est le jeu esport le plus populaire au Togo.",
    publisher: "Garena", playerCount: 312, tournamentCount: 34,
  },
  "fifa-25": {
    name: "FIFA 25", genre: "Sport", format: "1v1",
    platforms: ["PC", "Console"], color: "#4caf50", logo: "⚽",
    description: "FIFA 25 est le jeu de football virtuel phare d'EA Sports. Les tournois FIFA sont très populaires à Lomé.",
    publisher: "EA Sports", playerCount: 89, tournamentCount: 12,
  },
};

const demoRankings = [
  { rank: 1, pseudo: "Phantom_TG", city: "Lomé", points: 2850, wins: 4, avatar: null },
  { rank: 2, pseudo: "ShadowKing", city: "Kara", points: 2400, wins: 3, avatar: null },
  { rank: 3, pseudo: "NightWolf", city: "Lomé", points: 2100, wins: 2, avatar: null },
  { rank: 4, pseudo: "BlazeFire", city: "Atakpamé", points: 1900, wins: 2, avatar: null },
  { rank: 5, pseudo: "RapidStrike", city: "Lomé", points: 1700, wins: 1, avatar: null },
];

const demoTournaments = [
  { slug: "valorant-cup-lome-2025", name: "Valorant Cup Lomé 2025", tier: "A" as const, status: "COMPLETED" as const, startDate: "2025-03-15", prizePool: 300000 },
  { slug: "national-championship-2025", name: "National Championship 2025", tier: "S" as const, status: "UPCOMING" as const, startDate: "2025-06-01", prizePool: 1000000 },
  { slug: "qualifier-q1-2025", name: "Qualificatif Q1 2025", tier: "C" as const, status: "COMPLETED" as const, startDate: "2025-01-20", prizePool: 0 },
];

const tabs = ["Vue d'ensemble", "Classement", "Tournois", "Joueurs"];

export default function GamePage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState(0);
  const game = gamesData[params.slug] ?? {
    name: params.slug, genre: "Jeu", format: "?",
    platforms: [], color: "var(--accent-blue)", logo: "🎮",
    description: "Aucune description disponible.", publisher: "Inconnu",
    playerCount: 0, tournamentCount: 0,
  };

  return (
    <div>
      {/* Banner / Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${game.color}25 0%, var(--bg-primary) 100%)`,
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 1.5rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Logo */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                background: `${game.color}22`,
                border: `2px solid ${game.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                flexShrink: 0,
              }}
            >
              {game.logo}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 800 }}>
                  {game.name}
                </h1>
                <span
                  style={{
                    background: `${game.color}22`,
                    color: game.color,
                    border: `1px solid ${game.color}44`,
                    borderRadius: "5px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                  }}
                >
                  {game.genre}
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                {game.description}
              </p>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <Stat label="Joueurs" value={game.playerCount} color={game.color} />
                <Stat label="Tournois" value={game.tournamentCount} color="var(--accent-gold)" />
                <Stat label="Format" value={game.format} color="var(--text-secondary)" />
                <Stat label="Éditeur" value={game.publisher} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "0" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "0.875rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom: activeTab === i ? `2px solid ${game.color}` : "2px solid transparent",
                color: activeTab === i ? game.color : "var(--text-secondary)",
                fontWeight: activeTab === i ? 600 : 400,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {activeTab === 0 && <OverviewTab game={game} />}
        {activeTab === 1 && <RankingTab color={game.color} />}
        {activeTab === 2 && <TournamentsTab />}
        {activeTab === 3 && <PlayersTab color={game.color} />}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div style={{ color, fontWeight: 700, fontSize: "1rem" }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{label}</div>
    </div>
  );
}

function OverviewTab({ game }: { game: { name: string; color: string } }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      <div>
        <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Derniers résultats
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {demoTournaments.filter(t => t.status === "COMPLETED").map(t => (
            <div
              key={t.slug}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.875rem 1rem",
              }}
            >
              <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{t.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div style={{ marginTop: "0.4rem" }}>
                <TierBadge tier={t.tier} small />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Tournois à venir
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {demoTournaments.filter(t => t.status === "UPCOMING").map(t => (
            <div
              key={t.slug}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${game.color}44`,
                borderRadius: "8px",
                padding: "0.875rem 1rem",
              }}
            >
              <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{t.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Début : {new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <TierBadge tier={t.tier} small />
                {t.prizePool > 0 && (
                  <span style={{ color: "var(--accent-gold)", fontSize: "0.78rem", fontWeight: 600 }}>
                    {t.prizePool.toLocaleString()} XOF
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RankingTab({ color }: { color: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>
          Classement — Saison 1 2025
        </h2>
        <select
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.35rem 0.75rem",
            fontSize: "0.82rem",
          }}
        >
          <option>Saison 1 - 2025</option>
        </select>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              {["Rang", "Joueur", "Ville", "Points", "Wins"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoRankings.map((entry, i) => (
              <tr
                key={entry.rank}
                style={{
                  borderBottom: i < demoRankings.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <td style={{ padding: "0.875rem 1rem" }}>
                  <RankDisplay rank={entry.rank} color={color} />
                </td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <Link href={`/players/${entry.pseudo}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
                    {entry.pseudo}
                  </Link>
                </td>
                <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {entry.city}
                </td>
                <td style={{ padding: "0.875rem 1rem", color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.9rem" }}>
                  {entry.points.toLocaleString()}
                </td>
                <td style={{ padding: "0.875rem 1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  {entry.wins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RankDisplay({ rank, color }: { rank: number; color: string }) {
  if (rank === 1) return <span style={{ color: "var(--accent-gold)", fontWeight: 800 }}>🥇 1</span>;
  if (rank === 2) return <span style={{ color: "#b0b0c0", fontWeight: 800 }}>🥈 2</span>;
  if (rank === 3) return <span style={{ color: "#cd7f32", fontWeight: 800 }}>🥉 3</span>;
  return <span style={{ color, fontWeight: 600 }}>#{rank}</span>;
}

function TournamentsTab() {
  const statusFilters = ["Tous", "À venir", "En cours", "Terminé"];
  const statusColors = {
    UPCOMING: "var(--accent-blue)",
    ONGOING: "var(--accent-green)",
    COMPLETED: "var(--text-muted)",
    CANCELLED: "var(--accent-red)",
  };
  const statusLabels = { UPCOMING: "À venir", ONGOING: "En cours", COMPLETED: "Terminé", CANCELLED: "Annulé" };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {statusFilters.map((f) => (
          <button
            key={f}
            style={{
              padding: "0.35rem 0.875rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: f === "Tous" ? "var(--accent-blue)" : "var(--bg-card)",
              color: f === "Tous" ? "#000" : "var(--text-secondary)",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {demoTournaments.map((t) => (
          <Link key={t.slug} href={`/tournaments/${t.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🏆</span>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    {new Date(t.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <TierBadge tier={t.tier} small />
                <span
                  style={{
                    color: statusColors[t.status],
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {statusLabels[t.status]}
                </span>
                {t.prizePool > 0 && (
                  <span style={{ color: "var(--accent-gold)", fontSize: "0.82rem", fontWeight: 700 }}>
                    {t.prizePool.toLocaleString()} XOF
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PlayersTab({ color }: { color: string }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {demoRankings.map((p) => (
          <Link key={p.pseudo} href={`/players/${p.pseudo}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${color}, var(--accent-blue))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {p.pseudo.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.88rem" }}>{p.pseudo}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{p.city}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
