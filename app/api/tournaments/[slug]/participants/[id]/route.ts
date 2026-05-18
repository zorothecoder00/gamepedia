import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string; id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const participant = await db.tournamentParticipant.findUnique({ where: { id }, select: { id: true } });
    if (!participant) return notFound("Participant introuvable");

    await db.tournamentParticipant.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return serverError();
  }
}
