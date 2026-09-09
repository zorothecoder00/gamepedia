import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  created,
  notFound,
  unauthorized,
  forbidden,
  tooManyRequests,
  handleApiError,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isParticipant, assertTransition } from "@/lib/wagers";
import { parseBody, wagerDisputeSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/dispute — ouvrir un litige
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    if (!checkRateLimit(`wager-dispute:${playerId}`, 20, 60_000)) {
      return tooManyRequests();
    }

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    assertTransition(wager.status, "DISPUTED");

    const { reason } = await parseBody(request, wagerDisputeSchema);

    const dispute = await db.$transaction(async (tx) => {
      const d = await tx.wagerDispute.upsert({
        where: { wagerId: id },
        create: { wagerId: id, openedById: playerId, reason },
        update: { reason, status: "OPEN" },
      });
      await tx.wager.update({ where: { id }, data: { status: "DISPUTED" } });
      return d;
    });

    return created(dispute);
  } catch (e) {
    return handleApiError(e);
  }
}
