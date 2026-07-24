"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/games", label: "Jeux" },
  { href: "/tournaments", label: "Tournois" },
  { href: "/players", label: "Joueurs" },
  { href: "/teams", label: "Équipes" },
  { href: "/rankings", label: "Classements" },
  { href: "/wagers", label: "Paris" },
  { href: "/news", label: "Actualités" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { me, isAuthenticated, refetch } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Resynchronise l'état d'auth du Navbar (le cookie est déjà effacé
      // côté serveur) avant de naviguer, sans recharger toute la page.
      refetch();
      router.push("/auth/login?loggedOut=1");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link href="/" className="no-underline flex items-center gap-2">
          <span className="bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] bg-clip-text text-transparent font-black text-xl tracking-tight">
            GamePedia
          </span>
          <span className="bg-[var(--accent-gold)] text-black text-[0.65rem] font-bold px-[5px] py-px rounded-[3px] tracking-wide">
            TG
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm no-underline transition-all ${
                  active
                    ? "font-semibold text-[var(--accent-green)] bg-[rgba(0,230,118,0.08)]"
                    : "font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="hidden md:inline-flex px-3.5 py-1.5 rounded-md text-sm font-medium text-[var(--text-secondary)] no-underline border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
              >
                {me?.player?.pseudo ?? me?.username}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden md:inline-flex px-3.5 py-1.5 rounded-md text-sm font-semibold text-black bg-[var(--accent-green)] border-none cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loggingOut ? "…" : "Déconnexion"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:inline-flex px-3.5 py-1.5 rounded-md text-sm font-medium text-[var(--text-secondary)] no-underline border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="hidden md:inline-flex px-3.5 py-1.5 rounded-md text-sm font-semibold text-black no-underline bg-[var(--accent-green)] hover:opacity-90 transition-opacity"
              >
                S&apos;inscrire
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden bg-transparent border-none cursor-pointer text-[var(--text-primary)] p-1"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border)] px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-[0.9rem] no-underline ${
                  active
                    ? "font-semibold text-[var(--accent-green)] bg-[rgba(0,230,118,0.08)]"
                    : "font-normal text-[var(--text-secondary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] no-underline border border-[var(--border)]"
                >
                  {me?.player?.pseudo ?? me?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 text-center py-2 rounded-md text-sm font-semibold text-black bg-[var(--accent-green)] border-none cursor-pointer disabled:opacity-50"
                >
                  {loggingOut ? "…" : "Déconnexion"}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="flex-1 text-center py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] no-underline border border-[var(--border)]">
                  Connexion
                </Link>
                <Link href="/auth/register" className="flex-1 text-center py-2 rounded-md text-sm font-semibold text-black no-underline bg-[var(--accent-green)]">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
