import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({ where: { pseudo }, select: { id: true } });
    if (!player) return notFound("Joueur introuvable");

    const history = await db.teamMember.findMany({
      where: { playerId: player.id },
      orderBy: { joinedAt: "desc" },
      include: { team: { select: { id: true, name: true, tag: true, slug: true } } },
    });

    return ok(history);
  } catch {
    return serverError();
  }
}
