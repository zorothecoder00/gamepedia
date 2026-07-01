// ============================================================
// GAMEPEDIA TG — Upload d'images via UploadThing (UTApi)
//
// Reçoit un fichier en multipart/form-data, le valide, puis le
// pousse vers UploadThing côté serveur. Nécessite UPLOADTHING_TOKEN
// dans l'environnement (lu automatiquement par UTApi).
// ============================================================

import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";
import { ok, badRequest, unauthorized, serverError } from "./api";
import { getAuthUser } from "./auth";

const utapi = new UTApi();

/**
 * Traite une requête d'upload d'image et renvoie `{ url }`.
 * Vérifie l'authentification, le type et la taille du fichier.
 */
export async function handleImageUpload(
  request: NextRequest,
  { maxSizeMB }: { maxSizeMB: number },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return badRequest("Fichier requis");
    if (!file.type.startsWith("image/")) return badRequest("Le fichier doit être une image");
    if (file.size > maxSizeMB * 1024 * 1024) return badRequest(`Taille maximale : ${maxSizeMB} Mo`);

    const uploaded = await utapi.uploadFiles(file);
    if (uploaded.error || !uploaded.data) {
      return serverError("Échec de l'upload");
    }

    return ok({ url: uploaded.data.ufsUrl });
  } catch {
    return serverError();
  }
}
