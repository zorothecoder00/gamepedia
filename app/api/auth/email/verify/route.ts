import { NextRequest } from "next/server";
import { ok, badRequest, handleApiError } from "@/lib/api";
import { parseBody, emailVerifySchema } from "@/lib/validation";
import { consumeEmailVerificationToken } from "@/lib/email-verification";

// POST /api/auth/email/verify — consomme le token reçu par email
export async function POST(request: NextRequest) {
  try {
    const { token } = await parseBody(request, emailVerifySchema);

    const result = await consumeEmailVerificationToken(token);
    if (!result.ok) {
      return badRequest(
        result.reason === "expired"
          ? "Ce lien de vérification a expiré. Demandez-en un nouveau."
          : "Ce lien de vérification est invalide.",
      );
    }

    return ok({ message: "Adresse email vérifiée avec succès." });
  } catch (e) {
    return handleApiError(e);
  }
}
