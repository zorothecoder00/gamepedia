import { ok } from "@/lib/api";

export async function POST() {
  // TODO: invalider le token JWT côté serveur (blacklist ou session store)
  return ok({ message: "Déconnecté avec succès" });
}
