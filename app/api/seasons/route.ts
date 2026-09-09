import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, seasonCreateSchema } from "@/lib/validation";

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
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const body = await parseBody(request, seasonCreateSchema);
    const season = await db.season.create({ data: body });
    return created(season);
  } catch (e) {
    return handleApiError(e);
  }
}
