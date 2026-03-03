import PlayerCard, { PlayerCardData } from "../components/PlayerCard";

const players: PlayerCardData[] = [
  { pseudo: "Phantom_TG", city: "Lomé", games: ["Valorant", "Free Fire"], totalPoints: 2850, isVerified: true },
  { pseudo: "ShadowKing", city: "Kara", games: ["Valorant"], totalPoints: 2400, isVerified: true },
  { pseudo: "NightWolf", city: "Lomé", games: ["Free Fire", "Mobile Legends"], totalPoints: 2100, isVerified: false },
  { pseudo: "BlazeFire", city: "Atakpamé", games: ["Free Fire"], totalPoints: 1900, isVerified: false },
  { pseudo: "RapidStrike", city: "Lomé", games: ["Valorant", "FIFA 25"], totalPoints: 1700, isVerified: true },
  { pseudo: "DragonSlayer", city: "Sokodé", games: ["Mobile Legends"], totalPoints: 1550, isVerified: false },
  { pseudo: "IceBreaker", city: "Lomé", games: ["FIFA 25", "Tekken 8"], totalPoints: 1400, isVerified: false },
  { pseudo: "StormRider", city: "Kara", games: ["Free Fire", "PUBG Mobile"], totalPoints: 1250, isVerified: true },
  { pseudo: "ThunderBolt", city: "Lomé", games: ["Valorant"], totalPoints: 1100, isVerified: false },
  { pseudo: "FireFist", city: "Lomé", games: ["FIFA 25"], totalPoints: 950, isVerified: false },
  { pseudo: "GoldenEagle", city: "Dapaong", games: ["Free Fire"], totalPoints: 820, isVerified: false },
  { pseudo: "CobaltWave", city: "Lomé", games: ["Mobile Legends", "Free Fire"], totalPoints: 750, isVerified: true },
];

const games = ["Tous les jeux", "Valorant", "Free Fire", "FIFA 25", "Mobile Legends", "PUBG Mobile", "Tekken 8"];
const cities = ["Toutes les villes", "Lomé", "Kara", "Sokodé", "Atakpamé", "Dapaong"];

export default function PlayersPage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Annuaire des Joueurs
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {players.length} joueurs inscrits sur GamePedia TG
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            style={{
              width: "100%",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              padding: "0.5rem 0.875rem",
              fontSize: "0.88rem",
              outline: "none",
            }}
          />
        </div>

        {/* Game filter */}
        <select
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.5rem 0.875rem",
            fontSize: "0.85rem",
          }}
        >
          {games.map((g) => <option key={g}>{g}</option>)}
        </select>

        {/* City filter */}
        <select
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.5rem 0.875rem",
            fontSize: "0.85rem",
          }}
        >
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Players list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {players.map((player) => (
          <PlayerCard key={player.pseudo} player={player} />
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: p === 1 ? "var(--accent-green)" : "var(--bg-card)",
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
