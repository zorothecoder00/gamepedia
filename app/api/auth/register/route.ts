import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { created, badRequest, tooManyRequests, handleApiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { parseBody, registerSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { issueEmailVerificationToken } from "@/lib/email-verification";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`register:${getClientIp(request)}`, 5, 60_000)) {
      return tooManyRequests();
    }

    const { email, username, password } = await parseBody(request, registerSchema);

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return badRequest("Email ou pseudo déjà utilisé");
    }

    const user = await db.user.create({
      data: { email, username, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    const token = await issueEmailVerificationToken(user.id);
    const verifyUrl = new URL(
      `/auth/verify-email/confirm?token=${token}`,
      request.nextUrl.origin,
    ).toString();
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (err) {
      console.error("Échec de l'envoi de l'email de vérification :", err);
    }

    return created(user);
  } catch (e) {
    return handleApiError(e);
  }
}
