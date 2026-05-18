import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, serverError, getPagination } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const search = sp.get("search") ?? undefined;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true },
      }),
      db.user.count({ where }),
    ]);

    return paginated(users, total, page, limit);
  } catch {
    return serverError();
  }
}
