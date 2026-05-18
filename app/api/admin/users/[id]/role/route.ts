import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const VALID_ROLES = ["ADMIN", "MODERATOR", "PLAYER", "VISITOR"];

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { role } = await request.json() as { role: string };

    if (!VALID_ROLES.includes(role)) {
      return badRequest(`Rôle invalide. Valeurs : ${VALID_ROLES.join(", ")}`);
    }

    const user = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return notFound("Utilisateur introuvable");

    const updated = await db.user.update({
      where: { id },
      data: { role: role as never },
      select: { id: true, username: true, role: true },
    });

    return ok(updated);
  } catch {
    return serverError();
  }
}
