"use client";
import Link from "next/link";
import GameTag from "../../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface Article {
  id: string; slug: string; title: string; excerpt?: string;
  content: string; coverUrl?: string; category: string;
  publishedAt: string; tags?: string[]; readTime?: number;
  author: { username: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  Résultats: "var(--accent-green)", Analyse: "var(--accent-blue)",
  Annonce: "var(--tier-s)", Portrait: "var(--tier-a)", Actualité: "var(--text-muted)",
};

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[var(--text-primary)] font-bold text-[1.2rem] mt-6 mb-3">
          {line.replace("## ", "")}
        </h2>,
      );
    } else if (line.startsWith("| ")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      const [header, , ...rows] = tableLines;
      const headers = header.split("|").filter(Boolean).map((h) => h.trim());
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="w-full border-collapse text-[0.88rem]">
            <thead>
              <tr>
                {headers.map((h, j) => (
                  <th key={j} className="px-3.5 py-2 text-left text-[var(--text-muted)] border-b border-[var(--border)] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[var(--border)]">
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    <td key={ci} className="px-3.5 py-2 text-[var(--text-secondary)]">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    } else if (line.trim() !== "") {
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      elements.push(
        <p key={i} className="text-[var(--text-secondary)] text-[0.92rem] leading-[1.75] mb-3.5">
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-[var(--text-primary)] font-bold">{part}</strong> : part,
          )}
        </p>,
      );
    }
    i++;
  }
  return <div>{elements}</div>;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: article, loading } = useApi<Article>(`/api/articles/${slug}`);

  if (loading) {
    return <div className="max-w-[1280px] mx-auto my-16 text-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!article) {
    return (
      <div className="max-w-[1280px] mx-auto my-16 text-center">
        <p className="text-[var(--text-muted)] mb-4">Article introuvable.</p>
        <Link href="/news" className="text-[var(--accent-green)] no-underline text-sm hover:underline">← Retour aux actualités</Link>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[article.category] ?? "var(--text-muted)";

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex gap-1.5 items-center mb-6 text-[0.8rem]">
        <Link href="/news" className="text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)]">Actualités</Link>
        <span className="text-[var(--border-bright)]">›</span>
        <span className="text-[var(--text-secondary)]">{article.category}</span>
      </div>

      <div className="grid [grid-template-columns:1fr_300px] gap-10">
        <article>
          {/* Meta */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[0.72rem] font-bold px-2 py-0.5 rounded"
              style={{ background: `${catColor}22`, color: catColor }}
            >
              {article.category}
            </span>
            <span className="text-[var(--text-muted)] text-[0.78rem]">
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {article.readTime && ` · ${article.readTime} min de lecture`}
            </span>
          </div>

          <h1 className="text-[1.75rem] font-black text-[var(--text-primary)] leading-snug mb-4">{article.title}</h1>

          {article.excerpt && (
            <p className="text-base text-[var(--text-secondary)] leading-[1.65] mb-6 pl-4 border-l-[3px] border-[var(--accent-green)] italic">
              {article.excerpt}
            </p>
          )}

          {/* Cover */}
          <div
            className="h-60 rounded-xl mb-8 border border-[var(--border)] flex items-center justify-center text-[4rem]"
            style={{
              background: article.coverUrl
                ? `url(${article.coverUrl}) center/cover`
                : "linear-gradient(135deg, rgba(0,230,118,0.12), rgba(79,195,247,0.06))",
            }}
          >
            {!article.coverUrl && "🏆"}
          </div>

          {/* Content */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
            <MarkdownContent content={article.content} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-6">
              {article.tags.map((tag) => <GameTag key={tag} name={tag} />)}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-[var(--border)]">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0 bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)]">
              {article.author.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">{article.author.username}</div>
              <div className="text-[0.75rem] text-[var(--text-muted)]">Rédaction GamePedia TG</div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="sticky top-20">
          <Link
            href="/news"
            className="block text-center py-3 border border-[var(--border)] rounded-lg text-[var(--text-secondary)] no-underline text-sm bg-[var(--bg-card)] hover:border-[var(--border-bright)] transition-colors"
          >
            ← Toutes les actualités
          </Link>
        </aside>
      </div>
    </div>
  );
}
