import { db } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
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
  } catch {
    return serverError();
  }
}
