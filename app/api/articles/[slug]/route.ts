import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({
      where: { slug },
      include: { author: { select: { username: true } } },
    });
    if (!article || !article.isPublished) return notFound("Article introuvable");
    return ok(article);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const article = await db.article.update({ where: { slug }, data: body });
    return ok(article);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    await db.article.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
