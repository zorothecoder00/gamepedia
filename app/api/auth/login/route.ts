import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api";
import { signToken, verifyPassword, hashPassword } from "@/lib/auth";

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

    const { valid, upgraded } = await verifyPassword(password, user.passwordHash);
    if (!valid) return unauthorized("Identifiants invalides");

    // Migration douce : ré-écrit un vrai hash bcrypt si l'ancien était en clair.
    if (upgraded) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(password) },
      });
    }

    const token = await signToken({ id: user.id, role: user.role });

    return ok({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch {
    return serverError();
  }
}
