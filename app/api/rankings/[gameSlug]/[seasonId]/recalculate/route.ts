import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { recalculateSeason } from "@/lib/rankings";

type Params = { params: Promise<{ gameSlug: string; seasonId: string }> };

// POST /api/rankings/[gameSlug]/[seasonId]/recalculate — recalcule une saison (staff)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { gameSlug, seasonId } = await params;

    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const [game, season] = await Promise.all([
      db.game.findUnique({ where: { slug: gameSlug }, select: { id: true, name: true } }),
      db.season.findUnique({ where: { id: seasonId }, select: { id: true, gameId: true, name: true } }),
    ]);

    if (!game) return notFound("Jeu introuvable");
    if (!season) return notFound("Saison introuvable");
    if (season.gameId !== game.id) {
      return badRequest("Cette saison n'appartient pas à ce jeu.");
    }

    const entries = await recalculateSeason(seasonId);

    await db.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.username,
        action: "RECALCULATE_RANKING",
        entityType: "TOURNAMENT",
        entityId: seasonId,
        entityName: `${game.name} — ${season.name}`,
        meta: { kind: "recalculate_season", entries },
      },
    });

    return ok({ message: `Classement recalculé : ${entries} entrée(s).`, entries });
  } catch {
    return serverError();
  }
}
