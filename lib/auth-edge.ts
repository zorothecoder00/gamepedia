// ============================================================
// GAMEPEDIA TG — Fonctions JWT compatibles Edge runtime
//
// Séparées de lib/auth.ts pour que middleware.ts (qui tourne sur
// l'Edge) n'embarque pas bcryptjs ni Prisma (Node-only).
// ============================================================

import { SignJWT, jwtVerify } from "jose";

export const JWT_ISSUER = "gamepedia-tg";
export const JWT_EXPIRATION = "7d";
export const AUTH_COOKIE = "gp_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours, aligné sur JWT_EXPIRATION

/** Clé de signature dérivée de JWT_SECRET (échoue tôt si absente). */
export function getSecretKey(): Uint8Array {
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

/** Vérifie un JWT et retourne son contenu utile, ou null si invalide/expiré. */
export async function verifyAuthToken(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
    });
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
