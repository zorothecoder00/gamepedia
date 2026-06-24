import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  handleApiError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { bothDepositsConfirmed, notifyPlayer } from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/deposit/confirm — l'admin confirme la réception d'un dépôt
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const body = await request.json();
    const { playerId } = body as { playerId?: string };
    if (!playerId) return badRequest("playerId est requis.");

    const wager = await db.wager.findUnique({
      where: { id },
      include: { deposits: true },
    });
    if (!wager) return notFound("Défi introuvable");
    if (wager.status !== "AWAITING_DEPOSITS") {
      return forbidden("Le défi n'est pas en attente de dépôts.");
    }

    const deposit = wager.deposits.find((d) => d.playerId === playerId);
    if (!deposit) return notFound("Dépôt introuvable pour ce joueur.");

    await db.wagerDeposit.update({
      where: { id: deposit.id },
      data: {
        status: "CONFIRMED",
        confirmedByUserId: user.id,
        confirmedByName: user.username,
        confirmedAt: new Date(),
      },
    });

    // Recharge l'état des dépôts pour décider du passage en ONGOING
    const refreshed = await db.wagerDeposit.findMany({
      where: { wagerId: id },
      select: { status: true },
    });

    let status = wager.status as string;
    if (bothDepositsConfirmed(refreshed)) {
      await db.wager.update({ where: { id }, data: { status: "ONGOING" } });
      status = "ONGOING";
      await Promise.all([
        notifyPlayer(wager.challengerId, {
          title: "Le défi commence !",
          message: "Les deux mises sont validées. Jouez votre match.",
          link: `/wagers/${id}`,
        }),
        wager.opponentId
          ? notifyPlayer(wager.opponentId, {
              title: "Le défi commence !",
              message: "Les deux mises sont validées. Jouez votre match.",
              link: `/wagers/${id}`,
            })
          : Promise.resolve(),
      ]);
    }

    return ok({ depositId: deposit.id, wagerStatus: status });
  } catch (e) {
    return handleApiError(e);
  }
}
