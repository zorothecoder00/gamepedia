import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, tournamentGameCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

// GET /api/tournaments/[slug]/games — jeux associés à ce tournoi
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const games = await db.tournamentGame.findMany({
      where: { tournamentId: tournament.id },
      include: { game: { select: { name: true, slug: true, logo: true } } },
    });

    return ok(games);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/tournaments/[slug]/games — associer un jeu au tournoi (staff)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const { gameId } = await parseBody(request, tournamentGameCreateSchema);

    const tournamentGame = await db.tournamentGame.create({
      data: { tournamentId: tournament.id, gameId },
      include: { game: { select: { name: true, slug: true } } },
    });

    return created(tournamentGame);
  } catch (e) {
    return handleApiError(e);
  }
}
