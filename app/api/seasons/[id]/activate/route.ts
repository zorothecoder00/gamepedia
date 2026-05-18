import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const season = await db.season.findUnique({ where: { id }, select: { id: true } });
    if (!season) return notFound("Saison introuvable");

    // Désactiver toutes les autres saisons, activer celle-ci
    await db.$transaction([
      db.season.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      db.season.update({ where: { id }, data: { isActive: true } }),
    ]);

    return ok({ message: "Saison activée." });
  } catch {
    return serverError();
  }
}
