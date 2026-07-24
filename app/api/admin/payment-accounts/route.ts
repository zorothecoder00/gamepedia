import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  ok,
  created,
  unauthorized,
  forbidden,
  handleApiError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, paymentAccountCreateSchema } from "@/lib/validation";

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

    const { type, label, details, instructions } = await parseBody(request, paymentAccountCreateSchema);

    const account = await db.platformPaymentAccount.create({
      data: {
        type,
        label,
        details,
        instructions: instructions ?? null,
      },
    });
    return created(account);
  } catch (e) {
    return handleApiError(e);
  }
}
