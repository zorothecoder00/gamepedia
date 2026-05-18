import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const tournament = await db.tournament.findUnique({
      where: { slug },
      include: {
        games: { include: { game: true } },
        stages: { orderBy: { order: "asc" } },
        participants: {
          include: {
            player: { select: { pseudo: true, city: true } },
            team: { select: { name: true, tag: true, slug: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });
    if (!tournament) return notFound("Tournoi introuvable");
    return ok(tournament);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const tournament = await db.tournament.update({ where: { slug }, data: body });
    return ok(tournament);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    await db.tournament.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
