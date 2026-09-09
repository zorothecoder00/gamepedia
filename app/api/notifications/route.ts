import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, unauthorized, getPagination, handleApiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

// GET /api/notifications — liste paginée des notifications de l'utilisateur courant
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { page, limit, skip } = getPagination(request.nextUrl.searchParams);

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.notification.count({ where: { userId: user.id } }),
    ]);

    return paginated(notifications, total, page, limit);
  } catch (e) {
    return handleApiError(e);
  }
}
