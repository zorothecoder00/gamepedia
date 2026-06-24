import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  handleApiError,
} from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { PaymentMethodType } from "@prisma/client";

type Params = { params: Promise<{ pseudo: string }> };

// GET /api/players/[pseudo]/payout-methods — coordonnées de réception du joueur
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    if (user.player.pseudo !== pseudo) return forbidden();

    const methods = await db.playerPayoutMethod.findMany({
      where: { playerId: user.player.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(methods);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/players/[pseudo]/payout-methods — ajouter un moyen de réception
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { pseudo } = await params;
    const user = await getAuthUser(request);
    if (!user?.player) return unauthorized();
    if (user.player.pseudo !== pseudo) return forbidden();

    const body = await request.json();
    const { type, label, details, isDefault } = body as {
      type?: PaymentMethodType;
      label?: string;
      details?: unknown;
      isDefault?: boolean;
    };
    if (!type || !label || !details) {
      return badRequest("type, label et details sont requis.");
    }

    const method = await db.$transaction(async (tx) => {
      if (isDefault) {
        await tx.playerPayoutMethod.updateMany({
          where: { playerId: user.player!.id },
          data: { isDefault: false },
        });
      }
      return tx.playerPayoutMethod.create({
        data: {
          playerId: user.player!.id,
          type,
          label,
          details: details as object,
          isDefault: isDefault ?? false,
        },
      });
    });

    return created(method);
  } catch (e) {
    return handleApiError(e);
  }
}
