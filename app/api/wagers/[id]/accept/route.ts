import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  assertCanWager,
  assertSameGameEligibility,
  assertTransition,
  notifyPlayer,
} from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/accept — rejoindre un défi
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const player = user.player;

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");

    // Défi direct : seul l'adversaire désigné peut accepter
    if (wager.opponentId && wager.opponentId !== player.id) {
      return forbidden("Ce défi est adressé à un autre joueur.");
    }
    if (wager.challengerId === player.id) {
      return forbidden("Vous ne pouvez pas accepter votre propre défi.");
    }

    assertTransition(wager.status, "ACCEPTED");
    await assertCanWager(player);
    await assertSameGameEligibility(wager.challengerId, player.id, wager.gameId);

    const updated = await db.wager.update({
      where: { id },
      data: {
        opponentId: player.id,
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    await notifyPlayer(wager.challengerId, {
      title: "Défi accepté",
      message: `${player.pseudo} a accepté votre défi « ${wager.title} ».`,
      link: `/wagers/${id}`,
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
