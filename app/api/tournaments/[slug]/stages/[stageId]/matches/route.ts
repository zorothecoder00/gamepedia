import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string; stageId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { stageId } = await params;
    const stage = await db.tournamentStage.findUnique({ where: { id: stageId }, select: { id: true } });
    if (!stage) return notFound("Phase introuvable");

    const matches = await db.match.findMany({
      where: { stageId },
      orderBy: { scheduledAt: "asc" },
      include: {
        participants: {
          include: {
            player: { select: { pseudo: true } },
            team: { select: { name: true, tag: true } },
          },
        },
      },
    });

    return ok(matches);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { stageId } = await params;
    const stage = await db.tournamentStage.findUnique({ where: { id: stageId }, select: { id: true } });
    if (!stage) return notFound("Phase introuvable");

    const body = await request.json();
    const match = await db.match.create({ data: { ...body, stageId } });
    return created(match);
  } catch {
    return serverError();
  }
}
