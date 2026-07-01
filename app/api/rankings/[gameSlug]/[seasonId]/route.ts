import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ gameSlug: string; seasonId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { gameSlug, seasonId } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const [game, season] = await Promise.all([
      db.game.findUnique({ where: { slug: gameSlug }, select: { id: true } }),
      db.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, year: true } }),
    ]);

    if (!game) return notFound("Jeu introuvable");
    if (!season) return notFound("Saison introuvable");

    const where = { gameId: game.id, seasonId };

    const [entries, total, prizeAgg, tournamentIds] = await Promise.all([
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
      db.rankingEntry.aggregate({ where, _sum: { totalPrizeMoney: true } }),
      db.pointAttribution.findMany({
        where: { seasonId },
        select: { tournamentId: true },
        distinct: ["tournamentId"],
      }),
    ]);

    // On glisse le résumé de saison dans meta (consommé par la page).
    return NextResponse.json({
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        season: {
          name: season.name,
          year: season.year,
          participants: total,
          totalPrize: prizeAgg._sum.totalPrizeMoney ?? 0,
          tournamentsCount: tournamentIds.length,
        },
      },
    });
  } catch {
    return serverError();
  }
}
