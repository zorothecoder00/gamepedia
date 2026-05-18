import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("Fichier requis");
    if (!file.type.startsWith("image/")) return badRequest("Le fichier doit être une image");
    if (file.size > 5 * 1024 * 1024) return badRequest("Taille maximale : 5 Mo");

    const url = `/uploads/banners/${Date.now()}-${file.name}`;
    return ok({ url });
  } catch {
    return serverError();
  }
}
