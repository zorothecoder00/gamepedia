// ============================================================
// GAMEPEDIA TG — Logique métier des paris entre joueurs (défis)
//
// Modèle escrow : les deux joueurs déposent leur mise sur le
// compte de l'admin, qui reverse le total (moins commission) au
// vainqueur. Ce module centralise l'éligibilité, la machine à
// états, les calculs financiers et la réputation.
// ============================================================

import { WagerStatus, DepositStatus } from "@prisma/client";
import type { Player, Wager, WagerReport } from "@prisma/client";
import { db } from "./prisma";

// ── Constantes ────────────────────────────────────────────────

/** En dessous de ce score de confiance, un joueur ne peut plus parier. */
export const MIN_TRUST_SCORE = 50;

/** Pénalité de confiance appliquée à un défaut de paiement. */
export const TRUST_PENALTY_DEFAULT = 25;

/** Mise minimale et maximale autorisée (en unité de la devise, ex. XOF). */
export const MIN_STAKE = 100;
export const MAX_STAKE = 1_000_000;

/** Commission par défaut prélevée par l'admin (en %). */
export const DEFAULT_COMMISSION_RATE = 0;

// ── Erreur métier ─────────────────────────────────────────────

/**
 * Erreur métier des paris. Le `status` permet aux routes API de
 * répondre avec le bon code HTTP (400 / 403 / 409…).
 */
export class WagerError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "WagerError";
    this.status = status;
  }
}

// ── Machine à états ───────────────────────────────────────────

/** Transitions autorisées entre statuts de défi. */
export const WAGER_TRANSITIONS: Record<WagerStatus, WagerStatus[]> = {
  OPEN: ["ACCEPTED", "CANCELLED", "EXPIRED"],
  ACCEPTED: ["AWAITING_DEPOSITS", "CANCELLED"],
  AWAITING_DEPOSITS: ["ONGOING", "CANCELLED"],
  ONGOING: ["AWAITING_RESULT", "RESULT_REPORTED", "DISPUTED"],
  AWAITING_RESULT: ["RESULT_REPORTED", "DISPUTED"],
  RESULT_REPORTED: ["AWAITING_PAYOUT", "DISPUTED"],
  DISPUTED: ["AWAITING_PAYOUT", "CANCELLED"],
  AWAITING_PAYOUT: ["SETTLED", "DISPUTED"],
  SETTLED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export function canTransition(from: WagerStatus, to: WagerStatus): boolean {
  return WAGER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Lève une WagerError si la transition est interdite. */
export function assertTransition(from: WagerStatus, to: WagerStatus): void {
  if (!canTransition(from, to)) {
    throw new WagerError(
      `Transition invalide : ${from} → ${to}`,
      409,
    );
  }
}

// ── Éligibilité ───────────────────────────────────────────────

/** Un joueur a-t-il un profil pour ce jeu ? */
export async function hasGameProfile(
  playerId: string,
  gameId: string,
): Promise<boolean> {
  const profile = await db.playerGameProfile.findUnique({
    where: { playerId_gameId: { playerId, gameId } },
    select: { id: true },
  });
  return profile !== null;
}

/** Un joueur a-t-il une suspension active ? */
export async function hasActiveSuspension(playerId: string): Promise<boolean> {
  const suspension = await db.suspension.findFirst({
    where: { playerId, isActive: true },
    select: { id: true },
  });
  return suspension !== null;
}

/**
 * Vérifie qu'un joueur remplit les conditions pour parier :
 * actif, CGU paris acceptées, majeur, non suspendu, confiance suffisante.
 * Lève une WagerError sinon.
 */
export async function assertCanWager(player: Player): Promise<void> {
  if (!player.isActive) {
    throw new WagerError("Ce compte joueur est inactif.", 403);
  }
  if (!player.acceptedWagerCgu) {
    throw new WagerError(
      "Vous devez accepter les conditions des paris avant de participer.",
      403,
    );
  }
  if (!player.isAdult) {
    throw new WagerError(
      "Les paris sont réservés aux joueurs majeurs (18+).",
      403,
    );
  }
  if (player.trustScore < MIN_TRUST_SCORE) {
    throw new WagerError(
      "Votre score de confiance est trop bas pour parier.",
      403,
    );
  }
  if (await hasActiveSuspension(player.id)) {
    throw new WagerError("Vous êtes suspendu et ne pouvez pas parier.", 403);
  }
}

/**
 * Cœur de la règle « même jeu » : un joueur FIFA ne peut pas miser
 * contre un joueur Dota. Les deux doivent avoir un profil sur `gameId`.
 */
export async function assertSameGameEligibility(
  challengerId: string,
  opponentId: string,
  gameId: string,
): Promise<void> {
  if (challengerId === opponentId) {
    throw new WagerError("Vous ne pouvez pas vous défier vous-même.");
  }
  const [challengerOk, opponentOk] = await Promise.all([
    hasGameProfile(challengerId, gameId),
    hasGameProfile(opponentId, gameId),
  ]);
  if (!challengerOk) {
    throw new WagerError("Vous n'avez pas de profil sur ce jeu.");
  }
  if (!opponentOk) {
    throw new WagerError(
      "L'adversaire n'a pas de profil sur ce jeu : défi impossible.",
    );
  }
}

/** Valide une mise. */
export function assertValidStake(stake: number): void {
  if (!Number.isFinite(stake) || stake < MIN_STAKE) {
    throw new WagerError(`La mise minimale est de ${MIN_STAKE}.`);
  }
  if (stake > MAX_STAKE) {
    throw new WagerError(`La mise maximale est de ${MAX_STAKE}.`);
  }
}

// ── Participants ──────────────────────────────────────────────

/** Le joueur est-il l'un des deux participants au défi ? */
export function isParticipant(
  wager: Pick<Wager, "challengerId" | "opponentId">,
  playerId: string,
): boolean {
  return wager.challengerId === playerId || wager.opponentId === playerId;
}

/** Renvoie l'identifiant de l'adversaire d'un participant donné. */
export function opponentOf(
  wager: Pick<Wager, "challengerId" | "opponentId">,
  playerId: string,
): string | null {
  if (wager.challengerId === playerId) return wager.opponentId;
  if (wager.opponentId === playerId) return wager.challengerId;
  return null;
}

// ── Calculs financiers ────────────────────────────────────────

export interface PayoutBreakdown {
  /** Total des deux mises. */
  pot: number;
  /** Montant retenu par l'admin. */
  commission: number;
  /** Montant reversé au vainqueur. */
  payout: number;
}

/**
 * Calcule la répartition : cagnotte = 2 × mise, commission selon le
 * taux, reste pour le vainqueur. Arrondi à l'entier (devises sans
 * décimale comme le XOF).
 */
export function computePayout(
  stakeAmount: number,
  commissionRate: number,
): PayoutBreakdown {
  const pot = stakeAmount * 2;
  const rate = Math.min(100, Math.max(0, commissionRate));
  const commission = Math.round((pot * rate) / 100);
  return { pot, commission, payout: pot - commission };
}

// ── Résolution des résultats ──────────────────────────────────

export interface ReportResolution {
  /** Les deux joueurs ont déclaré. */
  complete: boolean;
  /** Les déclarations concordent. */
  agree: boolean;
  /** Vainqueur si concordance, sinon null. */
  winnerId: string | null;
}

/**
 * Compare les déclarations de résultat. Renvoie le vainqueur si les
 * deux joueurs sont d'accord, sinon signale un conflit (→ litige).
 */
export function resolveReports(
  reports: Pick<WagerReport, "reporterId" | "claimedWinnerId">[],
): ReportResolution {
  if (reports.length < 2) {
    return { complete: false, agree: false, winnerId: null };
  }
  const [a, b] = reports;
  const agree = a.claimedWinnerId === b.claimedWinnerId;
  return {
    complete: true,
    agree,
    winnerId: agree ? a.claimedWinnerId : null,
  };
}

// ── Réputation ────────────────────────────────────────────────
//
// Ces helpers s'utilisent dans une transaction Prisma (`db.$transaction`)
// au moment de la clôture d'un défi.

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/** Incrémente le compteur de défis joués pour les deux participants. */
export async function markWagerPlayed(
  tx: Tx,
  playerIds: string[],
): Promise<void> {
  await tx.player.updateMany({
    where: { id: { in: playerIds } },
    data: { wagersPlayed: { increment: 1 } },
  });
}

/** Enregistre une victoire. */
export async function markWagerWon(tx: Tx, winnerId: string): Promise<void> {
  await tx.player.update({
    where: { id: winnerId },
    data: { wagersWon: { increment: 1 } },
  });
}

/**
 * Sanctionne un défaut de paiement : incrémente le compteur et fait
 * baisser le score de confiance (planché à 0).
 */
export async function markPaymentDefault(
  tx: Tx,
  playerId: string,
): Promise<void> {
  const player = await tx.player.findUnique({
    where: { id: playerId },
    select: { trustScore: true },
  });
  if (!player) return;
  const newScore = Math.max(0, player.trustScore - TRUST_PENALTY_DEFAULT);
  await tx.player.update({
    where: { id: playerId },
    data: {
      paymentDefaults: { increment: 1 },
      trustScore: newScore,
    },
  });
}

// ── Helpers d'accès ───────────────────────────────────────────

/** Charge un défi avec ses relations utiles, ou null. */
export function getWagerWithRelations(id: string) {
  return db.wager.findUnique({
    where: { id },
    include: {
      game: { select: { name: true, slug: true } },
      challenger: { select: { id: true, pseudo: true, avatar: true } },
      opponent: { select: { id: true, pseudo: true, avatar: true } },
      winner: { select: { id: true, pseudo: true } },
      deposits: true,
      reports: true,
      dispute: true,
      payout: true,
    },
  });
}

/** Les deux dépôts sont-ils confirmés par l'admin ? */
export function bothDepositsConfirmed(
  deposits: Pick<import("@prisma/client").WagerDeposit, "status">[],
): boolean {
  const confirmed = deposits.filter(
    (d) => d.status === DepositStatus.CONFIRMED,
  );
  return confirmed.length >= 2;
}

/**
 * Crée une notification in-app pour un joueur (si lié à un compte user).
 * Silencieux si le joueur n'a pas de compte utilisateur.
 */
export async function notifyPlayer(
  playerId: string,
  data: { title: string; message?: string; link?: string },
): Promise<void> {
  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { userId: true },
  });
  if (!player?.userId) return;
  await db.notification.create({
    data: {
      userId: player.userId,
      type: "WAGER",
      title: data.title,
      message: data.message ?? null,
      link: data.link ?? null,
    },
  });
}
