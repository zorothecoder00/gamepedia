import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const game = await db.game.findUnique({
      where: { slug },
      include: { _count: { select: { playerProfiles: true, tournamentGames: true } } },
    });
    if (!game) return notFound("Jeu introuvable");
    return ok(game);
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
    const body = await request.json();
    const game = await db.game.update({ where: { slug }, data: body });
    return ok(game);
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
    await db.game.update({ where: { slug }, data: { isActive: false } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
