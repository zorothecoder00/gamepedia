import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isParticipant, opponentOf, assertTransition, notifyPlayer } from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/cancel — annuler un défi (avant le match)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    const wager = await db.wager.findUnique({
      where: { id },
      include: { deposits: true },
    });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();

    assertTransition(wager.status, "CANCELLED");

    await db.$transaction(async (tx) => {
      // Rembourse les dépôts déjà déclarés/confirmés
      if (wager.deposits.length > 0) {
        await tx.wagerDeposit.updateMany({
          where: { wagerId: id },
          data: { status: "REFUNDED" },
        });
      }
      await tx.wager.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    });

    const other = opponentOf(wager, playerId);
    if (other) {
      await notifyPlayer(other, {
        title: "Défi annulé",
        message: `Le défi « ${wager.title} » a été annulé.`,
        link: `/wagers/${id}`,
      });
    }

    return ok({ id, status: "CANCELLED" });
  } catch (e) {
    return handleApiError(e);
  }
}
