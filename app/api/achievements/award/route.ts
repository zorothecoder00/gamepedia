import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { created, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { playerId, achievementId } = await request.json() as {
      playerId: string;
      achievementId: string;
    };

    if (!playerId || !achievementId) {
      return badRequest("playerId et achievementId sont requis");
    }

    const award = await db.playerAchievement.create({
      data: { playerId, achievementId },
      include: { achievement: true, player: { select: { pseudo: true } } },
    });

    return created(award);
  } catch {
    return serverError();
  }
}
