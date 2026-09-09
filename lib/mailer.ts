// ============================================================
// GAMEPEDIA TG — Envoi d'emails transactionnels (Resend)
//
// Point d'intégration unique : toute future logique d'envoi
// (reset de mot de passe, etc.) doit passer par ce module plutôt
// que d'instancier son propre client Resend.
// ============================================================

import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY manquant dans l'environnement");
    }
    client = new Resend(apiKey);
  }
  return client;
}

const FROM = process.env.EMAIL_FROM || "GamePedia TG <no-reply@gamepedia.tg>";

/** Envoie l'email de vérification d'adresse avec le lien de confirmation. */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: FROM,
    to,
    subject: "Vérifiez votre adresse email — GamePedia TG",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #00c853;">GamePedia TG</h2>
        <p>Merci de votre inscription ! Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #00c853; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Vérifier mon adresse email
          </a>
        </p>
        <p style="color: #888; font-size: 0.85rem;">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Échec de l'envoi de l'email de vérification : ${error.message}`);
  }
}

/** Envoie l'email de réinitialisation de mot de passe avec le lien de confirmation. */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: FROM,
    to,
    subject: "Réinitialisation de votre mot de passe — GamePedia TG",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #00c853;">GamePedia TG</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau :</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #00c853; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color: #888; font-size: 0.85rem;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Échec de l'envoi de l'email de réinitialisation : ${error.message}`);
  }
}
