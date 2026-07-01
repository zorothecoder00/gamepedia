"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TierBadge from "@/app/components/TierBadge";
import GameTag from "@/app/components/GameTag";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethodType } from "@/app/wagers/wager-ui";

// ─── Types ────────────────────────────────────────────────────

interface GameProfile { game: { name: string; slug: string }; inGameName?: string; rank?: string }
interface TeamMember { team: { id: string; name: string; tag: string; slug: string } }
interface Achievement {
  achievement: { name: string; description: string; icon?: string; rarity?: string };
  unlockedAt: string;
}

interface Player {
  id: string; pseudo: string; firstName?: string; lastName?: string;
  city?: string; region?: string; bio?: string; isVerified?: boolean;
  totalPoints?: number; wins?: number; top3?: number;
  tournamentsPlayed?: number; prizeMoney?: number;
  socialLinks?: Record<string, string>;
  gameProfiles?: GameProfile[];
  teamMembers?: TeamMember[];
  achievements?: Achievement[];
}

interface Me {
  id: string; email: string; username: string; role: string; createdAt: string;
  player?: Player;
}

interface PalmaresEntry {
  id: string; finalRank?: number; prizeMoney?: number;
  tournament: { name: string; slug: string; tier: string; startDate: string };
}

interface PayoutMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  details: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
}

const TABS = ["Mon profil", "Palmarès", "Achievements", "Moyens de réception", "Paramètres"];

// Champs de coordonnées attendus par type de moyen de réception
const METHOD_FIELDS: Record<PaymentMethodType, { key: string; label: string; placeholder?: string }[]> = {
  MOBILE_MONEY: [
    { key: "operator",   label: "Opérateur",        placeholder: "Moov Money / T-Money" },
    { key: "phone",      label: "Numéro",           placeholder: "+228 90 00 00 00" },
    { key: "holderName", label: "Nom du titulaire" },
  ],
  WESTERN_UNION: [
    { key: "receiverName", label: "Nom du bénéficiaire" },
    { key: "city",         label: "Ville" },
    { key: "country",      label: "Pays", placeholder: "Togo" },
  ],
  BANK_TRANSFER: [
    { key: "bankName",    label: "Banque" },
    { key: "accountName", label: "Titulaire du compte" },
    { key: "iban",        label: "IBAN / N° de compte" },
  ],
  BANK_CARD: [
    { key: "cardHolder", label: "Titulaire de la carte" },
    { key: "cardNumber", label: "Numéro de carte" },
  ],
  OTHER: [
    { key: "info", label: "Coordonnées", placeholder: "Décrivez comment vous payer" },
  ],
};

const emptyPayoutForm = {
  type: "MOBILE_MONEY" as PaymentMethodType,
  label: "",
  details: {} as Record<string, string>,
  isDefault: false,
};

const RARITY_COLORS: Record<string, string> = {
  Commun:     "text-[var(--text-muted)]",
  Rare:       "text-[var(--accent-green)]",
  Épique:     "text-[var(--tier-a)]",
  Légendaire: "text-[var(--accent-gold)]",
};

const placementIcon = (p: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `#${p}`;

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
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">{title}</h3>
      {children}
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", readOnly = false }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; readOnly?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
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
  const router   = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [token]                   = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("gp_token") : null
  );
  const [settings, setSettings]   = useState({
    username: "", email: "", bio: "",
    twitter: "", discord: "", youtube: "",
  });
  const settingsInitialized = useRef(false);

  const buildSettings = (meData: Me, playerData: Player) => ({
    username: meData.username ?? "",
    email:    meData.email ?? "",
    bio:      playerData.bio ?? "",
    twitter:  playerData.socialLinks?.twitter ?? "",
    discord:  playerData.socialLinks?.discord ?? "",
    youtube:  playerData.socialLinks?.youtube ?? "",
  });

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const { data: me, loading: meLoading } = useApi<Me>(
    token ? "/api/auth/me" : null, [token], authHeader,
  );

  const player = me?.player;
  const pseudo = player?.pseudo ?? "";

  const { data: palmares, loading: palmaresLoading } = useApi<PalmaresEntry[]>(
    activeTab === 1 && pseudo ? `/api/players/${pseudo}/tournaments` : null,
    [activeTab, pseudo], authHeader,
  );

  const { mutate: saveAccount, loading: savingAccount } = useMutation<Me>(
    "/api/auth/me", "PATCH", authHeader, "Compte mis à jour !",
  );
  const { mutate: savePlayer, loading: savingPlayer } = useMutation(
    pseudo ? `/api/players/${pseudo}` : "/api/players/__none",
    "PATCH", authHeader,
  );

  const saving = savingAccount || savingPlayer;

  // ── Moyens de réception ──
  const { data: payoutMethods, loading: payoutLoading, refetch: refetchPayouts } = useApi<PayoutMethod[]>(
    activeTab === 3 && pseudo ? `/api/players/${pseudo}/payout-methods` : null,
    [activeTab, pseudo], authHeader,
  );
  const { mutate: addPayout, loading: addingPayout } = useMutation<PayoutMethod>(
    pseudo ? `/api/players/${pseudo}/payout-methods` : "/api/players/__none",
    "POST", authHeader,
  );
  const [payoutForm, setPayoutForm] = useState(emptyPayoutForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddPayout = async () => {
    if (!payoutForm.label.trim()) { toast.error("Le libellé est requis."); return; }
    const details: Record<string, string> = {};
    for (const f of METHOD_FIELDS[payoutForm.type]) {
      const v = payoutForm.details[f.key]?.trim();
      if (v) details[f.key] = v;
    }
    if (Object.keys(details).length === 0) { toast.error("Renseignez au moins une coordonnée."); return; }
    const r = await addPayout({
      type: payoutForm.type,
      label: payoutForm.label.trim(),
      details,
      isDefault: payoutForm.isDefault,
    });
    if (r) {
      toast.success("Moyen de réception ajouté !");
      setPayoutForm(emptyPayoutForm);
      refetchPayouts();
    }
  };

  const handleDeletePayout = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/payout-methods/${id}`, { method: "DELETE", headers: authHeader });
      if (res.ok) {
        toast.success("Moyen de réception supprimé.");
        refetchPayouts();
      } else {
        toast.error("La suppression a échoué.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (me && player && !settingsInitialized.current) {
      settingsInitialized.current = true;
      startTransition(() => setSettings(buildSettings(me, player)));
    }
  }, [me, player]);

  const handleSave = async () => {
    const r1 = await saveAccount({ username: settings.username, email: settings.email });
    if (!r1) return;
    if (pseudo) {
      const r2 = await savePlayer({
        bio: settings.bio,
        socialLinks: { twitter: settings.twitter, discord: settings.discord, youtube: settings.youtube },
      });
      if (!r2) return;
    }
    toast.success("Modifications enregistrées !");
  };

  if (!token || meLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--text-muted)]">Session expirée.</p>
        <Link href="/auth/login" className="text-[var(--accent-green)] no-underline hover:underline">Se connecter</Link>
      </div>
    );
  }

  const team         = player?.teamMembers?.[0]?.team ?? null;
  const games        = player?.gameProfiles ?? [];
  const achievements = player?.achievements ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Banner — tons chauds drapeau togolais */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#141208] to-[#0d0d09]">
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(0,196,74,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,196,74,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
        {/* Halos drapeau */}
        <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-[0.15] pointer-events-none bg-[#00c44a]" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full blur-3xl opacity-[0.12] pointer-events-none bg-[#e63030]" />
        <span className="absolute top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(0,196,74,0.1)] border border-[rgba(0,196,74,0.25)] text-[var(--accent-green)]">
          Mon espace
        </span>
      </div>

      {/* Header profil */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end gap-5 -mt-11 pb-5">
            {/* Avatar — gradient drapeau vert → or */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl shrink-0 relative border-[3px] border-[var(--bg-secondary)]"
              style={{
                background: "linear-gradient(135deg, var(--accent-green), var(--accent-gold))",
                color: "#09090f",
              }}
            >
              {(pseudo || me.username).slice(0, 2).toUpperCase()}
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--accent-green)] border-2 border-[var(--bg-secondary)]" />
            </div>

            <div className="flex-1 pt-12">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-[var(--text-primary)]">{pseudo || me.username}</h1>
                {player?.isVerified && (
                  <span className="text-[var(--accent-green)]" title="Vérifié">✓</span>
                )}
                <span>🇹🇬</span>
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-[rgba(0,196,74,0.1)] border border-[rgba(0,196,74,0.2)] text-[var(--accent-green)]">
                  {me.role}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {player?.firstName && player?.lastName ? `${player.firstName} ${player.lastName} · ` : ""}
                {player?.city ? `${player.city}${player.region ? `, ${player.region}` : ""} · ` : ""}
                Membre depuis {new Date(me.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {games.map((g) => <GameTag key={g.game.slug} name={g.game.name} />)}
                {team && (
                  <Link href={`/teams/${team.slug}`}>
                    <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-[rgba(255,204,0,0.12)] border border-[rgba(255,204,0,0.25)] text-[var(--accent-gold)]">
                      [{team.tag}] {team.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {pseudo && (
              <Link
                href={`/players/${pseudo}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-12"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                Profil public
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pb-5">
            <StatCard label="Points"      value={(player?.totalPoints ?? 0).toLocaleString("fr-FR")} color="text-[var(--accent-gold)]"  />
            <StatCard label="Tournois"    value={player?.tournamentsPlayed ?? 0}                     color="text-[var(--accent-green)]" />
            <StatCard label="Victoires"   value={player?.wins ?? 0}                                  color="text-[var(--accent-green)]" />
            <StatCard label="Top 3"       value={player?.top3 ?? 0}                                  color="text-[var(--tier-a)]"       />
            <StatCard label="Prize money" value={player?.prizeMoney ? `${((player.prizeMoney) / 1000).toFixed(0)}K XOF` : "0 XOF"} color="text-[var(--accent-gold)]" />
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
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {player?.bio ?? <span className="italic text-[var(--text-muted)]">Aucune biographie.</span>}
                </p>
              </SectionBlock>
              {games.length > 0 && (
                <SectionBlock title="Profils in-game">
                  <div className="space-y-2">
                    {games.map((g) => (
                      <div key={g.game.slug} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{g.game.name}</p>
                          {g.inGameName && <p className="text-xs text-[var(--text-muted)]">{g.inGameName}</p>}
                        </div>
                        {g.rank && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(0,196,74,0.1)] border border-[rgba(0,196,74,0.25)] text-[var(--accent-green)]">
                            {g.rank}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}
            </div>

            <div>
              {player?.socialLinks && Object.keys(player.socialLinks).length > 0 && (
                <SectionBlock title="Réseaux sociaux">
                  <div className="space-y-2">
                    {Object.entries(player.socialLinks).filter(([, v]) => v).map(([key, val]) => (
                      <div key={key} className="flex gap-3 items-center">
                        <span className="text-xs text-[var(--text-muted)] w-16 capitalize">{key}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{val}</span>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}
              {team && (
                <SectionBlock title="Équipe actuelle">
                  <Link href={`/teams/${team.slug}`}>
                    <div className="flex items-center gap-3 p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black bg-[rgba(255,204,0,0.15)] text-[var(--accent-gold)]">
                        {team.tag}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{team.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Membre actif</p>
                      </div>
                    </div>
                  </Link>
                </SectionBlock>
              )}
              <SectionBlock title="Actions rapides">
                <div className="space-y-2">
                  <Link
                    href="/profile/edit"
                    className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity bg-[var(--accent-green)] text-[#09090f] no-underline"
                  >
                    Modifier mon profil
                  </Link>
                  <button
                    onClick={() => setActiveTab(3)}
                    className="block w-full text-center py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Moyens de réception
                  </button>
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
            {palmaresLoading ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
            ) : !palmares || palmares.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Aucun résultat de tournoi.</div>
            ) : (
              <>
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">
                  Palmarès — {palmares.length} résultats
                </h2>
                <div className="space-y-3">
                  {palmares.map((entry) => (
                    <div key={entry.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                      <span className="text-2xl w-8">{placementIcon(entry.finalRank ?? 99)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.tournament.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(entry.tournament.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <TierBadge tier={entry.tournament.tier as "S" | "A" | "B" | "C"} small />
                      {entry.prizeMoney && entry.prizeMoney > 0 && (
                        <span className="text-sm font-bold text-[var(--accent-gold)]">+{entry.prizeMoney.toLocaleString("fr-FR")} XOF</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Achievements ── */}
        {activeTab === 2 && (
          <div>
            {achievements.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Aucun achievement débloqué.</div>
            ) : (
              <>
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-5">
                  Achievements — {achievements.length} débloqués
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((a) => (
                    <div key={a.achievement.name} className="flex gap-3.5 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                      <span className="text-3xl">{a.achievement.icon ?? "🏅"}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{a.achievement.name}</p>
                        <p className="text-xs text-[var(--text-muted)] mb-2">{a.achievement.description}</p>
                        <div className="flex justify-between items-center">
                          <span className={`text-[0.68rem] font-bold ${RARITY_COLORS[a.achievement.rarity ?? ""] ?? "text-[var(--text-muted)]"}`}>
                            {a.achievement.rarity ?? "—"}
                          </span>
                          <span className="text-[0.65rem] text-[var(--text-muted)]">
                            {new Date(a.unlockedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Moyens de réception ── */}
        {activeTab === 3 && (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* Liste des moyens enregistrés */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Mes coordonnées de réception</h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
                Ces coordonnées permettent à l&apos;administration de vous verser vos gains de défis.
                Elles ne sont visibles que par l&apos;équipe GamePedia.
              </p>

              {payoutLoading ? (
                <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
              ) : !payoutMethods || payoutMethods.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)]">
                  Aucun moyen de réception enregistré.
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutMethods.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</p>
                            {m.isDefault && (
                              <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded bg-[rgba(0,196,74,0.1)] border border-[rgba(0,196,74,0.25)] text-[var(--accent-green)]">
                                Par défaut
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{PAYMENT_METHOD_LABELS[m.type]}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePayout(m.id)}
                          disabled={deletingId === m.id}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[rgba(230,48,48,0.35)] text-[var(--accent-red)] hover:bg-[rgba(230,48,48,0.08)] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === m.id ? "..." : "Supprimer"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 border-t border-[var(--border)]">
                        {Object.entries(m.details).map(([k, v]) => {
                          const field = METHOD_FIELDS[m.type]?.find((f) => f.key === k);
                          return (
                            <div key={k} className="text-xs">
                              <span className="text-[var(--text-muted)]">{field?.label ?? k} : </span>
                              <span className="text-[var(--text-secondary)]">{v}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire d'ajout */}
            <div>
              <SectionBlock title="Ajouter un moyen de réception">
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
                  <select
                    value={payoutForm.type}
                    onChange={(e) => setPayoutForm((f) => ({ ...f, type: e.target.value as PaymentMethodType, details: {} }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm border border-[var(--border)] outline-none bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  >
                    {PAYMENT_METHODS.map((t) => (
                      <option key={t} value={t}>{PAYMENT_METHOD_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                <FormInput
                  label="Libellé"
                  value={payoutForm.label}
                  onChange={(v) => setPayoutForm((f) => ({ ...f, label: v }))}
                />

                {METHOD_FIELDS[payoutForm.type].map((field) => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={payoutForm.details[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPayoutForm((f) => ({ ...f, details: { ...f.details, [field.key]: val } }));
                      }}
                      className="w-full rounded-lg px-3.5 py-2.5 text-sm border border-[var(--border)] outline-none bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                ))}

                <label className="flex items-center gap-2 mb-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payoutForm.isDefault}
                    onChange={(e) => setPayoutForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="accent-[var(--accent-green)]"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">Définir comme moyen par défaut</span>
                </label>

                <button
                  onClick={handleAddPayout}
                  disabled={addingPayout}
                  className="w-full py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--accent-green)] text-[#09090f]"
                >
                  {addingPayout ? "Ajout..." : "Ajouter"}
                </button>
              </SectionBlock>
            </div>
          </div>
        )}

        {/* ── Paramètres ── */}
        {activeTab === 4 && (
          <div className="max-w-xl">
            <SectionBlock title="Informations personnelles">
              <FormInput label="Pseudo"      value={settings.username} onChange={(v) => setSettings((s) => ({ ...s, username: v }))} />
              <FormInput label="Biographie"  value={settings.bio}      onChange={(v) => setSettings((s) => ({ ...s, bio: v }))} />
            </SectionBlock>

            <SectionBlock title="Compte">
              <FormInput label="Email" value={settings.email} onChange={(v) => setSettings((s) => ({ ...s, email: v }))} type="email" />
              <FormInput label="Rôle"  value={me.role} readOnly />
            </SectionBlock>

            <SectionBlock title="Réseaux sociaux">
              <FormInput label="Twitter / X" value={settings.twitter}  onChange={(v) => setSettings((s) => ({ ...s, twitter: v }))} />
              <FormInput label="Discord"     value={settings.discord}  onChange={(v) => setSettings((s) => ({ ...s, discord: v }))} />
              <FormInput label="YouTube"     value={settings.youtube}  onChange={(v) => setSettings((s) => ({ ...s, youtube: v }))} />
            </SectionBlock>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--accent-green)] text-[#09090f]"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                onClick={() => { if (me && player) setSettings(buildSettings(me, player)); }}
                className="px-5 py-3 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Annuler
              </button>
            </div>

            <div className="mt-10 p-5 rounded-xl border border-[rgba(230,48,48,0.25)] bg-[rgba(230,48,48,0.04)]">
              <h4 className="text-sm font-bold text-[var(--accent-red)] mb-1">Zone dangereuse</h4>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
              </p>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold border border-[rgba(230,48,48,0.4)] text-[var(--accent-red)] hover:bg-[rgba(230,48,48,0.08)] transition-colors cursor-pointer">
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
