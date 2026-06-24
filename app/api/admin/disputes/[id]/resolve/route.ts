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
import {
  isParticipant,
  markWagerPlayed,
  markWagerWon,
  notifyPlayer,
} from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/disputes/[id]/resolve — trancher un litige (modération)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const body = await request.json();
    const { resolvedWinnerId, resolution } = body as {
      resolvedWinnerId?: string;
      resolution?: string;
    };
    if (!resolvedWinnerId || !resolution?.trim()) {
      return badRequest("resolvedWinnerId et resolution sont requis.");
    }

    const dispute = await db.wagerDispute.findUnique({
      where: { id },
      include: { wager: true },
    });
    if (!dispute) return notFound("Litige introuvable");
    if (dispute.status !== "OPEN") {
      return forbidden("Ce litige est déjà résolu.");
    }

    const wager = dispute.wager;
    if (!isParticipant(wager, resolvedWinnerId)) {
      return badRequest("Le vainqueur doit être un participant du défi.");
    }

    const participants = [wager.challengerId, wager.opponentId].filter(
      Boolean,
    ) as string[];

    await db.$transaction(async (tx) => {
      await tx.wagerDispute.update({
        where: { id },
        data: {
          status: "RESOLVED",
          resolvedByUserId: user.id,
          resolvedByName: user.username,
          resolvedWinnerId,
          resolution,
          resolvedAt: new Date(),
        },
      });
      await tx.wager.update({
        where: { id: wager.id },
        data: { status: "AWAITING_PAYOUT", winnerId: resolvedWinnerId },
      });
      await markWagerPlayed(tx, participants);
      await markWagerWon(tx, resolvedWinnerId);

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.username,
          action: "UPDATE",
          entityType: "MATCH",
          entityId: wager.id,
          entityName: wager.title,
          meta: { kind: "wager_dispute_resolved", resolvedWinnerId, resolution },
        },
      });
    });

    await notifyPlayer(resolvedWinnerId, {
      title: "Litige tranché en votre faveur",
      message: "Le versement de vos gains est en cours de traitement.",
      link: `/wagers/${wager.id}`,
    });

    return ok({ id, status: "RESOLVED", wagerStatus: "AWAITING_PAYOUT" });
  } catch (e) {
    return handleApiError(e);
  }
}
