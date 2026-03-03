import TournamentCard, { TournamentCardData } from "../components/TournamentCard";

const tournaments: TournamentCardData[] = [
  {
    slug: "national-championship-2025",
    name: "National Championship 2025",
    game: "Valorant",
    tier: "S",
    status: "UPCOMING",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    prizePool: 1000000,
    currency: "XOF",
    participantCount: 12,
    maxParticipants: 16,
    location: "Lomé, Togo",
  },
  {
    slug: "free-fire-open-2025",
    name: "Free Fire Open 2025",
    game: "Free Fire",
    tier: "A",
    status: "ONGOING",
    startDate: "2025-03-01",
    endDate: "2025-03-30",
    prizePool: 500000,
    currency: "XOF",
    participantCount: 32,
    maxParticipants: 32,
    location: "En ligne",
  },
  {
    slug: "valorant-cup-lome-2025",
    name: "Valorant Cup Lomé 2025",
    game: "Valorant",
    tier: "A",
    status: "COMPLETED",
    startDate: "2025-03-15",
    endDate: "2025-03-20",
    prizePool: 300000,
    currency: "XOF",
    participantCount: 8,
    location: "Lomé, Togo",
  },
  {
    slug: "fifa-cup-2025",
    name: "FIFA Cup Lomé 2025",
    game: "FIFA 25",
    tier: "B",
    status: "UPCOMING",
    startDate: "2025-05-10",
    endDate: "2025-05-11",
    prizePool: 150000,
    currency: "XOF",
    participantCount: 14,
    maxParticipants: 16,
    location: "Lomé, Togo",
  },
  {
    slug: "mobile-legends-cup-2025",
    name: "Mobile Legends Cup 2025",
    game: "Mobile Legends",
    tier: "B",
    status: "UPCOMING",
    startDate: "2025-04-20",
    endDate: "2025-04-21",
    prizePool: 200000,
    currency: "XOF",
    participantCount: 8,
    maxParticipants: 8,
    location: "Kara, Togo",
  },
  {
    slug: "qualifier-q1-2025",
    name: "Qualificatif Q1 2025",
    game: "Valorant",
    tier: "C",
    status: "COMPLETED",
    startDate: "2025-01-20",
    endDate: "2025-01-21",
    participantCount: 16,
    location: "En ligne",
  },
  {
    slug: "tekken-showdown-2024",
    name: "Tekken Showdown 2024",
    game: "Tekken 8",
    tier: "C",
    status: "COMPLETED",
    startDate: "2024-12-10",
    prizePool: 75000,
    currency: "XOF",
    participantCount: 24,
    location: "Lomé, Togo",
  },
  {
    slug: "pubg-mobile-challenge",
    name: "PUBG Mobile Challenge",
    game: "PUBG Mobile",
    tier: "B",
    status: "CANCELLED",
    startDate: "2025-02-15",
    participantCount: 6,
    location: "En ligne",
  },
];

const statusFilters = [
  { key: "all", label: "Tous" },
  { key: "UPCOMING", label: "À venir" },
  { key: "ONGOING", label: "En cours" },
  { key: "COMPLETED", label: "Terminé" },
];

const tierFilters = ["Tous les tiers", "Tier S", "Tier A", "Tier B", "Tier C"];
const gameFilters = ["Tous les jeux", "Valorant", "Free Fire", "FIFA 25", "Mobile Legends", "PUBG Mobile", "Tekken 8"];
const yearFilters = ["Toutes les années", "2025", "2024"];

export default function TournamentsPage() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Tournois
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {tournaments.length} tournois enregistrés sur GamePedia TG
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {statusFilters.map((f) => (
          <button
            key={f.key}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: f.key === "all" ? "var(--accent-green)" : "var(--bg-card)",
              color: f.key === "all" ? "#000" : "var(--text-secondary)",
              fontWeight: f.key === "all" ? 600 : 400,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {f.label}
            {f.key !== "all" && (
              <span
                style={{
                  marginLeft: "0.375rem",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  padding: "0 5px",
                  fontSize: "0.72rem",
                }}
              >
                {tournaments.filter((t) => f.key === "all" || t.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "0.875rem 1.25rem",
          marginBottom: "1.75rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Filtres :</span>
        {[gameFilters, tierFilters, yearFilters].map((options, i) => (
          <select
            key={i}
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
              padding: "0.4rem 0.75rem",
              fontSize: "0.82rem",
            }}
          >
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Tournaments grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "1.25rem" }}>
        {tournaments.map((t) => (
          <TournamentCard key={t.slug} tournament={t} />
        ))}
      </div>
    </div>
  );
}
