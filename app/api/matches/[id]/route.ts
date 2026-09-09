import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, matchUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        stage: { include: { tournament: { select: { name: true, slug: true } } } },
        participants: {
          include: {
            team: { select: { name: true, tag: true } },
          },
        },
      },
    });
    if (!match) return notFound("Match introuvable");
    return ok(match);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const body = await parseBody(request, matchUpdateSchema);
    const match = await db.match.update({ where: { id }, data: body });
    return ok(match);
  } catch (e) {
    return handleApiError(e);
  }
}
