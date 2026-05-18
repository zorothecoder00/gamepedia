import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ slug: string; stageId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { stageId } = await params;
    const stage = await db.tournamentStage.findUnique({
      where: { id: stageId },
      include: { _count: { select: { matches: true } } },
    });
    if (!stage) return notFound("Phase introuvable");
    return ok(stage);
  } catch {
    return serverError();
  }
}
