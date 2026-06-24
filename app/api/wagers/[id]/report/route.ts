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
import {
  isParticipant,
  resolveReports,
  markWagerPlayed,
  markWagerWon,
  notifyPlayer,
} from "@/lib/wagers";

type Params = { params: Promise<{ id: string }> };

const REPORTABLE = ["ONGOING", "AWAITING_RESULT", "RESULT_REPORTED"];

// POST /api/wagers/[id]/report — déclarer le résultat du match
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    const wager = await db.wager.findUnique({
      where: { id },
      include: { reports: true },
    });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    if (!REPORTABLE.includes(wager.status)) {
      return forbidden("Le résultat ne peut pas être déclaré à ce stade.");
    }

    const body = await request.json();
    const { claimedWinnerId, proofUrl, note } = body as {
      claimedWinnerId?: string;
      proofUrl?: string;
      note?: string;
    };
    if (
      !claimedWinnerId ||
      ![wager.challengerId, wager.opponentId].includes(claimedWinnerId)
    ) {
      return badRequest("claimedWinnerId doit être l'un des deux participants.");
    }

    // Enregistre / met à jour la déclaration de ce joueur
    await db.wagerReport.upsert({
      where: { wagerId_reporterId: { wagerId: id, reporterId: playerId } },
      create: {
        wagerId: id,
        reporterId: playerId,
        claimedWinnerId,
        proofUrl: proofUrl ?? null,
        note: note ?? null,
      },
      update: { claimedWinnerId, proofUrl: proofUrl ?? null, note: note ?? null },
    });

    const reports = await db.wagerReport.findMany({ where: { wagerId: id } });
    const resolution = resolveReports(reports);

    const participants = [wager.challengerId, wager.opponentId].filter(
      Boolean,
    ) as string[];

    let nextStatus = "RESULT_REPORTED";

    await db.$transaction(async (tx) => {
      if (!resolution.complete) {
        await tx.wager.update({
          where: { id },
          data: { status: "RESULT_REPORTED" },
        });
        return;
      }
      if (resolution.agree && resolution.winnerId) {
        // Accord : on désigne le vainqueur et on attend le versement admin
        nextStatus = "AWAITING_PAYOUT";
        await tx.wager.update({
          where: { id },
          data: { status: "AWAITING_PAYOUT", winnerId: resolution.winnerId },
        });
        await markWagerPlayed(tx, participants);
        await markWagerWon(tx, resolution.winnerId);
      } else {
        // Désaccord : litige automatique
        nextStatus = "DISPUTED";
        await tx.wager.update({ where: { id }, data: { status: "DISPUTED" } });
        await tx.wagerDispute.upsert({
          where: { wagerId: id },
          create: {
            wagerId: id,
            openedById: playerId,
            reason: "Déclarations de résultat contradictoires.",
          },
          update: {},
        });
      }
    });

    // Notifications hors transaction
    if (nextStatus === "AWAITING_PAYOUT" && resolution.winnerId) {
      await notifyPlayer(resolution.winnerId, {
        title: "Vous avez gagné le défi !",
        message: "Le versement de vos gains est en cours de traitement.",
        link: `/wagers/${id}`,
      });
    } else if (nextStatus === "RESULT_REPORTED") {
      const other = participants.find((p) => p !== playerId);
      if (other) {
        await notifyPlayer(other, {
          title: "Résultat à confirmer",
          message: "Votre adversaire a déclaré le résultat. Déclarez le vôtre.",
          link: `/wagers/${id}`,
        });
      }
    }

    return ok({ id, status: nextStatus });
  } catch (e) {
    return handleApiError(e);
  }
}
