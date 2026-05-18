import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string; id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const participant = await db.tournamentParticipant.findUnique({ where: { id }, select: { id: true } });
    if (!participant) return notFound("Participant introuvable");

    const updated = await db.tournamentParticipant.update({
      where: { id },
      data: { isConfirmed: true },
    });

    return ok(updated);
  } catch {
    return serverError();
  }
}
