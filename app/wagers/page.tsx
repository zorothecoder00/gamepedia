"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import WagerCard, { WagerCardData } from "../components/WagerCard";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney, payoutPreview } from "./wager-ui";

interface ApiWager extends WagerCardData {
  gameId: string;
}

const TABS = [
  { key: "lobby", label: "Lobby" },
  { key: "mine", label: "Mes défis" },
];

export default function WagersPage() {
  const { token, player, authHeader } = useAuth();
  const [tab, setTab] = useState("lobby");
  const [gameFilter, setGameFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);

  const mine = tab === "mine";

  const params = new URLSearchParams();
  if (mine) params.set("mine", "true");
  if (gameFilter && !mine) params.set("game", gameFilter);
  params.set("page", String(page));

  const {
    data: wagers,
    meta,
    loading,
    refetch,
  } = useApi<ApiWager[]>(
    mine && !token ? null : `/api/wagers?${params.toString()}`,
    [tab, gameFilter, page, token],
    mine ? authHeader : undefined,
  );

  const { data: games } = useApi<{ name: string; slug: string }[]>("/api/games");

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">
            Paris entre joueurs
          </h1>
          <p className="text-[0.95rem] text-[var(--text-secondary)] max-w-xl">
            Défie un joueur du même jeu, misez chacun votre part, et le
            vainqueur empoche la cagnotte. Dépôts et versements sécurisés par
            l&apos;administration.
          </p>
        </div>
        {token && player && (
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="px-4 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 transition-opacity"
          >
            {showCreate ? "Fermer" : "+ Créer un défi"}
          </button>
        )}
      </div>

      {showCreate && token && player && (
        <CreateWagerForm
          games={games ?? []}
          authHeader={authHeader}
          onCreated={() => {
            setShowCreate(false);
            setTab("mine");
            setPage(1);
            refetch();
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${
              tab === t.key
                ? "bg-[var(--accent-green)] text-black font-semibold"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
            }`}
          >
            {t.label}
          </button>
        ))}

        {!mine && (
          <select
            value={gameFilter}
            onChange={(e) => {
              setGameFilter(e.target.value);
              setPage(1);
            }}
            className="ml-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] px-3 py-1.5 text-[0.82rem] outline-none"
          >
            <option value="">Tous les jeux</option>
            {(games ?? []).map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {mine && !token ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="mb-3">Connectez-vous pour voir vos défis.</p>
          <Link
            href="/auth/login"
            className="text-[var(--accent-green)] no-underline hover:underline"
          >
            Se connecter
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          Chargement...
        </div>
      ) : !wagers || wagers.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          {mine ? "Vous n'avez aucun défi." : "Aucun défi ouvert pour le moment."}
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {wagers.map((w) => (
            <WagerCard key={w.id} wager={w} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg border border-[var(--border)] text-sm cursor-pointer ${
                p === page
                  ? "bg-[var(--accent-green)] text-black font-bold"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Formulaire de création ───────────────────────────────────

function CreateWagerForm({
  games,
  authHeader,
  onCreated,
}: {
  games: { name: string; slug: string }[];
  authHeader?: Record<string, string>;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    gameId: "",
    stakeAmount: "",
    terms: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    opponentPseudo: "",
  });

  // Le filtre lobby utilise le slug ; pour créer il faut l'id du jeu.
  const { data: gamesFull } = useApi<{ id: string; name: string; slug: string }[]>(
    "/api/games?limit=100",
  );
  const gameList = gamesFull ?? games.map((g) => ({ id: "", ...g }));

  const { mutate, loading } = useMutation(
    "/api/wagers",
    "POST",
    authHeader,
  );

  const submit = async () => {
    if (!form.title.trim() || !form.gameId || !form.stakeAmount) {
      toast.error("Titre, jeu et mise sont requis.");
      return;
    }
    const stake = Number(form.stakeAmount);
    if (!Number.isFinite(stake) || stake <= 0) {
      toast.error("Mise invalide.");
      return;
    }

    // Défi direct : on résout le pseudo de l'adversaire en id joueur.
    let opponentId: string | undefined;
    if (form.opponentPseudo.trim()) {
      try {
        const res = await fetch(
          `/api/players/${encodeURIComponent(form.opponentPseudo.trim())}`,
        );
        const json = await res.json();
        opponentId = json?.data?.id;
        if (!opponentId) {
          toast.error("Adversaire introuvable.");
          return;
        }
      } catch {
        toast.error("Impossible de vérifier l'adversaire.");
        return;
      }
    }

    const result = await mutate({
      title: form.title.trim(),
      gameId: form.gameId,
      stakeAmount: stake,
      terms: form.terms.trim() || undefined,
      visibility: opponentId ? "PRIVATE" : form.visibility,
      opponentId,
    });
    if (result) {
      toast.success("Défi créé !");
      onCreated();
    }
  };

  const stakeNum = Number(form.stakeAmount) || 0;
  const preview = payoutPreview(stakeNum, 0);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-7">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
        Nouveau défi
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titre du défi">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Défi FIFA BO3"
            className={inputCls}
          />
        </Field>

        <Field label="Jeu">
          <select
            value={form.gameId}
            onChange={(e) => setForm({ ...form, gameId: e.target.value })}
            className={inputCls}
          >
            <option value="">Choisir un jeu…</option>
            {gameList.map((g) => (
              <option key={g.slug} value={g.id} disabled={!g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mise par joueur (XOF)">
          <input
            type="number"
            min={0}
            value={form.stakeAmount}
            onChange={(e) => setForm({ ...form, stakeAmount: e.target.value })}
            placeholder="1000"
            className={inputCls}
          />
        </Field>

        <Field label="Adversaire (pseudo, optionnel)">
          <input
            value={form.opponentPseudo}
            onChange={(e) => setForm({ ...form, opponentPseudo: e.target.value })}
            placeholder="Laisser vide = défi ouvert"
            className={inputCls}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Conditions / règles (optionnel)">
            <textarea
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              placeholder="Plateforme, format, règles particulières…"
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </Field>
        </div>
      </div>

      {stakeNum > 0 && (
        <p className="text-[0.8rem] text-[var(--text-muted)] mt-3">
          Cagnotte totale :{" "}
          <span className="text-[var(--accent-gold)] font-semibold">
            {formatMoney(preview.pot)}
          </span>{" "}
          — le vainqueur reçoit{" "}
          <span className="text-[var(--accent-green)] font-semibold">
            {formatMoney(preview.payout)}
          </span>
          .
        </p>
      )}

      <div className="flex gap-2 mt-5">
        <button
          onClick={submit}
          disabled={loading}
          className="px-5 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Création…" : "Lancer le défi"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.9rem] outline-none box-border";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
