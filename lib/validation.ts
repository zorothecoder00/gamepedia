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

export const emailResendSchema = z.object({
  email: z.string().email(),
});

export const emailVerifySchema = z.object({
  token: z.string().min(1),
});

export const accountDeleteSchema = z.object({
  password: z.string().min(1),
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

export const wagerStatusQuerySchema = z.enum([
  "OPEN",
  "ACCEPTED",
  "AWAITING_DEPOSITS",
  "ONGOING",
  "AWAITING_RESULT",
  "RESULT_REPORTED",
  "DISPUTED",
  "AWAITING_PAYOUT",
  "SETTLED",
  "CANCELLED",
  "EXPIRED",
]);

// ── Contenu (players/teams/tournois/jeux/saisons/points/...) ──
//
// Ces schémas remplacent le mass-assignment (`data: body` passé tel
// quel à Prisma) sur les routes de contenu : seuls les champs listés
// ici sont acceptés, tout le reste du body est ignoré/rejeté par zod.

const socialLinksSchema = z.record(z.string(), z.string()).optional();

export const playerCreateSchema = z.object({
  pseudo: z.string().min(2).max(32),
  userId: z.string().min(1),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
});

export const playerUpdateSchema = z.object({
  pseudo: z.string().min(2).max(32).optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
  banner: z.string().max(500).optional().nullable(),
  socialLinks: socialLinksSchema,
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  nationality: z.string().max(2).optional(),
});

const gameFormatEnum = z.enum([
  "FIVE_VS_FIVE",
  "ONE_VS_ONE",
  "TWO_VS_TWO",
  "FOUR_VS_FOUR",
  "BATTLE_ROYALE",
  "MOBA",
  "FREE_FOR_ALL",
]);

export const gameCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  description: z.string().max(2000).optional().nullable(),
  genre: z.string().max(60).optional().nullable(),
  format: gameFormatEnum,
  logo: z.string().max(500).optional().nullable(),
  banner: z.string().max(500).optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  platforms: z.string().max(120).optional().nullable(),
  publisher: z.string().max(120).optional().nullable(),
});

export const gameUpdateSchema = gameCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const teamCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  tag: z.string().min(1).max(10),
  logo: z.string().max(500).optional().nullable(),
  banner: z.string().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  foundedAt: z.string().optional().nullable(),
  socialLinks: socialLinksSchema,
});

export const teamUpdateSchema = teamCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const teamMemberCreateSchema = z.object({
  playerId: z.string().min(1),
  role: z.string().max(60).optional(),
});

export const teamMemberUpdateSchema = z.object({
  role: z.string().max(60).optional(),
  leftAt: z.string().optional(),
});

const tournamentFormatEnum = z.enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS", "MIXED"]);
const tournamentTierEnum = z.enum(["S", "A", "B", "C"]);
const participantTypeEnum = z.enum(["TEAM", "SOLO"]);

export const tournamentCreateSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  edition: z.number().int().positive().optional(),
  description: z.string().max(5000).optional().nullable(),
  rules: z.string().max(20000).optional().nullable(),
  format: tournamentFormatEnum,
  participantType: participantTypeEnum,
  maxParticipants: z.number().int().positive().optional().nullable(),
  minParticipants: z.number().int().positive().optional().nullable(),
  tier: tournamentTierEnum.optional(),
  location: z.string().max(160).optional().nullable(),
  venue: z.string().max(160).optional().nullable(),
  isOnline: z.boolean().optional(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  registrationDeadline: z.string().optional().nullable(),
  checkInStart: z.string().optional().nullable(),
  prizePool: z.number().min(0).optional().nullable(),
  currency: z.string().max(10).optional(),
  prizeDistribution: z.record(z.string(), z.number()).optional(),
  logo: z.string().max(500).optional().nullable(),
  banner: z.string().max(500).optional().nullable(),
  streamUrl: z.string().max(500).optional().nullable(),
  vodUrl: z.string().max(500).optional().nullable(),
  organizerName: z.string().max(160).optional().nullable(),
  organizerLogo: z.string().max(500).optional().nullable(),
  sponsors: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const tournamentUpdateSchema = tournamentCreateSchema.partial().extend({
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export const tournamentParticipantCreateSchema = z
  .object({
    playerId: z.string().min(1).optional(),
    teamId: z.string().min(1).optional(),
    seed: z.number().int().positive().optional(),
    isConfirmed: z.boolean().optional(),
  })
  .refine((d) => !!d.playerId !== !!d.teamId, "Fournir soit playerId, soit teamId (exclusif)");

export const tournamentStageCreateSchema = z.object({
  name: z.string().min(1).max(120),
  stageNumber: z.number().int().positive(),
  format: tournamentFormatEnum,
  bestOf: z.number().int().positive().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const matchStatusEnum = z.enum(["SCHEDULED", "ONGOING", "COMPLETED", "FORFEITED", "CANCELLED"]);

export const matchCreateSchema = z.object({
  matchNumber: z.number().int().positive().optional(),
  round: z.number().int().positive().optional(),
  scheduledAt: z.string().optional().nullable(),
  status: matchStatusEnum.optional(),
  streamUrl: z.string().max(500).optional().nullable(),
  vodUrl: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const matchUpdateSchema = z.object({
  matchNumber: z.number().int().positive().optional(),
  round: z.number().int().positive().optional(),
  scheduledAt: z.string().optional().nullable(),
  startedAt: z.string().optional().nullable(),
  endedAt: z.string().optional().nullable(),
  status: matchStatusEnum.optional(),
  streamUrl: z.string().max(500).optional().nullable(),
  vodUrl: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const playerMatchPerformanceCreateSchema = z.object({
  playerId: z.string().min(1),
  teamId: z.string().min(1).optional(),
  stats: z.record(z.string(), z.unknown()),
  isMvp: z.boolean().optional(),
});

export const playerMatchPerformanceUpdateSchema = z.object({
  stats: z.record(z.string(), z.unknown()).optional(),
  isMvp: z.boolean().optional(),
  teamId: z.string().min(1).optional(),
});

export const seasonCreateSchema = z.object({
  gameId: z.string().min(1),
  name: z.string().min(1).max(120),
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const seasonUpdateSchema = seasonCreateSchema.partial();

export const pointRuleCreateSchema = z.object({
  gameId: z.string().min(1),
  seasonId: z.string().min(1).optional().nullable(),
  placement: z.number().int().positive(),
  tier: tournamentTierEnum,
  pointsAwarded: z.number().int().min(0),
  formatMultiplier: z.number().positive().optional(),
  description: z.string().max(500).optional().nullable(),
});

export const pointRuleUpdateSchema = pointRuleCreateSchema.partial();

export const achievementCreateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(1).max(500),
  icon: z.string().max(10).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  rarity: z.string().max(30).optional().nullable(),
});

export const achievementAwardSchema = z.object({
  playerId: z.string().min(1),
  achievementId: z.string().min(1),
});

export const articleCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().max(500).optional().nullable(),
  authorName: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().max(40)).optional(),
  isPublished: z.boolean().optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();
