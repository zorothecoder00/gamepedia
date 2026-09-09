import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

// PATCH /api/notifications/read-all — marque toutes les notifications comme lues
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { count } = await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return ok({ count });
  } catch (e) {
    return handleApiError(e);
  }
}
