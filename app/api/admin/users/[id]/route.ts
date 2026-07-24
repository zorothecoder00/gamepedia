import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  handleApiError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, userActiveSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id] — activer/désactiver un compte (staff)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");
    if (actor.id === id) return badRequest("Vous ne pouvez pas désactiver votre propre compte.");

    const { isActive } = await parseBody(request, userActiveSchema);

    const user = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return notFound("Utilisateur introuvable");

    const updated = await db.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, username: true, isActive: true },
    });

    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.username,
        action: isActive ? "UNSUSPEND" : "SUSPEND",
        entityType: "PLAYER",
        entityId: id,
        entityName: updated.username,
        meta: { kind: "user_active_toggle", isActive },
      },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
