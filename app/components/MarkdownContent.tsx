import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu Markdown des articles (GitHub Flavored Markdown).
 * Chaque élément est stylé pour rester cohérent avec le thème sombre
 * GamePedia TG. Remplace l'ancien parseur maison.
 */
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[var(--text-primary)] font-black text-[1.5rem] mt-6 mb-3.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[var(--text-primary)] font-bold text-[1.2rem] mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[var(--text-primary)] font-semibold text-[1.05rem] mt-5 mb-2.5">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-[var(--text-secondary)] text-[0.92rem] leading-[1.75] mb-3.5">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-[var(--text-primary)] font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-[var(--accent-green)] no-underline hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-3.5 text-[var(--text-secondary)] text-[0.92rem] leading-[1.75] marker:text-[var(--accent-green)]">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-3.5 text-[var(--text-secondary)] text-[0.92rem] leading-[1.75] marker:text-[var(--text-muted)]">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-[3px] border-[var(--accent-green)] italic text-[var(--text-secondary)] my-4">{children}</blockquote>
          ),
          hr: () => <hr className="border-0 border-t border-[var(--border)] my-6" />,
          code: ({ className, children }) => {
            // Bloc de code (```) → className "language-xxx" ; sinon code en ligne.
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return <code className="font-mono text-[0.85rem] text-[var(--text-primary)]">{children}</code>;
            }
            return (
              <code className="font-mono text-[0.85rem] bg-[var(--bg-primary)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--accent-blue)]">{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto my-4">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-[0.88rem]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 text-left text-[var(--text-muted)] border-b border-[var(--border)] font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-[var(--text-secondary)] border-b border-[var(--border)]">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
