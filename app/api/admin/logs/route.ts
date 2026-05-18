import { ok } from "@/lib/api";

// TODO: connecter à un vrai système de logs (ex: table AdminLog en base)
export async function GET() {
  const demoLogs = [
    { action: "TOURNAMENT_CREATED", detail: "Togo Valorant Open S3", user: "Admin", createdAt: new Date().toISOString() },
    { action: "PLAYER_VERIFIED", detail: "Phantom_TG", user: "Moderator1", createdAt: new Date().toISOString() },
    { action: "RESULT_SUBMITTED", detail: "Valorant Open S2 — Finale", user: "Admin", createdAt: new Date().toISOString() },
  ];

  return ok(demoLogs);
}
