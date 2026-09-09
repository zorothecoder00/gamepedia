import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, playerUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({
      where: { pseudo },
      include: {
        user: { select: { email: true, role: true } },
        gameProfiles: { include: { game: true } },
        teamMemberships: {
          where: { leftAt: null },
          include: { team: { select: { id: true, name: true, tag: true, slug: true } } },
        },
        achievements: { include: { achievement: true } },
      },
    });

    if (!player) return notFound("Joueur introuvable");
    return ok(player);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { pseudo } = await params;
    const body = await parseBody(request, playerUpdateSchema);

    const player = await db.player.update({
      where: { pseudo },
      data: body,
    });

    return ok(player);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { pseudo } = await params;
    await db.player.delete({ where: { pseudo } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
