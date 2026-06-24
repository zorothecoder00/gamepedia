import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isParticipant, opponentOf, notifyPlayer } from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/agree — confirmer les termes du défi
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    if (wager.status !== "ACCEPTED") {
      return forbidden("Les termes ne peuvent être confirmés qu'après acceptation.");
    }

    const isChallenger = wager.challengerId === playerId;
    const challengerAgreed = isChallenger ? true : wager.challengerAgreed;
    const opponentAgreed = isChallenger ? wager.opponentAgreed : true;
    const bothAgreed = challengerAgreed && opponentAgreed;

    const updated = await db.wager.update({
      where: { id },
      data: {
        challengerAgreed,
        opponentAgreed,
        ...(bothAgreed && { status: "AWAITING_DEPOSITS" }),
      },
    });

    if (bothAgreed) {
      const other = opponentOf(wager, playerId);
      if (other) {
        await notifyPlayer(other, {
          title: "Dépôt requis",
          message: "Les termes sont validés. Déposez votre mise pour lancer le défi.",
          link: `/wagers/${id}`,
        });
      }
    }

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
