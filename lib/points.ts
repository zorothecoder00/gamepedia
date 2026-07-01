// ============================================================
// GAMEPEDIA TG — Attribution des points d'un tournoi
//
// Transforme les placements finaux d'un tournoi en PointAttribution
// (base × multiplicateur de format), puis déclenche le recalcul du
// classement de la saison. Idempotent : on efface les attributions
// existantes du tournoi avant de les recréer.
// ============================================================

import { db } from "./prisma";
import type { Prisma } from "@prisma/client";
import { recalculateSeason } from "./rankings";

export class AttributionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttributionError";
  }
}

interface AttributionResult {
  created: number;
  seasonId: string;
  entries: number;
}

/**
 * Résout la saison à laquelle rattacher un tournoi : la saison du jeu
 * dont la plage de dates contient la date de début du tournoi, sinon
 * la saison active du jeu.
 */
async function resolveSeason(gameId: string, startDate: Date) {
  const containing = await db.season.findFirst({
    where: {
      gameId,
      startDate: { lte: startDate },
      OR: [{ endDate: null }, { endDate: { gte: startDate } }],
    },
    orderBy: { startDate: "desc" },
    select: { id: true },
  });
  if (containing) return containing;
  return db.season.findFirst({
    where: { gameId, isActive: true },
    select: { id: true },
  });
}

export async function attributeTournamentPoints(
  tournamentId: string,
): Promise<AttributionResult> {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      tier: true,
      startDate: true,
      games: { select: { gameId: true } },
      participants: {
        where: { finalPlacement: { not: null } },
        select: { playerId: true, teamId: true, finalPlacement: true, prizeWon: true },
      },
    },
  });
  if (!tournament) throw new AttributionError("Tournoi introuvable");

  const gameId = tournament.games[0]?.gameId;
  if (!gameId) throw new AttributionError("Aucun jeu associé au tournoi.");
  if (tournament.participants.length === 0) {
    throw new AttributionError("Aucun résultat final : renseignez les placements avant d'attribuer les points.");
  }

  const season = await resolveSeason(gameId, tournament.startDate);
  if (!season) {
    throw new AttributionError("Aucune saison pour ce jeu. Créez et activez une saison d'abord.");
  }

  // Règles du barème : on privilégie la règle spécifique à la saison,
  // sinon la règle générique (seasonId null).
  const rules = await db.pointRule.findMany({
    where: {
      gameId,
      tier: tournament.tier,
      OR: [{ seasonId: season.id }, { seasonId: null }],
    },
  });
  const ruleByPlacement = new Map<number, (typeof rules)[number]>();
  for (const r of rules) {
    const existing = ruleByPlacement.get(r.placement);
    if (!existing || (r.seasonId === season.id && existing.seasonId === null)) {
      ruleByPlacement.set(r.placement, r);
    }
  }

  const rows: Prisma.PointAttributionCreateManyInput[] = [];
  for (const p of tournament.participants) {
    const placement = p.finalPlacement!;
    const rule = ruleByPlacement.get(placement);
    if (!rule) continue; // pas de barème pour ce rang → 0 point
    const finalPoints = Math.round(rule.pointsAwarded * rule.formatMultiplier);
    rows.push({
      tournamentId: tournament.id,
      seasonId: season.id,
      playerId: p.playerId,
      teamId: p.teamId,
      placement,
      basePoints: rule.pointsAwarded,
      multiplier: rule.formatMultiplier,
      finalPoints,
      prizeWon: p.prizeWon,
    });
  }

  await db.$transaction(async (tx) => {
    await tx.pointAttribution.deleteMany({ where: { tournamentId: tournament.id } });
    if (rows.length > 0) {
      await tx.pointAttribution.createMany({ data: rows });
    }
  });

  // Répercute immédiatement sur le classement de la saison
  const entries = await recalculateSeason(season.id);

  return { created: rows.length, seasonId: season.id, entries };
}
