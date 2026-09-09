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
    const season = await db.season.findUnique({ where: { id }, select: { id: true, gameId: true } });
    if (!season) return notFound("Saison introuvable");

    // Une seule saison active PAR JEU : ne désactive que les autres
    // saisons du même jeu, pas celles des autres jeux.
    await db.$transaction([
      db.season.updateMany({
        where: { gameId: season.gameId, isActive: true, NOT: { id } },
        data: { isActive: false },
      }),
      db.season.update({ where: { id }, data: { isActive: true } }),
    ]);

    return ok({ message: "Saison activée." });
  } catch (e) {
    return handleApiError(e);
  }
}
