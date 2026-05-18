import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("Fichier requis");
    if (!file.type.startsWith("image/")) return badRequest("Le fichier doit être une image");
    if (file.size > 2 * 1024 * 1024) return badRequest("Taille maximale : 2 Mo");

    // TODO: uploader vers S3 / Cloudinary / stockage local
    const url = `/uploads/avatars/${Date.now()}-${file.name}`;
    return ok({ url });
  } catch {
    return serverError();
  }
}
