"use client";

import { useState } from "react";
import Link from "next/link";
import TierBadge from "@/app/components/TierBadge";
import GameTag from "@/app/components/GameTag";

// ─── Données de démo ─────────────────────────────────────────

const ME = {
  pseudo: "ShadowX_TG",
  firstName: "Afi",
  lastName: "Koffi",
  email: "afi.koffi@gamepediatg.com",
  city: "Lomé",
  region: "Maritime",
  bio: "Joueur compétitif Valorant. Passionné d'esport depuis 2019. Toujours à la recherche de nouveaux défis.",
  isVerified: true,
  role: "PLAYER",
  joinedAt: "2024-01-15",
  games: [
    { name: "Valorant", rank: "Diamond 1", inGameName: "ShadowX#TG" },
    { name: "Free Fire", rank: "Heroic", inGameName: "ShadowXTG" },
  ],
  team: { name: "Team Lomé", slug: "team-lome", tag: "TLM" },
  stats: {
    totalPoints: 2850,
    tournamentsPlayed: 12,
    wins: 3,
    top3: 7,
    prizeMoney: 320000,
  },
  socialLinks: { twitter: "@ShadowX_TG", discord: "ShadowX#9871", youtube: "ShadowXTG" },
};

const MY_PALMARES = [
  { tournament: "Togo Valorant Open S2", placement: 1, tier: "A" as const, prizeWon: 150000, date: "2025-03-22" },
  { tournament: "Qualifier National Q4 2024", placement: 2, tier: "B" as const, prizeWon: 70000, date: "2024-12-10" },
  { tournament: "Community Cup Lomé 2024", placement: 1, tier: "C" as const, prizeWon: 50000, date: "2024-09-28" },
  { tournament: "FF Cup Kara", placement: 3, tier: "B" as const, prizeWon: 50000, date: "2024-06-15" },
];

const MY_ACHIEVEMENTS = [
  { name: "Premier Titre", description: "Gagner un tournoi", icon: "🏆", rarity: "Rare", unlockedAt: "2024-09-28" },
  { name: "Hat-trick", description: "Gagner 3 tournois", icon: "🎯", rarity: "Épique", unlockedAt: "2025-03-22" },
  { name: "Vétéran", description: "Participer à 10 tournois", icon: "⚔️", rarity: "Commun", unlockedAt: "2025-01-05" },
  { name: "Joueur Vérifié", description: "Compte vérifié", icon: "✅", rarity: "Commun", unlockedAt: "2024-02-01" },
  { name: "Podium d'Or", description: "3 victoires consécutives top 3", icon: "🥇", rarity: "Légendaire", unlockedAt: "2025-03-22" },
];

const TABS = ["Mon profil", "Palmarès", "Achievements", "Paramètres"];

const RARITY_COLORS: Record<string, string> = {
  Commun: "text-[var(--text-muted)]",
  Rare: "text-[var(--accent-blue)]",
  Épique: "text-[var(--tier-a)]",
  Légendaire: "text-[var(--accent-gold)]",
};

const placementIcon = (p: number) =>
  p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `#${p}`;

// ─── Sous-composants ──────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl p-4 text-center bg-[var(--bg-card)] border border-[var(--border)]">
      <div className={`text-xl font-black mb-0.5 ${color}`}>{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({
  label,
  defaultValue,
  type = "text",
  readOnly = false,
}: {
  label: string;
  defaultValue: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`w-full rounded-lg px-3.5 py-2.5 text-sm border border-[var(--border)] outline-none bg-[var(--bg-primary)] ${
          readOnly ? "text-[var(--text-muted)] cursor-not-allowed" : "text-[var(--text-primary)]"
        }`}
      />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1a35,#0d0d20)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(rgba(0,230,118,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.07) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <span className="absolute top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.25)] text-[var(--accent-green)]">
          Mon espace
        </span>
      </div>

      {/* Header profil */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Avatar + infos */}
          <div className="flex flex-wrap items-end gap-5 -mt-11 pb-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-black font-black text-3xl shrink-0 relative"
              style={{ background: "linear-gradient(135deg,var(--accent-green),var(--accent-blue))", border: "3px solid var(--bg-secondary)" }}
            >
              {ME.pseudo.slice(0, 2).toUpperCase()}
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--accent-green)] border-2 border-[var(--bg-secondary)]" />
            </div>

            <div className="flex-1 pt-12">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">{ME.pseudo}</h1>
                {ME.isVerified && <span className="text-[var(--accent-blue)]" title="Vérifié">✓</span>}
                <span>🇹🇬</span>
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-[rgba(0,230,118,0.1)] border border-[rgba(0,230,118,0.2)] text-[var(--accent-green)]">
                  {ME.role}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {ME.firstName} {ME.lastName} · {ME.city}, {ME.region} · Membre depuis{" "}
                {new Date(ME.joinedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ME.games.map((g) => <GameTag key={g.name} name={g.name} />)}
                {ME.team && (
                  <Link href={`/teams/${ME.team.slug}`}>
                    <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-[rgba(255,215,0,0.12)] border border-[rgba(255,215,0,0.25)] text-[var(--accent-gold)]">
                      [{ME.team.tag}] {ME.team.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            <Link
              href={`/players/${ME.pseudo}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-12"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              Profil public
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pb-5">
            <StatCard label="Points" value={ME.stats.totalPoints.toLocaleString("fr-FR")} color="text-[var(--accent-gold)]" />
            <StatCard label="Tournois" value={ME.stats.tournamentsPlayed} color="text-[var(--accent-blue)]" />
            <StatCard label="Victoires" value={ME.stats.wins} color="text-[var(--accent-green)]" />
            <StatCard label="Top 3" value={ME.stats.top3} color="text-[var(--tier-a)]" />
            <StatCard label="Prize money" value={`${(ME.stats.prizeMoney / 1000).toFixed(0)}K XOF`} color="text-[var(--accent-gold)]" />
          </div>

          {/* Onglets */}
          <div className="flex">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === i
                    ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Mon profil ── */}
        {activeTab === 0 && (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            <div>
              <SectionBlock title="Biographie">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{ME.bio}</p>
              </SectionBlock>
              <SectionBlock title="Profils in-game">
                <div className="space-y-2">
                  {ME.games.map((g) => (
                    <div key={g.name} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{g.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{g.inGameName}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(79,195,247,0.1)] border border-[rgba(79,195,247,0.25)] text-[var(--accent-blue)]">
                        {g.rank}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>

            <div>
              <SectionBlock title="Réseaux sociaux">
                <div className="space-y-2">
                  {Object.entries(ME.socialLinks).map(([key, val]) => (
                    <div key={key} className="flex gap-3 items-center">
                      <span className="text-xs text-[var(--text-muted)] w-16 capitalize">{key}</span>
                      <span className="text-xs text-[var(--accent-blue)]">{val}</span>
                    </div>
                  ))}
                </div>
              </SectionBlock>
              <SectionBlock title="Équipe actuelle">
                {ME.team ? (
                  <Link href={`/teams/${ME.team.slug}`}>
                    <div className="flex items-center gap-3 p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black bg-[rgba(255,215,0,0.15)] text-[var(--accent-gold)]">
                        {ME.team.tag}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{ME.team.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Membre actif</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Sans équipe</p>
                )}
              </SectionBlock>
              <SectionBlock title="Actions rapides">
                <div className="space-y-2">
                  <Link href="/profile/edit" className="block text-center py-2.5 rounded-lg text-sm font-semibold text-black bg-[var(--accent-green)] hover:opacity-90 transition-opacity">
                    Modifier mon profil
                  </Link>
                  <Link href="/tournaments" className="block text-center py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Voir les tournois
                  </Link>
                </div>
              </SectionBlock>
            </div>
          </div>
        )}

        {/* ── Palmarès ── */}
        {activeTab === 1 && (
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">
              Palmarès — {MY_PALMARES.length} résultats
            </h2>
            <div className="space-y-3">
              {MY_PALMARES.map((entry, i) => (
                <div key={i} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="text-2xl w-8">{placementIcon(entry.placement)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.tournament}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <TierBadge tier={entry.tier} small />
                  {entry.prizeWon > 0 && (
                    <span className="text-sm font-bold text-[var(--accent-gold)]">
                      +{entry.prizeWon.toLocaleString("fr-FR")} XOF
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        {activeTab === 2 && (
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">
              Achievements — {MY_ACHIEVEMENTS.length} débloqués
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MY_ACHIEVEMENTS.map((ach) => (
                <div key={ach.name} className="flex gap-3.5 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{ach.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-2">{ach.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[0.68rem] font-bold ${RARITY_COLORS[ach.rarity] ?? "text-[var(--text-muted)]"}`}>
                        {ach.rarity}
                      </span>
                      <span className="text-[0.65rem] text-[var(--text-muted)]">
                        {new Date(ach.unlockedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Paramètres ── */}
        {activeTab === 3 && (
          <div className="max-w-xl">
            {saved && (
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-lg text-sm text-[var(--accent-green)] bg-[rgba(0,230,118,0.08)] border border-[rgba(0,230,118,0.25)]">
                <span>✓</span> Modifications enregistrées.
              </div>
            )}

            <SectionBlock title="Informations personnelles">
              <FormField label="Pseudo" defaultValue={ME.pseudo} />
              <FormField label="Prénom" defaultValue={ME.firstName} />
              <FormField label="Nom" defaultValue={ME.lastName} />
              <FormField label="Ville" defaultValue={ME.city} />
              <FormField label="Région" defaultValue={ME.region} />
            </SectionBlock>

            <SectionBlock title="Compte">
              <FormField label="Email" defaultValue={ME.email} type="email" />
              <FormField label="Rôle" defaultValue={ME.role} readOnly />
            </SectionBlock>

            <SectionBlock title="Biographie">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Bio</label>
              <textarea
                defaultValue={ME.bio}
                rows={4}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm border border-[var(--border)] outline-none bg-[var(--bg-primary)] text-[var(--text-primary)] resize-y font-sans"
              />
            </SectionBlock>

            <SectionBlock title="Réseaux sociaux">
              <FormField label="Twitter / X" defaultValue={ME.socialLinks.twitter} />
              <FormField label="Discord" defaultValue={ME.socialLinks.discord} />
              <FormField label="YouTube" defaultValue={ME.socialLinks.youtube} />
            </SectionBlock>

            <SectionBlock title="Sécurité">
              <FormField label="Mot de passe actuel" defaultValue="" type="password" />
              <FormField label="Nouveau mot de passe" defaultValue="" type="password" />
              <FormField label="Confirmer le mot de passe" defaultValue="" type="password" />
            </SectionBlock>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-black bg-[var(--accent-green)] hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
              <button className="px-5 py-3 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Annuler
              </button>
            </div>

            <div className="mt-10 p-5 rounded-xl border border-[rgba(255,68,68,0.25)] bg-[rgba(255,68,68,0.04)]">
              <h4 className="text-sm font-bold text-[var(--accent-red)] mb-1">Zone dangereuse</h4>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
              </p>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold border border-[rgba(255,68,68,0.4)] text-[var(--accent-red)] hover:bg-[rgba(255,68,68,0.08)] transition-colors">
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
