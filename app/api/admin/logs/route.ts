import { NextRequest } from "next/server";
import { ok, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

// TODO: connecter à un vrai système de logs (ex: table AdminLog en base)
export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const demoLogs = [
      { action: "TOURNAMENT_CREATED", detail: "Togo Valorant Open S3", user: "Admin", createdAt: new Date().toISOString() },
      { action: "PLAYER_VERIFIED", detail: "Phantom_TG", user: "Moderator1", createdAt: new Date().toISOString() },
      { action: "RESULT_SUBMITTED", detail: "Valorant Open S2 — Finale", user: "Admin", createdAt: new Date().toISOString() },
    ];

    return ok(demoLogs);
  } catch (e) {
    return handleApiError(e);
  }
}
