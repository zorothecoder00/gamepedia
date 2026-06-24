import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import {
  paginated,
  unauthorized,
  forbidden,
  getPagination,
  handleApiError,
} from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

// GET /api/admin/disputes — litiges à traiter (modération)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!isStaff(user.role)) return forbidden("Réservé à l'administration.");

    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const status = sp.get("status") ?? "OPEN";

    const where = { status: status as never };

    const [disputes, total] = await Promise.all([
      db.wagerDispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          openedBy: { select: { pseudo: true } },
          wager: {
            include: {
              game: { select: { name: true, slug: true } },
              challenger: { select: { id: true, pseudo: true } },
              opponent: { select: { id: true, pseudo: true } },
              reports: true,
            },
          },
        },
      }),
      db.wagerDispute.count({ where }),
    ]);

    return paginated(disputes, total, page, limit);
  } catch (e) {
    return handleApiError(e);
  }
}
