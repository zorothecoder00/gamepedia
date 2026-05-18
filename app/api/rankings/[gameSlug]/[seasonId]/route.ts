import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ gameSlug: string; seasonId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { gameSlug, seasonId } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const [game, season] = await Promise.all([
      db.game.findUnique({ where: { slug: gameSlug }, select: { id: true } }),
      db.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true } }),
    ]);

    if (!game) return notFound("Jeu introuvable");
    if (!season) return notFound("Saison introuvable");

    const where = { gameId: game.id, seasonId };

    const [entries, total] = await Promise.all([
      db.rankingEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rank: "asc" },
        include: {
          player: { select: { pseudo: true, city: true, isVerified: true } },
          team: { select: { name: true, tag: true, slug: true } },
        },
      }),
      db.rankingEntry.count({ where }),
    ]);

    return paginated(entries, total, page, limit);
  } catch {
    return serverError();
  }
}
