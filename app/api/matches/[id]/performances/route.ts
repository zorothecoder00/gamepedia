import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, playerMatchPerformanceCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({ where: { id }, select: { id: true } });
    if (!match) return notFound("Match introuvable");

    const performances = await db.playerMatchPerformance.findMany({
      where: { matchId: id },
      include: { player: { select: { pseudo: true } } },
    });

    return ok(performances);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const match = await db.match.findUnique({ where: { id }, select: { id: true } });
    if (!match) return notFound("Match introuvable");

    const body = await parseBody(request, playerMatchPerformanceCreateSchema);
    const performance = await db.playerMatchPerformance.create({
      data: { ...body, stats: body.stats as object, matchId: id },
    });

    return created(performance);
  } catch (e) {
    return handleApiError(e);
  }
}
