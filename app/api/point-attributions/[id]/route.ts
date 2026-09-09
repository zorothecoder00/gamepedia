import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const attribution = await db.pointAttribution.findUnique({ where: { id }, select: { id: true } });
    if (!attribution) return notFound("Attribution introuvable");

    await db.pointAttribution.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
