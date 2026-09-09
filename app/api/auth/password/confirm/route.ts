import { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { ok, badRequest, tooManyRequests, handleApiError } from "@/lib/api";
import { parseBody, passwordConfirmSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(`password-confirm:${getClientIp(request)}`, 5, 60_000)) {
      return tooManyRequests();
    }

    const { token, password } = await parseBody(request, passwordConfirmSchema);

    const result = await consumePasswordResetToken(token);
    if (!result.ok || !result.userId) {
      return badRequest("Lien invalide ou expiré.");
    }

    const passwordHash = await hashPassword(password);
    await db.user.update({
      where: { id: result.userId },
      data: { passwordHash },
    });

    return ok({ message: "Mot de passe réinitialisé avec succès." });
  } catch (e) {
    return handleApiError(e);
  }
}
