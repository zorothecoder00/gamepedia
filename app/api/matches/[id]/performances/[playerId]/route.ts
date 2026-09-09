import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, playerMatchPerformanceUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string; playerId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id: matchId, playerId } = await params;
    const body = await parseBody(request, playerMatchPerformanceUpdateSchema);

    const performance = await db.playerMatchPerformance.updateMany({
      where: { matchId, playerId },
      data: { ...body, stats: body.stats as object | undefined },
    });

    return ok(performance);
  } catch (e) {
    return handleApiError(e);
  }
}
