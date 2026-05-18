import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, serverError } from "@/lib/api";

export async function GET() {
  try {
    const games = await db.game.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { playerProfiles: true, tournaments: true } },
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
