import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { paginated, created, serverError, getPagination } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const { page, limit, skip } = getPagination(sp);
    const tag = sp.get("tag") ?? undefined;
    // ?status=all|draft|published (défaut : published, usage public)
    const status = sp.get("status") ?? "published";

    const where = {
      ...(status === "all" ? {} : { isPublished: status !== "draft" }),
      ...(tag && { tags: { has: tag } }),
    };

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: status === "published" ? { publishedAt: "desc" } : { updatedAt: "desc" },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true,
          tags: true, publishedAt: true, authorName: true, isPublished: true, updatedAt: true,
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
