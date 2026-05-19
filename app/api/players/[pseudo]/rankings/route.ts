import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({ where: { pseudo }, select: { id: true } });
    if (!player) return notFound("Joueur introuvable");

    const rankings = await db.rankingEntry.findMany({
      where: { playerId: player.id },
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
