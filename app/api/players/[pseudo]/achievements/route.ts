import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({ where: { pseudo }, select: { id: true } });
    if (!player) return notFound("Joueur introuvable");

    const achievements = await db.playerAchievement.findMany({
      where: { playerId: player.id },
      orderBy: { awardedAt: "desc" },
      include: { achievement: true },
    });

    return ok(achievements);
  } catch {
    return serverError();
  }
}
