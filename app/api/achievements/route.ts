import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, serverError } from "@/lib/api";

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
    const body = await request.json();
    const achievement = await db.achievement.create({ data: body });
    return created(achievement);
  } catch {
    return serverError();
  }
}
