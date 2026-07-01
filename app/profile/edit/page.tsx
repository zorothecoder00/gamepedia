"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";

interface GameProfile {
  game: { name: string; slug: string };
  inGameName?: string | null;
  rank?: string | null;
}
interface Player {
  id: string;
  pseudo: string;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  avatar?: string | null;
  socialLinks?: Record<string, string> | null;
  gameProfiles?: GameProfile[];
}
interface Me {
  id: string;
  email: string;
  username: string;
  role: string;
  player?: Player | null;
}

const SOCIALS: { key: string; label: string; placeholder: string }[] = [
  { key: "twitter", label: "Twitter / X", placeholder: "@pseudo" },
  { key: "discord", label: "Discord", placeholder: "pseudo#0000" },
  { key: "youtube", label: "YouTube", placeholder: "lien de la chaîne" },
  { key: "twitch", label: "Twitch", placeholder: "twitch.tv/pseudo" },
  { key: "tiktok", label: "TikTok", placeholder: "@pseudo" },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { token, authHeader, loading: authLoading } = useAuth();

  const { data: me, loading } = useApi<Me>(
    token ? "/api/auth/me" : null,
    [token],
    authHeader,
  );

  // Pas connecté → redirection vers la connexion
  useEffect(() => {
    if (!authLoading && !token) router.push("/auth/login");
  }, [authLoading, token, router]);

  if (authLoading || !token || loading) {
    return <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">Chargement...</div>;
  }
  if (!me) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3">
          <p>Session expirée.</p>
          <Link href="/auth/login" className="text-[var(--accent-green)] no-underline hover:underline">Se connecter</Link>
        </div>
      </div>
    );
  }

  return <EditForm me={me} authHeader={authHeader} onDone={() => router.push("/profile")} />;
}

function EditForm({
  me,
  authHeader,
  onDone,
}: {
  me: Me;
  authHeader?: Record<string, string>;
  onDone: () => void;
}) {
  const player = me.player ?? null;
  const [username, setUsername] = useState(me.username);
  const [email, setEmail] = useState(me.email);
  const [pseudo, setPseudo] = useState(player?.pseudo ?? "");
  const [firstName, setFirstName] = useState(player?.firstName ?? "");
  const [lastName, setLastName] = useState(player?.lastName ?? "");
  const [city, setCity] = useState(player?.city ?? "");
  const [region, setRegion] = useState(player?.region ?? "");
  const [bio, setBio] = useState(player?.bio ?? "");
  const [avatar, setAvatar] = useState(player?.avatar ?? "");
  const [social, setSocial] = useState<Record<string, string>>(() => {
    const s = player?.socialLinks ?? {};
    return Object.fromEntries(SOCIALS.map((x) => [x.key, s[x.key] ?? ""]));
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveAccount = useMutation<Me>("/api/auth/me", "PATCH", authHeader);
  const savePlayer = useMutation(
    player ? `/api/players/${player.pseudo}` : "/api/players/__none",
    "PATCH",
    authHeader,
  );
  const saving = saveAccount.loading || savePlayer.loading;

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Le fichier doit être une image.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Taille maximale : 2 Mo.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", headers: authHeader, body: fd });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Échec de l'upload.");
        return;
      }
      setAvatar(json.data.url);
      toast.success("Avatar téléversé. N'oubliez pas d'enregistrer.");
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!username.trim()) return toast.error("Le nom d'utilisateur est requis.");
    if (!email.trim()) return toast.error("L'email est requis.");
    if (player && !pseudo.trim()) return toast.error("Le pseudo est requis.");

    const r1 = await saveAccount.mutate({ username: username.trim(), email: email.trim() });
    if (!r1) return;

    if (player) {
      const cleanedSocial = Object.fromEntries(
        Object.entries(social).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v),
      );
      const r2 = await savePlayer.mutate({
        pseudo: pseudo.trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        city: city.trim() || null,
        region: region.trim() || null,
        bio: bio.trim() || null,
        avatar: avatar.trim() || null,
        socialLinks: cleanedSocial,
      });
      if (!r2) return;
    }
    toast.success("Profil enregistré.");
    onDone();
  };

  const games = player?.gameProfiles ?? [];

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <Link href="/profile" className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5">
        ← Mon profil
      </Link>
      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">Modifier mon profil</h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-8">
        Mettez à jour votre avatar, votre identité et vos réseaux.
      </p>

      {/* Avatar */}
      <Section title="Avatar">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shrink-0 overflow-hidden border-2 border-[var(--border)]"
            style={{
              background: avatar
                ? `url(${avatar}) center/cover`
                : "linear-gradient(135deg, var(--accent-green), var(--accent-gold))",
              color: "#09090f",
            }}
          >
            {!avatar && (pseudo || username).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3.5 py-1.5 rounded-lg text-[0.8rem] font-semibold bg-transparent border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
            >
              {uploading ? "Téléversement…" : "Changer l'avatar"}
            </button>
            {avatar && (
              <button
                onClick={() => setAvatar("")}
                className="text-[0.75rem] text-[var(--text-muted)] bg-transparent border-none cursor-pointer text-left hover:text-[var(--accent-red)]"
              >
                Retirer
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Identité (joueur) */}
      {player ? (
        <>
          <Section title="Identité">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Pseudo" value={pseudo} onChange={setPseudo} />
              <div />
              <Field label="Prénom" value={firstName} onChange={setFirstName} />
              <Field label="Nom" value={lastName} onChange={setLastName} />
              <Field label="Ville" value={city} onChange={setCity} placeholder="Lomé" />
              <Field label="Région" value={region} onChange={setRegion} placeholder="Maritime" />
            </div>
          </Section>

          <Section title="Biographie">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Parlez de vous, votre parcours esport…"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.88rem] outline-none box-border resize-y"
            />
          </Section>

          <Section title="Réseaux sociaux">
            <div className="grid sm:grid-cols-2 gap-4">
              {SOCIALS.map((s) => (
                <Field
                  key={s.key}
                  label={s.label}
                  value={social[s.key] ?? ""}
                  onChange={(v) => setSocial((prev) => ({ ...prev, [s.key]: v }))}
                  placeholder={s.placeholder}
                />
              ))}
            </div>
          </Section>

          {games.length > 0 && (
            <Section title="Jeux">
              <p className="text-[0.76rem] text-[var(--text-muted)] mb-3">
                Vos profils in-game (gérés depuis chaque jeu).
              </p>
              <div className="flex flex-col gap-2">
                {games.map((g) => (
                  <div
                    key={g.game.slug}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                  >
                    <div>
                      <p className="text-[0.85rem] font-semibold text-[var(--text-primary)]">{g.game.name}</p>
                      {g.inGameName && <p className="text-[0.72rem] text-[var(--text-muted)]">{g.inGameName}</p>}
                    </div>
                    {g.rank && (
                      <span className="text-[0.72rem] font-semibold px-2 py-0.5 rounded bg-[rgba(0,230,118,0.1)] text-[var(--accent-green)] border border-[rgba(0,230,118,0.25)]">
                        {g.rank}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      ) : (
        <div className="mb-7 p-4 rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border)] text-[0.85rem] text-[var(--text-muted)]">
          Aucun profil joueur associé à ce compte. Seules les informations de
          compte ci-dessous sont modifiables.
        </div>
      )}

      {/* Compte */}
      <Section title="Compte">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom d'utilisateur" value={username} onChange={setUsername} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
        </div>
        <p className="text-[0.72rem] text-[var(--text-muted)] mt-2">Rôle : {me.role} (non modifiable)</p>
      </Section>

      <div className="flex gap-3 mt-4">
        <button
          onClick={submit}
          disabled={saving || uploading}
          className="px-6 py-2.5 rounded-lg border-none font-bold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link
          href="/profile"
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
        >
          Annuler
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2 text-[0.88rem] outline-none box-border placeholder:text-[var(--text-muted)]"
      />
    </label>
  );
}
