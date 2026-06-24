import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { noContent, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/payout-methods/[id] — supprimer un moyen de réception
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();

    const method = await db.playerPayoutMethod.findUnique({ where: { id } });
    if (!method) return notFound("Moyen de paiement introuvable");
    if (method.playerId !== user.player.id) return forbidden();

    // Désactivation logique (préserve l'historique des versements)
    await db.playerPayoutMethod.update({
      where: { id },
      data: { isActive: false },
    });

    return noContent();
  } catch (e) {
    return handleApiError(e);
  }
}
