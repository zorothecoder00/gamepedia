import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const match = await db.match.findUnique({
      where: { id },
      include: {
        stage: { include: { tournament: { select: { name: true, slug: true } } } },
        participants: {
          include: {
            player: { select: { pseudo: true } },
            team: { select: { name: true, tag: true } },
          },
        },
      },
    });
    if (!match) return notFound("Match introuvable");
    return ok(match);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const match = await db.match.update({ where: { id }, data: body });
    return ok(match);
  } catch {
    return serverError();
  }
}
