import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string };
    if (!email) return badRequest("email requis");

    // TODO: générer un token de reset et envoyer un email
    return ok({ message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
  } catch {
    return serverError();
  }
}
