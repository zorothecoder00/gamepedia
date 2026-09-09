// ============================================================
// GAMEPEDIA TG — Réinitialisation de mot de passe par token
//
// Le token brut n'est jamais stocké : seul son hash (sha256) est
// en base, comparable à un hash de mot de passe pour un secret à
// usage unique. Il est envoyé une seule fois, dans le lien de
// l'email, et consommé (supprimé) dès la première utilisation.
// TTL volontairement plus court que la vérification d'email (24h)
// vu la sensibilité de l'opération.
// ============================================================

import crypto from "node:crypto";
import { db } from "./prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Invalide les tokens de reset existants pour ce user et en émet un
 * nouveau. Retourne le token brut (à insérer dans le lien de l'email,
 * jamais stocké tel quel).
 */
export async function issuePasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");

  await db.passwordResetToken.deleteMany({ where: { userId } });
  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export interface ConsumePasswordResetResult {
  ok: boolean;
  userId?: string;
  reason?: "invalid" | "expired";
}

/**
 * Consomme un token de reset (usage unique, supprimé qu'il soit valide
 * ou expiré). Ne met pas à jour le mot de passe lui-même : ça reste la
 * responsabilité de l'appelant, qui a aussi besoin du nouveau mot de passe.
 */
export async function consumePasswordResetToken(
  rawToken: string,
): Promise<ConsumePasswordResetResult> {
  const tokenHash = hashToken(rawToken);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record) return { ok: false, reason: "invalid" };

  await db.passwordResetToken.delete({ where: { id: record.id } });

  if (record.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, userId: record.userId };
}
