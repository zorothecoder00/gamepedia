import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({
      where: { slug },
      include: {
        members: {
          where: { leftAt: null },
          include: { player: { select: { id: true, pseudo: true, city: true, isVerified: true } } },
        },
        _count: { select: { members: true, participations: true } },
      },
    });
    if (!team) return notFound("Équipe introuvable");
    return ok(team);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const team = await db.team.update({ where: { slug }, data: body });
    return ok(team);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    await db.team.update({ where: { slug }, data: { isActive: false } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
