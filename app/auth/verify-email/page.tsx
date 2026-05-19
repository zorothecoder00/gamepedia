"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@/hooks/useMutation";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const { mutate, loading } = useMutation("/api/auth/email/resend");

  const handleResend = async () => {
    await mutate();
    setResent(true);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[420px] text-center">
        <div className="text-[3.5rem] mb-4">✉️</div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">Vérifiez votre email</h1>
        <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-6">
          Un email de vérification a été envoyé à votre adresse. Cliquez sur le lien dans l&apos;email pour activer votre compte.
        </p>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <div className="text-sm text-[var(--text-muted)] mb-4">
            {resent ? "Email renvoyé !" : "Vous n'avez pas reçu l'email ?"}
          </div>
          {!resent && (
            <button
              disabled={loading}
              onClick={handleResend}
              className="px-6 py-2.5 rounded-lg border border-[var(--accent-green)] bg-transparent text-[var(--accent-green)] font-semibold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[rgba(0,230,118,0.08)] transition-colors"
            >
              {loading ? "Envoi..." : "Renvoyer l'email"}
            </button>
          )}
        </div>

        <Link href="/auth/login" className="text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text-secondary)] transition-colors">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
