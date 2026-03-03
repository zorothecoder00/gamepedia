import Link from "next/link";

const gamesData: Record<string, { name: string; logo: string; color: string }> = {
  "valorant": { name: "Valorant", logo: "🎯", color: "#ff4655" },
  "free-fire": { name: "Free Fire", logo: "🔥", color: "#ff9800" },
  "fifa-25": { name: "FIFA 25", logo: "⚽", color: "#4caf50" },
  "mobile-legends": { name: "Mobile Legends", logo: "⚔️", color: "#9c27b0" },
};

const demoRankings = [
  { rank: 1, prevRank: 2, pseudo: "Phantom_TG", city: "Lomé", points: 2850, wins: 4, top3: 8, tournamentsPlayed: 14, prizeMoney: 450000, isVerified: true },
  { rank: 2, prevRank: 1, pseudo: "ShadowKing", city: "Kara", points: 2400, wins: 3, top3: 6, tournamentsPlayed: 12, prizeMoney: 310000, isVerified: true },
  { rank: 3, prevRank: 3, pseudo: "RapidStrike", city: "Lomé", points: 1700, wins: 1, top3: 4, tournamentsPlayed: 9, prizeMoney: 120000, isVerified: true },
  { rank: 4, prevRank: 6, pseudo: "ThunderBolt", city: "Lomé", points: 1100, wins: 0, top3: 2, tournamentsPlayed: 7, prizeMoney: 45000, isVerified: false },
  { rank: 5, prevRank: 5, pseudo: "IceBreaker", city: "Lomé", points: 950, wins: 0, top3: 1, tournamentsPlayed: 6, prizeMoney: 30000, isVerified: false },
  { rank: 6, prevRank: 4, pseudo: "BlazeFire", city: "Atakpamé", points: 880, wins: 0, top3: 1, tournamentsPlayed: 5, prizeMoney: 20000, isVerified: false },
  { rank: 7, prevRank: 7, pseudo: "NightWolf", city: "Lomé", points: 750, wins: 0, top3: 0, tournamentsPlayed: 4, prizeMoney: 0, isVerified: false },
  { rank: 8, prevRank: 9, pseudo: "DragonSlayer", city: "Sokodé", points: 680, wins: 0, top3: 0, tournamentsPlayed: 3, prizeMoney: 0, isVerified: false },
  { rank: 9, prevRank: 8, pseudo: "CobaltWave", city: "Lomé", points: 590, wins: 0, top3: 0, tournamentsPlayed: 3, prizeMoney: 0, isVerified: false },
  { rank: 10, prevRank: 10, pseudo: "GoldenEagle", city: "Dapaong", points: 490, wins: 0, top3: 0, tournamentsPlayed: 2, prizeMoney: 0, isVerified: false },
];

const seasons = ["Saison 1 · 2025", "Saison 2 · 2024", "Saison 1 · 2024"];

function MovementBadge({ current, prev }: { current: number; prev: number }) {
  const diff = prev - current;
  if (diff === 0) return <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>—</span>;
  const isUp = diff > 0;
  return (
    <span style={{ color: isUp ? "var(--accent-green)" : "var(--accent-red)", fontSize: "0.72rem", fontWeight: 600 }}>
      {isUp ? "▲" : "▼"} {Math.abs(diff)}
    </span>
  );
}

export default function GameRankingPage({ params }: { params: { gameSlug: string } }) {
  const game = gamesData[params.gameSlug] ?? { name: params.gameSlug, logo: "🎮", color: "var(--accent-blue)" };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "1.25rem", fontSize: "0.8rem" }}>
        <Link href="/rankings" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Classements</Link>
        <span style={{ color: "var(--border-bright)" }}>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{game.name}</span>
      </div>

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${game.color}15, var(--bg-primary))`,
          border: `1px solid ${game.color}33`,
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{game.logo}</span>
          <div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              Classement {game.name}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
              {demoRankings.length} joueurs classés · Saison 1 · 2025
            </p>
          </div>
        </div>
        <select
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          {seasons.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Ranking table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 40px 1fr 120px 70px 70px 70px 120px",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            gap: "0.5rem",
          }}
        >
          {["Rang", "Mvt", "Joueur", "Points", "Wins", "Top 3", "Tournois", "Prize Money"].map((h) => (
            <div key={h} style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {demoRankings.map((entry, i) => (
          <div
            key={entry.pseudo}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 40px 1fr 120px 70px 70px 70px 120px",
              padding: "0.875rem 1rem",
              borderBottom: i < demoRankings.length - 1 ? "1px solid var(--border)" : "none",
              gap: "0.5rem",
              alignItems: "center",
              background: entry.rank <= 3 ? `${["rgba(255,215,0,0.04)", "rgba(176,176,192,0.04)", "rgba(205,127,50,0.04)"][entry.rank - 1]}` : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {entry.rank <= 3 ? (
                <span style={{ fontSize: "1.2rem" }}>{["🥇", "🥈", "🥉"][entry.rank - 1]}</span>
              ) : (
                <span style={{ color: game.color, fontWeight: 700, fontSize: "0.9rem" }}>#{entry.rank}</span>
              )}
            </div>

            <div>
              <MovementBadge current={entry.rank} prev={entry.prevRank} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${game.color}, var(--accent-blue))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  flexShrink: 0,
                }}
              >
                {entry.pseudo.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Link
                    href={`/players/${entry.pseudo}`}
                    style={{
                      color: entry.rank <= 3 ? ["var(--accent-gold)", "#b0b0c0", "#cd7f32"][entry.rank - 1] : "var(--text-primary)",
                      fontWeight: entry.rank <= 3 ? 700 : 500,
                      fontSize: "0.88rem",
                      textDecoration: "none",
                    }}
                  >
                    {entry.pseudo}
                  </Link>
                  {entry.isVerified && <span style={{ color: "var(--accent-blue)", fontSize: "0.7rem" }}>✓</span>}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{entry.city}</div>
              </div>
            </div>

            <div style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.9rem" }}>
              {entry.points.toLocaleString()} pts
            </div>

            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{entry.wins}</div>

            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{entry.top3}</div>

            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{entry.tournamentsPlayed}</div>

            <div style={{ color: entry.prizeMoney > 0 ? "var(--accent-green)" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: entry.prizeMoney > 0 ? 600 : 400 }}>
              {entry.prizeMoney > 0 ? `${entry.prizeMoney.toLocaleString()} XOF` : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: p === 1 ? game.color : "var(--bg-card)",
              color: p === 1 ? "#000" : "var(--text-secondary)",
              fontWeight: p === 1 ? 700 : 400,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
