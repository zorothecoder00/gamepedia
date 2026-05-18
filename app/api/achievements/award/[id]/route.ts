import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const award = await db.playerAchievement.findUnique({ where: { id }, select: { id: true } });
    if (!award) return notFound("Attribution introuvable");

    await db.playerAchievement.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
