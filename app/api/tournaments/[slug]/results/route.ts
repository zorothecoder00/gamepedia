import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true, prizePool: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const participants = await db.tournamentParticipant.findMany({
      where: { tournamentId: tournament.id, finalPlacement: { not: null } },
      orderBy: { finalPlacement: "asc" },
      include: {
        player: { select: { pseudo: true, city: true } },
        team: { select: { name: true, tag: true } },
      },
    });

    return ok({ prizePool: tournament.prizePool, podium: participants });
  } catch {
    return serverError();
  }
}
