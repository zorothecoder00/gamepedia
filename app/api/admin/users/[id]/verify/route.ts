import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
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
