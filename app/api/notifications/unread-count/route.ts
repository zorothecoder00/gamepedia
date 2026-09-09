import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

// GET /api/notifications/unread-count — compteur pour le badge de la cloche
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const count = await db.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return ok({ count });
  } catch (e) {
    return handleApiError(e);
  }
}
