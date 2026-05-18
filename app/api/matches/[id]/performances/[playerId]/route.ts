import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string; playerId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id: matchId, playerId } = await params;
    const body = await request.json();

    const performance = await db.playerMatchPerformance.updateMany({
      where: { matchId, playerId },
      data: body,
    });

    return ok(performance);
  } catch {
    return serverError();
  }
}
