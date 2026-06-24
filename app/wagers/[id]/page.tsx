"use client";
import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useMutation } from "@/hooks/useMutation";
import { useAuth } from "@/hooks/useAuth";
import { WagerStatusBadge } from "@/app/components/WagerCard";
import GameTag from "@/app/components/GameTag";
import {
  WagerStatus,
  PaymentMethodType,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  formatMoney,
  payoutPreview,
} from "../wager-ui";

// ─── Types ────────────────────────────────────────────────────

interface Party {
  id: string;
  pseudo: string;
  avatar?: string | null;
  trustScore?: number;
}
interface Deposit {
  id: string;
  playerId: string;
  amount: number;
  methodType: PaymentMethodType;
  status: "PENDING" | "CONFIRMED" | "REFUNDED";
  reference?: string | null;
  proofUrl?: string | null;
}
interface Report {
  id: string;
  reporterId: string;
  claimedWinnerId: string;
  note?: string | null;
}
interface Payout {
  amount: number;
  commission: number;
  methodType: PaymentMethodType;
  paidByName?: string | null;
}
interface Dispute {
  reason: string;
  status: string;
  resolution?: string | null;
}
interface WagerDetail {
  id: string;
  title: string;
  terms?: string | null;
  status: WagerStatus;
  stakeAmount: number;
  currency?: string;
  commissionRate: number;
  visibility: string;
  challengerId: string;
  opponentId?: string | null;
  winnerId?: string | null;
  challengerAgreed: boolean;
  opponentAgreed: boolean;
  game: { name: string; slug: string };
  challenger: Party;
  opponent?: Party | null;
  winner?: Party | null;
  deposits: Deposit[];
  reports: Report[];
  dispute?: Dispute | null;
  payout?: Payout | null;
}

interface PaymentAccount {
  id: string;
  type: PaymentMethodType;
  label: string;
  details: Record<string, unknown>;
  instructions?: string | null;
}

// ─── Page ─────────────────────────────────────────────────────

export default function WagerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token, me, player, authHeader } = useAuth();

  const {
    data: wager,
    loading,
    refetch,
  } = useApi<WagerDetail>(`/api/wagers/${id}`, [id, token], authHeader);

  const isStaff = me?.role === "ADMIN" || me?.role === "MODERATOR";
  const viewerId = player?.id;
  const isChallenger = !!viewerId && wager?.challengerId === viewerId;
  const isOpponent = !!viewerId && wager?.opponentId === viewerId;
  const isParticipant = isChallenger || isOpponent;

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-[var(--text-muted)]">
        Chargement...
      </div>
    );
  }
  if (!wager) {
    return (
      <div className="min-h-[50vh] grid place-items-center flex-col gap-3 text-[var(--text-muted)]">
        <p>Défi introuvable.</p>
        <Link href="/wagers" className="text-[var(--accent-green)] no-underline hover:underline">
          Retour au lobby
        </Link>
      </div>
    );
  }

  const preview = payoutPreview(wager.stakeAmount, wager.commissionRate);
  const myDeposit = wager.deposits.find((d) => d.playerId === viewerId);

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      <Link
        href="/wagers"
        className="inline-block text-[0.82rem] text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] mb-5"
      >
        ← Lobby des paris
      </Link>

      {/* En-tête */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <GameTag name={wager.game.name} />
            <WagerStatusBadge status={wager.status} />
          </div>
          <span className="text-[0.95rem] font-black text-[var(--accent-gold)]">
            Mise : {formatMoney(wager.stakeAmount, wager.currency)}
          </span>
        </div>

        <h1 className="text-[1.6rem] font-black text-[var(--text-primary)] mb-4">
          {wager.title}
        </h1>

        {/* Joueurs */}
        <div className="flex items-center justify-center gap-6 py-4">
          <PartyBlock
            party={wager.challenger}
            isWinner={wager.winnerId === wager.challengerId}
            agreed={wager.challengerAgreed}
          />
          <span className="text-[var(--text-muted)] font-bold text-lg">VS</span>
          {wager.opponent ? (
            <PartyBlock
              party={wager.opponent}
              isWinner={wager.winnerId === wager.opponentId}
              agreed={wager.opponentAgreed}
            />
          ) : (
            <div className="text-center text-[var(--text-muted)] italic text-sm w-[120px]">
              En attente d&apos;un adversaire
            </div>
          )}
        </div>

        {/* Cagnotte */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Cagnotte" value={formatMoney(preview.pot, wager.currency)} />
          <Stat
            label="Commission"
            value={
              wager.commissionRate > 0
                ? `${formatMoney(preview.commission, wager.currency)} (${wager.commissionRate}%)`
                : "Aucune"
            }
          />
          <Stat
            label="Gain vainqueur"
            value={formatMoney(preview.payout, wager.currency)}
            highlight
          />
        </div>

        {wager.terms && (
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">
              Conditions
            </h3>
            <p className="text-[0.88rem] text-[var(--text-secondary)] whitespace-pre-wrap">
              {wager.terms}
            </p>
          </div>
        )}
      </div>

      {/* Litige éventuel */}
      {wager.dispute && (
        <div className="bg-[color-mix(in_srgb,var(--accent-red)_8%,transparent)] border border-[color-mix(in_srgb,var(--accent-red)_30%,transparent)] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-[var(--accent-red)] mb-1.5">
            Litige {wager.dispute.status === "RESOLVED" ? "résolu" : "en cours"}
          </h3>
          <p className="text-[0.85rem] text-[var(--text-secondary)]">
            {wager.dispute.reason}
          </p>
          {wager.dispute.resolution && (
            <p className="text-[0.85rem] text-[var(--text-secondary)] mt-2">
              <span className="text-[var(--text-muted)]">Décision : </span>
              {wager.dispute.resolution}
            </p>
          )}
        </div>
      )}

      {/* Versement effectué */}
      {wager.payout && (
        <div className="bg-[color-mix(in_srgb,var(--accent-green)_8%,transparent)] border border-[color-mix(in_srgb,var(--accent-green)_30%,transparent)] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-[var(--accent-green)] mb-1.5">
            Gains versés à {wager.winner?.pseudo}
          </h3>
          <p className="text-[0.85rem] text-[var(--text-secondary)]">
            {formatMoney(wager.payout.amount, wager.currency)} via{" "}
            {PAYMENT_METHOD_LABELS[wager.payout.methodType]}
            {wager.payout.paidByName ? ` — par ${wager.payout.paidByName}` : ""}
          </p>
        </div>
      )}

      {/* Zone d'actions */}
      {!token ? (
        <div className="text-center py-6 text-[var(--text-muted)] text-sm">
          <Link href="/auth/login" className="text-[var(--accent-green)] no-underline hover:underline">
            Connectez-vous
          </Link>{" "}
          pour participer.
        </div>
      ) : (
        <ActionZone
          wager={wager}
          authHeader={authHeader}
          isStaff={isStaff}
          isParticipant={isParticipant}
          isChallenger={isChallenger}
          viewerId={viewerId}
          myDeposit={myDeposit}
          onDone={refetch}
        />
      )}
    </div>
  );
}

// ─── Sous-composants d'affichage ──────────────────────────────

function PartyBlock({
  party,
  isWinner,
  agreed,
}: {
  party: Party;
  isWinner: boolean;
  agreed: boolean;
}) {
  return (
    <div className="text-center w-[120px]">
      <div
        className="w-14 h-14 mx-auto rounded-full grid place-items-center text-base font-bold bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border)] mb-2 overflow-hidden"
        style={party.avatar ? { background: `url(${party.avatar}) center/cover` } : undefined}
      >
        {!party.avatar && party.pseudo.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-[0.9rem] font-bold text-[var(--text-primary)] flex items-center justify-center gap-1">
        {party.pseudo}
        {isWinner && <span title="Vainqueur">🏆</span>}
      </div>
      {agreed && (
        <span className="text-[0.66rem] text-[var(--accent-green)]">✓ termes validés</span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl p-3 text-center bg-[var(--bg-primary)] border border-[var(--border)]">
      <div
        className={`text-[0.95rem] font-black mb-0.5 ${
          highlight ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </div>
      <div className="text-[0.66rem] text-[var(--text-muted)] uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

// ─── Zone d'actions (logique de cycle de vie) ─────────────────

function ActionZone({
  wager,
  authHeader,
  isStaff,
  isParticipant,
  isChallenger,
  viewerId,
  myDeposit,
  onDone,
}: {
  wager: WagerDetail;
  authHeader?: Record<string, string>;
  isStaff: boolean;
  isParticipant: boolean;
  isChallenger: boolean;
  viewerId?: string;
  myDeposit?: Deposit;
  onDone: () => void;
}) {
  const id = wager.id;
  const accept = useMutation(`/api/wagers/${id}/accept`, "POST", authHeader, "Défi accepté !");
  const agree = useMutation(`/api/wagers/${id}/agree`, "POST", authHeader, "Termes validés !");
  const cancel = useMutation(`/api/wagers/${id}/cancel`, "POST", authHeader, "Défi annulé.");

  const run = async (m: { mutate: (b?: unknown) => Promise<unknown> }, body?: unknown) => {
    const r = await m.mutate(body);
    if (r) onDone();
  };

  const status = wager.status;
  const canAcceptOpen =
    status === "OPEN" &&
    !isChallenger &&
    (!wager.opponentId || wager.opponentId === viewerId);
  const myAgreed = isChallenger ? wager.challengerAgreed : wager.opponentAgreed;

  return (
    <div className="flex flex-col gap-4">
      {/* OPEN — accepter / annuler */}
      {canAcceptOpen && (
        <ActionCard title="Rejoindre ce défi">
          <p className="text-[0.85rem] text-[var(--text-secondary)] mb-3">
            En acceptant, vous vous engagez à miser{" "}
            {formatMoney(wager.stakeAmount, wager.currency)} et à jouer le match
            selon les conditions.
          </p>
          <PrimaryBtn loading={accept.loading} onClick={() => run(accept)}>
            Accepter le défi
          </PrimaryBtn>
        </ActionCard>
      )}

      {/* ACCEPTED — valider les termes */}
      {status === "ACCEPTED" && isParticipant && (
        <ActionCard title="Valider les termes">
          <p className="text-[0.85rem] text-[var(--text-secondary)] mb-3">
            Les deux joueurs doivent confirmer les termes avant de déposer leur
            mise.
          </p>
          {myAgreed ? (
            <p className="text-[0.85rem] text-[var(--accent-green)]">
              ✓ Vous avez validé. En attente de l&apos;autre joueur.
            </p>
          ) : (
            <PrimaryBtn loading={agree.loading} onClick={() => run(agree)}>
              J&apos;accepte les termes
            </PrimaryBtn>
          )}
        </ActionCard>
      )}

      {/* AWAITING_DEPOSITS — déposer la mise */}
      {status === "AWAITING_DEPOSITS" && isParticipant && (
        <DepositSection
          wager={wager}
          authHeader={authHeader}
          myDeposit={myDeposit}
          onDone={onDone}
        />
      )}

      {/* Suivi des dépôts (participants + staff) */}
      {(isParticipant || isStaff) &&
        ["AWAITING_DEPOSITS", "ONGOING"].includes(status) &&
        wager.deposits.length > 0 && (
          <DepositTracker
            wager={wager}
            isStaff={isStaff}
            authHeader={authHeader}
            onDone={onDone}
          />
        )}

      {/* ONGOING/AWAITING_RESULT/RESULT_REPORTED — déclarer le résultat */}
      {["ONGOING", "AWAITING_RESULT", "RESULT_REPORTED"].includes(status) &&
        isParticipant && (
          <ReportSection wager={wager} authHeader={authHeader} viewerId={viewerId} onDone={onDone} />
        )}

      {/* AWAITING_PAYOUT — staff verse */}
      {status === "AWAITING_PAYOUT" && isStaff && (
        <PayoutSection wager={wager} authHeader={authHeader} onDone={onDone} />
      )}

      {status === "DISPUTED" && isStaff && (
        <ActionCard title="Litige à arbitrer">
          <p className="text-[0.85rem] text-[var(--text-secondary)]">
            Rendez-vous dans la{" "}
            <Link href="/admin/disputes" className="text-[var(--accent-green)] no-underline hover:underline">
              file de modération
            </Link>{" "}
            pour trancher ce litige.
          </p>
        </ActionCard>
      )}

      {/* Litige (participant) */}
      {["ONGOING", "AWAITING_RESULT", "RESULT_REPORTED", "AWAITING_PAYOUT"].includes(
        status,
      ) &&
        isParticipant &&
        !wager.dispute && (
          <DisputeSection wager={wager} authHeader={authHeader} onDone={onDone} />
        )}

      {/* Annulation (avant la phase de jeu) */}
      {["OPEN", "ACCEPTED", "AWAITING_DEPOSITS"].includes(status) &&
        isParticipant && (
          <button
            onClick={() => run(cancel)}
            disabled={cancel.loading}
            className="self-start text-[0.82rem] text-[var(--accent-red)] hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            Annuler le défi
          </button>
        )}
    </div>
  );
}

// ─── Dépôt ────────────────────────────────────────────────────

function DepositSection({
  wager,
  authHeader,
  myDeposit,
  onDone,
}: {
  wager: WagerDetail;
  authHeader?: Record<string, string>;
  myDeposit?: Deposit;
  onDone: () => void;
}) {
  const { data: accounts } = useApi<PaymentAccount[]>(
    "/api/admin/payment-accounts",
    [],
    authHeader,
  );
  const [methodType, setMethodType] = useState<PaymentMethodType>("MOBILE_MONEY");
  const [reference, setReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const deposit = useMutation(
    `/api/wagers/${wager.id}/deposit`,
    "POST",
    authHeader,
    "Dépôt déclaré ! En attente de validation admin.",
  );

  const submit = async () => {
    const r = await deposit.mutate({ methodType, reference: reference || undefined, proofUrl: proofUrl || undefined });
    if (r) onDone();
  };

  return (
    <ActionCard title="Déposer votre mise">
      {myDeposit && myDeposit.status !== "REFUNDED" ? (
        <p className="text-[0.85rem] text-[var(--accent-green)]">
          {myDeposit.status === "CONFIRMED"
            ? "✓ Votre dépôt a été confirmé par l'administration."
            : "✓ Dépôt déclaré. En attente de confirmation de l'administration."}
        </p>
      ) : (
        <>
          <p className="text-[0.85rem] text-[var(--text-secondary)] mb-3">
            Envoyez {formatMoney(wager.stakeAmount, wager.currency)} sur l&apos;un
            des comptes ci-dessous, puis déclarez votre dépôt.
          </p>

          {accounts && accounts.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-3"
                >
                  <div className="text-[0.82rem] font-semibold text-[var(--text-primary)] mb-1">
                    {a.label}{" "}
                    <span className="text-[var(--text-muted)] font-normal">
                      · {PAYMENT_METHOD_LABELS[a.type]}
                    </span>
                  </div>
                  <pre className="text-[0.78rem] text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
                    {Object.entries(a.details)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join("\n")}
                  </pre>
                  {a.instructions && (
                    <p className="text-[0.75rem] text-[var(--text-muted)] mt-1">
                      {a.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[0.82rem] text-[var(--text-muted)] mb-4">
              Aucun compte de dépôt configuré. Contactez l&apos;administration.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Moyen utilisé
              </label>
              <select
                value={methodType}
                onChange={(e) => setMethodType(e.target.value as PaymentMethodType)}
                className={inputCls}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Référence de transaction
              </label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ID / numéro de transfert"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Lien de la preuve (capture, optionnel)
              </label>
              <input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>
          </div>

          <PrimaryBtn loading={deposit.loading} onClick={submit} className="mt-4">
            J&apos;ai effectué le dépôt
          </PrimaryBtn>
        </>
      )}
    </ActionCard>
  );
}

function DepositTracker({
  wager,
  isStaff,
  authHeader,
  onDone,
}: {
  wager: WagerDetail;
  isStaff: boolean;
  authHeader?: Record<string, string>;
  onDone: () => void;
}) {
  const confirm = useMutation(
    `/api/wagers/${wager.id}/deposit/confirm`,
    "POST",
    authHeader,
    "Dépôt confirmé.",
  );

  const nameOf = (pid: string) =>
    pid === wager.challengerId
      ? wager.challenger.pseudo
      : wager.opponent?.pseudo ?? "Adversaire";

  return (
    <ActionCard title="Suivi des dépôts">
      <div className="flex flex-col gap-2">
        {wager.deposits.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2"
          >
            <span className="text-[0.85rem] text-[var(--text-primary)] font-medium">
              {nameOf(d.playerId)}
            </span>
            <span className="flex items-center gap-3">
              <span
                className={`text-[0.78rem] font-semibold ${
                  d.status === "CONFIRMED"
                    ? "text-[var(--accent-green)]"
                    : d.status === "REFUNDED"
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--accent-gold)]"
                }`}
              >
                {d.status === "CONFIRMED"
                  ? "Confirmé"
                  : d.status === "REFUNDED"
                    ? "Remboursé"
                    : "En attente"}
              </span>
              {isStaff && d.status === "PENDING" && (
                <button
                  onClick={async () => {
                    const r = await confirm.mutate({ playerId: d.playerId });
                    if (r) onDone();
                  }}
                  disabled={confirm.loading}
                  className="text-[0.74rem] px-2 py-1 rounded bg-[var(--accent-green)] text-black font-semibold cursor-pointer disabled:opacity-50 border-none"
                >
                  Confirmer
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </ActionCard>
  );
}

// ─── Résultat ─────────────────────────────────────────────────

function ReportSection({
  wager,
  authHeader,
  viewerId,
  onDone,
}: {
  wager: WagerDetail;
  authHeader?: Record<string, string>;
  viewerId?: string;
  onDone: () => void;
}) {
  const myReport = wager.reports.find((r) => r.reporterId === viewerId);
  const [claimedWinnerId, setClaimedWinnerId] = useState(
    myReport?.claimedWinnerId ?? "",
  );
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const report = useMutation(
    `/api/wagers/${wager.id}/report`,
    "POST",
    authHeader,
    "Résultat déclaré !",
  );

  const submit = async () => {
    if (!claimedWinnerId) {
      toast.error("Indiquez le vainqueur.");
      return;
    }
    const r = await report.mutate({
      claimedWinnerId,
      note: note || undefined,
      proofUrl: proofUrl || undefined,
    });
    if (r) onDone();
  };

  return (
    <ActionCard title="Déclarer le résultat">
      {myReport && (
        <p className="text-[0.82rem] text-[var(--accent-green)] mb-3">
          ✓ Vous avez déclaré {nameOfWinner(wager, myReport.claimedWinnerId)}{" "}
          vainqueur. Vous pouvez corriger ci-dessous.
        </p>
      )}
      <p className="text-[0.85rem] text-[var(--text-secondary)] mb-3">
        Qui a gagné le match ? Si les deux déclarations concordent, le gain est
        débloqué. Sinon, un litige est ouvert.
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {[wager.challenger, wager.opponent].filter(Boolean).map((p) => {
          const party = p as Party;
          const selected = claimedWinnerId === party.id;
          return (
            <button
              key={party.id}
              onClick={() => setClaimedWinnerId(party.id)}
              className={`px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                selected
                  ? "bg-[var(--accent-green)] text-black font-semibold border-[var(--accent-green)]"
                  : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border)]"
              }`}
            >
              {party.pseudo}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-3">
        <input
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Lien de la preuve (optionnel)"
          className={inputCls}
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optionnel)"
          className={inputCls}
        />
      </div>

      <PrimaryBtn loading={report.loading} onClick={submit}>
        Envoyer ma déclaration
      </PrimaryBtn>
    </ActionCard>
  );
}

function nameOfWinner(wager: WagerDetail, pid: string) {
  if (pid === wager.challengerId) return wager.challenger.pseudo;
  if (pid === wager.opponentId) return wager.opponent?.pseudo ?? "l'adversaire";
  return "?";
}

// ─── Litige ───────────────────────────────────────────────────

function DisputeSection({
  wager,
  authHeader,
  onDone,
}: {
  wager: WagerDetail;
  authHeader?: Record<string, string>;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const dispute = useMutation(
    `/api/wagers/${wager.id}/dispute`,
    "POST",
    authHeader,
    "Litige ouvert. L'administration va trancher.",
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start text-[0.82rem] text-[var(--accent-gold)] hover:underline bg-transparent border-none cursor-pointer"
      >
        Signaler un problème / ouvrir un litige
      </button>
    );
  }

  return (
    <ActionCard title="Ouvrir un litige">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="Décrivez le problème (résultat contesté, dépôt non reçu…)"
        className={`${inputCls} resize-y mb-3`}
      />
      <div className="flex gap-2">
        <PrimaryBtn
          loading={dispute.loading}
          onClick={async () => {
            if (!reason.trim()) {
              toast.error("Un motif est requis.");
              return;
            }
            const r = await dispute.mutate({ reason: reason.trim() });
            if (r) onDone();
          }}
        >
          Ouvrir le litige
        </PrimaryBtn>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm cursor-pointer bg-[var(--bg-primary)] text-[var(--text-secondary)]"
        >
          Annuler
        </button>
      </div>
    </ActionCard>
  );
}

// ─── Versement (staff) ────────────────────────────────────────

function PayoutSection({
  wager,
  authHeader,
  onDone,
}: {
  wager: WagerDetail;
  authHeader?: Record<string, string>;
  onDone: () => void;
}) {
  const [methodType, setMethodType] = useState<PaymentMethodType>("MOBILE_MONEY");
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const payout = useMutation(
    `/api/wagers/${wager.id}/payout`,
    "POST",
    authHeader,
    "Versement enregistré.",
  );
  const preview = payoutPreview(wager.stakeAmount, wager.commissionRate);

  return (
    <ActionCard title="Verser les gains (administration)">
      <p className="text-[0.85rem] text-[var(--text-secondary)] mb-3">
        Vainqueur : <strong className="text-[var(--text-primary)]">{wager.winner?.pseudo}</strong>{" "}
        — à reverser : {formatMoney(preview.payout, wager.currency)} (commission{" "}
        {formatMoney(preview.commission, wager.currency)}).
      </p>
      <div className="grid gap-3 md:grid-cols-2 mb-3">
        <select
          value={methodType}
          onChange={(e) => setMethodType(e.target.value as PaymentMethodType)}
          className={inputCls}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
        <input
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="Lien preuve du versement"
          className={inputCls}
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optionnel)"
          className={`${inputCls} md:col-span-2`}
        />
      </div>
      <PrimaryBtn
        loading={payout.loading}
        onClick={async () => {
          const r = await payout.mutate({
            methodType,
            proofUrl: proofUrl || undefined,
            note: note || undefined,
          });
          if (r) onDone();
        }}
      >
        Confirmer le versement
      </PrimaryBtn>
    </ActionCard>
  );
}

// ─── Primitives UI ────────────────────────────────────────────

const inputCls =
  "w-full bg-[var(--bg-primary)] border border-[var(--border)] focus:border-[var(--accent-green)] rounded-lg text-[var(--text-primary)] px-3.5 py-2.5 text-[0.88rem] outline-none box-border";

function ActionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  loading,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-5 py-2 rounded-lg border-none font-semibold text-sm cursor-pointer bg-[var(--accent-green)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity ${className}`}
    >
      {loading ? "…" : children}
    </button>
  );
}
