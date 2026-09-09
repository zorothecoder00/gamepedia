import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;
    const season = await db.season.findUnique({ where: { id }, select: { id: true } });
    if (!season) return notFound("Saison introuvable");

    await db.season.update({
      where: { id },
      data: { isActive: false, endDate: new Date() },
    });

    return ok({ message: "Saison clôturée." });
  } catch (e) {
    return handleApiError(e);
  }
}
