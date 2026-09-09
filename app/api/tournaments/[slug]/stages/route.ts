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

    const stages = await db.tournamentStage.findMany({
      where: { tournamentId: tournament.id },
      orderBy: { stageNumber: "asc" },
      include: { _count: { select: { matches: true } } },
    });

    return ok(stages);
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

    const body = await request.json();
    const stage = await db.tournamentStage.create({
      data: { ...body, tournamentId: tournament.id },
    });

    return created(stage);
  } catch (e) {
    return handleApiError(e);
  }
}
