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
import { getAuthUser } from "@/lib/auth";
import { isParticipant } from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

const DISPUTABLE = [
  "ONGOING",
  "AWAITING_RESULT",
  "RESULT_REPORTED",
  "AWAITING_PAYOUT",
];

// POST /api/wagers/[id]/dispute — ouvrir un litige
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    const wager = await db.wager.findUnique({ where: { id } });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    if (!DISPUTABLE.includes(wager.status)) {
      return forbidden("Aucun litige possible à ce stade.");
    }

    const body = await request.json();
    const { reason } = body as { reason?: string };
    if (!reason?.trim()) return badRequest("Un motif est requis.");

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
