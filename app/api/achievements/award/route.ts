import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { created, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, achievementAwardSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { playerId, achievementId } = await parseBody(request, achievementAwardSchema);

    const award = await db.playerAchievement.create({
      data: { playerId, achievementId },
      include: { achievement: true, player: { select: { pseudo: true } } },
    });

    return created(award);
  } catch (e) {
    return handleApiError(e);
  }
}
