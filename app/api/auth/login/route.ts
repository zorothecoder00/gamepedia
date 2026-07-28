import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { unauthorized, forbidden, tooManyRequests, handleApiError } from "@/lib/api";
import { signToken, verifyPassword } from "@/lib/auth";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "@/lib/auth-edge";
import { parseBody, loginSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`login:${getClientIp(request)}`, 5, 60_000)) {
      return tooManyRequests();
    }

    const { email, password } = await parseBody(request, loginSchema);

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, role: true, passwordHash: true, isActive: true },
    });

    if (!user) return unauthorized("Identifiants invalides");

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return unauthorized("Identifiants invalides");

    // Vérifié après le mot de passe (pas avant) pour ne pas laisser deviner
    // qu'un compte existe/est suspendu à partir d'un mauvais mot de passe.
    if (!user.isActive) return forbidden("Ce compte a été suspendu ou désactivé.");

    const token = await signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({
      data: { user: { id: user.id, email: user.email, username: user.username, role: user.role } },
    });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
  } catch (e) {
    return handleApiError(e);
  }
}
