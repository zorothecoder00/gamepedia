import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  created,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  handleApiError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { computePayout, notifyPlayer } from "@/lib/wagers";
import type { PaymentMethodType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/payout — l'admin reverse les gains au vainqueur
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (wager.status !== "AWAITING_PAYOUT" || !wager.winnerId) {
      return forbidden("Aucun versement en attente pour ce défi.");
    }

    const body = await request.json();
    const { methodType, proofUrl, note } = body as {
      methodType?: PaymentMethodType;
      proofUrl?: string;
      note?: string;
    };
    if (!methodType) return badRequest("methodType est requis.");

    const { commission, payout } = computePayout(
      wager.stakeAmount,
      wager.commissionRate,
    );

    const winnerId = wager.winnerId;

    const result = await db.$transaction(async (tx) => {
      const p = await tx.wagerPayout.create({
        data: {
          wagerId: id,
          recipientId: winnerId,
          amount: payout,
          commission,
          methodType,
          proofUrl: proofUrl ?? null,
          note: note ?? null,
          paidByUserId: user.id,
          paidByName: user.username,
        },
      });
      await tx.wager.update({
        where: { id },
        data: { status: "SETTLED", settledAt: new Date() },
      });
      return p;
    });

    await notifyPlayer(winnerId, {
      title: "Gains versés",
      message: `Vos gains (${payout} ${wager.currency}) ont été envoyés.`,
      link: `/wagers/${id}`,
    });

    return created(result);
  } catch (e) {
    return handleApiError(e);
  }
}
