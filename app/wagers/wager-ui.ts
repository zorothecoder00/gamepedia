// ============================================================
// GAMEPEDIA TG — Constantes d'affichage des paris (côté client)
//
// Volontairement séparé de lib/wagers.ts (qui importe Prisma et ne
// doit pas être tiré dans un bundle client). On n'y met que des
// libellés, couleurs et helpers de formatage.
// ============================================================

export type WagerStatus =
  | "OPEN"
  | "ACCEPTED"
  | "AWAITING_DEPOSITS"
  | "ONGOING"
  | "AWAITING_RESULT"
  | "RESULT_REPORTED"
  | "DISPUTED"
  | "AWAITING_PAYOUT"
  | "SETTLED"
  | "CANCELLED"
  | "EXPIRED";

/** Libellé + couleur (variable CSS ou hex) de chaque statut. */
export const WAGER_STATUS_META: Record<
  WagerStatus,
  { label: string; color: string }
> = {
  OPEN: { label: "Ouvert", color: "var(--accent-green)" },
  ACCEPTED: { label: "Accepté", color: "var(--accent-blue)" },
  AWAITING_DEPOSITS: { label: "Dépôts en attente", color: "var(--accent-gold)" },
  ONGOING: { label: "En cours", color: "var(--accent-blue)" },
  AWAITING_RESULT: { label: "Résultat attendu", color: "var(--accent-gold)" },
  RESULT_REPORTED: { label: "Résultat déclaré", color: "var(--accent-gold)" },
  DISPUTED: { label: "Litige", color: "var(--accent-red)" },
  AWAITING_PAYOUT: { label: "Versement en attente", color: "var(--accent-gold)" },
  SETTLED: { label: "Réglé", color: "var(--accent-green)" },
  CANCELLED: { label: "Annulé", color: "var(--text-muted)" },
  EXPIRED: { label: "Expiré", color: "var(--text-muted)" },
};

export type PaymentMethodType =
  | "MOBILE_MONEY"
  | "BANK_CARD"
  | "WESTERN_UNION"
  | "BANK_TRANSFER"
  | "OTHER";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  MOBILE_MONEY: "Mobile Money",
  BANK_CARD: "Carte bancaire",
  WESTERN_UNION: "Western Union",
  BANK_TRANSFER: "Virement bancaire",
  OTHER: "Autre",
};

export const PAYMENT_METHODS: PaymentMethodType[] = [
  "MOBILE_MONEY",
  "WESTERN_UNION",
  "BANK_TRANSFER",
  "BANK_CARD",
  "OTHER",
];

/** Formate un montant dans la devise (XOF sans décimale par défaut). */
export function formatMoney(amount: number, currency = "XOF"): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(amount),
  );
  return `${n} ${currency}`;
}

/** Cagnotte (2× mise) et reversement après commission. */
export function payoutPreview(stake: number, commissionRate: number) {
  const pot = stake * 2;
  const rate = Math.min(100, Math.max(0, commissionRate));
  const commission = Math.round((pot * rate) / 100);
  return { pot, commission, payout: pot - commission };
}
