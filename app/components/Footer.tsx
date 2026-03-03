import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "3rem 1.5rem 1.5rem",
        }}
      >
        {/* Top section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span
                style={{
                  background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 900,
                  fontSize: "1.125rem",
                }}
              >
                GamePedia
              </span>
              <span
                style={{
                  background: "var(--accent-gold)",
                  color: "#000",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                TG
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              La référence de l&apos;esport au Togo. Suivez les tournois, joueurs et classements.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              {["Twitter", "Discord", "YouTube"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    textDecoration: "none",
                    padding: "0.25rem 0.5rem",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    transition: "color 0.15s",
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Plateforme
            </h4>
            {[
              { href: "/games", label: "Jeux" },
              { href: "/tournaments", label: "Tournois" },
              { href: "/players", label: "Joueurs" },
              { href: "/teams", label: "Équipes" },
              { href: "/rankings", label: "Classements" },
            ].map((l) => (
              <div key={l.href} style={{ marginBottom: "0.4rem" }}>
                <Link href={l.href} style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Communauté */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Communauté
            </h4>
            {[
              { href: "/news", label: "Actualités" },
              { href: "/auth/register", label: "Rejoindre" },
              { href: "/profile", label: "Mon profil" },
            ].map((l) => (
              <div key={l.href} style={{ marginBottom: "0.4rem" }}>
                <Link href={l.href} style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Légal */}
          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Légal
            </h4>
            {[
              { href: "#", label: "Conditions d'utilisation" },
              { href: "#", label: "Politique de confidentialité" },
              { href: "#", label: "Mentions légales" },
            ].map((l) => (
              <div key={l.label} style={{ marginBottom: "0.4rem" }}>
                <Link href={l.href} style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            © 2025 GamePedia TG. Tous droits réservés.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Fait avec ❤️ pour l&apos;esport togolais 🇹🇬
          </p>
        </div>
      </div>
    </footer>
  );
}
