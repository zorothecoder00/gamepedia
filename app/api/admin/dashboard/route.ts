import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const [
      totalPlayers,
      totalTournaments,
      totalMatches,
      totalArticles,
      ongoingTournaments,
      recentPlayers,
    ] = await Promise.all([
      db.player.count(),
      db.tournament.count(),
      db.match.count(),
      db.article.count({ where: { isPublished: true } }),
      db.tournament.findMany({
        where: { status: "ONGOING" },
        select: { id: true, name: true, slug: true, tier: true },
      }),
      db.player.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { pseudo: true, city: true, isVerified: true, createdAt: true },
      }),
    ]);

    return ok({
      kpis: { totalPlayers, totalTournaments, totalMatches, totalArticles },
      ongoingTournaments,
      recentPlayers,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
