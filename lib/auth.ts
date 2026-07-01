// ============================================================
// GAMEPEDIA TG — Helpers d'authentification (partagés)
//
// Auth par JWT signé (jose) + hash de mot de passe (bcryptjs).
// Le token est transmis en Bearer dans l'en-tête Authorization
// et stocké côté client dans localStorage (`gp_token`).
// ============================================================

import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./prisma";

const JWT_ISSUER = "gamepedia-tg";
const JWT_EXPIRATION = "7d";

/** Clé de signature dérivée de JWT_SECRET (échoue tôt si absente). */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET manquant dans l'environnement");
  }
  return new TextEncoder().encode(secret);
}

/** Signe un JWT contenant l'identifiant utilisateur (sub) et son rôle. */
export async function signToken(user: { id: string; role: string }): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getSecretKey());
}

/** Extrait l'userId depuis un JWT valide de l'en-tête Authorization. */
export async function getUserIdFromRequest(
  request: NextRequest,
): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    // Token invalide, expiré ou signature incorrecte.
    return null;
  }
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

/** Vrai si la chaîne ressemble à un hash bcrypt ($2a$/$2b$/$2y$). */
export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$/.test(value);
}

/**
 * Vérifie un mot de passe contre un hash stocké.
 * Tolère les anciens enregistrements en clair (migration douce) :
 * `upgraded` vaut true quand l'appelant doit ré-écrire un vrai hash.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<{ valid: boolean; upgraded: boolean }> {
  if (isBcryptHash(stored)) {
    return { valid: await bcrypt.compare(password, stored), upgraded: false };
  }
  // Ancien format : mot de passe stocké en clair.
  return { valid: password === stored, upgraded: password === stored };
}
