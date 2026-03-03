import Link from "next/link";

const gamesRankings = [
  {
    slug: "valorant",
    name: "Valorant",
    logo: "🎯",
    color: "#ff4655",
    top5: [
      { rank: 1, pseudo: "Phantom_TG", points: 2850, city: "Lomé", wins: 4 },
      { rank: 2, pseudo: "ShadowKing", points: 2400, city: "Kara", wins: 3 },
      { rank: 3, pseudo: "RapidStrike", points: 1700, city: "Lomé", wins: 1 },
      { rank: 4, pseudo: "ThunderBolt", points: 1100, city: "Lomé", wins: 0 },
      { rank: 5, pseudo: "IceBreaker", points: 950, city: "Lomé", wins: 0 },
    ],
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    logo: "🔥",
    color: "#ff9800",
    top5: [
      { rank: 1, pseudo: "BlazeFire", points: 3200, city: "Atakpamé", wins: 5 },
      { rank: 2, pseudo: "NightWolf", points: 2900, city: "Lomé", wins: 4 },
      { rank: 3, pseudo: "GoldenEagle", points: 2100, city: "Dapaong", wins: 2 },
      { rank: 4, pseudo: "StormRider", points: 1800, city: "Kara", wins: 2 },
      { rank: 5, pseudo: "CobaltWave", points: 1400, city: "Lomé", wins: 1 },
    ],
  },
  {
    slug: "fifa-25",
    name: "FIFA 25",
    logo: "⚽",
    color: "#4caf50",
    top5: [
      { rank: 1, pseudo: "FireFist", points: 2100, city: "Lomé", wins: 3 },
      { rank: 2, pseudo: "IceBreaker", points: 1700, city: "Lomé", wins: 2 },
      { rank: 3, pseudo: "RapidStrike", points: 1400, city: "Lomé", wins: 1 },
      { rank: 4, pseudo: "DragonSlayer", points: 1100, city: "Sokodé", wins: 1 },
      { rank: 5, pseudo: "StormRider", points: 900, city: "Kara", wins: 0 },
    ],
  },
];

const rankColors = ["var(--accent-gold)", "#b0b0c0", "#cd7f32"];
const rankIcons = ["🥇", "🥈", "🥉"];

export default function RankingsPage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Classements
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Top 5 de chaque jeu actif — Saison 1 · 2025
        </p>
      </div>

      {/* Grille de classements par jeu */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
        {gamesRankings.map((game) => (
          <div
            key={game.slug}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Game header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${game.color}18, ${game.color}05)`,
                borderBottom: `1px solid ${game.color}33`,
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{game.logo}</span>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem" }}>{game.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.73rem" }}>Saison 1 · 2025</div>
                </div>
              </div>
              <Link
                href={`/rankings/${game.slug}`}
                style={{
                  color: game.color,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                Voir tout →
              </Link>
            </div>

            {/* Top 5 */}
            <div>
              {game.top5.map((entry, i) => (
                <div
                  key={entry.pseudo}
                  style={{
                    padding: "0.75rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                    background: i === 0 ? "rgba(255,215,0,0.04)" : "transparent",
                  }}
                >
                  {/* Rang */}
                  <div style={{ width: "28px", textAlign: "center", flexShrink: 0 }}>
                    {i < 3 ? (
                      <span style={{ fontSize: "1rem" }}>{rankIcons[i]}</span>
                    ) : (
                      <span style={{ color: game.color, fontWeight: 700, fontSize: "0.88rem" }}>#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: i < 3
                        ? `linear-gradient(135deg, ${rankColors[i]}, ${game.color})`
                        : `${game.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: i < 3 ? "#000" : game.color,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      flexShrink: 0,
                    }}
                  >
                    {entry.pseudo.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/players/${entry.pseudo}`}
                      style={{
                        color: i === 0 ? "var(--accent-gold)" : "var(--text-primary)",
                        fontWeight: i < 3 ? 700 : 500,
                        fontSize: "0.88rem",
                        textDecoration: "none",
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.pseudo}
                    </Link>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{entry.city}</span>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.9rem" }}>
                      {entry.points.toLocaleString()}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>pts</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "0.75rem 1.25rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Link
                href={`/rankings/${game.slug}`}
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Classement complet →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
