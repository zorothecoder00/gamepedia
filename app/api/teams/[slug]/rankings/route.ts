import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const rankings = await db.rankingEntry.findMany({
      where: { teamId: team.id },
      orderBy: { totalPoints: "desc" },
      include: {
        season: { select: { name: true, isActive: true } },
        game: { select: { name: true, slug: true } },
      },
    });

    return ok(rankings);
  } catch {
    return serverError();
  }
}
