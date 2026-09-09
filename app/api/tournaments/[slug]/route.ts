import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, tournamentUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({
      where: { slug },
      include: {
        games: { include: { game: true } },
        stages: { orderBy: { stageNumber: "asc" } },
        participants: {
          include: {
            player: { select: { pseudo: true, city: true } },
            team: { select: { name: true, tag: true, slug: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });
    if (!tournament) return notFound("Tournoi introuvable");
    return ok(tournament);
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
    const body = await parseBody(request, tournamentUpdateSchema);
    const tournament = await db.tournament.update({
      where: { slug },
      data: { ...body, sponsors: body.sponsors as object[] | undefined },
    });
    return ok(tournament);
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
    await db.tournament.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
