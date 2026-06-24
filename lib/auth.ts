// ============================================================
// GAMEPEDIA TG — Helpers d'authentification (partagés)
//
// Réplique la convention demo-token utilisée dans les routes
// existantes, en un seul endroit réutilisable.
// TODO: remplacer par une vraie vérification JWT.
// ============================================================

import { NextRequest } from "next/server";
import { db } from "./prisma";

/** Extrait l'userId depuis l'en-tête Authorization (token démo). */
export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return token.startsWith("demo-token-")
    ? token.replace("demo-token-", "")
    : null;
}

/** Charge l'utilisateur authentifié avec son joueur lié, ou null. */
export async function getAuthUser(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    include: { player: true },
  });
}

/** Vrai si le rôle est ADMIN ou MODERATOR. */
export function isStaff(role: string): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}
