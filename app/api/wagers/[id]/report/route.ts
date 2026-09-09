import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
  tooManyRequests,
  handleApiError,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  isParticipant,
  resolveReports,
  markWagerPlayed,
  markWagerWon,
  notifyPlayer,
  canTransition,
  WagerError,
} from "@/lib/wagers";
import { parseBody, wagerReportSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

// POST /api/wagers/[id]/report — déclarer le résultat du match
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    const playerId = user.player.id;

    if (!checkRateLimit(`wager-report:${playerId}`, 20, 60_000)) {
      return tooManyRequests();
    }

    const wager = await db.wager.findUnique({
      where: { id },
      include: { reports: true },
    });
    if (!wager) return notFound("Défi introuvable");
    if (!isParticipant(wager, playerId)) return forbidden();
    // RESULT_REPORTED est un cas particulier : un joueur peut modifier sa
    // propre déclaration tant que l'adversaire n'a pas encore déclaré la
    // sienne (pas de changement de statut dans ce cas, donc hors de la
    // machine à états WAGER_TRANSITIONS qui ne modélise que les vraies
    // transitions de statut).
    const canReport =
      wager.status === "RESULT_REPORTED" || canTransition(wager.status, "RESULT_REPORTED");
    if (!canReport) {
      throw new WagerError("Le résultat ne peut pas être déclaré à ce stade.", 409);
    }

    const { claimedWinnerId, proofUrl, note } = await parseBody(request, wagerReportSchema);
    if (![wager.challengerId, wager.opponentId].includes(claimedWinnerId)) {
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
