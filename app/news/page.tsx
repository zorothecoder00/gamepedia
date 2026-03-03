import Link from "next/link";
import GameTag from "../components/GameTag";

const articles = [
  {
    slug: "valorant-cup-lome-2025-recap",
    title: "Valorant Cup Lomé 2025 : TGO Esports champion !",
    excerpt: "La 3ème édition de la Valorant Cup s'est clôturée sur une finale épique entre TGO Esports et Lomé Gaming. Retour sur une compétition mémorable.",
    coverImage: null,
    tags: ["Valorant", "Tournoi", "Lomé"],
    publishedAt: "2025-03-21",
    authorName: "GamePedia TG",
    readTime: 4,
    category: "Résultats",
  },
  {
    slug: "free-fire-open-2025-preview",
    title: "Free Fire Open 2025 : les équipes favorites",
    excerpt: "Analyse des 32 équipes qualifiées pour le Free Fire Open. Qui succédera à Savane Squad, champion de l'édition 2024 ?",
    coverImage: null,
    tags: ["Free Fire", "Analyse"],
    publishedAt: "2025-03-01",
    authorName: "GamePedia TG",
    readTime: 6,
    category: "Analyse",
  },
  {
    slug: "national-championship-2025-annonce",
    title: "National Championship 2025 : 1 million FCFA de prize pool !",
    excerpt: "Le plus grand tournoi esport du Togo est de retour. Avec un prize pool record d'un million de francs CFA, le NC2025 promet d'être historique.",
    coverImage: null,
    tags: ["Valorant", "Tournoi", "National"],
    publishedAt: "2025-02-15",
    authorName: "GamePedia TG",
    readTime: 3,
    category: "Annonce",
  },
  {
    slug: "portrait-phantom-tg",
    title: "Portrait : Phantom_TG, le capitaine de TGO Esports",
    excerpt: "À 22 ans, Kofi Mensah alias Phantom_TG est devenu le joueur Valorant numéro un au Togo. Interview exclusive.",
    coverImage: null,
    tags: ["Valorant", "Portrait", "Joueur"],
    publishedAt: "2025-02-08",
    authorName: "GamePedia TG",
    readTime: 8,
    category: "Portrait",
  },
  {
    slug: "esport-togo-2024-bilan",
    title: "Bilan 2024 : l'esport togolais en pleine expansion",
    excerpt: "34 tournois, 845 joueurs inscrits, plus de 5 millions FCFA de prize pools... L'esport togolais a vécu une année record en 2024.",
    coverImage: null,
    tags: ["Esport", "Bilan", "Togo"],
    publishedAt: "2024-12-31",
    authorName: "GamePedia TG",
    readTime: 7,
    category: "Actualité",
  },
  {
    slug: "mobile-legends-cup-2025-inscription",
    title: "Inscriptions ouvertes : Mobile Legends Cup Kara 2025",
    excerpt: "La première édition de la Mobile Legends Cup à Kara ouvre ses inscriptions. 8 places disponibles, 200 000 FCFA à la clé.",
    coverImage: null,
    tags: ["Mobile Legends", "Tournoi", "Kara"],
    publishedAt: "2025-02-25",
    authorName: "GamePedia TG",
    readTime: 2,
    category: "Annonce",
  },
];

const categories = ["Toutes", "Résultats", "Analyse", "Annonce", "Portrait", "Actualité"];
const gameFilters = ["Tous les jeux", "Valorant", "Free Fire", "FIFA 25", "Mobile Legends"];

const categoryColors: Record<string, string> = {
  Résultats: "var(--accent-green)",
  Analyse: "var(--accent-blue)",
  Annonce: "var(--tier-s)",
  Portrait: "var(--tier-a)",
  Actualité: "var(--text-muted)",
};

export default function NewsPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Actualités
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Toutes les news de la scène esport togolaise
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: cat === "Toutes" ? "var(--accent-green)" : "var(--bg-card)",
              color: cat === "Toutes" ? "#000" : "var(--text-secondary)",
              fontWeight: cat === "Toutes" ? 600 : 400,
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
        <select
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            padding: "0.375rem 0.75rem",
            fontSize: "0.82rem",
            marginLeft: "auto",
          }}
        >
          {gameFilters.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      {/* Featured article */}
      <Link href={`/news/${featured.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: "2rem" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "220px",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-green)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
        >
          {/* Image placeholder */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(79,195,247,0.08))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              borderRight: "1px solid var(--border)",
            }}
          >
            🏆
          </div>

          {/* Content */}
          <div style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span
                style={{
                  background: `${categoryColors[featured.category] ?? "var(--text-muted)"}22`,
                  color: categoryColors[featured.category] ?? "var(--text-muted)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {featured.category}
              </span>
              <span style={{ color: "var(--accent-green)", fontSize: "0.72rem", fontWeight: 600, background: "rgba(0,230,118,0.1)", padding: "1px 6px", borderRadius: "3px" }}>
                À la une
              </span>
            </div>

            <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.4, marginBottom: "0.75rem" }}>
              {featured.title}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              {featured.excerpt}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {featured.tags.map((tag) => <GameTag key={tag} name={tag} />)}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {new Date(featured.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{featured.readTime} min de lecture
            </div>
          </div>
        </div>
      </Link>

      {/* Articles grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
        {rest.map((article) => (
          <Link key={article.slug} href={`/news/${article.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border-bright)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Cover placeholder */}
              <div
                style={{
                  height: "120px",
                  background: "linear-gradient(135deg, var(--bg-secondary), var(--bg-card-hover))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {article.category === "Résultats" ? "🏆" : article.category === "Portrait" ? "🎮" : article.category === "Annonce" ? "📢" : "📰"}
              </div>

              {/* Content */}
              <div style={{ padding: "1.125rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.625rem" }}>
                  <span
                    style={{
                      background: `${categoryColors[article.category] ?? "var(--text-muted)"}22`,
                      color: categoryColors[article.category] ?? "var(--text-muted)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {article.category}
                  </span>
                </div>

                <h3
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    lineHeight: 1.4,
                    marginBottom: "0.5rem",
                    flex: 1,
                  }}
                >
                  {article.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    marginBottom: "0.875rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {article.excerpt}
                </p>

                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  {article.tags.slice(0, 2).map((tag) => <GameTag key={tag} name={tag} />)}
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", borderTop: "1px solid var(--border)", paddingTop: "0.625rem" }}>
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{article.readTime} min
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
