import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, forbidden, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { recalculateAll } from "@/lib/rankings";

// POST /api/rankings/recalculate — recalcule tous les classements (staff)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const result = await recalculateAll();

    await db.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.username,
        action: "RECALCULATE_RANKING",
        entityType: "TOURNAMENT",
        entityId: "all",
        entityName: "Tous les classements",
        meta: { kind: "recalculate_all", ...result },
      },
    });

    return ok({ message: `Classements recalculés : ${result.entries} entrées sur ${result.seasons} saison(s).`, ...result });
  } catch {
    return serverError();
  }
}
