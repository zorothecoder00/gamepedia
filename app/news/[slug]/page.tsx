import Link from "next/link";
import GameTag from "../../components/GameTag";

const articles: Record<string, {
  title: string; excerpt: string; content: string;
  tags: string[]; publishedAt: string; authorName: string;
  readTime: number; category: string;
  related: { slug: string; title: string; category: string }[];
}> = {
  "valorant-cup-lome-2025-recap": {
    title: "Valorant Cup Lomé 2025 : TGO Esports champion !",
    excerpt: "La 3ème édition de la Valorant Cup s'est clôturée sur une finale épique entre TGO Esports et Lomé Gaming.",
    content: `## Résumé du tournoi

La **3ème édition de la Valorant Cup Lomé** s'est tenue du 15 au 20 mars 2025 au Centre de la Jeunesse de Lomé. Huit équipes du pays entier se sont affrontées dans un format élimination directe.

## La finale

La finale opposait **TGO Esports** (tenant du titre, seed #1) à **Lomé Gaming** (outsider révélation).

Après trois cartes disputées, TGO Esports s'impose **3-1** et conserve son titre. Phantom_TG est élu MVP du tournoi avec des statistiques impressionnantes : 34 kills, 87% HS rate sur la carte décisive.

## Distribution des prix

| Position | Équipe | Prize |
|----------|--------|-------|
| 🥇 1er | TGO Esports | 150 000 XOF |
| 🥈 2ème | Lomé Gaming | 90 000 XOF |
| 🥉 3ème | Northern Force | 30 000 XOF |
| 4ème | Togo Legends | 30 000 XOF |

## Prochaine étape

TGO Esports se qualifie ainsi pour le **National Championship 2025** prévu en juin, avec un prize pool d'un million de FCFA.`,
    tags: ["Valorant", "Tournoi", "Lomé", "TGO Esports"],
    publishedAt: "2025-03-21",
    authorName: "GamePedia TG",
    readTime: 4,
    category: "Résultats",
    related: [
      { slug: "national-championship-2025-annonce", title: "National Championship 2025 : 1 million FCFA de prize pool !", category: "Annonce" },
      { slug: "portrait-phantom-tg", title: "Portrait : Phantom_TG, le capitaine de TGO Esports", category: "Portrait" },
    ],
  },
};

const categoryColors: Record<string, string> = {
  Résultats: "var(--accent-green)",
  Analyse: "var(--accent-blue)",
  Annonce: "var(--tier-s)",
  Portrait: "var(--tier-a)",
  Actualité: "var(--text-muted)",
};

// Rendu Markdown simplifié (sans librairie externe)
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.2rem", margin: "1.5rem 0 0.75rem" }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("| ")) {
      // Table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const headers = header.split("|").filter(Boolean).map((h) => h.trim());
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: "auto", margin: "1rem 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr>
                {headers.map((h, j) => (
                  <th key={j} style={{ padding: "0.5rem 0.875rem", textAlign: "left", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    <td key={ci} style={{ padding: "0.5rem 0.875rem", color: "var(--text-secondary)" }}>
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.trim() === "") {
      // skip empty
    } else {
      // paragraph with basic bold
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      elements.push(
        <p key={i} style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.75, marginBottom: "0.875rem" }}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} style={{ color: "var(--text-primary)", fontWeight: 700 }}>{part}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug] ?? {
    title: "Article introuvable",
    excerpt: "",
    content: "Cet article n'existe pas ou a été supprimé.",
    tags: [],
    publishedAt: new Date().toISOString(),
    authorName: "GamePedia TG",
    readTime: 1,
    category: "Actualité",
    related: [],
  };

  const catColor = categoryColors[article.category] ?? "var(--text-muted)";

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "1.5rem", fontSize: "0.8rem" }}>
        <Link href="/news" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Actualités</Link>
        <span style={{ color: "var(--border-bright)" }}>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{article.category}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem", alignItems: "start" }}>
        {/* Article */}
        <article>
          {/* Category + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span
              style={{
                background: `${catColor}22`,
                color: catColor,
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {article.category}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{article.readTime} min de lecture
            </span>
          </div>

          {/* Title */}
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.3, marginBottom: "1rem" }}>
            {article.title}
          </h1>

          {/* Excerpt */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.65,
              marginBottom: "1.5rem",
              paddingLeft: "1rem",
              borderLeft: "3px solid var(--accent-green)",
              fontStyle: "italic",
            }}
          >
            {article.excerpt}
          </p>

          {/* Cover placeholder */}
          <div
            style={{
              height: "240px",
              background: "linear-gradient(135deg, rgba(0,230,118,0.12), rgba(79,195,247,0.06))",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              marginBottom: "2rem",
            }}
          >
            🏆
          </div>

          {/* Content */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "2rem",
            }}
          >
            <MarkdownContent content={article.content} />
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
            {article.tags.map((tag) => <GameTag key={tag} name={tag} />)}
          </div>

          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              GP
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{article.authorName}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Rédaction GamePedia TG</div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "80px" }}>
          {/* Related */}
          {article.related.length > 0 && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>
                Articles liés
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {article.related.map((rel) => {
                  const rc = categoryColors[rel.category] ?? "var(--text-muted)";
                  return (
                    <Link key={rel.slug} href={`/news/${rel.slug}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          padding: "0.75rem",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border)",
                          borderRadius: "7px",
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
                      >
                        <span style={{ background: `${rc}22`, color: rc, fontSize: "0.65rem", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", display: "inline-block", marginBottom: "0.4rem" }}>
                          {rel.category}
                        </span>
                        <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 500, lineHeight: 1.4 }}>
                          {rel.title}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to news */}
          <Link
            href="/news"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.75rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.85rem",
              background: "var(--bg-card)",
            }}
          >
            ← Toutes les actualités
          </Link>
        </aside>
      </div>
    </div>
  );
}
