// ============================================================
// GAMEPEDIA TG — Vérification d'adresse email par token
//
// Le token brut n'est jamais stocké : seul son hash (sha256) est
// en base, comparable à un hash de mot de passe pour un secret à
// usage unique. Il est envoyé une seule fois, dans le lien de
// l'email, et consommé (supprimé) dès la première vérification.
// ============================================================

import crypto from "node:crypto";
import { db } from "./prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Invalide les tokens de vérification existants pour ce user et en
 * émet un nouveau. Retourne le token brut (à insérer dans le lien
 * de l'email, jamais stocké tel quel).
 */
export async function issueEmailVerificationToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");

  await db.emailVerificationToken.deleteMany({ where: { userId } });
  await db.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export interface VerifyEmailResult {
  ok: boolean;
  reason?: "invalid" | "expired";
}

/**
 * Consomme un token de vérification (usage unique, supprimé qu'il soit
 * valide ou expiré). Marque l'email de l'utilisateur comme vérifié si
 * le token est valide et dans les temps.
 */
export async function consumeEmailVerificationToken(rawToken: string): Promise<VerifyEmailResult> {
  const tokenHash = hashToken(rawToken);
  const record = await db.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!record) return { ok: false, reason: "invalid" };

  await db.emailVerificationToken.delete({ where: { id: record.id } });

  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  await db.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return { ok: true };
}
