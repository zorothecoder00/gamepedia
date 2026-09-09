import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, teamUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({
      where: { slug },
      include: {
        members: {
          where: { leftAt: null },
          include: { player: { select: { id: true, pseudo: true, city: true, isVerified: true } } },
        },
        _count: { select: { members: true, tournamentParticipations: true } },
      },
    });
    if (!team) return notFound("Équipe introuvable");
    return ok(team);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const body = await parseBody(request, teamUpdateSchema);
    const team = await db.team.update({ where: { slug }, data: body });
    return ok(team);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    await db.team.update({ where: { slug }, data: { isActive: false } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
