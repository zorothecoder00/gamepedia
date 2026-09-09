import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const participants = await db.tournamentParticipant.findMany({
      where: { tournamentId: tournament.id },
      include: {
        player: { select: { pseudo: true, city: true, isVerified: true } },
        team: { select: { name: true, tag: true, slug: true } },
      },
      orderBy: { registeredAt: "asc" },
    });

    return ok(participants);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const body = await request.json() as { playerId?: string; teamId?: string };

    const participant = await db.tournamentParticipant.create({
      data: { tournamentId: tournament.id, ...body },
    });

    return created(participant);
  } catch (e) {
    return handleApiError(e);
  }
}
