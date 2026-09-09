import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id]/read — marque une notification comme lue
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) return notFound("Notification introuvable");
    if (notification.userId !== user.id) return forbidden();

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
