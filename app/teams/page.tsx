import Link from "next/link";
import GameTag from "../components/GameTag";

const teams = [
  {
    slug: "tgo-esports",
    name: "TGO Esports",
    tag: "TGO",
    city: "Lomé",
    region: "Maritime",
    games: ["Valorant", "Free Fire"],
    memberCount: 8,
    wins: 7,
    logo: "🦅",
    color: "#00e676",
    founded: "2022",
  },
  {
    slug: "lome-gaming",
    name: "Lomé Gaming",
    tag: "LMG",
    city: "Lomé",
    region: "Maritime",
    games: ["FIFA 25", "Tekken 8"],
    memberCount: 5,
    wins: 4,
    logo: "🦁",
    color: "#ffd700",
    founded: "2021",
  },
  {
    slug: "northern-force",
    name: "Northern Force",
    tag: "NFR",
    city: "Kara",
    region: "Centrale",
    games: ["Free Fire", "Mobile Legends"],
    memberCount: 12,
    wins: 3,
    logo: "⚡",
    color: "#4fc3f7",
    founded: "2023",
  },
  {
    slug: "togo-legends",
    name: "Togo Legends",
    tag: "TGL",
    city: "Lomé",
    region: "Maritime",
    games: ["Valorant", "Mobile Legends", "PUBG Mobile"],
    memberCount: 15,
    wins: 6,
    logo: "🏆",
    color: "#9c27b0",
    founded: "2020",
  },
  {
    slug: "savane-squad",
    name: "Savane Squad",
    tag: "SVS",
    city: "Dapaong",
    region: "Savanes",
    games: ["Free Fire"],
    memberCount: 6,
    wins: 1,
    logo: "🌿",
    color: "#8bc34a",
    founded: "2023",
  },
  {
    slug: "black-panther-gaming",
    name: "Black Panther Gaming",
    tag: "BPG",
    city: "Sokodé",
    region: "Centrale",
    games: ["FIFA 25", "Tekken 8"],
    memberCount: 4,
    wins: 2,
    logo: "🐾",
    color: "#607d8b",
    founded: "2022",
  },
];

const regions = ["Toutes les régions", "Maritime", "Centrale", "Savanes", "Kara", "Plateaux"];
const gameFilter = ["Tous les jeux", "Valorant", "Free Fire", "FIFA 25", "Mobile Legends"];

export default function TeamsPage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Équipes
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {teams.length} équipes inscrites sur GamePedia TG
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.5rem 0.875rem",
            fontSize: "0.85rem",
          }}
        >
          {gameFilter.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.5rem 0.875rem",
            fontSize: "0.85rem",
          }}
        >
          {regions.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Teams grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.25rem" }}>
        {teams.map((team) => (
          <Link key={team.slug} href={`/teams/${team.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.5rem",
                transition: "border-color 0.15s, transform 0.15s",
                cursor: "pointer",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = team.color;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                    background: `${team.color}20`,
                    border: `1px solid ${team.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                  }}
                >
                  {team.logo}
                </div>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem" }}>
                    {team.name}
                  </div>
                  <span
                    style={{
                      background: `${team.color}22`,
                      color: team.color,
                      border: `1px solid ${team.color}44`,
                      borderRadius: "3px",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "1px 5px",
                    }}
                  >
                    {team.tag}
                  </span>
                </div>
              </div>

              {/* Games */}
              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                {team.games.map((g) => (
                  <GameTag key={g} name={g} color={team.color} />
                ))}
              </div>

              {/* Details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  📍 {team.city} · 👥 {team.memberCount} membres
                </div>
                <div style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.85rem" }}>
                  {team.wins} 🏆
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
