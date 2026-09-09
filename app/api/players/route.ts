import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, unauthorized, forbidden, handleApiError, serverError, getPagination } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, playerCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const search = sp.get("search") ?? undefined;
    const game = sp.get("game") ?? undefined;
    const city = sp.get("city") ?? undefined;

    const where = {
      ...(search && { pseudo: { contains: search, mode: "insensitive" as const } }),
      ...(city && { city: { contains: city, mode: "insensitive" as const } }),
      ...(game && { gameProfiles: { some: { game: { slug: game } } } }),
    };

    const [players, total] = await Promise.all([
      db.player.findMany({
        where,
        skip,
        take: limit,
        orderBy: { pseudo: "asc" },
        select: {
          id: true, pseudo: true, city: true, region: true, isVerified: true, isActive: true,
          gameProfiles: { select: { game: { select: { name: true, slug: true } } } },
          teamMemberships: {
            where: { leftAt: null },
            select: { team: { select: { name: true, tag: true, slug: true } } },
          },
        },
      }),
      db.player.count({ where }),
    ]);

    return paginated(players, total, page, limit);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { pseudo, city, region, userId } = await parseBody(request, playerCreateSchema);

    const player = await db.player.create({
      data: { pseudo, city, region, userId },
    });

    return created(player);
  } catch (e) {
    return handleApiError(e);
  }
}
