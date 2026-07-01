import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, notFound, unauthorized, forbidden, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { attributeTournamentPoints, AttributionError } from "@/lib/points";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const attributions = await db.pointAttribution.findMany({
      where: { tournamentId: tournament.id },
      include: {
        player: { select: { pseudo: true } },
        team: { select: { name: true, tag: true } },
      },
    });

    return ok(attributions);
  } catch {
    return serverError();
  }
}

// POST /api/point-attributions/tournament/[slug]
// Attribue les points du tournoi depuis les placements finaux et
// recalcule le classement de la saison (staff).
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const tournament = await db.tournament.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!tournament) return notFound("Tournoi introuvable");

    const result = await attributeTournamentPoints(tournament.id);

    await db.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.username,
        action: "RECALCULATE_RANKING",
        entityType: "TOURNAMENT",
        entityId: tournament.id,
        entityName: tournament.name,
        meta: { kind: "attribute_points", ...result },
      },
    });

    return ok({
      message: `${result.created} attribution(s) créée(s), classement recalculé (${result.entries} entrées).`,
      ...result,
    });
  } catch (e) {
    if (e instanceof AttributionError) return badRequest(e.message);
    return serverError();
  }
}
