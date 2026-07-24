import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, player: { select: { id: true } } },
    });
    if (!user) return notFound("Utilisateur introuvable");
    if (!user.player) return notFound("Profil joueur introuvable");

    const player = await db.player.update({
      where: { id: user.player.id },
      data: { isVerified: true },
      select: { pseudo: true, isVerified: true },
    });

    return ok(player);
  } catch {
    return serverError();
  }
}
