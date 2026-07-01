import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, serverError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    // ?all=true → inclut les jeux désactivés (usage admin)
    const all = request.nextUrl.searchParams.get("all") === "true";
    const games = await db.game.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { playerProfiles: true, tournamentGames: true } },
      },
    });
    return ok(games);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const game = await db.game.create({ data: body });
    return created(game);
  } catch {
    return serverError();
  }
}
