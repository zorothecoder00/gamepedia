// ============================================================
// GAMEPEDIA TG — Validation des entrées API (zod)
//
// `parseBody` parse le JSON et valide contre un schéma ; une
// entrée invalide lève une ZodError, attrapée par handleApiError
// (lib/api.ts) qui la mappe sur une réponse 400 structurée.
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";

export async function parseBody<T>(request: NextRequest, schema: z.ZodType<T>): Promise<T> {
  const json = await request.json();
  return schema.parse(json);
}

// ── Auth ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et underscore uniquement"),
  password: z.string().min(8, "8 caractères minimum"),
});

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export const mePatchSchema = z.object({
  username: z.string().min(3).max(24).optional(),
  email: z.string().email().optional(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
});

export const passwordConfirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

// ── Wagers ───────────────────────────────────────────────────

const paymentMethodType = z.enum(["MOBILE_MONEY", "BANK_CARD", "WESTERN_UNION", "BANK_TRANSFER", "OTHER"]);

export const wagerCreateSchema = z.object({
  gameId: z.string().min(1),
  opponentId: z.string().min(1).optional(),
  stakeAmount: z.number().positive(),
  title: z.string().min(3).max(120),
  terms: z.string().max(2000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  acceptDeadline: z.string().optional(),
  playByDate: z.string().optional(),
});

export const wagerDepositSchema = z.object({
  methodType: paymentMethodType,
  proofUrl: z.string().url().optional(),
  reference: z.string().max(200).optional(),
});

export const wagerReportSchema = z.object({
  claimedWinnerId: z.string().min(1),
  proofUrl: z.string().url().optional(),
  note: z.string().max(1000).optional(),
});

export const wagerDisputeSchema = z.object({
  reason: z.string().min(3).max(1000),
});

// ── Admin ────────────────────────────────────────────────────

export const paymentAccountCreateSchema = z.object({
  type: paymentMethodType,
  label: z.string().min(1).max(120),
  details: z.record(z.string(), z.string()).refine(
    (o) => Object.keys(o).length > 0,
    "Au moins une coordonnée requise",
  ),
  instructions: z.string().max(2000).optional(),
});

export const disputeResolveSchema = z.object({
  resolvedWinnerId: z.string().min(1),
  resolution: z.string().min(3).max(1000),
});

export const userRoleSchema = z.object({
  role: z.enum(["ADMIN", "MODERATOR", "PLAYER", "VISITOR"]),
});

export const userActiveSchema = z.object({
  isActive: z.boolean(),
});
