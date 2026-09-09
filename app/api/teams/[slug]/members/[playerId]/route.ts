import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ slug: string; playerId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug, playerId } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const body = await request.json() as { role?: string; leftAt?: string };

    const member = await db.teamMember.updateMany({
      where: { teamId: team.id, playerId },
      data: {
        ...(body.role && { role: body.role }),
        ...(body.leftAt && { leftAt: new Date(body.leftAt) }),
      },
    });

    return ok(member);
  } catch (e) {
    return handleApiError(e);
  }
}
