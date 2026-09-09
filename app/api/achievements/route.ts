import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { playerAchievements: true } } },
    });
    return ok(achievements);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const body = await request.json();
    const achievement = await db.achievement.create({ data: body });
    return created(achievement);
  } catch (e) {
    return handleApiError(e);
  }
}
