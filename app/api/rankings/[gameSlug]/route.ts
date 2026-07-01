import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ gameSlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { gameSlug } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const game = await db.game.findUnique({ where: { slug: gameSlug }, select: { id: true } });
    if (!game) return notFound("Jeu introuvable");

    const activeSeason = await db.season.findFirst({ where: { isActive: true, gameId: game.id } });

    const where = {
      gameId: game.id,
      ...(activeSeason && { seasonId: activeSeason.id }),
    };

    const [entries, total] = await Promise.all([
      db.rankingEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rank: "asc" },
        include: {
          player: { select: { pseudo: true, city: true, isVerified: true } },
          team: { select: { name: true, tag: true, slug: true } },
          season: { select: { name: true } },
        },
      }),
      db.rankingEntry.count({ where }),
    ]);

    return paginated(entries, total, page, limit);
  } catch {
    return serverError();
  }
}
