import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({ where: { id }, select: { id: true } });
    if (!match) return notFound("Match introuvable");

    const performances = await db.playerMatchPerformance.findMany({
      where: { matchId: id },
      include: { player: { select: { pseudo: true } } },
    });

    return ok(performances);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({ where: { id }, select: { id: true } });
    if (!match) return notFound("Match introuvable");

    const body = await request.json();
    const performance = await db.playerMatchPerformance.create({
      data: { ...body, matchId: id },
    });

    return created(performance);
  } catch {
    return serverError();
  }
}
