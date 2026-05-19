import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const game = await db.game.findUnique({ where: { slug }, select: { id: true } });
    if (!game) return notFound("Jeu introuvable");

    const entries = await db.rankingEntry.findMany({
      where: { gameId: game.id },
      orderBy: { totalPoints: "desc" },
      take: 50,
      include: {
        player: { select: { pseudo: true, city: true, isVerified: true } },
        season: { select: { name: true, isActive: true } },
      },
    });

    return ok(entries);
  } catch {
    return serverError();
  }
}
