import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

const VALID_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const { status } = await request.json() as { status: string };

    if (!VALID_STATUSES.includes(status)) {
      return badRequest(`Status invalide. Valeurs acceptées : ${VALID_STATUSES.join(", ")}`);
    }

    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const updated = await db.tournament.update({
      where: { slug },
      data: { status: status as never },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
