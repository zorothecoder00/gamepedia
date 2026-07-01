import { db } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const games = await db.game.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    const rankings = await Promise.all(
      games.map(async (game) => {
        // Saison active PROPRE à ce jeu (une active par jeu)
        const season = await db.season.findFirst({
          where: { isActive: true, gameId: game.id },
          select: { id: true, name: true, year: true },
        });
        const top5 = await db.rankingEntry.findMany({
          where: {
            gameId: game.id,
            ...(season && { seasonId: season.id }),
          },
          orderBy: { rank: "asc" },
          take: 5,
          include: {
            player: { select: { pseudo: true, city: true } },
            team: { select: { name: true, tag: true } },
          },
        });
        return { game, season, top5 };
      }),
    );

    return ok({ rankings });
  } catch {
    return serverError();
  }
}
