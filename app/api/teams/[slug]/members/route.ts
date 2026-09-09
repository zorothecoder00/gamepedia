import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, teamMemberCreateSchema } from "@/lib/validation";

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
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const team = await db.team.findUnique({ where: { slug }, select: { id: true } });
    if (!team) return notFound("Équipe introuvable");

    const { playerId, role } = await parseBody(request, teamMemberCreateSchema);

    const member = await db.teamMember.create({
      data: { teamId: team.id, playerId, role },
    });

    return created(member);
  } catch (e) {
    return handleApiError(e);
  }
}
