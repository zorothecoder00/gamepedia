import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const season = await db.season.findUnique({ where: { id } });
    if (!season) return notFound("Saison introuvable");
    return ok(season);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const season = await db.season.update({ where: { id }, data: body });
    return ok(season);
  } catch {
    return serverError();
  }
}
