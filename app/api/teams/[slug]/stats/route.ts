import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const participations = await db.tournamentParticipant.findMany({
      where: { teamId: team.id },
      select: { finalPlacement: true, prizeWon: true, tournament: { select: { tier: true } } },
    });

    const wins = participations.filter((p) => p.finalPlacement === 1).length;
    const top3 = participations.filter((p) => p.finalPlacement !== null && p.finalPlacement <= 3).length;
    const totalPrize = participations.reduce((acc, p) => acc + (p.prizeWon?.toNumber() ?? 0), 0);

    return ok({
      tournamentsPlayed: participations.length,
      wins,
      top3,
      totalPrize,
    });
  } catch {
    return serverError();
  }
}
