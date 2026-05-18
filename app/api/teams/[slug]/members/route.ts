import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const members = await db.teamMember.findMany({
      where: { teamId: team.id },
      orderBy: { joinedAt: "desc" },
      include: { player: { select: { id: true, pseudo: true, city: true, isVerified: true } } },
    });

    return ok(members);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const { playerId, role } = await request.json() as { playerId: string; role?: string };

    const member = await db.teamMember.create({
      data: { teamId: team.id, playerId, role },
    });

    return created(member);
  } catch {
    return serverError();
  }
}
