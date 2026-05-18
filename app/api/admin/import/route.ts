import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
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
