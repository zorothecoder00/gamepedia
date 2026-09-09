import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, tooManyRequests, handleApiError } from "@/lib/api";
import { parseBody, passwordResetSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { issuePasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/mailer";

// Message générique constant, que le compte existe ou non : évite de
// laisser deviner si un email est enregistré (même principe que
// /api/auth/email/resend).
const GENERIC_MESSAGE = "Si cet email existe, un lien de réinitialisation a été envoyé.";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`password-reset:${getClientIp(request)}`, 5, 60_000)) {
      return tooManyRequests();
    }

    const { email } = await parseBody(request, passwordResetSchema);

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (user) {
      const token = await issuePasswordResetToken(user.id);
      const resetUrl = new URL(
        `/auth/reset-password/confirm?token=${token}`,
        request.nextUrl.origin,
      ).toString();
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (err) {
        console.error("Échec de l'envoi de l'email de réinitialisation :", err);
      }
    }

    return ok({ message: GENERIC_MESSAGE });
  } catch (e) {
    return handleApiError(e);
  }
}
