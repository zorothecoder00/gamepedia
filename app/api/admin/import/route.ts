import { NextRequest } from "next/server";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/api";
import { getAuthUser, isStaff } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthUser(request);
    if (!actor) return unauthorized();
    if (!isStaff(actor.role)) return forbidden("Réservé à l'administration.");

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data") && !contentType.includes("application/json")) {
      return badRequest("Format attendu : multipart/form-data ou application/json");
    }

    // TODO: parser le CSV/JSON, valider les données, insérer en bulk via db.$transaction
    return ok({ message: "Import reçu. Traitement en cours.", imported: 0, errors: [] });
  } catch {
    return serverError();
  }
}
