import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const season = await db.season.findUnique({ where: { id }, select: { id: true } });
    if (!season) return notFound("Saison introuvable");

    await db.season.update({
      where: { id },
      data: { isActive: false, endDate: new Date() },
    });

    return ok({ message: "Saison clôturée." });
  } catch {
    return serverError();
  }
}
