"use client";
import { useState } from "react";
import Link from "next/link";
import GameTag from "../components/GameTag";
import { useApi } from "@/hooks/useApi";

interface Article {
  id: string; slug: string; title: string; excerpt?: string;
  coverUrl?: string; category: string; publishedAt: string;
  author: { username: string };
  tags?: string[];
  readTime?: number;
}

const CATEGORIES = ["Toutes", "Résultats", "Analyse", "Annonce", "Portrait", "Actualité"];

const CATEGORY_COLORS: Record<string, string> = {
  Résultats: "var(--accent-green)", Analyse: "var(--accent-blue)",
  Annonce: "var(--tier-s)", Portrait: "var(--tier-a)", Actualité: "var(--text-muted)",
};

const CATEGORY_ICONS: Record<string, string> = { Résultats: "🏆", Portrait: "🎮", Annonce: "📢" };

export default function NewsPage() {
  const [category, setCategory] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (gameFilter) params.set("game", gameFilter);
  params.set("page", String(page));

  const { data: articles, meta, loading } = useApi<Article[]>(
    `/api/articles?${params.toString()}`, [category, gameFilter, page],
  );
  const { data: games } = useApi<{ name: string; slug: string }[]>("/api/games");

  const featured = articles?.[0];
  const rest = articles?.slice(1) ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Actualités</h1>
        <p className="text-[0.95rem] text-[var(--text-secondary)]">Toutes les news de la scène esport togolaise</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => {
          const val = cat === "Toutes" ? "" : cat;
          return (
            <button
              key={cat}
              onClick={() => { setCategory(val); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-[0.82rem] cursor-pointer transition-colors ${category === val ? "bg-[var(--accent-green)] text-black font-semibold" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
            >
              {cat}
            </button>
          );
        })}
        <select
          value={gameFilter}
          onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
          className="ml-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3 py-1.5 text-[0.82rem] outline-none"
        >
          <option value="">Tous les jeux</option>
          {(games ?? []).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Aucun article disponible.</div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <Link href={`/news/${featured.slug}`} className="no-underline block mb-8">
              <div
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden grid grid-cols-2 min-h-[220px] transition-colors duration-150 hover:border-[var(--accent-green)]"
              >
                <div
                  className="flex items-center justify-center text-[4rem] border-r border-[var(--border)]"
                  style={{
                    background: featured.coverUrl
                      ? `url(${featured.coverUrl}) center/cover`
                      : "linear-gradient(135deg, rgba(0,230,118,0.15), rgba(79,195,247,0.08))",
                  }}
                >
                  {!featured.coverUrl && (CATEGORY_ICONS[featured.category] ?? "📰")}
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[0.7rem] font-bold px-2 py-0.5 rounded"
                      style={{ background: `${CATEGORY_COLORS[featured.category] ?? "var(--text-muted)"}22`, color: CATEGORY_COLORS[featured.category] ?? "var(--text-muted)" }}
                    >
                      {featured.category}
                    </span>
                    <span className="text-[var(--accent-green)] text-[0.72rem] font-semibold bg-[rgba(0,230,118,0.1)] px-1.5 py-0.5 rounded">
                      À la une
                    </span>
                  </div>
                  <h2 className="text-[1.2rem] font-black text-[var(--text-primary)] leading-snug mb-3">{featured.title}</h2>
                  {featured.excerpt && <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{featured.excerpt}</p>}
                  {featured.tags && featured.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {featured.tags.map((tag) => <GameTag key={tag} name={tag} />)}
                    </div>
                  )}
                  <div className="text-[0.75rem] text-[var(--text-muted)]">
                    {new Date(featured.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {featured.readTime && ` · ${featured.readTime} min de lecture`}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {rest.map((article) => (
              <Link key={article.slug} href={`/news/${article.slug}`} className="no-underline">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden h-full flex flex-col transition-all duration-150 hover:border-[var(--border-bright)] hover:-translate-y-0.5">
                  <div
                    className="h-[120px] flex items-center justify-center text-[2.5rem] border-b border-[var(--border)]"
                    style={{
                      background: article.coverUrl
                        ? `url(${article.coverUrl}) center/cover`
                        : "linear-gradient(135deg, var(--bg-secondary), var(--bg-card-hover))",
                    }}
                  >
                    {!article.coverUrl && (CATEGORY_ICONS[article.category] ?? "📰")}
                  </div>
                  <div className="p-[1.125rem] flex-1 flex flex-col">
                    <div className="mb-2.5">
                      <span
                        className="text-[0.68rem] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${CATEGORY_COLORS[article.category] ?? "var(--text-muted)"}22`, color: CATEGORY_COLORS[article.category] ?? "var(--text-muted)" }}
                      >
                        {article.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-[0.92rem] text-[var(--text-primary)] leading-snug mb-2 flex-1">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed mb-3.5 line-clamp-2">{article.excerpt}</p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-3">
                        {article.tags.slice(0, 2).map((tag) => <GameTag key={tag} name={tag} />)}
                      </div>
                    )}
                    <div className="text-[0.72rem] text-[var(--text-muted)] border-t border-[var(--border)] pt-2.5">
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      {article.readTime && ` · ${article.readTime} min`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer ${p === page ? "bg-[var(--accent-green)] text-black font-bold" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
