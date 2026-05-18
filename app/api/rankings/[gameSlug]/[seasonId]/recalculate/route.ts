import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ gameSlug: string; seasonId: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { gameSlug, seasonId } = await params;

    const [game, season] = await Promise.all([
      db.game.findUnique({ where: { slug: gameSlug }, select: { id: true } }),
      db.season.findUnique({ where: { id: seasonId }, select: { id: true } }),
    ]);

    if (!game) return notFound("Jeu introuvable");
    if (!season) return notFound("Saison introuvable");

    // TODO: recalculer les points depuis PointAttribution et mettre à jour RankingEntry
    return ok({ message: `Recalcul déclenché pour ${gameSlug} — saison ${seasonId}` });
  } catch {
    return serverError();
  }
}
