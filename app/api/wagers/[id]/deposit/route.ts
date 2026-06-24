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
import { getAuthUser } from "@/lib/auth";
import { isParticipant } from "@/lib/wagers";
import type { PaymentMethodType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/deposit — déclarer le dépôt de sa mise (vers l'admin)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    if (wager.status !== "AWAITING_DEPOSITS") {
      return forbidden("Les dépôts ne sont pas ouverts pour ce défi.");
    }

    const body = await request.json();
    const { methodType, proofUrl, reference } = body as {
      methodType?: PaymentMethodType;
      proofUrl?: string;
      reference?: string;
    };
    if (!methodType) return badRequest("methodType est requis.");

    // Le dépôt vaut toujours la mise convenue
    const deposit = await db.wagerDeposit.upsert({
      where: { wagerId_playerId: { wagerId: id, playerId } },
      create: {
        wagerId: id,
        playerId,
        amount: wager.stakeAmount,
        methodType,
        proofUrl: proofUrl ?? null,
        reference: reference ?? null,
        status: "PENDING",
      },
      update: {
        amount: wager.stakeAmount,
        methodType,
        proofUrl: proofUrl ?? null,
        reference: reference ?? null,
        status: "PENDING",
      },
    });

    return ok(deposit);
  } catch (e) {
    return handleApiError(e);
  }
}
