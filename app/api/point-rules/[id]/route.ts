import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const body = await request.json();
    const rule = await db.pointRule.update({ where: { id }, data: body });
    return ok(rule);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const rule = await db.pointRule.findUnique({ where: { id }, select: { id: true } });
    if (!rule) return notFound("Règle introuvable");
    await db.pointRule.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
