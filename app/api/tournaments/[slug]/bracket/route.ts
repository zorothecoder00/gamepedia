import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({ where: { slug }, select: { id: true } });
    if (!tournament) return notFound("Tournoi introuvable");

    const stages = await db.tournamentStage.findMany({
      where: { tournamentId: tournament.id },
      orderBy: { stageNumber: "asc" },
      include: {
        matches: {
          orderBy: { scheduledAt: "asc" },
          include: {
            participants: {
              include: {
                team: { select: { name: true, tag: true } },
              },
            },
          },
        },
      },
    });

    return ok(stages);
  } catch {
    return serverError();
  }
}
