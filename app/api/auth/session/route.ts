import { NextRequest } from "next/server";
import { ok, unauthorized } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

// GET /api/auth/session — vérification légère de session (isActive + rôle
// courant). Utilisée en interne par middleware.ts pour revalider les JWT
// « staff » : l'Edge runtime ne peut pas interroger Prisma directement,
// donc middleware.ts délègue la vérification live à cette route Node.
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  return ok({ role: user.role });
}
