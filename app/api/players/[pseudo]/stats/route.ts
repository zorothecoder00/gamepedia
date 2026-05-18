import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({
      where: { pseudo },
      select: { id: true, pseudo: true },
    });
    if (!player) return notFound("Joueur introuvable");

    const [rankingEntries, participations] = await Promise.all([
      db.rankingEntry.findMany({
        where: { playerId: player.id },
        include: { season: true, game: true },
        orderBy: { points: "desc" },
      }),
      db.tournamentParticipant.findMany({
        where: { playerId: player.id },
        include: { tournament: { select: { name: true, tier: true } } },
      }),
    ]);

    const wins = participations.filter((p) => p.finalPlacement === 1).length;
    const top3 = participations.filter((p) => p.finalPlacement !== null && p.finalPlacement <= 3).length;
    const totalPrize = participations.reduce((acc, p) => acc + (p.prizeWon?.toNumber() ?? 0), 0);

    return ok({
      player: { id: player.id, pseudo: player.pseudo },
      rankings: rankingEntries,
      summary: {
        tournamentsPlayed: participations.length,
        wins,
        top3,
        totalPrize,
      },
    });
  } catch {
    return serverError();
  }
}
