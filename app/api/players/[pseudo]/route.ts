import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ pseudo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;

    const player = await db.player.findUnique({
      where: { pseudo },
      include: {
        user: { select: { email: true, role: true } },
        gameProfiles: { include: { game: true } },
        teamMembers: {
          where: { leftAt: null },
          include: { team: { select: { id: true, name: true, tag: true, slug: true } } },
        },
        achievements: { include: { achievement: true } },
      },
    });

    if (!player) return notFound("Joueur introuvable");
    return ok(player);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;
    const body = await request.json();

    const player = await db.player.update({
      where: { pseudo },
      data: body,
    });

    return ok(player);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;
    await db.player.delete({ where: { pseudo } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
