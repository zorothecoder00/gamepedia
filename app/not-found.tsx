import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      {/* Décoration */}
      <div className="relative mb-8">
        <p className="text-[9rem] font-black leading-none select-none [color:transparent] [-webkit-text-stroke:2px_var(--border-bright)]">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🎮</span>
        </div>
      </div>

      <h1 className="text-2xl font-black text-[var(--text-primary)] mb-3">
        Page introuvable
      </h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        Cette page n&apos;existe pas ou a été déplacée.
        Retournez à l&apos;accueil pour continuer à explorer la scène esport togolaise.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-[var(--accent-green)] hover:opacity-90 transition-opacity"
        >
          Accueil
        </Link>
        <Link
          href="/tournaments"
          className="px-6 py-3 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Tournois
        </Link>
        <Link
          href="/players"
          className="px-6 py-3 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Joueurs
        </Link>
      </div>
    </div>
  );
}
