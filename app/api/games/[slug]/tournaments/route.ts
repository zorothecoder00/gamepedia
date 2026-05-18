import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);
    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const game = await db.game.findUnique({ where: { slug }, select: { id: true } });
    if (!game) return notFound("Jeu introuvable");

    const where = {
      games: { some: { gameId: game.id } },
      ...(status && { status: status as never }),
    };

    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        select: { id: true, name: true, slug: true, tier: true, status: true, startDate: true, endDate: true, prizePool: true },
      }),
      db.tournament.count({ where }),
    ]);

    return paginated(tournaments, total, page, limit);
  } catch {
    return serverError();
  }
}
