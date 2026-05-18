import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, serverError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const tournamentSlug = sp.get("tournament");
    if (!tournamentSlug) return badRequest("Paramètre tournament requis");

    const tournament = await db.tournament.findUnique({
      where: { slug: tournamentSlug },
      select: { tier: true, games: { include: { game: { select: { id: true, name: true } } } } },
    });

    if (!tournament) return badRequest("Tournoi introuvable");

    const gameId = tournament.games[0]?.game?.id;
    if (!gameId) return badRequest("Aucun jeu associé au tournoi");

    const rules = await db.pointRule.findMany({
      where: { gameId, tier: tournament.tier },
      orderBy: { placement: "asc" },
    });

    return ok({ tier: tournament.tier, rules });
  } catch {
    return serverError();
  }
}
