import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const attributions = await db.pointAttribution.findMany({
      where: { tournamentId: tournament.id },
      include: {
        player: { select: { pseudo: true } },
        team: { select: { name: true, tag: true } },
      },
    });

    return ok(attributions);
  } catch {
    return serverError();
  }
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({
      where: { slug },
      select: { id: true, tier: true, games: { include: { game: true } } },
    });
    if (!tournament) return notFound("Tournoi introuvable");

    // TODO: implémenter la logique d'attribution automatique des points
    // 1. Récupérer les participants avec leur placement final
    // 2. Trouver les PointRule correspondantes (game + tier + placement)
    // 3. Créer les PointAttribution
    // 4. Mettre à jour les RankingEntry

    return ok({ message: "Attribution des points déclenchée.", tournamentId: tournament.id });
  } catch {
    return serverError();
  }
}
