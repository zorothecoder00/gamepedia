import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const [participations, total] = await Promise.all([
      db.tournamentParticipant.findMany({
        where: { teamId: team.id },
        skip,
        take: limit,
        orderBy: { tournament: { startDate: "desc" } },
        include: {
          tournament: { select: { id: true, name: true, slug: true, tier: true, status: true, startDate: true } },
        },
      }),
      db.tournamentParticipant.count({ where: { teamId: team.id } }),
    ]);

    return paginated(participations, total, page, limit);
  } catch {
    return serverError();
  }
}
