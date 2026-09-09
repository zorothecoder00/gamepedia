import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";
import { parseBody, articleUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({ where: { slug } });
    if (!article) return notFound("Article introuvable");
    // Les brouillons ne sont visibles que par le staff (pour l'édition)
    if (!article.isPublished) {
      const user = await getAuthUser(request);
      if (!user || !isStaff(user.role)) return notFound("Article introuvable");
    }
    return ok(article);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    const body = await parseBody(request, articleUpdateSchema);
    const article = await db.article.update({ where: { slug }, data: body });
    return ok(article);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const { slug } = await params;
    await db.article.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
