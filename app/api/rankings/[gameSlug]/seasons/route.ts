import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ gameSlug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { gameSlug } = await params;
    const game = await db.game.findUnique({ where: { slug: gameSlug }, select: { id: true } });
    if (!game) return notFound("Jeu introuvable");

    const seasons = await db.season.findMany({
      where: { rankingEntries: { some: { gameId: game.id } } },
      orderBy: { startDate: "desc" },
    });

    return ok(seasons);
  } catch {
    return serverError();
  }
}
