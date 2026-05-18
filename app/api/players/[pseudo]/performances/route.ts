import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const player = await db.player.findUnique({ where: { pseudo }, select: { id: true } });
    if (!player) return notFound("Joueur introuvable");

    const [performances, total] = await Promise.all([
      db.playerMatchPerformance.findMany({
        where: { playerId: player.id },
        skip,
        take: limit,
        orderBy: { match: { scheduledAt: "desc" } },
        include: {
          match: {
            include: {
              stage: { include: { tournament: { select: { name: true, slug: true } } } },
            },
          },
        },
      }),
      db.playerMatchPerformance.count({ where: { playerId: player.id } }),
    ]);

    return paginated(performances, total, page, limit);
  } catch {
    return serverError();
  }
}
