// ============================================================
// GAMEPEDIA TG — Moteur de recalcul des classements
//
// Reconstruit les RankingEntry (cumuls par joueur/équipe) à partir
// des PointAttribution d'une saison. Idempotent : on repart de zéro
// à chaque appel, en préservant le rang précédent pour le mouvement.
// ============================================================

import { db } from "./prisma";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/** Clé d'agrégation : un joueur OU une équipe. */
function beneficiaryKey(a: { playerId: string | null; teamId: string | null }): string | null {
  if (a.playerId) return `p:${a.playerId}`;
  if (a.teamId) return `t:${a.teamId}`;
  return null;
}

interface Aggregate {
  playerId: string | null;
  teamId: string | null;
  totalPoints: number;
  totalPrizeMoney: number;
  tournaments: Set<string>;
  wins: number;
  top3Finishes: number;
  placementSum: number;
  placementCount: number;
}

/**
 * Recalcule le classement d'une saison (un jeu, une saison) depuis
 * ses PointAttribution. Renvoie le nombre d'entrées produites.
 */
export async function recalculateSeason(seasonId: string): Promise<number> {
  const season = await db.season.findUnique({
    where: { id: seasonId },
    select: { id: true, gameId: true },
  });
  if (!season) throw new Error("Saison introuvable");

  const attributions = await db.pointAttribution.findMany({
    where: { seasonId },
    select: {
      tournamentId: true,
      playerId: true,
      teamId: true,
      placement: true,
      finalPoints: true,
      prizeWon: true,
    },
  });

  // Agrégation par bénéficiaire
  const groups = new Map<string, Aggregate>();
  for (const a of attributions) {
    const key = beneficiaryKey(a);
    if (!key) continue;
    let g = groups.get(key);
    if (!g) {
      g = {
        playerId: a.playerId,
        teamId: a.teamId,
        totalPoints: 0,
        totalPrizeMoney: 0,
        tournaments: new Set(),
        wins: 0,
        top3Finishes: 0,
        placementSum: 0,
        placementCount: 0,
      };
      groups.set(key, g);
    }
    g.totalPoints += a.finalPoints;
    g.totalPrizeMoney += a.prizeWon ?? 0;
    g.tournaments.add(a.tournamentId);
    if (a.placement === 1) g.wins += 1;
    if (a.placement <= 3) g.top3Finishes += 1;
    g.placementSum += a.placement;
    g.placementCount += 1;
  }

  // Tri : points, puis victoires, top 3, meilleur placement moyen
  const ranked = [...groups.values()].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.top3Finishes !== a.top3Finishes) return b.top3Finishes - a.top3Finishes;
    const avgA = a.placementCount ? a.placementSum / a.placementCount : Infinity;
    const avgB = b.placementCount ? b.placementSum / b.placementCount : Infinity;
    return avgA - avgB;
  });

  await db.$transaction(async (tx: Tx) => {
    // Mémorise les rangs actuels pour renseigner prevRank
    const previous = await tx.rankingEntry.findMany({
      where: { gameId: season.gameId, seasonId },
      select: { playerId: true, teamId: true, rank: true },
    });
    const prevRankByKey = new Map<string, number | null>();
    for (const p of previous) {
      const key = beneficiaryKey(p);
      if (key) prevRankByKey.set(key, p.rank);
    }

    await tx.rankingEntry.deleteMany({ where: { gameId: season.gameId, seasonId } });

    if (ranked.length > 0) {
      await tx.rankingEntry.createMany({
        data: ranked.map((g, i) => {
          const key = beneficiaryKey(g)!;
          return {
            gameId: season.gameId,
            seasonId,
            playerId: g.playerId,
            teamId: g.teamId,
            totalPoints: g.totalPoints,
            totalPrizeMoney: g.totalPrizeMoney,
            tournamentsPlayed: g.tournaments.size,
            wins: g.wins,
            top3Finishes: g.top3Finishes,
            averagePlacement: g.placementCount ? g.placementSum / g.placementCount : null,
            rank: i + 1,
            prevRank: prevRankByKey.get(key) ?? null,
          };
        }),
      });
    }
  });

  return ranked.length;
}

/**
 * Recalcule toutes les saisons. Renvoie le total d'entrées produites.
 */
export async function recalculateAll(): Promise<{ seasons: number; entries: number }> {
  const seasons = await db.season.findMany({ select: { id: true } });
  let entries = 0;
  for (const s of seasons) {
    entries += await recalculateSeason(s.id);
  }
  return { seasons: seasons.length, entries };
}
