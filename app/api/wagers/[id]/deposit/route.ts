import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  notFound,
  unauthorized,
  forbidden,
  tooManyRequests,
  handleApiError,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isParticipant, WagerError } from "@/lib/wagers";
import { parseBody, wagerDepositSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/deposit — déclarer le dépôt de sa mise (vers l'admin)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    if (!checkRateLimit(`wager-deposit:${playerId}`, 20, 60_000)) {
      return tooManyRequests();
    }

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    // Les dépôts ne modifient pas wager.status (ce n'est pas une transition
    // de la machine à états) — c'est une simple garde d'état courant.
    if (wager.status !== "AWAITING_DEPOSITS") {
      throw new WagerError("Les dépôts ne sont pas ouverts pour ce défi.", 409);
    }

    const { methodType, proofUrl, reference } = await parseBody(request, wagerDepositSchema);

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
