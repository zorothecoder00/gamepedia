import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, serverError } from "@/lib/api";

export async function GET() {
  try {
    const seasons = await db.season.findMany({
      orderBy: { startDate: "desc" },
      include: {
        game: { select: { name: true, slug: true } },
        _count: { select: { rankingEntries: true } },
      },
    });
    return ok(seasons);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const season = await db.season.create({ data: body });
    return created(season);
  } catch {
    return serverError();
  }
}
