import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({ where: { slug }, select: { id: true, isPublished: true } });
    if (!article) return notFound("Article introuvable");

    const updated = await db.article.update({
      where: { slug },
      data: {
        isPublished: !article.isPublished,
        publishedAt: !article.isPublished ? new Date() : null,
      },
    });

    return ok({ isPublished: updated.isPublished });
  } catch {
    return serverError();
  }
}
