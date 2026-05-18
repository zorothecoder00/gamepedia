import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const rule = await db.pointRule.update({ where: { id }, data: body });
    return ok(rule);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const rule = await db.pointRule.findUnique({ where: { id }, select: { id: true } });
    if (!rule) return notFound("Règle introuvable");
    await db.pointRule.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
