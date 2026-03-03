"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/games", label: "Jeux" },
  { href: "/tournaments", label: "Tournois" },
  { href: "/players", label: "Joueurs" },
  { href: "/teams", label: "Équipes" },
  { href: "/rankings", label: "Classements" },
  { href: "/news", label: "Actualités" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 900,
              fontSize: "1.25rem",
              letterSpacing: "-0.5px",
            }}
          >
            GamePedia
          </span>
          <span
            style={{
              background: "var(--accent-gold)",
              color: "#000",
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: "3px",
              letterSpacing: "0.5px",
            }}
          >
            TG
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--accent-green)" : "var(--text-secondary)",
                  textDecoration: "none",
                  background: active ? "rgba(0, 230, 118, 0.08)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link
            href="/auth/login"
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              border: "1px solid var(--border)",
            }}
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#000",
              textDecoration: "none",
              background: "var(--accent-green)",
            }}
          >
            S&apos;inscrire
          </Link>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: "0.25rem",
            }}
            className="hamburger"
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
        <div
          style={{
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--accent-green)" : "var(--text-secondary)",
                  textDecoration: "none",
                  background: active ? "rgba(0, 230, 118, 0.08)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
