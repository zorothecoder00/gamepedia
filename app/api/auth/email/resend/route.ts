import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, tooManyRequests, handleApiError } from "@/lib/api";
import { parseBody, emailResendSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { issueEmailVerificationToken } from "@/lib/email-verification";
import { sendVerificationEmail } from "@/lib/mailer";

// Message générique constant, que le compte existe ou non, qu'il soit déjà
// vérifié ou non : évite de laisser deviner si un email est enregistré.
const GENERIC_MESSAGE = "Si ce compte existe et n'est pas encore vérifié, un email a été envoyé.";

// POST /api/auth/email/resend — renvoyer l'email de vérification
export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`email-resend:${getClientIp(request)}`, 5, 60_000)) {
      return tooManyRequests();
    }

    const { email } = await parseBody(request, emailResendSchema);

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });

    if (user && !user.emailVerifiedAt) {
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
    }

    return ok({ message: GENERIC_MESSAGE });
  } catch (e) {
    return handleApiError(e);
  }
}
