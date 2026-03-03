import Link from "next/link";
import GameTag from "../components/GameTag";

const games = [
  {
    slug: "valorant",
    name: "Valorant",
    genre: "FPS Tactique",
    format: "5v5",
    platforms: ["PC"],
    playerCount: 124,
    tournamentCount: 18,
    logo: "🎯",
    description: "Shooter tactique 5v5 d'Riot Games. Le jeu phare de la scène esport au Togo.",
    isActive: true,
    color: "#ff4655",
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    genre: "Battle Royale",
    format: "Battle Royale",
    platforms: ["Mobile"],
    playerCount: 312,
    tournamentCount: 34,
    logo: "🔥",
    description: "Battle royale mobile de Garena, jeu le plus populaire sur mobile au Togo.",
    isActive: true,
    color: "#ff9800",
  },
  {
    slug: "fifa-25",
    name: "FIFA 25",
    genre: "Sport",
    format: "1v1",
    platforms: ["PC", "Console"],
    playerCount: 89,
    tournamentCount: 12,
    logo: "⚽",
    description: "Football virtuel par EA Sports. Compétitions 1v1 très populaires à Lomé.",
    isActive: true,
    color: "#4caf50",
  },
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    genre: "MOBA",
    format: "5v5",
    platforms: ["Mobile"],
    playerCount: 178,
    tournamentCount: 22,
    logo: "⚔️",
    description: "MOBA mobile de Moonton, très populaire dans la région CEDEAO.",
    isActive: true,
    color: "#9c27b0",
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    genre: "Battle Royale",
    format: "Battle Royale",
    platforms: ["Mobile"],
    playerCount: 95,
    tournamentCount: 9,
    logo: "🪖",
    description: "Battle royale de Krafton sur mobile, connu pour ses tournois compétitifs.",
    isActive: true,
    color: "#795548",
  },
  {
    slug: "tekken-8",
    name: "Tekken 8",
    genre: "Combat",
    format: "1v1",
    platforms: ["PC", "Console"],
    playerCount: 47,
    tournamentCount: 7,
    logo: "🥊",
    description: "Jeu de combat légendaire de Bandai Namco. La scène fighting game au Togo.",
    isActive: true,
    color: "#e91e63",
  },
];

const platforms = ["Tous", "PC", "Mobile", "Console"];

export default function GamesPage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Catalogue des Jeux
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {games.length} jeux actifs sur la plateforme GamePedia TG
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", alignSelf: "center", marginRight: "0.25rem" }}>
          Plateforme :
        </span>
        {platforms.map((p) => (
          <button
            key={p}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: p === "Tous" ? "var(--accent-green)" : "var(--bg-card)",
              color: p === "Tous" ? "#000" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: p === "Tous" ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Games grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {games.map((game) => (
          <Link key={game.slug} href={`/games/${game.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "border-color 0.15s, transform 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = game.color;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Banner */}
              <div
                style={{
                  height: "80px",
                  background: `linear-gradient(135deg, ${game.color}22, ${game.color}08)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  borderBottom: `1px solid ${game.color}33`,
                }}
              >
                {game.logo}
              </div>

              {/* Content */}
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>
                    {game.name}
                  </h3>
                  <GameTag name={game.genre} color={game.color} />
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {game.description}
                </p>

                {/* Platforms */}
                <div style={{ display: "flex", gap: "0.3rem", marginBottom: "1rem" }}>
                  {game.platforms.map((p) => (
                    <span
                      key={p}
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        padding: "1px 6px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ color: game.color, fontWeight: 700, fontSize: "1.1rem" }}>
                      {game.playerCount}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Joueurs</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "1.1rem" }}>
                      {game.tournamentCount}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Tournois</div>
                  </div>
                  <div style={{ marginLeft: "auto", alignSelf: "center" }}>
                    <span style={{ color: game.color, fontSize: "0.8rem", fontWeight: 600 }}>
                      Voir →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
