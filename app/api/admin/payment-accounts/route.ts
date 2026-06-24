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
import { getAuthUser, isStaff } from "@/lib/auth";
import type { PaymentMethodType } from "@prisma/client";

// GET /api/admin/payment-accounts — comptes où déposer (visibles aux joueurs connectés)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const accounts = await db.platformPaymentAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return ok(accounts);
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/admin/payment-accounts — créer un compte de dépôt (admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const body = await request.json();
    const { type, label, details, instructions } = body as {
      type?: PaymentMethodType;
      label?: string;
      details?: unknown;
      instructions?: string;
    };
    if (!type || !label || !details) {
      return badRequest("type, label et details sont requis.");
    }

    const account = await db.platformPaymentAccount.create({
      data: {
        type,
        label,
        details: details as object,
        instructions: instructions ?? null,
      },
    });
    return created(account);
  } catch (e) {
    return handleApiError(e);
  }
}
