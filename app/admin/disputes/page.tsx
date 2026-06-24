"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "../../wagers/wager-ui";

interface DisputeReport {
  reporterId: string;
  claimedWinnerId: string;
  note?: string | null;
  proofUrl?: string | null;
}
interface DisputeWager {
  id: string;
  title: string;
  stakeAmount: number;
  currency?: string;
  challengerId: string;
  opponentId?: string | null;
  game: { name: string; slug: string };
  challenger: { id: string; pseudo: string };
  opponent?: { id: string; pseudo: string } | null;
  reports: DisputeReport[];
}
interface Dispute {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  openedBy: { pseudo: string };
  wager: DisputeWager;
}

export default function AdminDisputesPage() {
  const { token, me, authHeader, loading: authLoading } = useAuth();
  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";

  const {
    data: disputes,
    loading,
    refetch,
  } = useApi<Dispute[]>(
    token && isStaff ? "/api/admin/disputes?status=OPEN" : null,
    [token, isStaff],
    authHeader,
  );

  if (authLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }

  if (!token || !isStaff) {
    return (
      <div className="min-h-[50vh] grid place-items-center flex-col gap-3 text-[var(--text-muted)]">
        <p>Accès réservé à l&apos;administration.</p>
        <Link href="/" className="text-[var(--accent-green)] no-underline hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] mx-auto px-6 py-8">
      <Link
        href="/admin"
        className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5"
      >
        ← Dashboard
      </Link>

      <h1 className="text-[2rem] font-black text-[var(--text-primary)] mb-2">
        Litiges des paris
      </h1>
      <p className="text-[0.95rem] text-[var(--text-secondary)] mb-8">
        Arbitrez les défis contestés. La décision désigne le vainqueur et
        débloque le versement.
      </p>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : !disputes || disputes.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          Aucun litige en attente. 🎉
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {disputes.map((d) => (
            <DisputeCard
              key={d.id}
              dispute={d}
              authHeader={authHeader}
              onResolved={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DisputeCard({
  dispute,
  authHeader,
  onResolved,
}: {
  dispute: Dispute;
  authHeader?: Record<string, string>;
  onResolved: () => void;
}) {
  const { wager } = dispute;
  const [resolvedWinnerId, setResolvedWinnerId] = useState("");
  const [resolution, setResolution] = useState("");
  const resolve = useMutation(
    `/api/admin/disputes/${dispute.id}/resolve`,
    "POST",
    authHeader,
    "Litige tranché.",
  );

  const nameOf = (pid: string) =>
    pid === wager.challengerId
      ? wager.challenger.pseudo
      : pid === wager.opponentId
        ? wager.opponent?.pseudo ?? "Adversaire"
        : "?";

  const parties = [wager.challenger, wager.opponent].filter(Boolean) as {
    id: string;
    pseudo: string;
  }[];

  const submit = async () => {
    if (!resolvedWinnerId) {
      toast.error("Désignez le vainqueur.");
      return;
    }
    if (!resolution.trim()) {
      toast.error("Motivez la décision.");
      return;
    }
    const r = await resolve.mutate({ resolvedWinnerId, resolution: resolution.trim() });
    if (r) onResolved();
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <Link
            href={`/wagers/${wager.id}`}
            className="text-[1.05rem] font-bold text-[var(--text-primary)] no-underline hover:text-[var(--accent-green)]"
          >
            {wager.title}
          </Link>
          <div className="text-[0.8rem] text-[var(--text-muted)] mt-0.5">
            {wager.game.name} · {nameOf(wager.challengerId)} vs{" "}
            {wager.opponentId ? nameOf(wager.opponentId) : "—"} ·{" "}
            {formatMoney(wager.stakeAmount, wager.currency)}
          </div>
        </div>
        <span className="text-[0.72rem] text-[var(--text-muted)]">
          Ouvert par {dispute.openedBy.pseudo}
        </span>
      </div>

      <div className="bg-[color-mix(in_srgb,var(--accent-red)_7%,transparent)] border border-[color-mix(in_srgb,var(--accent-red)_25%,transparent)] rounded-lg p-3 mb-4">
        <span className="text-[0.72rem] font-bold text-[var(--accent-red)] uppercase tracking-wide">
          Motif
        </span>
        <p className="text-[0.85rem] text-[var(--text-secondary)] mt-1">
          {dispute.reason}
        </p>
      </div>

      {/* Déclarations des joueurs */}
      {wager.reports.length > 0 && (
        <div className="mb-4">
          <span className="text-[0.72rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
            Déclarations
          </span>
          <div className="flex flex-col gap-1.5 mt-2">
            {wager.reports.map((r) => (
              <div
                key={r.reporterId}
                className="text-[0.82rem] text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2"
              >
                <strong className="text-[var(--text-primary)]">
                  {nameOf(r.reporterId)}
                </strong>{" "}
                déclare{" "}
                <strong className="text-[var(--accent-green)]">
                  {nameOf(r.claimedWinnerId)}
                </strong>{" "}
                vainqueur.
                {r.note && (
                  <span className="text-[var(--text-muted)]"> — « {r.note} »</span>
                )}
                {r.proofUrl && (
                  <>
                    {" "}
                    <a
                      href={r.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent-blue)] no-underline hover:underline"
                    >
                      preuve
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Décision */}
      <div className="pt-4 border-t border-[var(--border)]">
        <span className="text-[0.72rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
          Désigner le vainqueur
        </span>
        <div className="flex gap-2 my-2 flex-wrap">
          {parties.map((p) => {
            const selected = resolvedWinnerId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setResolvedWinnerId(p.id)}
                className={`px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  selected
                    ? "bg-[var(--accent-green)] text-black font-semibold border-[var(--accent-green)]"
                    : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border)]"
                }`}
              >
                {p.pseudo}
              </button>
            );
          })}
        </div>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={2}
          placeholder="Motivation de la décision (visible par les joueurs)…"
          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.88rem] outline-none box-border resize-y mb-3"
        />
        <button
          onClick={submit}
          disabled={resolve.loading}
          className="px-5 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {resolve.loading ? "…" : "Trancher le litige"}
        </button>
      </div>
    </div>
  );
}
