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

    const [participations, total] = await Promise.all([
      db.tournamentParticipant.findMany({
        where: { playerId: player.id },
        skip,
        take: limit,
        orderBy: { tournament: { startDate: "desc" } },
        include: {
          tournament: {
            select: { id: true, name: true, slug: true, tier: true, status: true, startDate: true, endDate: true },
          },
        },
      }),
      db.tournamentParticipant.count({ where: { playerId: player.id } }),
    ]);

    return paginated(participations, total, page, limit);
  } catch {
    return serverError();
  }
}
