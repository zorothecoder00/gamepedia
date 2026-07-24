import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, userRoleSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");
    if (actor.id === id) return badRequest("Vous ne pouvez pas changer votre propre rôle.");

    const { role } = await parseBody(request, userRoleSchema);

    const user = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return notFound("Utilisateur introuvable");

    const updated = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
