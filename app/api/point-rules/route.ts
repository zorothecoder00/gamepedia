import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, created, unauthorized, forbidden, handleApiError, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const game = sp.get("game") ?? undefined;
    const tier = sp.get("tier") ?? undefined;

    const rules = await db.pointRule.findMany({
      where: {
        ...(game && { game: { slug: game } }),
        ...(tier && { tier: tier as never }),
      },
      orderBy: [{ tier: "asc" }, { placement: "asc" }],
      include: { game: { select: { name: true, slug: true } } },
    });

    return ok(rules);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const body = await request.json();
    const rule = await db.pointRule.create({ data: body });
    return created(rule);
  } catch (e) {
    return handleApiError(e);
  }
}
