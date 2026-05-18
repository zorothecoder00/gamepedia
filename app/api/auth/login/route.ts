import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return badRequest("email et password sont requis");
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, role: true, passwordHash: true },
    });

    if (!user) return unauthorized("Identifiants invalides");

    // TODO: comparer le hash (bcrypt.compare)
    if (user.passwordHash !== password) return unauthorized("Identifiants invalides");

    // TODO: générer un JWT signé
    const token = `demo-token-${user.id}`;

    return ok({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch {
    return serverError();
  }
}
