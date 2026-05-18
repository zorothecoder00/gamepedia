import { db } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const activeSeason = await db.season.findFirst({ where: { isActive: true } });

    const games = await db.game.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    const rankings = await Promise.all(
      games.map(async (game) => {
        const top5 = await db.rankingEntry.findMany({
          where: {
            gameId: game.id,
            ...(activeSeason && { seasonId: activeSeason.id }),
          },
          orderBy: { rank: "asc" },
          take: 5,
          include: {
            player: { select: { pseudo: true, city: true } },
            team: { select: { name: true, tag: true } },
          },
        });
        return { game, top5 };
      }),
    );

    return ok({ season: activeSeason, rankings });
  } catch {
    return serverError();
  }
}
