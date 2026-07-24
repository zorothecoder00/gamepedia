import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";
import { parseBody, passwordConfirmSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await parseBody(request, passwordConfirmSchema);

    // TODO: vérifier le token de reset, hasher le nouveau mot de passe, mettre à jour
    return ok({ message: "Mot de passe réinitialisé avec succès." });
  } catch (e) {
    return handleApiError(e);
  }
}
