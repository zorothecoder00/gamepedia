import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, serverError, getPagination } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const game = sp.get("game") ?? undefined;
    const category = sp.get("category") ?? undefined;

    const where = {
      isPublished: true,
      ...(game && { game: { slug: game } }),
      ...(category && { category }),
    };

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverUrl: true,
          category: true, publishedAt: true,
          author: { select: { username: true } },
        },
      }),
      db.article.count({ where }),
    ]);

    return paginated(articles, total, page, limit);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const article = await db.article.create({ data: body });
    return created(article);
  } catch {
    return serverError();
  }
}
