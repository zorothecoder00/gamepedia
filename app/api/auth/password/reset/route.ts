import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";
import { parseBody, passwordResetSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await parseBody(request, passwordResetSchema);

    // TODO: générer un token de reset et envoyer un email
    return ok({ message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
  } catch (e) {
    return handleApiError(e);
  }
}
