import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, serverError, getPagination } from "@/lib/api";

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
    const body = await request.json();
    const team = await db.team.create({ data: body });
    return created(team);
  } catch {
    return serverError();
  }
}
