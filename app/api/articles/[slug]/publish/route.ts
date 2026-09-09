import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

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
  } catch (e) {
    return handleApiError(e);
  }
}
