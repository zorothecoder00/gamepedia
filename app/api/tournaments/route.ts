import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, serverError, getPagination } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const status = sp.get("status") ?? undefined;
    const game = sp.get("game") ?? undefined;
    const tier = sp.get("tier") ?? undefined;
    const year = sp.get("year") ? Number(sp.get("year")) : undefined;

    const where = {
      ...(status && { status: status as never }),
      ...(tier && { tier: tier as never }),
      ...(game && { games: { some: { game: { slug: game } } } }),
      ...(year && {
        startDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      }),
    };

    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: {
          games: { include: { game: { select: { name: true, slug: true } } } },
          _count: { select: { participants: true } },
        },
      }),
      db.tournament.count({ where }),
    ]);

    return paginated(tournaments, total, page, limit);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tournament = await db.tournament.create({ data: body });
    return created(tournament);
  } catch {
    return serverError();
  }
}
