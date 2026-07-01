"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags: string[];
  isPublished: boolean;
  updatedAt: string;
}
interface ArticleFull extends ArticleListItem {
  content: string;
  coverImage?: string | null;
  authorName?: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Rendu Markdown minimal (titres, gras, paragraphes) pour l'aperçu. */
function MiniMarkdown({ content }: { content: string }) {
  const blocks = content.split("\n").filter((l) => l.trim() !== "");
  if (blocks.length === 0) {
    return <p className="text-[var(--text-muted)] italic text-sm">Rien à prévisualiser.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-[var(--text-primary)] font-bold text-[1.1rem] mt-2">
              {line.replace("## ", "")}
            </h2>
          );
        }
        const parts = line.split(/\*\*([^*]+)\*\*/g);
        return (
          <p key={i} className="text-[var(--text-secondary)] text-[0.9rem] leading-[1.7]">
            {parts.map((p, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="text-[var(--text-primary)] font-bold">
                  {p}
                </strong>
              ) : (
                p
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AdminArticlesPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const [editing, setEditing] = useState<string | null>(null); // slug en édition
  const [creating, setCreating] = useState(false);

  const {
    data: articles,
    loading,
    refetch,
  } = useApi<ArticleListItem[]>(
    token && isStaff ? "/api/articles?status=all&limit=100" : null,
    [token, isStaff],
    authHeader,
  );

  if (authLoading) {
    return <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!token || !isStaff) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <p>Accès réservé à l&apos;administration.</p>
          <Link href="/" className="text-[var(--accent-green)] no-underline hover:underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  const done = () => {
    setEditing(null);
    setCreating(false);
    refetch();
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <Link href="/admin" className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5">
        ← Dashboard
      </Link>
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <h1 className="text-[2rem] font-black text-[var(--text-primary)]">Articles</h1>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-lg border-none font-semibold text-[0.82rem] cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 transition-opacity"
          >
            + Nouvel article
          </button>
        )}
      </div>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-6">
        Rédigez en Markdown, prévisualisez, publiez ou dépubliez.
      </p>

      {creating && (
        <ArticleEditor authorName={me?.username} authHeader={authHeader} onDone={done} onCancel={() => setCreating(false)} />
      )}
      {editing && (
        <ArticleEditor slug={editing} authHeader={authHeader} onDone={done} onCancel={() => setEditing(null)} />
      )}

      {!creating && !editing && (
        loading ? (
          <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">Aucun article.</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} authHeader={authHeader} onChanged={refetch} onEdit={() => setEditing(a.slug)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function ArticleRow({
  article,
  authHeader,
  onChanged,
  onEdit,
}: {
  article: ArticleListItem;
  authHeader?: Record<string, string>;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const publish = useMutation(`/api/articles/${article.slug}/publish`, "POST", authHeader);
  const del = useMutation(`/api/articles/${article.slug}`, "DELETE", authHeader);
  const busy = publish.loading || del.loading;

  const togglePublish = async () => {
    const r = await publish.mutate();
    if (r) {
      toast.success(article.isPublished ? "Article dépublié." : "Article publié.");
      onChanged();
    }
  };
  const remove = async () => {
    if (!confirm(`Supprimer « ${article.title} » ?`)) return;
    const r = await del.mutate();
    if (r) {
      toast.success("Article supprimé.");
      onChanged();
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[0.95rem] text-[var(--text-primary)]">{article.title}</span>
          <span
            className={`text-[0.68rem] font-semibold px-1.5 py-0.5 rounded border ${
              article.isPublished
                ? "bg-[rgba(0,230,118,0.1)] text-[var(--accent-green)] border-[rgba(0,230,118,0.3)]"
                : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border)]"
            }`}
          >
            {article.isPublished ? "Publié" : "Brouillon"}
          </span>
        </div>
        <div className="text-[0.74rem] text-[var(--text-muted)] mt-0.5">
          {article.tags.length > 0 ? article.tags.join(", ") + " · " : ""}
          maj {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onEdit}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
        >
          Éditer
        </button>
        <button
          onClick={togglePublish}
          disabled={busy}
          className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold border cursor-pointer disabled:opacity-50 transition-colors ${
            article.isPublished
              ? "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]"
              : "bg-[rgba(0,230,118,0.1)] border-[rgba(0,230,118,0.25)] text-[var(--accent-green)] hover:bg-[rgba(0,230,118,0.2)]"
          }`}
        >
          {article.isPublished ? "Dépublier" : "Publier"}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[0.78rem] text-[var(--text-muted)] border border-[var(--border)] cursor-pointer hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] disabled:opacity-50 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

function ArticleEditor({
  slug,
  authorName,
  authHeader,
  onDone,
  onCancel,
}: {
  slug?: string;
  authorName?: string;
  authHeader?: Record<string, string>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { data: existing, loading } = useApi<ArticleFull>(
    slug ? `/api/articles/${slug}` : null,
    [slug],
    authHeader,
  );

  if (slug && loading) {
    return <div className="text-center py-8 text-[var(--text-muted)]">Chargement de l&apos;article…</div>;
  }
  return (
    <EditorForm
      key={existing?.id ?? "new"}
      slug={slug}
      initial={existing ?? undefined}
      authorName={authorName}
      authHeader={authHeader}
      onDone={onDone}
      onCancel={onCancel}
    />
  );
}

function EditorForm({
  slug,
  initial,
  authorName,
  authHeader,
  onDone,
  onCancel,
}: {
  slug?: string;
  initial?: ArticleFull;
  authorName?: string;
  authHeader?: Record<string, string>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [content, setContent] = useState(initial?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const isEdit = !!slug;
  const save = useMutation(
    isEdit ? `/api/articles/${slug}` : "/api/articles",
    isEdit ? "PATCH" : "POST",
    authHeader,
    isEdit ? "Article mis à jour." : "Brouillon créé.",
  );

  const submit = async () => {
    if (!title.trim()) return toast.error("Le titre est requis.");
    if (!content.trim()) return toast.error("Le contenu est requis.");
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = isEdit
      ? { title: title.trim(), excerpt: excerpt.trim() || null, content, tags: tagList }
      : {
          title: title.trim(),
          slug: slugify(title),
          excerpt: excerpt.trim() || null,
          content,
          tags: tagList,
          authorName: authorName ?? "Rédaction",
          isPublished: false,
        };
    const r = await save.mutate(payload);
    if (r) onDone();
  };

  const field =
    "w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-[0.88rem] outline-none box-border";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[1rem] font-bold text-[var(--text-primary)]">
          {isEdit ? "Éditer l'article" : "Nouvel article"}
        </h3>
        <button onClick={onCancel} className="text-[0.8rem] text-[var(--text-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--text-secondary)]">
          ✕ Annuler
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className={field} />
        {!isEdit && title.trim() && (
          <p className="text-[0.7rem] text-[var(--text-muted)] -mt-1">slug : /{slugify(title) || "…"}</p>
        )}
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Extrait (optionnel)" className={field} />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags séparés par des virgules" className={field} />

        {/* Onglets écriture / aperçu */}
        <div className="flex gap-1 border-b border-[var(--border)]">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-[0.8rem] bg-transparent border-none border-b-2 cursor-pointer transition-colors ${
                tab === t
                  ? "border-[var(--accent-green)] text-[var(--accent-green)] font-semibold"
                  : "border-transparent text-[var(--text-muted)]"
              }`}
            >
              {t === "write" ? "Écrire" : "Aperçu"}
            </button>
          ))}
        </div>

        {tab === "write" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder={"Contenu Markdown…\n\n## Un titre\n\nUn paragraphe avec du **gras**."}
            className={`${field} font-mono text-[0.82rem] resize-y`}
          />
        ) : (
          <div className="min-h-[200px] bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
            <MiniMarkdown content={content} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={submit}
          disabled={save.loading}
          className="px-5 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {save.loading ? "…" : isEdit ? "Enregistrer" : "Créer le brouillon"}
        </button>
        <span className="text-[0.75rem] text-[var(--text-muted)]">
          {isEdit ? "La publication se gère depuis la liste." : "L'article est créé en brouillon."}
        </span>
      </div>
    </div>
  );
}
