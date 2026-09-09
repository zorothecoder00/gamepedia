import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, unauthorized, forbidden, handleApiError, serverError, getPagination } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, teamCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const game = sp.get("game") ?? undefined;
    const region = sp.get("region") ?? undefined;
    const search = sp.get("search") ?? undefined;
    // ?all=true → inclut les équipes désactivées (usage admin)
    const all = sp.get("all") === "true";

    const where = {
      ...(all ? {} : { isActive: true }),
      ...(region && { region: { contains: region, mode: "insensitive" as const } }),
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      ...(game && { members: { some: { player: { gameProfiles: { some: { game: { slug: game } } } } } } }),
    };

    const [teams, total] = await Promise.all([
      db.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { members: true } },
          members: {
            where: { leftAt: null },
            take: 5,
            include: { player: { select: { pseudo: true, isVerified: true } } },
          },
        },
      }),
      db.team.count({ where }),
    ]);

    return paginated(teams, total, page, limit);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const body = await parseBody(request, teamCreateSchema);
    const team = await db.team.create({ data: body });
    return created(team);
  } catch (e) {
    return handleApiError(e);
  }
}
