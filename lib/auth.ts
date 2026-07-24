// ============================================================
// GAMEPEDIA TG — Helpers d'authentification (partagés)
//
// Auth par JWT signé (jose) + hash de mot de passe (bcryptjs).
// Le token est transmis via le cookie httpOnly `gp_session`
// (voir lib/auth-edge.ts), avec repli sur l'en-tête
// Authorization: Bearer pour les clients externes (tests, outils).
// Les fonctions JWT compatibles Edge sont dans lib/auth-edge.ts
// (utilisées par middleware.ts, qui ne peut pas embarquer bcryptjs).
// ============================================================

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "./prisma";
import { AUTH_COOKIE, signToken, verifyAuthToken } from "./auth-edge";

export { signToken };

/** Extrait l'userId depuis le cookie de session, avec repli sur l'en-tête Authorization. */
export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const cookieToken = request.cookies.get(AUTH_COOKIE)?.value;
  const auth = request.headers.get("authorization");
  const headerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const token = cookieToken ?? headerToken;
  if (!token) return null;

  const result = await verifyAuthToken(token);
  return result?.userId ?? null;
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

// ── Mots de passe ───────────────────────────────────────────

const BCRYPT_ROUNDS = 10;

/** Hash un mot de passe en clair. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Vérifie un mot de passe contre un hash bcrypt stocké. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  return bcrypt.compare(password, stored);
}
