import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json() as { token: string; password: string };
    if (!token || !password) return badRequest("token et password requis");

    // TODO: vérifier le token de reset, hasher le nouveau mot de passe, mettre à jour
    return ok({ message: "Mot de passe réinitialisé avec succès." });
  } catch {
    return serverError();
  }
}
