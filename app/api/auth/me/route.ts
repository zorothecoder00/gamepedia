import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, unauthorized, serverError } from "@/lib/api";

// TODO: remplacer par une vraie vérification JWT
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  // demo: token format "demo-token-<userId>"
  return token.startsWith("demo-token-") ? token.replace("demo-token-", "") : null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, createdAt: true, player: true },
    });

    if (!user) return unauthorized();
    return ok(user);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const { username, email } = body as { username?: string; email?: string };

    const user = await db.user.update({
      where: { id: userId },
      data: { ...(username && { username }), ...(email && { email }) },
      select: { id: true, email: true, username: true, role: true },
    });

    return ok(user);
  } catch {
    return serverError();
  }
}
