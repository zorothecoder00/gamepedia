import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
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
  } catch {
    return serverError();
  }
}
