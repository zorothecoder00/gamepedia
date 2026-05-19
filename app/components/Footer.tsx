import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-6">

        {/* Top section */}
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] bg-clip-text text-transparent font-black text-lg">
                GamePedia
              </span>
              <span className="bg-[var(--accent-gold)] text-black text-[0.6rem] font-bold px-[5px] py-px rounded-[3px]">
                TG
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-[0.85rem] leading-relaxed">
              La référence de l&apos;esport au Togo. Suivez les tournois, joueurs et classements.
            </p>
            <div className="flex gap-3 mt-4">
              {["Twitter", "Discord", "YouTube"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[var(--text-muted)] text-[0.75rem] no-underline px-2 py-1 border border-[var(--border)] rounded hover:text-[var(--text-primary)] transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-[var(--text-primary)] text-[0.85rem] font-semibold mb-3">Plateforme</h4>
            {[
              { href: "/games", label: "Jeux" },
              { href: "/tournaments", label: "Tournois" },
              { href: "/players", label: "Joueurs" },
              { href: "/teams", label: "Équipes" },
              { href: "/rankings", label: "Classements" },
            ].map((l) => (
              <div key={l.href} className="mb-[0.4rem]">
                <Link href={l.href} className="text-[var(--text-muted)] text-[0.85rem] no-underline hover:text-[var(--text-secondary)] transition-colors">
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Communauté */}
          <div>
            <h4 className="text-[var(--text-primary)] text-[0.85rem] font-semibold mb-3">Communauté</h4>
            {[
              { href: "/news", label: "Actualités" },
              { href: "/auth/register", label: "Rejoindre" },
              { href: "/profile", label: "Mon profil" },
            ].map((l) => (
              <div key={l.href} className="mb-[0.4rem]">
                <Link href={l.href} className="text-[var(--text-muted)] text-[0.85rem] no-underline hover:text-[var(--text-secondary)] transition-colors">
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-[var(--text-primary)] text-[0.85rem] font-semibold mb-3">Légal</h4>
            {[
              { href: "#", label: "Conditions d'utilisation" },
              { href: "#", label: "Politique de confidentialité" },
              { href: "#", label: "Mentions légales" },
            ].map((l) => (
              <div key={l.label} className="mb-[0.4rem]">
                <Link href={l.href} className="text-[var(--text-muted)] text-[0.85rem] no-underline hover:text-[var(--text-secondary)] transition-colors">
                  {l.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-5 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[var(--text-muted)] text-[0.8rem]">© 2025 GamePedia TG. Tous droits réservés.</p>
          <p className="text-[var(--text-muted)] text-[0.8rem]">Fait avec ❤️ pour l&apos;esport togolais 🇹🇬</p>
        </div>
      </div>
    </footer>
  );
}
