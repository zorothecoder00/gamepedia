import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, notFound, serverError, getPagination } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const game = await db.game.findUnique({ where: { slug }, select: { id: true } });
    if (!game) return notFound("Jeu introuvable");

    const [profiles, total] = await Promise.all([
      db.playerGameProfile.findMany({
        where: { gameId: game.id },
        skip,
        take: limit,
        include: { player: { select: { id: true, pseudo: true, city: true, isVerified: true } } },
      }),
      db.playerGameProfile.count({ where: { gameId: game.id } }),
    ]);

    return paginated(profiles, total, page, limit);
  } catch {
    return serverError();
  }
}
